import React, { Component, forwardRef, useEffect, useState } from "@wordpress/element";
import DatePicker from "react-datepicker";
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-luxon';
import { wadRawDataToChartData, wadGenerateChartData, wadGetAspectRatio } from './api/chart';
import { getBuoys, getBuoy, getBuoyData, getBuoyByDate } from './api/buoys';
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
    updateZoom
   } = props;

  const [data, setData] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  // const [timeRange, setTimeRange] = useState(null);
  const [dateRange, setDateRange] = useState([null, null]);
  const [searchDateRange, setSearchDateRange] = useState(null);
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
      label: "Significant Wave Height (m)",
      items: [
        { id: "hsig", label: "Total", visible: true, enabled: true, order: 1 },
        { id: "hsigSea", label: "Sea", visible: false, enabled: true, order: 2 },
        { id: "hsigSwell", label: "Swell", visible: false, enabled: true, order: 3 }
      ]
    },
    { 
      label: "Peak Wave Period & Direction (s & deg)",
      items: [
        { id: "tp", label: "Total ", visible: true, enabled: true, order: 0 }
      ]
    },
    {
      label: "Temperature (°C)",
      items: [
        { id: "sst", label: "Sea Surface", visible: true, enabled: true, order: 4 },
        { id: "bottomTemp", label: "Bottom", visible: true, enabled: true, order: 5 }
      ]
    }
  ]);

  const [showFilters, setShowFitlers] = useState(false);

  // Can't include date range dependancy because it is set on load
  useEffect( () => {
    const params = { id: buoy.id };
    // Custom start and end dates
    if( searchDateRange !== null  ) {
      params.start = searchDateRange[0].getTime() / 1000;
      params.end = searchDateRange[1].getTime() / 1000;
    }

    getBuoyData( params )
      .then( json => {
        if( json.success === 1 ) {
          const data = wadGenerateChartData( 
            wadRawDataToChartData( json.data ), 
            formatGroupedIncludes(), 
            0.8 
          );
          
          // Set data
          setData( data );
          setDateRange([ 
            new Date( parseInt( data.timeRange[0] ) ), 
            new Date( parseInt( data.timeRange[1] ) ) 
          ]);
        }
        else {
          console.log( json.success );
        }
      } );
  }, [groupedIncludes, searchDateRange] );

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
    if( data.timeRange && data.timeRange.length === 2 ) {
      const start = parseInt( data.timeRange[0] ) / 1000;
      const end = parseInt( data.timeRange[1] ) / 1000;
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
  const [ startDate, endDate ] = dateRange;
  const expandedLabel = ( isExpanded ) ? 'Collapse' : 'Expand';
  
  const { 
    web_display_name: buoyLabel, 
    download_enabled: downloadEnabled, 
    download_requires_details: downloadRequiresDetails 
  } = buoy;

  const formatGroupedIncludes = () => {
    let orderedIncludes = [];
    let fIncludes = {};
    // Sort by 'order' attribute
    groupedIncludes.forEach( g => {
      g.items.forEach( ( item ) => { 
        orderedIncludes[item.order] = item;
      } );
    } );
    // Translate to form { ...id: isVisible }
    orderedIncludes.forEach( ( {id, visible} ) => {
      fIncludes[id] = visible;
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

  
  // setGroupedIncludes( groupedIncludes.map( ( {label, items} ) => (
  //   { 
  //     label,
  //     items: items.map( item => ( 
  //       { ...item, enabled: available.includes( item.id ) } 
  //     ) )
  //   }
  // ) ) );

  // Disable unused filters
  const available = [];
  for( const key in data.dataPoints ) {
    if( data.dataPoints[key].data.length > 0 ) {
      available.push(key);
    }
  }
  const groupedIncludesListItems = ( groupedIncludes ) ? (
    groupedIncludes.map( ( include, i ) => (
      <li key={i}>
        <h6 className="label">{ include.label }</h6>
        <ul className="items">
          { include.items 
            ? (
              include.items
                .filter( ( { id } ) => available.includes( id ) )
                .map( ( {id, label, visible}, j ) => (
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
        <ChartPhoto buoy={ props } />
        <div className="chart-description"><p>{ buoyDescription }</p></div>
        <Memplot buoyId={ buoyId } startDate={ startDate } endDate={ endDate } />
      </div>;
    }
    else {
      // All in one
      chartGraph = <Line data={ data.config.data } options={ data.config.options } />;
    }

    chartTable = <ChartTable data={ data } show={ wad.obs_table_fields } { ...props } />;
    
    console.log( data.dataPoints );

    const chartGauges = (
      wad.buoy_display_gauge_wind_direction === "1" ||
      wad.buoy_display_gauge_sea_surface === "1" ||
      wad.buoy_display_gauge_sea_state === "1"
    ) ? (
      <div className="chart-gauges">
        { (
          wad.buoy_display_gauge_wind_direction === "1" 
          && data.dataPoints.hasOwnProperty( 'winddirect' )
        )
          ? (
            <div className="gauge">
              <h6>Wind Direction</h6>
              <div className="gauge-wind-direction" data-level={ ( data.dataPoints.winddirect.data.filter( t => t.y > 0 ).pop().y + 180 ) % 360 }>
                <div className="needle"></div>
              </div>
              <p>
                { data.dataPoints.winddirect.data.filter( t => t.y > 0 ).pop().y }°
              </p>
            </div>
          )
          : undefined
        }
        { (
          wad.buoy_display_gauge_sea_surface === "1" 
          && data.dataPoints.hasOwnProperty( 'sst' )
        )
        ? (
          <div className="gauge">
            <h6>Sea Surface Temp</h6>
            <div className="gauge-sea-temp" data-level={ Math.ceil( ( data.dataPoints.sst.data.filter( t => t.y > 0 ).pop().y / 50 ) * 120 ) }>
              <div className="needle"></div>
            </div>
            <p>
              { data.dataPoints.sst.data.filter( t => t.y > 0 ).pop().y }°C
            </p>
          </div>
        )
        : undefined
        }
        { wad.buoy_display_gauge_sea_state === "1" 
          ? (
            <div className="gauge">
              <h6>Sea State</h6>
              <div className="gauge-sea-state" data-level={ 8 / 10 * 180 - 90 }>
                <div className="needle"></div>
              </div>
            </div>
          )
          : undefined
        }
      </div>
    ) : undefined;
    
    buttonGroup = <div className="tools">
      <div className={ classNames( ['btn-group'] ) } >
        <button 
          className={ classNames( ['btn', 'btn-outline-secondary' ] ) } 
          onClick={ handleExpandClick }
          title="Expand chart"
        >
          <span className="label">{ expandedLabel }</span>
          <i className={ classNames( ['fa'], ['fa-expand'] ) }></i>
        </button>
        <button 
          className={ classNames( ['btn', 'btn-outline-secondary' ] ) } 
          onClick={ handleCentreClick }
          title="Centre on map"
        >
          <span className="label">Centre</span>
          <i className={ classNames( ['fa'], ['fa-crosshairs'] ) }></i>
        </button>
        <button 
          className={ 
            classNames( ['btn', 'btn-outline-secondary' ] ) 
          } 
          onClick={ () => handleExportClick() }
          title="Export data"
        >
          <span className="label">Export Data</span>
          <i className={ classNames( ['fa'], ['fa-floppy-disk'] ) }></i>
        </button>
      </div>
      <DatePicker
        selectsRange={ true }
        startDate={ startDate }
        endDate={ endDate }
        onChange={ update => {
          setDateRange( update );
          // Ensure both values are set and then refresh chart
          if( update.length === 2 && update[0] !== null && update[1] !== null ) {
            setSearchDateRange([update[0], update[1]]);
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
        <div className="card-header">
          <h6>{ buoyLabel }</h6>
					{ buttonGroup }
        </div>
        <div className='card-body'> 
          <div className="canvas-wrapper">
            { chartGauges }
            { groupedIncludesListItems && !isExpanded
              ? ( 
                <div className="chart-filter">
                  <div className="btn-group">
                    <button className="btn" onClick={ () => setShowFitlers( !showFilters ) }>Filter <i className={ classNames( ["fa-solid", { "fa-chevron-down": !showFilters, "fa-chevron-up": showFilters } ] ) }></i></button>
                  </div>
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