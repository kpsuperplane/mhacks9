import React, { Component } from 'react';
import Editor from "./Editor";
import Login from "./Login";
import Logout from "./Logout";
import "./App.css";
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
            signedIn: firebase.auth().currentUser
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
    render() {
        
        let view = null;
        switch(this.state.signedIn){
            case false:
                view = <Login />;
                break;
            case true:
                view = <div><Editor /><Logout /></div>;
                break;
        }
        return <div className="app">{view}</div>;
    }
}

export default App;
