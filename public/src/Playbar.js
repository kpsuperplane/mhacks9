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
        if(this.props.editor == null) return null;
        const {editor} = this.props;
        const startIndexPosition = editor.getBounds(this.props.start, 0);
        let endIndexPosition = {...startIndexPosition};
        endIndexPosition.left += 10;
        if(editor.getSelection() !== null && editor.getSelection().index !== this.props.start){
            const endIndex = (this.props.end !== null ? this.props.end : editor.getSelection().index);
            endIndexPosition = editor.getBounds(endIndex, 0);
        }
        return (<div className={"indicator" + (this.props.end == null ? " current" : "")} style={{left: startIndexPosition.left + startIndexPosition.width, width: endIndexPosition.left - startIndexPosition.left, top: startIndexPosition.top}} />);
    }
}

export default Playbar;
