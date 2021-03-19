import $ from 'jquery';
import Chart from 'chart.js';
import { wadToggleChart, wadDatePicker, wadCSVDownload } from './chart-events';
import { wadProcessBuoyData } from './buoy-data';
import { wadMapLocator } from '../map';
import chartStyles from './chart-style';
import moment from 'moment';

const panelWrapper = "<div class='card card-primary mb-3'>" +
  "<div class='card-header'>" +
		"<h6 class='pull-left text-white'>{{ buoyLabel }} <span style='opacity: 0.35;'>#{{ buoyId }}</span><time></time></h6>" + 
		"<div class='btn-group chart-js-menu pull-right' role='group' aria-label='Chart Tools'>" + 
			"<button class='maps-trigger btn btn-outline-secondary' data-buoy-id='{{ buoyId }}' data-buoy-lat='{{ buoyLat }}' data-buoy-lng='{{ buoyLng }}'><i class='fa fa-crosshairs' aria-hidden='true'></i>&nbsp;&nbsp;Centre</button>" +
			"<button class='download-trigger btn btn-outline-secondary' data-buoy-id='{{ buoyId }}'><i class='fa fa-floppy-o' aria-hidden='true'></i>&nbsp;&nbsp;Export Data</button>" +
			"<button class='calendars-trigger btn btn-outline-secondary' data-buoy-id='{{ buoyId }}' data-buoy-start='{{ buoyStartTime }}' data-buoy-end='{{ buoyEndTime }}'><i class='fa fa-calendar' aria-hidden='true'></i>&nbsp;&nbsp;<span class='dateRangeButtonLabel'>Date Range</span> <i class='fa fa-caret-down' aria-hidden='true'></i></button>" +
		"</div>" +
	"</div>" + 
	"<div class='card-body'>" + 
    "<div class='canvas-wrapper loading'>" +
      "<canvas></canvas>" +
    "</div>" +
    "<h5 class='latest-observations'>Latest Observations <time></time></h5>" +
		"<div class='chart-info'></div>" +
  "</div>" +
"</div>";

