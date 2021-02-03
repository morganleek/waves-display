import Chart from 'chart.js';
import { uwaGenerateBuoyDateString } from './time';

export function uwaGenerateChart( buoyID, waves ) {
	let buoyOffset = '+5'; // Replace
	let waveHeightData = [];
	let peakPeriodData = [];
	let peakDirectionData = [];
	let meanPeriodData = [];
	let arrowPointers = [];
	let chartLabels = [];

	let arrowImage = new Image( 28, 28 );
	arrowImage.src = ajax_object.plugin_url + "/dist/images/arrow-yellow.png";

	// Sanitize Offset
	buoyOffset = parseInt( buoyOffset );

	// for( let i = 0; i < 24; i++ ) {
	// 	const time = moment("2010-01-01 " + i + ":00:00.000+05");
	// 	waveHeightData.push({
	// 		x: time,
	// 		y: ( i % 4 ) * 2,
	// 	} );
	// 	var config = {
	// 		type: 'line',
	// 		data: {
	// 			// labels: chartLabels,
	// 			datasets: [
	// 				{
	// 					label: 'Significant Wave Height', // Wave Height (m)
	// 					backgroundColor: 'rgba(60, 118, 61, 0.7)',
	// 					borderColor: 'rgba(60, 118, 61, 1)',
	// 					borderWidth: 2,
	// 					lineTension: 0,
	// 					pointRadius: 0,
	// 					fill: true,
	// 					data: waveHeightData,
	// 					yAxisID: 'y-axis-1',
	// 				}, 
	// 				// {					
	// 				// 	label: 'Peak Period & Direction (s)', // Peak Period (s)
	// 				// 	backgroundColor: 'rgba(202, 226, 200, 0.7)',
	// 				// 	borderColor: 'rgba(238, 238, 238, 1)',
	// 				// 	borderWidth: 2,
	// 				// 	lineTension: 0,
	// 				// 	pointRadius: 35,
	// 				// 	pointStyle: arrowImage,
	// 				// 	rotation: peakDirectionData,
	// 				// 	fill: false,
	// 				// 	data: peakPeriodData,
	// 				// 	yAxisID: 'y-axis-2',
	// 				// }, {
	// 				// 	label: 'Mean Period', // Mean Period (s)
	// 				// 	backgroundColor: 'rgba(51, 122, 183, 0.7)',
	// 				// 	borderColor: 'rgba(51, 122, 183, 1)',
	// 				// 	borderWidth: 2,
	// 				// 	lineTension: 0,
	// 				// 	pointRadius: 1,
	// 				// 	fill: false,
	// 				// 	data: meanPeriodData,
	// 				// 	yAxisID: 'y-axis-2',
						
	// 				// 	hidden: true,
	// 				// }
	// 			]
	// 		},
	// 		options: {
	// 			responsive: true,
	// 			aspectRatio: 3,
	// 			hoverMode: 'index',
	// 			stacked: false,
	// 			title: {
	// 				display: false,
	// 				// text: 'Significant Wave Height'
	// 			},
	// 			scales: {
	// 				xAxes: [{
	// 					type: 'time',
	// 					distribution: 'series',
	// 					offset: true,
	// 					ticks: {
	// 						source: 'data',
	// 						min: waveHeightData[0].x,
	// 						max: waveHeightData[waveHeightData.length - 1].x, 
	// 					},
	// 					time: {
	// 					// 	unit: 'hour',
						
	// 						displayFormats: {
	// 							hour: 'HHZ'
	// 						},
	// 						parser: function ( utcMoment ) {
	// 							// console.log(utcMoment.utcOffset( "+0800" ).format('Z'));
	// 							// console.log(utcMoment.format('Z'));
	// 							return utcMoment.utcOffset( "+0500" );
	// 						}                
	// 					},
	// 					// scaleLabel: {
	// 					// 	display: true,
	// 					// 	labelString: 'Date: ' + startTime.format( 'YYYY-MM-DD HH:mmZ' ) + ' - ' + endTime.format( 'YYYY-MM-DD HH:mmZ' ),
	// 					// }
	// 				}],
	// 				yAxes: [{
	// 					type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
	// 					display: true,
	// 					position: 'left',
	// 					id: 'y-axis-1',
	// 					ticks: {
	// 						beginAtZero: true,
	// 						min: 0,
	// 						max: 8
	// 					},
	// 					scaleLabel: {
	// 						display: true,
	// 						labelString: 'Height (m)',
	// 					},
	// 				}, 
	// 				// {
	// 				// 	type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
	// 				// 	display: true,
	// 				// 	position: 'right',
	// 				// 	id: 'y-axis-2',
	// 				// 	gridLines: {
	// 				// 		drawOnChartArea: false, // only want the grid lines for one axis to show up
	// 				// 	},
	// 				// 	ticks: {
	// 				// 		beginAtZero: true,
	// 				// 		min: 0,
	// 				// 		max: 20
	// 				// 	},
	// 				// 	scaleLabel: {
	// 				// 		display: true,
	// 				// 		labelString: 'Period (s)',
	// 				// 	},
	// 				// }
	// 				],
	// 			}
	// 		}
	// 	};
	// }

	console.log( waves );

	if( waves.length ) {
		const startTime = moment.unix( parseInt( waves[0].time ) ); // .utcOffset( buoyOffset );
		const endTime = moment.unix( parseInt( waves[waves.length - 1].time ) ); // .utcOffset( buoyOffset );
		for( let i = 0; i < waves.length; i++ ) {
			// Time as moment object with offset
			const time = moment.unix( parseInt( waves[i].time ) ); // .utcOffset( buoyOffset );

			// Simple chart label
			chartLabels.push( time ); // .format( "HH:mm")
			
			// Push arrow image
			arrowPointers.push( arrowImage );
			// Wave height data
			waveHeightData.push( {
				x: time,
				y: waves[i].significant_wave_height,
			} );
			// Peak period data
			peakPeriodData.push( {
				x: time,
				y: waves[i].peak_period,
			} );
			// Mean period data
			meanPeriodData.push( {
				x: time,
				y: waves[i].mean_period,
			}  );
			// Peak direction data
			peakDirectionData.push (
				Math.abs( waves[i].peak_direction - 180 ) // Pointing the oppsite direction
			);
		}

		// Draw Chart
		// var color = Chart.helpers.color;
		var config = {
			type: 'line',
			data: {
				labels: chartLabels,
				datasets: [
					{
						label: 'Significant Wave Height', // Wave Height (m)
						backgroundColor: 'rgba(60, 118, 61, 0.7)',
						borderColor: 'rgba(60, 118, 61, 1)',
						borderWidth: 2,
						lineTension: 0,
						pointRadius: 0,
						fill: true,
						data: waveHeightData,
						yAxisID: 'y-axis-1',
					}, {					
						label: 'Peak Period & Direction (s)', // Peak Period (s)
						backgroundColor: 'rgba(202, 226, 200, 0.7)',
						borderColor: 'rgba(238, 238, 238, 1)',
						borderWidth: 2,
						lineTension: 0,
						pointRadius: 35,
						pointStyle: arrowImage,
						rotation: peakDirectionData,
						fill: false,
						data: peakPeriodData,
						yAxisID: 'y-axis-2',
					},
					{
						label: 'Mean Period', // Mean Period (s)
						backgroundColor: 'rgba(51, 122, 183, 0.7)',
						borderColor: 'rgba(51, 122, 183, 1)',
						borderWidth: 2,
						lineTension: 0,
						pointRadius: 1,
						fill: false,
						data: meanPeriodData,
						yAxisID: 'y-axis-2',
						
						hidden: true,
					}
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
							labelString: 'Date: ' + startTime.format( 'YYYY-MM-DD HH:mmZ' ) + ' - ' + endTime.format( 'YYYY-MM-DD HH:mmZ' ),
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
					}],
				}
			}
		};

		if( window.myLine == undefined ) {
			// Load chart
			window.onload = function() {
				let ctx = document.getElementById( 'canvas-' + buoyID ).getContext( '2d' );
				// Hide loading message
				const chartWrapper = document.getElementsByClassName('chart-js-layout-' + buoyID);
				if( chartWrapper ) {
					chartWrapper[0].getElementsByClassName('loading')[0].setAttribute( 'style', 'display: none');
				}
				// Load chart
				window.myLine = new Chart(ctx, config);
			};
		}
		else {
			removeData( window.myLine );
			addData( window.myLine, config.data.labels, config.data.datasets );
			// let ctx = document.getElementById( 'canvas-' + buoyID ).getContext( '2d' );
			// // Hide loading message
			// const chartWrapper = document.getElementsByClassName('chart-js-layout-' + buoyID);
			// if( chartWrapper ) {
			// 	chartWrapper[0].getElementsByClassName('loading')[0].setAttribute( 'style', 'display: none');
			// }
			// // Load chart
			// window.myLine = new Chart(ctx, config);
		}
	}
	else {
		// No waves values
		return;
	}		
}

function addData(chart, label, data) {
	chart.data.labels.push(label);
	chart.data.datasets.forEach((dataset) => {
			dataset.data.push(data);
	});
	chart.update();
}

function removeData(chart) {
	chart.data.labels.pop();
	chart.data.datasets.forEach((dataset) => {
			dataset.data.pop();
	});
	chart.update();
}