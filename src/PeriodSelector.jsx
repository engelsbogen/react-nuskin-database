import React, { Component } from 'react'; 
import { ToggleButton, ToggleButtonGroup } from 'react-bootstrap'

class PeriodSelector extends React.Component {

    constructor(props) {
        super(props);
        this.months = ['Jan', 'Feb', 'Mar', 'Apr', 'May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        this.period='year';
    }
    
    render() {
        return(
          <ToggleButtonGroup type="radio" name="period" defaultValue={ 'year' }  onChange={this.props.onChange} > 
             <ToggleButton key={'year'} variant="outline-primary" value={'year'} >Year to Date</ToggleButton>
             {this.months.map( (month) => ( <ToggleButton key={month} variant="outline-primary" value={month} >{month}</ToggleButton>))  }
          </ToggleButtonGroup>
        );
    }
    
}
    
export default PeriodSelector;