export function wadInitCharts( response ) {
	const buoysWrapper = document.getElementById( 'buoys' );
	// Save Buoy Data
	if( window.buoysData == undefined ) {
		window.buoysData = new Map();
	}
	// Setup boxes
	for( let i = 0; i < response.length; i++ ) {
		// Push on to stack
		window.buoysData.set( parseInt( response[i].id ), response[i] );
		// Setup visuals
		const newBuoyWrapper = document.createElement( "div" );
		newBuoyWrapper.id = "buoy-" + response[i].id;
		// Internals
		const newPanelWrapper = panelWrapper.replaceAll( '{{ buoyLabel }}', response[i].web_display_name )
			.replaceAll( '{{ buoyId }}', response[i].id )
			.replaceAll( '{{ buoyLat }}', response[i].lat )
			.replaceAll( '{{ buoyLng }}', response[i].lng )
			.replaceAll( '{{ buoyStartTime }}', response[i].start_date )
			.replaceAll( '{{ buoyEndTime }}', response[i].end_date );
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

// var HourDayScale = Chart.scaleService.getScaleConstructor('time').extend({
    
  // generateTickLabels(ticks) {
  //   let i, ilen, tick;

  //   for (i = 0, ilen = ticks.length; i < ilen; ++i) {
  //     tick = ticks[i];
  //     tick.label = this._tickFormatFunction(tick.value, i, ticks);
  //   }
  // }
    
// });
// Chart.scaleService.registerScaleType('hourdaytime', HourDayScale );

function parseIntOr( intVal, altVal ) {
	if( isNaN( parseInt( intVal ) ) ) {
		if( !isNaN( parseInt( altVal ) ) ) {
			return altVal;
		}
		return 0;
	}
	return parseInt( intVal );
}

function parseFloatOr( floatVal, altVal ) {
	if( isNaN( parseFloat( floatVal ) ) ) {
		if( !isNaN( parseFloat( altVal ) ) ) {
			return altVal;
		}
		return 0.0;
	}
	return parseFloat( floatVal );
}

export function wadGenerateChartData( waves ) {
	if( typeof( waves ) != "undefined" && waves.length > 0 ) {
		// let arrowPointers = [];
		// let hasWaves = false;
		let chartLabels = [];
		
		let dataPoints = {
			hsig: { data: [], showInChart: true, description: "Significant Wave Height (m)" }, // let hsig = []; // 
			tp: { data: [], showInChart: true, description: "Peak Wave Period (s)" }, // let tp = []; // 
			tm: { data: [], showInChart: false, description: "Mean Wave Period (s)" }, // let tm = []; // 
			dp: { data: [], showInChart: true, description: "Peak Wave Direction (deg)" }, // let dp = []; // 
			dpspr: { data: [], showInChart: true, description: "Peak Wave Directional Spreading (deg)" }, // let dpspr = []; // 
			dm: { data: [], showInChart: false, description: "Mean Wave Direction (deg)" }, // let dm = []; // 
			dmspr: { data: [], showInChart: false, description: "Mean Wave Directional Spreading (deg)" }, // let dmspr = []; // 
			sst: { data: [], showInChart: true, description: "Sea Surface Temperature (degC)" }, // let sst = []; // 
			bottomTemp: { data: [], showInChart: true, description: "Sea Bottom Temperature (degC)" }, // let bottomTemp = []; // 
			windspeed: { data: [], showInChart: false, description: "Wind Speed (m/s)" }, // let windspeed = []; // 
			winddirec: { data: [], showInChart: false, description: "Wind Direction (deg)" }, // let winddirec = []; // 
			currentMag: { data: [], showInChart: false, description: "Current Mag (m/s)" }, // let currentMag = []; // 
			currentDir: { data: [], showInChart: false, description: "Current Direction (deg)" }, // let currentDir = []; 
			// qfWaves: { data: [], showInChart: false, description: "" }, // let qfWaves = []; // QF_waves  - quality flag for wave variables
			// qfSst: [], // let qfSst = [];  // QF_sst  – quality flag for sea surface temperature
			// qfBottTemp: [], // let qfBottTemp = []; // QF_bott_temp – quality flag for bottom temperature
		};

		let arrowImageOrange = new Image( 28, 28 );
		arrowImageOrange.src = wad.plugin + "dist/images/arrow-orange-g@2x.png";
		let arrowImageBlue = new Image( 28, 28 );
		arrowImageBlue.src = wad.plugin + "dist/images/arrow-blue-g@2x.png";
		let arrowImagePink = new Image( 28, 28 );
		arrowImagePink.src = wad.plugin + "dist/images/arrow-pink-g@2x.png";

	
		// Loop
		for( let i = 0; i < waves.length; i++ ) {
			// Time as moment object with offset
			const time = parseInt( waves[i]['Time (UNIX/UTC)'] ) * 1000; // moment.unix( parseInt( waves[i].time ) ); // .utcOffset( buoyOffset );
			chartLabels.push( time );

			if( waves[i]["QF_waves"] == "1" ) {
				// hasWaves = true; // Needs to be here incase there are no valid waves
				// Values
				if( parseFloatOr( waves[i]["Hsig (m)"], -1 ) > 0 ) {
					dataPoints.hsig.data.push( { x: time, y: parseFloatOr( waves[i]["Hsig (m)"], 0.0 ) } );
				}
				// Peak
				if( parseFloatOr( waves[i]["Tp (s)"], -1 ) > 0 ) {
					dataPoints.tp.data.push( { x: time, y: parseFloatOr( waves[i]["Tp (s)"], 0.0 ) } );
					const dpDeg = parseIntOr( waves[i]["Dp (deg)"], 0 ); // Rotation
					dataPoints.dp.data.push( ( dpDeg < 0 ) ? 0 : ( dpDeg + 180 ) % 360 );
				}
				// Mean
				if( parseFloatOr( waves[i]["Tm (s)"], -1 ) > 0 ) {
					dataPoints.tm.data.push( { x: time, y: parseFloatOr( waves[i]["Tm (s)"], 0.0 ) } );
					const dmDeg = parseIntOr( waves[i]["Dm (deg)"], 0 ); // Rotation
					dataPoints.dm.data.push( ( dmDeg < 0 ) ? 0 : ( dmDeg + 180 ) % 360 );
				}
				// Spread
				if( parseFloatOr( waves[i]["DpSpr (deg)"], -1 ) > 0 ) {
					dataPoints.dpspr.data.push( { x: time, y: parseFloatOr( waves[i]["DpSpr (deg)"], 0.0 ) } );
				}
				if( parseFloatOr( waves[i]["DmSpr (deg)"], -1 ) > 0 ) {
					dataPoints.dmspr.data.push( { x: time, y: parseFloatOr( waves[i]["DmSpr (deg)"], 0.0 ) } );
				}
			}
			if( waves[i]["QF_sst"] == "1" ) {
				dataPoints.sst.data.push( { x: time, y: parseFloatOr( waves[i]["SST (degC)"], 0.0 ) } );
			}
			if( waves[i]["QF_bott_temp"] == "1") {
				dataPoints.bottomTemp.data.push( { x: time, y: parseFloatOr( waves[i]["Bottom Temp (degC)"], 0.0 ) } );
			}
			dataPoints.windspeed.data.push( { x: time, y: parseFloatOr( waves[i]["WindSpeed (m/s)"], 0.0 ) } );
			dataPoints.winddirec.data.push( { x: time, y: parseFloatOr( waves[i]["WindDirec (deg)"], 0.0 ) } );
			// Only want last value
			dataPoints.currentMag.data = [{ x: time, y: parseFloatOr( waves[i]["CurrmentMag (m/s)"], 0.0 ) }];
			dataPoints.currentDir.data = [{ x: time, y: parseFloatOr( waves[i]["CurrentDir (deg) "], 0.0 ) }];
		}
		
		const startTime = Math.min(...waves.map( ( wave ) => wave['Time (UNIX/UTC)'] ) ) * 1000;
		const endTime = Math.max(...waves.map( ( wave ) => wave['Time (UNIX/UTC)'] ) ) * 1000;
		const startTimeRounded = ( Math.ceil( startTime / 3600000 ) + 1 ) * 3600000;
		const endTimeRounded = ( Math.ceil( endTime / 3600000 ) + 1 ) * 3600000;
		
		const maxWaveHeight = Math.ceil( Math.max( ...dataPoints.hsig.data.map( ( wave ) => wave.y ) ) );
		const maxPeakPeriod = Math.ceil( Math.max( ...dataPoints.tp.data.map( ( wave )  => wave.y ) ) );
		const minPeakPeriod = Math.floor( Math.min( ...dataPoints.tp.data.map( ( wave )  => wave.y ) ) );
		const minPeakPeriodSpaced = ( maxPeakPeriod - ( ( maxPeakPeriod - minPeakPeriod ) * 2 ) );
		const maxTemp = Math.ceil( Math.max( ...dataPoints.sst.data.map( ( wave ) => wave.y ), ...dataPoints.bottomTemp.data.map( ( wave ) => wave.y ) ) );
		const minTemp = Math.floor( Math.min( ...dataPoints.sst.data.map( ( wave ) => wave.y ), ...dataPoints.bottomTemp.data.map( ( wave ) => wave.y ) ) );

		// console.log( dataPoints.bottomTemp.data );
		// console.log( Math.max( ...dataPoints.sst.data.map( ( wave ) => wave.y ), ...dataPoints.bottomTemp.data.map( ( wave ) => wave.y ) ) );

		const mStart = moment( startTimeRounded );
		const mEnd = moment( endTimeRounded );
		// const mBaseFormat = 'hh:mma D MMM YYYY';
		// const mStartFormat = ( endTime - startTime > 31536000000 ) ? mBaseFormat : 'h:mma D MMM';
		const mBaseFormat = 'DD/MM/YYYY h:mma';
		const scaleLabel = mStart.format( mBaseFormat ) + " — " + mEnd.format( mBaseFormat );
		const timeRange = [ mStart.format( 'x' ), mEnd.format( 'x' ) ];

		// Data
		var data = {
			labels: chartLabels,
			datasets: []
		};

		let hasHSig = false;
		let hasTp = false;
		// let hasTm = false;
		let hasSurfTemp = false;
		let hasBottTemp = false;

		if( dataPoints.hsig.data.length > 0 ) {
			hasHSig = true;
			data.datasets.push({
				label: window.innerWidth >= 768 ? 'Significant Wave Height (m)' : 'Sig Wave (m)', // Wave Height (m)
				backgroundColor: 'rgba(75, 192, 192, 0.5)',
				borderColor: 'rgba(75, 192, 192, 1)',
				borderWidth: 0,
				lineTension: 0,
				pointRadius: 2,
				fill: true,
				data: dataPoints.hsig.data,
				yAxisID: 'y-axis-1',
			});	
		}
		if( dataPoints.tp.data.length > 0 ) {
			hasTp = true;
			data.datasets.push({					
				label: window.innerWidth >= 768 ? 'Peak Wave Period & Direction (s & deg)' : 'Peak Wave/Dir (s & deg)', // Peak Period (s)
				backgroundColor: '#0f0f0f',
				borderColor: 'rgba(235, 127, 74, 0.5)',
				borderWidth: 0,
				lineTension: 0,
				pointRadius: 35,
				pointStyle: arrowImageOrange,
				rotation: dataPoints.dp.data,
				fill: false,
				data: dataPoints.tp.data,
				yAxisID: 'y-axis-2',
				showLine: false
			});
		}
		// if( dataPoints.tm.data.length > 0 ) {
		// 	data.datasets.push({					
		// 		label: window.innerWidth >= 768 ? 'Mean Wave Period & Direction (s & deg)' : 'Mean Wave/Dir (s & deg)', // Peak Period (s)
		// 		backgroundColor: 'rgba(77, 168, 248, 0.7)',
		// 		borderColor: 'rgba(77, 168, 248, 0.5)',
		// 		borderWidth: 0,
		// 		lineTension: 0,
		// 		pointRadius: 35,
		// 		pointStyle: arrowImageBlue,
		// 		rotation: dataPoints.dm.data,
		// 		fill: false,
		// 		data: dataPoints.tm.data,
		// 		yAxisID: 'y-axis-2',
		// 		hidden: true
		// 	});
		// }
		if( dataPoints.sst.data.length > 0 ) {
			hasSurfTemp = true;
			data.datasets.push({					
				label: window.innerWidth >= 768 ? 'Sea Surface Temperature (°C)' : 'Sea Surf (°C)', 
				backgroundColor: 'rgba(194, 59, 34, 1)',
				borderColor: 'rgba(194, 59, 34, 1)',
				borderWidth: 0,
				lineTension: 0,
				pointRadius: 2,
				fill: false,
				data: dataPoints.sst.data,
				yAxisID: 'y-axis-3',
				// hidden: true
			});
		}
		// if( dataPoints.bottomTemp.data.length > 0 ) {
		// 	hasBottTemp = true;
		// 	data.datasets.push({					
		// 		label: window.innerWidth ? 'Bottom Temperature (°C)' : 'Bot Temp (°C)',
		// 		backgroundColor: 'rgb(255, 159, 64, 0.5)',
		// 		borderColor: 'rgb(255, 159, 64, 1)',
		// 		borderWidth: 0,
		// 		lineTension: 0,
		// 		pointRadius: 2,
		// 		fill: false,
		// 		data: dataPoints.bottomTemp.data,
		// 		yAxisID: 'y-axis-3',
		// 		// hidden: true
		// 	});
		// }

		// Time Axes (x)
		const timeAxes = chartStyles.axesStyles.timeAxes;
		timeAxes.ticks.min = new Date( startTimeRounded );
		timeAxes.type = 'time';
		// All x Axes'
		const xAxes = [ timeAxes ];

		// Y Axes
		const yAxes = [ ];

		if( hasHSig ) {
			// Wave Height Axes
			const waveHeightAxes = chartStyles.axesStyles.waveHeightAxes;
			waveHeightAxes.ticks.max = ( Math.ceil( maxWaveHeight ) > 2 ) ? Math.ceil( maxWaveHeight ) : 2; 
			waveHeightAxes.scaleLabel.display = ( window.innerWidth < 768 ) ? false : true;
			yAxes.push( waveHeightAxes );
		}
		
		if( hasTp ) {
			// Peak Period Axes
			const peakPeriodAxes = chartStyles.axesStyles.peakPeriodAxes;
			// peakPeriodAxes.ticks.min = ( minPeakPeriodSpaced > 0 ) ? minPeakPeriodSpaced : 0;
			// peakPeriodAxes.ticks.max = Math.ceil( maxPeakPeriod / 2 ) * 2;
			peakPeriodAxes.ticks.min = 0;
			peakPeriodAxes.ticks.max = ( maxPeakPeriod < 25 ) ? 25 : Math.ceil( maxPeakPeriod / 2 ) * 2;
			peakPeriodAxes.scaleLabel.display = ( window.innerWidth < 768 ) ? false : true;
			yAxes.push( peakPeriodAxes );
		}

		if( hasSurfTemp || hasBottTemp ) {
			// Temp Axes
			const tempAxes = chartStyles.axesStyles.tempAxes;
			tempAxes.ticks.min = minTemp - 1;
			tempAxes.ticks.max = maxTemp + 1;
			tempAxes.scaleLabel.display = ( window.innerWidth < 768 ) ? false : true;
			yAxes.push( tempAxes );
		}
		
		// Draw Chart
		var config = {
			type: 'line',
			data: data,
			options: {
				responsive: true,
				aspectRatio: window.innerWidth >= 768 ? 2.15 : 2.25, // ( window.innerWidth < 768 ) ? 15 : 
				hoverMode: 'index',
				stacked: false,
				title: {
					display: true,
					text: 'Click legend labels to toggle their appearance',
					fontSize: 12,
					fontStyle: 'normal',
					fontFamily: "'Lato', sans-serif",
					padding: 0,
					lineHeight: 1.1,
					fontColor: '#989898'
				},
				scales: {
					xAxes: xAxes,
					yAxes: yAxes,
				},
				plugins: {
					legend: {
						
					},
				},
				legend: {
					labels: {
						boxWidth: 15,
						fontColor: '#000000'
					}
				},
				tooltips: {
					callbacks: {
						label: function(tooltipItem, data) {
							if( ( tooltipItem.datasetIndex == 2 || tooltipItem.datasetIndex == 3 ) && data.datasets.hasOwnProperty( 3 ) ) {
								// Temp data and Bottom Temp Exists
								const otherIndex = ( tooltipItem.datasetIndex == 2 ) ? 3 : 2;
								const firstValue = Math.round(tooltipItem.yLabel * 100) / 100;
								const secondValue = Math.round(data.datasets[otherIndex].data[tooltipItem.index].y * 100) / 100;
								if( firstValue != secondValue ) {
									let firstLabel = data.datasets[tooltipItem.datasetIndex].label || '';
									let secondLabel = data.datasets[otherIndex].label || '';
									firstLabel = ( firstLabel ) ? firstLabel + ': ' + firstValue : firstValue;
									secondLabel = ( secondLabel ) ? secondLabel + ': ' + secondValue : secondValue;
									return [ firstLabel, secondLabel ];
								}
							}
							// Everything else
							var label = data.datasets[tooltipItem.datasetIndex].label || '';

							if (label) {
								label += ': ';
							}
							label += Math.round(tooltipItem.yLabel * 100) / 100;
							return label;
							
						}
					}
				}
			}
		};
		return { config: config, dataPoints: dataPoints, timeLabel: scaleLabel, timeRange: timeRange };
	}
	return false;
} 

export function wadDrawLatestTable( buoyId, dataPoints ) {
	//
	// Make work with new draw method
	//
	let buoyInfoHtml = "";
	
	for( const [key, value] of Object.entries( dataPoints ) ) {
		// Show only if wanted
		if( value.showInChart ) {
			// Max value
			const recent = value.data[0];
			
			if( typeof( recent ) != "undefined" ) {
				let recentValue;
				
				switch ( typeof( recent ) ) {
					case "object": // { x, y }
						if( recent.hasOwnProperty( 'y' ) && recent.y > 0 ) {
							recentValue = recent.y;
						}
						break;
					case "number": // y - direction values
						recentValue = ( recent + 180 ) % 360;
						// recentValue = recent;
					default:
						break;
				}
				
				// Append value to table
				if( recentValue ) {
					buoyInfoHtml += "<li>" + value.description + 
						"<span class='value'>" + recentValue + "</span></li>";
				}
			}
		}
	}
	
	const buoyWrapper = document.getElementById( 'buoy-' + buoyId );
	// Time
	let time = "";
	if( window.buoysData != undefined && window.buoysData.has( parseInt( buoyId ) ) ) {
		const lastUpdate = moment( window.buoysData.get( parseInt( buoyId ) ).last_update * 1000 );
		const queryTime = moment( window.buoysData.get( parseInt( buoyId ) ).now * 1000 );
		
		const timeDiff = queryTime.diff( lastUpdate, 'hours' );
		const hasWarning = ( timeDiff >= 3 ) ? true : false;
		const formattedTime = ( timeDiff >= 3 ) ? lastUpdate.format( 'h:mma DD/MM/YYYY' ) + ' (' + timeDiff + ' hours ago)' : lastUpdate.format( 'h:mma DD/MM/YYYY' );

		const latestObservations = buoyWrapper.getElementsByClassName( 'latest-observations' )[0];
		latestObservations.getElementsByTagName( 'time' )[0].innerHTML = formattedTime;
		latestObservations.getElementsByTagName( 'time' )[0].classList.toggle( 'warning', hasWarning );
	}
	// Clear it
	const chartInfo = buoyWrapper.getElementsByClassName("chart-info")[0];
	chartInfo.innerHTML = "";
	chartInfo.insertAdjacentHTML( 'afterbegin', "<ul>" + buoyInfoHtml + "</ul>" );
	chartInfo.addEventListener( 'click', wadToggleChart );
}

export function wadDrawTable( buoyId, dataPoints ) {
	//
	// Make work with new draw method
	//
	let buoyInfoHtml = "";
	
	for( const [key, value] of Object.entries( dataPoints ) ) {
		// Max value
		const max = Math.max( ...value.data.map( point => point.y ) );
		// Append to table
		max = ( max > 0 ) ? max : "-";
		buoyInfoHtml += "<dt>" + value.description + "</dt>" +
			"<dd>" + max + "</dd>";
	}
	
	const buoyWrapper = document.getElementById( 'buoy-' + buoyId );
	// Clear it
	const chartInfo = buoyWrapper.getElementsByClassName("chart-info")[0]
	chartInfo.innerHTML = "";
	chartInfo.insertAdjacentHTML( 'afterbegin', "<ul>" + buoyInfoHtml + "</ul>" );
	chartInfo.addEventListener( 'click', wadToggleChart );
}

export function wadDrawHeading( buoyId, label, range ) {
	const buoyWrapper = document.getElementById( 'buoy-' + buoyId );
	const panelHeading = buoyWrapper.getElementsByClassName( 'card-header' )
	if( panelHeading.length > 0 ) {
		// const time = panelHeading[0].getElementsByTagName( 'time' );
		// if( time.length > 0 ) {
		// 	time[0].innerHTML = label;
		// }
		// Download time range
		const downloadTrigger = panelHeading[0].getElementsByClassName( 'download-trigger' );
		if( downloadTrigger.length > 0 ) {
			downloadTrigger[0].dataset['start'] = range[0];
			downloadTrigger[0].dataset['end'] = range[1];
		}
		if( window.myPickers != undefined ) {
			// console.log( range[0] );
			// console.log( parseInt( range[0] ) );
			// console.log( new Date( parseInt( range[0] ) ) );
			window.myPickers['buoy' + buoyId].options.startDate.dateInstance = ( new Date( parseInt( range[0] ) ) );
			window.myPickers['buoy' + buoyId].options.endDate.dateInstance = ( new Date( parseInt( range[1] ) ) );
		}
		
		const dateRangeButton = panelHeading[0].getElementsByClassName( 'dateRangeButtonLabel' );
		if( dateRangeButton.length > 0 ) {
			dateRangeButton[0].innerHTML = label;
		}

	}
}

export function wadDrawChart( buoyId, config ) {
	// Draw Chart
	if( typeof( window.myCharts ) == "undefined" ) {
		window.myCharts = [];
	}
	
	// Destroy existing chart
	if( window.myCharts.hasOwnProperty( 'buoy' + buoyId ) ) {
		window.myCharts['buoy' + buoyId].destroy();
	}

	const buoyWrapper = document.getElementById( 'buoy-' + buoyId );

	// Load new chart
	if( buoyWrapper.getElementsByTagName( 'canvas' ).length > 0 ) {
		const canvasContext = buoyWrapper.getElementsByTagName( 'canvas' )[0].getContext( '2d' );
		
		// Hide loading message
		if( buoyWrapper.getElementsByClassName( 'canvas-wrapper' ).length > 0 ) {
			buoyWrapper.getElementsByClassName( 'canvas-wrapper' )[0].classList.remove( 'loading' );
		}
		
		// Load chart
		window.myCharts['buoy' + buoyId] = new Chart( canvasContext, config );
	}
	else {
		console.log( 'No canvas' );
	}
	
	// // Check for no data
	// if( !hasWaves ) {
	// 	// Hide loading message
	// 	if( buoyWrapper.getElementsByClassName( 'canvas-wrapper' ).length > 0 ) {
	// 		buoyWrapper.getElementsByClassName( 'canvas-wrapper' )[0].classList.remove( 'loading' );
	// 	}
	// }
}
 
// Charts for spread chart extends
// Chart.defaults.stripe = Chart.helpers.clone(Chart.defaults.line);
// Chart.controllers.stripe = Chart.controllers.line.extend({
//   draw: function(ease) {
//     var result = Chart.controllers.line.prototype.draw.apply(this, arguments);

//     // don't render the stripes till we've finished animating
//     if (!this.rendered && ease !== 1)
//       return;
//     this.rendered = true;


//     var helpers = Chart.helpers;
//     var meta = this.getMeta();
//     var yScale = this.getScaleForId(meta.yAxisID);
//     var yScaleZeroPixel = yScale.getPixelForValue(0);
//     var widths = this.getDataset().width;
//     var ctx = this.chart.chart.ctx;

//     ctx.save();
//     ctx.fillStyle = this.getDataset().backgroundColor;
//     ctx.lineWidth = 1;
//     ctx.beginPath();

//     // initialize the data and bezier control points for the top of the stripe
//     helpers.each(meta.data, function(point, index) {
//       point._view.y += (yScale.getPixelForValue(widths[index]) - yScaleZeroPixel);
//     });
//     Chart.controllers.line.prototype.updateBezierControlPoints.apply(this);

//     // draw the top of the stripe
//     helpers.each(meta.data, function(point, index) {
//       if (index === 0)
//         ctx.moveTo(point._view.x, point._view.y);
//       else {
//         var previous = helpers.previousItem(meta.data, index);
//         var next = helpers.nextItem(meta.data, index);

//         Chart.elements.Line.prototype.lineToNextPoint.apply({
//           _chart: {
//             ctx: ctx
//           }
//         }, [previous, point, next, null, null])
//       }
//     });

//     // revert the data for the top of the stripe
//     // initialize the data and bezier control points for the bottom of the stripe
//     helpers.each(meta.data, function(point, index) {
//       point._view.y -= 2 * (yScale.getPixelForValue(widths[index]) - yScaleZeroPixel);
//     });
//     // we are drawing the points in the reverse direction
//     meta.data.reverse();
//     Chart.controllers.line.prototype.updateBezierControlPoints.apply(this);

//     // draw the bottom of the stripe
//     helpers.each(meta.data, function(point, index) {
//       if (index === 0)
//         ctx.lineTo(point._view.x, point._view.y);
//       else {
//         var previous = helpers.previousItem(meta.data, index);
//         var next = helpers.nextItem(meta.data, index);

//         Chart.elements.Line.prototype.lineToNextPoint.apply({
//           _chart: {
//             ctx: ctx
//           }
//         }, [previous, point, next, null, null])
//       }

//     });

//     // revert the data for the bottom of the stripe
//     meta.data.reverse();
//     helpers.each(meta.data, function(point, index) {
//       point._view.y += (yScale.getPixelForValue(widths[index]) - yScaleZeroPixel);
//     });
//     Chart.controllers.line.prototype.updateBezierControlPoints.apply(this);

//     ctx.stroke();
//     ctx.closePath();
//     ctx.fill();
//     ctx.restore();

//     return result;
//   }
// });