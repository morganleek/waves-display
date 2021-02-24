import $ from 'jquery';

import { wadDrawMap } from '../map';
import { wadDrawLatestTable, wadGenerateChartData, wadDrawHeading, wadDrawChart, wadInitCharts } from './chart';

export function wadFetchBuoys() {
  // Fetch all buoys
  $.ajax({
    type: 'POST',
    url: wad.ajax,
    data: { action: 'waf_rest_list_buoys' },
    success: wadProcessBuoys, // Process list received
    dataType: 'json'
  });
}

export function wadProcessBuoys( response ) {
  // Draw charts
  if( document.getElementById( 'buoys' ) != null ) {
    wadInitCharts( response );
  }

  // Draw map
  if( document.getElementById( 'map' ) ) {
    wadDrawMap( response );
  }
}

// Create Divs for each Buoy
export function wadProcessBuoyData( response ) {
  if( response ) {
    if( response.success == "1" ) {
      if( document.getElementById( 'buoy-' + response.buoy_id ) != null ) {
        const buoyDiv = document.getElementById( 'buoy-' + response.buoy_id );
        // Convert to useful chart data
        const processed = wadRawDataToChartData( response.data );
        // Store in Window
        if( typeof( window.myChartData ) == "undefined" ) {
          window.myChartData = [];
        }
        window.myChartData['buoy-' + response.buoy_id] = processed;
        // Generate Chart.js data
        const chartData = wadGenerateChartData( processed );
        // Draw chart tables
        wadDrawLatestTable( response.buoy_id, chartData.dataPoints );
        // Draw with chartData
        wadDrawChart( response.buoy_id, chartData.config );
        // Update heading with time
        wadDrawHeading( response.buoy_id, chartData.timeLabel );
      }
    }
    else {
      // No data returned
      const failedBuoy = document.getElementById( 'buoy-' + response.buoy_id );
      const canvasWrapper = failedBuoy.getElementsByClassName( 'canvas-wrapper' )[0]; // .innerHTML = "No results found";
      const chartInfo = failedBuoy.getElementsByClassName( 'chart-info' )[0];
      canvasWrapper.classList.remove( 'loading' );
      canvasWrapper.classList.add( 'no-results' );
      // Destroy Chart if it exists
      if( typeof( window.myCharts['buoy' + response.buoy_id] ) != "undefined" ) {
        window.myCharts['buoy' + response.buoy_id].destroy();
        // Remove chart data
        chartInfo.classList.add( 'no-results' );
        chartInfo.innerHTML = "";
      }
      else {
        // Remove inner elements only for initial loads
        failedBuoy.getElementsByClassName( 'chart-js-menu' )[0].remove();
        chartInfo.remove();
      }
    }
  }
}

export function wadRawDataToChartData( data ) {
  let processed = [];
  if( data.length > 0 ) {
    for( let i = 0; i < data.length; i++ ) {
      processed.push( JSON.parse( data[i].data_points ) );
    }
  }

  return processed;
}
