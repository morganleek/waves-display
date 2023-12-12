import { __ } from '@wordpress/i18n';
import { useBlockProps, BlockControls, InspectorControls } from '@wordpress/block-editor';
import { 
	PanelBody,
	FormTokenField,
	ToggleControl
} from '@wordpress/components';
import { Component, useEffect, useState } from '@wordpress/element';

import './editor.scss';

export default function Edit( { attributes, setAttributes, isSelected } ) {
	// Selected buoys
	const { buoys, darkMode } = attributes;
	// All buoys
	const [allBuoys, setAllBuoys] = useState([]);

	useEffect( () => {
		// Fetch all buoys
		wp.apiFetch( {
			path: 'waves-display/v1/buoys',
		} )
		.then( data => {
			setAllBuoys( JSON.parse( data ) );
		} );
	} );
	
	const updateSelectedBuoys = ( selected ) => {
		// Extract buoy IDs
		const newIds = allBuoys
			.filter( ( buoy ) => selected.includes( buoy.label ) )
			.map( ( buoy ) => buoy.id );

		setAttributes( { buoys: newIds } );
	}

	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<PanelBody title={ __( 'Appearance' ) }>
					<ToggleControl
            checked={ darkMode }
            onChange={ newValue => setAttributes( { darkMode: newValue } ) }
						label="Enable dark mode"
					/>
				</PanelBody>
				<PanelBody title={ __( 'Restrict Buoys' ) }>
					{ allBuoys.length > 0 ? (
						<FormTokenField
							label="Add buoy"
							value={
								allBuoys
									.filter( ( buoy ) => buoys.includes( buoy.id ) )
									.map( ( buoy ) => buoy.label )
							} 
							suggestions={ 
								allBuoys.map( ( buoy ) => buoy.label ) 
							}
							onChange={ updateSelectedBuoys }
						/> )
						: undefined 
					}
				</PanelBody>
			</InspectorControls>
			<div class="maps"></div>
			<div class="charts"></div>
		</div>
	);
}
