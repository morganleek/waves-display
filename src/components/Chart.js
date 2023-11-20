import React, { Component, forwardRef } from "@wordpress/element";
import DatePicker from "react-datepicker";
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';
import { wadRawDataToChartData, wadGenerateChartData, wadGetAspectRatio } from './api/chart';
import { getBuoys, getBuoy, getBuoyByDate } from './api/buoys';
import { Memplot } from './Memplot';
import { ChartDownloadModal } from "./ChartDownloadModal";
import { ChartTable } from "./chart/ChartTable";

const classNames = require('classnames');

export class Charts extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      buoys: [],
    }
  }

  componentDidMount() {
    // console.log( 'Chart::componentDidMount' );
    const { restrict } = this.props;

    getBuoys( restrict ).then( json => {
      this.setState( {
        buoys: json
      } );
    } );
  } 

  componentDidUpdate( prevProps ) {
    const { buoyFocus } = this.props;
    if( buoyFocus != prevProps.buoyFocus ) {
      if( document.querySelector('[data-buoy-id="' + buoyFocus + '"]') ) {
        document.querySelector('[data-buoy-id="' + buoyFocus + '"]').scrollIntoView( { block: "start" } );
      }
    }
  }

  render() {
    const { buoys } = this.state;
    let chartsLoopRender;
    if( buoys.length > 0 ) {
			chartsLoopRender = buoys.map( ( row, index ) => {    
        // <div className={ classNames( ['card', 'card-primary', 'mb-3'] ) } key={ index }> 
        if( parseInt( row.is_enabled ) == 1 ) {
          return (
            <Chart
              buoy={ row }
              buoyId={ row.id } 
              buoyLabel={ row.web_display_name } 
              buoyLastUpdated={ row.last_update } 
              buoyLat={ row.lat } 
              buoyLng={ row.lng }
              buoyDescription={ row.description }
              buoyDownloadText={ row.download_text }
              updateCenter={ this.props.updateCenter }
              updateZoom={ this.props.updateZoom }
              downloadEnabled={ parseInt( row.download_enabled ) }
              downloadRequiresDetails={ parseInt( row.download_requires_details ) }
              key={ index }
            />
          )
        }
			} );
    }

    return (
      <div className="charts">
        <div>{ chartsLoopRender }</div>
        <p><small>Waves v2.0.3</small></p>
      </div>
    );
  }
}

// function timeCallback( tickValue, index, ticks ) {
//   return tickValue.split(" ");
// }

export class Chart extends Component {
  constructor( props ) {
    super( props );
    
    this.state = {
      data: [],
      isExpanded: false,
      dateRange: [null, null],
      needsUpdating: false,
      downloadPath: ''
		}

    this.handleModalClose = this.handleModalClose.bind( this );
    this.handleDownloadClick = this.handleDownloadClick.bind( this );
  }

  handleExpandClick() {
    this.setState( { isExpanded: !this.state.isExpanded } );
  }

	handleCentreClick() {
    const center = {
      lat: parseFloat( this.props.buoyLat ),
      lng: parseFloat( this.props.buoyLng )
    };
    this.props.updateCenter( center );
    this.props.updateZoom( 10 );
  }

	handleExportClick() {
    const { buoy } = this.props;
    const { timeRange } = this.state.data;
    if( timeRange.length == 2 ) {
      const start = parseInt( timeRange[0] ) / 1000;
      const end = parseInt( timeRange[1] ) / 1000;
      const path = "?action=waf_rest_list_buoy_datapoints_csv&id=" + buoy.id + "&start=" + start + "&end=" + end;
      this.setState( { downloadPath: wad.ajax + path } );
    }
	}

	handleDateChanged() {
    const { buoy } = this.props;
    const { dateRange } = this.state;
    
		getBuoyByDate( buoy.id, dateRange[0].getTime() / 1000, dateRange[1].getTime() / 1000 ).then( json => {
      if( json.success == 1 ) {
        const data = wadGenerateChartData( wadRawDataToChartData( json.data ) );
        this.setState( {
          data: data,
          dateRange: [ new Date( parseInt( data.timeRange[0] ) ), new Date( parseInt( data.timeRange[1] ) ) ]
        } );
      }      
    } );
	}

  handleDownloadClick() {
    const { downloadPath } = this.state;
    window.location = downloadPath;
    this.setState( { downloadPath: '' } );
    // Record in analytics
    if( typeof( gtag ) !== 'undefined' ) {
      gtag( 'event', 'csvExport', { 'method': downloadPath } );
    }
  }

  handleModalClose() {
    this.setState( { downloadPath: '' } );
  }
  
  componentDidMount() {
    const { buoy } = this.props;
    getBuoy( buoy.id ).then( json => {
      if( json.success == 1 ) {
        const data = wadGenerateChartData( wadRawDataToChartData( json.data ) );
        this.setState( {
          data: data,
          dateRange: [ new Date( parseInt( data.timeRange[0] ) ), new Date( parseInt( data.timeRange[1] ) ) ],
        } );
      }      
    } );
  }
  
