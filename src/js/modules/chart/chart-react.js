// Charts - React.js
import React, { useState, Component, Fragment } from "react";
import { render } from "react-dom";
import { wadRawDataToChartData } from './buoy-data';
import { wadGenerateChartData } from './chart';
import { Map } from './map';
import { Line } from 'react-chartjs-2';

const classNames = require('classnames');

class Charts extends Component {
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
    } );
  }

  render() {
    const { buoys } = this.state;
    let buoysList;
    if( buoys.length > 0 ) {
      buoysList = <ChartsLoop buoyData={ buoys } />
    }

    return (
      <div className="charts">
        { buoysList }
      </div>
    );
  }
}

const ChartsLoop = ( props ) => {
  // Interate through buoys
  let chartsLoopRender = props.buoyData.map( ( row, index ) => {    
    return (
      <div className={ classNames( ['panel', 'panel-primary'] ) } key={ index }>
        <div className={ classNames( ['panel-heading', 'clearfix'] ) }>
          <h5>{ row.label }</h5>
        </div>
        <div className='panel-body'> 
          <div className='chart-js-menu'>Buttons</div>
          <Chart buoyId={ row.id } />
        </div>
      </div>
    )
  } );

  return <div>{ chartsLoopRender }</div>
}

class LineTable extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      active: false
    }
  }

  render( ) {
    // Iterate through chart table items
    let lineTableRender = [];
    for( const [key, value] of Object.entries( this.props.dataPoints ) ) {
      // Max value
      const max = Math.max( ...value.data.map( point => point.y ) );
      max = ( max > 0 ) ? max : "-";

      lineTableRender.push( <Fragment key={ key }>
        <dt>{ value.description }</dt>
        <dd>{ max }</dd>
      </Fragment> );
    }

    return (
      <div className={ classNames( "chart-info", { "expanded": this.state.active } ) }
        onClick={ () => this.setState( { active: !this.state.active } ) } >
        <dl>{ lineTableRender }</dl>
      </div>
    );
  }
}

class Chart extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      data: []
    }

  }
  
  componentDidMount() {
    getBuoy( this.props.buoyId ).then( json => {
      if( json.success == 1 ) {
        this.setState( {
          data: wadGenerateChartData( wadRawDataToChartData( json.data ) )
        } );
      }      
    } );
  }
  
  render() {
    let lineChart = <p>Loading &hellip;</p>;
    let lineTable;
    const { data } = this.state;
    if( Object.keys( data ).length > 0 ) {
      lineChart = <Line data={ data.config.data } options={ data.config.options } />
      lineTable = <LineTable dataPoints={ data.dataPoints } />
    }

    return (
      <div className={ classNames( ['canvas-wrapper', 'loading'] ) }>
        { lineChart }
        { lineTable }
      </div>
    );
  }
}

export function getBuoys() {
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
  if( document.getElementsByClassName('page-template-wave-display-react').length ) {
    render( <App />, document.getElementById( "root" ) );
  }
} );