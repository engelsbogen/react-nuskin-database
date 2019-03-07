import React, { Component } from 'react';
import { Tab, Tabs, Form, FormGroup, FormControl, Control, ControlLabel, Checkbox, Button, ListGroup, ListGroupItem, InputGroup } from 'react-bootstrap'
import ReactTable from "react-table";
import 'react-table/react-table.css'
import './Nuskin.css';
import axios from "axios";
import Products from "Products";

class Nuskin extends Component {
   
  constructor(props) {

      super(props);

      // Bind methods to this instance
      this.onAddOrder = this.onAddOrder.bind(this);
      this.onFileSelected = this.onFileSelected.bind(this);
      this.onFileLoaded = this.onFileLoaded.bind(this);
      this.getTrProps = this.getTrProps.bind(this);
      this.subComponent = this.subComponent.bind(this);
      this.showResponse = this.showResponse.bind(this);

      this.selectedFile = null;
      
      const cadFormat = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'CAD' })
      
      this.orderColumns = [
        { expander: true},
        { Header: "Orders", 
           columns: [
              { Header: 'Order Number',     accessor: 'orderNumber',  style: { textAlign: "center" }, Cell: props => ( <a href={"/orderitems?orderNumber=" + props.value}>{props.value}</a> )}, 
              { Header: 'Date',             accessor: 'date',         style: { textAlign: "right"  },    },
              { Header: 'Account',          accessor: 'account',      style: { textAlign: "center" },    },
              { Header: 'Subtotal',         accessor: 'subtotal',     style: { textAlign: "right" }, Cell: props => cadFormat.format(props.value) },
              { Header: 'Tax',              accessor: 'tax',          style: { textAlign: "right" }, Cell: props => cadFormat.format(props.value) },
              { Header: 'Shipping',         accessor: 'shipping',     style: { textAlign: "right" }, Cell: props => cadFormat.format(props.value) },
              { Header: 'Shipping Address', accessor: 'shippingAddress',  },
           ]
        }
      ];

      this.state =  { data: null,
                      columns : this.orderColumns };
     
      
  }
      
     
  componentDidMount() {
      const ev = 1;
      
      fetch("/orders")
      .then( res => res.json())
      .then( (res) => {this.update(res) } );
      
  }

   
  update(res) {
      this.setState ({ data : res });
  }
  
  
  onFileLoaded(ev) {
      console.log("File loaded");
      
      // Do something with ev.target.result 
      // Post it to my application
      
      //axios.post("/orderfileupload", formData) // { file: ev.target.result} )
      axios.post("/orderfileupload", { file: ev.target.result} )
      .then(function (response) {
          console.log(response);
        })
      .catch(function (error) {
          console.log(error);
        });
      
  }
  

  
  showResponse(res) {
      console.log(res.data);
  }
  
  
  onAddOrder() {
      
      // Options: upload file, copy from clipboard, paste into edit box
      if (this.selectedFile != null) {
          if (window.confirm("Uploading order " + this.selectedFile.name)) {

              /*
              var reader = new FileReader();
              reader.onload = this.onFileLoaded;
              
              reader.readAsDataURL(this.selectedFile);
              */
    
              var formData = new FormData();
              formData.append('file', this.selectedFile);
              formData.append('name', 'thefilename');
              formData.append('description', 'anupload');
              
              axios.post("/orderfileupload", formData) // { file: ev.target.result} )
//              .then(res => res.json())
              .then(res => {
                      this.showResponse(res);
                    }
              );
          }
          
      }
      
  }
  
  onFileSelected(ev) {
      this.selectedFile = ev.target.files[0];
  }
  
  
  getTrProps(state, rowInfo) {
      
      // yellow "#EDF7A3"  green "#CEF7A3",
      
      if (rowInfo && rowInfo.original && !rowInfo.original.hasUnsoldItems) {
          return {
              style : { 
                backgroundColor: "#CEF7A3"
              },
            }
      }
      else {
          return {};
      }
      
  }
  
  
  subComponent(rowInfo) {
     if (rowInfo && rowInfo.row && rowInfo.row.orderNumber) { 
          return (
              <div style={{ padding: "20px" }}>
                  <Products orderNumber={rowInfo.row.orderNumber} /> 
             </div>);
     }
     else {
         return ({});
     }
      
  }
  
  render() {

      const data = this.state.data ? this.state.data : undefined;
   
      return (
          <div>
              <form style={{margin: '10px'}}>
              <input type="file" onChange={this.onFileSelected} />
              <Button onClick={this.onAddOrder}>Add Order</Button>
              </form>         
              <ReactTable data={data} 
                          columns={this.orderColumns} 
                          defaultPageSize={50} 
                          className="-striped -highlight" 
                          getTrProps={this.getTrProps} 
                          SubComponent = { row =>  {  return this.subComponent(row); } }
                  />
          </div>
    );
  }
}


  
export default Nuskin;