  render() {
    let chartGraph = <p>Loading &hellip;</p>;
    let chartModal, chartTable, buttonGroup, chartBuoyDetails, downloadButton;
    const { data, isExpanded, dateRange, needsUpdating, downloadPath } = this.state;
    const [ startDate, endDate ] = dateRange;
    const expandedLabel = ( isExpanded ) ? 'Collapse' : 'Expand';
    const { buoy } = this.props;

    const { 
      web_display_name: buoyLabel, 
      download_enabled: downloadEnabled, 
      download_requires_details: downloadRequiresDetails 
    } = buoy;
    
    if( startDate && endDate && needsUpdating ) {
      this.setState( { needsUpdating: false } );
      this.handleDateChanged();
    }
		
    if( Object.keys( data ).length > 0 ) {
      if( isExpanded ) {
        // Split apart
        let chartGraphTemp = [];
        
        data.config.data.datasets.forEach( ( dataset, j ) => {
          // Create dateset from grouped dataset
          const datasetClone = { ...dataset };
          datasetClone.hidden = false;
          
          // Create scales with only necessary ones
          const currentY = datasetClone.yAxisID; // Current y-axis
          const currentScales = {}; // New axis'
          currentScales['x'] = { ...data.config.options.scales['x'] };
          currentScales[currentY] = { ...data.config.options.scales[currentY] };
          currentScales[currentY].position = "left"; // Make position left

          // Clone options with updated options
          const optionsClone = { ...data.config.options };
          optionsClone.plugins = {} // Not legend title
          optionsClone.aspectRatio = wadGetAspectRatio( 0.5 ); // Half aspect ratio
          
          // Assign
          optionsClone.scales = currentScales;
          
          chartGraphTemp.unshift( 
            <Line 
              data={ { labels: data.config.data.labels, datasets: [ datasetClone ] } }  
              options={ optionsClone } 
              key={ j } 
            /> 
          );
        } );
        chartGraph = chartGraphTemp;

        // Expanded buoy details 
        chartBuoyDetails = <div className={ classNames( ['buoy-details'] ) }>
          <ChartPhoto buoy={ buoy } />
          <div className="chart-description"><p>{ this.props.buoyDescription }</p></div>
          <Memplot buoyId={ this.props.buoyId } startDate={ startDate } endDate={ endDate } />
        </div>;
      }
      else {
        // All in one
        chartGraph = <Line data={ data.config.data } options={ data.config.options } />;
      }

      chartTable = <ChartTable data={ data } show={ wad.obs_table_fields } { ...this.props } />;
      
      downloadButton = <button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleExportClick() } ><i className={ classNames( ['fa'], ['fa-floppy-o'] ) }></i> Export Data</button>;
			buttonGroup = <div className={ classNames( ['btn-group', 'pull-right'] ) } >
        <button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleExpandClick() }><i className={ classNames( ['fa'], ['fa-expand'] ) }></i> { expandedLabel }</button>
				<button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => this.handleCentreClick() }><i className={ classNames( ['fa'], ['fa-crosshairs'] ) }></i> Centre</button>
				{ downloadButton }
				<DatePicker
          selectsRange={ true }
          startDate={ startDate }
          endDate={ endDate }
          onChange={ ( update ) => {
            this.setState( { dateRange: update } );
            if( update[0] && update[1] ) {
              this.setState( { needsUpdating: true } );
            }
          } }
          customInput={ <ChartDatePicker /> }
          dateFormat="dd/MM/yyyy"
        />
			</div>;


      if( downloadPath.length > 0 ) {
        // const ref = React.createRef();
        // const ref = useRef();
        chartModal = <ChartDownloadModal 
          title="Terms and Conditions"
          buoyId={ this.props.buoyId }
          license={ this.props.buoyDownloadText }
          close={ this.handleModalClose }
          download={ this.handleDownloadClick }
          downloadEnabled={ parseInt( downloadEnabled ) }
          downloadRequiresDetails={ parseInt( downloadRequiresDetails ) }
          // ref={ ref }
        />;
      }
    }

    return (
      <div className={ classNames( ['card', 'card-primary', 'mb-3'], { expanded: isExpanded } ) } data-buoy-id={ this.props.buoyId } >
        { chartModal }
        <div className={ classNames( ['card-header', 'clearfix'] ) }>
          <h6 className='pull-left'>{ buoyLabel }</h6>
					{ buttonGroup }
        </div>
        <div className='card-body'> 
          <div className={ classNames( ['canvas-wrapper', { 'is-updating': needsUpdating } ] ) }>
						{ chartGraph }
            { chartBuoyDetails }
            { chartTable }
            
          </div>
        </div>
      </div>
    );
  }
}

const ChartDatePicker = forwardRef( ( { value, onClick }, ref ) => (
  <button className={ classNames( ['btn', 'btn-outline-secondary', 'btn-datepicker' ] ) } onClick={ onClick } ref={ ref }>
    <i className={ classNames( ['fa'], ['fa-calendar'] ) }></i> { value } <i className={ classNames( ['fa'], ['fa-caret-down'] ) }></i>
  </button>
) );

const ChartPhoto = ( props ) => {
  return (
    <div className="chart-image">
      { 
        ( props?.buoy?.image && props.buoy.image.length > 0 )
        ? <img src={ props.buoy.image } />
        : <div className="chart-photo-placeholder" />
      }
    </div>
  );
}