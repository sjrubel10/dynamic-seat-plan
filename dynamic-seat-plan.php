<?php
/**
 * Plugin Name: Dynamic seat plan
 * Description: Creates a custom post type with meta boxes and saves metadata using AJAX.
 * Version: 1.0
 * Author: Your Name
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) exit;

class CustomPostAjaxMetaSave {

    const version = '1.0';
    public function __construct() {
        add_action('init', [$this, 'register_custom_post_type']);
        add_action('add_meta_boxes', [$this, 'add_meta_boxes']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_admin_scripts']);
        add_action('wp_ajax_save_custom_meta_data', [$this, 'handle_ajax_meta_save']);
        add_action('admin_footer', [$this, 'add_inline_scripts']);
//        add_shortcode('display_seat_plan', [$this, 'display_seat_plan_shortcode']);

        add_filter( 'the_content', [ $this, 'display_seat_plan'] );
        $this->define_constants();
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

    public function add_meta_boxes() {
        add_meta_box(
            'custom_meta_box',
            __('Custom Meta Data'),
            [$this, 'render_meta_box'],
            'custom_item',
            'normal',
            'high'
        );
    }

    public function render_meta_box($post) {
        wp_nonce_field('save_custom_meta', 'custom_meta_nonce');
        $plan_seats = unserialize( get_post_meta($post->ID, '_custom_field_1', true ) );
        error_log( print_r( [ '$custom_field_1' => $plan_seats], true ) );
        ?>
        <h1>Make Seat Plan</h1>
        <div class="controls" id="<?php echo esc_attr( $post->ID )?>">
<!--            <input type="text" id="plan-name" placeholder="Plan Name">-->
            <input type="hidden" id="plan_id" name="plan_id" value="<?php echo esc_attr( $post->ID );?>">
            <div class="setPriceColorHolder">
                <div class="colorPriceHolder">
                    <div>
                        <span>Select Color</span>:
                        <input type="color" id="setColor" value="#3498db">
                    </div>
                    <button id="applyColorChanges">Set Color</button>
                </div>
                <div class="colorPriceHolder">
                    <div>
                        <span> Set Price:</span>
                        <input type="number" id="setPrice" placeholder="Enter price">
                    </div>
                    <button id="applyChanges">Set Price</button>
                </div>
            </div>


            <div class="setSeatNumber">
<!--                <button class="set_seat_number" id="set_seat_number">Set Seat Number</button>-->
                <input type="text" id="seat_number_prefix" placeholder="Prefix Like A ">
                <input type="number" id="seat_number_count" placeholder="1" value="0">
                <button class="set_seat_number" id="set_seat_number">Set Seat Number</button>
            </div>

            <div class="planControlHolder">
                <button class="set_multiselect" id="set_multiselect">Multiselect</button>
                <button class="set_single_select" id="set_single_select">Single Select</button>
                <button class="make_circle" id="enable_resize">Resize</button>
                <button class="drag_drop" id="enable_drag_drop">Drag & Drop</button>
                <button class="removeSelected" id="removeSelected">Erase</button>
            </div>

            <div class="rotateControls">
                <button id="rotateLeft">Rotate Left</button>
                <button id="rotateRight">Rotate Right</button>
                <input type="text" name="rotationAngle" id="rotationAngle" value="10" placeholder="10 degree">
            </div>


            <button id="clearAll"> All Clear</button>
            <button id="savePlan">Save Plan</button>

            <div class="movementControl">
                <div id="left" class="movement">Left</div>
                <div id="right" class="movement">Right</div>
                <div id="top" class="movement">Top</div>
                <div id="bottom" class="movement">Bottom</div>
                <input class="movementInPx" id="movementInPx" name="movementInPx" type="number" value="15" placeholder="movement in px">
            </div>
        </div>
        <!--        <div id="seat-grid" class="seat-grid"></div>-->
        <?php

        $box_size = 35;
        $rows = 20;
        $columns = 14;
        $childWidth = $box_size;
        $childHeight = $box_size + 5;
        $gap = 5;

        $seats = [];
        for ( $row = 0; $row < $rows; $row++ ) {
            for ($col = 0; $col < $columns; $col++) {
                $seats[] = ['col' => $row, 'row' => $col];
            }
        }

        echo '<div class="parentDiv" id="parentDiv" style="position: relative; width: ' . ($columns * ($childWidth + $gap) - $gap) . 'px; height: ' . ($rows * ($childHeight + $gap) - $gap) . 'px;">';
        foreach ( $seats as $seat ) {
            $isSelected = false;
            $row = $seat['row'];
            $col = $seat['col'];
            $left = $row * ($childWidth + $gap) + 10;
            $top = $col * ($childHeight + $gap) + 10;
            $seat_number = $col * $columns + $row;
            $seat_num = '';
            $seat_price = 0;
            $background_color = '';
            $zindex = 'auto';
            $to = $top;
            $le = $left ;
            $width = $childWidth;
            $height = $childHeight;
            $degree = 0;
            if( is_array( $plan_seats ) && count( $plan_seats ) > 0 ) {
                foreach ($plan_seats as $plan_seat) {
                    if ($plan_seat['col'] == $row && $plan_seat['row'] == $col) {
                        $isSelected = true;
                        $background_color = $plan_seat['color'];
                        $seat_num = isset($plan_seat['seat_number']) ? $plan_seat['seat_number'] : '';
                        $seat_price = $plan_seat['price'];
                        $width = (int)$plan_seat['width'];
                        $height = (int)$plan_seat['height'];
                        $zindex = $plan_seat['z_index'];
                        $to = (int)$plan_seat['top'];
                        $le = (int)$plan_seat['left'];
                        $degree = (int)$plan_seat['data_degree'];
                        break;
                    }
                }
            }
            if( $isSelected ){
                $class = ' save ';
                $color = $background_color;
                $seat_number = $seat_num;
                $wi = $width;
                $hi = $height;
                $zindex = is_numeric( $zindex ) ? $zindex : 'auto';
                $top = $to;
                $left = $le;
            }
            else{
                $class = '';
                $color = '';
                $wi = $childWidth;
                $hi = $childHeight;
            }
//    echo '<div class="childDiv"  data-row="'.$col.'" data-col="'.$row.'" data-id="' . $col . '-'. $row. ' " data-price="0" style="position: absolute; width: ' . $childWidth . 'px; height: ' . $childHeight . 'px; left: ' . $top . 'px; top: ' . $left . 'px;">' . $id . '</div>';
            echo '<div class=" childDiv ' . $class . '"
              id = "div'.$col.'_'.$row.'"
              data-id="' . $col . '-' . $row . '" 
              data-row="' . $col . '" 
              data-col="' . $row . '" 
              data-seat-num=" ' . $seat_num . ' " 
              data-price=" ' . $seat_price . ' " 
              data-degree=0
              style="
              left: ' . $left . 'px; 
              top: ' . $top . 'px;
              width: ' . $wi . 'px;
              height: ' . $hi . 'px;
              background-color: '.$color.';
              z-index: '.$zindex.';
              transform: rotate('.$degree.'deg);
              "> '.$seat_number.'
          </div>';
        }
        echo '</div>';
    }

    public function enqueue_admin_scripts($hook) {
        global $post;
        if (($hook === 'post.php' || $hook === 'post-new.php') && $post && $post->post_type === 'custom_item') {
            wp_enqueue_script('custom-ajax-script', plugin_dir_url(__FILE__) . 'custom-ajax.js', ['jquery'], null, true);
            wp_enqueue_script('jquery', 'https://code.jquery.com/jquery-3.6.0.min.js', [], null, true);
            wp_enqueue_script('jquery-ui', 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js', ['jquery'], null, true);
            wp_enqueue_style('jquery-ui-style', 'https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css');
            wp_enqueue_style('create_seat_plan', SEAT_Plan_ASSETS . 'css/create_seat_plan.css', array(), SEAT_Plan_VERSION );


            wp_localize_script('custom-ajax-script', 'ajax_object', [
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('custom_ajax_nonce')
            ]);
        }
    }

    public function handle_ajax_meta_save() {
        check_ajax_referer('custom_ajax_nonce', 'nonce');

        $post_id = intval($_POST['post_id']);
        if (!$post_id || get_post_type($post_id) !== 'custom_item') {
            wp_send_json_error(['message' => 'Invalid post ID or post type.']);
        }

        if (!current_user_can('edit_post', $post_id)) {
            wp_send_json_error(['message' => 'Permission denied.']);
        }

        $custom_field_1 = serialize($_POST['custom_field_1']);
        update_post_meta($post_id, '_custom_field_1', $custom_field_1);

        wp_send_json_success(['message' => 'Meta data saved successfully.']);
    }

    public function add_inline_scripts() {
        global $post;
        if ($post && $post->post_type === 'custom_item') {
            wp_enqueue_script('create_seat_plan',SEAT_Plan_ASSETS . 'js/create_seat_plan.js', array(), SEAT_Plan_VERSION, true);

        }
    }

    public function display_seat_plan($content) {
        if (is_single() && in_the_loop() && is_main_query()) {
            wp_enqueue_style('seat-plan-css', SEAT_Plan_ASSETS . 'css/seat-plan.css', [], SEAT_Plan_VERSION );
            wp_enqueue_script('view_seat_info', SEAT_Plan_ASSETS . 'js/view_seat_info.js',  ['jquery'], SEAT_Plan_VERSION );
            $post_id = get_the_ID();
            $plan_seats = unserialize(get_post_meta($post_id, '_custom_field_1', true));

            error_log( print_r( [ '$plan_seats' => $plan_seats ], true ) );
            if (!empty($plan_seats) && is_array( $plan_seats )) {
                $leastLeft = PHP_INT_MAX;
                $leastTop = PHP_INT_MAX;

                foreach ($plan_seats as $item) {
                    if (isset($item["left"])) {
                        $currentLeft = (int)rtrim($item["left"], "px");
                        $currentTop = (int)rtrim($item["top"], "px");

                        if ($currentLeft < $leastLeft) {
                            $leastLeft = $currentLeft;
                        }
                        if ($currentTop < $leastTop) {
                            $leastTop = $currentTop;
                        }
                    }
                }

                // Start building custom content
                $custom_content = '<div id="seat-info" style="margin-top: 20px; font-size: 16px;">
                                        <strong>Seat Info:</strong> <span id="info"></span>
                                    </div>
                                    <div id="seat-grid"><div class="boxHolder">';

                foreach ($plan_seats as $seat) {
                    if (isset($seat["left"])) {
                        $width = isset($seat['width']) ? (int)$seat['width'] : 0;
                        $height = isset($seat['height']) ? (int)$seat['height'] : 0;
                        $uniqueId = "seat-{$seat['id']}"; // Unique ID for each seat

                        $custom_content .= '<div class="box" 
                        id="' . esc_attr($uniqueId) . '" 
                        data-price="' . esc_attr($seat['price']) . '" 
                        data-seat-num="1" 
                        style="
                            width: ' . $width . 'px;
                            height: ' . $height . 'px;
                            left: ' . ((int)$seat['left'] - $leastLeft) . 'px;
                            top: ' . ((int)$seat['top'] - $leastTop) . 'px;
                            transform: rotate('.(int)$seat['data_degree'].'deg);"
                        title="Price: $' . esc_attr($seat['price']) . '">
                        <div class="boxChild" 
                            style="
                                background-color: ' . esc_attr($seat['color']) . ';
                                width: ' . ($width - 4) . 'px;
                                height: ' . ($height - 3) . 'px;">
                            <span class="seat_number">' . esc_html($seat['seat_number'] ?? '') . '</span>
                        </div>
                    </div>';
                    }
                }

                $custom_content .= '</div></div>';
                $content .= $custom_content;
            }
        }
        return $content;
    }


}

new CustomPostAjaxMetaSave();
