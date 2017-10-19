import React, { Component } from 'react';
import ReactQuill from "react-quill";
import WaveformData from "waveform-data";
import Tooltip from "./Tooltip";
import Highlight from "./Highlight";
import * as firebase from "firebase";
import Navbar from "./Navbar";
import request from "superagent";
import './Editor.css';
import './App.css';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.core.css';
import ChangeMode from './ChangeMode.js';
import Record from "react-icons/lib/md/adjust";
import RecordFill from "react-icons/lib/md/lens";

import ReactAudioPlayer from 'react-audio-player';

class Editor extends Component {
  constructor(props){
    super(props);
    this.state = {
      selected: null,
      editor: null,
      curRecordIndex: 0,
      curRecordTimestamp: -1,
      selectedPosition: {x:0, y:0},
      editMode: true,
      theDeltas: [],
      recordingLength: 0,
      recording: false,
      lastSize: window.innerWidth
    }

    this.deltas = [];
    this.lastIndex = 0;
    this.onChange = this.onChange.bind(this);
    this.onChangeSelection = this.onChangeSelection.bind(this);
    this.database = firebase.database();
    this.uid = firebase.auth().currentUser.uid;
    this.startedRecording = -1; // I plan on using ths variable to tell the server when the recording started
    this.recordingTimer = null;
    if (this.props.session === "new") {
      this.session = new Date().getTime();
    } else {
      this.session = this.props.session;
    }
    const ctx = this;
    this.timeout = null;
  }
  componentWillMount(){
    //if(this.recorder.state === "recording") this.recorder.stop();
    const ctx = this;
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(stream) {
      ctx.recorder = new MediaRecorder(stream);
      ctx.recorder.addEventListener('start', () => {
        ctx.setState({recordingLength: 0, recording: true});
        ctx.recordingTimer = setInterval(() => ctx.setState({recordingLength: ctx.state.recordingLength + 1}), 1000);
      });
      ctx.recorder.addEventListener('stop', () => {
        clearInterval(ctx.recordingTimer);
        ctx.setState({recordingLength: 0, recording: false});
      });
      ctx.recorder.ondataavailable = (e) => {
        console.log(e);
        request.post("http://localhost:5001/audio").field("file", e.data).end(function(err, res){
          ctx.currentAudio = res.body.webm_path;
          if(typeof ctx.saveAudio == "function"){
            ctx.saveAudio();
            ctx.saveAudio = null;
          }
        });
      }
      ctx.recorder.start();
    });
    this.timeout = null;
    // start recording (call the event listener)
  }

  componentDidMount(){
    //console.log(this);
    var temp = this.refs.editor.getEditor();
    this.setState({editor: temp});
    //this.state.editor = this.refs.editor.getEditor();
    const editor = this.refs.editor.getEditor();
    const ctx = this;
    this.database.ref("users/"+this.uid+"/"+this.session).once('value').then(function (snapshot) {
      const data = snapshot.val() || {recordings: [], content: []};
      editor.setContents(data.content);
      ctx.onResize();
    });
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount(){
    window.removeEventListener('resize', this.onResize);
  }

  stopTyping(content){
    if(this.timeout !== null) clearTimeout(this.timeout);
    this.database.ref("users/"+this.uid+"/"+this.session+"/content").set(content.ops);
    const curIndex = this.state.editor.getSelection().index;
    var timeStamp = Math.floor(Date.now() / 1000);
    if(this.deltas.length > 0){
      //this section runs when you aren't typing
      const ctx = this;
      if(this.state.curRecordIndex.length > 3){
        this.range = [this.state.curRecordIndex-2, curIndex];

        this.database.ref("users/"+this.uid+"/"+this.session+"/timestamps").push({

          //startTime: this.state.curRecordTimestamp,
          //endTime: timeStamp,
          begin: ctx.range[0],
          end: ctx.range[1],

        });
      }
    }
    for(var i = 0 ; i < this.deltas.length; i++){
      this.state.theDeltas.push(this.deltas[i]);
    }
    this.deltas = [];
    this.lastIndex = curIndex;
    this.timeout = null;
    /*this.setState({curRecordIndex: curIndex,
      curRecordTimestamp: timeStamp});*/
    }

    startTyping(){
      
    }

    onChange(content, delta, source, editor){
      //this.setstate({})
      if(source !== 'user') return;
      this.deltas.push(delta.ops);
      const {recorder, timeout} = this;
      const ctx = this;
      if(timeout === null){
        //this section gets run once when you start typing
        var timeStamp = Math.floor(Date.now() / 1000);
        /*this.setState({curRecordIndex: curIndex,
          curRecordTimestamp: timeStamp});*/

        //if(this.recorder.state === "recording") this.recorder.stop();
        //recorder.start();
        const curIndex = editor.getSelection().index - 1;
        if(curIndex != this.lastIndex){
          //the code in here runs once. The first time you start typing
          this.stopTyping(editor.getContents());
          this.lastIndex = curIndex;
          this.setState({curRecordIndex: curIndex,
           curRecordTimestamp: timeStamp});
          }
        }
        if(timeout !== null) clearTimeout(timeout);
        this.lastIndex = this.state.editor.getSelection().index;
        this.timeout = setTimeout(ctx.stopTyping.bind(ctx, editor.getContents()), 1000);
      }

      onChangeSelection(range, source, editor){
        if(range && Math.abs(this.lastIndex - range.index) > 10) this.stopTyping(editor.getContents());
        if(range && range.length > 1){
          const content = editor.getText(range.index, range.length);
          const location = editor.getBounds(range.index, range.length);
          this.setState({selected: content, selectedPosition: {y: location.top + location.height, x: location.left + location.width/2}});
        }else{
          if(this.state.selected != null) this.setState({selected: null});
        }
      }

      changeState(){
        if(this.state.editMode){
          this.setState({editMode: false});
          this.state.editor.enable(false);
          if(this.recorder.state === "recording") this.recorder.stop();
          console.log(false);
        }else{
          var timeStamp = Math.floor(Date.now() / 1000);
          this.startedRecording = timeStamp;
          this.recorder.start();
          this.setState({editMode: true});
          this.state.editor.enable(true);
          console.log(true);
        }
      }
      onResize(){
        const toolbarContainer = document.getElementsByClassName('ql-toolbar')[0];
        const editorContainer = document.getElementsByClassName('ql-editor')[0];
        toolbarContainer.style.padding = "0 " + Math.max(10, window.innerWidth/2 - 400) + "px 10px";
        editorContainer.style.padding = "15px " + Math.max(10, window.innerWidth/2 - 390) + "px";
        editorContainer.style.height = (window.innerHeight - editorContainer.getBoundingClientRect().top)+"px";
        let selectedPosition = this.state.selectedPosition;
        selectedPosition.x += (window.innerWidth - this.state.lastSize) / 2;
        this.setState({ lastSize: window.innerWidth, selectedPosition: selectedPosition });
      }
      render() {
        return (
          <div>
          <Navbar>
          <ChangeMode changeState={this.changeState.bind(this)}/>
          <button className={"recording-indicator" + (this.state.recording ? " active" : "")}>{this.state.recordingLength % 2 == 0 ? <Record />:<RecordFill />} <span>{Math.floor(this.state.recordingLength/60)}:{(this.state.recordingLength%60 < 10 ? "0": "") + this.state.recordingLength%60}</span></button>
          <button onClick={() => this.props.exit()}>My Documents</button>
          </Navbar>
          <ReactQuill ref="editor" onChangeSelection={this.onChangeSelection} onChange={this.onChange} placeholder="Type notes here..." theme="snow" />
          <Highlight uid={this.uid} session={this.session} data={this.database} curIndex={this.state.curRecordIndex} editor={this.state.editor} />
          {this.state.editMode ? '' : <Tooltip content={this.state.selected} position={this.state.selectedPosition}/>}

          </div>    );
        }
      }

      export default Editor;
