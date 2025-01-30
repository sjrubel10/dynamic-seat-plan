jQuery(document).ready(function ($) {

    $(document).on( 'click', '.removeFromTemplate', function( e ) {
        e.preventDefault();
        let templateId = $(this).parent().attr('id');
        console.log( templateId );
        $.ajax({
            url: site_ajax_object.site_ajax_url,
            type: 'POST',
            data: {
                action: 'remove_from_templates',
                templateId: templateId,
                nonce: site_ajax_object.site_nonce,
            },
            success: function (response) {
                if (response.success) {
                    $(this).parent().fadeOut();
                    alert('Plan removed from templates successfully!');
                } else {
                    alert('Error: ' + response.data.message);
                }
            },
            error: function () {
                alert('An unexpected error occurred.');
            }
        });
    });

    $(document).on( 'change', '#importFromTemplate', function( e ) {
        e.preventDefault();
        let isChecked = $(this).prop('checked') ? 1 : 0;

        // console.log(isChecked, site_ajax_object.site_ajax_url, site_ajax_object.site_nonce );
        $.ajax({
            url: site_ajax_object.site_ajax_url,
            type: 'POST',
            data: {
                action: 'import_from_template_checkbox_state',
                is_checked: isChecked,
                nonce: site_ajax_object.site_nonce,
            },
            success: function (response) {
                if (response.success) {
                    alert('Seat Plan data saved successfully! Please publish your post');
                } else {
                    alert('Error: ' + response.data.message);
                }
            },
            error: function () {
                alert('An unexpected error occurred.');
            }
        });

    });

});