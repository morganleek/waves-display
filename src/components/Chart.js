import React, { Component, forwardRef, useEffect, useState } from "@wordpress/element";
import DatePicker from "react-datepicker";
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';
import { wadRawDataToChartData, wadGenerateChartData, wadGetAspectRatio } from './api/chart';
import { getBuoys, getBuoy, getBuoyByDate } from './api/buoys';
import { Memplot } from './Memplot';
import { ChartDownloadModal } from "./ChartDownloadModal";
import { ChartTable } from "./chart/ChartTable";

const classNames = require('classnames');

export function Charts ( {restrict, buoyFocus, updateCenter, updateZoom} ) {
  const [buoys, setBuoys] = useState([]);
  
  useEffect( () => {
    // console.log( 'Chart::componentDidMount' );
    // const { restrict } = props;
  
    getBuoys( restrict ).then( json => {
      setBuoys( json );
    } );

    if( buoyFocus ) {
      if( document.querySelector('[data-buoy-id="' + buoyFocus + '"]') ) {
        document.querySelector('[data-buoy-id="' + buoyFocus + '"]').scrollIntoView( { block: "start" } );
      }
    }
  }, [buoyFocus] );

  return (
    <div className="charts">
      <div>
        { 
          ( buoys.length > 0 ) 
            ? ( buoys
              .filter( row => row.is_enabled )
              .map( ( row, index ) => (
                <Chart
                  buoy={ row }
                  buoyId={ row.id } 
                  buoyLabel={ row.web_display_name } 
                  buoyLastUpdated={ row.last_update } 
                  buoyLat={ row.lat } 
                  buoyLng={ row.lng }
                  buoyDescription={ row.description }
                  buoyDownloadText={ row.download_text }
                  updateCenter={ updateCenter }
                  updateZoom={ updateZoom }
                  downloadEnabled={ parseInt( row.download_enabled ) }
                  downloadRequiresDetails={ parseInt( row.download_requires_details ) }
                  key={ index }
                />
              ) ) 
            ) 
            : undefined 
        }
      </div>
      <p><small>Waves v2.0.3</small></p>
    </div>
  ); 
}

