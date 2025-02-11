jQuery(document).ready(function ($) {
    $(document).on('click','.createBoxSubmit', function (e) {
        e.preventDefault(); // Prevent the default form submission

        const formData = {
            action: 'process_create_box_data', // WordPress action
            box_size: $('#box_size').val(),
            numberOfRows: $('#numberOfRows').val(),
            numberOfColumns: $('#numberOfColumns').val(),
            boxGap: $('#boxGap').val(),
        };

        console.log( formData );

        $.ajax({
            url: site_ajax_object.site_ajax_url, // WordPress AJAX handler URL
            method: 'POST',
            data: formData,
            success: function (response) {
                // Handle success
                // console.log( response );
                alert(response.data);
            },
            error: function (xhr, status, error) {
                // Handle error
                alert('An error occurred: ' + error);
            },
        });

    });
});