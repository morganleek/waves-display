// import $ from 'jquery';
import Chart from 'chart.js';
// import { uwaGenerateBuoyDateString } from './time';

export function wadDrawChart( buoyId, waves ) {
	let hasWaves = false;

	let arrowPointers = [];
	let chartLabels = [];
	
	let hsig = []; // Hsig (m) –Significant Wave Height
	let tp = []; // Tp (s) – Peak wave period
	let tm = []; // Tm (s) – mean wave period
	let dp = []; // Dp (deg) – Peak wave direction
	let dpspr = []; // DpSpr (deg) – peak wave directional spreading
	let dm = []; // Dm (deg) – mean wave direction
	let dmspr = []; // DmSpr (deg) – mean wave directional spreading
	let sst = []; // SST (degC) – sea surface temperature
	let bottomTemp = []; // Bottom Temp (degC) – bottom temperature
	let windspeed = []; // Wind Speed
	let winddirec = []; // Wind Direction
	let currentMag = []; // Current Mag (m/s) – current speed
	let currentDir = []; 
	// let qfWaves = []; // QF_waves  - quality flag for wave variables
	// let qfSst = [];  // QF_sst  – quality flag for sea surface temperature
	// let qfBottTemp = []; // QF_bott_temp – quality flag for bottom temperature

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
					hsig.push( { x: time, y: waves[i]["Hsig (m)"] } );
					tp.push( { x: time, y: waves[i]["Tp (s)"] } );
					tm.push( { x: time, y: waves[i]["Tm (s)"] } );
					dpspr.push( { x: time, y: waves[i]["DpSpr (deg)"] } );
					dmspr.push( { x: time, y: waves[i]["DmSpr (deg)"] } );
					// Rotation
					dm.push( Math.abs( parseInt( waves[i]["Dm (deg)"] ) - 180 ) );
					dp.push( Math.abs( parseInt( waves[i]["Dp (deg)"] ) - 180 ) ); // Math.abs( waves[i]["Dp (deg)"] - 180 ) // Pointing the oppsite direction
				}
				if( waves[i]["QF_sst"] == "1" ) {
					sst.push( { x: time, y: waves[i]["SST (degC)"] } );
				}
				if( waves[i]["QF_bott_temp"] == "1") {
					bottomTemp.push( { x: time, y: waves[i]["Bottom Temp (degC)"] } );
				}
				windspeed.push( { x: time, y: waves[i]["WindSpeed (m/s)"] } );
				winddirec.push( { x: time, y: waves[i]["WindDirec (deg)"] } );
				currentMag.push( { x: time, y: waves[i]["CurrmentMag (m/s)"] } );
				currentDir.push( { x: time, y: waves[i]["CurrentDir (deg) "] } );
			}
			
			// Draw Chart
			var config = {
				type: 'line',
				data: {
					labels: chartLabels,
					datasets: [
						{
							label: 'Significant Wave Height', // Wave Height (m)
							backgroundColor: 'rgba(75, 192, 192, 1)',
							borderColor: 'rgba(75, 192, 192, 1)',
							borderWidth: 0,
							lineTension: 0,
							pointRadius: 0,
							fill: true,
							data: hsig,
							yAxisID: 'y-axis-1',
						}, {					
							label: 'Peak Wave Period & Direction (s)', // Peak Period (s)
							backgroundColor: 'rgba(235, 127, 74, 0.7)',
							borderColor: 'rgba(235, 127, 74, 0.5)',
							borderWidth: 0,
							lineTension: 0,
							pointRadius: 35,
							pointStyle: arrowImageOrange,
							rotation: dp,
							fill: false,
							data: tp,
							yAxisID: 'y-axis-2',
						}, {					
							label: 'Mean Wave Period & Direction (s)', // Peak Period (s)
							backgroundColor: 'rgba(77, 168, 248, 0.7)',
							borderColor: 'rgba(77, 168, 248, 0.5)',
							borderWidth: 0,
							lineTension: 0,
							pointRadius: 35,
							pointStyle: arrowImageBlue,
							rotation: dm,
							fill: false,
							data: tm,
							yAxisID: 'y-axis-2',
						}, {					
							label: 'Sea Surface Temperature (Deg C)', 
							backgroundColor: 'rgba(255, 206, 87, 0.5)',
							borderColor: 'rgba(255, 206, 87, 1)',
							borderWidth: 0,
							lineTension: 0,
							pointRadius: 5,
							fill: true,
							data: sst,
							yAxisID: 'y-axis-3',
						}
						// {
						// 	label: 'Mean Wave Period', // Mean Period (s)
						// 	backgroundColor: 'rgba(51, 122, 183, 0.7)',
						// 	borderColor: 'rgba(51, 122, 183, 1)',
						// 	borderWidth: 2,
						// 	lineTension: 0,
						// 	pointRadius: 1,
						// 	fill: true,
						// 	data: tm,
						// 	yAxisID: 'y-axis-2',
							
						// 	hidden: true,
						// }
					]
				},
				options: {
					responsive: true,
					aspectRatio: 3,
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
							// ticks: {
							// 	min: startTime,
							// 	max: endTime, 
							// },
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
								labelString: 'Date: ' + startTime + ' - ' + endTime, // 'Date: ' + startTime.format( 'YYYY-MM-DD HH:mmZ' ) + ' - ' + endTime.format( 'YYYY-MM-DD HH:mmZ' ),
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

			// if( window.myLine == undefined ) {
			// Load chart
			// window.onload = function() {
				const buoyWrapper = document.getElementById( 'buoy-' + buoyId );
				if( buoyWrapper.getElementsByTagName( 'canvas' ).length > 0 ) {
					const canvasContext = buoyWrapper.getElementsByTagName( 'canvas' )[0].getContext( '2d' );
					
					// Hide loading message
					if( buoyWrapper.getElementsByClassName( 'loading').length > 0 ) {
						buoyWrapper.getElementsByClassName( 'loading')[0].setAttribute( 'style', 'display: none');
					}
					
					// Load chart
					window.myLine = new Chart( canvasContext, config );
				}
				else {
					console.log( 'No canvas' );
				}
			// };
			// }
			// else {
			// 	// removeData( window.myLine );
			// 	// addData( window.myLine, config.data.labels, config.data.datasets );
			// 	// // let ctx = document.getElementById( 'canvas-' + buoyID ).getContext( '2d' );
			// 	// // // Hide loading message
			// 	// // const chartWrapper = document.getElementsByClassName('chart-js-layout-' + buoyID);
			// 	// // if( chartWrapper ) {
			// 	// // 	chartWrapper[0].getElementsByClassName('loading')[0].setAttribute( 'style', 'display: none');
			// 	// // }
			// 	// // // Load chart
			// 	// // window.myLine = new Chart(ctx, config);
			// }
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

// function addData(chart, label, data) {
// 	chart.data.labels.push(label);
// 	chart.data.datasets.forEach((dataset) => {
// 			dataset.data.push(data);
// 	});
// 	chart.update();
// }

// function removeData(chart) {
// 	chart.data.labels.pop();
// 	chart.data.datasets.forEach((dataset) => {
// 			dataset.data.pop();
// 	});
// 	chart.update();
// }

Chart.defaults.stripe = Chart.helpers.clone(Chart.defaults.line);
Chart.controllers.stripe = Chart.controllers.line.extend({
  draw: function(ease) {
    var result = Chart.controllers.line.prototype.draw.apply(this, arguments);

    // don't render the stripes till we've finished animating
    if (!this.rendered && ease !== 1)
      return;
    this.rendered = true;


    var helpers = Chart.helpers;
    var meta = this.getMeta();
    var yScale = this.getScaleForId(meta.yAxisID);
    var yScaleZeroPixel = yScale.getPixelForValue(0);
    var widths = this.getDataset().width;
    var ctx = this.chart.chart.ctx;

    ctx.save();
    ctx.fillStyle = this.getDataset().backgroundColor;
    ctx.lineWidth = 1;
    ctx.beginPath();

    // initialize the data and bezier control points for the top of the stripe
    helpers.each(meta.data, function(point, index) {
      point._view.y += (yScale.getPixelForValue(widths[index]) - yScaleZeroPixel);
    });
    Chart.controllers.line.prototype.updateBezierControlPoints.apply(this);

    // draw the top of the stripe
    helpers.each(meta.data, function(point, index) {
      if (index === 0)
        ctx.moveTo(point._view.x, point._view.y);
      else {
        var previous = helpers.previousItem(meta.data, index);
        var next = helpers.nextItem(meta.data, index);

        Chart.elements.Line.prototype.lineToNextPoint.apply({
          _chart: {
            ctx: ctx
          }
        }, [previous, point, next, null, null])
      }
    });

    // revert the data for the top of the stripe
    // initialize the data and bezier control points for the bottom of the stripe
    helpers.each(meta.data, function(point, index) {
      point._view.y -= 2 * (yScale.getPixelForValue(widths[index]) - yScaleZeroPixel);
    });
    // we are drawing the points in the reverse direction
    meta.data.reverse();
    Chart.controllers.line.prototype.updateBezierControlPoints.apply(this);

    // draw the bottom of the stripe
    helpers.each(meta.data, function(point, index) {
      if (index === 0)
        ctx.lineTo(point._view.x, point._view.y);
      else {
        var previous = helpers.previousItem(meta.data, index);
        var next = helpers.nextItem(meta.data, index);

        Chart.elements.Line.prototype.lineToNextPoint.apply({
          _chart: {
            ctx: ctx
          }
        }, [previous, point, next, null, null])
      }

    });

    // revert the data for the bottom of the stripe
    meta.data.reverse();
    helpers.each(meta.data, function(point, index) {
      point._view.y += (yScale.getPixelForValue(widths[index]) - yScaleZeroPixel);
    });
    Chart.controllers.line.prototype.updateBezierControlPoints.apply(this);

    ctx.stroke();
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    return result;
  }
});