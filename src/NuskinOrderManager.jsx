import React, { Component } from 'react';
import OrdersView from 'OrdersView';
import ReportView from 'ReportView';


class NuskinOrderManager extends React.Component {
    
    static theInstance;
    
    static refreshMainView() {
        NuskinOrderManager.theInstance.refresh();
    }
    
    static showReport() {
        NuskinOrderManager.theInstance.showReport();
    }
    
    static showOrders() {
        NuskinOrderManager.theInstance.showOrders();
    }
    
    constructor(props) {
        super(props);
        this.state = { showReport: false };
        
        this.reportRef = React.createRef();
        this.ordersRef = React.createRef();
        
        NuskinOrderManager.theInstance = this;
        
    }
    
    refresh() {
        if (this.state.showReport) {
            this.reportRef.current.getData();
        }
        else {
            this.ordersRef.current.getData();
        }
        this.forceUpdate();
    }
    
    showReport() {
        this.setState( { showReport: true });
    }
    showOrders() {
        this.setState( { showReport: false });
    }
    
    render () {
        
        // Select view to show, either orders or report
        if (this.state.showReport) {
            return ( <ReportView ref={this.reportRef} /> );
        }
        else {
            return ( <OrdersView ref={this.ordersRef} /> );
        }
    }
}


export default NuskinOrderManager;