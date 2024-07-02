import domReady from "@wordpress/dom-ready";
import { createRoot } from "@wordpress/element";
import App from './display';

domReady( () => {
	const container = document.querySelector( '.wp-block-waves-display' );
	// Narrow results to only certain buoys
	const restrict = container.dataset.buoys ? container.dataset.buoys.split(",") : [];
	const mode = container.dataset.theme;

	const root = createRoot( container );
	root.render( 
		<App restrict={ restrict } mode={ mode } />
		, container 
	);
} );
