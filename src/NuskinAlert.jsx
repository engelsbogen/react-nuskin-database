import React, { Component } from 'react';
import { Modal, Button } from 'react-bootstrap'


// Singleton modal component that is rendered in dummy <div id='alert'/>
export class NuskinAlert extends Component {
    
    static theAlert;
    
    static showAlert(message) {  
        
        NuskinAlert.theAlert.setMessage(message);
        NuskinAlert.theAlert.setType("alert");
        NuskinAlert.theAlert.setState( { show: true } );
        return NuskinAlert.theAlert.getPromise();
    }
    
    static showConfirm(message) {
        
        NuskinAlert.theAlert.setMessage(message);
        NuskinAlert.theAlert.setType("confirm");
        NuskinAlert.theAlert.setState ( {show: true } );
        return NuskinAlert.theAlert.getPromise();
    }
    
    static getExitCode() {
        return NuskinAlert.theAlert.getExitCode();
    }
    
    constructor(props) {
        super(props);
        
        NuskinAlert.theAlert = this;
        
        this.handleShow = this.handleShow.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.onOK = this.onOK.bind(this);
        this.onCancel = this.onCancel.bind(this);
        this.getExitCode = this.getExitCode.bind(this);
        this.setType = this.setType.bind(this);
        this.getPromise = this.getPromise.bind(this);
        
        this.state = { show: false };
        this.message = '';
        this.exitCode = 0;
        
    }
    
    getPromise() {
        return this.promise;
    }
    
    getExitCode() {
        return this.exitCode;
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
    
    setType(dlgType) {
        this.dlgType=dlgType;
        this.exitCode = 0;
        this.promise = new Promise((resolve, reject) => {this.resolve = resolve} );
    }
    
    onOK() {
        this.exitCode = 0;
        this.handleClose();
        this.resolve(0);
    }
    onCancel() {
        this.exitCode = 1;
        this.handleClose();
        this.resolve(1);
    }
    
    render () {

        var buttons  = (this.dlgType == 'confirm') ?
              (<span>
                  <Button onClick={this.onOK}>OK</Button>
                  <Button onClick={this.onCancel}>Cancel</Button>
                 </span>)
            :
             (<span>
                    <Button onClick={this.onOK}>OK</Button>
              </span>);
            
        ;
        
        
        return (
        <Modal show={this.state.show}  onHide={this.handleClose} > 
          <Modal.Header >
          <Modal.Title>Alert</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p> {this.message} </p>
            {buttons}
          </Modal.Body>
        </Modal>
        );
    }
    
}

export default NuskinAlert;