import React, { Component } from 'react';
import Play from "react-icons/lib/md/play-arrow";
import Stop from "react-icons/lib/md/stop";
import './Playbar.css';

class Playbar extends Component {
    constructor(props){
        super(props);
        const forceUpdate = this.forceUpdate.bind(this, null);
        if(this.props.end === null){
            this.props.editor.on('text-change', forceUpdate);
        }
        this.state = {
            playing: false
        }
        this.playAudio = this.playAudio.bind(this);
    }
    playAudio(){
        this.setState({playing: !this.state.playing});
    }
    render() {
        if(this.props.editor === null) return null;
        const {editor} = this.props;
        let index = Math.max(this.props.start, 0); 
        let lastTop = -10;
        let startIndexPosition = editor.getBounds(index, 0);
        let endIndexPosition = {...startIndexPosition};
        endIndexPosition.left += 10;
        if(editor.getSelection() !== null && editor.getSelection().index !== this.props.start){
            const endIndex = (this.props.end !== null ? this.props.end : editor.getSelection().index);
            endIndexPosition = editor.getBounds(endIndex, 0);
        }
        let lines = [];
        const textLength = editor.getLength();
        //if(this.props.end != null){
            lines.push()
        //}
        let firstLoop = true;
        while(true){
            const firstPosition = editor.getBounds(index, 0);
            while(startIndexPosition.top <= lastTop && index < textLength){
                index++;
                startIndexPosition = editor.getBounds(index, 0);
            }
            lastTop = startIndexPosition.top;
            lines.push(<div key={"indicator-"+index} className={"indicator" + (this.props.end === null ? " current" : "")} style={{left: firstPosition.left + firstPosition.width, width: (firstPosition.top === endIndexPosition.top) ? (endIndexPosition.left - firstPosition.left):(editor.getBounds(Math.max(index-1 ,0)).left - firstPosition.left), top: firstPosition.top}} >{(firstLoop) ? <button className="toggle-play" onClick={this.playAudio}>{this.state.playing ? <Stop /> : <Play />}</button> : null}</div>);
            firstLoop = false;
            if(firstPosition.top >= endIndexPosition.top) break;
            
        }
        this.lines = lines;
        return <div>{lines}</div>;
    }
}

export default Playbar;
