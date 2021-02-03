<?php
	// Enqueue scripts and JS object
	function wad_header_scripts() {
		if ($GLOBALS['pagenow'] != 'wp-login.php' && !is_admin()) {
			wp_register_style(
				'wad-style', WAD__PLUGIN_URL . 'dist/css/bundle.css', array(), WAD_VERSION, 'screen'
			);
			wp_enqueue_style( 'wad-style' );

			// Register
			wp_register_script(
				'wad-scripts', 
				WAD__PLUGIN_URL . 'dist/js/bundle.js', 
				array( 'jquery' ), 
				WAD__VERSION
			);
		
			// Enqueue
			wp_enqueue_script('wad-scripts');
			
			// Extras
			wp_localize_script( 
				'wad-scripts', 
				'wad',
				array( 
					'ajax' => admin_url( 'admin-ajax.php' ),
					'plugin' => WAD__PLUGIN_URL,
					'googleApiKey' => WAD__GOOGLE_MAPS_API_KEY,
					'googleLat' => WAD__GOOGLE_MAPS_LAT,
					'googleLng' => WAD__GOOGLE_MAPS_LNG
				)
			);
		}
	}

	add_action('init', 'wad_header_scripts'); 