import React, { useState, useEffect } from "react";
import {
  APIProvider,
  Map,
  Marker,
  useMarkerRef,
	useMap,
	InfoWindow
} from '@vis.gl/react-google-maps';
import { Polyline } from "./Polyline";
import { calculateBounds, markerIcon, markerTimeIcon, buoyDataToObject, inBounds } from "./map-library";

import mapStyles from './map-style.json';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const MapComponent = ( { center } ) => {
	const map = useMap();

	useEffect(( ) => {
    if (!map) return;

		if ( center ) {
			map.panTo( center );
		}

    // do something with the map instance
  }, [map, center]);

	return <></>;
}

export const WavesMap = ( { mode, restrict, buoys } ) => {
  const [markerRef, marker] = useMarkerRef();
	// const [markers, setMarkers] = useState( [] );
	const [center, setCenter] = useState( null );
	const [infoWindow, setInfoWindow] = useState(null);
	const [currentZoom, setCurrentZoom] = useState( null );
	const [currentBounds, setCurrentBounds] = useState( calculateBounds(buoys) );

  useEffect(() => {
    // if (!marker) {
    //   return;
    // }
  }, [marker]);

	const onZoomChange = ( e ) => {
		if( e.detail.zoom != currentZoom ) {
			setCurrentZoom( e.detail.zoom );
			setCurrentBounds( e.detail.bounds );
		}
	}

  return (
		<>
			{ buoys.length > 0 && (
				<APIProvider apiKey={wad.googleApiKey}>
					<Map 
						className="maps" 
						defaultBounds={currentBounds}
						onZoomChanged={(e) => onZoomChange(e)}
						styles={ mapStyles }
					>
						{ buoys && buoys.map( marker => <BuoyMarker 
							markerRef={markerRef} 
							details={ marker } 
							setCenter={setCenter} 
							setInfoWindow={setInfoWindow}
							currentZoom={currentZoom}
							currentBounds={currentBounds}
						/> ) }
					</Map>
					{ infoWindow && (
						<InfoWindow
							position={ infoWindow.position }
							pixelOffset={ [0, -10] }
						>
							<div className="info-window">
								<div className="info-copy">
									<p className="title has-text-align-center">{ infoWindow.title }</p>
									<p className="has-text-align-center">{ infoWindow.description }</p>
								</div>
							</div>
							
						</InfoWindow>
					) }
					<MapComponent center={center} />
				</APIProvider>
			) }
		</>
  );
};

const BuoyMarker = ( { details, markerRef, setCenter, setInfoWindow, currentBounds, currentZoom } ) => {
	const position = { lat: details.lat, lng: details.lng };
	const {
		id,
		is_enabled,
		web_display_name,
		description
	} = details;
	
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
			icon={markerIcon(is_enabled ? "#f4c24f" : "#a0a7ac" )}	
			onClick={ 
				( e ) => { 
					setInfoWindow( {
						id: id,
						title: web_display_name,
						position: position,
						description: description
					} );
					setCenter( position );
				} 
			}
		/>
		{ polylinePoints.length > 0 && (
			<Polyline 
				strokeColor={"#ff0000"}
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
					icon={markerTimeIcon("#f4c24f")}	
				/>
			) )
		) }
	</>;
}
