import React, { Component } from 'react'
import * as firebase from "firebase";

export default class Login extends Component {

	handleClick() {
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).then(function(result) {
			var token = result.credential.accessToken;
			var user = result.user;
		}).catch(function(error) {
			console.error(error);
		});
	}

	render () {
		return (
			<button type="submit" onclick={() => this.handleClick()} className="btn btn-primary">Login</button>
		)
	}
}