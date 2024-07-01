import React from "react";
import {
  Marker
} from '@vis.gl/react-google-maps';
import { Polyline } from "./Polyline";
import { markerIcon, markerTimeIcon, buoyDataToObject, inBounds } from "./map-library";

export const BuoyMarker = ( { 
	details, 
	markerRef, 
	setCenter, 
	setInfoWindow, 
	currentBounds, 
	currentZoom,
	showLive, 
	showHistoric
} ) => {
	const position = { lat: details.lat, lng: details.lng };
	const {
		id,
		is_enabled,
		web_display_name,
		description
	} = details;

	// Only show labels on zoom
	const label = currentZoom > 5 ? web_display_name : "";
	
	// Check if this should be visible
	if( details.is_enabled === 1 && !showLive ) {
		return;
	}
	if( details.is_enabled === 2 && !showHistoric ) {
		return;
	}

	// Polylines for drifting buoys
	let polylinePoints = [];
	let polylineDates = [];
	if( details.drifting && details.data ) {
		// Convert buoy data to lat/lng
		// Ensure buoy lat/lng are valid 
		const buoyData = buoyDataToObject( details.data );
		polylinePoints = buoyData.map( waveData => ( { 
			lat: parseFloat( waveData["Latitude (deg)"] ), 
			lng: parseFloat( waveData["Longitude (deg) "] ) 
		} ) ).filter( ( { lat, lng } ) => ( lat > -85 && lat < 85 && lng > -180 && lng < 180 && lat != NaN && lng != NaN ) );
		// Draw date markers if zoom is great than 6 and this is on screen
		if(currentZoom > 7) {
			let previousTime = 0;
			// Items are ordered newest to oldest
			polylineDates = buoyData.filter( waveData => { 
				// Time is more than a day
				if( previousTime === 0 || parseInt( waveData["Time (UNIX/UTC)"] ) < previousTime ) {
					previousTime = parseInt( waveData["Time (UNIX/UTC)"] ) - 86400; // Time plus one day in seconds
					return true;
				}
				return false;
			} ).filter( waveData => {
				const lat = parseFloat( waveData["Latitude (deg)"] );
				const lng = parseFloat( waveData["Longitude (deg) "] );
				return inBounds( { lat: lat, lng: lng }, currentBounds );
			} ).map( waveData => ({ 
				position: {
					lat: parseFloat( waveData["Latitude (deg)"] ), 
					lng: parseFloat( waveData["Longitude (deg) "] )
				},
				label: waveData["Timestamp (UTC)"].split(" ")[0]
			}) );
		}
	}

	return <>
		<Marker 
			ref={markerRef} 
			position={position} 
			title={web_display_name}
			icon={markerIcon(is_enabled === 1 ? "#e26a26" : "#a0a7ac" )}
			label={label}
			
			onClick={ 
				( e ) => { 
					setCenter( position );
					
					if( is_enabled === 1 ) {
						const card = document.querySelector( '.card[data-buoy-id="' + id + '"]' );
						if( card ) {
							card.scrollIntoView( { behavior: "smooth" } );
						}
					}
					else {
						setInfoWindow( {
						id: id,
						title: web_display_name,
						position: position,
						description: description,
						visible: true
					} );
					}
				}
			}
		/>
		{ polylinePoints.length > 0 && (
			<Polyline 
				strokeColor={"#c4deea"}
				path={ polylinePoints }
				strokeWeight={"2"}
			/>
		) }
		{ polylineDates.length > 0 && (
			polylineDates.map( ( { label, position } ) => (
				<Marker 
					ref={markerRef} 
					position={position} 
					label={ { text: label, fontSize: "12px" } }
					icon={markerTimeIcon("#e26a26")}	
				/>
			) )
		) }
	</>;
}