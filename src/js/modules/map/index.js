import $ from 'jquery';
// Google Maps
const loadGoogleMapsApi = require('load-google-maps-api');
// let map;

import { wadRawDataToChartData } from '../chart/buoy-data';

// $(function() {
export function wadDrawMap( buoys ) {
	if( wad.googleApiKey != undefined ) {
		// Maps
		if( document.getElementById( 'map' ) ) {
			
			loadGoogleMapsApi( {
				key: wad.googleApiKey
			} ).then( ( googleMaps ) => {
				// For later 
				window.myGoogleMaps = googleMaps;
				// Labels
				const MarkerWithLabel = require( 'markerwithlabel' )( googleMaps );

				const lat = parseFloat( wad.googleLat );
				const lng = parseFloat( wad.googleLng );
				const zoom = ( window.innerWidth < 1200 ) ? 4 : 5;
				const latLng = { lat: lat, lng: lng };
	
				window.myMap = new googleMaps.Map(
					document.getElementById( 'map' ), {
						center: latLng,
						zoom: zoom,
						styles: mapStyles,
						disableDefaultUI: true,
					}
				);

				// map.addListener( "click", ( e ) => { console.log( e.latLng.lat() ); console.log( e.latLng.lng() ); } );
				// { -23.001983515270528, 122.07808387499998 }
				window.myMapMarkers = new Map();

				// Set markers
				for(var i = 0; i < buoys.length; i++) {
					var point = new MarkerWithLabel({
						position: {
							lat: parseFloat(buoys[i].lat), 
							lng: parseFloat(buoys[i].lng)
						},
						map: window.myMap,
						title: buoys[i].label,
						labelContent: buoys[i].web_display_name,
						labelAnchor: new googleMaps.Point(0, -2),
						labelClass: "buoy-" + buoys[i].id,
						labelStyle: { opacity: 0.9 }
					});
					// Push on to marker stack
					window.myMapMarkers.set( parseInt( buoys[i].id ), point );

					googleMaps.event.addListener( point, "click", function( e ) { 
						const buoy = this.labelClass;
						if( document.getElementById( buoy ) ) {
							document.getElementById( buoy )
								.scrollIntoView({ behavior: 'smooth' });
						}
					} );

				}
				// Drifting Buoy Data
				wadDrifting( );
			}).catch( (e) => {
				console.error(e);
			});
		}
	}
}

export function wadMapLocator ( trigger ) {
	if( trigger != "undefined" ) {
		trigger.addEventListener( 'click', ( e ) => {
			const buoyId = parseInt( e.target.dataset.buoyId );
			// console.log( e.target.dataset );
			// console.log( typeof( buoyId ) );
			// console.log( window.myMapMarkers );
			if( window.myMapMarkers.has( buoyId ) ) {
				// console.log( window.myMapMarkers.get( buoyId ) );
				const marker = window.myMapMarkers.get( buoyId );
				const center = { 
					lat: marker.position.lat(),
					lng: marker.position.lng()
				};
				window.myMap.panTo( center )
				window.myMap.setZoom( 8 );
				// Animate
				if( marker.getAnimation() > 0 ) {
					marker.setAnimation( undefined );
				}
				marker.setAnimation( window.myGoogleMaps.Animation.BOUNCE ); 
				window.setTimeout( () => { 
					marker.setAnimation( undefined ); 
				}, 2100 );
			}
			else {
				alert( 'Can\'t location buoy ID: ' + buoyId );
			}
		} );
	}
}

export function wadDrifting( ) {
	$.ajax({
    type: 'POST',
    url: wad.ajax,
    data: { action: 'waf_rest_list_buoys_drifting' },
    success: wadProcessDriftingBuoys, // Process list received
    dataType: 'json'
  });
}

export function wadProcessDriftingBuoys( response ) {
	if( window.myGoogleMaps ) {
		for( let i = 0; i < response.length; i++ ) {
			const processed = wadRawDataToChartData( response[i].data );
			let path = [];
			let times = [];
			
			for( let j = 0; j < processed.length; j++ ) {
				if( !isNaN( parseFloat( processed[j]["Latitude (deg)"] ) ) && !isNaN( parseFloat( processed[j]["Longitude (deg) "] ) ) ) {
					path.push( { lat: parseFloat( processed[j]["Latitude (deg)"] ), lng: parseFloat( processed[j]["Longitude (deg) "] ) } );
					times.push( parseInt( processed[j]['Time (UTC)'] ) );
				}
			}

			const driftingPath = new window.myGoogleMaps.Polyline( { 
				path: path,
				geodesic: true,
				strokeColor: "#FF0000",
				strokeOpacity: 1.0,
				strokeWeight: 2,
			} );
			driftingPath.setMap( window.myMap );
			
			// const MarkerWithLabel = require( 'markerwithlabel' )( window.myGoogleMaps );
			
			// let halfDays = [];
			// path = path.reverse();
			// for( let n = 0; n < path.length; n = n + 48 ) {
			// 	// const last = path.pop();
			// 	// const lastTime = times.pop();
			// 	var point = new MarkerWithLabel({
			// 		position: path[n],
			// 		map: window.myMap,
			// 		title: times[n],
			// 		labelContent: new Date( times[n] * 1000 ).toLocaleString(),
			// 		// visible: false,
			// 		labelStyle: { opacity: 1 },
			// 		icon: wad.plugin + 'dist/images/invisble-marker.png'
			// 	});
			// }


		}
	}
}

const mapStyles = [
	{
		"featureType": "all",
		"elementType": "labels.text",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "all",
		"elementType": "labels.icon",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},
	{
		"featureType": "landscape",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"color": "#f1efe8"
			}
		]
	},
	{
		"featureType": "landscape.man_made",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"gamma": "1.19"
			}
		]
	},
	{
		"featureType": "landscape.man_made",
		"elementType": "geometry.stroke",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"gamma": "0.00"
			},
			{
				"weight": "2.07"
			}
		]
	},
	{
		"featureType": "road.highway",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"color": "#b2ac83"
			}
		]
	},
	{
		"featureType": "road.highway",
		"elementType": "geometry.stroke",
		"stylers": [
			{
				"color": "#b2ac83"
			}
		]
	},
	{
		"featureType": "water",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"color": "#588da8"
			}
		]
	}
	];
