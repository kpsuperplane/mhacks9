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
    if(this.state.btn === "Study"){
      this.setState({btn: "Edit"})
    }else{
      this.setState({btn: "Study"})
    }
    this.props.changeState();
  }



  render () {
    return (
      <button type="submit" onClick={() => this.handleClick()} className="btn btn-primary">{this.state.btn}</button>
    )
  }
}
