import { wadDrawChart } from './draw-chart';

// Create Divs for each Buoy
export function wadProcessBuoyData( response ) {
  if( response.length > 0 ) {
    const buoyId = response[0].buoy_id;
    if( document.getElementById( 'buoy-' + buoyId ) != null ) {
      const buoyDiv = document.getElementById( 'buoy-' + buoyId );
      // Convert to useful chart data
      const processed = wadRawDataToChartData( response );
      wadDrawChart( buoyId, processed );
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