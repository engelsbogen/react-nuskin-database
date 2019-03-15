import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import Nuskin from 'Nuskin';
import * as serviceWorker from './serviceWorker';
import NuskinNavBar from 'NuskinNavBar';
import NuskinAlert from 'NuskinAlert';

ReactDOM.render( <NuskinNavBar/>, document.querySelector('nav')); 
ReactDOM.render( <Nuskin />, document.getElementById('root'));
ReactDOM.render( <NuskinAlert />, document.getElementById('alert'));


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
