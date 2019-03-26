
import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Form, Button, 
        ToggleButton, ToggleButtonGroup, Modal  } from 'react-bootstrap';
import {refreshMainView} from 'index';
import axios from "axios";

export class NuskinNavBar extends React.Component {

    constructor(props) {
        super(props)
        this.handleSelect = this.handleSelect.bind(this);
        this.close = this.close.bind(this);
        this.onSetYear = this.onSetYear.bind(this);
        this.setYear = this.setYear.bind(this);
        this.state = { view: {showConnectionDialog: false,
                              showCaptureDialog: false}}
        
        this.setYear(2019);
        
    }
    
    
    handleSelect(selectedKey) {
        console.log(selectedKey);
    }
    
    close() {
    }
    
    onSetYear(year, event) {
        this.setYear(year); 
        
        // Refresh the main Nuskin component
        refreshMainView();
        
    }

    setYear(year) {
        this.year = year;
        axios.defaults.headers.common['X-TenantID'] = 'nuskin' + year;  // for all requests
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
                   <ToggleButtonGroup type="radio" name="year" defaultValue={2019}  onChange={this.onSetYear} > 
                     <ToggleButton variant="outline-primary"  defaultChecked value={2018}  >2018</ToggleButton>
                     <ToggleButton variant="outline-primary"  value={2019}  >2019</ToggleButton>
                   </ToggleButtonGroup>
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



export default NuskinNavBar;
      