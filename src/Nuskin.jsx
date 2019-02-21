import React, { Component } from 'react';
import { Tab, Tabs, Form, FormGroup, FormControl, Control, ControlLabel, Checkbox, Button, ListGroup, ListGroupItem, InputGroup } from 'react-bootstrap'
import ReactTable from "react-table";
import 'react-table/react-table.css'
import './Nuskin.css';

class Nuskin extends Component {
   
  constructor(props) {
      super(props);
      this.onGetOrdersClick = this.onGetOrdersClick.bind(this);
      this.onGetProductsClick = this.onGetProductsClick.bind(this);
      this.onSaveChanges = this.onSaveChanges.bind(this);
      this.renderEditable = this.renderEditable.bind(this);
      this.onEndUseChange = this.onEndUseChange.bind(this);
      this.onReceiptNumberChange = this.onReceiptNumberChange.bind(this);
      this.onCustomerNameChange = this.onCustomerNameChange.bind(this);
      this.onSellingPriceChange = this.onSellingPriceChange.bind(this);
      this.getTdProps = this.getTdProps.bind(this);
      
      const cadFormat = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'CAD' })
      
      this.orderColumns = [
        { Header: "Orders", 
           columns: [
              { Header: 'Order Number',     accessor: 'orderNumber',  Cell: props => ( <a href={"/orderitems?orderNumber=" + props.value}>{props.value}</a> )}, 
              { Header: 'Date',             accessor: 'date',             },
              { Header: 'Account',          accessor: 'account',          },
              { Header: 'Subtotal',         accessor: 'subtotal',         },
              { Header: 'Tax',              accessor: 'tax',      Cell: props => cadFormat.format(props.value) },
              { Header: 'Shipping',         accessor: 'shipping', Cell: props => cadFormat.format(props.value) },
              { Header: 'Shipping Address', accessor: 'shippingAddress',  },
           ]
        }
      ];

      this.productColumns = [
        { Header: "Products", 
          columns: [
             { Header: 'Order Number',     accessor: 'orderNumber',  style: { textAlign: "left" }  }, 
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
                      
                         if (props.index == 0) {
                             console.log(props.value);
                         }
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
                          <Form.Control defaultValue={props.value} onChange={ (ev)=> {this.onCustomerNameChange(ev, props.index)} }>
                          </Form.Control>
                          )
                  },
             { Header: 'Selling Price', 
               accessor: 'sellingPrice', 
                      Cell: (props) => (
                              <Form.Control defaultValue={props.value} onChange={ (ev)=> {this.onSellingPriceChange(ev, props.index)}} >
                              </Form.Control>
                              )
             },
             { Header: 'Receipt', 
               accessor: 'receiptNumber',
                  Cell: (props) => (
                     <Form.Control defaultValue={props.value != null ? props.value:undefined} onChange={ (ev)=> {this.onReceiptNumberChange(ev, props.index)}}   >
                     </Form.Control>
                     )
             }
         ]
        }
      ];

      this.state =  { data: null,
                      columns : this.orderColumns };
     
      
  }
      
     
  componentDidMount() {
      const ev = 1;
      this.onGetOrdersClick(ev);
  }
  

  onSaveChanges() {
     
  }

  onEndUseChange(ev, index) {
      
      console.log("End use change for row " + index + " to " + ev.target.value);
     
      var data = [...this.state.data];
      data[index].endUse = ev.target.value;
      var columns = [...this.productColumns];
      this.setState({ data, columns } );
      
      
      // Maybe Want to: 
      //  Enable/disable customer/selling price/receipt controls
      //  Enable SAVE button
      // Validate selling price, receipt, customer
      // Update database
  }
  
  onReceiptNumberChange(ev, index) {
      console.log("Receipt number changed for row " + index)
      var data = [...this.state.data];
      data[index].receiptNumber = ev.target.value;
      this.setState(data);
  }
  onCustomerNameChange(ev, index) {
      console.log("Customer name changed for row " + index)
  }
  onSellingPriceChange(ev, index) {
      console.log("Selling price changed for row " + index)
  }

  
  renderEditable(cellInfo) {
      const cadFormat = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'CAD' })

      return (
        <div
          style={{ backgroundColor: "#fafafa" }}
          contentEditable
          suppressContentEditableWarning
          onBlur={e => {
            const data = [...this.state.data];
            data[cellInfo.index][cellInfo.column.id] = e.target.innerHTML;
            this.setState({ data });
          }}
          dangerouslySetInnerHTML={{
            __html: cadFormat.format(this.state.data[cellInfo.index][cellInfo.column.id])
          }}
        />
      );
    }
  
    
  onGetOrdersClick(ev) {
      console.log("form onSubmit");

      this.setState ({columns : [...this.orderColumns] });

      
      fetch("/orders")
      .then( res => res.json())
      .then( (res) => {this.update(res) } );
     
      
  }
  
  onGetProductsClick(orderNumber) {
      this.setState ({columns : [...this.productColumns] });
      
      fetch("/products?orderNumber=" + orderNumber)
      .then( res => res.json())
      .then( (res) => {this.update(res) } );
      
  }
    
  update(res) {
      this.setState ({ data : res });
  }
  
  
  getTdProps(state, rowInfo, column, instance) {
      
      return {
          onDoubleClick: (e, handleOriginal) => {
              
            if (column.id == 'orderNumber') {
                console.log("Order number " + rowInfo.row.orderNumber + "was clicked");
                
                this.onGetProductsClick(rowInfo.row.orderNumber);
                
            }
  

            // IMPORTANT! React-Table uses onClick internally to trigger
            // events like expanding SubComponents and pivots.
            // By default a custom 'onClick' handler will override this functionality.
            // If you want to fire the original onClick handler, call the
            // 'handleOriginal' function.
            if (handleOriginal) {
              handleOriginal();
            }
          }
      }
  }
  
  render() {

      const data = this.state.data ? this.state.data : undefined;
      const columns = this.state.columns;
      
      return (
          <div>
              <form style={{margin: '10px'}}>
                  <Button onClick={this.onGetOrdersClick}>Orders</Button>
                  <Button onClick={this.onSaveChanges}>Save changes</Button>
              </form>
              <ReactTable data={data} columns={columns} defaultPageSize={10} className="-striped -highlight" 
                          getTdProps={this.getTdProps} />
          </div>
    );
  }
}


  
export default Nuskin;
