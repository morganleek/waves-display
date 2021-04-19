import $ from 'jquery';
import Litepicker from 'litepicker';
import { wadProcessBuoyData } from './buoy-data';
import { wadGenerateChartData, wadDrawChart } from './chart';

// import stringify from 'csv-stringify';
// const stringify = require('csv-stringify');

export function wadToggleChart( e ) {
	// if( !e.target.classList.contains( 'expanded' ) ) {
	// 	e.target.classList.add( 'expanded' );
	// }
	e.target.classList.toggle( 'expanded' );
}

export function wadExpandCharts( trigger ) {
	if( trigger !== 'undefined' ) {
		trigger.addEventListener( 'click', ( e ) => {
			const buoyId = e.target.dataset.buoyId;
			if( typeof( window.myChartData ) != "undefined" ) {
				const canvasWrapper = document.querySelector('#buoy-' + buoyId + ' .canvas-wrapper' );
				if( canvasWrapper ) {
					let charts;
					if( !e.target.classList.contains( 'expanded' ) ) {
						e.target.classList.add( 'expanded' );
						e.target.innerHTML = '<i class="fa fa-compress" aria-hidden="true"></i> Collapse';
					
						// Charts
						charts = [
							{ hsig: true }, 
							{ tp: true }, 
							{ sst: true }, 
							{ bottomTemp: true },
							{ windspeed: true }
						];
					}
					else {
						e.target.classList.remove( 'expanded' );
						e.target.innerHTML = '<i class="fa fa-expand" aria-hidden="true"></i> Expand';

						// Charts
						charts = [{ hsig: true,
							tp: true,
							sst: false, 
							bottomTemp: false 
						}];
					}
					
					// Clear existing
					canvasWrapper.innerHTML = '';
					for( let i = 0; i < charts.length; i++ ) {
						// Create chart data
						const chartData = wadGenerateChartData( window.myChartData['buoy-' + buoyId], charts[i] );
						if( chartData.config.data.datasets.length > 0 ) {
							// Create heading
							if( charts.length == 1 ) {
								const singleHeading = document.createElement( 'h4' );
								singleHeading.className = "text-center";
								singleHeading.innerHTML = chartData.config.data.datasets[0].label;
								canvasWrapper.appendChild( singleHeading );
							}
							// Create canvas
							const singleCanvas = document.createElement( 'canvas' );
							// singleCanvas.className = charts[i];
							canvasWrapper.appendChild( singleCanvas );
							// Context
							const canvasContext = singleCanvas.getContext( '2d' );
							// Draw
							wadDrawChart( chartData.config, canvasContext );
						
						}
					}
				}	
			}
		} );
	}
}

export function wadDatePicker( trigger, startDate = 'Sun Dec 01 2019' ) {
	if( trigger !== 'undefined' ) {
		// Add a day either side +-86400
		const start = ( trigger.dataset.hasOwnProperty( 'buoyStart' ) ) ? new Date( ( parseInt( trigger.dataset['buoyStart'] ) - 86400 ) * 1000 ) : new Date();
		const end = ( trigger.dataset.hasOwnProperty( 'buoyEnd' ) && parseInt( trigger.dataset['buoyEnd'] ) != 0 ) ? new Date( ( parseInt( trigger.dataset['buoyEnd'] ) + 86400 ) * 1000 ) : new Date();
		const startDate = ( trigger.dataset.hasOwnProperty( 'start' ) ) ? new Date( ( parseInt( trigger.dataset['start'] ) - 86400 ) * 1000 ) : new Date();
		const endDate = ( trigger.dataset.hasOwnProperty( 'end' ) && parseInt( trigger.dataset['end'] ) != 0 ) ? new Date( ( parseInt( trigger.dataset['end'] ) + 86400 ) * 1000 ) : new Date();
		// console.log( trigger.dataset );
		
		let picker = new Litepicker( { 
			element: trigger,
			firstDay: 1,
			format: 'YYYY-MM-DD',
			numberOfMonths: 2,
			numberOfColumns: 2,
			minDate: start,
			maxDate: end,
			startDate: startDate,
			endDate: endDate,
			selectForward: true,
			autoApply: true,
			mobileFriendly: true,
			singleMode: false,
			onSelect: function( date1, date2 ) { 
				const buoyId = this.options.element.dataset.buoyId;
				const start = date1.getTime() / 1000; // moment(date1).format('YYYY-MM-DD+00:00:00');
				const end = date2.getTime() / 1000; // moment(date2).format('YYYY-MM-DD+23:59:59');
				this.options.element.dataset['start'] = start;
				this.options.element.dataset['end'] = end;

				if( document.getElementById( "buoy-" + buoyId ) ) {
					if( document.getElementById( "buoy-" + buoyId ).getElementsByClassName( 'canvas-wrapper' ).length > 0 ) {
						document.getElementById( "buoy-" + buoyId ).getElementsByClassName( 'canvas-wrapper' )[0].classList.add( 'loading' );
					}
				}

				$.ajax({
					type: 'POST',
					url: wad.ajax,
					data: { 
						action: 'waf_rest_list_buoy_datapoints',
						id: buoyId,
						start: start,
						end: end
					},
					success: wadProcessBuoyData,
					dataType: 'json'
				})
			},
		} );
		// Store Picker
		if( trigger.dataset.hasOwnProperty( 'buoyId' ) ) {
			if( typeof( window.myPickers ) == "undefined" ) {
				window.myPickers = [];
			}
			const buoyId = trigger.dataset['buoyId'];
			window.myPickers['buoy' + buoyId] = picker;
		}
	}
}

export function wadCSVDownload( trigger ) {
	if( trigger != "undefined" ) {
		trigger.addEventListener( 'click', ( e ) => {
			const buoyWrapper = document.getElementById( "buoy-" + e.target.dataset.buoyId );
			if( buoyWrapper.getElementsByClassName('calendars-trigger')[0] ) {
				let path = "?action=waf_rest_list_buoy_datapoints_csv&id=" + e.target.dataset.buoyId;
				
				const trigger = buoyWrapper.getElementsByClassName( 'calendars-trigger' )[0];
				if( trigger.dataset.hasOwnProperty( 'start' ) ) {
					path += "&start=" + trigger.dataset.start;
				}
				if( trigger.dataset.hasOwnProperty( 'end' ) ) {
					path += "&end=" + trigger.dataset.end;
				}

				if( document.getElementById( 'cc-license' ) ) {
					$('#cc-license').modal(); // Open popup
					$('#cc-license').attr('data-url', wad.ajax + path);
				}
			}
		} );
	}
}

$( function() {
	$( '#cc-license' ).on( 'click', '.btn.btn-primary', function() {
		if( $( '#cc-license' ).attr( 'data-url' ) ) {
			window.location = $( '#cc-license' ).attr( 'data-url' );
		}
		$( '#cc-license' ).modal( 'hide' );
	} ); 
} );