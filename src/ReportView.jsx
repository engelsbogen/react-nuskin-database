import React, { Component } from 'react'; 
import { Button, Form, Table, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import axios from "axios";
import PeriodSelector from 'PeriodSelector';
import {TableHeader} from 'TableHeader';

const cadFormat = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })


function TableRow(props) {
    
    return ( <tr style={props.style}>
               <td >{props.desc}</td>
               <td>{props.quantity == undefined ? null: props.quantity }</td>
               <td style={ props.amount < 0 ? { color: 'red'} : null } >{props.amount == undefined ? null: cadFormat.format(props.amount)}</td>
             </tr> );
    
}



class ReportView extends React.Component {

    constructor(props) {
        super(props);
        // Bind methods
        this.getData = this.getData.bind(this);
        this.refresh = this.refresh.bind(this);
        this.getCostOfGoodsSold = this.getCostOfGoodsSold.bind(this);
        this.getProfit = this.getProfit.bind(this);
        this.itemText = this.itemText.bind(this);
        this.onChoosePeriod = this.onChoosePeriod.bind(this);
        this.profitLossSummary= this.profitLossSummary.bind(this);
        this.productDispositionSummary = this.productDispositionSummary.bind(this);
        // Data members
        this.data = null;
        
        this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        this.period='year';
        
    }
    
    componentDidMount() {
        this.getData();
    }

    refresh(res) {
        this.data = res.data;
        this.forceUpdate();
    }
    
    
    onChoosePeriod(period) {
        this.period = period;
        this.getData();
    }
    
    getData() {
        // Request report from server
        axios.get("/report?period=" + this.period)
             .then( (res) => { this.refresh(res); } );
    }
    
    
    getCostOfGoodsSold() {
        // Subtract personal use items 
        var sum1 = this.data.openingInventory + this.data.purchases - this.data.closingInventory - this.data.personalUseCost;
        
        // Alternatively, sum the cost of items sold or used to make those sales, ie for demo or samples:
        // These two sums should be the same
        var sum2 = this.data.salesCost + this.data.demoCost + this.data.sampleCost;
        
        if (sum1 != sum2) {
            console.log("These should be the same:" + sum1 + " : " + sum2);
        }
        
        return sum1;
    }
    
    getProfit() {
        
        return this.data.grossSales - this.getCostOfGoodsSold();
    }
    
    itemText(num) {
        
        if (num == 1) return num + " item";
        else return num + " items";
        
    }
    
    
    profitLossSummary() {

        return (
            <Table striped bordered hover>
                <TableHeader headings={["Description", "Quantity", "Amount"] } />
                <tbody>
                 <TableRow desc="Opening Inventory"  
                           quantity={this.itemText(this.data.openingInventoryItemCount) }
                           amount={this.data.openingInventory} />
                 <TableRow desc="Purchases"          
                           quantity = { this.data.orderCount + " orders / " + this.itemText(this.data.purchasedItemCount) }  
                           amount={this.data.purchases } />
                 <TableRow desc="Gross Sales"              
                           quantity = { this.itemText(this.data.soldItemCount) }      
                           amount={ this.data.grossSales  } />
                 <TableRow desc="Closing Inventory"  
                           quantity = { this.itemText(this.data.inventoryItemCount) } 
                           amount={this.data.closingInventory} />
                 <TableRow desc="Cost of goods sold/demo/samples" 
                           quantity = { this.itemText(this.data.soldItemCount + this.data.demoItemCount + this.data.sampleItemCount) }
                           amount={this.getCostOfGoodsSold() } />
                 <TableRow style = { {fontWeight : 'bold'} }
                           desc="Profit/(Loss)"      
                           amount={this.getProfit() } />
                 </tbody>
             </Table> 
         );
    }

    productDispositionSummary() {
        
        return (
        
            <Table striped bordered hover>
                <TableHeader headings={["Description", "Quantity", "Cost"] } />
                <tbody>
                   <TableRow desc="Products Sold"      
                             quantity = { this.itemText(this.data.soldItemCount) } 
                             amount = { this.data.salesCost}  />
                   <TableRow desc="Products Demonstrated"      
                             quantity = { this.itemText(this.data.demoItemCount) } 
                             amount = { this.data.demoCost}  />
                   <TableRow desc="Sample Products"    
                             quantity = { this.itemText(this.data.sampleItemCount) }
                             amount = {this.data.sampleCost } />
                   <TableRow desc="Personal Products"  
                             quantity = { this.itemText(this.data.personalUseItemCount) }
                             amount = { this.data.personalUseCost } />
                 </tbody>
             </Table>
        );
    }
    
    render() {
      
      if (this.data) {
          return ( <div>
                    <Form style={{margin: '10px'}}>
                    <PeriodSelector onChange={this.onChoosePeriod} />

                    <Table striped bordered hover>
                        <TableHeader headings={["Summary Profit/Loss for " + this.data.period] } />
                        <tbody><tr><td>
                            {this.profitLossSummary() }
                         </td></tr></tbody>
                    </Table>

                     <Table striped bordered hover>
                              <TableHeader headings={["Summary Products disposition for " + this.data.period] } />
                              <tbody><tr><td>
                                 {this.productDispositionSummary() }
                            </td></tr></tbody>
                    </Table>
                    </Form>         
                   </div>);
      }
      else {
          return (null);    
      }
      
    }
    
}

export default ReportView;
