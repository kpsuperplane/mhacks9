import React, { Component } from 'react';
import Editor from "./Editor";
import Documents from "./Documents";
import Login from "./Login";
import Logout from "./Logout";
import "./App.css";
import "./Components.css";
import * as firebase from "firebase";

class App extends Component {
    constructor(props){
        super(props);
        firebase.initializeApp({
            apiKey: "AIzaSyBPXxoydRC52Y5Xz4fhPxYSo54_j4knBO4",
            authDomain: "mhacks9-bfe7d.firebaseapp.com",
            databaseURL: "https://mhacks9-bfe7d.firebaseio.com"
        });
        this.state = {
            signedIn: firebase.auth().currentUser,
	    session: null
        }

    }
    componentDidMount(){
        const ctx = this;
        firebase.auth().onAuthStateChanged(function(user) {
            if (user) {
                ctx.setState({signedIn: true});
            } else {
                ctx.setState({signedIn: false});
            }
        });
    }
    load(key) {
	this.setState({ session: key });
    }
    render() {
        let view = null;
        switch(this.state.signedIn){
            case false:
                view = <Login />;
                break;
            case true:
                view = this.state.session ? <Editor session={this.state.session} /> : <Documents load={this.load.bind(this)} />;
                break;
        }
        return <div className="app">{view}</div>;
    }
}

export default App;
