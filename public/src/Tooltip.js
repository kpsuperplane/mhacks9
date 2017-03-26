import React, { Component } from 'react';
import './Tooltip.css';
import request from "superagent";

class Tooltip extends Component {
    constructor(props){
	super(props);
	this.state = {
		imageurl: null,
		lastContent: null
	};
    }
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
       ctx.setState({lastContent: data, imageurl: JSON.parse(result.text).queryresult.pods[1].subpods[0].img.src});
      });
    }
  componentDidMount(){
	this.componentDidUpdate();
  }
  componentDidUpdate(){
	if(this.props.content && this.state.lastContent !== this.props.content){
		this.setState({lastContent: this.props.content, imageurl: null});
		this.getData(this.props.content);
	}
  }
  render() {
    const quillContents = document.getElementsByClassName('quill-contents');
    const offset = quillContents.length ? quillContents[0].getBoundingClientRect().top : 0;
    const containerLeft = Math.min(Math.max(this.props.position.x - 225, 10), window.outerWidth - 235);
    console.log(window.innerWidth);
    return (
      <div className={"tooltip-container " + (this.props.content === null || "visible")}
        style={{top: this.props.position.y + offset + 2,
                left: this.props.position.x + "px"}}>
          <div className="tooltip-arrow" style={{
            left: (this.props.position.x / window.outerWidth) * 100 + "%"}}></div>
          <div className="tooltip">
            <h4 className="title">{this.props.content}</h4>
	    {this.state.imageurl === undefined || this.state.imageurl === null ? "Loading..." : <img alt="Wolfram Alpha Search Result" src={this.state.imageurl} />}
        </div>
      </div>
    );
  }
}

export default Tooltip;
