import React, { Component } from 'react';
import './Highlight.css';
import Playbar from "./Playbar";
import * as firebase from "firebase";

class Highlight extends Component {
    constructor(props){
        super(props);
        this.state = {
            recordings: []
        };
    }
    componentDidMount(){
        const ctx = this;
        firebase.database().ref("users/"+this.props.uid+"/"+this.props.session+"/recordings").on("value", function(snapshot) {
            let recordings = snapshot.val();
            let recs = [];
            Object.keys(recordings).map(key => {
                recs.push(recordings[key]);
                return null;
            });
            console.log(recs);
            ctx.setState({recordings: recs});
        });
    }
    render() {
        if(this.props.editor == null) return null;
        const {editor} = this.props;
        const offset = document.getElementsByClassName('quill-contents')[0].getBoundingClientRect();
        return (<div className="highlight-container" style={{left: offset.left, top: offset.top}}>
        {this.state.recordings.map((value) => <Playbar key={value.file} start={value.begin} end={value.end} audio={value.file} editor={editor} />)}
        <Playbar start={this.props.curIndex} end={null} editor={editor} />
        </div>);
    }
}

export default Highlight;
