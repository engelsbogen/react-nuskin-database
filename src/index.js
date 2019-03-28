import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Nuskin from 'Nuskin';
import * as serviceWorker from './serviceWorker';
import NuskinNavBar from 'NuskinNavBar';
import NuskinAlert from 'NuskinAlert';
import Report from 'Report';

// Get a reference to the main Nuskin component so that we can force
// it to refresh when the year is changed.
// This is not just a re-render, have to re-query as the database used
// will have changed.
// After the new data has been received the component will re-render itself

var appRef = React.createRef();

function refreshMainView() {
	appRef.current.refresh();
}

function showReport() {
   appRef.current.showReport();
}
function showOrders() {
	   appRef.current.showOrders();
}

class App extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = { showReport: false };
		
		this.reportRef = React.createRef();
		this.nuskinRef = React.createRef();
	}
	
	refresh() {
		if (this.state.showReport) {
			this.reportRef.current.getData();
		}
		else {
			this.nuskinRef.current.getData();
		}
		this.forceUpdate();
	}
	
	showReport() {
		this.setState( { showReport: true });
	}
	showOrders() {
		this.setState( { showReport: false });
	}
	
	render () {
		if (this.state.showReport) {
			return ( <Report ref={this.reportRef} /> );
		}
		else {
			return ( <Nuskin ref={this.nuskinRef} /> );
		}
	}
}


ReactDOM.render( <NuskinNavBar/>,     document.querySelector('nav')); 
ReactDOM.render( <App ref={appRef}/>, document.getElementById('root'));
ReactDOM.render( <NuskinAlert />,     document.getElementById('alert'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();


export { refreshMainView, showReport, showOrders };