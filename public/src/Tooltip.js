import React, { Component } from 'react';
import './Tooltip.css';
import popup from "./popup.png";
import request from "superagent";

class App extends Component {

    wolframRequest(query, callback) {
      request.get("https://api.wolframalpha.com/v2/query")
        .query({
          input: "food definition",
          appid: "WPHVGV-P8YW5TGLQX",
          format: "image,plaintext",
          output: 'json'
        })
        .end(callback);
    }
  render() {

    const quillContents = document.getElementsByClassName('quill-contents');
    const offset = quillContents.length ? quillContents[0].getBoundingClientRect().top : 0;
    const containerLeft = Math.min(Math.max(this.props.position.x - 225, 10), window.outerWidth - 235);

    this.wolframRequest(this.props.content, (err, result) => {
      console.log(result.queryresult);
    });


    return (
      <div className={"tooltip-container " + (this.props.content === null || "visible")}
        style={{top: this.props.position.y + offset + 2,
                left: (this.props.position.x / window.outerWidth) * 100 + (window.outerWidth - this.props.width / 2) + "%", 
                transformOrigin: ((this.props.position.x - containerLeft - 10)/this.props.position.x)+"% 0%"}}>
          <div className="tooltip-arrow" style={{
            left: (this.props.position.x / window.outerWidth) * 100 + (window.outerWidth - this.props.width / 2) + "%"}}></div>
          <div className="tooltip">
            <h4 className="title">{this.props.content}</h4>
            <img alt="Wolfram Alpha Search Result" src={popup} />
            <script>


            </script>
        </div>
      </div>
    );
  }
}

export default App;