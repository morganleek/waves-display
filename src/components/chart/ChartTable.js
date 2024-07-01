import { useEffect, useState } from "@wordpress/element";
import { DateTime } from 'luxon'; 
import classNames from 'classnames';

export const ChartTable = ( { data, show, buoyLastUpdated } ) => {
	const [dataPoint, setDataPoint] = useState([]);
	const [latest, setLatest] = useState(null);

	useEffect( () => {
		let latestDataPoint = 0;
		// Reduce data to only what is meant to be visible from `show`
		// and then what actually contains valid data `data.dataPoints.data`
		const chartData = show
			.filter( ( key ) => { 
				// Filter to items that exist
				if( data.dataPoints.hasOwnProperty( key ) ) {
					// Filter values with some data
					return data.dataPoints[key]?.data.length > 0;
				}
				return false;
			} )
			.map( ( key, i ) => { // Map data in a useful way
				// Max value in data
				const latest = data.dataPoints[key].data.reduce( ( a, b ) => {
					return ( a.x > b.x ) ? a : b;
				} );

				// Set max time value
				latestDataPoint = latest.x > latestDataPoint ? latest.x : latestDataPoint;

				// Ensure value is not zero
				return ( parseFloat( latest.y ) !== 0 ) 
					? <li key={ i }>
						{ data.dataPoints[key].description }
						<span>{ latest.y }</span>
					</li>
					: undefined;
			} );
		
		setDataPoint( chartData );

		if( latestDataPoint > 0 ) {
			const warningAge = 4 * 60 * 60 * 1000; // 4 hours
			const dataTime = DateTime.fromMillis( latestDataPoint );

			setLatest( 
				<span 
					className={ classNames( 
						"recent-date",
						{ "out-of-date": latestDataPoint + warningAge < Date.now() }
					) }
					data-time={ latestDataPoint }
				>
					{ dataTime.toFormat( 'd LLL y h:mma' ) }
				</span>
			);
		}
	}, [] );

	return (
		<div className="chart-info">
			<h5 className="latest-observations">
				Latest Observations { latest }
			</h5>
			<ul>
				{ dataPoint }
			</ul>
		</div>
	);
}