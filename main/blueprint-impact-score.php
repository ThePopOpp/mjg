<?php
/**
 * Blueprint Impact Score – REST API Endpoint
 *
 * Add this code to your WordPress site in ONE of these ways:
 *   Option A) Paste into your theme's functions.php
 *   Option B) Upload this file as a standalone plugin:
 *             /wp-content/plugins/blueprint-impact-score/blueprint-impact-score.php
 *             and add the plugin header below, then activate it in WP Admin → Plugins.
 *
 * Plugin Name: Blueprint Impact Score
 * Description: Exposes a public REST endpoint for the Impact Score CPT meta fields.
 * Version:     1.0
 */

if ( ! defined( 'ABSPATH' ) ) exit;

add_action( 'rest_api_init', function () {

    register_rest_route( 'blueprint/v1', '/impact-score', array(
        'methods'             => WP_REST_Server::READABLE,
        'permission_callback' => '__return_true',
        'callback'            => function () {

            // Query any published post that has the impact_score meta field set
            $posts = get_posts( array(
                'post_type'      => 'any',
                'post_status'    => 'publish',
                'meta_key'       => 'impact_score',
                'orderby'        => 'modified',
                'order'          => 'DESC',
                'posts_per_page' => 1,
            ) );

            if ( empty( $posts ) ) {
                return new WP_REST_Response( array( 'error' => 'No impact score post found.' ), 404 );
            }

            $post_id = $posts[0]->ID;
            $score   = get_post_meta( $post_id, 'impact_score',      true );
            $date    = get_post_meta( $post_id, 'impact_score_date',  true );

            // Strip any non-numeric characters (e.g. "$", ",") from the score
            $score_int = (int) preg_replace( '/[^0-9]/', '', (string) $score );

            return new WP_REST_Response( array(
                'impact_score'      => $score_int,
                'impact_score_date' => $date,   // Unix timestamp (Jet Engine default)
                'post_id'           => $post_id,
                'post_title'        => get_the_title( $post_id ),
            ), 200 );
        },
    ) );

} );

/**
 * Allow cross-origin GET requests from the Blueprint subdomain.
 * The mission page lives at blueprint.michaeljgauthier.com and fetches
 * from michaeljgauthier.com, so CORS headers are required.
 */
add_filter( 'rest_pre_serve_request', function ( $served, $result, $request ) {
    if ( strpos( $request->get_route(), '/blueprint/v1/' ) !== false ) {
        header( 'Access-Control-Allow-Origin: *' );
        header( 'Access-Control-Allow-Methods: GET, OPTIONS' );
        header( 'Access-Control-Allow-Headers: Content-Type' );
    }
    return $served;
}, 10, 3 );
