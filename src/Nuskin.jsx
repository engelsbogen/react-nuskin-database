import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Modal, Tab, Tabs, Form, FormGroup, FormControl, Control, ControlLabel, Checkbox, Button, ListGroup, ListGroupItem, InputGroup } from 'react-bootstrap'
import ReactTable from "react-table";
import 'react-table/react-table.css'
import './Nuskin.css';
import './index.css';
import axios from "axios";
import Products from "Products";
import NewSKUs from "NewSKUs";
import NuskinAlert from "NuskinAlert";
import _ from "lodash";


var lodash = _;

const cadFormat = new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' })

class Nuskin extends Component {
   
  constructor(props) {

      super(props);

      // Bind methods to this instance
      this.onAddOrder = this.onAddOrder.bind(this);
      this.onFileSelected = this.onFileSelected.bind(this);
      this.getTrProps = this.getTrProps.bind(this);
      this.subComponent = this.subComponent.bind(this);
      this.showResponse = this.showResponse.bind(this);
      this.onHideDialog = this.onHideDialog.bind(this);
      this.handleShow = this.handleShow.bind(this);
      this.handleUploadError = this.handleUploadError.bind(this);
      this.getData = this.getData.bind(this);
      this.doNextUpload = this.doNextUpload.bind(this);
      this.getTotal = this.getTotal.bind(this);
      this.makeOrderColumns = this.makeOrderColumns.bind(this);

      // Data members 
      this.selectedFile = null;
      this.nextUploadIndex  = 0;
      this.makeOrderColumns();
      this.state =  { data: null,
                      columns : this.orderColumns,
                      newSKUs: null,
                      showNewSKUs : false };
      
  }
  
  

  
  makeOrderColumns() {
      
      this.orderColumns = [
        { expander: true},
        { Header: "Orders", 
           columns: [
              { Header: 'Month',         width: 120,  accessor: 'month',        style: { textAlign: "left" } }, 
              { Header: 'Order Number',  
                  Aggregated: ()=> { return  (<span/>); },  // Empty in aggregated row
                  width: 100,  accessor: 'orderNumber',  style: { textAlign: "center" }, Cell: props => ( <a href={"/orderfiledownload?orderNumber=" + props.value}>{props.value}</a> )}, 
              { Header: 'Date',
                  Aggregated: ()=> { return  (<span/>); },  // Empty in aggregated row
                  width: 100,  accessor: 'date',         style: { textAlign: "right"  },    },
              { Header: 'Account',       width: 120, 
                  id: 'accountDetails',
                  Aggregated: ()=> { return  (<span/>); },  // Empty in aggregated row
                  accessor: 
                      d => d.account + "\n" + d.accountName,     
                  style: { textAlign: "center", whiteSpace: 'unset' },    },
              { Header: 'Total',         width: 100,
                  id : 'total',
                  // Aggregated row sums the total orders for the month
                  aggregate: vals => lodash.sum(vals),
             
                  accessor: d => d.subtotal + d.tax + d.shipping,   
                  
                  Footer: (
                          <span>
                            <strong>
                            { this.getTotal()}
                            </strong>
                          </span>
                        ),
       
                  style: { textAlign: "right" }, 
                  Cell: props => cadFormat.format(props.value) },
              { Header: 'Item Summary', accessor: 'itemSummary',
                  Aggregated: ()=> { return  (<span/>); },  // Empty in aggregated row
                  // React-table cells are set to {white-space: nowrap}. To allow wrapping in one cell, unset this style
                  // For react we have to change to whiteSpace
                  style: { 'whiteSpace': 'unset'} },
           ]
        }
        
      ];

      return this.orderColumns;
  }
    

  getTotal() {
      if (this.state && this.state.data) {
          var yearTotal = lodash.sum(lodash.map(this.state.data, d => d.subtotal + d.tax + d.shipping));
          
          // Format as currency
          return cadFormat.format(yearTotal);
      }
      else {
          return 0;
      }
  }
     
