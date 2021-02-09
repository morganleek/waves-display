import { wadDrawChart } from './draw-chart';

// Create Divs for each Buoy
export function wadProcessBuoyData( response ) {
  if( response ) {
    if( response.success == "1" ) {
      if( document.getElementById( 'buoy-' + response.buoy_id ) != null ) {
        const buoyDiv = document.getElementById( 'buoy-' + response.buoy_id );
        // Convert to useful chart data
        const processed = wadRawDataToChartData( response.data );
        wadDrawChart( response.buoy_id, processed );
      }
    }
    else {
      const failedBuoy = document.getElementById( 'buoy-' + response.buoy_id );
      failedBuoy.getElementsByClassName( 'loading' )[0].innerHTML = "No results found";
      failedBuoy.getElementsByClassName( 'canvas-wrapper' )[0].remove();
      failedBuoy.getElementsByClassName( 'chart-js-menu' )[0].remove();
      failedBuoy.getElementsByClassName( 'chart-info' )[0].remove();
    }
  }
}

function wadRawDataToChartData ( data ) {
  let processed = [];
  if( data.length > 0 ) {
    for( let i = 0; i < data.length; i++ ) {
      processed.push( JSON.parse( data[i].data_points ) );
    }
  }

  return processed;
}