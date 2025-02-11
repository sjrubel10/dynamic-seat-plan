<?php

namespace Dynamic\Seatplan\Admin;

use WP_Query;

class Menu{
    public function __construct(){
        add_action('admin_menu', [$this, 'add_admin_menu']);
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

    public function render_settings_page(){

        $get_create_box_data = get_option( 'create_box_data' );
        error_log( print_r( [ '$response_data' => $get_create_box_data ], true ) );
        if( is_array( $get_create_box_data ) && count( $get_create_box_data ) > 0 ){
            $box_size = isset( $get_create_box_data['box_size'] ) ? absint( $get_create_box_data['box_size'] ) : 35;
            $numberOfRows = isset( $get_create_box_data['numberOfRows'] ) ? absint( $get_create_box_data['numberOfRows'] ) : 30;
            $numberOfColumns = isset( $get_create_box_data['numberOfColumns'] ) ? absint( $get_create_box_data['numberOfColumns'] ) : 24;
            $boxGap = isset( $get_create_box_data['boxGap'] ) ? absint( $get_create_box_data['boxGap'] ) : 10;
        }else{
            $box_size =  30;
            $numberOfRows = 25;
            $numberOfColumns = 35;
            $boxGap = 10;
        }
        ?>
        <div class="wrap">
            <h1><?php _e('Seat Plan Settings', 'textdomain'); ?></h1>
            <div class="form-container">
                <div class="createBoxForm">
                    <div class="form-group">
                        <label for="box_size">Box size:</label>
                        <input type="number" id="box_size" name="box_size" value="<?php echo esc_attr( $box_size ) ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="numberOfRows">Number of rows:</label>
                        <input type="number" id="numberOfRows" name="numberOfRows" value="<?php echo esc_attr( $numberOfRows ) ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="numberOfColumns">Number of columns:</label>
                        <input type="number" id="numberOfColumns" name="numberOfColumns" value="<?php echo esc_attr( $numberOfColumns ) ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="boxGap">Box gap in pixel:</label>
                        <input type="number" id="boxGap" name="boxGap" value="<?php echo esc_attr( $boxGap ) ?>" required>
                    </div>
                    <button type="submit" class="createBoxSubmit">Submit</button>
                </div>
            </div>
        </div>
        <?php
    }

}