import React, { Component } from 'react'

export default class ChangeMode extends Component {
  constructor() {
    super();
    this.state = {
      btn: "Edit"
    };
  }
  //this.context.state = "Study";
  handleClick() {
    console.log("derp");
    if(this.state.btn == "Study"){
      this.state.btn = "Edit";
    }else{
      this.state.btn = "Study";
    }

  }

  render () {
    return (
      <button type="submit" onClick={() => this.handleClick()} className="btn btn-primary">{this.state.btn}</button>
    )
  }
}