  componentDidMount() {
      this.getData();
  }
  
  getData() {
     axios.get("/orders")
      .then( (res) => {this.update(res) } );
  }
   
  update(res) {
      
      if (res.headers['content-type'].startsWith("application/json")) {
          this.setState ({ data : res.data });
      }
  }
  
  showResponse(res) {
      var showDialog = res.data && res.data.unknownItems.length > 0;
         
      // If the were no problems, refresh the table
      if (!showDialog) {
          
          NuskinAlert.showAlert("Order file " + this.selectedFile[this.nextUploadIndex].name + " uploaded successfully");

          this.nextUploadIndex++;
          if (this.nextUploadIndex < this.selectedFile.length) {
              this.doNextUpload();
          }
          else {
              this.setState ( { newSKUs: [], showNewSKUs: false } );
              this.refresh();
          }
      }
      else {
          this.setState( { newSKUs: res.data.unknownItems, showNewSKUs: true } );
      }
      
  }
  
  onHideDialog(skusUpdated) {
      
      this.setState({ newSKUs: [], showNewSKUs: false});
      
      if (skusUpdated) {
          // Retry sending the order
          this.doNextUpload();
      }
      
  }
  
  handleShow() {
      this.setState( { showNewSKUs:true});
  }
  
  // Called if an error code is returned from the server after uploading a file
  handleUploadError(err) {
      NuskinAlert.showAlert(err.response.data.message);
  }
  
  doNextUpload() {
      
      var formData = new FormData();
      formData.append("file", this.selectedFile[this.nextUploadIndex]);
      formData.append('name', 'thefilename');
      formData.append('description', 'anupload');
      axios.post("/orderfileupload", formData) 
          .then(res => { this.showResponse(res); })
          .catch( err=> { this.handleUploadError(err); });
      
  }
  
  onAddOrder(askConfirmation) {
      
      if (this.selectedFile != null) {
          if ( !askConfirmation || window.confirm("Uploading orders ")) {

              this.nextUploadIndex = 0;
              
              this.doNextUpload();
          }  
      }
  }
  
  onFileSelected(ev) {
      this.selectedFile = ev.target.files;
  }
  
  getTrProps(state, rowInfo) {
      
      // Colour order green if all its items have been accounted for, ie sold, given away as sample, 
      // used for demonstration or for personal use 
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
  
  // Individual order details are a subcomponent of order summary row
  subComponent(rowInfo) {
     if (rowInfo && rowInfo.row && rowInfo.row.orderNumber) { 
          return (
              <div style={{ padding: "20px" }}>
                  <Products orderDetails={rowInfo.original} /> 
             </div>);
     }
     else {
         return ({});
     }
      
  }
  
  render() {

      const data = this.state.data ? this.state.data : undefined;
    
      var orderFilename = "";
      if (this.selectedFile && this.nextUploadIndex < this.selectedFile.length) {
          orderFilename = this.selectedFile[this.nextUploadIndex].name;
      }
      
      this.makeOrderColumns();
      
      return  (
           <>      
              <NewSKUs filename={ orderFilename } data={this.state.newSKUs} show={ this.state.showNewSKUs } onHide={this.onHideDialog} /> 
              <form style={{margin: '10px'}}>
              <div className="file btn btn-primary"><input type="file" multiple onChange={this.onFileSelected} /></div>
              <Button onClick={() => {this.onAddOrder(true);} }>Upload Orders</Button>
           
              </form>         
              <ReactTable data={data} 
                          columns={this.orderColumns} 
                          pivotBy={["month"]} 
                          defaultPageSize={50} 
                          minRows="1"
                          className="-striped -highlight" 
                          getTrProps={this.getTrProps} 
                          SubComponent = { row =>  {  return this.subComponent(row); } }
                  />
           </>
          );
  }
}

  
export default Nuskin;
