import React, { Component } from 'react'; 
import { Button, Form, Table, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
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


class CommissionView extends React.Component {
    
    constructor(props) {
        super(props);
        this.getData = this.getData.bind(this);
        this.onChoosePeriod = this.onChoosePeriod.bind(this);
        this.setDateRange = this.setDateRange.bind(this);
        
        // PageCreate components
        this.summaryCommission = this.summaryCommission.bind(this);
        this.newCommission = this.newCommission.bind(this);
        
        
        // Call-backs for the "new commission" form
        this.onDateChange = this.onDateChange.bind(this);
        this.onAmountChange = this.onAmountChange.bind(this);
        this.onAddCommission = this.onAddCommission.bind(this);
        
        // Call-backs for "summary commission" form
        this.onDeleteCommission = this.onDeleteCommission.bind(this);
        
        this.period = 'year';
    
        
        // initDateRange
        var selectedYear = SelectedYear.getYear();
        var currentDate = new Date();
        
        // If user has selected a year not the current one, set the selected date to Jan 1 of the selected year
        // Months are 0-based in Date() constructor
        var startDate = (currentDate.getFullYear() == selectedYear) ? currentDate : new Date(selectedYear, 0,1);

        
        this.state = {
                amountValid: true,
                startDate: startDate,
                minDate: new Date(selectedYear, 0, 1),
                maxDate: new Date(selectedYear, 11, 31),
                data : { period: "year to date",
                         commission: 
                         [
                         ] 
                       }
               };
 
         this.commission = {
                 date:  startDate,
                 amount: 0.0,
         };

    }
    
    
    componentDidMount() {
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
    
    onChoosePeriod(period) {
        console.log(period);
        this.period = period;
        this.getData();
    }
    
    getData() {
        this.setDateRange();
        axios.get('/commission?period=' + this.period)
        .then( (res) => {this.handleData(res.data); } );
    }
    
    handleData(data) {
        this.setState( { data: data } );
    }

    
    onAddCommission(ev) {

        ev.preventDefault() //  to stop the page refresh onSubmit
        
        var form = ev.currentTarget;
        if (form.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
        }
        var isValid = true;
        if (this.commission.amount == 0) {
            this.setState({amountValid : false});
            isValid = false;
        }

        if (isValid) {
        
            axios.put('/addcommission', this.commission)
                 .then( (res) => {this.handleSaveResponse(res); } );
            
        }

    }
    
    handleSaveResponse(response) {
        this.getData();   // Refresh the table
    }

    
    onDeleteCommission(index) {
        axios.delete("/deletecommission?id=" + this.state.data.commission[index].id )
             .then( (res) => this.handleDeleteResponse(res))
             .catch( (res) => this.handleDeleteError(res));
    }
    
    handleDeleteResponse(response) {
        this.getData();
    }
    
    handleDeleteError(response) {
        NuskinAlert.showAlert("Error deleting commission: " + response);
    }
    
    handleSaveResponse(response) {
        this.getData();   // Refresh the table
    }

    
    summaryCommission() {
        
        return (<Form style={{margin: '10px'}}>
                <PeriodSelector onChange={this.onChoosePeriod} />
                
                <Table striped bordered hover>
                    <TableHeader headings={["Summary Commission for " + this.state.data.period] } />
                    <tbody><tr><td>
                        <ReactTable 
                            data={this.state.data.commission} 
                            columns={this.summaryColumns} 
                            defaultPageSize={50} 
                            minRows="1"
                            className="-striped -highlight" 
                        />
                    </td></tr></tbody>
                </Table>

                </Form> 
               );
    }
    
    
    onDateChange(date) {
        this.commission.date = date;
        this.setState({ startDate: date });
    }
    
    onAmountChange(amount) {
        this.commission.amount = amount;
        
        if (this.commission.amount == 0) {
            this.setState({amountValid : false});
        }
    }

    
    
    newCommission() {
        
        return (
                <Form 
                    onSubmit={e => this.onAddCommission(e)} 
                    style={{margin: '10px' }}
                >
                <Table bordered >
                <TableHeader headings={["New Commission"]} />
                <tbody><tr><td>
                <Table  >
                <tbody>
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
                            
                
                <TableRow cells= { [ null,
                                    <Button type="submit" >Save</Button> ] } />
                       
                </tbody>
                </Table>
                                    
                </td></tr></tbody>
                </Table>
                </Form>
        
        );
        
    }
    
    makeSummaryColumns() {
        
        this.summaryColumns = [
           { Header: "Commission", 
              columns: [
                 { Header: 'Date',
                     width: 100,
                     accessor: 'date',  
                     style: { textAlign: "right"  },    
                     Aggregated: ()=> { return  (<span/>) }, // Empty in aggregated row
                  },  
                 { Header: 'Amount',     
                     accessor: 'amount', 
                     width: 250,
                     style: { textAlign: "right" },
                     // Aggregated row sums the total orders for the month
                     aggregate: vals => lodash.sum(vals),
                     Cell: props => cadFormat.format(props.value) ,

                     Footer: (
                             <span>
                               <strong>
                               { 
                                   cadFormat.format(lodash.sum(lodash.map( this.state.data.commission, d=>d.amount )))
                               }
                               </strong>
                             </span>
                           ),
                 },
                 { Header: 'Actions', 
                         width: 100,
                         Cell: props=>( 
                                 <span>
                                    <Button onClick={()=> {this.onDeleteCommission(props.index)}}>Delete</Button>
                                 </span> 
                               ),
                         // React-table cells are set to {white-space: nowrap}. To allow wrapping in one cell, unset this style
                         // For react we have to change to whiteSpace
                         style: { 'whiteSpace': 'unset'} 
                 },
              ]
           }   
                               
        ];

        return this.summaryColumns;

    }
    
    render() {
     
        // Have to remake the columns as the total for the footer is only calculated once 
        this.makeSummaryColumns();

        return (<div>
                { this.newCommission() }
                { this.summaryCommission() }                   
                 </div>      
               );
        
    }
    
   
    
}

export default CommissionView;
