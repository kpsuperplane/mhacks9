import React, { Component } from 'react';
import './Tooltip.css';
import popup from "./popup.png";

class App extends Component {
  render() {
    const quillContents = document.getElementsByClassName('quill-contents');
    const offset = quillContents.length ? quillContents[0].getBoundingClientRect().top : 0;
    const containerLeft = Math.min(Math.max(this.props.position.x - 225, 10), window.outerWidth - 235);
    return (
      <div className={"tooltip-container " + (this.props.content === null ? "" : "visible")}
        style={{top: this.props.position.y + offset + 2, 
                left: containerLeft,
                transformOrigin: ((this.props.position.x - containerLeft - 10)/this.props.position.x)+"% 0%"}}>
          <div className="tooltip-arrow" style={{
            left: this.props.position.x - containerLeft - 10}}></div>
          <div className="tooltip">
            <h4 className="title">{this.props.content}</h4>
            <img alt="Wolfram Alpha Search Result" src={popup} />
        </div>
      </div>
    );
  }
}

export default App;
