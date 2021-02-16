import $ from 'jquery';
import Litepicker from 'litepicker';
import { wadProcessBuoyData } from './buoy-data';

// import stringify from 'csv-stringify';
// const stringify = require('csv-stringify');

export function wadToggleChart( e ) {
	if( !e.target.classList.contains( 'expanded' ) ) {
		e.target.classList.add( 'expanded' );
	}
}

export function wadDatePicker( trigger, startDate = 'Sun Dec 01 2019' ) {
	if( trigger !== 'undefined' ) {
		// Add a day either side +-86400
		const start = ( trigger.dataset.hasOwnProperty( 'buoyStart' ) ) ? new Date( ( parseInt( trigger.dataset['buoyStart'] ) - 86400 ) * 1000 ) : new Date();
		const end = ( trigger.dataset.hasOwnProperty( 'buoyEnd' ) && parseInt( trigger.dataset['buoyEnd'] ) != 0 ) ? new Date( ( parseInt( trigger.dataset['buoyEnd'] ) + 86400 ) * 1000 ) : new Date();
		// console.log( start );
		console.log( start );
		// console.log( trigger.dataset.hasOwnProperty( 'buoyEnd' ) && parseInt( trigger.dataset['buoyStart'] ) );
		let picker = new Litepicker( { 
			element: trigger,
			firstDay: 1,
			format: 'YYYY-MM-DD',
			numberOfMonths: 2,
			numberOfColumns: 2,
			minDate: start,
			maxDate: end,
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
	}
}

export function wadCSVDownload( trigger ) {
	if( trigger != "undefined" ) {
		trigger.addEventListener( 'click', ( e ) => {
			console.log( e.target.dataset.buoyId );
			const buoyWrapper = document.getElementById( "buoy-" + e.target.dataset.buoyId );
			if( buoyWrapper.getElementsByClassName('calendars-trigger')[0] ) {
				// let data = {
				// 	action: 'waf_rest_list_buoy_datapoints_csv',
				// 	id: e.target.dataset.buoyId
				// };
				let path = "?action=waf_rest_list_buoy_datapoints_csv&id=" + e.target.dataset.buoyId;
				
				const trigger = buoyWrapper.getElementsByClassName( 'calendars-trigger' )[0];
				if( trigger.dataset.hasOwnProperty( 'start' ) ) {
					path += "start=" + trigger.dataset.start;
				}
				if( trigger.dataset.hasOwnProperty( 'end' ) ) {
					path += "end=" + trigger.dataset.end;
				}

				window.location = wad.ajax + path;
			}
		} );
	}
}


