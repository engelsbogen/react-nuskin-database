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
      this.onHideDialog = this.onHideDialog.bind(this);
      this.handleShow = this.handleShow.bind(this);
      this.handleUploadError = this.handleUploadError.bind(this);
      this.refresh = this.refresh.bind(this);
      
      this.selectedFile = null;
      
      const cadFormat = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'CAD' })
      
      this.orderColumns = [
        { expander: true},
        { Header: "Orders", 
           columns: [
              { Header: 'Order Number',  width: 100,   accessor: 'orderNumber',  style: { textAlign: "center" }, Cell: props => ( <a href={"/orderfiledownload?orderNumber=" + props.value}>{props.value}</a> )}, 
              { Header: 'Date',          width: 100,    accessor: 'date',         style: { textAlign: "right"  },    },
              { Header: 'Account',       width: 100,   accessor: 'account',      style: { textAlign: "center" },    },
              { Header: 'Total',         width: 100,
                  id : 'total',
                  accessor: d => d.subtotal + d.tax + d.shipping,     
                  style: { textAlign: "right" }, 
                  Cell: props => cadFormat.format(props.value) },
              { Header: 'Item Summary', accessor: 'itemSummary',  },
           ]
        }
      ];

      this.state =  { data: null,
                      columns : this.orderColumns,
                      newSKUs: null,
                      show : false };
      
  }
      
     
  componentDidMount() {
      this.refresh();
  }
  
  refresh() {
      fetch("/orders")
      .then( res => res.json())
      .then( (res) => {this.update(res) } );
  }

   
  update(res) {
      this.setState ({ data : res });
  }
  
  
  onFileLoaded(ev) {
      console.log("File loaded");
      
      axios.post("/orderfileupload", { file: ev.target.result} )
      .then(function (response) {
          console.log(response);
        })
      .catch(function (error) {
          console.log(error);
        });
  }
  

  
  showResponse(res) {
      var showDialog = res.data && res.data.length > 0;
         
      // If the were no problems, refresh the table
      if (!showDialog) {
          NuskinAlert.showAlert("Order file uploaded successfully");
          this.refresh();
      }
      else {
          this.setState( { newSKUs: res.data, show: true } );
      }
      
  }
  
  onHideDialog(skusUpdated) {
      
      this.setState({show: false});
      
      if (skusUpdated) {
          // Retry sending the order
          this.onAddOrder(false);
      }
      
  }
  
  handleShow() {
      this.setState( { show:true});
  }
  
  handleUploadError(err) {

      NuskinAlert.showAlert(err.response.data.message);
  }
  
  onAddOrder(askConfirmation) {
      
      // Options: upload file, copy from clipboard, paste into edit box
      if (this.selectedFile != null) {
          if ( !askConfirmation || window.confirm("Uploading order " + this.selectedFile.name)) {

              var formData = new FormData();
              formData.append('file', this.selectedFile);
              formData.append('name', 'thefilename');
              formData.append('description', 'anupload');
              
              axios.post("/orderfileupload", formData) 
              .then(res => { this.showResponse(res);  })
              .catch( err=> { this.handleUploadError(err); });
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
                  <Products orderDetails={rowInfo.original} /> 
             </div>);
     }
     else {
         return ({});
     }
      
  }
  
  render() {

      const data = this.state.data ? this.state.data : undefined;
    
      var show = (this.state.newSKUs && this.state.newSKUs.length > 0);

      return  (
           <>      
              <NewSKUs data={this.state.newSKUs} show={ this.state.show } onHide={this.onHideDialog} /> 
              <form style={{margin: '10px'}}>
              <div className="file btn btn-primary"><input type="file" onChange={this.onFileSelected} /></div>
              <Button onClick={() => {this.onAddOrder(true);} }>Add Order</Button>
           
              </form>         
              <ReactTable data={data} 
                          columns={this.orderColumns} 
                          defaultPageSize={50} 
                          className="-striped -highlight" 
                          getTrProps={this.getTrProps} 
                          SubComponent = { row =>  {  return this.subComponent(row); } }
                  />
           </>
          );
  }
}


  
export default Nuskin;
