import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Nuskin from 'Nuskin';
import * as serviceWorker from './serviceWorker';
import NuskinNavBar from 'NuskinNavBar';
import NuskinAlert from 'NuskinAlert';

// Get a reference to the main Nuskin component so that we can force
// it to refresh when the year is changed.
// This is not just a re-render, have to re-query as the database used
// will have changed.
// After the new data has been received the component will re-render itself
var nuskinRef = React.createRef();

function refreshMainView() {
	nuskinRef.current.refresh();
}


ReactDOM.render( <NuskinNavBar/>, document.querySelector('nav')); 
ReactDOM.render( <Nuskin ref={nuskinRef} />, document.getElementById('root'));
ReactDOM.render( <NuskinAlert />, document.getElementById('alert'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();


export { refreshMainView };