import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Nuskin from 'Nuskin';
import * as serviceWorker from './serviceWorker';
import NuskinNavBar from 'NuskinNavBar';
import NuskinAlert from 'NuskinAlert';
//import App from 'Test';

var gYear = 2018;

var nuskinRef = React.createRef();

function refreshMainView() {
	
	nuskinRef.current.refresh();
}



ReactDOM.render( <NuskinNavBar/>, document.querySelector('nav')); 
///ReactDOM.render( <App />, document.getElementById('root'));
ReactDOM.render( <Nuskin ref={nuskinRef} />, document.getElementById('root'));
ReactDOM.render( <NuskinAlert />, document.getElementById('alert'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();


export { refreshMainView };