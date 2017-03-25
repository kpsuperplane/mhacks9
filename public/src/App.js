import React, { Component } from 'react';
import ReactQuill from "react-quill";
import * as htmlparser from "htmlparser";
import WaveformData from "waveform-data";
import * as firebase from "firebase";
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

    var config = {
      apiKey: "c5d2c8f090c4701209470a51edb17208b4b40fec",
      authDomain: "mhacks9-162605.firebaseapp.com",
      databaseURL: "https://mhacks9-162605.firebaseio.com"
    };
    firebase.initializeApp(config);
    this.database = firebase.database();
    this.session = localStorage.getItem("session") || (localStorage.setItem("session", (new Date()).getTime()), localStorage.getItem("session"));
    this.database.ref("sessions/"+this.session).on('value', function (snapshot) {
      snapshot = snapshot || [{ref: null, content: "<p>Start typing here...</p>"}];
    });

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

  parseContent(content){
    const splitter = document.createElement('div');
    const text = splitter.innerHTML = content;
    const parts = splitter.children;
    console.log(parts);
  }
  
  onChange(content, delta, source, editor){
    const {recorder, timeout, parseContent} = this;
    const ctx = this;
    if(timeout === null) recorder.start();
    if(timeout !== null) clearTimeout(timeout);
    this.timeout = setTimeout(() => {
      recorder.stop();
      parseContent(content);
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
