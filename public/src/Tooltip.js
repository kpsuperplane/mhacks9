import React, { Component } from 'react';
import './Tooltip.css';
import request from "superagent";

class App extends Component {

    wolframRequest(query, callback) {
      request.get("https://mhacks.1lab.me/wolfram")
        .query({
          query: query + " definition"
        })
        .end(callback);
    }

    getData(data){
      const ctx = this; 
      this.wolframRequest(data, (err, result) => {
        this.setState({data: JSON.parse(result.text).queryresult.pods[1].subpods[0].img.src}); 
        console.log(JSON.parse(result.text).queryresult.pods[1].subpods[0].img.src);
        return data; 
      });
    }
  render() {
    const quillContents = document.getElementsByClassName('quill-contents');
    const offset = quillContents.length ? quillContents[0].getBoundingClientRect().top : 0;
    const containerLeft = Math.min(Math.max(this.props.position.x - 225, 10), window.outerWidth - 235);
    return (
      <div className={"tooltip-container " + (this.props.content === null || "visible")}
        style={{top: this.props.position.y + offset + 2,
                left: (this.props.position.x / window.outerWidth) * 200 + (window.outerWidth - this.props.width / 2) + "%", 
                transformOrigin: ((this.props.position.x - containerLeft - 10)/this.props.position.x)+"% 0%"}}>
          <div className="tooltip-arrow" style={{
            left: (this.props.position.x / window.outerWidth) * 200 + (window.outerWidth - this.props.width / 2) + 5 + "%"}}></div>
          <div className="tooltip">
            <h4 className="title">{this.props.content}</h4>
            <img alt="Wolfram Alpha Search Result" src={this.getData(this.props.content)} />
        </div>
      </div>
    );
  }
}

export default App;
