<?php

namespace Dynamic\Seatplan\Admin;

use WP_Query;

class Ajax{
    public function __construct(){

        add_action('wp_ajax_save_custom_meta_data', [$this, 'handle_ajax_meta_save']);
        add_action('wp_ajax_import_from_template_checkbox_state',[ $this,  'import_from_template_checkbox_state']);
        add_action('wp_ajax_nopriv_import_from_template_checkbox_state', [ $this, 'import_from_template_checkbox_state']);

        add_action('wp_ajax_render_manage_seat_templates_for_import', [ $this,  'render_manage_seat_templates_for_import'] );
        add_action('wp_ajax_nopriv_render_manage_seat_templates_for_import', [ $this,  'render_manage_seat_templates_for_import'] ); // Allow non-logged-in users if needed

        add_action('wp_ajax_remove_from_templates',[ $this,  'remove_from_templates']);

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

}