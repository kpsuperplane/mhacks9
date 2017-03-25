import React, { Component } from 'react';
import ReactQuill from "react-quill";
import WaveformData from "waveform-data";
import request from "superagent";
import './App.css';
import 'react-quill/dist/quill.snow.css';
import 'react-quill/dist/quill.core.css';

class App extends Component {
  constructor(){
    super();
    this.state = {
      command: "start"
    };
    this.onChange = this.onChange.bind(this);
    const ctx = this;
    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(function(stream) {
      ctx.recorder = new MediaRecorder(stream);
      const audio = new Audio();
      ctx.recorder.ondataavailable = (e) => {
        request.post("https://mhacks.1lab.me/audio").field("file", e.data).end();
        new Audio(window.URL.createObjectURL(e.data)).play();
      }
    });
    this.timeout = null;
  }
  onChange(content, delta, source, editor){
    const {recorder, timeout} = this;
    const ctx = this;
    if(timeout === null) recorder.start();
    if(timeout !== null) clearTimeout(timeout);
    this.timeout = setTimeout(() => {
      recorder.stop();
      ctx.timeout = null;
    }, 1000);
  }
  render() {
    return (
      <div className="app">
        <ReactQuill onChange={this.onChange} theme="snow"/>
      </div>
    );
  }
}

export default App;
