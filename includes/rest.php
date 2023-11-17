<?php
	// Buoys Restful Info
	function waves_display_buoys_rest_endpoint() {
		register_rest_route('waves-display/v1', '/buoys', [
			'method' => 'GET',
			'callback' => 'waves_display_rest_route_buoys'
		]);
	}

	function waves_display_rest_route_buoys() {
		global $wpdb;

		$buoys = $wpdb->get_results("
			SELECT * FROM {$wpdb->prefix}waf_buoys
			ORDER BY `web_display_name`
		");

		$buoys_array = array_map( function( $buoy ) {
			return array(
				"id" => $buoy->id,
				"label" => $buoy->web_display_name . " [" . $buoy->id . "]"
			);
		}, $buoys );


		// $response = 'Hello there!';
		// return rest_ensure_response($response);
		return rest_ensure_response(
			json_encode( $buoys_array )
		);
	}

	add_action( 'rest_api_init', 'waves_display_buoys_rest_endpoint' );