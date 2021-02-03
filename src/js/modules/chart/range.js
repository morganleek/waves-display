import Chart from 'chart.js';
import Litepicker from 'litepicker';
import { uwaFetchChartData } from './data';

export function uwaInitializeRange( trigger ) {
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
				const thisButton = this.options.element;
				const thisButtonConsole = thisButton.parentElement.parentElement;
				const buoyID = thisButtonConsole.dataset.buoy;
				
				const from = moment(date1).format('YYYY-MM-DD+00:00:00');
				const until = moment(date2).format('YYYY-MM-DD+23:59:59');

				const params = {
					action: 'uwa_datawell_wave_points_json',
					buoy_id: buoyID,
					wave_from: until,
					wave_until: from,
					time_adjustment: '+8' // Replace
				};
	
				uwaFetchChartData( params );
			},
		} );
	}
}