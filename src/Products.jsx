import React,  { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './Nuskin.css';
import { Tab, Tabs, Form, FormGroup, FormControl, Control, ControlLabel, Checkbox, Button, ListGroup, ListGroupItem, InputGroup } from 'react-bootstrap'
import ReactTable from "react-table";
import 'react-table/react-table.css';
import CurrencyInput from 'react-currency-input';
import axios from "axios";


class Products extends Component {
   
  constructor(props) {
      super(props);
      this.onSaveChanges = this.onSaveChanges.bind(this);
      this.onDiscardChanges = this.onDiscardChanges.bind(this);
      this.onEndUseChange = this.onEndUseChange.bind(this);
      this.onReceiptNumberChange = this.onReceiptNumberChange.bind(this);
      this.onCustomerNameChange = this.onCustomerNameChange.bind(this);
      this.onSellingPriceChange = this.onSellingPriceChange.bind(this);
      this.getTrProps = this.getTrProps.bind(this);
      this.refresh = this.refresh.bind(this);
      
      const cadFormat = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'CAD' })
      
      
      this.productColumns = [
        { Header: "Order Number: " + props.orderDetails.orderNumber, 
          columns: [
             { Header: 'Item',             accessor: 'id',           style: { textAlign: "center" }  }, 
             { Header: 'SKU',              accessor: 'sku',          style: { textAlign: "center" }  }, 
             { Header: 'Description',      accessor: 'description',  style: { textAlign: "left" }  }, 
             { Header: 'Cost',             accessor: 'costPrice',    style: { textAlign: "right" }, Cell: cellInfo => cadFormat.format(cellInfo.value) }, 
             { Header: 'Tax',              accessor: 'tax',          style: { textAlign: "right" }, Cell: cellInfo => cadFormat.format(cellInfo.value) }, 
             { Header: 'Shipping',         accessor: 'shipping',     style: { textAlign: "right" }, Cell: cellInfo => cadFormat.format(cellInfo.value) },
           ]
        },
        { Header: "Destination", 
          columns: [
            { Header: 'End Use',
              accessor: 'endUse',  
              Cell: (props) => {
                         return (
                          <Form.Control as="select" value={props.value}  onChange={ (ev)=> {this.onEndUseChange(ev, props.index)} } >
                             <option value="INSTOCK">In stock</option>
                             <option value="SOLD">Sold</option>
                             <option value="PERSONAL">Personal use</option>
                             <option value="DEMO">Demo</option>
                             <option value="SAMPLE">Sample</option>
                          </Form.Control>
                             )
                         }
             },
             { Header: 'Customer', accessor: 'customerName',
                  Cell: (props) => (
                          <Form.Control value={props.value != null ? props.value:undefined} onChange={ (ev)=> {this.onCustomerNameChange(ev, props.index)} }>
                          </Form.Control>
                          )
                  },
             { Header: 'Selling Price', 
               accessor: 'sellingPrice', 
                      Cell: (props) => (
                              <div>$
                              <CurrencyInput value={props.value != null ? props.value:undefined} onChangeEvent={ (ev)=> {this.onSellingPriceChange(ev, props.index)}}>
                              </CurrencyInput>
                              </div>
                              )
             },
             { Header: 'Receipt', 
               accessor: 'receiptNumber',
                  Cell: (props) => (
                     <Form.Control value={props.value != null ? props.value:undefined} onChange={ (ev)=> {this.onReceiptNumberChange(ev, props.index)}}   >
                     </Form.Control>
                     )
             }
         ]
        }
      ];

      this.state =  { data: null,
                      columns : this.productColumns };
     
      
  }

 
  refresh() {
      axios.get("/products?orderNumber=" + this.props.orderDetails.orderNumber)
      //.then( res => res.json())
      .then( (res) => {this.update(res.data) } );
  }

  update(res) {
      
      for (var i=0;  i<res.length; i++ ) {
         res[i].modified=false;
         res[i].error = false;
      }
      this.setState ({ data : res });
  }
 

  componentDidMount() {
      this.refresh();
  }
  
  onDiscardChanges() {
      // just re-read the data
      this.refresh();
  }
  
  onSaveChanges() {
      // Find all modified items and POST back to the server
      
      var data = [...this.state.data];
      
      var modifiedRows = new Array();
      
      var anyError = false;
      
      for (var i=0; i<data.length; i++) {
      
          if (data[i].modified) {
      
             var rowError = false;
      
             var modifiedRow = { ...data[i] }; // take a copy
      
             if (modifiedRow.endUse == 'INSTOCK' || modifiedRow.endUse == "PERSONAL" || modifiedRow.endUse == "DEMO") {
                // Clear out the other fields
                modifiedRow.customerName = "";
                modifiedRow.receiptNumber = "";
                modifiedRow.sellingPrice = 0;
             }  
             else if (modifiedRow.endUse == "SOLD") {
      
                // Require customer name and receipt fields
                if (modifiedRow.customerName == "") rowError = true;
                if (modifiedRow.receiptNumber == "" ) rowError = true;
                // Require selling price > 0
                if (modifiedRow.sellingPrice == 0) rowError = true;
      
             }
             else if (modifiedRow.endUse == "SAMPLE") {
                  
                  // Require customer name 
                  if (modifiedRow.customerName == "") {
                     rowError = true;
                  }
                  // Require selling price = 0
                  modifiedRow.sellingPrice = 0;
                  // Receipt given for samples? Assume not.
                  modifiedRow.receiptNumber = "";
             }
              
      
             if (!rowError) {
                 delete modifiedRow.modified;  // so as not to confuse the server 
                 modifiedRows.push(modifiedRow);
             }
             else {
                 data[i].error = true;
                 anyError = true;
             }
          }
      }
      
      
      if (!anyError) {

          axios.put('/updateitems',  modifiedRows)
               .then( () => { this.refresh();} );
    
       }
       else {
           
           // Just re-render with red colouring
           this.setState ({ data : data });

       }
      
  }

  onEndUseChange(ev, index) {
      
      var data = [...this.state.data];
      data[index].endUse = ev.target.value;
      data[index].modified = true;
      var columns = [...this.productColumns];
      this.setState({ data, columns } );
      
      // Maybe Want to: 
      //  Enable/disable customer/selling price/receipt controls
      //  Enable SAVE button
      // Validate selling price, receipt, customer
      // Update database
  }
  
  onReceiptNumberChange(ev, index) {
      // State data is immutable, have to take a copy then setState again
      var data = [...this.state.data];
      var columns = [...this.productColumns];
      data[index].receiptNumber = ev.target.value;
      data[index].modified = true;
      this.setState({data, columns});
  }
  
  onCustomerNameChange(ev, index) {
      var data = [...this.state.data];
      var columns = [...this.productColumns];
      data[index].customerName = ev.target.value;
      data[index].modified = true;
      this.setState({data, columns});
  }
  
  onSellingPriceChange(ev, index) {
      var data = [...this.state.data];
      var columns = [...this.productColumns];
      data[index].sellingPrice = ev.target.value;
      data[index].modified = true;
      this.setState({data, columns});
  }
    

  
  getTrProps(state, rowInfo) {
      
      // yellow "#EDF7A3"  green "#CEF7A3",
      var bkcolor = "#CEF7A3";
      var retval = {};
      
      
      if (rowInfo && rowInfo.row ) {
          
          if (rowInfo.original.error) {
              bkcolor = " #f1948a";
              retval = { style : { backgroundColor: bkcolor  } }
          }
          // If anything has been changed we are yellow 
          else if (rowInfo.original.modified) {
              bkcolor = "#EDF7A3";
              retval = { style : { backgroundColor: bkcolor  } }
          }
          // If the enduse is set we are GREEN
          else if (rowInfo.row.endUse != 'INSTOCK') { 
              bkcolor = "#CEF7A3";
              retval = { style : { backgroundColor: bkcolor  } }
          }
          // Otherwise drop through
      }

      // If not a product row (no rowInfo/rowInfo.row), not modified and still still instock, don't change the style
      return retval;
  }
  
  render() {

      const data = this.state.data ? this.state.data : undefined;
      return (
              <div>
              <form style={{margin: '10px'}}>
                  <span> <b>Order Number:</b> {this.props.orderDetails.orderNumber}  </span>
                  <br/>
                  <span><b>Subtotal:</b> ${this.props.orderDetails.subtotal}  </span>
                  <span><b>Tax:</b> ${this.props.orderDetails.tax}  </span>
                  <span><b>Shipping:</b> ${this.props.orderDetails.shipping}  </span>
                  <span><b>Total:</b> ${this.props.orderDetails.subtotal + this.props.orderDetails.tax + this.props.orderDetails.shipping}  </span>
                  <br/>
                  <span><b>Shipping Address:</b> {this.props.orderDetails.shippingAddress}  </span>
                  <br/>
                  <Button onClick={this.onSaveChanges}>Save changes</Button>
                  <Button onClick={this.onDiscardChanges}>Discard changes</Button>
              </form>         
              <ReactTable minRows="1" data={data} columns={this.productColumns} getTrProps={this.getTrProps} defaultPageSize={20} className="-striped -highlight" />
              </div>
    );
  }
}



export default Products;
