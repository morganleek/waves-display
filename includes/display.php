<?php
	// Enqueue scripts and JS object
	function wad_header_scripts() {
		if ($GLOBALS['pagenow'] != 'wp-login.php' && !is_admin()) {
			// Plugin Options
			$options = get_option('wad_options');

			wp_register_style(
				'wad-style', WAD__PLUGIN_URL . 'dist/css/bundle.css', array(), WAD__VERSION, 'screen'
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
					'googleApiKey' => $options['maps_key'],
					'googleLat' => $options['maps_lat'],
					'googleLng' => $options['maps_lng']
				)
			);
		}
	}

	add_action('init', 'wad_header_scripts'); 