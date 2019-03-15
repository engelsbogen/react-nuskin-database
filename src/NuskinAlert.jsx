import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap'


// Singleton modal component that is rendered in dummy <div id='alert'/>
export class NuskinAlert extends Component {
    
    static theAlert;
    
    static showAlert(message) {  
        
        NuskinAlert.theAlert.setMessage(message);
        NuskinAlert.theAlert.setState( { show: true } );
    }
    
    constructor(props) {
        super(props);
        
        NuskinAlert.theAlert = this;
        
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);

        this.state = { show: false };
        this.message = '';
        
    }
    
    handleClose() {
        this.setState({ show: false });
    }

    handleShow() {
        this.setState({ show: true });
    }
    
    setMessage(msg) {
        this.message = msg;
    }
    
    render () {
        return (
        <Modal show={this.state.show}  onHide={this.handleClose} > 
          <Modal.Header closeButton>
          <Modal.Title>Alert</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p> {this.message} </p>
          </Modal.Body>
        </Modal>
        );
    }
    
}

export default NuskinAlert;