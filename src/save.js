import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	// Add specific buoys to list if selected
	const { buoys, darkMode } = attributes;

	const theme = darkMode ? "theme-dark" : "theme-light";
	
	return (
		<div data-theme={ theme } { ...useBlockProps.save() } data-buoys={ buoys.join(",") }></div>
	);
}
