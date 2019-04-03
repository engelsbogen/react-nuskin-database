import React, { Component } from 'react'; 
import { Button, Form, Table, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'
import axios from "axios";
import PeriodSelector from 'PeriodSelector'
import {TableHeader} from 'TableHeader'

class CommissionView extends React.Component {
    
    constructor(props) {
        super(props);
        this.getData = this.getData.bind(this);
        this.onChoosePeriod = this.onChoosePeriod.bind(this);
        this.period = 'year';
        this.data = { period: 'year to date'};
    }
    
    onChoosePeriod(period) {
        console.log(period);
        this.period = period;
        this.getData();
    }
    
    getData() {
        
        
    }
    
    render() {
        
        return (<Form style={{margin: '10px'}}>
                
                
                <PeriodSelector onChange={this.onChoosePeriod} />
                
                <Table striped bordered hover>
                    <TableHeader headings={["Summary Commission for " + this.data.period] } />
                    <tbody><tr><td>
                    </td></tr></tbody>
                </Table>

                </Form> 
               );
   }
    
}

export default CommissionView;
