// Charts - React.js
import React, { Component, Fragment } from "react";
import { wadRawDataToChartData } from '../chart/buoy-data';
import { wadGenerateChartData } from '../chart/chart';
import { Line } from 'react-chartjs-2';
import { getBuoys, getBuoy } from './fetch';

const classNames = require('classnames');

export class Charts extends Component {
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

export const ChartsLoop = ( props ) => {
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

export class LineTable extends Component {
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

export class Chart extends Component {
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