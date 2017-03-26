import React, { Component } from 'react';
import * as firebase from 'firebase';
import './Documents.css';
import './Components.css';

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
			<div className="docs">
				<h2> Select a Document</h2>
				{
					Object.keys(this.state.documentsList).map(function(key, index) {
						return <div key={key} onClick={() => load(key)} className="doc" ><span className="boop">Document {index + 1}</span></div>
					})
				}
				<a className="button" onClick={() => load("new")}>New</a>
			</div>
		)
	}

}
