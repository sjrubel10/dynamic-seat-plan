<?php

namespace Dynamic\Seatplan\Admin;

class Enque{

    public function __construct(){
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        add_action('admin_footer', [$this, 'add_inline_scripts']);
    }

    public function enqueue_admin_scripts($hook) {
        global $post;
        if (($hook === 'post.php' || $hook === 'post-new.php') && $post && $post->post_type === 'custom_item') {
            wp_enqueue_script('custom-ajax-script', plugin_dir_url(__FILE__) . 'custom-ajax.js', ['jquery'], null, true);
            wp_enqueue_script('jquery', 'https://code.jquery.com/jquery-3.6.0.min.js', [], null, true);
            wp_enqueue_script('jquery-ui', 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js', ['jquery'], null, true);
            wp_enqueue_style('jquery-ui-style', 'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css');
            wp_enqueue_style('create_seat_plan', SEAT_Plan_ASSETS . 'css/create_seat_plan.css', array(), SEAT_Plan_VERSION );
            wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css', array(), '5.15.4');

            wp_localize_script('custom-ajax-script', 'ajax_object', [
                'ajax_url' => admin_url('admin-ajax.php'),
                'site_url' => get_site_url(),
                'nonce' => wp_create_nonce('custom_ajax_nonce'),
            ]);
        }
        wp_enqueue_script('templatemanage',SEAT_Plan_ASSETS . 'js/templatemanage.js', array(), SEAT_Plan_VERSION, true);
        wp_enqueue_script('settings',SEAT_Plan_ASSETS . 'js/settings.js', array(), SEAT_Plan_VERSION, true);
        wp_enqueue_style('templates', SEAT_Plan_ASSETS . 'css/templates.css', array(), SEAT_Plan_VERSION );
        wp_enqueue_style('settings', SEAT_Plan_ASSETS . 'css/settings.css', array(), SEAT_Plan_VERSION );
        wp_localize_script('templatemanage', 'site_ajax_object', [
            'site_ajax_url' => admin_url('admin-ajax.php'),
            'site_nonce' => wp_create_nonce('ajax_nonce'),
//            'site_url' => get_site_url(),
        ]);

    }

    public function add_inline_scripts() {
        global $post;
        if ($post && $post->post_type === 'custom_item') {
            wp_enqueue_script('create_seat_plan',SEAT_Plan_ASSETS . 'js/create_seat_plan.js', array(), SEAT_Plan_VERSION, true);
            wp_enqueue_script('shapemanage',SEAT_Plan_ASSETS . 'js/shapemanage.js', array(), SEAT_Plan_VERSION, true);

        }
    }

}