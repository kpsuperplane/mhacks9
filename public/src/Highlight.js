import React, { Component } from 'react';
import './Highlight.css';
import Playbar from "./Playbar";

class Highlight extends Component {
  render() {
      if(this.props.editor == null) return null;
      const {editor} = this.props;
      const offset = document.getElementsByClassName('quill-contents')[0].getBoundingClientRect();
      return (<div className="highlight-container" style={{left: offset.left, top: offset.top}}>
        <Playbar start={this.props.curIndex} end={null} editor={editor} />
      </div>);
  }
}

export default Highlight;
