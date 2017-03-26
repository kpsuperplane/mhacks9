import React, { Component } from 'react';
import './Playbar.css';

class Playbar extends Component {
    constructor(props){
        super(props);
        const forceUpdate = this.forceUpdate.bind(this, null);
        if(this.props.end === null){
            this.props.editor.on('text-change', forceUpdate);
        }
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
        
        while(true){
            const firstPosition = editor.getBounds(index, 0);
            while(startIndexPosition.top <= lastTop && index < textLength){
                index++;
                startIndexPosition = editor.getBounds(index, 0);
            }
            lastTop = startIndexPosition.top;
            lines.push(<div key={"indicator-"+index} className={"indicator" + (this.props.end === null ? " current" : "")} style={{left: firstPosition.left + firstPosition.width, width: (firstPosition.top === endIndexPosition.top) ? (endIndexPosition.left - firstPosition.left):(editor.getBounds(Math.max(index-1 ,0)).left - firstPosition.left), top: firstPosition.top}} />);
            if(firstPosition.top >= endIndexPosition.top) break;
            
        }
        this.lines = lines;
        return <div>{lines}</div>;
    }
}

export default Playbar;
