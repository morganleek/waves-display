// import $ from 'jquery';
import Chart from 'chart.js';
import { wadToggleChart } from './controls-buoy';
// import { uwaGenerateBuoyDateString } from './time';

export function wadDrawChart( buoyId, waves ) {
	let hasWaves = false;

	let arrowPointers = [];
	let chartLabels = [];

	if( typeof( window.myChartData ) == "undefined" ) {
		window.myChartData = [];
	}

	window.myChartData['buoy-' + buoyId] = waves;
	
	let dataPoints = {
		hsig: { data: [], description: "Significant Wave Height (m)" }, // let hsig = []; // 
		tp: { data: [], description: "Peak Wave Period (s)" }, // let tp = []; // 
		tm: { data: [], description: "Mean Wave Period (s)" }, // let tm = []; // 
		dp: { data: [], description: "Peak Wave Direction (deg)" }, // let dp = []; // 
		dpspr: { data: [], description: "Peak Wave Directional Spreading (deg)" }, // let dpspr = []; // 
		dm: { data: [], description: "Mean Wave Direction (deg)" }, // let dm = []; // 
		dmspr: { data: [], description: "Mean Wave Directional Spreading (deg)" }, // let dmspr = []; // 
		sst: { data: [], description: "Sea Surface Temperature (degC)" }, // let sst = []; // 
		bottomTemp: { data: [], description: "Sea Bottom Temperature (degC)" }, // let bottomTemp = []; // 
		windspeed: { data: [], description: "Wind Speed (m/s)" }, // let windspeed = []; // 
		winddirec: { data: [], description: "Wind Direction (deg)" }, // let winddirec = []; // 
		currentMag: { data: [], description: "Current Mag (m/s)" }, // let currentMag = []; // 
		currentDir: { data: [], description: "Current Direction (deg)" }, // let currentDir = []; 
		// qfWaves: { data: [], description: "" }, // let qfWaves = []; // QF_waves  - quality flag for wave variables
		// qfSst: [], // let qfSst = [];  // QF_sst  – quality flag for sea surface temperature
		// qfBottTemp: [], // let qfBottTemp = []; // QF_bott_temp – quality flag for bottom temperature
	};

	let arrowImageOrange = new Image( 28, 28 );
	arrowImageOrange.src = wad.plugin + "/dist/images/arrow-orange-g@2x.png";
	let arrowImageBlue = new Image( 28, 28 );
	arrowImageBlue.src = wad.plugin + "/dist/images/arrow-blue-g@2x.png";
	let arrowImagePink = new Image( 28, 28 );
	arrowImagePink.src = wad.plugin + "/dist/images/arrow-pink-g@2x.png";

	if( typeof( waves ) != "undefined" ) {
		if( waves.length > 0 ) {
			const startTime = parseInt( waves[0]['Time (UTC)'] ) * 1000; // moment.unix( parseInt( waves[0].time ) ); // .utcOffset( buoyOffset );
			const endTime = parseInt( waves[waves.length - 1]['Time (UTC)'] ) * 1000; // moment.unix( parseInt( waves[waves.length - 1].time ) ); // .utcOffset( buoyOffset );

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
			
			// Draw Chart
			var config = {
				type: 'line',
				data: data,
				options: {
					responsive: true,
					aspectRatio: 2,
					hoverMode: 'index',
					stacked: false,
					title: {
						display: false,
						// text: 'Significant Wave Height'
					},
					scales: {
						xAxes: [{
							type: 'time',
							distribution: 'series',
							// time: {
							// 	displayFormats: {
							// 		hour: 'ha',
							// 	},
							// 	parser: function ( utcMoment ) {
							// 		return moment( utcMoment ).utcOffset( buoyOffset );
							// 	},
							// },
							ticks: {
								min: startTime,
								max: endTime, 
							},
							time: {
								unit: 'hour',
								displayFormats: {
									hour: 'HH:mm'
								},
								// parser: function ( utcMoment ) {
								// 	return utcMoment.utcOffset( buoyOffset );
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
				if( buoyWrapper.getElementsByClassName( 'loading').length > 0 ) {
					buoyWrapper.getElementsByClassName( 'loading')[0].setAttribute( 'style', 'display: none');
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
		if( buoyWrapper.getElementsByClassName( 'loading' ).length > 0 ) {
			buoyWrapper.getElementsByClassName( 'loading' )[0].innerHTML = "No content available";
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