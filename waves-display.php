<?php
/** 
 * Plugin Name:  Waves Display 
 * Plugin URI:   https://github.com/morganleek/waves-fetch
 * Description:  Buoy data display tool to be used with the Waves Fetch plugin
 * Version:      2.0.7
 * Author:       https://morganleek.me/ 
 * Author URI:   https://morganleek.me/ 
 * License:      GPL2 
 * License URI:  https://www.gnu.org/licenses/gpl-2.0.html 
 * Text Domain:  waves-display 
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
			'googleShowAllBuoys' => isset( $options['maps_show_all_buoys'] ) ? $options['maps_show_all_buoys'] : true,
			'obs_table_fields' => $obsTableFields,
			'buoy_display_gauge_wind_direction' => isset($options['buoy_display_gauge_wind_direction']) ? $options['buoy_display_gauge_wind_direction'] : false,
			'buoy_display_gauge_sea_surface' => isset($options['buoy_display_gauge_sea_surface']) ? $options['buoy_display_gauge_sea_surface'] : false,
			'buoy_display_gauge_sea_state' => isset($options['buoy_display_gauge_sea_state']) ? $options['buoy_display_gauge_sea_state'] : false,
			'buoy_display_chart_info' => isset($options['buoy_display_chart_info']) ? $options['buoy_display_chart_info'] : false, 
			'buoy_display_chart_swell_only' => isset($options['buoy_display_chart_swell_only']) ? $options['buoy_display_chart_swell_only'] : false, 
			// 'buoy_display_enable_dark_mode' => isset($options['buoy_display_enable_dark_mode']) ? $options['buoy_display_enable_dark_mode'] : 'light', 
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