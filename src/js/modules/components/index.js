// Charts - React.js
import React, { useState, Component, Fragment } from "react";
import { render } from "react-dom";
import { Charts } from './chart';
import { Map } from './map';

const classNames = require('classnames');

// Map Position
const center = {
  lat: ( typeof( wad ) != "undefined" && 'googleLat' in wad ) ? parseFloat( wad.googleLat ) : 0.0,
	lng: ( typeof( wad ) != "undefined" && 'googleLng' in wad ) ? parseFloat( wad.googleLng ) : 0.0
};
const zoom = ( window.innerWidth < 1200 ) ? 4 : 5;

function App() {
  return <>
    <Map center={ center } zoom={ zoom } /><Charts />
  </>;
}

document.addEventListener("DOMContentLoaded", function(event) { 
  if( document.getElementsByClassName('page-template-wave-display-react').length ) {
    render( <App />, document.getElementById( "root" ) );
  }
} );