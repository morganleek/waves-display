// import $ from 'jquery';
import Chart from 'chart.js/auto';
import chartStyles from './chart-style.json';
import chartStylesSimple from './chart-style-simple.json';
import { DateTime } from 'luxon'; 
import ChartActiveAppearance from './chart-active-appearance.json';
import ChartActiveSimpleAppearance from './chart-active-simple-appearance.json';

// Arrows
// let arrowImageOrange = new Image( 28, 28 );
// arrowImageOrange.src = wad.plugin + "images/arrow-grad-orange@2x.png";
// let arrowImageBlue = new Image( 28, 28 );
// arrowImageBlue.src = wad.plugin + "images/arrow-blue-g@2x.png";
// let arrowImagePink = new Image( 28, 28 );
// arrowImagePink.src = wad.plugin + "images/arrow-pink-g@2x.png";

const generateImageArrow = ( fill = "#ffffff", border = "#000000" ) => {
	const vector = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28"><polygon points="10.15 27.5 10.15 18.29 4.59 18.31 14 1.04 23.41 18.31 17.85 18.29 17.85 27.5 10.15 27.5" style="fill: ' + fill + ';stroke-width: 1px;stroke: ' + border + ';"/></svg>'
	// const vector = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 46 52" style="enable-background:new 0 0 46 52" xml:space="preserve"><path fill="' + fill + '" d="M33.2 1.6c.3 0 .5.2.5.5v25.5h7.4c1.1 0 2 .6 2.4 1.6.4 1 .2 2.1-.6 2.8L25.6 49.3c-.7.7-1.6 1.1-2.6 1.1s-1.9-.4-2.6-1.1L3.1 32c-.8-.8-1-1.8-.6-2.8s1.3-1.6 2.4-1.6h7.8V2.1c0-.3.2-.5.5-.5h20z"/><path d="M23 48.9c-.6 0-1.2-.2-1.6-.7L4.1 31c-.5-.5-.3-.9-.2-1.2.1-.2.4-.7 1-.7h9.3v-26h18v26h8.9c.6 0 .9.4 1 .7.1.2.2.8-.2 1.2L24.6 48.2c-.4.5-1 .7-1.6.7m0 3c1.3 0 2.7-.5 3.7-1.5L44 33.1c2.6-2.6.8-7-2.9-7h-5.9v-24c0-1.1-.9-2-2-2h-20c-1.1 0-2 .9-2 2v24H4.9c-3.7 0-5.5 4.4-2.9 7l17.3 17.3c1 1 2.4 1.5 3.7 1.5z"/></svg>';
	const image = new Image( 28, 28 );
	image.src = "data:image/svg+xml," + encodeURIComponent( vector );
	return image;
}

// Tool for parsing Ints
function parseIntOr( intVal, altVal ) {
	if( isNaN( parseInt( intVal ) ) ) {
		if( !isNaN( parseInt( altVal ) ) ) {
			return altVal;
		}
		return 0;
	}
	return parseInt( intVal );
}

// Tool for parse Floats
function parseFloatOr( floatVal, altVal ) {
	if( isNaN( parseFloat( floatVal ) ) ) {
		if( !isNaN( parseFloat( altVal ) ) ) {
			return altVal;
		}
		return 0.0;
	}
	return parseFloat( floatVal );
}

// Reverse rotation
function reverseRotation( rotation ) {
	const reversed = parseIntOr( rotation, 0 ); 
	return ( reversed < 0 ) ? 0 : ( reversed + 180 ) % 360;
}

// Wind speed to knots
function windSpeedToKnots( speed ) {
	return Math.floor( speed * 1.944 * 10 ) / 10;
}

// Get mod for max number of elements
function wadGetMod( max, length ) {
	const mod = Math.ceil( length / max );
	return ( mod >= 1 ) ? mod : 1;
}

const formatGroupedIncludes = ( groupedIncludes ) => {
	let orderedIncludes = [];
	let fIncludes = {};
	// Sort by 'order' attribute
	groupedIncludes.forEach( g => {
		g.items.forEach( ( item ) => { 
			orderedIncludes[item.order] = item;
		} );
	} );
	// Translate to form { ...id: isVisible }
	orderedIncludes.forEach( ( {id, visible} ) => {
		fIncludes[id] = visible;
	} );
	
	return fIncludes;
}

