import React, { Component } from 'react'
import * as firebase from "firebase";

export default class Login extends Component {

	handleClick() {
		var provider = new firebase.auth.GoogleAuthProvider();
		firebase.auth().signInWithPopup(provider).then(function(result) {
			var token = result.credential.accessToken;
			var user = result.user;
			console.log(user);
		}).catch(function(error) {
			console.log(error.code);
			console.log(error.message);
		});
	}

	render () {
		return (
			<button type="submit" onClick={() => this.handleClick()} className="btn btn-primary">Login</button>
		)
	}
}
