import React, { Component } from 'react';
import ReactQuill from "react-quill";
import WaveformData from "waveform-data";
import Tooltip from "./Tooltip";
import Highlight from "./Highlight";
import * as firebase from "firebase";
import request from "superagent";
import './Editor.css';
import './Components.css';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.core.css';
import ChangeMode from './ChangeMode.js';

class Editor extends Component {
  constructor(){
    super();

    this.state = {
      selected: null,
      editor: null,
      curRecordIndex: 0,
      selectedPosition: {x:0, y:0},
      editMode: true
    }

    this.deltas = [];
    this.lastIndex = 0;
    this.onChange = this.onChange.bind(this);
    this.onChangeSelection = this.onChangeSelection.bind(this);
    this.database = firebase.database();
    const ctx = this;
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(stream) {
      ctx.recorder = new MediaRecorder(stream);
      ctx.recorder.ondataavailable = (e) => {
        request.post("https://mhacks.1lab.me/audio").field("file", e.data).end(function(err, res){
          console.log(res.body.webm_path);
          //console.log(this.refs.editor.getEditor().getContents());
        });
        new Audio(window.URL.createObjectURL(e.data)).play();
      }
    });
    this.timeout = null;

  }

  componentDidMount(){
    this.setState({editor: this.refs.editor.getEditor()});
    const editor = this.refs.editor.getEditor();
    this.database.ref("sessions/"+this.session).once('value').then(function (snapshot) {
      const data = snapshot.val() || {recordings: [], content: []};
      editor.setContents(data.content);
    });
  }

  stopTyping(content){
    if(this.timeout !== null) clearTimeout(this.timeout);
    this.database.ref("sessions/"+this.session+"/content").set(content.ops);
    if(this.recorder.state === "recording") this.recorder.stop();

    var theDeltas = [];
    for(var i = 0 ; i < this.deltas.length; i++){
      theDeltas.push(this.deltas[i]);
    }
    console.log(theDeltas);
    var array = [[0,5,"bold"]];
    for(var i = 0 ; i < theDeltas.length; i++){

    }



    const curIndex = this.refs.editor.getEditor().getSelection().index;
    this.deltas = [];
    this.lastIndex = curIndex;
    this.timeout = null;
    this.setState({curRecordIndex: curIndex});
  }

  onChange(content, delta, source, editor){
    if(source !== 'user') return;
    this.deltas.push(delta.ops);
    const {recorder, timeout} = this;
    const ctx = this;
    if(timeout === null) recorder.start();
    if(timeout !== null) clearTimeout(timeout);
    this.lastIndex = this.refs.editor.getEditor().getSelection().index;
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
    }else{
      this.setState({editMode: true});
    }
    //disables wolfram alpha
    console.log("disable the damn thing");
  }

/*
  var video_segments = [[0,6,"213"],[6,9,"264"]];

  var shift_indexes = function(start_index, amount){
    for(var i = start_index; i < video_segments.length; i++){
      video_segments[i][0] += amount;
      video_segments[i][1] += amount;
    }
  };


  var delete_range = function(first, last){
    var diff = last-first;
    for(var i = 0 ; i < video_segments.length; i++){
      var idx1 = video_segments[i][0];
      var idx2 = video_segments[i][1];
      if(first >= idx1 && last < idx2){
        if(first == idx1){
          if(diff == idx2 - idx1){
            //this catches the case where the entire deletion makes up the entire segment
          }else{
            video_segments[i][1] = idx2 - diff;
          }
        }else{
          video_segments[i][1] = idx2 - diff;
          //delete the current range and proceed to shift everything left by n characters
        }
        shift_indexes(i+1, diff);
      }
    }
    console.log(video_segments);
  };


  var add_range = function(first, last, video){
    if(first == video_segments.length){//we are appending the new video clip to the end of the document
      video_segments.push([first,last,video]);
    }else{
      for(var i = 0 ; i < video_segments.length; i++){
        var idx1 = video_segments[i][0];
        var idx2 = video_segments[i][1];
        if(first >= idx1 && last < idx2){
          //this shrinks the first range and then pushes two extra ranges to. (effectively a split)
          video_segments[i][1] = first;
          video_segments.push([first,last,video]);
          video_segments.push([last,idx2 + 1,video_segments[i][2]]);
        }
      }
    }
  };*/



  render() {
    return (
      <div className="container">
        <ReactQuill ref="editor" onChangeSelection={this.onChangeSelection} onChange={this.onChange} placeholder="Type notes here..."  theme="snow"/>
        <Highlight data={this.database} curIndex={this.state.curRecordIndex} editor={this.state.editor} />
        <Tooltip editMode={this.state.editMode} content={this.state.selected} position={this.state.selectedPosition}/>
        <ChangeMode changeState={this.changeState.bind(this)}/>
      </div>
    )
  }
}

export default Editor;
