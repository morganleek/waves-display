import $ from 'jquery';
import { wadProcessBuoyData } from './fetch-buoy';
import { wadDrawMap, wadMapLocator } from '../map';
import { wadDatePicker, wadCSVDownload  } from './controls-buoy';

const panelWrapper = "<div class='panel panel-primary'>" +
  "<div class='panel-heading clearfix'><h5>{{ buoyLabel }}</h5></div>" + 
  "<div class='panel-body'>" + 
    "<div class='chart-js-menu'>" + 
      "<button class='download-trigger' data-buoy-id='{{ buoyId }}'>Download</button>" +
      "<button class='maps-trigger' data-buoy-lat='{{ buoyLat }}' data-buoy-lng='{{ buoyLng }}'>Map</button>" +
      "<button class='calendars-trigger' data-buoy-id='{{ buoyId }}'>Date</button>" +
    "</div>" +
    "<div class='canvas-wrapper loading'>" +
      "<canvas></canvas>" +
    "</div>" +
    "<div class='chart-info'></div>" +
  "</div>" +
"</div>";

export function wadProcessBuoys( response ) {
  // Draw charts
  if( document.getElementById( 'buoys' ) != null ) {
    const buoysWrapper = document.getElementById( 'buoys' );
    // Setup boxes
    for( let i = 0; i < response.length; i++ ) {
      const newBuoyWrapper = document.createElement( "div" );
      newBuoyWrapper.id = "buoy-" + response[i].id;
      // Internals
      const newPanelWrapper = panelWrapper.replaceAll( '{{ buoyLabel }}', response[i].web_display_name )
        .replaceAll( '{{ buoyId }}', response[i].id )
        .replaceAll( '{{ buoyLat }}', response[i].lat )
        .replaceAll( '{{ buoyLng }}', response[i].lng );
      newBuoyWrapper.insertAdjacentHTML( 'afterbegin', newPanelWrapper );
      // Setup buttons
      wadDatePicker( newBuoyWrapper.getElementsByClassName( "calendars-trigger" )[0] );
      wadMapLocator( newBuoyWrapper.getElementsByClassName( "maps-trigger" )[0] );
      wadCSVDownload( newBuoyWrapper.getElementsByClassName( "download-trigger" )[0] );
      
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
      });
    }
  }

  // Draw map
  if( document.getElementById( 'map' ) ) {
    wadDrawMap( response );
  }
}
