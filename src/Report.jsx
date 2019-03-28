import React, { Component } from 'react'; 
import { Button, Form, Table } from 'react-bootstrap'
import axios from "axios";

const cadFormat = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })


function TableRow(props) {
    
    return ( <tr style={props.style}>
               <td >{props.desc}</td>
               <td>{props.quantity == undefined ? null: props.quantity }</td>
               <td style={ props.amount < 0 ? { color: 'red'} : null } >{props.amount == undefined ? null: cadFormat.format(props.amount)}</td>
             </tr> );
    
}


function showHeading(heading, index) {
    
    var head = <th key={index}>{heading}</th>;
    return head;
}

function TableHeader(props) {
   
    return ( <thead>
            <tr>
            { 
                props.headings.map( (t, i) => showHeading(t,i) )
            }
            </tr>
             </thead>
            );
    
}


class Report extends React.Component {

    constructor(props) {
        super(props);
        
        this.showReport = this.showReport.bind(this);
        this.onClose = this.onClose.bind(this);
        this.refresh = this.refresh.bind(this);
        this.getCostOfGoodsSold = this.getCostOfGoodsSold.bind(this);
        this.getProfit = this.getProfit.bind(this);
        this.itemText = this.itemText.bind(this);
        this.profitLossSummary= this.profitLossSummary.bind(this);
        this.productDispositionSummary = this.productDispositionSummary.bind(this);
        
        this.state  = {show :  true };
        this.data = null;
    }

    
    refresh(res) {
        console.log(res.data);
        this.data = res.data;
        this.setState ( {show :  true } );
    }
    
    showReport() {
        
        // Request report from server
        axios.get("/report?period=year")
             .then( (res) => { this.refresh(res); } );
        
    }
    
    onClose() {
        this.setState ( {show :  false } );
    }
    
    getCostOfGoodsSold() {
        // Subtract personal use items 
        var sum1 = this.data.openingInventory + this.data.purchases - this.data.closingInventory - this.data.personalUseCost;
        
        // Alternatively, sum the cost of items sold or used to make those sales, ie for demo or samples:
        // These two sums should be the same
        var sum2 = this.data.salesCost + this.data.demoCost + this.data.sampleCost;
        
        if (sum1 != sum2) {
            console.log("Hmm, these should be the same:" + sum1 + " : " + sum2);
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
                   <TableRow desc="Products sold"      
                             quantity = { this.itemText(this.data.soldItemCount) } 
                             amount = { this.data.salesCost}  />
                   <TableRow desc="Products demonstrated"      
                             quantity = { this.itemText(this.data.demoItemCount) } 
                             amount = { this.data.demoCost}  />
                   <TableRow desc="Sample Poducts"    
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
      
      if (this.state.show && this.data) {
          return ( <div>
                      <Form style={{margin: '10px'}}>
                      <Button onClick={() => {this.onClose();} }>Close</Button>
                    
                    <Table striped bordered hover>
                        <TableHeader headings={["Summary Profit/Loss year to date"] } />
                        <tbody><tr><td>
                            {this. profitLossSummary() }
                         </td></tr></tbody>
                    </Table>

                     <Table striped bordered hover>
                              <TableHeader headings={["Summary Products disposition year to date"] } />
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

export default Report;
