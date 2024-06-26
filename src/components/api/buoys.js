export function getBuoys( restrict = [] ) {
  if( typeof( wad ) != "undefined" ) {
    const init = {
      method: 'POST'
    }

    // Restrict to certain buoys
    const restrictQuery = ( restrict.length > 0 ) ? "&restrict=" + restrict.join(",") : "";

    return fetch( wad.ajax + "?action=waf_rest_list_buoys" + restrictQuery, init ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        // console.log( response );
        return response.json();
      } )
      .then( json => json );
  }
}


export function getDriftingBuoys( restrict = [] ) {
  if( typeof( wad ) != "undefined" ) {
    const init = {
      method: 'POST'
    }

    // Restrict to certain buoys
    const restrictQuery = ( restrict.length > 0 ) ? "&restrict=" + restrict.join(",") : "";

    return fetch( wad.ajax + "?action=waf_rest_list_buoys&drifting=1" + restrictQuery, init ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        // console.log( response );
        return response.json();
      } )
      .then( json => json );
  }
  // if( typeof( wad ) != "undefined" ) {
  //   const init = {
  //     method: 'POST'
  //   }
  //   return fetch( wad.ajax + "?action=waf_rest_list_buoys_drifting", init ) 
  //     .then( response => {
  //       if( !response.ok ) throw Error( response.statusText );
  //       // console.log( response );
  //       return response.json();
  //     } )
  //     .then( json => json );
  // }
}

export function getBuoyData( { id, start, end } ) {
  if( typeof( wad ) !== "undefined" ) {
    // Rest URL
    let url = window.location.origin + '/wp-json/waves/v1/buoys';
    // Specific buoy
    if( id ) {
      url += `/${id}`;
    }
    
    // Query params 
    const params = [];
    if( start ) {
      params.push("start=" + start);
    }
    if( end ) {
      params.push("end=" + end);
    }
  
    return fetch( url + "?" + params.join('&'), { method: 'GET' } ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        return response.json();
      } )
      .then( json => json );
  }
}

export function getBuoy( buoyId ) {
  if( typeof( wad ) != "undefined" ) {
    const init = {
      method: 'POST'
    }
    return fetch( wad.ajax + "?action=waf_rest_list_buoy_datapoints&id=" + buoyId, init ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        return response.json();
      } )
      .then( json => json );
  }
}

export function getBuoyByDate( buoyId, startDate, endDate ) {
  if( typeof( wad ) != "undefined" ) {
    const init = {
      method: 'POST'
    }
    return fetch( wad.ajax + "?action=waf_rest_list_buoy_datapoints&id=" + buoyId + "&start=" + startDate + "&end=" + endDate , init ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        return response.json();
      } )
      .then( json => json );
  }
}

export function getBuoyImage( buoyId ) {
	if( typeof( wad ) != "undefined" ) {
    const init = {
      method: 'POST'
    }
    return fetch( wad.ajax + "?action=waf_get_buoy_image_path&buoy_id=" + buoyId, init ) 
      .then( response => {
        if( !response.ok ) throw Error( response.statusText );
        return response.json();
      } )
      .then( json => json );
  }
}