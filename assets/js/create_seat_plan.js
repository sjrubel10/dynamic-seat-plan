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

    // Set seat;

    // Set seat;
    $(document).on('click', '#set_seat', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_set_seat');
        if( $(this).hasClass('enable_set_seat' ) ){
            $('#set_single_select').removeClass('enable_single_seat_selection');
            $('#set_multiselect').removeClass('enable_set_multiselect');
            $('#removeSelected').removeClass('enable_erase_seat');
            $('#set_shape').removeClass('enable_set_shape');
            $('#setTextnew').removeClass('enable_set_text');
            $('body').removeClass('lasso-cursor');
            if( !$(this).hasClass('enable_set_shape' ) ){
                $("#make_circle").fadeOut();
            }
        }
    });
    $(document).on('click', '#set_shape', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_set_shape');
        if( $(this).hasClass('enable_set_shape' ) ){
            $('#set_single_select').removeClass('enable_single_seat_selection');
            $('#set_multiselect').removeClass('enable_set_multiselect');
            $('#removeSelected').removeClass('enable_erase_seat');
            $('#set_seat').removeClass('enable_set_seat');
            $('#setTextnew').removeClass('enable_set_text');
            $('body').removeClass('lasso-cursor');
            $("#make_circle").fadeIn();
        }else{
            $("#make_circle").fadeOut();
        }
    });
    // let isLassoEnabled = false;
    $(document).on('click', '#set_multiselect', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_set_multiselect');
        /*isLassoEnabled = !isLassoEnabled;
        if ( isLassoEnabled ) {
            $('body').addClass('lasso-cursor'); // Add custom cursor class
        } else {
            $('body').removeClass('lasso-cursor'); // Remove custom cursor class
        }*/

        if( $(this).hasClass('enable_set_multiselect' ) ){
            $('#set_single_select').removeClass('enable_single_seat_selection');
            $('#set_seat').removeClass('enable_set_seat');
            $('#removeSelected').removeClass('enable_erase_seat');
            $('#set_shape').removeClass('enable_set_shape');
            $('#setTextnew').removeClass('enable_set_text');
            if( !$(this).hasClass('enable_set_shape' ) ){
                $("#make_circle").fadeOut();
            }
            $('body').addClass('lasso-cursor');
        }else{
            $('body').removeClass('lasso-cursor');
        }
    });

    $(document).on('click', '#removeSelected', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_erase_seat');
        if( $(this).hasClass('enable_erase_seat' ) ){
            $('#set_single_select').removeClass('enable_single_seat_selection');
            $('#set_seat').removeClass('enable_set_seat');
            $('#set_multiselect').removeClass('enable_set_multiselect');
            $('#set_shape').removeClass('enable_set_shape');
            $('#setTextnew').removeClass('enable_set_text');
            if( !$(this).hasClass('enable_set_shape' ) ){
                $("#make_circle").fadeOut();
            }
            $("#make_circle").fadeIn();
        }else{
            $("#make_circle").fadeOut();
        }
    });

    $(document).on('click', '#set_single_select', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_single_seat_selection');
        if( $(this).hasClass('enable_single_seat_selection' ) ){
            $('#set_multiselect').removeClass('enable_set_multiselect');
            $('#set_seat').removeClass('enable_set_seat');
            $('#removeSelected').removeClass('enable_erase_seat');
            $('#setTextnew').removeClass('enable_set_text');
            $('#set_shape').removeClass('enable_set_shape');
            if( !$(this).hasClass('enable_set_shape' ) ){
                $("#make_circle").fadeOut();
            }
            $('body').removeClass('lasso-cursor');

            selectedDivs = [];
            selectedDraggableDivs = [];
            selectedSeatsDivs = [];

            rotationData = {}; // Store rotation angles and positions for each div
            selectionOrder = [];

            $('.childDiv.selected').each(function () {
                const $this = $(this);

                $this.removeClass('rotateSelected selected');
            });
        }
    });

    let seatIconName = '';
    let imageUrl = '';
    $(document).on('click', '.seatIcon', function (e) {
        e.preventDefault();
        $(this).toggleClass('iconSelected');
        if( $(this).hasClass('iconSelected' ) ) {
            $(this).siblings().removeClass('iconSelected');
            seatIconName = $(this).attr('id');
            imageUrl = $(this).attr('src');
            // console.log( seatIconSrc );
            $('.childDiv.save').each(function () {
                $(this).css({
                    'background-image': `url(${imageUrl})`,
                    'background-size': 'cover', // Ensure the image covers the div
                    'background-position': 'center', // Center the image
                    'background-repeat': 'no-repeat' // Prevent repeating
                });
            });
        }else{
            seatIconName = '';
            imageUrl = '';
        }
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
        let seat_number = '';
        let seat_prefix = $("#seat_number_prefix").val();
        let count = parseInt($("#seat_number_count").val(), 10);
        selectedSeatsDivs.forEach(div => {
            if( div.hasClass('selected')){
                if( seat_prefix !== '' ){
                    seat_number = seat_prefix+'-'+count;
                }else{
                    seat_number = count;
                }
                $(div.find('.seatNumber')).text( seat_number );
                $(div).attr('data-seat-num', seat_number);
                div.removeClass('selected');
                count++;
            }

        });
        selectedSeatsDivs = selectedDraggableDivs = selectedDivs = [];
    });

    $(document).on('click', '#setText', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_set_text');
    });

    let isSetTextMode = false;
    $('#setTextnew').click(function ( e ) {
        e.preventDefault();
        $(this).toggleClass('enable_set_text');
        if( $(this).hasClass('enable_set_text')){
            isSetTextMode = !isSetTextMode;
            $('#set_single_select').removeClass('enable_single_seat_selection');
            $('#set_seat').removeClass('enable_set_seat');
            $('#set_multiselect').removeClass('enable_set_multiselect');
            $('#removeSelected').removeClass('enable_erase_seat');
            $('#set_shape').removeClass('enable_set_shape');
        }else{
            isSetTextMode = false;
        }
    });

    $(document).on('click', '#make_circle', function ( e ) {
        e.preventDefault();
        $(this).toggleClass('circleSelected');
    });

    $(document).on('click', '#enable_drag_drop', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_drag_drop');
        if( !$(this).hasClass( 'enable_drag_drop' )){
            $(".childDiv").removeClass("ui-draggable ui-draggable-handle");
            selectedDraggableDivs = [];
        }
        //ui-draggable ui-draggable-handle
    });

    let selectedDivs = [];
    let selectedDraggableDivs = [];
    let selectedSeatsDivs = [];

    var rotationData = {}; // Store rotation angles and positions for each div
    var selectionOrder = [];
    var forReverse = {};

    $(document).on('click', '#clearAll', function ( e ) {
        e.preventDefault();
        $('.childDiv').removeClass('save');
        $('.childDiv').removeClass('selected');
        $('.childDiv').css({
            "background": "",
            "transform": "rotate(0deg)",
            "z-index" : 'auto',
        });
        $('.childDiv').attr({
            'data-seat-num': '',
            'data-price': 0
        });

        $('.childDiv').text('');
        seat_num = 0;
        selectedDivs = [];
        selectedDraggableDivs = [];
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
    let seat_num = 0;
    $(".childDiv").on("click", function (e) {
        // e.stopPropagation();
        e.preventDefault();
        const $this = $(this);
        let seatDivId = $this.attr('id');
        let clickId = seatDivId.replace("div", "");
        let seatTextId = 'seatText'+clickId;
        if( $('#set_single_select').hasClass('enable_single_seat_selection' ) && $this.hasClass('save') ){
            $this.siblings().removeClass('selected'); // Remove selection from other items in the group
            $this.toggleClass("selected");
            selectedDivs = [];
            selectedDraggableDivs = [];
            selectedSeatsDivs = [];
            rotationData = {}; // Store rotation angles and positions for each div
            selectionOrder = [];
            forReverse = [];
            make_rotate( $(this).attr('id') );
            /*if ($('#make_circle').hasClass('circleSelected')) {
                $(this).css('border-radius', '50%');
            }*/
        }else{
            if( $this.hasClass('save') && $('#set_multiselect').hasClass('enable_set_multiselect' ) && !$('#set_seat').hasClass('enable_set_seat' ) ){
                $this.toggleClass("selected");
                /*if ($('#make_circle').hasClass('circleSelected')) {
                    $(this).css('border-radius', '50%');
                }*/
            }else {
                if( !$('#set_seat').hasClass('enable_set_seat') ){
                    selectedDivs.forEach( div => {
                        div.removeClass('selected');
                    });
                    selectedDivs = selectedDraggableDivs = selectedSeatsDivs = rotationData = selectionOrder = [];
                 }
            }

        }

        if( $('#set_seat').hasClass('enable_set_seat' ) && !$this.hasClass('save') ){
            seat_num++;
            $this.addClass("save seatClickable");
            let color = $('#setColor').val();
            let seatNumberId = 'seatNumber'+clickId;

            $this.css({
                'background-color' : color,
            });
            // $this.attr('data-degree', rotationData[id].angle);
            // $this.attr('data-seat-num', seat_num);
            $("#"+seatNumberId).text(seat_num);
            $("#"+seatNumberId).show();
            // alert('seat add');
        }

        if( $('#set_shape').hasClass('enable_set_shape' ) && !$this.hasClass('save') ){
            // alert('shape add');
            let color = $('#setColor').val();
            $this.addClass("save");
            $this.css({
                'background-color' : color,
            });
            if ($('#make_circle').hasClass('circleSelected')) {
                $(this).css('border-radius', '50%');
            }
        }



        if ($this.hasClass("selected")) {

            $this.css({
                'z-index': 15,
                // 'border': '1px solid #c1bdbd'
            });

            selectedDivs.push($this);
            selectedDraggableDivs.push($this);
            selectedSeatsDivs.push($this);
            // if( $('#enable_resize').hasClass('enable_resize_selected')) {
                if (!$this.data("ui-resizable")) {
                    $this.resizable({
                        containment: "#parentDiv",
                        handles: "all",
                        start: function (event, ui) {
                            isResizing = true;

                            isMultiSelecting = false;
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
                        stop: debounce(function () {
                            console.log('Resize operation stopped.');
                            // Add your stop event logic here
                        }, 300)
                    });
                }
            /*} else{
                if ($this.data("ui-resizable")) {
                    $this.resizable("destroy");
                }
            }*/

            // if( $('#enable_drag_drop').hasClass( 'enable_drag_drop' )) {
                $(this).draggable({
                    containment: "#parentDiv",
                    drag: function (event, ui) {
                        const current = $(this);
                        const offsetX = ui.position.left - current.position().left;
                        const offsetY = ui.position.top - current.position().top;
                        isMultiSelecting = false;
                        isDragging = true;
                        // console.log( selectedDraggableDivs.length );
                        if( isDragging ) {
                            if (selectedDraggableDivs.length > 0) {
                                selectedDraggableDivs.forEach(div => {
                                    if (div[0] !== current[0]) {

                                        div.css({
                                            top: div.position().top + offsetY + "px",
                                            left: div.position().left + offsetX + "px"
                                        });
                                    }
                                });
                            }
                        }
                    },
                    stop: debounce(function () {
                        isDragging = false;
                        console.log('Drag operation stopped.');
                        // Add your stop event logic here
                    }, 300)
                });
            // }

        } else {
            // $this.css('z-index', '');
            // Remove resizable functionality for deselected div
            selectedDivs = selectedDivs.filter(div => div[0] !== $this[0]);
            selectedDraggableDivs = selectedDraggableDivs.filter(div => div[0] !== $this[0]);
            selectedSeatsDivs = selectedSeatsDivs.filter(div => div[0] !== $this[0]);
        }

        let text = $('#'+seatTextId).text();
        if( $('#setText').hasClass('enable_set_text') && $("#set_single_select").hasClass('enable_single_seat_selection') ) {
            e.stopPropagation();
            $('.set_text_holdercontainer').remove();
            let inputtext = `
                  <div class="set_text_holdercontainer">
                    <div class="set_text_holder">
                      <span class="close_set_text">X</span>
                      <input type="text" class="set_text_display" value="${text}" placeholder="Set your text here">
                      <button class="set_text_button" id="${clickId}">Set text</button>
                    </div>
                  </div>`;
            $('#parentDiv').prepend(inputtext);

            if( selectedDivs.length === 0 ){
                $('.set_text_holdercontainer').remove();
            }
        }

        if( $('#removeSelected').hasClass( 'enable_erase_seat' )) {
            $(this).removeClass('save');
            $(this).removeClass('selected');
            $(this).css({
                "background": "",
                "transform": "rotate(0deg)"
            });
            $this.attr({
                'data-seat-num': '',
                'data-price': 0
            });

            $this.text('');
        }

        if( selectedDivs.length > 0 ){
            $('#setPriceColorHolder').fadeIn( 1000 );
        }else{
            $('#setPriceColorHolder').fadeOut();
        }
        // console.log( rotate_id, leftPosition, rotationData );

    });

    //Click Text
    $(document).on('click', '.plus', function ( e ) {
        let plusClickId = $(this).attr('id');
        let textChangeId = plusClickId.replace("plus", "");
        let currentFontSize = parseInt($("#"+textChangeId).css('font-size'));
        let newFontSize = currentFontSize + 1;
        $("#"+textChangeId).css('font-size', newFontSize + 'px');
    });
    $(document).on('click', '.minus', function ( e ) {
        let minusClickId = $(this).attr('id');
        let textSmallChangeId = minusClickId.replace("minus", "");
        let currentMinusFontSize = parseInt($("#"+textSmallChangeId).css('font-size'));
        let newSmallFontSize = currentMinusFontSize - 1;
        $("#"+textSmallChangeId).css('font-size', newSmallFontSize + 'px');
    });
    //Click Text
    $(document).on('click', '.seatText', function ( e ) {
        e.stopPropagation();
        $(".childDiv.save").find( '.controlTextSizeHolder' ).remove();
        let seatTextClickId = $(this).attr('id');

        let textMove = '<div class="controlTextmoveHolder" id="move'+seatTextClickId+'">\
                                    <span>Text Position Move:</span></br>\
                                    <span class="textMove" id="textLeft">Left</span>\
                                    <span class="textMove" id="textTop">Top</span>\
                                    <span class="textMove" id="textBottom">Bottom</span>\
                                    <span class="textMove" id="textRight">Right</span>\
                                </div>\
                                <span>Font size zoom in Out:</span></br>\
                                <div class="controlTextSizeHolder">\
                                    <span class="plus" id="plus'+seatTextClickId+'">+</span>\
                                    <span class="minus" id="minus'+seatTextClickId+'">-</span>\
                                </div\
                                 <span>SeT Text Color</span></br>\
                                <div class="controlTextSizeHolder">\
                                    <input class="setTextColor" id="setTextColor" type="color"  value="#3498db">\
                                    <button class="setTextColora" id="color'+seatTextClickId+'">Set Color</button>\
                                </div\
                                ';
        if( !$("#set_single_select").hasClass('enable_single_seat_selection' ) && !$("#removeSelected").hasClass('enable_erase_seat') ) {
            $('#popupInnerContent').html(textMove); // Inject content
            $('#popupContainer').fadeIn(); // Show popup
        }
    });

    $(document).on('click', '.setTextColora', function ( e ) {
        e.preventDefault();
        let selectedColor = $("#setTextColor").val(); // Get the selected color value
        let colorChangeId = $(this).attr('id'); // Get the ID of the input
        console.log( colorChangeId );
        colorChangeId = colorChangeId.replace('color', "");


        // Apply the color to the target element
        $('#' + colorChangeId).css('color', selectedColor);
    });


    $('#closePopup').click(function () {
        $('#popupContainer').fadeOut(); // Hide popup
    });
    // Close popup when clicking outside the popup content
    $('#popupContainer').click(function (event) {
        if ($(event.target).is('#popupContainer')) {
            $('#popupContainer').fadeOut(); // Hide popup
        }
    });

    $(document).on('click', '.textMove', function (e) {
        e.preventDefault();

        let moveTextBtn = $(this).attr('id'); // Get the ID of the clicked button
        let moveTextBtnParent = $(this).parent().attr('id'); // Get the parent's ID
        let moveTextId = moveTextBtnParent.replace('move', ""); // Extract the target element's ID

        let setTopPosition = $(`#${moveTextId}`).css('top');
        let setLeftPosition = $(`#${moveTextId}`).css('left');
        setTopPosition = parseInt(setTopPosition, 10) || 0;
        setLeftPosition = parseInt(setLeftPosition, 10) || 0;
        if (moveTextBtn === `textTop`) {
            setTopPosition--;
        }
        if (moveTextBtn === `textBottom`) {
            setTopPosition++;
        }
        if (moveTextBtn === `textLeft`) {
            setLeftPosition--;
        }
        if (moveTextBtn === `textRight`) {
            setLeftPosition++;
        }

        $(`#${moveTextId}`).css({
            top: `${setTopPosition}px`,
            left: `${setLeftPosition}px`,
        });
    });

    //Set Focus Text
    $(document).on('click', '.set_text_display', function ( e ) {
        e.preventDefault();
        let $this = $(this);
        $this.focus();
        let valueLength = $this.val().length;
        $this[0].setSelectionRange(valueLength, valueLength);
    });
    // Prevent click propagation on popup elements
    $(document).on('click', '.set_text_holdercontainer, .set_text_holder', function (e) {
        e.stopPropagation(); // Allow the input box to focus
    });

    $(document).on('click', function () {
        $('.set_text_holdercontainer').remove();
        $(".childDiv.save").find( '.controlTextSizeHolder' ).remove();
    });
    $(document).on('click', '.close_set_text', function ( e ) {
        e.preventDefault();
        $('.set_text_holdercontainer').remove();
    });
    $(document).on('click', '.set_text_button', function ( e ) {
        e.preventDefault();
        let textSetClickId = $('.set_text_button').attr('id');
        let inputVal = $('.set_text_display').val();
        let textSetId = 'seatText'+textSetClickId;
        $("#"+textSetId).show();
        $('#'+textSetId).text(inputVal);
        $('.set_text_holdercontainer').remove();
    });
    //End

    function make_rotate( rotate_id ){
        let id = '#' + rotate_id;
        let leftPosition = $(id).css('left');
        let topPosition = $(id).css('top');
        leftPosition = parseInt(leftPosition, 10);
        topPosition = parseInt(topPosition, 10);
        if ($('#'+rotate_id).hasClass('rotateSelected')) {
            $(id).removeClass('rotateSelected');
            selectionOrder = selectionOrder.filter(divId => divId !== rotate_id ); // Remove from order
        } else {
            $(id).addClass('rotateSelected');
            selectionOrder.push( rotate_id ); // Add to order
        }
        if ( !( rotate_id in rotationData)) {
            rotationData[rotate_id] = { angle: 0, position: leftPosition, topPosition: topPosition };
            // forReverse[rotate_id] = { angle: 0, position: leftPosition, topPosition: topPosition };
        }
        // console.log( rotationData, selectionOrder );
    }

    let distance = 10;
    // Rotate Left button click
    let getOption = 'top-to-bottom';
    $('#rotateLeft').click(function ( e ) {
        e.preventDefault();
        getOption =  $("select[name='rotationHandle']").val().trim();
        distance = $("#rotationAngle").val();
        distance = parseInt(distance, 10);
        selectionOrder.forEach((id, index) => {
            const movement = (index) * distance;
            rotationData[id].angle -= distance;
            if( getOption === 'top-to-bottom' ) {
                rotationData[id].position += movement;
            }else if( getOption === 'bottom-to-top' ){
                rotationData[id].position -= movement;
            }else if( getOption === 'right-to-left' ){
                rotationData[id].topPosition += movement;
            }else if( getOption === 'left-to-right' ){
                rotationData[id].topPosition -= movement;
            }

            $(`#${id}`).attr('data-degree', rotationData[id].angle);
            /*$(`#${id}`).css({
                transform: `rotate(${rotationData[id].angle}deg)`,
                left: `${rotationData[id].position}px`,
                'z-index': 10,
            });*/
            if( getOption === 'top-to-bottom' || getOption === 'bottom-to-top' ){
                $(`#${id}`).css({
                    transform: `rotate(${rotationData[id].angle}deg)`,
                    left: `${rotationData[id].position}px`,
                });
            }else if( getOption === 'right-to-left' || getOption === 'left-to-right' ){
                $(`#${id}`).css({
                    transform: `rotate(${rotationData[id].angle}deg)`,
                    top: `${rotationData[id].topPosition}px`,
                });
            }
        });
    });

    // Rotate Right button click
    $('#rotateRight').click(function ( e ) {
        getOption =  $("select[name='rotationHandle']").val().trim();
        distance = $("#rotationAngle").val();
        distance = parseInt(distance, 10);
        e.preventDefault();
        selectionOrder.forEach((id, index) => {
            const movement = (index) * distance ;
            // console.log( id );
            rotationData[id].angle += distance;
            if( getOption === 'top-to-bottom' ){
                rotationData[id].position -= movement;
            }else if( getOption === 'bottom-to-top' ){
                rotationData[id].position += movement;
            }else if( getOption === 'right-to-left' ){
                rotationData[id].topPosition -= movement;
            }else if( getOption === 'left-to-right' ){
                rotationData[id].topPosition += movement;
            }

            $('#'+id).attr('data-degree', rotationData[id].angle);
            if( getOption === 'top-to-bottom' || getOption === 'bottom-to-top' ){
                $(`#${id}`).css({
                    transform: `rotate(${rotationData[id].angle}deg)`,
                    left: `${rotationData[id].position}px`,
                });
            }else if( getOption === 'right-to-left' || getOption === 'left-to-right' ){
                $(`#${id}`).css({
                    transform: `rotate(${rotationData[id].angle}deg)`,
                    top: `${rotationData[id].topPosition}px`,
                });
            }

        });
    });

    $(document).on( 'click', '#rotateDone', function ( e ) {
        e.preventDefault();
        rotationData = {}; // Store rotation angles and positions for each div
        selectionOrder = [];
    });

    $("#applyColorChanges").on("click", function (e) {
        e.preventDefault();
        let colorTotal = selectedDivs.length;
        if( colorTotal > 0 ){
            const color = $("#setColor").val();
            selectedDivs.forEach(div => {
                if( div.hasClass('selected')){
                    div.addClass("save").removeClass('selected');
                    if (color) div.css("background-color", color);
                }

            });
            selectedDivs = selectedDraggableDivs = [];
        }else{
            alert('Please select any seat!');
        }

    });

    $("#applyChanges").on("click", function (e) {
        e.preventDefault();
        let setPriceTotal = selectedDivs.length;
        if( setPriceTotal > 0 ){
            const price = $("#setPrice").val();

            selectedDivs.forEach(div => {
                if( div.hasClass('selected')){
                    div.addClass("save").removeClass('selected');
                    // if (color) div.css("background-color", color);
                    if (price){
                        div.attr("data-price", price)/*.text(price)*/;
                        const tooltip = div.find('.tooltip');
                        if (tooltip.length) {
                            tooltip.text(`Price: ${price}`);
                        } else {
                            div.append('<div class="tooltip" style="display: none;">Price: ' + price + '</div>');
                        }
                    }
                }

            });
            selectedDivs = selectedDraggableDivs = [];
        }else{
            alert('Please select any seat!');
        }


    });

    $('#savePlan').on('click', function (e) {
        e.preventDefault();
        /*const planName = $('#plan-name').val();
        if (!planName) {
            alert('Please enter a plan name!');
            return;
        }*/
        var seatPlanTexts = [];
        var selectedSeats = [];
        // console.log( seatIconName );
        $('.childDiv.save').each(function () {
            if ( $(this).css('background-color') !== 'rgb(255, 255, 255)') { // Not default white
                const id = $(this).data('id');
                const className = $(this).attr('class');
                // console.log( className );
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
                const border_radius = $(this).css('border-radius') || 0;
                const seatText = $(this).find('.seatText').text();

                // console.log( seatText );
                selectedSeats.push({ id, row, col, color, price, width, height, seat_number, left, top, z_index, data_degree, border_radius, seatText });
            }
        });

        $('.text-wrapper').each(function () {
            const textLeft = parseInt($(this).css('left')) || 0;
            const textTop = parseInt($(this).css('top')) || 0;
            const class_name = $(this).data('class');
            const color = $(this).children('.dynamic-text' ).css('color') || '';
            const fontSize = $(this).children('.dynamic-text').css('font-size') || '';
            const text = $(this).children('.dynamic-text').text() || '';
            const textRotateDeg = $(this).data('text-degree') || 0;
            seatPlanTexts.push({ text, class_name, textLeft, textTop, color, fontSize, textRotateDeg});
        });

        if ( selectedSeats.length === 0 ) {
            alert('No seats selected to save!');
            return;
        }
        // selectedSeats.sort((a, b) => a.col - b.col);
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
        console.log( seatPlanTexts );
        $.ajax({
            url: ajax_object.ajax_url,
            type: 'POST',
            data: {
                action: 'save_custom_meta_data',
                nonce: ajax_object.nonce,
                post_id: postId,
                custom_field_1: selectedSeats,
                seatPlanTexts: seatPlanTexts,
                seatIcon: seatIconName,
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
        // console.log( selectedSeats, ajax_object );
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
    let isDragging = false;
    let startPoint = { x: 0, y: 0 };
    let selectionBox = null;
    let $seatGrid = $("#parentDiv");

    $seatGrid.on('mousedown', function (e) {
        e.preventDefault();

        if (!$("#enable_drag_drop").hasClass("enable_drag_drop")) {
            if ($("#set_multiselect").hasClass('enable_set_multiselect')) {
                isMultiSelecting = true;
                isDragging = false;

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
        }
    });

    $seatGrid.on('mousemove', function (e) {
        e.preventDefault();

        if (isMultiSelecting) {
            if (!selectionBox) return;

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

            $('.childDiv.save').each(function () {
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
        } else {
            isDragging = true;
        }
    });

    $(document).on('mouseup', function (e) {
        e.preventDefault();

        if (isMultiSelecting) {
            console.log( isDragging );
            // isDragging = false;
            $('.childDiv.save.dotted').each(function () {
                const $this = $(this);
                make_rotate( $(this).attr('id') );
                selectedDivs.push($this);
                selectedDraggableDivs.push($this);
                selectedSeatsDivs.push($this);
                $this.toggleClass('selected').removeClass('dotted');
                $this.css('z-index', 10);
               /* if ($('#make_circle').hasClass('circleSelected')) {
                    $(this).css('border-radius', '50%');
                }*/
                if ( !$this.hasClass('selected') ) {
                    selectedDivs = selectedDivs.filter(div => div[0] !== $this[0]);
                    selectedDraggableDivs = selectedDraggableDivs.filter(div => div[0] !== $this[0]);
                    selectedSeatsDivs = selectedSeatsDivs.filter(div => div[0] !== $this[0]);
                }
            });

            if( selectedDivs.length > 0 ){
                $('#setPriceColorHolder').fadeIn(1000);
            }else{
                $('#setPriceColorHolder').fadeOut();
            }
            // Remove the selection box
            if (selectionBox) {
                selectionBox.remove();
                selectionBox = null;
            }
        }else{
            isDragging = true;
        }
    });

    function multiSeat_Creation(){
        let $CreateSeatGrid = $("#parentDiv");
        let createMultiSeats = false;
        let createSeatStartPoint = { x: 0, y: 0 };
        let createSeatSelectionBox = null;
        $CreateSeatGrid.on('mousedown', function (e) {
            e.preventDefault();
            if ( $("#set_seat").hasClass('enable_set_seat') ) {
                createMultiSeats = true;
                $('.childDiv').removeClass('hovered'); // Clear previous hover highlights

                createSeatStartPoint = {x: e.pageX, y: e.pageY};
                createSeatSelectionBox = $('<div>').addClass('selection-box').appendTo($CreateSeatGrid);
                createSeatSelectionBox.css({
                    left: createSeatStartPoint.x,
                    top: createSeatStartPoint.y,
                    width: 0,
                    height: 0,
                });
            }
        });
        $CreateSeatGrid.on('mousemove', function (e) {
            e.preventDefault();
            if (createMultiSeats) {
                const createSeatsCurrentPoint = { x: e.pageX, y: e.pageY };

                const left = Math.min(createSeatStartPoint.x, createSeatsCurrentPoint.x);
                const top = Math.min(createSeatStartPoint.y, createSeatsCurrentPoint.y);
                const width = Math.abs(createSeatsCurrentPoint.x - createSeatStartPoint.x);
                const height = Math.abs(createSeatsCurrentPoint.y - createSeatStartPoint.y);

                createSeatSelectionBox.css({
                    left: left,
                    top: top,
                    width: width,
                    height: height,
                });

                $('.childDiv').each(function () {

                    if(!$(this).hasClass('save' )){
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
                    }
                });
            }
        });
        $(document).on('mouseup', function (e) {
            e.preventDefault();
            if (createMultiSeats) {
                createMultiSeats = false;
                $('.childDiv.dotted').each(function () {
                    const $this = $(this);
                    let MultiseatDivId = $this.attr('id');
                    let MultiseatId = MultiseatDivId.replace("div", "");
                    $this.toggleClass('save seatClickable').removeClass('dotted');
                    seat_num++;
                    let color = $('#setColor').val();
                    $this.addClass("save seatClickable");
                    $this.css({
                        'background-color' : color,
                    });
                    $this.attr('data-seat-num', seat_num);
                    let seatNumberId = 'seatNumber'+MultiseatId;
                    $("#"+seatNumberId).text(seat_num);
                    $("#"+seatNumberId).show();
                    const rotate_id = $(this).attr('id');
                    $this.css('z-index', 10);
                });

                // Remove the selection box
                if (selectionBox) {
                    selectionBox.remove();
                    selectionBox = null;
                }
            }
        });
    }

    multiSeat_Creation();

    //Hover option
    /*$('.childDiv').each(function () {
        $(this).append('<div class="tooltip"></div>');
    });*/

    /*$('.childDiv').hover(function () {
        let tooltipValue = $(this).find('.tooltip').text();
        if ( tooltipValue ) {
            $(this).find('.tooltip')
                .text(`${tooltipValue}`)
                .show();
        }
    }, function () {
        $(this).find('.tooltip').hide();
    });*/

    //End

    $('.text-wrapper').hover(
        function () {
            // On mouse enter
            $(this).children('.zoom-in, .zoom-out, .remove-text, .set-color, .setRotateBtn').fadeIn();
        },
        function () {
            // On mouse leave
            $(this).children('.zoom-in, .zoom-out, .remove-text, .set-color, .setRotateBtn').fadeOut();
        }
    );
    $('.zoom-in').click(function (e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent triggering parent click

        // Correctly target the sibling element with the 'dynamic-text' class
        const dynamicText = $(this).siblings('.dynamic-text');
        const currentSize = parseInt(dynamicText.css('font-size'));

        if (!isNaN(currentSize)) {
            dynamicText.css('font-size', currentSize + 2 + 'px');
        }
    });
    $('.zoom-out').click(function (e) {
        e.preventDefault();
        e.stopPropagation(); // Prevent triggering parent click

        // Correctly target the sibling element with the 'dynamic-text' class
        const dynamicText = $(this).siblings('.dynamic-text');
        const currentSize = parseInt(dynamicText.css('font-size'));

        if (!isNaN(currentSize)) {
            dynamicText.css('font-size', currentSize - 2 + 'px');
        }
    });
    // Remove text when clicking the remove button
    $('.remove-text').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).parent().remove();
        // dynamicText.remove(); // Remove the text and buttons
    });

    let rotateCount = 0;
    $('.setRotateBtn').click(function (e) {
        rotateCount += 10;
        $(this).parent('.text-wrapper').css("transform", `rotate(${rotateCount}deg)`);
        $(this).parent('.text-wrapper').attr('data-text-degree', rotateCount);
    });

   /* $('.set-color').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        const newColor = prompt("Enter a color (e.g., 'red', '#ff0000'):", "red");
        const dynamicText = $(this).siblings('.dynamic-text');
        if (newColor) {
            dynamicText.css("color", newColor); // Apply the new color
        }
    });*/

    $('.set-color').click(function (e) {
        e.preventDefault();
        e.stopPropagation();
        const colorInput = $('<input>', {
            type: 'color',
            style: 'position: absolute; right: 0; top: 0; opacity: 0; pointer-events: auto;'
        }).appendTo('body');
        const dynamicText = $(this).siblings('.dynamic-text');
        colorInput.trigger('click');
        colorInput.on('input', function () {
            const newColor = $(this).val();
            if (newColor) {
                dynamicText.css("color", newColor); // Apply the new color
            }
            colorInput.remove();
        });
    });


    //Set Text plan
    let previousText = '';
    $(document).on('click','.parentDiv',function (e) {
        e.preventDefault();
        set_plan_text( e );
    });
    function set_plan_text( e ){
        let rotateText = 0;
        if (isSetTextMode) {
            const parentOffset = $('.parentDiv').offset();
            const x = e.pageX - parentOffset.left;
            const y = e.pageY - parentOffset.top;

            // Add 10px offset to the x and y position to move the input slightly
            const inputX = x;
            const inputY = y;

            // Create input field dynamically
            const input = $('<input type="text" class="dynamic-input">').css({
                position: 'absolute',
                left: inputX,
                top: inputY,
                transform: 'translate(-50%, -50%)',
                width: '50px',
                zIndex: 999, // Ensures the input field is above other elements
            });

            // Append input field to the parent div
            $('.parentDiv').append(input);

            // Focus on the input field and handle the blur event
            input.focus().blur(function () {
                const text = $(this).val().trim(); // Trim to remove extra spaces

                // If the input has text, create a span with buttons; otherwise, remove the input
                if (text) {
                    const textWrapper = $('<div class="text-wrapper" data-text-degree="0"></div>').css({
                        position: 'absolute',
                        left: inputX,
                        top: inputY,
                        transform: 'translate(-50%, -50%)',
                    });

                    const textDisplay = $('<span class="dynamic-text"></span>')
                        .text(text)
                        .css({
                            display: 'block',
                            cursor: 'pointer',
                        });

                    // Buttons for font size adjustment, remove and color
                    const zoomInBtn = $('<button class="zoom-in">+</button>');
                    const zoomOutBtn = $('<button class="zoom-out">-</button>');
                    const removeBtn = $('<button class="remove-text">X</button>');
                    const setColorBtn = $('<button class="set-color">Color</button>');
                    const setRotateBtn = $('<button class="setRotateBtn">Rotate</button>');
                    $(this).replaceWith(textWrapper);
                    textWrapper.append(textDisplay, zoomInBtn, zoomOutBtn, removeBtn, setColorBtn, setRotateBtn);

                    textWrapper.hover(
                        function () {
                            zoomInBtn.show();
                            zoomOutBtn.show();
                            removeBtn.show();
                            setColorBtn.show();
                            setRotateBtn.show();
                        },
                        function () {
                            zoomInBtn.hide();
                            zoomOutBtn.hide();
                            removeBtn.hide();
                            setColorBtn.hide();
                            setRotateBtn.hide();
                        }
                    );

                    /*textDisplay.click(function (e) {
                        e.preventDefault();
                        previousText = $(this).text();
                        $('.dynamic-input').remove();

                        const editInput = $('<input type="text" class="dynamic-input">')
                            .val(previousText)
                            .css({
                                position: 'absolute',
                                left: parseInt(textWrapper.css('left')), // Maintain the position
                                top: parseInt(textWrapper.css('top')),  // Maintain the position
                                transform: 'translate(-50%, -50%)',
                            });

                        textWrapper.replaceWith(editInput);

                        editInput.focus().blur(function () {
                            const newText = $(this).val().trim();
                            if (newText) {
                                textDisplay.text(newText);
                                $(this).replaceWith(textWrapper);
                            } else {
                                // Remove the input field if no text
                                $(this).remove();
                            }
                        });
                    });*/

                    zoomInBtn.click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const currentSize = parseInt(textDisplay.css('font-size'));
                        textDisplay.css('font-size', currentSize + 2 + 'px');
                    });

                    zoomOutBtn.click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        const currentSize = parseInt(textDisplay.css('font-size'));
                        if (currentSize > 6) { // Set a minimum font size limit
                            textDisplay.css('font-size', currentSize - 2 + 'px');
                        }
                    });

                    removeBtn.click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        textWrapper.remove();
                    });
                    setColorBtn.click(function (e) {
                        /*e.preventDefault();
                        e.stopPropagation();
                        const newColor = prompt("Enter a color (e.g., 'red', '#ff0000'):", "red");
                        if (newColor) {
                            textDisplay.css("color", newColor); // Apply the new color
                        }*/
                        e.preventDefault();
                        e.stopPropagation();
                        const colorInput = $('<input>', {
                            type: 'color',
                            style: 'position: absolute; right: 0; top: 0; opacity: 0; pointer-events: auto;'
                        }).appendTo('body');
                        // const dynamicText = $(this).siblings('.dynamic-text');
                        colorInput.trigger('click');
                        colorInput.on('input', function () {
                            const newColor = $(this).val();
                            if (newColor) {
                                textDisplay.css("color", newColor); // Apply the new color
                            }
                            colorInput.remove();
                        });
                    });
                    let rotateCount = 0;
                    setRotateBtn.click(function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        rotateCount += 10;
                        textWrapper.css("transform", `rotate(${rotateCount}deg)`);
                        textWrapper.attr('data-text-degree', rotateCount);
                    });
                } else {
                    $(this).remove();
                }
            });
        }
    }

    // Ensure selectedDraggableDivs is defined as an array
    let isTextDragging = false;
    let selectedTextDraggableDivs = [];
    $(document).on("click",".text-wrapper", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const $this = $(this);

        // Toggle selection
        if ($this.hasClass("textSelected")) {
            $this.removeClass("textSelected");
            selectedTextDraggableDivs = selectedTextDraggableDivs.filter(
                (div) => div[0] !== $this[0]
            );
        } else {
            $this.addClass("textSelected");
            selectedTextDraggableDivs.push($this);
        }

        // Make the clicked element draggable
        $(this).draggable({
            containment: "#parentDiv",
            start: function () {
                isTextDragging = true;
            },
            drag: function (event, ui) {
                const current = $(this);
                const offsetX = ui.position.left - current.position().left;
                const offsetY = ui.position.top - current.position().top;

                if (isTextDragging && selectedTextDraggableDivs.length > 0) {
                    selectedTextDraggableDivs.forEach((div) => {
                        if (div[0] !== current[0]) {
                            div.css({
                                top: div.position().top + offsetY + "px",
                                left: div.position().left + offsetX + "px",
                            });
                        }
                    });
                }
            },
            stop: textDragDebounce(function () {
                isDragging = false;
                if ($this.hasClass("textSelected")) {
                    $this.removeClass("textSelected");
                    selectedTextDraggableDivs = selectedTextDraggableDivs.filter(
                        (div) => div[0] !== $this[0]
                    );
                }
                console.log("Drag operation stopped.");
                // Add any additional stop logic here
            }, 300),
        });
    });

// Debounce function definition
    function textDragDebounce(func, wait) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
    //End


});