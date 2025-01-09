jQuery(document).ready(function ($) {

    // Handle box click
    $('.box').on('click', function () {
        const seatId = $(this).attr('id');
        const price = $(this).data('price');

        // Highlight the selected box
        $(this).css('background-color', '#cacd1e');

        // Display seat info
        $('#info').text(`Seat ID: ${seatId}, Price: $${price}`);
    });

    // Adjust #seat-grid's margin if needed
    function adjustGridMargin() {
        let leastLeft = Infinity;

        $(".box").each(function () {
            const leftValue = parseInt($(this).css("left"), 10); // Parse "left" value
            if (leftValue < leastLeft) {
                leastLeft = leftValue;
            }
        });

        if (leastLeft < 0) {
            $("#seat-grid").css({
                "position": "relative",
                "margin-left": Math.abs(leastLeft) + "px"
            });
        }
    }

    // Call the function to adjust the margin
    adjustGridMargin();
});
