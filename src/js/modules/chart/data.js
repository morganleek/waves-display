import { uwaGenerateChart } from './draw';

export function uwaFetchChartData( params ) {
	// Ajax
	const init = {
		method: 'POST'
	};

	if( params ) {
		let paramsString = Object.keys(params).map(function(key) {
			return key + '=' + params[key];
		}).join('&');

		fetch(ajax_object.ajax_url + '?' + paramsString, init)
		.then((response) => {
			return response.json();
		})
		.then((waves) => {
			// Generate Chart
			if( waves.length > 0 ) {
				let buoyID = waves[0].buoy_id
				uwaGenerateChart( buoyID, waves );
			} 
		})
		.catch((e) => {
			// Error
			console.log(e);
		});
	}
}