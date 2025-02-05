<?php

namespace Dynamic\Seatplan\Admin;

class MetaBoxes{
    public function __construct(){
        add_action('add_meta_boxes', [$this, 'add_meta_boxes']);

        add_action('add_meta_boxes', [ $this,'add_feature_image_meta_box']);
        add_action('save_post',  [ $this,'save_custom_feature_image']);
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

    public function render_meta_box( $post ) {
        wp_nonce_field('save_custom_meta', 'custom_meta_nonce');
        ?>
        <h1>Make Seat Plan</h1>

        <div class="controls" id="<?php echo esc_attr( $post->ID )?>">
            <input type="hidden" id="plan_id" name="plan_id" value="<?php echo esc_attr( $post->ID );?>">
            <div class="planControlHolder">
                <button class="set_multiselect" id="set_multiselect">Multiselect</button>
                <button class="set_single_select" id="set_single_select">Single Select</button>
                <button class="set_seat enable_set_seat" id="set_seat">Add Seat +</button>
                <button class="set_shape" id="set_shape">Add Shape +</button>
                <button class="make_circle" id="enable_resize" style="display: none">Resize</button>
                <button class="drag_drop" id="enable_drag_drop" style="display: none">Drag & Drop</button>
                <button class="removeSelected" id="removeSelected">Erase</button>
                <button id="setTextnew" class="setTextnew">Set Text</button>
                <button id="importFromTemplatePopUp" class="importFromTemplatePopUp">Import From Template </button>

<!--                <div class="importFromTemplate"><span class=""></span></div>-->
            </div>

        </div>
        <div class="seatContentHolder" id="seatContentHolder">
            <div id="popupContainer" class="popup">
                <div class="popupContent">
                    <span id="closePopup" class="close">&times;</span>
                    <div id="popupInnerContent"></div>
                </div>
            </div>
        <div class="seatPlanHolder">
        <!--        <div id="seat-grid" class="seat-grid"></div>-->
        <?php

        $dynamic_shape_texts = array(
            'rectangle' => array( 'Rectangle','rectangle'),
            'circle' => array( 'Circle','circle'),
            'square' => array( 'Square','square'),
            'pentagon' => array( 'Pentagon','pentagon'),
            'hexagon' => array( 'Hexagon','hexagon'),
            'rhombus' => array( 'Rhombus','rhombus'),
            'parallelogram' => array( 'Parallelogram','parallelogram'),
            'trapezoid' => array( 'Trapezoid','trapezoid'),
            'oval' => array( 'Oval','oval'),
        );

        $shapeText = '<span class="setShapeTitle">Select Shape</span>';
        foreach ( $dynamic_shape_texts as $key => $val ) {
            if( $key === 'rectangle' ){
                $select_class = 'shapeTextSelected';
            }else{
                $select_class = '';
            }
            $src = SEAT_Plan_ASSETS.'images/icons/shape_icons/'.$val[1].'.jpg';
            $shapeText .= '<div class="shapeText '.$select_class.'" id="'.$key.'"><img class="shapeIcon" src="'.$src.'" /></div>';
        }

        $box_size = 35;
        $rows = 30;
        $columns = 24;
        $childWidth = $box_size;
        $childHeight = $box_size + 5;
        $gap = 10;

        $seats = [];
        for ( $row = 0; $row < $rows; $row++ ) {
            for ($col = 0; $col < $columns; $col++) {
                $seats[] = ['col' => $row, 'row' => $col];
            }
        }
        $parent_width = $columns * ($childWidth + $gap) - $gap;
        $parent_height =$rows * ($childHeight + $gap) - $gap;

        echo '<div class="parentDiv" id="parentDiv" style="position: absolute; width: ' .$parent_width . 'px; height: ' . $parent_height . 'px;"> ';

        if( isset( $_GET['templateId'] ) ){
            $post_ids = $_GET['templateId'];
            if( is_numeric( $post_ids ) ){
                $post_id =$post_ids;
                $templates = [ $post_id ];
            }else{
                $templates = explode( '_', $post_ids );
            }
        }else{
            $post_id = $post->ID;
            $templates = [ $post_id ];
        }

        foreach ( $templates as $template ) {
            $plan_data =  get_post_meta( $template, '_custom_field_1', true ) ;
            $plan_seats = isset( $plan_data['seat_data'] ) ? $plan_data['seat_data'] : array();
            $plan_seat_texts = isset( $plan_data['seat_text_data'] ) ? $plan_data['seat_text_data'] : array();
            $dynamic_shapes = isset( $plan_data['dynamic_shapes'] ) ? $plan_data['dynamic_shapes'] : '';
            if ( is_array( $dynamic_shapes ) && count( $dynamic_shapes ) > 0 ) {
                foreach ( $dynamic_shapes as $dynamic_shape ) {
                    $shape_rotate_deg = isset( $dynamic_shape['shapeRotateDeg'] ) ? $dynamic_shape['shapeRotateDeg'] : 0;
                    echo '<div class="dynamicShape ui-resizable ui-draggable ui-draggable-handle" style=" 
                        left: ' . esc_attr( $dynamic_shape['textLeft'] ) . 'px; 
                        top: ' . esc_attr( $dynamic_shape['textTop'] ) . 'px; 
                        width: ' . esc_attr( $dynamic_shape['width'] ) . 'px;
                        height: ' . esc_attr( $dynamic_shape['height'] ) . 'px;
                        background-color: ' . esc_attr( $dynamic_shape['backgroundColor'] ).'; 
                        border-radius: ' . esc_attr( $dynamic_shape['borderRadius'] ).';
                        clip-path: ' . esc_attr( $dynamic_shape['clipPath'] ).';
                        transform: rotate('.$shape_rotate_deg.'deg);">
                    </div>';
                }
            }
            if( is_array( $plan_seat_texts ) && count( $plan_seat_texts ) > 0 ){
                foreach ( $plan_seat_texts as $plan_seat_text ) {
                    $text_rotate_deg = isset( $plan_seat_text['textRotateDeg'] ) ? $plan_seat_text['textRotateDeg'] : 0;
                    echo '<div class="text-wrapper" data-text-degree="'.$text_rotate_deg.'"
                style="
                position: absolute; 
                left: '.$plan_seat_text['textLeft'].'px; 
                top: '.$plan_seat_text['textTop'].'px; 
                transform: rotate('.$text_rotate_deg.'deg);">
                 <span class="dynamic-text" 
                    style="
                        display: block; 
                        color: '.$plan_seat_text['color'].'; 
                        font-size: '. $plan_seat_text['fontSize'].';
                        cursor: pointer;">
                   '.$plan_seat_text['text'].'
                </span>
            </div>';
                }
            }
            foreach ( $seats as $seat ) {
                $isSelected = false;
                $row = $seat['row'];
                $col = $seat['col'];
                $left = $row * ($childWidth + $gap) + 10;
                $top = $col * ($childHeight + $gap) + 10;
                $seat_number = $col * $columns + $row;
                $seat_num = '';
                $seatText = '';
                $seat_price = 0;
                $background_color = '';
                $zindex = 'auto';
                $to = $top;
                $le = $left ;
                $width = $childWidth;
                $height = $childHeight;
                $degree = 0;
                $background_img_url = '';
                $seat_icon_name = '';
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
                            $seatText = isset( $plan_seat['seatText'] ) ? $plan_seat['seatText'] : '';
                            if( isset( $plan_seat['backgroundImage'] ) && $plan_seat['backgroundImage'] !== '' ) {
                                $seat_icon_name = $plan_seat['backgroundImage'];
                                $background_img_url = SEAT_Plan_ASSETS . "images/icons/" . $plan_seat['backgroundImage'] . ".png";
                            }
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

                if( $seat_price === 0 ){
                    $hover_price = '';
                }else{
                    $hover_price = 'Price: '.$seat_price;
                }
                if( $seat_num ){
                    $block = 'block';
                }else{
                    $block = 'none';
                }
                echo '<div class=" childDiv ' . $class . '"
              id = "div'.$col.'_'.$row.'"
              data-id="' . $col . '-' . $row . '" 
              data-row="' . $col . '" 
              data-col="' . $row . '" 
              data-seat-num=" ' . $seat_num . ' " 
              data-price=" ' . $seat_price . ' " 
              data-degree=0
              data-background-image="'.$seat_icon_name.'"
              style="
              left: ' . $left . 'px; 
              top: ' . $top . 'px;
              width: ' . $wi . 'px;
              height: ' . $hi . 'px;
              background-color: '.$color.';
              background-image:url('.$background_img_url.');
              z-index: '.$zindex.';
              transform: rotate('.$degree.'deg);
              ">
            <div class="tooltip" style="display: none;z-index: 999">' . esc_attr($hover_price) . '</div>
            <div class="seatText" id="seatText'.$col.'_'.$row.'" style="display: block;">'.$seatText.'</div>
            <div class="seatNumber" id="seatNumber'.$col.'_'.$row.'" style="display: '.$block.';">'.$seat_num.'</div>
          </div>';
            }
        }


        echo '</div> 
            </div>
            <div class="seatActionControl">
                <div class="dynamicShapeHolder" id="dynamicShapeHolder">
                    '.$shapeText.'
                </div>
                <div class="dynamicShapeColorHolder" style="display: none">
                    <div class="dynamicShapeControl">
                        <div class="dynamicShapeControlText">Shape Setting</div>
                        <div class="colorRemoveHolder">
                            <div class="shapeRotationHolder">
                                <img class="shapeRotate" id="shapeRotateRight" src="'.SEAT_Plan_ASSETS.'images/icons/rotate/rotate_right.webp'.'"/>
                                <img class="shapeRotate" id="shapeRotateLeft" src="'.SEAT_Plan_ASSETS.'images/icons/rotate/rotate_left.webp'.'"/>
                            </div>
                            <input type="color" id="setShapeColor" value="#3498db">
                            <button class="removeDynamicShape" id="removeDynamicShape">X</button>
                        </div>
                    </div>
                </div>
                <div class="dynamicTextControlHolder" style="display: none">
                    <div class="dynamicTextControlText">Text Setting</div>
                    <div class="dynamicTextControlContainer">
                        <div class="textControl">
                            <button class="zoom-in">+</button>
                            <button class="zoom-out">-</button>
                            <button class="remove-text">X</button>
                            <input type="color" id="setTextColor" value="#3498db">
                        </div>
                        <div class="textRotationHolder">
                            <img class="textRotate" id="textRotateRight" src="'.SEAT_Plan_ASSETS.'images/icons/rotate/rotate_right.webp'.'"/>
                            <img class="textRotate" id="textRotateLeft" src="'.SEAT_Plan_ASSETS.'images/icons/rotate/rotate_left.webp'.'"/>
                        </div>
                    </div>
                </div>
                
                <button id="clearAll"> All Clear</button>
                <button class="savePlan" id="savePlan">Save Plan</button>
                <button class="savePlan" id="savePlanAsTemplate">Save Plan with Template</button>
                <button id="setTextPlan" class="setTextPlan" style="display: none">Set text</button>
                <div class="setPriceColorHolder" id="setPriceColorHolder" style="display: none">
                    <div class="rotateControls">
                        <select class="rotationHandle" name="rotationHandle" id="rotationHandle" style="display: none">
                            <option class="options" selected value="top-to-bottom">Rotate top to bottom</option>
                            <option class="options"  value="bottom-to-top">Rotate bottom to Top</option>
                            <option class="options"  value="right-to-left">Rotate right to Left</option>
                            <option class="options"  value="left-to-right">Rotate left to Right</option>
                        </select>
                        <div class="seatRotateIconTextHolder">
                            <span class="seatRotateIconText">Seat Rotate In Degree</span>
                            <div class="seatRotateIconImgHolder"> 
                                <div class="seatRotateIconHolder">
                                    <img class="shapeRotate" id="rotateRight" src="'.SEAT_Plan_ASSETS.'images/icons/rotate/rotate_right.webp'.'"/>
                                    <img class="shapeRotate" id="rotateLeft" src="'.SEAT_Plan_ASSETS.'images/icons/rotate/rotate_left.webp'.'"/>
                                </div>
                                <input class="seatRotateDegree" type="number" name="rotationAngle" id="rotationAngle" value="10" placeholder="10 degree">
                            </div>
                        </div>
                    </div>
                    <div class="seatIconContainer">
                        <span class="seatIconTitle">Select seat icon</span>
                        <div class="seatIconHolder" id="seatIconHolder">
                            <img class="seatIcon" id="icon2" src="'.SEAT_Plan_ASSETS.'images/icons/icon2.png"/>
                            <img class="seatIcon" id="seat1" src="'.SEAT_Plan_ASSETS.'images/icons/seat1.png"/>
                            <img class="seatIcon" id="chairdown" src="'.SEAT_Plan_ASSETS.'images/icons/chairdown.png"/>
                            <img class="seatIcon" id="shofa1" src="'.SEAT_Plan_ASSETS.'images/icons/shofa1.png"/>
                            <img class="seatIcon" id="shofa2" src="'.SEAT_Plan_ASSETS.'images/icons/shofa2.png"/>
                            <img class="seatIcon" id="chairleft" src="'.SEAT_Plan_ASSETS.'images/icons/chairleft.png"/>
                            <img alt="No" class="seatIcon" id="seatnull" src="'.SEAT_Plan_ASSETS.'images/icons/remove.png"/>
                            <div class="seat-icon-upload-container" style="display: block">
                              <label for="seatIconUpload" class="seat-icon-upload-label">
                                <img src="'.SEAT_Plan_ASSETS.'images/icons/uploadIcon.png" alt="Upload Icon" class="seat-icon-image">
                              </label>
                              <input class="seatIconUpload" type="file" id="seatIconUpload" name="filename">
                            </div>
                        </div>
                    </div>
                    <div class="movementHolder" id="movementHolder">
                         <div class="movementControl">
                            <span class="movementText">Movement In Px</span>
                            <input class="movementInPx" id="movementInPx" name="movementInPx" type="number" value="15" placeholder="movement in px" style="display: none">
                        </div>
                        <div class="movementControl">
                            <div id="left" class="movement"><i class="arrowIcon far fa-arrow-alt-circle-left"></i></div>
                            <div id="top" class="movement"><i class="arrowIcon far fa-arrow-alt-circle-up"></i></div>
                            <div id="bottom" class="movement"><i class="arrowIcon far fa-arrow-alt-circle-down"></i></div>
                            <div id="right" class="movement"><i class="arrowIcon far fa-arrow-alt-circle-right"></i></div>
                        </div>
                    </div>
                    <div class="colorPriceHolder">
                        <div>
                            <span>Select Color</span>:
                            <input type="color" id="setColor" value="#3498db">
                        </div>
                        <button id="applyColorChanges">Set Color</button>
                    </div>
                    <div class="colorPriceHolder">
                        <div class="textPriceHolder">
                            <span class="priceText"> Set Price:</span>
                            <input type="number" id="setPrice" placeholder="Enter price">
                        </div>
                        <button id="applyChanges">Set Price</button>
                    </div>
                    <div class="setSeatNumber"  style="display: block">
                         <div class="seatNumberContainer">
                            <input type="text" id="seat_number_prefix" placeholder="Set Prefix">
                            <input type="number" id="seat_number_count" placeholder="1" value="0">
                         </div>
                        <button class="set_seat_number" id="set_seat_number">Set Seat Number</button>
                    </div>
                </div>
            </div>
        </div>';
    }

    function add_feature_image_meta_box() {
        add_meta_box(
            'custom_feature_image',        // ID
            'Custom Feature Image',        // Title
            [ $this,'render_feature_image_meta_box'], // Callback
            'custom_item',                 // Custom Post Type
            'side',                        // Context (side, normal, advanced)
            'default'                      // Priority
        );
    }

    function render_feature_image_meta_box($post) {
        // Retrieve the current feature image URL from post meta
        $featured_image = get_post_meta($post->ID, '_custom_feature_image', true);
        ?>
        <div id="custom-feature-image-meta-box">
            <div class="custom-feature-image-preview">
                <?php if ($featured_image): ?>
                    <img src="<?php echo esc_url($featured_image); ?>" style="max-width: 100%; margin-bottom: 10px;">
                <?php endif; ?>
            </div>
            <input type="hidden" id="custom-feature-image-url" name="custom_feature_image" value="<?php echo esc_url($featured_image); ?>">
            <button type="button" class="button upload-feature-image-button">
                <?php echo $featured_image ? 'Replace Image' : 'Upload Image'; ?>
            </button>
            <button type="button" class="button remove-feature-image-button" style="display: <?php echo $featured_image ? 'inline-block' : 'none'; ?>;">
                Remove Image
            </button>
        </div>
        <?php
    }

    function save_custom_feature_image($post_id) {
        // Verify nonce and permissions (skip for brevity)
        if (isset($_POST['custom_feature_image'])) {
            update_post_meta($post_id, '_custom_feature_image', esc_url_raw($_POST['custom_feature_image']));
        }
    }

}