import React from "react";
import {
  Marker,
	AdvancedMarker
} from '@vis.gl/react-google-maps';
import { Polyline } from "./Polyline";
import { markerIcon, markerTimeIcon, buoyDataToObject, inBounds } from "./map-library";
import classNames from 'classnames';

const SVGMarker = () => (
	<svg className="svg-marker" viewBox="0 0 16 16">
		<path className="border" d="M8,1.63l6.82,4.96-2.61,8.02H3.78L1.18,6.59,8,1.63M8,.39L0,6.2l3.06,9.4h9.89l3.06-9.4L8,.39h0Z" />
		<g className="bg">
			<polygon points="3.42 15.11 .59 6.4 8 1.01 15.41 6.4 12.58 15.11 3.42 15.11" />
		</g>
	</svg>
);

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
	// const label = currentZoom > 5 ? web_display_name : "";
	const label = "";
	
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

	if( isNaN( position.lat ) || isNaN( position.lng ) ) {
		return <></>;
	}
	

	return <>
		<AdvancedMarker 
			ref={markerRef} 
			position={position} 
			title={web_display_name}
			icon={markerIcon(is_enabled === 1 ? "#e26a26" : "#a0a7ac" )}
			onClick={ 
				( e ) => { 
					setCenter( position );
					
					setInfoWindow( {
						id: id,
						title: web_display_name,
						position: position,
						description: description,
						visible: true
					} );

					if( is_enabled === 1 ) {
						const card = document.querySelector( '.card[data-buoy-id="' + id + '"]' );
						if( card ) {
							card.scrollIntoView( { behavior: "smooth" } );
						}
					}
				}
			}
		>
			<SVGMarker />
		</AdvancedMarker>
		{ polylinePoints.length > 0 && (
			<Polyline 
				strokeColor={"#ffabab"}
				path={ polylinePoints }
				strokeWeight={"2"}
			/>
		) }
		{ polylineDates.length > 0 && (
			polylineDates.map( ( { label, position } ) => (
				<AdvancedMarker 
					ref={markerRef} 
					position={position} 
					label={ { text: label, fontSize: "12px" } }
					// icon={markerTimeIcon("#e26a26")}	
				>❌</AdvancedMarker>
			) )
		) }
	</>;
}