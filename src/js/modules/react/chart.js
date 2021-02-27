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
        <Chart buoyId={ row.id } buoyLabel={ row.label } buoyLastUpdated={ row.last_update } />
      </div>
    )
  } );

  return <div>{ chartsLoopRender }</div>
}

export const ChartButtons = ( prop ) => {
  return (
    <div className={ classNames( ['btn-group', 'btn-group-sm', 'pull-right'] ) }>
      <button className={ classNames( ['btn', 'btn-default', 'fa', 'fa-floppy-o'] ) }>Export Data</button>
      <button className={ classNames( ['btn', 'btn-default', 'fa', 'fa-crosshairs'] ) }>Centre</button>
      <button className={ classNames( ['btn', 'btn-default', 'fa', 'fa-calendar'] ) }>Date Range</button>
    </div>
  )
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
      // Last value
      const last = ( value.data.length > 0 ) ? value.data[ value.data.length - 1 ].y : 0;
      // Last Updates
      // this.props.lastUpdated;
      // const lastUpdate = moment( this.props.lastUpdated * 1000 );
      // const queryTime = moment( window.buoysData.get( parseInt( buoyId ) ).now * 1000 );
      if( last > 0 ) {
        lineTableRender.push( <li key={ key }>
          { value.description }
          <span>{ last }</span>
        </li> );
      }
    }

    return (
      <div className={ classNames( "chart-info", { "expanded": this.state.active } ) }
        onClick={ () => this.setState( { active: !this.state.active } ) } >
        <h5 className='latest-observations'>Latest Observations</h5>
        <ul>{ lineTableRender }</ul>
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
    let lineTable, dateRange;
    const { data } = this.state;
    const buoyLabel = this.props.buoyLabel;
    if( Object.keys( data ).length > 0 ) {
      dateRange = <time>{ data.config.options.title.text }</time>;
      lineChart = <Line data={ data.config.data } options={ data.config.options } />;
      lineTable = <LineTable dataPoints={ data.dataPoints } lastUpdated={ this.props.lastUpdated } />;
    }

    return (
      <>
        <div className={ classNames( ['panel-heading', 'clearfix'] ) }>
          <h6 className='pull-left'>{ buoyLabel } { dateRange }</h6>
          <ChartButtons />
        </div>
        <div className='panel-body'> 
          <div className={ classNames( ['canvas-wrapper', 'loading'] ) }>
            { lineChart }
            { lineTable }
          </div>
        </div>
      </>
    );
  }
}