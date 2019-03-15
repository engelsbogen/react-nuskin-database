
import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Button, Modal
        } from 'react-bootstrap';


export class NuskinNavBar extends React.Component {

    constructor(props) {
        super(props)
        this.handleSelect = this.handleSelect.bind(this);
        this.close = this.close.bind(this);
        this.state = { view: {showConnectionDialog: false,
                              showCaptureDialog: false}}
    }
    
    
    handleSelect(selectedKey) {
        
        console.log(selectedKey);
    }
    
    close() {
    }
    
    render() {
        return (
            <div>
            <Navbar bg="light" collapseOnSelect >
                <Navbar.Brand>
                <a href="#home"><img
                  src="/Rosieskin_logo-2.png"
                  height="60"
                  className="d-inline-block align-top"
                  alt="RosieSKIN logo"
                />
                 </a>
                </Navbar.Brand>
                <Navbar.Toggle />
                <Navbar.Collapse>
                <Nav onSelect={this.handleSelect}>
                   <Nav.Link eventKey={1} href="#addorder" >
                     <span className="glyphicon glyphicon-folder-open" aria-hidden="true"></span>
                     &nbsp; Add Order
                   </Nav.Link>
                     <Nav.Link eventKey={2} href="#reports" >
                     <span className="glyphicon glyphicon-folder-open" aria-hidden="true"></span>
                     &nbsp; Reports
                   </Nav.Link>
                </Nav>
                </Navbar.Collapse>
            </Navbar>
            </div>         
                     
      );
    }
}

/*
*/


export default NuskinNavBar;
      