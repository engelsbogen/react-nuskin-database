import React, { Component } from 'react';
//import logo from './logo.svg';
import './Nuskin.css';
import App from 'App';
import { Tab, Tabs, FormGroup, FormControl, ControlLabel, Checkbox, Button, ListGroup, ListGroupItem, InputGroup } from 'react-bootstrap'
import ReactTable from "react-table";
import 'react-table/react-table.css'

class Nuskin extends Component {
   
  constructor(props) {
      super(props);
      this.onGetOrdersClick = this.onGetOrdersClick.bind(this);
      this.onGetProductsClick = this.onGetProductsClick.bind(this);
      this.renderEditable = this.renderEditable.bind(this);
      this.handleDelete = this.handleDelete.bind(this);
      this.handleEdit = this.handleEdit.bind(this);
      const cadFormat = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'CAD' })
      
      
      this.orderColumns = [
        { Header: "Orders", 
           columns: [
              { Header: 'Order Number',     accessor: 'orderNumber',      }, 
              { Header: 'Date',             accessor: 'date',             },
              { Header: 'Account',          accessor: 'account',          },
              { Header: 'Subtotal',         accessor: 'subtotal', Cell: this.renderEditable },
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
             { Header: '',
                 Cell: row => (
                     <div>
                         <button onClick={() => handleEdit(row.original)}>Edit</button>
                         <button onClick={() => handleDelete(row.original)}>Delete</button>
                     </div>
                 )
              }
          ]}
      ];

      this.columns = this.orderColumns;
      
      const ev = 1;
      this.onGetOrdersClick(ev);
      
      
      
  }
  
  handleDelete(){
      
  }
  handleEdit(){
      
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

      this.columns = this.orderColumns;
      
      fetch("/orders")
      .then( res => res.json())
      .then( (res) => {this.update(res) } );
      
      
  }
  
  onGetProductsClick(ev) {
      this.columns = this.productColumns;
      
      fetch("/products")
      .then( res => res.json())
      .then( (res) => {this.update(res) } );
      
  }
    
  update(res) {
      this.setState ({ data : res });
  }
  
  
  render() {

      const data = this.state ? this.state.data : undefined;
      
      return (
              <div>
              <form style={{margin: '10px'}}>
              <FormGroup>
                 <InputGroup>
                    <InputGroup.Prepend>Orders</InputGroup.Prepend>
                    <Button onClick={this.onGetOrdersClick}>Get Orders</Button>
                </InputGroup>
                    <InputGroup>
                    <InputGroup.Prepend>Products</InputGroup.Prepend>
                    <Button onClick={this.onGetProductsClick}>Get Products</Button>
                </InputGroup>
             </FormGroup>
           </form>         
              <ReactTable data={data} columns={this.columns} defaultPageSize={10} className="-striped -highlight"  />
              </div>
    );
  }
}


export default Nuskin;
