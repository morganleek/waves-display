import $ from 'jquery';

import { wadDrawMap } from '../map';
import { wadFillChart, wadInitCharts } from './chart';

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
        wadFillChart( response.buoy_id, processed );
      }
    }
    else {
      // No data returned
      const failedBuoy = document.getElementById( 'buoy-' + response.buoy_id );
      const canvasWrapper = failedBuoy.getElementsByClassName( 'canvas-wrapper' )[0]; // .innerHTML = "No results found";
      canvasWrapper.classList.remove( 'loading' );
      canvasWrapper.classList.add( 'no-results' );
      failedBuoy.getElementsByClassName( 'chart-js-menu' )[0].remove();
      failedBuoy.getElementsByClassName( 'chart-info' )[0].remove();
      // failedBuoy.getElementsByClassName( 'canvas-wrapper' )[0].remove();
    }
  }
}

function wadRawDataToChartData( data ) {
  let processed = [];
  if( data.length > 0 ) {
    for( let i = 0; i < data.length; i++ ) {
      processed.push( JSON.parse( data[i].data_points ) );
    }
  }

  return processed;
}
