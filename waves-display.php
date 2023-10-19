<?php
/**
 * Plugin Name:       Waves Display
 * Description:       Example block scaffolded with Create Block tool.
 * Requires at least: 6.1
 * Requires PHP:      7.0
 * Version:           2.3.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       waves-display
 *
 * @package           create-block
 */

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */

// Security
defined( 'ABSPATH' ) or die( 'No script kiddies please!' );
	
// Plugin Data
require_once( ABSPATH . 'wp-admin/includes/plugin.php' );
$plugin_data = get_plugin_data( __FILE__ );

// Paths
define( 'WAD__PLUGIN_DIR', trailingslashit( plugin_dir_path( __FILE__ ) ) );
define( 'WAD__PLUGIN_URL', plugin_dir_url( __FILE__ ) );
define( 'WAD__VERSION', $plugin_data['Version'] );

// Admin
require_once( WAD__PLUGIN_DIR . 'includes/admin.php' );

// Display (Blog Posts and Old Enqueues)
// require_once( WAD__PLUGIN_DIR . 'includes/display.php' );

function waves_display_waves_display_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'waves_display_waves_display_block_init' );

function waves_display_enqueue_object() {
	// Extras
	$options = get_option('wad_options');

	$obsTableFields = [];
	if( !empty( $options['obs_table_fields'] ) ) {
		$obs = str_replace( ' ', '', $options['obs_table_fields'] );
		$obsTableFields = explode( ',', $obs );
	}
	
	wp_localize_script( 
		'waves-display-view-script', 
		'wad',
		array( 
			'ajax' => admin_url( 'admin-ajax.php' ),
			'plugin' => WAD__PLUGIN_URL,
			'googleApiKey' => $options['maps_key'],
			'googleLat' => $options['maps_lat'],
			'googleLng' => $options['maps_lng'],
			'googleShowAllBuoys' => $options['maps_show_all_buoys'],
			'obs_table_fields' => $obsTableFields,
			'buoy_display_key' => isset( $options['buoy_display_key'] ) ? $options['buoy_display_key'] : "0",
			'buoy_display_init_current' => isset( $options['buoy_display_init_current'] ) ? $options['buoy_display_init_current'] : "0",
			'buoy_display_init_historic' => isset( $options['buoy_display_init_historic'] ) ? $options['buoy_display_init_historic'] : "0",
			'buoy_display_require_user_info' => isset( $options['buoy_display_require_user_info'] ) ? $options['buoy_display_require_user_info'] : "0",
			'user_data_nonce' => wp_create_nonce( 'user_submitted_data' . date( 'YmdHa') )
		)
	);

	wp_enqueue_style( 'font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.0/css/all.min.css', array(), '6.2.0' );
}
add_action( 'init', 'waves_display_enqueue_object' );