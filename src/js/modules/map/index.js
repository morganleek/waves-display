// import $ from 'jquery';
// Google Maps
const loadGoogleMapsApi = require('load-google-maps-api');
let map;

// $(function() {
export function wadDrawMap( buoys ) {
	if( wad.googleApiKey != undefined ) {
		// Maps
		if( document.getElementById( 'map' ) ) {
			
			loadGoogleMapsApi( {
				key: wad.googleApiKey
			} ).then( ( googleMaps ) => {
				// Labels
				const MarkerWithLabel = require( 'markerwithlabel' )( googleMaps );

				const lat = parseFloat( wad.googleLat );
				const lng = parseFloat( wad.googleLng );
				const zoom = ( window.innerWidth < 1200 ) ? 4 : 5;
				const latLng = { lat: lat, lng: lng };
	
				map = new googleMaps.Map(
					document.getElementById( 'map' ), {
						center: latLng,
						zoom: zoom,
						// styles: mapStyle,
						disableDefaultUI: true,
					}
				);
	
				// Set markers
				for(var i = 0; i < buoys.length; i++) {
					var point = new MarkerWithLabel({
						position: {
							lat: parseFloat(buoys[i].lat), 
							lng: parseFloat(buoys[i].lng)
						},
						map: map,
						title: buoys[i].label,
						labelContent: buoys[i].type,
						labelAnchor: new googleMaps.Point(0, -2),
						labelClass: "maps-label", // the CSS class for the label
						labelStyle: { opacity: 0.9 }
					});
				}
			}).catch( (e) => {
				console.error(e);
			});
		}
		
		// Centre Map Buttons
		// $('.map-focus').on('click', function(e) {
		// 	let dataBuoy = $(this).closest('.chart-js-layout').attr('data-buoy');
		// 	let lat = 0, lng = 0;
		// 	for( let i = 0; i <= global_points_object.length; i++ ) {
		// 		if( global_points_object[i].buoy_id == dataBuoy ) {
		// 			lat = parseFloat(global_points_object[i].lat);
		// 			lng = parseFloat(global_points_object[i].lng);
					
		// 			// Set Centre and Zoom
		// 			map.setCenter({lat, lng});
		// 			map.setZoom(12);

		// 			break;
		// 		}
		// 	}
		// });
	}
}

export function wadMapLocator ( trigger ) {
	if( trigger != "undefined" ) {
		trigger.addEventListener( 'click', ( e ) => {
			const center = { 
				lat: parseFloat( e.target.dataset.buoyLat ),
				lng: parseFloat( e.target.dataset.buoyLng )
			};

			map.panTo( center );
			// map.setZoom( 11 );
		} );
	}
}