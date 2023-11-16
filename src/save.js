import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	// Add specific buoys to list if selected
	const { buoys } = attributes;

	return (
		<div { ...useBlockProps.save() } data-buoys={ buoys.join(",") }></div>
	);
}
