import React, { Component } from 'react'
import * as firebase from "firebase";
import "./Components.css";

export default class Logout extends Component {

	handleClick() {
		firebase.auth().signOut();
	}

	render () {
		return (
			<button onClick={() => this.handleClick()}>Logout</button>
		)
	}
}
