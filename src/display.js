import { useEffect, useState, Component, Fragment } from "@wordpress/element";

import { Charts } from './components/chart/Chart';
import { WavesMap } from './components/map/Map';
import { getBuoys, getBuoy, getBuoyData, getBuoyByDate } from "./components/api/buoys";

// import "../scss/bundle.scss"; 

function App(props) {
  // States
  const [showAll, setShowAll] = useState((wad.googleShowAllBuoys) ? wad.googleShowAllBuoys : false);
  // const [center, setCenter] = useState(
  //   {
  //     lat: (typeof (wad) != "undefined" && 'googleLat' in wad && wad.googleLat !== '') ? parseFloat(wad.googleLat) : 0.0,
  //     lng: (typeof (wad) != "undefined" && 'googleLng' in wad && wad.googleLng !== '') ? parseFloat(wad.googleLng) : 0.0
  //   }
  // );
  const [center, setCenter] = useState(null);
  const [zoom, setZoom] = useState(null); // (window.innerWidth < 1200) ? 4 : 5
  const [focus, setFocus] = useState(null);
  const [buoys, setBuoys] = useState([]);

  useEffect( () => {
    getBuoys( props.restrict ).then( json => {
      // Cast some number values
      const newBuoys = json.map( marker => ( { 
				...marker, 
				lat: parseFloat( marker.lat ), 
				lng: parseFloat( marker.lng ),
				drifting: parseInt( marker.drifting ),
				is_enabled: parseInt( marker.is_enabled )
			} ) );

      setBuoys( newBuoys );
    } );

    // if( buoyFocus ) {
    //   if( document.querySelector('[data-buoy-id="' + buoyFocus + '"]') ) {
    //     document.querySelector('[data-buoy-id="' + buoyFocus + '"]').scrollIntoView( { block: "start" } );
    //   }
    // }
  }, [zoom, center]);

  const updateMapCenter = (newCenter) => {
    setCenter(newCenter);
    setZoom(10);
  };

  const updateMapZoom = (newZoom) => {
    // console.log( newZoom );
    setZoom(newZoom);
  };

  const updateFocus = (buoyId) => {
    setFocus(buoyId);
  };

  return (
    <>
      { buoys.length > 0 && (
        <WavesMap
          showAll={showAll}
          center={center}
          setCenter={setCenter}
          zoom={zoom}
          setZoom={setZoom}
          updateFocus={updateFocus}
          restrict={props.restrict}
          mode={props.mode}
          buoys={buoys}
        />
      ) }
      { buoys.length > 0 && (
        <Charts
          updateCenter={updateMapCenter}
          updateZoom={updateMapZoom}
          buoyFocus={focus}
          restrict={props.restrict}
          buoys={buoys}
        />
      ) }
    </>
  );
}

export default App;