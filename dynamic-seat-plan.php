<?php
/**
 * Plugin Name: Dynamic seat plan
 * Description: Creates a custom post type with meta boxes and saves metadata using AJAX.
 * Version: 1.0.0
 * Author: magePeople
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) exit;

require_once __DIR__ . '/vendor/autoload.php';

//new Dynamic\Seatplan\Api();
class DynamicSeatPlan {

    const version = '1.0';
    public function __construct() {

        add_action( 'plugins_loaded', [ $this, 'init_plugin' ] );

        add_action('init', [$this, 'register_custom_post_type']);

        $this->define_constants();

    }

    public function init_plugin() {
        if ( is_admin() ) {
            new Dynamic\Seatplan\Admin();
        }else{
            new Dynamic\Seatplan\Frontend();
        }

    }

    public function define_constants() {
        define( 'SEAT_Plan_VERSION', self::version );
        define( 'SEAT_Plan_FILE', __FILE__ );
        define( 'SEAT_Plan_PATH', __DIR__ );
        define( 'SEAT_Plan_API_LINK', SEAT_Plan_FILE . 'api/' );
        define( 'SEAT_Plan_URL', plugins_url( '', SEAT_Plan_FILE ) );
        define( 'SEAT_Plan_ASSETS', SEAT_Plan_URL . '/assets/' );
        define( 'SEAT_Plan_PLUGIN_NAME', plugin_basename(__FILE__ ) );

    }
    public function register_custom_post_type() {
        register_post_type('custom_item', [
            'labels' => [
                'name' => __('Custom Items'),
                'singular_name' => __('Custom Item')
            ],
            'public' => true,
            'has_archive' => true,
            'supports' => ['title', 'editor']
        ]);
    }

    /**
     * Initializes a singleton instance
     *
     * @return \DynamicSeatPlan
     */
    public static function init() {
        static $instance = false;

        if ( ! $instance ) {
            $instance = new self();
        }

        return $instance;
    }

}

function dynamic_seat_plan() {
    return DynamicSeatPlan::init();
}

// kick-off the plugin
dynamic_seat_plan();
