import React, { Component } from 'react'; 
import { Container, Button, Form, Table, ToggleButton, ToggleButtonGroup, Row, Col, InputGroup } from 'react-bootstrap'
import axios from "axios";
import PeriodSelector from 'PeriodSelector'
import {TableHeader, TableRow } from 'TableHeader'
import CurrencyInput from 'react-currency-input';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { SelectedYear } from 'NuskinNavBar'
import ReactTable from 'react-table'
import lodash from "lodash";
import NuskinAlert from "NuskinAlert";

const cadFormat = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })


function isEmpty(str) {
    return (!str || 0 === str.length);
}

class ExpensesView extends React.Component {
    
    constructor(props) {
        super(props);
        this.getData = this.getData.bind(this);
        this.onChoosePeriod = this.onChoosePeriod.bind(this);
        this.setDateRange = this.setDateRange.bind(this);
        this.categorySelect = this.categorySelect.bind(this);
        this.getTotal = this.getTotal.bind(this);
        
        // Handlers for responses from server
        this.handleSaveResponse = this.handleSaveResponse.bind(this);
        this.handleDeleteResponse = this.handleDeleteResponse.bind(this);
        this.handleDeleteError = this.handleDeleteError.bind(this);
        this.handleData = this.handleData.bind(this);

        // Component builders
        this.makeExpenseColumns = this.makeExpenseColumns.bind(this);
        this.newExpense = this.newExpense.bind(this);
        this.summaryExpenses = this.summaryExpenses.bind(this);

        // Call-backs for the "new expense" form
        this.onDateChange = this.onDateChange.bind(this);
        this.onAmountChange = this.onAmountChange.bind(this);
        this.onDescriptionChange = this.onDescriptionChange.bind(this);
        this.onExpenseTypeChange = this.onExpenseTypeChange.bind(this);
        this.onAddExpense = this.onAddExpense.bind(this);
        
        // Call-backs for "summary expenses" form
        this.onDeleteExpense = this.onDeleteExpense.bind(this);
        this.onEditExpense = this.onEditExpense.bind(this);
        
        this.period = 'year';
        this.data = { period: 'year to date'};
        
                
        // initDateRange
        var selectedYear = SelectedYear.getYear();
        var currentDate = new Date();
        
        // If user has selected a year not the current one, set the selected date to Jan 1 of the selected year
        // Months are 0-based in Date() constructor
        var startDate = (currentDate.getFullYear() == selectedYear) ? currentDate : new Date(selectedYear, 0,1);

        this.state = { descValid: true,
                       amountValid: true,
                       startDate: startDate,
                       minDate: new Date(selectedYear, 0, 1),
                       maxDate: new Date(selectedYear, 11, 31),
                       data : { period: "year to date",
                                expenses: 
                                [
                                ] 
                              }
                      };
        
       
        this.expense = {
                category: "Advertising",
                date:  startDate,
                amount: 0.0,
                description: ""
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
    
    
    componentDidMount() {
        this.getData();
    }
    
    
    getData() {
        this.setDateRange();
        axios.get('/expenses?period=' + this.period)
        .then( (res) => {this.handleData(res.data); } );
    }
    
    handleData(data) {
        this.setState( { data: data } );
    }
    
    onExpenseTypeChange(ev) {
        this.expense.category = ev.target.value;
    }

    onDescriptionChange(ev) {
        this.expense.description = ev.target.value;
        
        if (isEmpty(this.expense.description)) {
            this.setState( {descValid : false });
        }
    }
    
    onDateChange(date) {
        this.expense.date = date;
        this.setState({ startDate: date });
    }
    
    onAmountChange(amount) {
        this.expense.amount = amount;
        
        if (this.expense.amount == 0) {
            this.setState({amountValid : false});
        }
        console.log(this.expense.amount);
    }
    
    onAddExpense(ev) {

        ev.preventDefault() //  to stop the page refresh onSubmit
        
        var form = ev.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        var isValid = true;
        if (isEmpty(this.expense.description) ) {
            this.setState( {descValid : false });
            isValid = false;
        }
        if (this.expense.amount == 0) {
            this.setState({amountValid : false});
            isValid = false;
        }

        if (isValid) {
        
            axios.put('/addexpense', this.expense)
                 .then( (res) => {this.handleSaveResponse(res); } );
            
        }

    }
    
    onDeleteExpense(index) {
        axios.delete("/deleteexpense?id=" + this.state.data.expenses[index].id )
             .then( (res) => this.handleDeleteResponse(res))
             .catch( (res) => this.handleDeleteError(res));
    }
    
    onEditExpense(ev) {
        console.log("Edit expense");
    }
    
    handleDeleteResponse(response) {
        this.getData();
    }
    handleDeleteError(response) {
        
        NuskinAlert.showAlert("Error deleting expense: " + response);
        
    }
    
    handleSaveResponse(response) {
        this.getData();   // Refresh the table
    }
    
    categorySelect() {
        
        return (
        <Form.Control as="select" defaultValue={this.expense.category} onChange={this.onExpenseTypeChange}>
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
    
    summaryExpenses() {
        
        return (
            <Form style={{margin: '10px' }}>
            <PeriodSelector onChange={this.onChoosePeriod} />
            <Table striped bordered hover>
            <TableHeader headings={["Summary Expenses for " + this.state.data.period] } />
            <tbody><tr><td>
                <ReactTable data={this.state.data.expenses} 
                    columns={this.expenseColumns} 
                    defaultPageSize={50} 
                    minRows="1"
                    className="-striped -highlight" 
                    pivotBy={["category"]} 
                />
                
            </td></tr></tbody>
            </Table>
            </Form> 
       );
        
    }
    
    getTotal() {
        if (this.data && this.data.expenses) {
            var yearTotal = lodash.sum(lodash.map(this.data.expenses,  d => d.amount));
            
            // Format as currency
            return cadFormat.format(yearTotal);
        }
        else {
            return 0;
        }
    }
    
    makeExpenseColumns() {
        
        this.expenseColumns = [
          { Header: "Expenses", 
             columns: [
                { Header: 'Category',       width: 150, 
                    accessor: 'category',     
                    style: { textAlign: "left" },   
                },
                { Header: 'Date',
                    width: 100,
                    accessor: 'date',  
                    style: { textAlign: "right"  },    
                    Aggregated: ()=> { return  (<span/>) }, // Empty in aggregated row
                 },  
                { Header: 'Amount',         width: 100,
                    accessor: 'amount',   
                    style: { textAlign: "right" },
                    // Aggregated row sums the total orders for the month
                    aggregate: vals => lodash.sum(vals),
                    Cell: props => cadFormat.format(props.value) ,

                    Footer: (
                            <span>
                              <strong>
                              { 
                                  cadFormat.format(lodash.sum(lodash.map( this.state.data.expenses, d=>d.amount )))
                              }
                              </strong>
                            </span>
                          ),
                },
                { Header: 'Description', 
                    accessor: 'description',
                    // React-table cells are set to {white-space: nowrap}. To allow wrapping in one cell, unset this style
                    // For react we have to change to whiteSpace
                    style: { 'whiteSpace': 'unset'} },
                { Header: 'Actions', 
                        width: 100,
                        Cell: props=>( 
                                <span>
                                   <Button onClick={()=> {this.onDeleteExpense(props.index)}}>Delete</Button>
                                </span> 
                              ),
                        // React-table cells are set to {white-space: nowrap}. To allow wrapping in one cell, unset this style
                        // For react we have to change to whiteSpace
                        style: { 'whiteSpace': 'unset'} },
             ]
          }
          
        ];

        return this.expenseColumns;
    }
    
    
    newExpense() {
        
        return (
                <Form 
                    onSubmit={e => this.onAddExpense(e)} 
                    style={{margin: '10px' }}
                >
                <Table bordered >
                <TableHeader headings={["New Expense"]} />
                <tbody><tr><td>
                <Table  >
                <tbody>
                <TableRow cells= { 
                    [ <Form.Label >Category</Form.Label> ,
                      this.categorySelect() 
                    ] }  />
    
                <TableRow cells= { [
    
                      <Form.Label>Date</Form.Label>,
                      <DatePicker className="form-control"
                           selected={this.state.startDate}
                           onChange={this.onDateChange}
                           minDate={this.state.minDate}
                           maxDate={this.state.maxDate}
                         /> ] }
                  />
                

                <TableRow cells= { [
                       <Form.Label>Amount</Form.Label>,
                       <CurrencyInput min="0.01" className="form-control" value={0} onChangeEvent={ (ev, maskedValue, floatValue)=> this.onAmountChange(floatValue) }/>
                       ] } />
                            
                <TableRow cells= { [
                       <Form.Label>Description</Form.Label>,
                       <div>
                       <Form.Control required as="input" placeholder="Enter description of expense" onChange={this.onDescriptionChange} /> 
                       <Form.Control.Feedback type="invalid">
                          Please provide a description.
                       </Form.Control.Feedback>
                       </div>

                       
                       ] } />
                
                <TableRow cells= { [ null,
                                    <Button type="submit" >Save</Button> ] } />
                       
                </tbody>
                </Table>
                                    
                </td></tr></tbody>
                </Table>
                </Form>
        
        );
    }

    
    render() {
        
        // Have to remake the columns as the total for the footer is only calculated once 
        this.makeExpenseColumns();

        return (<div>
                { this.newExpense() }
                { this.summaryExpenses() }                   
                 </div>      
               );
    }
    
}


export default ExpensesView;