import React, { Component } from 'react'; 
import { Container, Button, Form, Table, ToggleButton, ToggleButtonGroup, Row, Col, InputGroup } from 'react-bootstrap'
import axios from "axios";
import PeriodSelector from 'PeriodSelector'
import {TableHeader, TableRow } from 'TableHeader'
import CurrencyInput from 'react-currency-input';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { SelectedYear } from 'NuskinNavBar'

class ExpensesView extends React.Component {
    
    constructor(props) {
        super(props);
        this.getData = this.getData.bind(this);
        this.onChoosePeriod = this.onChoosePeriod.bind(this);
        this.handleExpenseTypeChange = this.handleExpenseTypeChange.bind(this);
        this.handleDateChange = this.handleDateChange.bind(this);
        this.setDateRange = this.setDateRange.bind(this);
        this.categorySelect = this.categorySelect.bind(this);
        this.period = 'year';
        this.data = { period: 'year to date'};
        
                
        // initDateRange
        var selectedYear = SelectedYear.getYear();
        var currentDate = new Date();
        
        // If user has selected a year not the current one, set the selected date to Jan 1 of the selected year
        // Months are 0-based in Date() constructor
        var startDate = (currentDate.getFullYear() == selectedYear) ? currentDate : new Date(selectedYear, 0,1);

        this.state = { startDate: startDate,
                       minDate: new Date(selectedYear, 0, 1),
                       maxDate: new Date(selectedYear, 11, 31)    
                      };
        
    }
    
    onChoosePeriod(period) {
        console.log(period);
        this.period = period;
        this.getData();
    }
    
    setDateRange() {
        
        var selectedYear = SelectedYear.getYear();
        
        // If currently set date is out of range, set it to Jan 1 of the selected year
        if (this.state.startDate.getFullYear() != selectedYear) {
            this.setState( {startDate: new Date(selectedYear, 0,1) });
        }
        
        this.setState( {  minDate: new Date(selectedYear, 0, 1),
                          maxDate: new Date(selectedYear, 11, 31)    
                       });
        
    }
    
    
    getData() {
        this.setDateRange();
    }
    
    handleExpenseTypeChange(expenseType) {
        
    }
    
    handleDateChange(date) {
        this.setState({ startDate: date });
    }
    
    
    categorySelect() {
        
        return (
        <Form.Control as="select" onChange={this.handleExpenseTypeChange}>
            <option value="Advertising">Advertising</option>
            <option value="Meals">Meals and entertainment</option>
            <option value="Debts">Bad debts</option>
            <option value="Insurance">Insurance</option>
            <option value="Interest">Interest and bank charges</option>
            <option value="Licences">Business taxes, licences and memberships</option>
            <option value="Office">Office expenses</option>
            <option value="Stationery">Office stationery and supplies</option>
            <option value="ProfessionalFees">Professional fees</option>
            <option value="AdminFees">Management and admin fees</option>
            <option value="Rent">Rent</option>
            <option value="Repairs">Repairs and maintenance</option>
            <option value="Salaries">Salaries, wages and benefits</option>
            <option value="PropertyTaxes">Property taxes</option>
            <option value="Travel">Travel expenses</option>
            <option value="Utilities">Utilities</option>
            <option value="Fuel">Fuel costs (except for motor vehicles)</option>
            <option value="Delivery">Delivery, freight and express</option>
            <option value="Vehicles">Motor vehicle expenses (not including CCA)</option>
            <option value="CCA">Capital cost allowance</option>
            <option value="Other">Other expenses</option>
        </Form.Control> );
        
    }
    
    render() {
        
        
        return (<div>
                
                <Form style={{margin: '10px' }}>
                
                <Table bordered >
                <TableHeader headings={["New Expense"]} />
                <tbody><tr><td>
                <Table borderless >
                <tbody>
                <TableRow cells= { 
                    [ <Form.Label >Category</Form.Label> ,
                      this.categorySelect() 
                    ] }  />
    
                <TableRow cells= { [
    
                      <Form.Label>Date</Form.Label>,
                      <DatePicker className="form-control"
                           selected={this.state.startDate}
                           onChange={this.handleDateChange}
                           minDate={this.state.minDate}
                           maxDate={this.state.maxDate}
                         /> ] }
                  />
                

                <TableRow cells= { [
                       <Form.Label>Amount</Form.Label>,
                       <CurrencyInput className="form-control" value={0} onChangeEvent={ (ev)=> {console.log(ev)}}/>
                       ] } />
                       		
                <TableRow cells= { [
                       <Form.Label>Description</Form.Label>,
                       <Form.Control as="input" />  ] } />
                
                <TableRow cells= { [ null,
                                    <Button>Add</Button> ] } />
                       
                </tbody>
                </Table>
                                    
                </td></tr></tbody>
                </Table>
                </Form>
                       
                <Form style={{margin: '10px' }}>
                <PeriodSelector onChange={this.onChoosePeriod} />
                <Table striped bordered hover>
                <TableHeader headings={["Summary Expenses for " + this.data.period] } />
                <tbody><tr><td>
                </td></tr></tbody>
                </Table>
                 </Form> 
                       
                 </div>      
                       
                );
    }
    
}


export default ExpensesView;