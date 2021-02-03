// import Chart from 'chart.js';

// export function uwaGenerateBuoyDate( timestamp, utcOffset ) {
// 	const timeMilliseconds = timestamp * 1000; // Milliseconds for JS
// 	const utcDate = moment(timeMilliseconds);
// 	return utcDate.utcOffset( utcOffset ).toDate();
// }

// export function uwaGenerateBuoyDateString( timestamp, utcOffset, formatTime = 'H:mm', formatDay = 'MM/DD' ) {
// 	const timeMilliseconds = timestamp * 1000; // Milliseconds for JS
// 	const utcDate = moment(timeMilliseconds);
// 	const noonOffset = parseFloat( utcOffset ) * 3600;
// 	if( timeMilliseconds % noonOffset == 0 || timeMilliseconds % ( noonOffset + 1800 ) == 0 ) {
// 		return utcDate.utcOffset( utcOffset ).format( formatDay );
// 	}
// 	else {
// 		return utcDate.utcOffset( utcOffset ).format( formatTime );
// 	}
// }

// export function uwaGenerateBuoyDateTimeString( timestamp, utcOffset, format = 'MM/DD/YY H:mm' ) {
// 	const timeMilliseconds = timestamp * 1000; // Milliseconds for JS
// 	const utcDate = moment(timeMilliseconds);
// 	const noonOffset = parseFloat( utcOffset ) * 3600;
// 	// if( timeMilliseconds % noonOffset == 0 || timeMilliseconds % ( noonOffset + 1800 ) == 0 ) {
// 	// 	return utcDate.utcOffset( utcOffset ).format( formatDay );
// 	// }
// 	// else {
// 	// }
// 	return utcDate.utcOffset( utcOffset ).format( format );
// }