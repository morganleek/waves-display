import $ from 'jquery';
import Litepicker from 'litepicker';
import { wadProcessBuoyData } from './fetch-buoy';

export function wadDatePicker( trigger ) {
	if( trigger !== 'undefined' ) {
		let picker = new Litepicker( { 
			element: trigger,
			firstDay: 1,
			format: 'YYYY-MM-DD',
			numberOfMonths: 2,
			numberOfColumns: 2,
			minDate: 'Sun Dec 01 2019',
			maxDate: new Date(),
			selectForward: true,
			autoApply: true,
			mobileFriendly: true,
			singleMode: false,
			onSelect: function( date1, date2 ) { 
				const buoyId = this.options.element.dataset.buoyId;
				const start = date1.getTime() / 1000; // moment(date1).format('YYYY-MM-DD+00:00:00');
				const end = date2.getTime() / 1000; // moment(date2).format('YYYY-MM-DD+23:59:59');

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