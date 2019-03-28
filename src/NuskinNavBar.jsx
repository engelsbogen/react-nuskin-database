
import React from 'react';
import { Navbar, Nav, NavItem, NavDropdown, MenuItem, Form, Button, 
        ToggleButton, ToggleButtonGroup, Modal  } from 'react-bootstrap';
import {refreshMainView, showReport } from 'index';
import axios from "axios";

export class NuskinNavBar extends React.Component {

    constructor(props) {
        super(props)
        
        // Method bindings
        this.handleSelect = this.handleSelect.bind(this);
        this.close = this.close.bind(this);
        this.onSetYear = this.onSetYear.bind(this);
        this.setYear = this.setYear.bind(this);
        
        // Data members
        this.state = { view: {showConnectionDialog: false,
                              showCaptureDialog: false}}
        
        // Make list of all years from 2018 to current date. Render will create a button for each year
        // Note that the back-end must have a data source (database) configured for each year
        
        this.years = [];
        var currentYear = new Date().getFullYear();
        for (var year=2018; year <= currentYear; year++ ) {
            this.years.push(year);
        }

        // TODO - (maybe) save the last selected year in a Cookie
        // for now assume we want the current year's data
        this.setYear(currentYear);
        
    }
    
    
    handleSelect(selectedKey) {
        showReport();
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
        // Add the X-TenantID to all requests made through the axios library
        axios.defaults.headers.common['X-TenantID'] = 'nuskin' + year;
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
                   <ToggleButtonGroup type="radio" name="year" defaultValue={ this.year }  onChange={this.onSetYear} > 
                     {this.years.map( (year) => ( <ToggleButton key={year} variant="outline-primary" value={year} >{year}</ToggleButton>))  }
                   </ToggleButtonGroup>
                   <Nav.Link eventKey={2} href="#report" >
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
      