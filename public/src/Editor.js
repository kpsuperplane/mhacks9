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
      selectedPosition: {x:0, y:0},
      editMode: true,
      theDeltas: [],
      recordingLength: 0,
      recording: false,
      lastSize: window.innerWidth
    }
    this.video_segments = [[0,6,"213"],[6,9,"264"]];

    this.add_range = this.add_range.bind(this);
    this.shift_indexes = this.shift_indexes.bind(this);

    this.deltas = [];
    this.lastIndex = 0;
    this.onChange = this.onChange.bind(this);
    this.onChangeSelection = this.onChangeSelection.bind(this);
    this.database = firebase.database();
    this.uid = firebase.auth().currentUser.uid;
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
      })
      ctx.recorder.ondataavailable = (e) => {
        request.post("https://mhacks.1lab.me/audio").field("file", e.data).end(function(err, res){
          //const editor = ctx.refs.editor.getEditor();
          //var hi = editor.getContents();
          /*var changes = ctx.state.theDeltas;
          for(var i = 0 ; i < changes.length; i ++){
          ctx.add_range(changes[i][0], changes[i][1], [res.body.webm_path]);
          //console.log(changes[i]);
        }*/
        ctx.currentAudio = res.body.webm_path;
        //console.log(ctx.audio_segments);
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
  if(this.recorder.state === "recording") this.recorder.stop();
  this.recorder.start();
  for(var i = 0 ; i < this.deltas.length; i++){
    this.state.theDeltas.push(this.deltas[i]);
  }
  const curIndex = this.refs.editor.getEditor().getSelection().index;
  if(this.deltas.length > 0){
    const range = [this.state.curRecordIndex, curIndex];
    const ctx = this;
    this.database.ref("users/"+this.uid+"/"+this.session+"/recordings").once("value",function(snapshot) {
      var recordings = snapshot.val();
      ctx.audio_segments = [[0,6,"asd"],[6,10,"asd"]];
      for (var recording in recordings){
        var curRec = recordings[recording];
        ctx.audio_segments.push([curRec.begin,curRec.end,curRec.file]);
      }
      console.log(ctx.audio_segments);
      ctx.add_range(ctx.lastIndex, curIndex, ctx.currentAudio);
      console.log(ctx.audio_segments);
      for(var curSeg of ctx.audio_segments){
        var fireBaseRef = this.database.ref("users/"+this.uid+"/"+this.session+"/recordings").push();
        fireBaseRef.set({
          begin: curSeg[0],
          end: curSeg[1],
          file: curSeg[2]
        })
      }
    });
  });
}
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
  if(timeout === null){
    if(this.recorder.state === "recording") this.recorder.stop();
    recorder.start();
    const curIndex = editor.getSelection().index - 1;
    if(curIndex != this.lastIndex){
      this.stopTyping(editor.getContents());
      this.lastIndex = curIndex;
      this.setState({curRecordIndex: curIndex});
    }
  }
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
    this.editor.enable(false);
    console.log(false);
  }else{
    this.setState({editMode: true});
    this.editor.enable(true);
    console.log(true);
  }
}

shift_indexes(start_index, amount){
  for(var i = start_index; i < this.audio_segments.length; i++){
    this.audio_segments[i][0] += amount;
    this.audio_segments[i][1] += amount;
  }
}

delete_range(first, last){
  var diff = last-first;
  first = 0;
  last = 5;
  for(var i = 0 ; i < this.audio_segments.length; i++){
    var idx1 = this.audio_segments[i][0];
    var idx2 = this.audio_segments[i][1];
    if(first >= idx1 && last < idx2){
      if(first === idx1){
        if(diff === idx2 - idx1){
          //this catches the case where the entire deletion makes up the entire segment
        }else{
          this.audio_segments[i][1] = idx2 - diff;
        }
      }else{
        this.audio_segments[i][1] = idx2 - diff;
        //delete the current range and proceed to shift everything left by n characters
      }
      this.shift_indexes(i+1, diff);
    }
  }
  console.log(this.audio_segments);
}

add_range(first, last, video){
  console.log(first);
  console.log(last);
  if(last > first){
    var charCount = this.refs.editor.getEditor().getLength() -1;
    if(first == charCount){//we are appending the new video clip to the end of the document
      this.audio_segments.push([first,last,video]);
      console.log("added");
    }else{
      console.log("added2");
      for(var i = 0 ; i < this.audio_segments.length; i++){
        var idx1 = this.audio_segments[i][0];
        var idx2 = this.audio_segments[i][1];
        if(first >= idx1 && last < idx2){
          //this shrinks the first range and then pushes two extra ranges to. (effectively a split)
          this.audio_segments[i][1] = first;
          this.audio_segments.push([first,last,video]);
          this.audio_segments.push([last,idx2 + 1,this.audio_segments[i][2]]);
        }
      }
    }
    this.shift_indexes(i+1, last-first);
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
    <div>
    <Navbar>
    <ChangeMode changeState={this.changeState.bind(this)}/>
    <button className={"recording-indicator" + (this.state.recording ? " active" : "")}>{this.state.recordingLength % 2 == 0 ? <Record />:<RecordFill />} <span>{Math.floor(this.state.recordingLength/60)}:{(this.state.recordingLength%60 < 10 ? "0": "") + this.state.recordingLength%60}</span></button>
    <button onClick={() => this.props.exit()}>My Documents</button>
    </Navbar>
    <ReactQuill ref="editor" onChangeSelection={this.onChangeSelection} onChange={this.onChange} placeholder="Type notes here..." theme="snow" />
    <Highlight data={this.database} curIndex={this.state.curRecordIndex} editor={this.state.editor} />
    {this.state.editMode ? '' : <Tooltip content={this.state.selected} position={this.state.selectedPosition}/>}
    <ChangeMode changeState={this.changeState.bind(this)} editor={this.state.editor}/>

    <form onSubmit={this.handleSubmit}>
    <label>
    ID:
    <input type="text" value={this.state.value} onChange={this.handleChange} />
    </label>
    <input type="submit" value="Submit" />
    </form>
    </div>    );
  }
}

export default Editor;
