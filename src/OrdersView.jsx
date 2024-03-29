import React, { Component } from 'react';
import { Button } from 'react-bootstrap'
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

class OrdersView extends Component {
   
  constructor(props) {

      super(props);

      // Bind methods to this instance
      this.onAddOrder = this.onAddOrder.bind(this);
      this.onFileSelected = this.onFileSelected.bind(this);
      this.getTrProps = this.getTrProps.bind(this);
      this.subComponent = this.subComponent.bind(this);
      this.onHideDialog = this.onHideDialog.bind(this);
      this.handleShow = this.handleShow.bind(this);
      this.getData = this.getData.bind(this);
      this.getTotal = this.getTotal.bind(this);
      this.makeOrderColumns = this.makeOrderColumns.bind(this);

      this.doNextUpload = this.doNextUpload.bind(this);
      this.handleFileUploadResponse = this.handleFileUploadResponse.bind(this);
      this.handleUploadError = this.handleUploadError.bind(this);

      this.onDeleteOrder = this.onDeleteOrder.bind(this);
      this.handleDeleteResponse = this.handleDeleteReponse.bind(this);
      this.handleDeleteError = this.handleDeleteError.bind(this);
      this.doDeleteOrder = this.doDeleteOrder.bind(this);

      this.handleOrderTextChange = this.handleOrderTextChange.bind(this);
      this.doTextUpload = this.doTextUpload.bind(this);
      this.handleTextUploadResponse = this.handleTextUploadResponse.bind(this);
      
      // Data members 
      this.selectedFile = null;
      this.textUpload = false;
      this.nextUploadIndex  = 0;
      this.makeOrderColumns();
      this.state =  { data: null,
                      columns : this.orderColumns,
                      newSKUs: null,
                      showNewSKUs : false, 
                      orderText: ""};
      this.orderText = null;
      
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
                  Cell: props=>(
                      <div>
                      <p>
                      <strong>In stock:&nbsp;</strong>
                      { this.state.data[props.index].itemSummary}
                      </p>
                      <p>
                      <strong>Disposed:&nbsp;</strong>
                      { this.state.data[props.index].disposedItemSummary}
                      </p>
                      <p><u>Customers</u></p>
                      {this.state.data[props.index].soldItemsPerCustomer.map( (text, index) => ( <p key={index} ><strong>{text.name}:</strong> {text.desc}</p>))  }
                      </div>
                  
                  ),
                  
                  Aggregated: ()=> { return  (<span/>); },  // Empty in aggregated row
                  // React-table cells are set to {white-space: nowrap}. To allow wrapping in one cell, unset this style
                  // For react we have to change to whiteSpace
                  style: { 'whiteSpace': 'unset'} },
              { Header: 'Actions', 
                      width: 150,
                      Cell: props=>( 
                              <span>
                                 <Button onClick={()=> {this.onDeleteOrder(props.index)}}>Delete</Button>
                              </span> 
                            ),
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
  
  handleFileUploadResponse(res) {
      var itemsUnknown = res.data && res.data.unknownItems.length > 0;
         
      // If the were no problems, do the next upload or refresh the table
      if (!itemsUnknown) {
          
          NuskinAlert.showAlert("Order file " + this.selectedFile[this.nextUploadIndex].name + " uploaded successfully");

          this.nextUploadIndex++;
          if (this.nextUploadIndex < this.selectedFile.length) {
              this.doNextUpload();
          }
          else {
              this.setState ( { newSKUs: [], showNewSKUs: false } );
              this.getData();
          }
      }
      else {
          this.setState( { newSKUs: res.data.unknownItems, showNewSKUs: true } );
      }
      
  }

  handleTextUploadResponse(res) {
      var itemsUnknown = res.data && res.data.unknownItems.length > 0;
         
      // If the were no problems, refresh the table
      if (!itemsUnknown) {
          
          NuskinAlert.showAlert("Order text uploaded successfully");

          this.textUpload = false;
          this.setState ( { newSKUs: [], showNewSKUs: false, orderText: "" } );
          this.getData();
          
      }
      else {
          this.setState( { newSKUs: res.data.unknownItems, showNewSKUs: true } );
      }
      
  }

  
  onHideDialog(skusUpdated) {
      
      this.setState({ newSKUs: [], showNewSKUs: false});
      
      if (skusUpdated) {
          // Retry sending the order
          if (this.textUpload) {
              this.doTextUpload();
          }
          else {
              this.doNextUpload();
          }
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
          .then(res => { this.handleFileUploadResponse(res); })
          .catch( err=> { this.handleUploadError(err); });
      
  }
  
  handleOrderTextChange(event) {
      this.setState( { orderText: event.target.value} );
  }
  
  
  doTextUpload() {
      
      if (this.state.orderText != null)
      {
          this.textUpload = true;
          // Upload text 
          axios.post("/ordertextupload",
                     this.state.orderText, 
                     {headers: {"Content-Type": "text/plain"}} )
          .then(res => { 
              this.handleTextUploadResponse(res); 
          })
          .catch( err=> { this.textUpload=false;
                          this.handleUploadError(err); });
      }

  }
  
  onAddOrder(askConfirmation) {
      
      if (this.selectedFile != null) {
          // Order printed to PDF file. No longer works as Nuskin changed the way
          // they print. 
          if ( !askConfirmation || window.confirm("Uploading orders ")) {
              this.nextUploadIndex = 0;
              this.doNextUpload();
          }  
      }
      else {
         // Upload order text cut and pasted into the text area
         this.doTextUpload();
      }
      
  }

  
  doDeleteOrder(index) {
      
      axios.delete("/deleteorder?orderNumber=" + this.state.data[index].orderNumber )
      .then( (res) => this.handleDeleteResponse(res))
      .catch( (res) => this.handleDeleteError(res));
      
  }
  
  onDeleteOrder(index) {
      
      // If the order has any products marked as anything other than "in stock", double-check 
      // with the user before going ahead
      var order = this.state.data[index];
      
      // Add an extra field in t
      if (order.hasOnlyInStockItems == false) {
          NuskinAlert.showConfirm("Order has items already assigned, continue?")
          .then((res) => {
              console.log("confirm result = " + res);
              if (res == 0) {
                  this.doDeleteOrder(index);
              }
           } );
      }
      else {
          this.doDeleteOrder(index);
      }
  }

  handleDeleteReponse(res) {
      this.getData();
  }
  
  handleDeleteError(response) {
      NuskinAlert.showAlert("Error deleting order: " + response);
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
              <div style={{  borderStyle: "solid",
                             borderWidth: "2px",
                             borderColor: "dodgerblue",
                             borderRadius: "30px",
                             backgroundColor: "lightcyan",
                             marginLeft: "20px",
                             marginRight: "20px",
                             padding: "20px" }}>
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
              <div style={{ width: 400}} >
                <textarea  onChange={this.handleOrderTextChange} value={this.state.orderText} ></textarea>
              </div>
              <Button onClick={() => {this.onAddOrder(false);} }>Upload Orders</Button>
           
              </form>         
              <ReactTable data={data} 
                          columns={this.orderColumns} 
                          pivotBy={["month"]} 
                          defaultPageSize={50} 
                          minRows="1"
                          className="-striped -highlight" 
                          getTrProps={this.getTrProps} 
                          SubComponent = { row =>  {  return this.subComponent(row); } }
                          defaultSorted={[ {id: 'month',  desc: false }]}    
                  />
           </>
          );
  }
}

  
export default OrdersView;
