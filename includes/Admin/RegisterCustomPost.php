<?php

namespace Dynamic\Seatplan\Admin;

class RegisterCustomPost{
    public function __construct(){
        add_action('init', [$this, 'register_custom_post_type']);
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

}