// Process and sort data and push into chart
export function wadGenerateChartData( waves, groupedIncludes, multiplier = 1,  ) {
	const MAX_ARROW_LIMIT = 60;

	// if( !includes ) {
	// 	// Ordering 
	// 	includes = {
	// 		tp: true,
	// 		sst: true, 
	// 		bottomTemp: true,
	// 		hsig: true,
	// 		hsigSwell: true,
	// 		hsigSea: true
	// 	};
	// }
	const includes = formatGroupedIncludes( groupedIncludes );

	if( typeof( waves ) != "undefined" && waves.length > 0 ) {
		let chartLabels = [];
		let dataPoints = generateDataPoints( groupedIncludes );

		// Check again MAX_ARROW_LIMIT
		const mod = wadGetMod( MAX_ARROW_LIMIT, waves.length );

		// Reduced Waves
		// const reducedWaves = waves.filter( ( wave, i ) => ( i % mod == 0 ) );

		// Loop
		waves.forEach( ( wave, i ) => {
			// Time as moment object with offset
			const time = parseInt( wave['Time (UNIX/UTC)'] ) * 1000; // moment.unix( parseInt( wave.time ) ); // .utcOffset( buoyOffset );
			chartLabels.push( time );

			// Has quality data
			if( wave["QF_waves"] == "1" ) {
				// Values
				if( parseFloatOr( wave["Hsig (m)"], -1 ) > 0 ) {
					dataPoints.hsig.data.push( { x: time, y: parseFloatOr( wave["Hsig (m)"], 0.0 ) } );
				}
				// Peak
				if( i % mod == 0 && parseFloatOr( wave["Tp (s)"], -1 ) > 0 ) {
					// if( i % mod == 0 ) { // Reduce to every nth item according to MAX_ARROW_LIMIT
					dataPoints.tp.data.push( { x: time, y: parseFloatOr( wave["Tp (s)"], 0.0 ) } );
					dataPoints.tp.rotation.push( reverseRotation( wave["Dp (deg)"] ) );
					dataPoints.tpdeg.data.push( { x: time, y: wave["Dp (deg)"] } );
					// }
				}
				// Mean
				if( i % mod == 0 && parseFloatOr( wave["Tm (s)"], -1 ) > 0 ) {
					// if( i % mod == 0 ) { // Reduce to every nth item according to MAX_ARROW_LIMIT
					dataPoints.tm.data.push( { x: time, y: parseFloatOr( wave["Tm (s)"], 0.0 ) } );
					dataPoints.tm.rotation.push( reverseRotation( wave["Dm (deg)"] ) );
					dataPoints.tmdeg.data.push( { x: time, y: wave["Dm (deg)"] } );
					// }
				}
				// Spread
				if( parseFloatOr( wave["DpSpr (deg)"], -1 ) > 0 ) {
					dataPoints.dpspr.data.push( { x: time, y: parseFloatOr( wave["DpSpr (deg)"], 0.0 ) } );
				}
				if( parseFloatOr( wave["DmSpr (deg)"], -1 ) > 0 ) {
					dataPoints.dmspr.data.push( { x: time, y: parseFloatOr( wave["DmSpr (deg)"], 0.0 ) } );
				}
			}
			if( !isNaN( wave["SST (degC)"] ) && wave["QF_sst"] == "1" ) {
				dataPoints.sst.data.push( { x: time, y: parseFloatOr( wave["SST (degC)"], 0.0 ) } );
			}
			if( !isNaN( wave["Bottom Temp (degC)"] ) && wave["QF_bott_temp"] == "1") {
				dataPoints.bottomTemp.data.push( { x: time, y: parseFloatOr( wave["Bottom Temp (degC)"], 0.0 ) } );
			}
			dataPoints.windspeed.data.push( { x: time, y: windSpeedToKnots( parseFloatOr( wave["WindSpeed (m/s)"], 0.0 ) ) } );
			dataPoints.windspeed.rotation.push( parseFloatOr( wave["WindDirec (deg)"], 0.0 ) );
			dataPoints.winddirect.data.push( { x: time, y: parseFloatOr( wave["WindDirec (deg)"], 0.0 ) } );
			// Only want last value
			dataPoints.currentMag.data = [{ x: time, y: parseFloatOr( wave["CurrmentMag (m/s)"], 0.0 ) }];
			dataPoints.currentDir.data = [{ x: time, y: parseFloatOr( wave["CurrentDir (deg) "], 0.0 ) }];
			// Extras
			if( typeof( wave["Hsig_swell (m)"] ) !== "undefined" && parseInt( wave["Hsig_swell (m)"] ) !== -9999 ) {
				dataPoints.hsigSwell.data.push( { x: time, y: parseFloatOr( wave["Hsig_swell (m)"], 0.0 ) } );
			}
			if( typeof( wave["Hsig_sea (m)"] ) !== "undefined" && parseInt( wave["Hsig_sea (m)"] ) !== -9999 ) {
				dataPoints.hsigSea.data.push( { x: time, y: parseFloatOr( wave["Hsig_sea (m)"], 0.0 ) } );
			}
			if( typeof( wave["Tm_swell (s)"] ) !== "undefined" && parseInt( wave["Tm_swell (s)"] ) !== -9999 ) {
				dataPoints.tmSwell.data.push( { x: time, y: parseFloatOr( wave["Tm_swell (s)"], 0.0 ) } );
				// Swell Rotation
				if( typeof( wave["Dm_swell (deg)"] ) !== "undefined" && parseInt( wave["Dm_swell (deg)"] ) !== -9999 ) {
					dataPoints.tmSwell.rotation.push( reverseRotation( wave["Dm_swell (deg)"] ) );
					dataPoints.dmSwell.data.push( { x: time, y: parseFloatOr( wave["Dm_swell (deg)"], 0.0 ) } );
				}
				else {
					dataPoints.tmSwell.rotation.push( 0 );
				}
			}
			if( typeof( wave["Tm_sea (s)"] ) !== "undefined" && parseInt( wave["Tm_sea (s)"] ) !== -9999 ) {
				dataPoints.tmSea.data.push( { x: time, y: parseFloatOr( wave["Tm_sea (s)"], 0.0 ) } );
				// Seas Rotation
				if( typeof( wave["Dm_sea (deg)"] ) !== "undefined" && parseInt( wave["Dm_sea (deg)"] ) !== -9999 ) {
					dataPoints.tmSea.rotation.push( reverseRotation( wave["Dm_sea (deg)"] ) );
					dataPoints.dmSea.data.push( { x: time, y: parseFloatOr( wave["Dm_sea (deg)"], 0.0 ) } );
				}
				else {
					dataPoints.dmSea.data.push( 0 );
				}
			}
			
			if( typeof( wave["Dm_sea (deg)"] ) !== "undefined" && parseInt( wave["Dm_sea (deg)"] ) !== -9999 ) {
				
			}
			if( typeof( wave["DmSpr_swell (deg)"] ) !== "undefined" && parseInt( wave["DmSpr_swell (deg)"] ) !== -9999 ) {
				dataPoints.dmSprSwell.data.push( { x: time, y: parseFloatOr( wave["DmSpr_swell (deg)"], 0.0 ) } );
			}
			if( typeof( wave["DmSpr_sea (deg)"] ) !== "undefined" && parseInt( wave["DmSpr_sea (deg)"] ) !== -9999 ) {
				dataPoints.dmSprSea.data.push( { x: time, y: parseFloatOr( wave["DmSpr_sea (deg)"], 0.0 ) } );
			}
		} );
		
		// Times only as int value
		const timesOnly = waves.map( ( wave ) => parseInt(wave['Time (UNIX/UTC)']) );
		
		const startTime = Math.min(...timesOnly) * 1000;
		const endTime = Math.max(...timesOnly) * 1000;
		
		// Max values of each the following datapoints 
		const maxWaveHeight = Math.ceil( Math.max( ...dataPoints.hsig.data.map( ( wave ) => wave.y ) ) );
		const maxPeakPeriod = Math.ceil( Math.max( ...dataPoints.tp.data.map( ( wave )  => wave.y ) ) );
		// const minPeakPeriod = Math.floor( Math.min( ...dataPoints.tp.data.map( ( wave )  => wave.y ) ) );
		// const minPeakPeriodSpaced = ( maxPeakPeriod - ( ( maxPeakPeriod - minPeakPeriod ) * 2 ) );
		const maxTemp = Math.ceil( Math.max( ...dataPoints.sst.data.map( ( wave ) => wave.y ), ...dataPoints.bottomTemp.data.map( ( wave ) => wave.y ) ) );
		const minTemp = Math.floor( Math.min( ...dataPoints.sst.data.map( ( wave ) => wave.y ), ...dataPoints.bottomTemp.data.map( ( wave ) => wave.y ) ) );

		const mBaseFormat = 'dd LLL y h:mma';
		const mStart = DateTime.fromMillis( startTime );
		const mEnd = DateTime.fromMillis( endTime );
		const scaleLabel = mStart.toFormat( mBaseFormat ) + " — " + mEnd.toFormat( mBaseFormat );
		const timeRange = [ mStart.toFormat( 'x' ), mEnd.toFormat( 'x' ) ];

		// Data
		var data = {
			labels: chartLabels,
			datasets: []
		};

		let hasItem = {};

		// Add each item specified
		for (const [key, value] of Object.entries( includes )) {
			if( dataPoints.hasOwnProperty( key ) && dataPoints[key].data.length > 0 ) {
				hasItem[key] = true;
				data.datasets.push( { ...dataPoints[key], id: key } ); 
			}
		}
		
		// Import styles
		const { x, waveHeightAxes, peakPeriodAxes, tempAxes, windSpeedAxes } = wad.buoy_display_chart_swell_only
			? chartStylesSimple.axesStyles
			: chartStyles.axesStyles;

		// X Axis
		const axes = {
			x: {
				...x,
				title: {
					...x.title,
					text: scaleLabel
				},
				ticks: {
					...x.ticks,
					callback: ( tickValue, index, ticks ) => {
						return [
							DateTime.fromMillis( ticks[index].value ).toFormat( "d LLL" ),
							DateTime.fromMillis( ticks[index].value ).toFormat( "HH:MM" )
						];
					}
				}
			}
		};
		
		const isMobile = ( window.innerWidth < 768 ) ? false : true; // Screen size
		
		// Y Axes
		if( hasItem.hasOwnProperty( 'hsig' ) ) {
			// Wave Height Axes
			waveHeightAxes.ticks.max = ( Math.ceil( maxWaveHeight ) > 2 ) ? Math.ceil( maxWaveHeight ) : 2; 
			waveHeightAxes.title.display = isMobile;

			axes["y-axis-1"] = waveHeightAxes;
		}
		
		if( hasItem.hasOwnProperty( 'tp' ) ) {
			// Peak Period Axes
			peakPeriodAxes.ticks.min = 0;
			peakPeriodAxes.ticks.max = ( maxPeakPeriod < 25 ) ? 25 : Math.ceil( maxPeakPeriod / 2 ) * 2;
			peakPeriodAxes.title.display = isMobile;
			peakPeriodAxes.position = ( axes["y-axis-1"] ) ? 'right' : 'left';
			axes["y-axis-2"] = peakPeriodAxes;
		}

		if( ( hasItem.hasOwnProperty( 'sst' ) || hasItem.hasOwnProperty( 'bottomTemp' ) ) && ( includes.sst || includes.bottomTemp ) ) {
			// Temp Axes
			tempAxes.ticks.min = minTemp - 1;
			tempAxes.ticks.max = maxTemp + 1;
			tempAxes.title.display = isMobile;
			tempAxes.position = ( axes["y-axis-1"] ) ? 'right' : 'left';
			axes["y-axis-3"] = tempAxes;
		}

		if( hasItem.hasOwnProperty( 'windspeed' ) ) {
			// Peak Period Axes
			axes["y-axis-4"] = windSpeedAxes;
		}
		
		// Draw Chart
		var config = {
			type: 'line',
			data: data,
			options: {
				responsive: true,
				aspectRatio: wadGetAspectRatio( multiplier ),
				hoverMode: 'index',
				stacked: false,
				plugins: {
					tooltip: {
						callbacks: {
							title: ( tooltip ) => ( ( tooltip.length > 0 ) ? tooltip[0].label.substr(0, 17) : "" ),
							label: labelTooltip,
						}
					},
					legend: {
						display: false,
						position: 'bottom',
						labels: {
							boxWidth: 12
						}
					}
				},
				scales: axes,
			}
		};
		return { config: config, dataPoints: dataPoints, timeLabel: scaleLabel, timeRange: timeRange };
	}
	return false;
} 

