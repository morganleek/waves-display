import React, { useState, useEffect, useMemo, useCallback } from "@wordpress/element";
import {
  APIProvider,
  Map,
  useMarkerRef,
	useMap,
	InfoWindow
} from '@vis.gl/react-google-maps';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

import { BuoyMarker } from "./BuoyMarker";
import { MapKey } from "./MapKey";
import { calculateBounds } from "./map-library";

import mapStyles from './map-style.json';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const ClusterBuoyMarkers = ( { 
	buoys, 
	setCenter,
	setInfoWindow,
	currentZoom,
	currentBounds,
	showHistoric,
	showLive 
} ) => {
	const [markers, setMarkers] = useState({});
	
	const map = useMap();
  const clusterer = useMemo(() => {
    if (!map) return null;

    return new MarkerClusterer( { map } );
  }, [map]);

	useEffect(() => {
    if (!clusterer) return;
    clusterer.clearMarkers();
    clusterer.addMarkers(Object.values(markers));
  }, [clusterer, markers]);

	const setMarkerRef = useCallback((marker, key) => {
    setMarkers(markers => {
      if ((marker && markers[key]) || (!marker && !markers[key]))
        return markers;

      if (marker) {
        return {...markers, [key]: marker};
      } else {
        const {[key]: _, ...newMarkers} = markers;

        return newMarkers;
      }
    });
  }, []);

	return (
		<>
			{ buoys.map( marker => <BuoyMarker 
				details={ marker } 
				setCenter={setCenter} 
				setInfoWindow={setInfoWindow}
				currentZoom={currentZoom}
				currentBounds={currentBounds}
				showHistoric={showHistoric}
				showLive={showLive}
				setMarkerRef={setMarkerRef}
			/> ) }
		</>
	);
}

const MapComponent = ( { center } ) => {
	const map = useMap();

	useEffect(( ) => {
    if (!map) return;

		if ( center ) {
			map.panTo( center );
		}
  }, [map, center]);

	return <></>;
}

export const WavesMap = ( { buoys, center, setCenter } ) => {
  const [markerRef, marker] = useMarkerRef();
	// const [markers, setMarkers] = useState( [] );
	// const [center, setCenter] = useState( null );
	const [infoWindow, setInfoWindow] = useState(null);
	const [currentZoom, setCurrentZoom] = useState( null );
	const [currentBounds, setCurrentBounds] = useState( calculateBounds(buoys) );
	const [showLive, setShowLive] = useState( ( wad.buoy_display_init_current ) ? parseInt( wad.buoy_display_init_current ) : true );
	const [showHistoric, setShowHistoric] = useState( ( wad.buoy_display_init_historic ) ? parseInt( wad.buoy_display_init_historic ) : false );

  useEffect(() => {
    // if (!marker) {
    //   return;
    // }
  }, [marker, center]);

	const onZoomChange = ( e ) => {
		if( e.detail.zoom != currentZoom ) {
			setCurrentZoom( e.detail.zoom );
			setCurrentBounds( e.detail.bounds );
		}
	}

  return (
		<>
			{ buoys.length > 0 && (
				<>
				<MapKey
					showLive={showLive}
					setShowLive={setShowLive}
					showHistoric={showHistoric}
					setShowHistoric={setShowHistoric}
				/>
				<APIProvider apiKey={wad.googleApiKey}>
					<Map 
						className="maps" 
						styles={ mapStyles }
						defaultBounds={currentBounds}
						onZoomChanged={(e) => onZoomChange(e)}
						
					>
						{ buoys && <ClusterBuoyMarkers 
							buoys={ buoys } 
							setCenter={setCenter} 
							setInfoWindow={setInfoWindow}
							currentZoom={currentZoom}
							currentBounds={currentBounds}
							showHistoric={showHistoric}
							showLive={showLive}
						/> }
					</Map>
					{ infoWindow && (
						<InfoWindow
							position={ infoWindow.position }
							pixelOffset={ [0, -10] }
							visible={ infoWindow.visible }
							onCloseClick={ () => setInfoWindow( undefined ) }
							maxWidth={ 350 }
						>
							<div className="info-window">
								<div className="info-copy">
									<p className="title has-text-align-center"><strong>{ infoWindow.title }</strong></p>
									<p className="has-text-align-center">{ infoWindow.description }</p>
									{/* { document.querySelector( '.card[data-buoy-id="' + infoWindow.id + '"]' ) && (
										<p className="has-text-align-center">
											<a 
												href="#" 
												className="wp-block-button__link has-blue-color has-text-color has-link-color wp-element-button"
												onClick={ e => { 
													e.preventDefault();
													const card = document.querySelector( '.card[data-buoy-id="' + infoWindow.id + '"]' );
													if( card ) {
														card.scrollIntoView( { behavior: "smooth" } );
													}
												} }	
											>
												<strong>Show Charts</strong>
											</a>
										</p>
									) } */}
								</div>
							</div>
							
						</InfoWindow>
					) }
					<MapComponent center={center} />
				</APIProvider>
				</>
			) }
		</>
  );
};