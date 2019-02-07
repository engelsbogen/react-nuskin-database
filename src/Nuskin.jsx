import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { Tab, Tabs, FormGroup, FormControl, ControlLabel, Checkbox, Button, ListGroup, ListGroupItem, InputGroup } from 'react-bootstrap'


class Nuskin extends Component {
    
  constructor(props) {
      super(props);
      this.onSubmit = this.onSubmit.bind(this);
      this.onIpAddrChange = this.onIpAddrChange.bind(this);
      this.state = { ipaddress: ""}
  }
  
  onIpAddrChange(ev) {
  }
    
  onSubmit(ev) {
      ev.preventDefault();
      console.log("form onSubmit");
  }
    
  render() {

      return (
            
        <form onSubmit={this.onSubmit} style={{margin: '10px'}}>
            <FormGroup>
               <InputGroup>
               <InputGroup.Addon>Radio Type</InputGroup.Addon>
                  <FormControl componentClass="select" >
                    <option value="Any">Any</option>
                    <option value="MSTRDU">MSTRDU</option>
                    <option value="RRH2X">RRH2X</option>
                    <option value="RFH">RFH</option>
                  </FormControl>
                </InputGroup>
                <InputGroup>
                    <InputGroup.Addon>IP Address</InputGroup.Addon>
                    <FormControl type="text" value={this.state.ipaddress} onChange={this.onIpAddrChange} placeholder="192.168.1.1"/>
                </InputGroup>
           </FormGroup>
           <Button>Connect</Button>
         </form>

/*       
      <div className="Nuskin">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header>
      </div>
      */
       
    );
  }
}




/*
fetch("/orders")
.then( res => res.json())
.then( (res) => {this.plotMyData(res, resetScale) } );
*/



export default Nuskin;
