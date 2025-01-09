jQuery(document).ready(function ($) {
    $(document).on('click', '#enable_resize', function ( e ) {
        e.preventDefault();
        $(this).toggleClass('enable_resize_selected');
        if( !$(this).hasClass( 'enable_resize_selected' )){
            $(".childDiv").each(function () {
                if ($(this).data("ui-resizable")) {
                    $(this).resizable("destroy");
                }
            });
        }
    });

    let isLassoEnabled = false;
    $(document).on('click', '#set_multiselect', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_set_multiselect');
        isLassoEnabled = !isLassoEnabled;
        if ( isLassoEnabled ) {
            $('body').addClass('lasso-cursor'); // Add custom cursor class
        } else {
            $('body').removeClass('lasso-cursor'); // Remove custom cursor class
        }
    });

    $(document).on('click', '#removeSelected', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_erase_seat');
    });

    $(document).on('click', '#set_seat_number', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_set_seat_number');
    });

    $(document).on('click', '.movement', function (e) {
        e.preventDefault();
        const text = $(this).text();
        const offset = parseInt($("input[name='movementInPx']").val(), 10) || 15; // Default to 15 if empty or invalid
        let offsetX = 0;
        let offsetY = 0;
        if ( text === 'Left' ) {
            offsetX = -offset;
        } else if ( text === 'Right' ) {
            offsetX = offset;
        } else if ( text === 'Top' ) {
            offsetY = -offset;
        } else if ( text === 'Bottom' ) {
            offsetY = offset;
        }

        selectedDivs.forEach(div => {
            const $div = $(div);
            $div.css({
                top: $div.position().top + offsetY + "px",
                left: $div.position().left + offsetX + "px"
            });
        });
    });


    $(document).on('click', '#set_seat_number', function (e) {
        e.preventDefault();
        let start = 0;
        let seat_prefix = $("#seat_number_prefix").val();
        let count = parseInt($("#seat_number_count").val(), 10);
        selectedSeatsDivs.forEach(div => {
            if( div.hasClass('selected')){
                if( seat_prefix !== '' ){
                    var seat_number = seat_prefix+'-'+count;
                }else{
                    seat_number = count;
                }
                $(div).text( seat_number );
                $(div).attr('data-seat-num', seat_number);
                count++;
            }

        });
        selectedSeatsDivs = [];
    });

    $(document).on('click', '#enable_drag_drop', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_drag_drop');
        if( !$(this).hasClass( 'enable_drag_drop' )){
            $(".childDiv").removeClass("ui-draggable ui-draggable-handle");
        }
        //ui-draggable ui-draggable-handle
    });

    let selectedDivs = [];
    let selectedSeatsDivs = [];

    var rotationData = {}; // Store rotation angles and positions for each div
    var selectionOrder = [];
    var forReverse = {};

    $(document).on('click', '#clearAll', function ( e ) {
        e.preventDefault();
        $('.childDiv').removeClass('save');
        $('.childDiv').removeClass('selected');
        $('.childDiv').css('background', '');
        selectedDivs = [];
        selectedSeatsDivs = [];

        let previousPosition = 0;
        selectionOrder.forEach((id, index) => {
            previousPosition = forReverse[id].position;
            let angle = 0;
            $(`#${id}`).css({
                transform: `rotate(${angle}deg)`,
                left: `${previousPosition}px`,
                'z-index': 0,
            });
        });
        rotationData = forReverse = {};
        selectionOrder = [];

    });
    // Handle selection
    $(".childDiv").on("click", function (e) {
        e.stopPropagation();

        /*let count = parseInt($("#seat_number_count").val(), 10);
        if( $("#set_seat_number").hasClass('enable_set_seat_number') ){
            count++;
            let seat_prefix = $("#seat_number_prefix").val();
            $("#seat_number_count").val(count);
            if( seat_prefix !== '' ){
                var seat_number = seat_prefix+'-'+count;
            }else{
                seat_number = count;
            }
            // console.log( count );
            $(this).text( seat_number );
            $(this).attr('data-seat-num', seat_number);
        }*/

        $(this).toggleClass("selected");
        const $this = $(this);


        if ($this.hasClass("selected")) {

            $this.css('z-index', 10);

            selectedDivs.push($this);
            selectedSeatsDivs.push($this);
            if( $('#enable_resize').hasClass('enable_resize_selected')) {
                if (!$this.data("ui-resizable")) {
                    $this.resizable({
                        containment: "#parentDiv",
                        handles: "all",
                        start: function (event, ui) {
                            isResizing = true;

                            let maxZIndex = 0;
                            $('.childDiv').each(function () {
                                const currentZIndex = parseInt($(this).css('z-index')) || 0;
                                if (currentZIndex > maxZIndex) {
                                    maxZIndex = currentZIndex;
                                }
                            });

                            const newZIndex = maxZIndex + 10;
                            $(this).css('z-index', newZIndex); // Apply the new z-index
                        },
                        stop: debounce(300)
                    });
                }
            }
            else{
                if ($this.data("ui-resizable")) {
                    $this.resizable("destroy");
                }
            }

            if( $('#enable_drag_drop').hasClass( 'enable_drag_drop' )) {
                $(this).draggable({
                    containment: "#parentDiv",
                    drag: function (event, ui) {
                        const current = $(this);
                        const offsetX = ui.position.left - current.position().left;
                        const offsetY = ui.position.top - current.position().top;

                        selectedDivs.forEach(div => {
                            if (div[0] !== current[0]) {
                                div.css({
                                    top: div.position().top + offsetY + "px",
                                    left: div.position().left + offsetX + "px"
                                });
                            }
                        });
                    },
                    stop: debounce(300)
                });
            }
        } else {
            // $this.css('z-index', '');
            // Remove resizable functionality for deselected div
            selectedDivs = selectedDivs.filter(div => div[0] !== $this[0]);
            selectedSeatsDivs = selectedSeatsDivs.filter(div => div[0] !== $this[0]);
        }

        if( $('#removeSelected').hasClass( 'enable_erase_seat' )) {
            $(this).removeClass('save');
            $(this).removeClass('selected');
            $(this).css({
                "background": "",
                "transform": "rotate(0deg)"
            });
        }

        const rotate_id = $(this).attr('id');
        make_rotate( rotate_id );
        // console.log( rotate_id, leftPosition, rotationData );

    });

    function make_rotate( rotate_id ){
        let id = '#' + rotate_id;
        let leftPosition = $(id).css('left');
        leftPosition = parseInt(leftPosition, 10);
        if ($('#'+rotate_id).hasClass('rotateSelected')) {
            $(id).removeClass('rotateSelected');
            selectionOrder = selectionOrder.filter(divId => divId !== rotate_id ); // Remove from order
        } else {
            $(id).addClass('rotateSelected');
            selectionOrder.push( rotate_id ); // Add to order
        }
        if ( !( rotate_id in rotationData)) {
            rotationData[rotate_id] = { angle: 0, position: leftPosition };
            forReverse[rotate_id] = { angle: 0, position: leftPosition };
        }
    }

    let distance = 10;
    // Rotate Left button click
    $('#rotateLeft').click(function ( e ) {
        distance = $("#rotationAngle").val();
        distance = parseInt(distance, 10);
        e.preventDefault();
        selectionOrder.forEach((id, index) => {
            const movement = (index) * distance;
            rotationData[id].angle -= distance;
            rotationData[id].position += movement;

            $(`#${id}`).attr('data-degree', rotationData[id].angle);
            $(`#${id}`).css({
                transform: `rotate(${rotationData[id].angle}deg)`,
                left: `${rotationData[id].position}px`,
                'z-index': 10,
            });
        });
    });

    // Rotate Right button click
    $('#rotateRight').click(function ( e ) {
        distance = $("#rotationAngle").val();
        distance = parseInt(distance, 10);
        e.preventDefault();
        selectionOrder.forEach((id, index) => {
            const movement = (index) * distance ;
            rotationData[id].angle += distance;
            rotationData[id].position -= movement;
            $('#'+id).attr('data-degree', rotationData[id].angle);
            $(`#${id}`).css({
                transform: `rotate(${rotationData[id].angle}deg)`,
                left: `${rotationData[id].position}px`,
                'z-index': 10,
            });
        });
    });

    // Drag functionality
    // Apply color and price changes
    $("#applyColorChanges").on("click", function (e) {
        e.preventDefault();
        const color = $("#setColor").val();
        selectedDivs.forEach(div => {
            if( div.hasClass('selected')){
                div.addClass("save").removeClass('selected');
                if (color) div.css("background-color", color);
            }

        });
        selectedDivs = [];
    });
    $("#applyChanges").on("click", function (e) {
        e.preventDefault();

        const price = $("#setPrice").val();

        selectedDivs.forEach(div => {
            if( div.hasClass('selected')){
                div.addClass("save").removeClass('selected');
                // if (color) div.css("background-color", color);
                if (price) div.attr("data-price", price)/*.text(price)*/;
            }

        });
        selectedDivs = [];
        // savePositions();
    });

    $('#savePlan').on('click', function (e) {
        e.preventDefault();
        /*const planName = $('#plan-name').val();
        if (!planName) {
            alert('Please enter a plan name!');
            return;
        }*/
        var selectedSeats = [];
        $('.childDiv.save').each(function () {
            if ( $(this).css('background-color') !== 'rgb(255, 255, 255)') { // Not default white
                const id = $(this).data('id');
                const row = $(this).data('row');
                const col = $(this).data('col');
                const seat_number = $(this).data('seat-num');
                const data_degree = $(this).data('degree');
                const color = $(this).css('background-color');
                const price = $(this).data('price') || 0;
                const width =$(this).css('width') || 0;
                const height = $(this).css('height') || 0;
                const z_index = $(this).css('z-index') || 0;
                const left = $(this).css('left') || 0;
                const top = $(this).css('top') || 0;

                selectedSeats.push({ id, row, col, color, price, width, height, seat_number, left, top, z_index, data_degree });
            }
        });

        if ( selectedSeats.length === 0 ) {
            alert('No seats selected to save!');
            return;
        }
        // selectedSeats.sort((a, b) => a.col - b.col);
        // console.log( selectedSeats );
        const postId = $('#plan_id').val();
        /*$.ajax({
            url: 'save_plan.php',
            type: 'POST',
            data: { planName, selectedSeats },
            success: function (response) {
                alert('Plan saved successfully!');
                loadPlans(); // Reload saved plans
                selectedSeats = [];
            },
            error: function (xhr, status, error) {
                console.error(error);
            }
        });*/
        // console.log( selectedSeats, postId );
        $.ajax({
            url: ajax_object.ajax_url,
            type: 'POST',
            data: {
                action: 'save_custom_meta_data',
                nonce: ajax_object.nonce,
                post_id: postId,
                custom_field_1: selectedSeats,
            },
            success: function (response) {
                if (response.success) {
                    alert('Seat Plan data saved successfully! Please publish your post');
                    // $('#post').off('submit').submit();
                } else {
                    alert('Error: ' + response.data.message);
                }
            },
            error: function () {
                alert('An unexpected error occurred.');
            }
        });
    });

    $('#post_000').on('submit', function (event) {
        e.preventDefault();
        /*const planName = $('#plan-name').val();
        if (!planName) {
            alert('Please enter a plan name!');
            return;
        }*/
        var selectedSeats = [];
        $('.childDiv.save').each(function () {
            if ( $(this).css('background-color') !== 'rgb(255, 255, 255)') { // Not default white
                const id = $(this).data('id');
                const row = $(this).data('row');
                const col = $(this).data('col');
                const seat_number = $(this).data('seat-num');
                const color = $(this).css('background-color');
                const price = $(this).data('price') || 0;
                const width =$(this).css('width') || 0;
                const height = $(this).css('height') || 0;
                const z_index = $(this).css('z-index') || 0;
                const left = $(this).css('left') || 0;
                const top = $(this).css('top') || 0;

                selectedSeats.push({ id, row, col, color, price, width, height, seat_number, left, top, z_index });
            }
        });

        if ( selectedSeats.length === 0 ) {
            alert('No seats selected to save!');
            return;
        }
        // selectedSeats.sort((a, b) => a.col - b.col);
        console.log( selectedSeats, ajax_object );
        // console.log( ajax_object );


        /*$.ajax({
            url: ajax_object.ajax_url,
            type: 'POST',
            data: {
                action: 'save_custom_meta_data',
                nonce: ajax_object.nonce,
                post_id: postId,
                custom_field_1: 'selectedSeats',
            },
            success: function (response) {
                if (response.success) {
                    alert('Meta data saved successfully!');
                    $('#post').off('submit').submit();
                } else {
                    alert('Error: ' + response.data.message);
                }
            },
            error: function () {
                alert('An unexpected error occurred.');
            }
        });*/
    });

    // Save positions to server

    // Debounce function to optimize frequent calls
    function debounce(func, wait) {
        let timeout;
        return function (...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }

    // Deselect on outside click
    /*$(document).on("click", function () {
        $(".childDiv").removeClass("selected").each(function () {
            if ($(this).data("ui-resizable")) {
                $(this).resizable("destroy");
            }
        });
        selectedDivs = [];
    });*/


    function loadPlans() {
        $.ajax({
            url: 'load_plans.php',
            type: 'GET',
            success: function (response) {
                $('#plans').html(response);
            },
            error: function (xhr, status, error) {
                console.error(error);
            }
        });
    }
    loadPlans();

    let isMultiSelecting = false;
    let startPoint = { x: 0, y: 0 };
    let selectionBox = null;


    let $seatGrid = $("#parentDiv");

    $seatGrid.on('mousedown', function (e) {
        e.preventDefault();

        if (!$("#enable_drag_drop").hasClass("enable_drag_drop")) {
            if ($("#set_multiselect").hasClass('enable_set_multiselect')) {
                isMultiSelecting = true;
            }

            $('.childDiv').removeClass('hovered'); // Clear previous hover highlights

            startPoint = { x: e.pageX, y: e.pageY };

            selectionBox = $('<div>').addClass('selection-box').appendTo($seatGrid);
            selectionBox.css({
                left: startPoint.x,
                top: startPoint.y,
                width: 0,
                height: 0,
            });
        }
    });

    $seatGrid.on('mousemove', function (e) {
        e.preventDefault();

        if (isMultiSelecting) {
            const currentPoint = { x: e.pageX, y: e.pageY };

            const left = Math.min(startPoint.x, currentPoint.x);
            const top = Math.min(startPoint.y, currentPoint.y);
            const width = Math.abs(currentPoint.x - startPoint.x);
            const height = Math.abs(currentPoint.y - startPoint.y);

            selectionBox.css({
                left: left,
                top: top,
                width: width,
                height: height,
            });

            $('.childDiv').each(function () {
                const $box = $(this);
                const boxOffset = $box.offset();
                const boxPosition = {
                    left: boxOffset.left,
                    top: boxOffset.top,
                    right: boxOffset.left + $box.outerWidth(),
                    bottom: boxOffset.top + $box.outerHeight(),
                };

                if (
                    boxPosition.left < left + width &&
                    boxPosition.right > left &&
                    boxPosition.top < top + height &&
                    boxPosition.bottom > top
                ) {
                    $box.addClass('dotted');
                } else {
                    $box.removeClass('dotted');
                }
            });
        }
    });

    $(document).on('mouseup', function (e) {
        e.preventDefault();

        if (isMultiSelecting) {
            isMultiSelecting = false;
            $('.childDiv.dotted').each(function () {
                const $this = $(this);
                make_rotate( $(this).attr('id') );
                selectedDivs.push($this);
                selectedSeatsDivs.push($this);
                $this.toggleClass('selected').removeClass('dotted');
                $this.css('z-index', 10);
                if (!$this.hasClass('selected')) {
                    selectedDivs = selectedDivs.filter(div => div[0] !== $this[0]);
                    selectedSeatsDivs = selectedSeatsDivs.filter(div => div[0] !== $this[0]);
                }
            });

            // Remove the selection box
            if (selectionBox) {
                selectionBox.remove();
                selectionBox = null;
            }
        }
    });

});