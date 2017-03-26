import React, { Component } from 'react'
import * as firebase from "firebase";
import "./Components.css";

export default class Logout extends Component {

	handleClick() {
		firebase.auth().signOut();
	}

	render () {
		return (
			<button type="submit" onClick={() => this.handleClick()} className="button">Logout</button>
		)
	}
}
