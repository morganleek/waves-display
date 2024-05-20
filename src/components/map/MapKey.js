export const MapKey = ( { showHistoric, setShowHistoric, showLive, setShowLive } ) => {
	return ( wad.buoy_display_key == undefined || wad.buoy_display_key == "1" ) ?
		<div id="historic-data">
			<label htmlFor="show-historic">
				<input 
					type="checkbox"
					name="show-historic"
					checked={ showHistoric }
					onChange={ () => setShowHistoric(!showHistoric) }
					/> Historical Data
			</label>
			<label htmlFor="show-live">
				<input 
					type="checkbox"
					name="show-live"
					checked={ showLive }
					onChange={ () => setShowLive(!showLive) }
					/> Live Data
			</label>
		</div>
	: undefined;
}