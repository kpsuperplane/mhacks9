import React, { Component } from 'react';
import * as firebase from 'firebase';

export default class Documents extends Component {
	constructor(){
		super();
		this.state = {
			documentsList: []
		}
		const uid = firebase.auth().currentUser.uid;
		let ctx = this;
		firebase.database().ref('/users/' + uid).once('value').then(function(snapshot) {
			ctx.setState({ documentsList: snapshot.val() });
		});
	}

	render() {
		const {load} = this.props;
		return (
			<div>
				{
					Object.keys(this.state.documentsList).map(function(key, index) {
						return <p key={key} onClick={() => load(key)}>{key}</p>
					})
				}
				<p onClick={() => load("new")}>new</p>
			</div>
		)
	}

}
