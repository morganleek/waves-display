import React, { Component, useState, useEffect } from "react";
import { GoogleMap, LoadScript, MarkerClusterer, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
// import { GoogleMap, useLoadScript, MarkerClusterer, Marker, Polyline } from '@react-google-maps/api';

import { getBuoys, getDriftingBuoys } from '../api/buoys';
import { wadRawDataToChartData } from '../chart/chart-lib';
import { ChartDownloadModal } from "../chart/ChartDownloadModal";

import mapStyles from './map-style.json';

const containerStyle = {
  width: '100%',
  height: '100%'
};

const pin = {
	url: wad.plugin + "images/marker@2x.png",
	labelOrigin: new window.google.maps.Point(0, 24),
	scaledSize: new window.google.maps.Size(14,14),
	anchor: new window.google.maps.Point(7,7)
};

const validateLatLng = ( { lat, lng } ) => {
	if( lat > 90 || lat < -90 || lng > 180 || lng < -180 ) {
		return false;
	}
	return true;
}

export const Map = () => {
	const [center, setCenter] = useState({ lat: -32.04020115615059, lng: 115.70963929875994 });
	const [currentZoom, setCurrentZoom] = useState(12);
	const [markers, setMarkers] = useState([]);

	// Pins
	const [icon, setIcon] = useState( { ...pin } );
	const [decommissionedIcon, setDecommissionedIcon] = useState( { ...pin, url: wad.plugin + "images/marker-decom@2x.png" });
	const [labelIcon, setLabelIcon] = useState( { ...pin, url: wad.plugin + "images/label-marker@2x.png" });

	
	return (
		<div className="maps">
			{ center && currentZoom && markers.length > 0 && (
				mapRender = <LoadScript
					googleMapsApiKey={ ( typeof( wad ) != "undefined" ) ? wad.googleApiKey : '' }
				>
					<GoogleMap
						mapContainerStyle={ containerStyle }
						center={ center }
						zoom={ currentZoom }
						options={{ styles: mode === "theme-dark" ? mapStyles.dark : mapStyles.light }}
						onLoad={ this.onLoad }
						// onBoundsChanged={ this.onBoundsChanged }
						onZoomChanged={ this.onZoomChanged }
					>
						<>{ info }{ cluster }{ polylines }{ polylineLabels }</>
					</GoogleMap>
					{ historicKey }
				</LoadScript>
			) }
		</div>
	);
}

export class _Map extends Component {
	constructor( props ) {
    super( props );
    
    this.state = {
			ref: null,
			markers: [],
			polylines: [],
			polylineTimes: [],
			polylineMarkers: [],
			minLat: 90,
			maxLat: -90,
			minLng: 180,
			maxLng: -180,
			boundsSet: false,
			initBoundsSet: false,
			icon: '',
			labelIcon: '',
			decommissionedIcon: '',
			label: '',
			focus: null,
			historicData: false,
			liveData: true,
			buoyDownloadWindow: false,
			buoyDownloadText: '',
			downloadPath: '',
			downloadEnabled: true,
			currentZoom: 0,
			infoWindow: {
				visible: false,
				lat: 0.0,
				lng: 0.0,
				startDate: '', 
				endDate: '',
				content: ''
			},
			mode: props.mode
    }

		this.handleModalClose = this.handleModalClose.bind( this );
    this.handleDownloadClick = this.handleDownloadClick.bind( this );
  }

	// Init
	componentDidMount() {
		// Check for Current and Historic Settings
		const live = ( wad.buoy_display_init_current ) ? parseInt( wad.buoy_display_init_current ) : true;
		const historic = ( wad.buoy_display_init_historic ) ? parseInt( wad.buoy_display_init_historic ) : false;
		
		// Zoom + Buoy Restrictions
		const { zoom, restrict } = this.props;

		// Set stataes
		this.setState( () => ( { liveData: live, historicData: historic, currentZoom: zoom } ) );

		// Map Data Fetch
		// Get buoys
    // getBuoys( restrict ).then( json => {
		// 	// Bounds
		// 	let bounds = {
		// 		minLat: 90,
		// 		maxLat: -90,
		// 		minLng: 180,
		// 		maxLng: -180
		// 	};

		// 	if( json.length > 0 ) {

		// 		json.forEach( ( element, index ) => {
		// 			const lat = parseFloat( element.lat );
		// 			const lng = parseFloat( element.lng );

		// 			// Bounds Min/Max
		// 			bounds.minLat = ( bounds.minLat < lat ) ? bounds.minLat : lat;
		// 			bounds.maxLat = ( bounds.maxLat > lat ) ? bounds.maxLat : lat;
		// 			bounds.minLng = ( bounds.minLng < lng ) ? bounds.minLng : lng;
		// 			bounds.maxLng = ( bounds.maxLng > lng ) ? bounds.maxLng : lng;

		// 			if( parseInt( element.drifting ) === 0 ) {
						
		// 				let marker = {
		// 					buoyId: element.id,
		// 					label: element.web_display_name,
		// 					lat: lat,
		// 					lng: lng,
		// 					isEnabled: parseInt( element.is_enabled ),
		// 					buoyDownloadText: element.download_text,
		// 					downloadPath: '',
		// 					downloadEnabled: parseInt( element.download_enabled ),
		// 					description: element.description,
		// 					startDate: element.start_date,
		// 					endDate: element.end_date
		// 				};

		// 				this.setState( ( state ) => ( { markers: [...state.markers, marker] } ) );
		// 			}
		// 		} );
		// 	}

		// 	// Check if really zoomed in or only one time and set range to about 0.1 degree +/-
		// 	if( Math.abs( bounds.minLat - bounds.maxLat ) < 0.1 ) {
		// 		bounds.minLat -= 0.05;
		// 		bounds.maxLat += 0.05;
		// 	}
			
		// 	this.setState( () => ( { minLat : bounds.minLat, maxLat : bounds.maxLat, minLng : bounds.minLng, maxLng : bounds.maxLng } ) );

		// 	this.setState( () => ( { boundsSet: true } ) );
		// 	this.setBounds();
    // } );

		// // Get drifting
		// getDriftingBuoys( restrict ).then( json => {
		// 	if( json.length > 0 ) {
		// 		// let driftingMap = json.map( ( row, index ) => {
		// 		json.forEach( ( element, index ) => {

		// 			const processed = wadRawDataToChartData( element.data );
					
		// 			let path = [];
		// 			let pathTimes = [];
					
		// 			for( let j = 0; j < processed.length; j++ ) {
		// 				const lat = parseFloat( processed[j]["Latitude (deg)"] );
		// 				const lng = parseFloat( processed[j]["Longitude (deg) "] );
		// 				if( !isNaN( lat ) && !isNaN( lng ) && validateLatLng( { lat, lng } ) ) {
		// 					path.push( { lat: lat, lng: lng } );
		// 					pathTimes.push( {
		// 						time: parseInt( processed[j]['Time (UNIX/UTC)'] ),
		// 						lat: lat, 
		// 						lng: lng
		// 					} );
		// 				}
		// 			}

		// 			if( path.length > 0 ) {

		// 				const polyLineTime = {
		// 					buoyId: element.id,
		// 					isEnabled: parseInt( element.is_enabled ),
		// 					pathTimes: pathTimes,
		// 					path: path
		// 				};
		// 				this.setState( ( state ) => ( { polylineTimes: [...state.polylineTimes, polyLineTime] } ) );

						
		// 				// Add Marker
		// 				let marker = {
		// 					buoyId: element.id,
		// 					label: element.web_display_name,
		// 					lat: path[0].lat, // First path lat/lng
		// 					lng: path[0].lng, // First path lat/lng
		// 					isEnabled: parseInt( element.is_enabled ),
		// 					buoyDownloadText: element.download_text,
		// 					downloadPath: '',
		// 					downloadEnabled: parseInt( element.download_enabled ),
		// 					content: element.description,
		// 					startDate: element.start_date,
		// 					endDate: element.end_date
		// 				};
						
		// 				this.setState( ( state ) => ( { markers: [...state.markers, marker] } ) );

		// 				// Polyline markers 
		// 				const newMarkers = [];
		// 				// Start date/time
		// 				const startDate = new Date( pathTimes[0].time * 1000 )
		// 				let currentDay = startDate.getDate();
		// 				for( let n = 0; n < pathTimes.length; n++ ) { 
		// 					const pathDate = new Date( pathTimes[n].time * 1000 );
		// 					if( currentDay != pathDate.getDate() ) {
		// 						// Friendly date format
		// 						currentDay = pathDate.getDate();
		// 						const day = pathDate.getDate().toString().padStart( 2, "0" );
		// 						// JS months start a 0 
		// 						const month = ( pathDate.getMonth() + 1 ).toString().padStart( 2, "0" );
		// 						let label = day + '/' + month;

		// 						// Add year for first entry
		// 						if( newMarkers.length == 0 ) {
		// 							label += "/" + pathDate.getFullYear();
		// 						}
								
		// 						// Add to markers
		// 						let driftingMarker = {
		// 							lat: pathTimes[n].lat,
		// 							lng: pathTimes[n].lng,
		// 							label: label,
		// 							key: n + 1000,
		// 							isEnabled: parseInt( element.is_enabled )
		// 						};
		// 						newMarkers.push( driftingMarker );
							
		// 					}
		// 				}
		// 				this.setState( ( state ) => ( { polylineMarkers: [...state.polylineMarkers, ...newMarkers] } ) ); 
		// 			}
		// 		} );
		// 	}
		// } );
  }
		
	onMapPolylineClick = ( polyline ) => {
		// this.initPolylineMarkers( polyline );
		return;
	}

	onMapMarkerClick = ( marker ) => {
		console.log( marker );
		const { ref } = this.state;
		if( ref ) {
			const newCenter = { 
				lat: parseFloat( marker.position.lat ), 
				lng: parseFloat( marker.position.lng ) 
			};
			
			// Pan to and zoom
			ref.panTo( newCenter );
			ref.setZoom( 8 );

			// Update Chart list position
			this.props.updateFocus( marker.buoyId );
		}
	}

	onMapDecommissionedMarkerClick = ( marker ) => {
		const { ref } = this.state;
		if( ref ) {
			const buoyId = marker.buoyId;
			const end = Date.now() / 1000;
			const path = "?action=waf_rest_list_buoy_datapoints_csv&id=" + buoyId + "&start=0&end=" + end;
			const newCenter = { 
				lat: parseFloat( marker.position.lat ), 
				lng: parseFloat( marker.position.lng ) 
			};
			
			// Pan to and zoom
			ref.panTo( newCenter );
			ref.setZoom( 8 );

			// Buoy info
			// const infoWindow = <p>Start date:<br />End Date:<br />Download</p>
	
			this.setState( { 
				infoWindow: {
					visible: true,
					lat: parseFloat( marker.position.lat ), 
					lng: parseFloat( marker.position.lng ),
					content: marker.description,
					startDate: marker.startDate,
					endDate: marker.endDate
				},
				downloadPath: wad.ajax + path,
				buoyDownloadText: marker.buoyDownloadText,
				downloadEnabled: marker.downloadEnabled
			} );
		}
	}

	onInfoWindowDownload = () => {
		// Load download lincense modal and hide window
		this.setState( {
			buoyDownloadWindow: true,
			infoWindow: {
				visible: false,
				lat: 0.0, 
				lng: 0.0,
				content: ''
			}
		} );
	}

	onCloseInfoWindow = () => {
		// Close window and clear download modal data
		this.setState( { 
			infoWindow: {
				visible: false,
				lat: 0.0, 
				lng: 0.0,
				content: ''
			},
			downloadPath: '',
			buoyDownloadText: '',
			downloadEnabled: true
		} );
	}

	onLoad = ( ref ) => {
		const icon = {
			url: wad.plugin + "images/marker@2x.png",
			labelOrigin: new window.google.maps.Point(0, 24),
			scaledSize: new window.google.maps.Size(14,14),
			anchor: new window.google.maps.Point(7,7)
		};

		const decommissionedIcon = {
			url: wad.plugin + "images/marker-decom@2x.png",
			labelOrigin: new window.google.maps.Point(0, 24),
			scaledSize: new window.google.maps.Size(14,14),
			anchor: new window.google.maps.Point(7,7)
		};

		const labelIcon = {
			url: wad.plugin + "images/label-marker@2x.png",
			labelOrigin: new window.google.maps.Point(0, 20),
			scaledSize: new window.google.maps.Size(8,8),
			anchor: new window.google.maps.Point(4,4)
		}

		this.setState( { icon: icon, decommissionedIcon: decommissionedIcon, labelIcon: labelIcon, ref: ref } );
	}

	// onBoundsChanged = ( ) => {
	// 	this.setBounds( );
	// }

	onZoomChanged = ( ) => {
		const { ref } = this.state;
		if( ref ) {
			this.setState( { currentZoom: ref.getZoom() } );
		}
	}

	onHistoricChange = ( newState ) => {
		this.setState( { historicData: newState.target.checked } );
	}
	
	onLiveChange = ( newState ) => {
		this.setState( { liveData: newState.target.checked } );
	}

	handleDownloadClick() {
    const { downloadPath } = this.state;
    window.location = downloadPath;
    this.setState( { downloadPath: '', buoyDownloadText: '', buoyDownloadWindow: false, downloadEnabled: true } );
  }

  handleModalClose() {
    this.setState( { downloadPath: '', buoyDownloadText: '', buoyDownloadWindow: false, downloadEnabled: true } );
  }
	
	setBounds = ( ) => {
		// Set initial bounds
		setTimeout( () => {
			const { boundsSet, initBoundsSet, ref } = this.state;
			if( ref && boundsSet && !initBoundsSet ) {
				const { minLat, minLng, maxLat, maxLng } = this.state;
				// Ensure it doesn't happen on resize
				this.setState( () => ( { initBoundsSet: true } ) );
				// Set bounds
				ref.fitBounds( {
					east: maxLng, 
					north: maxLat, 
					south: minLat,
					west: minLng,
				} );
			}
		}, 1000 );
	}

  render() {
		console.log( 'render' );
		const { center } = this.props;
		const { 
			markers, 
			polylineTimes, 
			polylineMarkers, 
			icon, 
			labelIcon, 
			decommissionedIcon, 
			historicData, 
			liveData, 
			downloadPath, 
			buoyDownloadWindow,
			buoyDownloadText, 
			downloadEnabled,
			currentZoom,
			infoWindow,
			mode
		} = this.state;

		// console.log( markers );
	
		// Polylines
		let polylines = [];
		if( polylineTimes ) {
			polylines = polylineTimes.map( ( marker, i ) => {
				if( ( marker.isEnabled !== 1 && !historicData ) || ( marker.isEnabled == 1 && !liveData ) ) {
					// Hide historic buoys OR hide live buoys
					return;
				}
				return <MapPolyline 
					buoyId={ marker.buoyId } 
					key={ marker.pathTimes.length } 
					polylineFocus={ this.onMapPolylineClick }
					pathTimes={ marker.pathTimes }
					options={ {
						path: marker.path,
						geodesic: true,
						strokeColor: "#FF0000",
						strokeOpacity: 1.0,
						strokeWeight: 2,
						clickable: true
					} 
				} />;
			} );
		}
		
		// Show polyline markers when zoom is >= 7
		let polylineLabels = [];
		if( polylineMarkers && currentZoom >= 7 ) {
			polylineLabels = polylineMarkers.map( ( marker, i ) => {
				if( ( marker.isEnabled !== 1 && !historicData ) || ( marker.isEnabled == 1 && !liveData ) ) {
					// Hide historic buoys OR hide live buoys
					return;
				}
				return <Marker 
					position={ { lat: marker.lat, lng: marker.lng } } 
					icon={ labelIcon } 
					label={ { text: marker.label, fontSize: '11px' } } 
					key={ marker.key } 
					clickable={ false }
				/>
			} );
		}
		

		let cluster;
		if( markers ) {
			cluster = <MarkerClusterer gridSize={ 30 } maxZoom={ 7 }>
				{ ( clusterer ) => 
					markers.map( ( marker, i ) => {
						if( ( marker.isEnabled !== 1 && !historicData ) || ( marker.isEnabled == 1 && !liveData ) ) {
							// Hide historic buoys OR hide live buoys
							return;
						}
						// console.log( marker );
						return (
							<MapMarker 
								{...marker}
								// buoyId={ marker.buoyId } 
								icon={ ( marker.isEnabled == 1 ) ? icon : decommissionedIcon } 
								position={ { lat: marker.lat, lng: marker.lng } } 
								label={ { text: marker.label, fontSize: '13px' } } 
								key={ i } 
								clusterer={ clusterer } 
								markerFocus={ (marker.isEnabled == 1 ) ? this.onMapMarkerClick : this.onMapDecommissionedMarkerClick } 
								buoyDownloadText={ marker.buoyDownloadText }
								startDate={ marker.startDate }
								endDate={ marker.endDate }
								description={ marker.description }
								downloadEnabled={ marker.downloadEnabled }
							/>
						) 
					} )
				}
			</MarkerClusterer>
		}

		// Download popup 
		let chartModal;
		if( buoyDownloadWindow ) { // downloadPath.length > 0
			const ref = React.createRef();
			chartModal = <ChartDownloadModal 
				title="Terms and Conditions"
				license={ buoyDownloadText }
				close={ this.handleModalClose }
				download={ this.handleDownloadClick }
				downloadEnabled={ downloadEnabled }
				ref={ ref }
			/>;
		}

		let info = '';
		if( infoWindow?.visible ) {
			const sDate = new Date( infoWindow.startDate * 1000 );
			const eDate = new Date( infoWindow.endDate * 1000 );
			
			info = <InfoWindow
				position={ { lat: infoWindow.lat, lng: infoWindow.lng } }
				options={ { closeBoxURL: '', enableEventPropagation: true } }
				onCloseClick={ this.onCloseInfoWindow }
			>
				<div style={ { opacity: 1, padding: '6px 12px', backgroundColor: '#ffffff' } }>
					<div style={ { fontSize: '14px' } }>
						<p>{ infoWindow.content }</p>
						<p>
							Start date: { sDate.toDateString() }<br />
							End date: { eDate.toDateString() }<br />
						</p>
						<p>
							
							<a href="#" onClick={ this.onInfoWindowDownload }>Download Data Archive</a>
						</p>
					</div>
				</div>
			</InfoWindow>;	
		}

		let historicKey = '';
		if( wad.buoy_display_key == undefined || wad.buoy_display_key == "1" ) {
			// Run also if no setting defined
			historicKey = <div id="historic-data">
				<label htmlFor="show-historic">
					<input 
						type="checkbox"
						name="show-historic"
						checked={ historicData }
						onChange={ this.onHistoricChange }
						/>&nbsp;Historical Data
				</label>
				<label htmlFor="show-live">
					<input 
						type="checkbox"
						name="show-live"
						checked={ liveData }
						onChange={ this.onLiveChange }
						/>&nbsp;Live Data
				</label>
			</div>;
		}

		let mapRender = undefined; // <div className="loading"><p>Loading&hellip;</p></div>;
		
		// Load when markers, zoom and center are defined
		if( center && currentZoom && markers.length > 0 ) {
			mapRender = <LoadScript
				googleMapsApiKey={ ( typeof( wad ) != "undefined" ) ? wad.googleApiKey : '' }
			>
				<GoogleMap
					mapContainerStyle={ containerStyle }
					center={ center }
					zoom={ currentZoom }
					options={{ styles: mode === "theme-dark" ? mapStyles.dark : mapStyles.light }}
					onLoad={ this.onLoad }
					// onBoundsChanged={ this.onBoundsChanged }
					onZoomChanged={ this.onZoomChanged }
				>
					<>{ info }{ cluster }{ polylines }{ polylineLabels }</>
				</GoogleMap>
				{ historicKey }
			</LoadScript>;
		}

    return (
			<div className="maps">
				{ chartModal }
				{ mapRender }
			</div>
    )
  }
}

const MapMarker = ( props ) => (
	<Marker onClick={ () => { props.markerFocus( props ) } } { ...props }>
		{ props.children }
	</Marker>
);

const MapPolyline = ( props ) => (
	<Polyline onClick={ () => { props.polylineFocus( props ) } } { ...props } />
);
