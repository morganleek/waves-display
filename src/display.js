import { useEffect, useState, Component, Fragment } from "@wordpress/element";

import { Charts } from './components/Chart';
import { Map } from './components/Map';

// import "../scss/bundle.scss";

const App = ( props ) => {
  // States
  const [showAll, setShowAll] = useState( ( wad.googleShowAllBuoys ) ? wad.googleShowAllBuoys : false );
  const [center, setCenter] = useState( 
    {
      lat: ( typeof( wad ) != "undefined" && 'googleLat' in wad && wad.googleLat !== '' ) ? parseFloat( wad.googleLat ) : 0.0,
      lng: ( typeof( wad ) != "undefined" && 'googleLng' in wad && wad.googleLng !== '' ) ? parseFloat( wad.googleLng ) : 0.0
    }
  );
  const [zoom, setZoom] = useState( ( window.innerWidth < 1200 ) ? 4 : 5 );
  const [focus, setFocus] = useState( null );

  useEffect( ( props ) => {
    console.log( 'App::useEffect' );
    // Props loaded via javascript globals 
    // No need to setup anything but reload 
    // when zoom and center change.
  }, [ zoom, center ] );

  const updateMapCenter = ( newCenter ) => {
    setCenter( newCenter );
    setZoom( 10 );
  }
  
  const updateMapZoom = ( newZoom ) => {
    // console.log( newZoom );
    setZoom( newZoom );
  }

  const updateFocus = ( buoyId ) => {
    setFocus( buoyId );
  }

  return (
    <>
      <Map 
        showAll={ showAll } 
        center={ center } 
        zoom={ zoom } 
        updateFocus={ updateFocus } 
        restrict={ props.restrict }
      />
      <Charts 
        updateCenter={ updateMapCenter } 
        updateZoom={ updateMapZoom } 
        buoyFocus={ focus } 
        restrict={ props.restrict }
      />
    </>
  );
}

export default App;