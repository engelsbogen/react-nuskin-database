import React,  { Component } from 'react';
import ReactTable from "react-table";
import 'react-table/react-table.css';
import { Modal, Button } from 'react-bootstrap'
import "./index.css";
import CurrencyInput from 'react-currency-input';
import axios from "axios";

class NewSKUs extends Component {
    
    constructor(props) {
        
        // Constructor called once only
        super(props);

        // Bind methods
        this.handleClose = this.handleClose.bind(this);
        this.onSave = this.onSave.bind(this);
        this.onRetailPriceChange = this.onRetailPriceChange.bind(this);
        this.onWholesalePriceChange = this.onWholesalePriceChange.bind(this);
        this.onPsvChange = this.onPsvChange.bind(this);
        this.onCsvChange = this.onCsvChange.bind(this);
        this.getTrProps = this.getTrProps.bind(this);
 
        const cadFormat = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'CAD' })

        this.productColumns = [
                               { Header: "Please provide information", 
                                 columns: [
                                    { Header: 'SKU',              accessor: 'sku',            style: { textAlign: "center" }  }, 
                                    { Header: 'Description',      accessor: 'description',    style: { textAlign: "left" }  }, 
                                    { Header: 'PSV',  accessor: 'psv',   style: { textAlign: "right" },
                                    }, 
                                    { Header: 'Wholesale Price',  accessor: 'wholesalePrice', style: { textAlign: "right" }, 
                                        
                                        Cell: (props) => (
                                                <div>$
                                                <CurrencyInput value={props.value != null ? props.value:undefined} onChangeEvent={ (ev)=> {this.onWholesalePriceChange(ev, props.index)}}>
                                                </CurrencyInput>
                                                </div>
                                                )
                                     },
                                    { Header: 'Retail Price',     accessor: 'retailPrice',    style: { textAlign: "right" },
                                         Cell: (props) => (
                                                 <div>$
                                                 <CurrencyInput value={props.original.retailPrice != null ? props.original.retailPrice : undefined} onChangeEvent={ (ev)=> {this.onRetailPriceChange(ev, props.index)}}>
                                                 </CurrencyInput>
                                                 </div>
                                                 )
                                        }, 
                                  ]
                               }];
        
        
        this.state = { forceUpdate: 1 };
        
        this.skus = [];

    }
    
    
    handleSaved(result) {
        this.skus = [];  // Get rid of old data
        this.props.onHide(true);  // SKUs have been updated
    }
    
    handleClose() { 
        this.skus = [];  // Get rid of old data
        this.props.onHide(false);  // SKUs not updated
    }

    onSave() {

        // Validate 
        var anError = false;
        
        for (var sku of this.skus) {
            // TODO show the user whats wrong - just highlighting invalid rows isn't that helpful  
            sku.error = false;
            if (sku.retailPrice == null || sku.psv == null ) {
                sku.error = true;
                anError = true;
            }
            
            // Make sure retail price is at least the wholesale price. 
            // Some specials are not available at retail price, but 
            if (sku.retailPrice  < sku.wholesalePrice) {
                sku.error = true;
                anError = true;
            }
            
            // What can we say about PSV? Its about 1 PSV per 1 USD so it should be around 1/1.3 of the wholesale? price
            // But sometimes there are special offers, eg Galvanic SPA kit at $248 with a PSV of 250, so can't really test anything
            // The PSV is always known from the order so don't need to check it really
            //if (sku.psv > sku.wholesalePrice) {
            //    sku.error = true;
            //    anError = true;
            //}
            
        }
        
        if (anError) {
            this.setState( { forceUpdate: this.state.forceUpdate + 1});
            return;
        }
        
        // If all info provided, send to server
  
        axios.put('/createskus', this.skus)
             .then( (res) => {this.handleSaved(res.data); } );
        
    }
    
    onRetailPriceChange(ev, index) {
        this.skus[index].modified = true;
        this.skus[index].retailPrice = ev.target.value;
    }

    onWholesalePriceChange(ev,index) {
        this.skus[index].modified = true;
        this.skus[index].wholesalePrice = ev.target.value;
    }

    onPsvChange(ev,index) {
        this.skus[index].modified = true;
        this.skus[index].psv = ev.target.value;
    }

    onCsvChange(ev,index) {
        this.skus[index].modified = true;
        this.skus[index].csv = ev.target.value;
    }
    
    
    getTrProps(state, rowInfo) {
        
        // yellow "#EDF7A3"  green "#CEF7A3",
        var retval = {};
        
        if (rowInfo && rowInfo.row ) {
            // If an error was detected change the background colour 
            if (rowInfo.original.error) {
                var bkcolor = " #f1948a";
                retval = { style : { backgroundColor: bkcolor  } }
            }
        }

        return retval;

    }
    
    
    render() {

        // SKU (ProductType) has the following fields:
        // sku, description, retailPrice, wholesalePrice, psv, csv
        
        if (this.skus.length == 0) {
        
            if (this.props.data) {
                for (var i=0; i< this.props.data.length; i++) {
                
                    var item = this.props.data[i];
                
                    var sku = { sku: item.sku,
                                description: item.description,
                                wholesalePrice: item.costPrice,
                                retailPrice: null,
                                psv: item.costPoints,
                                csv: 0,
                                modified: false,
                                error: false };
                
                    this.skus.push(sku);
                }
            }
        }
        
        
        if (this.props.show && this.skus.length == 0) {
            console.log("What? show zero items?");
        }
        
        return (<div>
                 <Modal show={this.props.show} onHide={this.handleClose}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                  >
                  <Modal.Header closeButton>
                    <Modal.Title>New SKUs found on order {this.props.filename}</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <p>One or more SKUs on this order are not in the database. Please provide additional
                       information
                       The order cost price is assumed to be the wholesale price.
                       To calculate tax on individual items on orders on DISTRIBUTOR accounts 
                       it is also necessary to know the retail price.
                       PSV is shown for information
                    </p>
                    <Button onClick={this.onSave} >Save</Button>
                    <ReactTable minRows="1" data={this.skus} columns={this.productColumns} getTrProps={this.getTrProps} />
                  </Modal.Body>
              </Modal>
              </div>
        );
        
    }
}

export default NewSKUs;