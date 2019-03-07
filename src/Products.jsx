import React,  { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './Nuskin.css';
import { Tab, Tabs, Form, FormGroup, FormControl, Control, ControlLabel, Checkbox, Button, ListGroup, ListGroupItem, InputGroup } from 'react-bootstrap'
import ReactTable from "react-table";
import 'react-table/react-table.css';
import CurrencyInput from 'react-currency-input';
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
        { Header: "Order Number: " + props.orderNumber, 
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

//  <Form.Control value={props.value != null ? props.value:undefined} onChange={ (ev)=> {this.onSellingPriceChange(ev, props.index)}} >
//  </Form.Control>

  
  refresh() {
      fetch("/products?orderNumber=" + this.props.orderNumber)
      .then( res => res.json())
      .then( (res) => {this.update(res) } );
  }

  update(res) {
      
      for (var i=0;  i<res.length; i++ ) {
         res[i].modified=false;
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
      
      for (var i=0; i<data.length; i++) {
          if (data[i].modified) {
             var modifiedRow = { ...data[i] }; // take a copy 
             delete modifiedRow.modified;  // so as not to confuse the server 
             modifiedRows.push(modifiedRow);
          }
      }
      
      fetch('/updateitems', {
          method: 'PUT',   // Updates use PUT request
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(modifiedRows),
      })
      // When that completes, refresh everything
      .then( () => { this.refresh();} );
      
      
      
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
          // If anything has been changed we are yellow 
          if (rowInfo.original.modified) {
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
                  <Button onClick={this.onSaveChanges}>Save changes</Button>
                  <Button onClick={this.onDiscardChanges}>Discard changes</Button>
              </form>         
              <ReactTable minRows="1" data={data} columns={this.productColumns} getTrProps={this.getTrProps} defaultPageSize={20} className="-striped -highlight" />
              </div>
    );
  }
}

  
export function showProducts(orderNumber) {

    ReactDOM.render(<Products orderNumber={orderNumber} />, document.getElementById('root'));
}
  

window.showProducts = showProducts;

export default Products;
