import $ from 'jquery';
import Chart from 'chart.js';
import { wadToggleChart, wadDatePicker, wadCSVDownload } from './chart-events';
import { wadProcessBuoyData } from './buoy-data';
import { wadMapLocator } from '../map';

const panelWrapper = "<div class='panel panel-primary'>" +
  "<div class='panel-heading clearfix'><h5>{{ buoyLabel }}</h5></div>" + 
  "<div class='panel-body'>" + 
    "<div class='chart-js-menu'>" + 
      "<button class='download-trigger' data-buoy-id='{{ buoyId }}'></button>" +
      "<button class='maps-trigger' data-buoy-lat='{{ buoyLat }}' data-buoy-lng='{{ buoyLng }}'></button>" +
      "<button class='calendars-trigger' data-buoy-id='{{ buoyId }}'></button>" +
    "</div>" +
    "<div class='canvas-wrapper loading'>" +
      "<canvas></canvas>" +
    "</div>" +
    "<div class='chart-info'></div>" +
  "</div>" +
"</div>";

export function wadInitCharts( response ) {
	const buoysWrapper = document.getElementById( 'buoys' );
	// Setup boxes
	for( let i = 0; i < response.length; i++ ) {
		const newBuoyWrapper = document.createElement( "div" );
		newBuoyWrapper.id = "buoy-" + response[i].id;
		// Internals
		const newPanelWrapper = panelWrapper.replaceAll( '{{ buoyLabel }}', response[i].web_display_name )
			.replaceAll( '{{ buoyId }}', response[i].id )
			.replaceAll( '{{ buoyLat }}', response[i].lat )
			.replaceAll( '{{ buoyLng }}', response[i].lng );
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

export function wadFillChart( buoyId, waves ) {
	let hasWaves = false;

	let arrowPointers = [];
	let chartLabels = [];

	if( typeof( window.myChartData ) == "undefined" ) {
		window.myChartData = [];
	}

	window.myChartData['buoy-' + buoyId] = waves;
	
	let dataPoints = {
		hsig: { data: [], description: "Max Significant Wave Height (m)" }, // let hsig = []; // 
		tp: { data: [], description: "Max Peak Wave Period (s)" }, // let tp = []; // 
		tm: { data: [], description: "Max Mean Wave Period (s)" }, // let tm = []; // 
		dp: { data: [], description: "Max Peak Wave Direction (deg)" }, // let dp = []; // 
		dpspr: { data: [], description: "Max Peak Wave Directional Spreading (deg)" }, // let dpspr = []; // 
		dm: { data: [], description: "Max Mean Wave Direction (deg)" }, // let dm = []; // 
		dmspr: { data: [], description: "Max Mean Wave Directional Spreading (deg)" }, // let dmspr = []; // 
		sst: { data: [], description: "Max Sea Surface Temperature (degC)" }, // let sst = []; // 
		bottomTemp: { data: [], description: "Max Sea Bottom Temperature (degC)" }, // let bottomTemp = []; // 
		windspeed: { data: [], description: "Max Wind Speed (m/s)" }, // let windspeed = []; // 
		winddirec: { data: [], description: "Max Wind Direction (deg)" }, // let winddirec = []; // 
		currentMag: { data: [], description: "Current Mag (m/s)" }, // let currentMag = []; // 
		currentDir: { data: [], description: "Current Direction (deg)" }, // let currentDir = []; 
		// qfWaves: { data: [], description: "" }, // let qfWaves = []; // QF_waves  - quality flag for wave variables
		// qfSst: [], // let qfSst = [];  // QF_sst  – quality flag for sea surface temperature
		// qfBottTemp: [], // let qfBottTemp = []; // QF_bott_temp – quality flag for bottom temperature
	};

	let arrowImageOrange = new Image( 28, 28 );
	arrowImageOrange.src = wad.plugin + "dist/images/arrow-orange-g@2x.png";
	let arrowImageBlue = new Image( 28, 28 );
	arrowImageBlue.src = wad.plugin + "dist/images/arrow-blue-g@2x.png";
	let arrowImagePink = new Image( 28, 28 );
	arrowImagePink.src = wad.plugin + "dist/images/arrow-pink-g@2x.png";

	if( typeof( waves ) != "undefined" ) {
		if( waves.length > 0 ) {
			const startTime = Math.min(...waves.map( ( wave ) => wave['Time (UTC)'] ) ) * 1000;
			const endTime = Math.max(...waves.map( ( wave ) => wave['Time (UTC)'] ) ) * 1000;

			// Loop
			for( let i = 0; i < waves.length; i++ ) {
				// Time as moment object with offset
				const time = parseInt( waves[i]['Time (UTC)'] ) * 1000; // moment.unix( parseInt( waves[i].time ) ); // .utcOffset( buoyOffset );
				chartLabels.push( time );

				if( waves[i]["QF_waves"] == "1" ) {
					hasWaves = true; // Needs to be here incase there are no valid waves
					// Values
					dataPoints.hsig.data.push( { x: time, y: parseFloat( waves[i]["Hsig (m)"] ) } );
					dataPoints.tp.data.push( { x: time, y: parseFloat( waves[i]["Tp (s)"] ) } );
					dataPoints.tm.data.push( { x: time, y: parseFloat( waves[i]["Tm (s)"] ) } );
					dataPoints.dpspr.data.push( { x: time, y: parseFloat( waves[i]["DpSpr (deg)"] ) } );
					dataPoints.dmspr.data.push( { x: time, y: parseFloat( waves[i]["DmSpr (deg)"] ) } );
					// Rotation
					dataPoints.dm.data.push( Math.abs( parseInt( waves[i]["Dm (deg)"] ) - 180 ) );
					dataPoints.dp.data.push( Math.abs( parseInt( waves[i]["Dp (deg)"] ) - 180 ) ); // Math.abs( waves[i]["Dp (deg)"] - 180 ) // Pointing the oppsite direction
				}
				if( waves[i]["QF_sst"] == "1" ) {
					dataPoints.sst.data.push( { x: time, y: parseFloat( waves[i]["SST (degC)"] ) } );
				}
				if( waves[i]["QF_bott_temp"] == "1") {
					dataPoints.bottomTemp.data.push( { x: time, y: waves[i]["Bottom Temp (degC)"] } );
				}
				dataPoints.windspeed.data.push( { x: time, y: parseFloat( waves[i]["WindSpeed (m/s)"] ) } );
				dataPoints.winddirec.data.push( { x: time, y: parseFloat( waves[i]["WindDirec (deg)"] ) } );
				// Only want last value
				dataPoints.currentMag.data = [{ x: time, y: parseFloat( waves[i]["CurrmentMag (m/s)"] ) }];
				dataPoints.currentDir.data = [{ x: time, y: parseFloat( waves[i]["CurrentDir (deg) "] ) }];
			}
			
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
			chartInfo.insertAdjacentHTML( 'afterbegin', "<dl>" + buoyInfoHtml + "</dl>" );
			chartInfo.addEventListener( 'click', wadToggleChart );
			
			let s = new Date();
			s.setTime( startTime );
			let e = new Date();
			e.setTime( endTime );
			const scaleLabel = s.toDateString() + " - " + e.toDateString();

			// Data
			var data = {
				labels: chartLabels,
				datasets: []
			};

			if( dataPoints.hsig.data.length > 0 ) {
				data.datasets.push({
					label: 'Significant Wave Height', // Wave Height (m)
					backgroundColor: 'rgba(75, 192, 192, 1)',
					borderColor: 'rgba(75, 192, 192, 1)',
					borderWidth: 0,
					lineTension: 0,
					pointRadius: 0,
					fill: true,
					data: dataPoints.hsig.data,
					yAxisID: 'y-axis-1',
				});	
			}
			if( dataPoints.tp.data.length > 0 ) {
				data.datasets.push({					
					label: 'Peak Wave Period & Direction (s)', // Peak Period (s)
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
				});
			}
			if( dataPoints.tm.data.length > 0 ) {
				data.datasets.push({					
					label: 'Mean Wave Period & Direction (s)', // Peak Period (s)
					backgroundColor: 'rgba(77, 168, 248, 0.7)',
					borderColor: 'rgba(77, 168, 248, 0.5)',
					borderWidth: 0,
					lineTension: 0,
					pointRadius: 35,
					pointStyle: arrowImageBlue,
					rotation: dataPoints.dm.data,
					fill: false,
					data: dataPoints.tm.data,
					yAxisID: 'y-axis-2',
				});
			}
			if( dataPoints.sst.data.length > 0 ) {
				data.datasets.push({					
					label: 'Sea Surface Temperature (Deg C)', 
					backgroundColor: 'rgba(255, 206, 87, 0.5)',
					borderColor: 'rgba(255, 206, 87, 1)',
					borderWidth: 0,
					lineTension: 0,
					pointRadius: 5,
					fill: true,
					data: dataPoints.sst.data,
					yAxisID: 'y-axis-3',
				});
			}
			if( dataPoints.bottomTemp.data.length > 0 ) {
				data.datasets.push({					
					label: 'Bottom Temperature (Deg C)', 
					backgroundColor: 'rgb(255, 159, 64, 0.5)',
					borderColor: 'rgb(255, 159, 64, 1)',
					borderWidth: 0,
					lineTension: 0,
					pointRadius: 5,
					fill: true,
					data: dataPoints.bottomTemp.data,
					yAxisID: 'y-axis-3',
				});
			}
			
			// Draw Chart
			var config = {
				type: 'line',
				data: data,
				options: {
					responsive: true,
					aspectRatio: 2.5,
					hoverMode: 'index',
					stacked: false,
					title: {
						display: false,
						// text: 'Significant Wave Height'
					},
					scales: {
						xAxes: [{
							distribution: 'series',
							ticks: {
								min: startTime,
								max: endTime, 
							},
							type: 'time',
							time: {
								// time: {
								// 	displayFormats: {
								// 		quarter: 'MMM YYYY'
								// 	}
								// }
								// unit: 'hour',
								displayFormats: {
									minute: 'HH:mm',
									// day: 'MMM D'
								},
								// parser: function ( utcMoment ) {
								// 	if( utcMoment % 8640000 == 0 )
								// 		console.log( 'New' );
								// 	return utcMoment;
								// }
							},
							scaleLabel: {
								display: true,
								labelString: scaleLabel
							}
						}],
						yAxes: [{
							type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
							display: true,
							position: 'left',
							id: 'y-axis-1',
							ticks: {
								beginAtZero: true,
								min: 0,
								max: 8
							},
							scaleLabel: {
								display: true,
								labelString: 'Height (m)',
							},
						}, {
							type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
							display: true,
							position: 'right',
							id: 'y-axis-2',
							gridLines: {
								drawOnChartArea: false, // only want the grid lines for one axis to show up
							},
							ticks: {
								beginAtZero: true,
								min: 0,
								max: 20
							},
							scaleLabel: {
								display: true,
								labelString: 'Period (s)',
							},
						}, {
							type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
							display: true,
							position: 'right',
							id: 'y-axis-3',
							gridLines: {
								drawOnChartArea: false, // only want the grid lines for one axis to show up
							},
							ticks: {
								beginAtZero: true,
								min: 0,
								max: 40
							},
							scaleLabel: {
								display: true,
								labelString: 'Temp (Deg C)',
							},
						}],
					}
				}
			};

			if( typeof( window.myCharts ) == "undefined" ) {
				window.myCharts = [];
			}
			
			// Destroy existing chart
			if( window.myCharts.hasOwnProperty( 'buoy' + buoyId ) ) {
				window.myCharts['buoy' + buoyId].destroy();
			}
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
		}
		else {
			console.log( 'buoyId' );
		}
	}
	// Check for no data
	if( !hasWaves ) {
		// Hide loading message
		if( buoyWrapper.getElementsByClassName( 'canvas-wrapper' ).length > 0 ) {
			buoyWrapper.getElementsByClassName( 'canvas-wrapper' )[0].classList.remove( 'loading' );
		}
	}
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