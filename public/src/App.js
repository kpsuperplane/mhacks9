import React, { Component } from 'react';
import ReactQuill from "react-quill";
import WaveformData from "waveform-data";
import Tooltip from "./Tooltip";
import Highlight from "./Highlight";
import * as firebase from "firebase";
import request from "superagent";
import './App.css';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.core.css';

class App extends Component {
  constructor(){
    super();

    this.state = {
      selected: null,
      editor: null,
      curRecordIndex: 0,
      selectedPosition: {x:0, y:0}
    }

    this.deltas = [];
    this.lastIndex = 0;
    this.onChange = this.onChange.bind(this);
    this.onChangeSelection = this.onChangeSelection.bind(this);

    var config = {
      apiKey: "c5d2c8f090c4701209470a51edb17208b4b40fec",
      authDomain: "mhacks9-162605.firebaseapp.com",
      databaseURL: "https://mhacks9-162605.firebaseio.com"
    };
    firebase.initializeApp(config);

    const ctx = this;
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(stream) {
      ctx.recorder = new MediaRecorder(stream);
      ctx.recorder.ondataavailable = (e) => {
        request.post("https://mhacks.1lab.me/audio").field("file", e.data).end();
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

  render() {
    return (
      <div className="app">
        <ReactQuill ref="editor" onChangeSelection={this.onChangeSelection} onChange={this.onChange} placeholder="Type notes here..."  theme="snow"/>
        <Highlight data={this.database} curIndex={this.state.curRecordIndex} editor={this.state.editor} />
        <Tooltip content={this.state.selected} position={this.state.selectedPosition}/>

        </div>
    )
  }
}

export default App;
