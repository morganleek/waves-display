export const calculateBounds = ( latLngs ) => {
	const bounds = {
		north: 90,
		south: -90,
		west: 180,
		east: -180
	};

	if( latLngs.length > 0 ) {
		latLngs.forEach( ( { lat, lng } ) => {
			// Bounds Min/Max
			bounds.north = ( bounds.north < lat ) ? bounds.north : lat;
			bounds.south = ( bounds.south > lat ) ? bounds.south : lat;
			bounds.west = ( bounds.west < lng ) ? bounds.west : lng;
			bounds.east = ( bounds.east > lng ) ? bounds.east : lng;
		} );
	}

	// Check if really zoomed in or only one time and set range to about 0.1 degree +/-
	if( Math.abs( bounds.north - bounds.south ) < 0.1 ) {
		bounds.north -= 0.05;
		bounds.south += 0.05;
	}

	return bounds;
}

export const inBounds = ( latLng, bounds ) => {
	const { lat, lng } = latLng;
	return ( lat > bounds.south && lat < bounds.north && lng > bounds.west && lng < bounds.east );
}

export const markerIcon = ( color ) => {
	const passedColor = ( color ) ? color : "#e4b059"; // Yellow default
	// const passedColor16 = parseInt( passedColor.substr(1, 6), 16 );
	// const strokeColor = "#" + ( ((passedColor16 & 0x7E7E7E) >> 1) | (passedColor16 & 0x808080) ).toString(16);
	return {
		path: "M15.95,6.2l-3.06,9.4H3L-.05,6.2,7.95.39l8,5.81Z",
		fillColor: passedColor,
		fillOpacity: 1,
		strokeWeight: 0,
		rotation: 0,
		scale: 1,
		// strokeColor: strokeColor,
		anchor: { x: 8, y: 8 },
		fillOpacity: 1
	};
};

export const markerTimeIcon = ( color ) => {
	const icon = markerIcon( color );
	return {
		...icon,
		anchor: { x: 2.5, y: 2.5 },
		path: "M5,2.5c0,1.38-1.12,2.5-2.5,2.5S0,3.88,0,2.5,1.12,0,2.5,0s2.5,1.12,2.5,2.5Z"
	};
}


// Convert Array of JSON values to Objects
export const buoyDataToObject = ( data ) => {
  let processed = [];
  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].data_points) {
        try {
          processed.push(JSON.parse(data[i].data_points));
        } catch (e) {
          console.error(e instanceof SyntaxError);
        }
      }
    }
  }
  return processed;
}