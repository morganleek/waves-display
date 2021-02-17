import $ from 'jquery';
import { wadFetchBuoys } from './buoy-data';

// Charts
let chartsArray = []; // , dataPointsArray = [];

$( function() {
  if( document.getElementsByClassName('page-template---templateswave-display-list-php').length ) {
    // Fetch list of buoys
    wadFetchBuoys();
  }
});

//
// React
//
import React, { useState, Component } from "react";
import { render } from "react-dom";
import { wadRawDataToChartData } from './buoy-data';

const classNames = require('classnames');

function Map( props ) {
  return ( 
    <div className="Map">
      <h1>Map</h1>  
    </div> 
  );
}

class Charts extends Component {
  // On load
  // getBuoys().then( json => {
  //  console.log( json );
  //  for each json into BuoyChart
  // } );
  constructor( props ) {
    super( props );
    
    this.state = {
      buoys: [],
    }
  }

  componentDidMount() {
    getBuoys().then( json => {
      this.setState( {
        buoys: json
      } );
      // console.log( this.state.buoys );
    } );
  }

  render() {
    const { buoys } = this.state;
    let buoysList;
    if( buoys.length > 0 ) {
      buoysList = <ChartsList buoyData={ buoys } />
    }

    return (
      <div className="Charts">
        { buoysList }
      </div>
    );
  }
}
const ChartsList = ( props ) => {
  // Interate through buoys
  let chartsListRender = props.buoyData.map( ( row, index ) => {    
    return (
      <div className={ classNames( ['panel', 'panel-primary'] ) } key={ index }>
        <div className={ classNames( ['panel-heading', 'clearfix'] ) }>
          <h5>{ row.label }</h5>
        </div>
        <div className='panel-body'> 
          <div className='chart-js-menu'>Buttons</div>
          <Chart buoyId={ row.id } />
          <div className='chart-info'>Chart Info</div>
        </div>
      </div>
    )
  } );

  return <div>{ chartsListRender }</div>
}

class Chart extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      data: [],
    }

  }
  
  componentDidMount() {
    getBuoy( this.props.buoyId ).then( json => {
      if( json.success == 1 ) {
        this.setState( {
          data: wadRawDataToChartData( json.data )
        } );
      }      
    } );
  }
  
  render() {
    return (
      <div className={ classNames( ['canvas-wrapper', 'loading'] ) }>
        <canvas></canvas>
      </div>
    );
  }
}

function getBuoys() {
  if( typeof( wad ) != "undefined" ) {
    const init = {
      method: 'POST'
    }
    return fetch( wad.ajax + "?action=waf_rest_list_buoys", init ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        // console.log( response );
        return response.json();
      } )
      .then( json => json );
  }
}

function getBuoy( buoyId ) {
  if( typeof( wad ) != "undefined" ) {
    const init = {
      method: 'POST'
    }
    return fetch( wad.ajax + "?action=waf_rest_list_buoy_datapoints&id=" + buoyId, init ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        return response.json();
      } )
      .then( json => json );
  }
}

function App() {
  return <>
    <Map /><Charts />
  </>;
}


document.addEventListener("DOMContentLoaded", function(event) { 
  render( <App />, document.getElementById( "root" ) );
} );