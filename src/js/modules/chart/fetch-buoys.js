import $ from 'jquery';
import { wadProcessBuoyData } from './fetch-buoy';

const panelWrapper = "<div class='panel panel-primary'>" +
  "<div class='panel-heading clearfix'><h5>{{ buoyLabel }}</h5></div>" + 
  "<div class='panel-body'><p class='loading'><em>Loading&hellip;</em></p></div>" +
  "<canvas></canvas>" +
"</div>";

export function wadProcessBuoys( response ) {
  if( document.getElementById( 'buoys' ) != null ) {
    const buoysWrapper = document.getElementById( 'buoys' );
    // Setup boxes
    for( let i = 0; i < response.length; i++ ) {
      const newBuoyWrapper = document.createElement( "div" );
      newBuoyWrapper.id = "buoy-" + response[i].id;
      // Internals
      const newPanelWrapper = panelWrapper.replace( '{{ buoyLabel }}', response[i].label );
      newBuoyWrapper.insertAdjacentHTML( 'afterbegin', newPanelWrapper );
      // Attach
      buoysWrapper.appendChild( newBuoyWrapper );

      // Fetch data
      $.ajax({
        type: 'POST',
        url: wad.ajax,
        data: { 
          action: 'waf_rest_list_buoy_datapoints',
          id: response[i].id
        },
        success: wadProcessBuoyData,
        dataType: 'json'
      })
    }
  }
}