// Convert Array of JSON values to Objects
export function wadRawDataToChartData( data ) {
  let processed = [];
  if( data.length > 0 ) {
    for( let i = 0; i < data.length; i++ ) {
      if( data[i].data_points ) {
        try {
          processed.push( JSON.parse( data[i].data_points ) );
        } catch( e ) {
          console.error(e instanceof SyntaxError);
        }
      }
    }
  }

  return processed;
}

// Tooltips for all types
function labelTooltip( tooltipItem ) {
	const { dataIndex, dataset } = tooltipItem;

	switch ( dataset.label ) {
		case "Peak Wave Period & Direction (s & deg)": // Peak Period & Direction
		case "Mean Wave Period & Direction (s & deg)":
			const wavePeriod = dataset.data[dataIndex].y + "s";
			const waveDirection = (dataset.rotation[dataIndex] + 180) % 360;
			// Convert wave direction from type used by chart
			// const waveDirection = dataset.rotation[dataIndex] + "°"; // // Math.abs( dataset.rotation[dataIndex] ) + "°"; // - 180
			return ['Period: ' + wavePeriod, "Direction: " + waveDirection + "°"];
		case "Mean Wave Height Swell & Direction (m & deg)":
		case "Mean Wave Height Sea & Direction (m & deg)":
			const meanHeight = dataset.data[dataIndex].y + "m";
			const meanDirection = (dataset.rotation[dataIndex] + 180) % 360;
			return ['Height: ' + meanHeight, "Direction: " + meanDirection + "°"];
		case "Sea Surface Temperature (°C)": // Temp
			const seaTemperature = dataset.data[dataIndex].y + "°C";
			return 'Temperature: ' + seaTemperature;
		case "Significant Wave Height (m)": // Sig Wave Height
		case "Significant Wave Height Sea (m)":
		case "Significant Wave Height Swell (m)":
			const sigWaveHeight = dataset.data[dataIndex].y + "m";
			return 'Height: ' + sigWaveHeight;
		case "Bottom Temperature (°C)":
			const botTemperature = dataset.data[dataIndex].y + "°C";
			return "Temperature: " + botTemperature;
		default: 
			return '';
	}
}

