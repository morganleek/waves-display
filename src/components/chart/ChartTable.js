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

// export class ChartTable extends Component {
//   constructor( props ) {
//     super( props );
//     this.state = {
//       active: false
//     }
//   }
//   render( ) {
//     // Iterate through chart table items
//     let lineTableRender = [];
//     let last = 0;
//     let dateTime = '';
//     // Each property
//     for( const [key, value] of Object.entries( this.props.dataPoints ) ) {
//       let showItem = true;
//       if( wad.obs_table_fields ) {
//         showItem = wad.obs_table_fields.indexOf( key ) >= 0;
//       }
//       // Properties data length
//       if( showItem && value.data.length > 0 ) {
//         // Search for biggest date value (not ordered by date always)
//         const biggest = value.data.reduce( ( prev, current ) => {
//           return ( prev.x > current.x ) ? prev : current;
//         } );
//         // Check is the lastest of all data points
//         if( biggest.x > last ) {
//           last = biggest.x;
//         }
//         // Check valid data  
//         if( biggest.y >= 0 ) {
//           lineTableRender.push( <li key={ key }>
//             { value.description }
//             <span>{ biggest.y }</span>
//           </li> );
//         }
//       }
//     }
//     // Create date string
//     let hasRecentData = false;
//     if( last > 0 ) {
//       const diff = 4 * 60 * 60 * 1000; // 4 hours
//       const lastTime = DateTime.fromMillis( last );
//       // Mark if last record is more than 4 hours
//       hasRecentData = last + diff > Date.now();
//       dateTime = <span className={ 
//         classNames( 
//           { 
//             "recent-date": hasRecentData, 
//             "out-of-date": !hasRecentData 
//           } 
//         ) 
//       }>{ lastTime.toFormat( 'd LLL y h:mma' ) }<span className="epoch">{ last }</span></span>
//     }
//     return (
//       <div className={ classNames( "chart-info", { "expanded": this.state.active } ) }
//         onClick={ () => this.setState( { active: !this.state.active } ) } >
//         <h5 className='latest-observations'>Latest Observations { dateTime }</h5>
//         <ul>{ lineTableRender }</ul>
//       </div>
//     );
//   }
// }