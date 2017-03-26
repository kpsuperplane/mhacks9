import React, { Component } from 'react';
import "./Navbar.css";
import "./Components.css";
import Logout from "./Logout";


export default class Navbar extends Component {

	render () {
		return (
			<div className="navbar">
                <div className="container">
                    <div className="inner-container">
                        <h4>MHacks 9</h4>
                        <div className="navbar-right">
                            {this.props.children}
                            <Logout />
                        </div>
                        <div className="navbar-clear" />
                    </div>
                </div>
            </div>
		)
	}
}