const Chart = ( props ) => {
  const {
    buoyId, 
    buoy,
    buoyLat, 
    buoyLng,
    buoyDescription,
    buoyDownloadText,
    updateCenter,
    updateZoom,
    timeRange
   } = props;

  const [data, setData] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  // const [needsUpdating, setNeedsUpdating] = useState(false);
  const [downloadPath, setDownloadPath] = useState('');
  const [includes, setIncludes] = useState({
    tp: true,
    sst: true, 
    bottomTemp: true,
    hsig: true,
    hsigSwell: true,
    hsigSea: true
  });

  const [groupedIncludes, setGroupedIncludes] = useState([
    { 
      label: "Peak Wave Period & Direction (s & deg)",
      items: [
        { id: "tp", label: "Total ", visible: true }
      ]
    },
    { 
      label: "Significant Wave Height (m)",
      items: [
        { id: "hsig", label: "Total", visible: true },
        { id: "hsigSea", label: "Sea", visible: false },
        { id: "hsigSwell", label: "Swell", visible: false }
      ]
    },
    {
      label: "Temperature",
      items: [
        { id: "sst", label: "Sea Surface", visible: true },
        { id: "bottomTemp", label: "Bottom", visible: true }
      ]
    }
  ]);

  const [showFilters, setShowFitlers] = useState(false);

  // constructor( props ) {
  //   this.handleModalClose = this.handleModalClose.bind( this );
  //   this.handleDownloadClick = this.handleDownloadClick.bind( this );
  // }

  // Can't include date range dependancy because it is set on load
  useEffect( () => {
    getBuoy( buoy.id ).then( json => {
      if( json.success == 1 ) {
        const data = wadGenerateChartData( wadRawDataToChartData( json.data ), formatGroupedIncludes() );
        setData( data );
        setDateRange( [ 
          new Date( parseInt( data.timeRange[0] ) ), 
          new Date( parseInt( data.timeRange[1] ) ) 
        ] );
      }      
    } );
  }, [groupedIncludes] );

  const handleDateChanged = () => {
    getBuoyByDate( buoy.id, dateRange[0].getTime() / 1000, dateRange[1].getTime() / 1000 ).then( json => {
      if( json.success == 1 ) {
        const data = wadGenerateChartData( wadRawDataToChartData( json.data ), formatGroupedIncludes() );
        setData( data );
        setDateRange( [ new Date( parseInt( data.timeRange[0] ) ), new Date( parseInt( data.timeRange[1] ) ) ] );
      }      
    } );
  }

  const handleExpandClick = () => {
    setIsExpanded( !isExpanded );
  }

	const handleCentreClick = () => {
    const center = {
      lat: parseFloat( buoyLat ),
      lng: parseFloat( buoyLng )
    };
    updateCenter( center );
    updateZoom( 10 );
  }

	const handleExportClick = () => {
    if( timeRange.length == 2 ) {
      const start = parseInt( timeRange[0] ) / 1000;
      const end = parseInt( timeRange[1] ) / 1000;
      const path = "?action=waf_rest_list_buoy_datapoints_csv&id=" + buoy.id + "&start=" + start + "&end=" + end;
      setDownloadPath( wad.ajax + path );
    }
	}


  const handleDownloadClick = () => {
    window.location = downloadPath;
    setDownloadPath( '' );
    // Record in analytics
    if( typeof( gtag ) !== 'undefined' ) {
      gtag( 'event', 'csvExport', { 'method': downloadPath } );
    }
  }

  const handleModalClose = () => {
    setDownloadPath( '' );
  }
  
  let chartGraph = <p>Loading &hellip;</p>;
  let chartModal, chartTable, buttonGroup, chartBuoyDetails, downloadButton;
  // const { data, isExpanded, dateRange, needsUpdating, downloadPath, includes } = this.state;
  const [ startDate, endDate ] = dateRange;
  const expandedLabel = ( isExpanded ) ? 'Collapse' : 'Expand';
  

  const { 
    web_display_name: buoyLabel, 
    download_enabled: downloadEnabled, 
    download_requires_details: downloadRequiresDetails 
  } = buoy;
  
  // if( startDate && endDate && needsUpdating ) {
  //   this.setState( { needsUpdating: false } );
  //   this.handleDateChanged();
  // }

  const formatGroupedIncludes = () => {
    let fIncludes = {};
    groupedIncludes.forEach( g => {
      g.items.forEach( ({id, visible}) => { 
        fIncludes[id] = visible;
      } );
    } );
    return fIncludes;
  }

  const updateGroupIncludes = toggledId => {
    setGroupedIncludes( groupedIncludes.map( ( {label, items} ) => (
      { 
        label,
        items: items.map( item => {
          return ( item.id === toggledId ) 
            ? { ...item, visible: !item.visible }
            : item;
        } )
      }
    ) ) );
  }

  const groupedIncludesListItems = ( groupedIncludes ) ? (
    groupedIncludes.map( ( include, i ) => (
      <li key={i}>
        <h6 className="label">{ include.label }</h6>
        <ul className="items">
          { include.items 
            ? (
              include.items.map( ( {id, label, visible}, j ) => (
                <li key={j}>
                  <label>
                    <input 
                      type="checkbox" 
                      checked={ visible } 
                      onChange={ () => {
                        updateGroupIncludes( id );
                      } }
                    />
                    { label }
                  </label>
                </li>
              ) )
            )
            : undefined
          }
        </ul>
      </li>
    ) )
  ) : undefined;

  const includesListItems = ( data?.config ) ? (
    data.config.data.datasets
      .filter( d => d.hasOwnProperty('hidden') )
      .map( ( { id, hidden, label } ) => (
        <li key={id}>
          <label>
            <input 
              type="checkbox" 
              checked={ !hidden } 
              onChange={ () => {
                console.log( { ...includes, [id]: !includes[id] } );
                // Toggle value
                setIncludes( { ...includes, [id]: !includes[id] } );
              } }
            />
            { label }
          </label>
        </li>
      ) )
  ) : undefined;

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
        <div className="chart-description"><p>{ buoyDescription }</p></div>
        <Memplot buoyId={ buoyId } startDate={ startDate } endDate={ endDate } />
      </div>;
    }
    else {
      // All in one
      chartGraph = <Line data={ data.config.data } options={ data.config.options } />;
    }

    chartTable = <ChartTable data={ data } show={ wad.obs_table_fields } { ...props } />;
    
    downloadButton = <button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => handleExportClick() } ><i className={ classNames( ['fa'], ['fa-floppy-disk'] ) }></i> Export Data</button>;
    buttonGroup = <div className={ classNames( ['btn-group', 'pull-right'] ) } >
      <button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => handleExpandClick() }><i className={ classNames( ['fa'], ['fa-expand'] ) }></i> { expandedLabel }</button>
      <button className={ classNames( ['btn', 'btn-outline-secondary' ] ) } onClick={ () => handleCentreClick() }><i className={ classNames( ['fa'], ['fa-crosshairs'] ) }></i> Centre</button>
      { downloadButton }
      <DatePicker
        selectsRange={ true }
        startDate={ startDate }
        endDate={ endDate }
        onChange={ update => {
          setDateRange( update );
          // Ensure both values are set and then refresh chart
          if( update.length === 2 && update[0] !== null && update[1] !== null ) {
            handleDateChanged();
          }
        } }
        dateFormat="dd/MM/yyyy"
      />
    </div>;

    if( downloadPath.length > 0 ) {
      chartModal = <ChartDownloadModal 
        title="Terms and Conditions"
        buoyId={ buoyId }
        license={ buoyDownloadText }
        close={ handleModalClose }
        download={ handleDownloadClick }
        downloadEnabled={ parseInt( downloadEnabled ) }
        downloadRequiresDetails={ parseInt( downloadRequiresDetails ) }
      />;
    }
  
    return (
      <div className={ classNames( ['card', 'card-primary', 'mb-3'], { expanded: isExpanded } ) } data-buoy-id={ buoyId } >
        { chartModal }
        <div className="card-header clearfix">
          <h6 className='pull-left'>{ buoyLabel }</h6>
					{ buttonGroup }
        </div>
        <div className='card-body'> 
          <div className="canvas-wrapper">
            { groupedIncludesListItems
              ? ( 
                <div className="chart-filter">
                  <button className="btn" onClick={ () => setShowFitlers( !showFilters ) }>Filter Chart <i className={ classNames( ["fa-solid", { "fa-chevron-down": !showFilters, "fa-chevron-up": showFilters } ] ) }></i></button>
                  { showFilters ? ( <ul className="chart-filter-list">{ groupedIncludesListItems }</ul> ) : undefined }
                </div>
              ) 
              : undefined 
            }
						{ chartGraph }
            { chartBuoyDetails }
            { chartTable }
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="card card-primary mb-3">
      <div className="card-header clearfix">
        { buoyLabel ? ( <h6 className='pull-left'>{ buoyLabel }</h6> ) : undefined }
      </div>
      <div className='card-body'> 
        <div className="canvas-wrapper">
          <p className="loading">Loading&hellip;</p>
        </div>
      </div>
    </div>
  );
}

const ChartPhoto = ( props ) => {
  return (
    <div className="chart-image">
      { 
        ( props?.buoy?.image && buoy.image.length > 0 )
        ? <img src={ buoy.image } />
        : <div className="chart-photo-placeholder" />
      }
    </div>
  );
}