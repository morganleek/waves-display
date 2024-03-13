import domReady from "@wordpress/dom-ready";
import { render } from "@wordpress/element";
import App from './display';

domReady( () => {
	const container = document.querySelector( '.wp-block-waves-display' );
	// Narrow results to only certain buoys
	const restrict = container.dataset.buoys ? container.dataset.buoys.split(",") : [];
	console.log( container.dataset.buoys );
	const mode = container.dataset.theme;
	
	render( <App restrict={ restrict } mode={mode} />, container );
} );
