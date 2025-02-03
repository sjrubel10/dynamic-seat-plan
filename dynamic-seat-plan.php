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
        add_action('admin_menu', [$this, 'add_admin_menu']);

        add_action('add_meta_boxes', [ $this,'add_feature_image_meta_box']);
        add_action('save_post',  [ $this,'save_custom_feature_image']);

        add_filter( 'the_content', [ $this, 'display_seat_plan'] );

        add_action('wp_ajax_import_from_template_checkbox_state',[ $this,  'import_from_template_checkbox_state']);
        add_action('wp_ajax_nopriv_import_from_template_checkbox_state', [ $this, 'import_from_template_checkbox_state']);

        add_action('wp_ajax_render_manage_seat_templates_for_import', [ $this,  'render_manage_seat_templates_for_import'] );
        add_action('wp_ajax_nopriv_render_manage_seat_templates_for_import', [ $this,  'render_manage_seat_templates_for_import'] ); // Allow non-logged-in users if needed

        add_action('wp_ajax_remove_from_templates',[ $this,  'remove_from_templates']);


        $this->define_constants();
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


    public function remove_from_templates(){
        $template_id = isset($_POST['templateId']) ? absint($_POST['templateId']) : '';
        $result = delete_post_meta( $template_id, 'is_template');
        wp_send_json_success( $result );
    }

    function render_manage_seat_templates_for_import() {
        $paged = isset($_POST['paged']) ? absint($_POST['paged']) : 1;
        $original_post_id = isset($_POST['postId']) ? absint($_POST['postId']) : 1;
        $args = [
            'post_type'      => 'custom_item',
            'posts_per_page' => 100,
            'post_status'    => 'publish',
            'paged'          => $paged,
            'meta_query'     => [
                [
                    'key'   => 'is_template',
                    'value' => 'template',
                    'compare' => '=' // Exact match
                ]
            ],
        ];

        $query = new WP_Query($args);
        ob_start();
        ?>
        <div class="templateWrap">
            <span class="importSeatPlanTitleText"><?php _e('Seat Plan Templates', 'textdomain'); ?></span>
            <span class="importSeatPlanText"><?php _e('Select any template', 'textdomain'); ?></span>
            <div class="popupTemplateContainer">
                <?php if ($query->have_posts()) :

                    ?>
                    <div class="templatesHolder">
                        <?php while ($query->have_posts()) : $query->the_post(); ?>
                            <?php
                            $post_id = get_the_ID();
                            $title = get_the_title() ?: __('No Title Available', 'textdomain');
                            $edit_url = admin_url("post.php?post={$original_post_id}&action=edit&templateId={$post_id}");
                            $thumbnail_url = get_post_meta($post_id, '_custom_feature_image', true);
                            ?>
                            <div class="templates" id="template-<?php echo esc_attr($post_id); ?>">
                                <div class="featureImagesHolder">
                                    <img class="featureImages" src="<?php echo $thumbnail_url?>">
                                </div>
                                <a class="templateLinks" href="<?php echo esc_url($edit_url); ?>">
                                    <?php echo esc_html($title); ?>
                                </a>
                            </div>
                        <?php endwhile; ?>
                    </div>
                <?php else : ?>
                    <p><?php _e('No templates found.', 'textdomain'); ?></p>
                <?php endif; ?>
                <?php wp_reset_postdata(); ?>
            </div>
            <div class="openTemplateBtnHolder"><button class="openAsTemplate" id="open_<?php echo $original_post_id ?>">Open template</button></div>
        </div>
        <?php
        $output = ob_get_clean();
        wp_send_json_success($output);
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

    public function add_admin_menu(){
        add_menu_page(
            __('Dynamic Seat Plan', 'textdomain'),
            __('Dynamic Seat Plan', 'textdomain'),
            'manage_options',
            'seat-plan',
            [$this, 'render_admin_page'],
            'dashicons-schedule',
            20
        );

        add_submenu_page(
            'seat-plan',
            __('Custom Items', 'textdomain'),
            __('Custom Items', 'textdomain'),
            'manage_options',
            'edit.php?post_type=custom_item',
            null
        );
        add_submenu_page(
            'seat-plan',
            __('Templates', 'textdomain'),
            __('Templates', 'textdomain'),
            'manage_options',
            'seat-templates',
            [$this, 'render_manage_seat_templates']
        );

        add_submenu_page(
            'seat-plan',
            __('Settings', 'textdomain'),
            __('Settings', 'textdomain'),
            'manage_options',
            'seat-plan-settings',
            [$this, 'render_settings_page']
        );
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

        $custom_field_1 = $_POST['custom_field_1'];
        $seat_plan_texts= isset( $_POST['seatPlanTexts'] ) ? $_POST['seatPlanTexts'] : '' ;
        $seatIcon = isset( $_POST['seatIcon'] ) ? $_POST['seatIcon'] : 'noicon';
        $dynamicShapes = isset( $_POST['dynamicShapes'] ) ? $_POST['dynamicShapes'] : '';
        $template = isset( $_POST['template'] ) ? $_POST['template'] : '';
        $seat_plan_data = array(
            'seat_data' => $custom_field_1,
            'seat_text_data' => $seat_plan_texts,
            'seatIcon' => $seatIcon,
            'dynamic_shapes' => $dynamicShapes,
        );
        update_post_meta($post_id, '_custom_field_1', $seat_plan_data);
        if( $template !== '' ){
            update_post_meta( $post_id, 'is_template', $template );
        }

        wp_send_json_success(['message' => 'Meta data saved successfully.']);
    }
    public function import_from_template_checkbox_state(){
        check_ajax_referer('ajax_nonce', 'nonce');
        $is_checked = isset($_POST['is_checked']) ? intval($_POST['is_checked']) : 0;
        update_option('import_design_from_template', $is_checked);
        wp_send_json_success(['message' => 'Checkbox state saved successfully']);
    }
    public function render_admin_page(){
        ?>
        <div class="wrap">
            <h1><?php _e('Seat Plan Admin Page', 'textdomain'); ?></h1>
            <p><?php _e('This is a custom admin page for the Seat Plan plugin.', 'textdomain'); ?></p>

        </div>
        <?php
    }

    public function render_manage_seat_templates() {
        // Get current page number
        $paged = isset($_GET['paged']) ? absint($_GET['paged']) : 1;

        // Query arguments
        $args = [
            'post_type'      => 'custom_item',
            'posts_per_page' => 100,
            'post_status'    => 'publish',
            'paged'          => $paged,
            'meta_query'     => [
                [
                    'key'   => 'is_template',
                    'value' => 'template',
                    'compare' => '='
                ]
            ],
        ];

        $query = new WP_Query($args);

        ?>
        <div class="templateWrap">
            <h1><?php _e('Seat Plan Templates', 'textdomain'); ?></h1>

            <span class="importSeatPlan"><?php _e('Select any template, then click "Save Selection." After saving, go to create a new item.', 'textdomain'); ?></span>

            <form method="post" action="">
                <?php if ($query->have_posts()) : ?>
                    <table class="widefat fixed striped">
                        <thead>
                        <tr>
<!--                            <th>--><?php //_e('Title', 'textdomain'); ?><!--</th>-->
                            <th><?php _e('Date', 'textdomain'); ?></th>
                            <th><?php _e('Actions', 'textdomain'); ?></th>
                            <th><?php _e('Select', 'textdomain'); ?></th>
                        </tr>
                        </thead>

                        <tbody>
                        <?php while ($query->have_posts()) : $query->the_post(); ?>
                            <tr class="templates">
                                <td>
                                    <?php
                                    $title = get_the_title();
                                    echo !empty($title) ? $title : __('No Title Available', 'textdomain');
                                    ?>
                                </td>
                                <td><?php echo get_the_date(); ?></td>
                                <td id="<?php echo get_the_ID()?>">
                                    <a href="<?php echo get_edit_post_link(); ?>"><?php _e('Edit', 'textdomain'); ?></a> |
                                    <a href="<?php echo get_permalink(); ?>" target="_blank"><?php _e('View', 'textdomain'); ?></a> |
                                    <span class="removeFromTemplate" ><?php _e('Remove', 'textdomain'); ?></span>
                                </td>
                                <!--<td>
                                    <input type="radio" name="selected_template" value="<?php /*echo get_the_ID(); */?>"/>
                                </td>-->
                            </tr>
                        <?php endwhile; ?>
                        </tbody>
                    </table>

                    <!-- Pagination -->
                    <div class="pagination">
                        <?php
                        echo paginate_links([
                            'total'        => $query->max_num_pages,
                            'current'      => $paged,
                            'format'       => '?paged=%#%',
                            'show_all'     => false,
                            'type'         => 'plain',
                            'prev_next'    => true,
                            'prev_text'    => __('&laquo; Previous', 'textdomain'),
                            'next_text'    => __('Next &raquo;', 'textdomain'),
                        ]);
                        ?>
                    </div>
                <?php else : ?>
                    <p><?php _e('No templates found.', 'textdomain'); ?></p>
                <?php endif; ?>

                <?php
                wp_reset_postdata();
                ?>
            </form>
        </div>

        <?php
    }

    public function render_settings_page(){ ?>
        <div class="wrap">
            <h1><?php _e('Seat Plan Settings', 'textdomain'); ?></h1>
            <p><?php _e('This is the Settings page under the Seat Plan menu.', 'textdomain'); ?></p>
        </div>
        <?php
    }

    public function render_meta_box( $post ) {

        /*$import_from_template = get_option( 'import_design_from_template' );
        $is_checked = ($import_from_template === '1') ? 1 : 0;

        $load_from_template = get_option( 'selected_seat_plan_template' );
        if( $is_checked === 1 && $load_from_template ){
            $post_id = $load_from_template;
        }else{
            $post_id = $post->ID;
        }*/


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
                        <div class="seatIconHolder">
                            <img class="seatIcon" id="icon2" src="'.SEAT_Plan_ASSETS.'images/icons/icon2.png"/>
                            <img class="seatIcon" id="seat1" src="'.SEAT_Plan_ASSETS.'images/icons/seat1.png"/>
                            <img class="seatIcon" id="chairdown" src="'.SEAT_Plan_ASSETS.'images/icons/chairdown.png"/>
                            <img class="seatIcon" id="shofa1" src="'.SEAT_Plan_ASSETS.'images/icons/shofa1.png"/>
                            <img class="seatIcon" id="shofa2" src="'.SEAT_Plan_ASSETS.'images/icons/shofa2.png"/>
                            <img alt="No" class="seatIcon" id="seatnull" src="'.SEAT_Plan_ASSETS.'images/icons/remove.png"/>
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
        wp_enqueue_style('templates', SEAT_Plan_ASSETS . 'css/templates.css', array(), SEAT_Plan_VERSION );
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

        }
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

new CustomPostAjaxMetaSave();
