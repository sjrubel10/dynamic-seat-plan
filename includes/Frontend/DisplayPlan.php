<?php

namespace Dynamic\Seatplan\Frontend;

class DisplayPlan{
    public function __construct(){
        add_filter( 'the_content', [ $this, 'display_seat_plan'] );
    }

    public function display_seat_plan($content) {
        if (is_single() && in_the_loop() && is_main_query()) {
            wp_enqueue_style('seat-plan-css', SEAT_Plan_ASSETS . 'css/seat-plan.css', [], SEAT_Plan_VERSION );
            wp_enqueue_script('view_seat_info', SEAT_Plan_ASSETS . 'js/view_seat_info.js',  ['jquery'], SEAT_Plan_VERSION );
            $post_id = get_the_ID();
            $plan_data = get_post_meta($post_id, '_custom_field_1', true);
            $plan_seats = isset( $plan_data['seat_data'] ) ? $plan_data['seat_data'] : array();
            $plan_seat_texts = isset( $plan_data['seat_text_data'] ) ? $plan_data['seat_text_data'] : array();
            $seatIcon = isset( $plan_data['seatIcon'] ) ? $plan_data['seatIcon'] : 'noicon';
            $dynamic_shapes = isset( $plan_data['dynamic_shapes'] ) ? $plan_data['dynamic_shapes'] : '';
            /* if( $seatIcon === 'noicon' || $seatIcon === 'seatnull' ){
                 $icon_url = '';
             }else{
                 $icon_url = SEAT_Plan_ASSETS."images/icons/".$seatIcon.".png";
             }*/


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

                $seat_grid_width = $leastLeft + 1;
                $seat_grid_height = $leastTop + 1;
                // Start building custom content
                $custom_content = '<div id="seat-info" style="margin-top: 20px; font-size: 16px;">
                                        <strong>Seat Info:</strong> <span id="info"></span>
                                    </div>
                                    <div id="seat-grid" ><div class="boxHolder">';
                if ( is_array( $dynamic_shapes ) && count( $dynamic_shapes ) > 0 ) {

                    foreach ( $dynamic_shapes as $dynamic_shape ) {
                        $shape_rotate_deg = isset( $dynamic_shape['shapeRotateDeg'] ) ? $dynamic_shape['shapeRotateDeg'] : 0;
                        $custom_content .= '<div class="dynamicShape" style=" 
                        left: ' . esc_attr( $dynamic_shape['textLeft']  - $leastLeft ) . 'px; 
                        top: ' . esc_attr( $dynamic_shape['textTop']  - $leastTop ) . 'px; 
                        width: ' . esc_attr( $dynamic_shape['width'] ) . 'px;
                        height: ' . esc_attr( $dynamic_shape['height'] ) . 'px;
                        background-color: ' . esc_attr( $dynamic_shape['backgroundColor'] ).'; 
                        border-radius: ' . esc_attr( $dynamic_shape['borderRadius'] ).';
                        clip-path: ' . esc_attr( $dynamic_shape['clipPath'] ).';
                        transform: rotate(' . $shape_rotate_deg . 'deg);
                    ">
                    </div>';
                    }
                }
                if( is_array( $plan_seat_texts ) && count( $plan_seat_texts ) > 0 ) {
                    foreach ($plan_seat_texts as $plan_seat_text) {
                        $text_rotate_deg = isset($plan_seat_text['textRotateDeg']) ? $plan_seat_text['textRotateDeg'] : 0;
                        $custom_content .= '
                    <div class="text-wrapper" data-text-degree=' . $text_rotate_deg . '
                        style="
                        position: absolute; 
                        left: ' . ((int)$plan_seat_text['textLeft'] - $leastLeft) . 'px; 
                        top: ' . ((int)$plan_seat_text['textTop'] - $leastTop) . 'px; 
                        transform: rotate(' . $text_rotate_deg . 'deg);
                        ">
                        <span class="dynamic-text" 
                            style="
                                display: inline-block; 
                                color: ' . $plan_seat_text['color'] . '; 
                                font-size: ' . $plan_seat_text['fontSize'] . ';
                                cursor: pointer;">
                           ' . $plan_seat_text['text'] . '
                        </span>
                    </div>';
                    }
                }
                foreach ($plan_seats as $seat) {
                    if (isset($seat["left"])) {
                        $icon_url = '';
                        $width = isset($seat['width']) ? (int)$seat['width'] : 0;
                        $height = isset($seat['height']) ? (int)$seat['height'] : 0;
                        $uniqueId = "seat-{$seat['id']}"; // Unique ID for each seat
                        $border_radius = isset( $seat['border_radius'] ) ? $seat['border_radius'] : '';

                        if( isset( $seat['backgroundImage'] ) && $seat['backgroundImage'] !== '' ){
                            $icon_url = SEAT_Plan_ASSETS."images/icons/".$seat['backgroundImage'].".png";
                        }

                        $custom_content .= '<div class="box" 
                        id="' . esc_attr($uniqueId) . '" 
                        data-price="' . esc_attr($seat['price']) . '" 
                        data-seat-num="1" 
                        style="
                            width: ' . $width . 'px;
                            height: ' . $height . 'px;
                            left: ' . ((int)$seat['left'] - $leastLeft) . 'px;
                            top: ' . ((int)$seat['top'] - $leastTop) . 'px;
                            border-radius: ' .$border_radius. ';
                            transform: rotate('.(int)$seat['data_degree'].'deg);"
                        title="Price: $' . esc_attr($seat['price']) . '">
                        <div class="boxChild" 
                            style="
                                background-color: ' . esc_attr($seat['color']) . ';
                                background-image: url('.$icon_url.');
                                width: ' . $width . 'px;
                                height: ' . $height . 'px;">
                            <span class="seat_number">' . esc_html($seat['seat_number'] ?? '') . '</span>
                            <div class="seatText" id="seatText'.$uniqueId.'">'.esc_attr(isset( $seat['seatText'] ) ? $seat['seatText'] : '').'</div>
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