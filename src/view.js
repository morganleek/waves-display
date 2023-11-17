import domReady from "@wordpress/dom-ready";
import { render } from "@wordpress/element";
import App from './display';

domReady( () => {
	const container = document.querySelector( '.wp-block-waves-display' );
	// Narrow results to only certain buoys
	const restrict = container.dataset.buoys ? container.dataset.buoys.split(",") : [];
	
	render( <App restrict={ restrict } />, container );
} );