// Appearance for each datapoint type
const generateDataPoints = groupedIncludes => {
	const types = [ 'hsig', 'tp', 'tm', 'sst', 'bottomTemp', 'windspeed', 'hsigSwell', 'hsigSea', 'tmSwell', 'tmSea' ];

	const includes = formatGroupedIncludes( groupedIncludes );

	// Clone appearance
	let newChartData = wad.buoy_display_chart_swell_only
		? JSON.parse(JSON.stringify(ChartActiveSimpleAppearance))
		: JSON.parse(JSON.stringify(ChartActiveAppearance)); 
	
	// Set arrow styles
	newChartData.tp.pointStyle = generateImageArrow( '#e26a26', '#8c3f18' );
	newChartData.tm.pointStyle = generateImageArrow( '#60bafa', '#3c7699' );
	newChartData.tmSwell.pointStyle = generateImageArrow( '#def3f2', '#4cc0c0' );
	newChartData.tmSea.pointStyle = generateImageArrow( '#ffe1e7', '#ff6686' );

	types.forEach( type => {
		newChartData[type].hidden = ( includes.hasOwnProperty( type ) ) ? !includes[type] : true;
	} );

	return newChartData;
}

export const wadGetAspectRatio = ( multiplier = 1 ) => {
	const sizing = ( window.innerWidth >= 992 ) ? 'desktop' : ( window.innerWidth >= 768 ) ? 'tablet' : ( window.innerWidth >= 450 ) ? 'mobileLandscape' : 'mobilePortrait';
	const ratios = {
		desktop: 2 / multiplier,
		tablet: 2 / multiplier,
		mobileLandscape: 1.75,
		mobilePortrait: 1.5,
	};

	return ratios[sizing];
}
