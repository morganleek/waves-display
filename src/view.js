import domReady from "@wordpress/dom-ready";
import { render } from "@wordpress/element";
import App from './display';

domReady( () => {
	const container = document.querySelector( '.wp-block-waves-display' );
	render( <App />, container );
} );
