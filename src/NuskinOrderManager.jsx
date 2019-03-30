import React, { Component } from 'react';
import OrdersView from 'OrdersView';
import ReportView from 'ReportView';
import ExpensesView from 'ExpensesView';
import CommissionView from 'CommissionView';

class NuskinOrderManager extends React.Component {
    
    static theInstance;
    
    static refreshMainView() {
        NuskinOrderManager.theInstance.refresh();
    }
    
    static showReport() {
        NuskinOrderManager.theInstance.showReport();
    }
    static showExpenses() {
        NuskinOrderManager.theInstance.showExpenses();
    }
    static showCommission() {
        NuskinOrderManager.theInstance.showCommission();
    }
    static showOrders() {
        NuskinOrderManager.theInstance.showOrders();
    }
    
    constructor(props) {
        super(props);
        this.state = { view: 'Orders' };
        
        this.reportRef = React.createRef();
        this.ordersRef = React.createRef();
        this.commissionRef = React.createRef();
        this.expensesRef = React.createRef();
       
        NuskinOrderManager.theInstance = this;
        
    }
    
    refresh() {
        if (this.state.view == 'Report') {
            this.reportRef.current.getData();
        }
        else if (this.state.view == 'Orders') {
            this.ordersRef.current.getData();
        }
        else if (this.state.view == 'Commission') {
            this.commissionRef.current.getData();
        }
        else if (this.state.view == 'Expenses') {
            this.expensesRef.current.getData();
        }
        
        this.forceUpdate();
    }
    
    showReport() {
        this.setState( { view: 'Report' });
    }
    showOrders() {
        this.setState( { view: 'Orders' });
    }
    showExpenses() {
        this.setState( { view: 'Expenses' });
    }
    showCommission() {
        this.setState( { view: 'Commission' });
    }
    
    render () {
        
        // Select view to show, either orders or report
        if (this.state.view == 'Report') {
            return ( <ReportView ref={this.reportRef} /> );
        }
        else if (this.state.view == 'Orders') {

            return ( <OrdersView ref={this.ordersRef} /> );
        }
        else if (this.state.view == 'Commission') {

            return ( <CommissionView ref={this.commissionRef} /> );
        }
        else if (this.state.view == 'Expenses') {

            return ( <ExpensesView ref={this.expensesRef} /> );
        }
        else {
            return (<p>Invalid view</p>);
        }
    }
}


export default NuskinOrderManager;