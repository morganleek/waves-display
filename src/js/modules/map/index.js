import $ from 'jquery';
// Google Maps
const loadGoogleMapsApi = require('load-google-maps-api')
let map;

$(function() {
	if( ajax_object.google_maps_api_key ) {
		// Maps
		if( $('#map').length > 0 ) {
			$('#map').each( function() {
				loadGoogleMapsApi( {
					key: ajax_object.google_maps_api_key
				}).then( (googleMaps) => {
					// Labels
					const MarkerWithLabel = require('markerwithlabel')(googleMaps);

					const lat = parseFloat(ajax_object.starting_lat);
					const lng = parseFloat(ajax_object.starting_lng);
					const zoom = ($(window).width() < 1200) ? 4 : 5;
					const latLng = { lat: lat, lng: lng };
	
					map = new googleMaps.Map(
						this, {
							center: latLng,
							zoom: zoom,
							// styles: mapStyle,
							disableDefaultUI: true,
						}
					);
	
					// Set markers
					for(var i = 0; i < global_points.length; i++) {
						var point = new MarkerWithLabel({
							position: {
								lat: parseFloat(global_points[i][2]), 
								lng: parseFloat(global_points[i][3])
							},
							map: map,
							title: global_points[i][6],
							labelContent: global_points[i][5],
							labelAnchor: new googleMaps.Point(0, -2),
							labelClass: "maps-label", // the CSS class for the label
							labelStyle: {opacity: 0.9}
						});
					}
				}).catch( (e) => {
					console.error(e);
				});
			});
		}

		// Centre Map Buttons
		$('.map-focus').on('click', function(e) {
			let dataBuoy = $(this).closest('.chart-js-layout').attr('data-buoy');
			let lat = 0, lng = 0;
			for( let i = 0; i <= global_points_object.length; i++ ) {
				if( global_points_object[i].buoy_id == dataBuoy ) {
					lat = parseFloat(global_points_object[i].lat);
					lng = parseFloat(global_points_object[i].lng);
					
					// Set Centre and Zoom
					map.setCenter({lat, lng});
					map.setZoom(12);

					break;
				}
			}
		});
	}

	// var map;
	// function initMap() {
	// 	if(document.getElementById('map') !== null) {
	// 		map = new google.maps.Map(document.getElementById('map'), {
	// 		  center: {lat: parseFloat(ajax_object.starting_lat), lng: parseFloat(ajax_object.starting_lng)},
	// 		  zoom: ($(window).width() < 1200) ? 4 : 5
	// 		});

	// 		/*
	// 		** Markers 
	// 		*/
	// 		// Global Pointers
	// 		for(var i = 0; i < global_points.length; i++) {
	// 			var point = new MarkerWithLabel({
	// 				position: {lat: parseFloat(global_points[i][2]), lng: parseFloat(global_points[i][3])},
	// 				// draggable: true,
	// 				// raiseOnDrag: true,
	// 				map: map,
	// 				title: global_points[i][6],
	// 				labelContent: global_points[i][5],
	// 				labelAnchor: new google.maps.Point(0, -2),
	// 				labelClass: "maps-label", // the CSS class for the label
	// 				labelStyle: {opacity: 0.9}
	// 			});
				
	// 			point.addListener('click', function() {
	// 				window.location = this.getTitle();
	// 			});
	// 		}
	// 	}
	// }

	// $.when( $.ready ).then(function() {
	// 	initMap();
	// });
});