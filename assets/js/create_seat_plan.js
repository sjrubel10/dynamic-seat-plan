jQuery(document).ready(function ($) {

    var frame;
    $('.upload-feature-image-button').click(function(e) {
        e.preventDefault();
        if (frame) {
            frame.open();
            return;
        }
        frame = wp.media({
            title: 'Select or Upload Feature Image',
            button: { text: 'Use this image' },
            multiple: false
        });
        frame.on('select', function() {
            var attachment = frame.state().get('selection').first().toJSON();
            $('#custom-feature-image-url').val(attachment.url);
            $('.custom-feature-image-preview').html('<img src="' + attachment.url + '" style="max-width: 100%; margin-bottom: 10px;">');
            $('.remove-feature-image-button').show();
        });
        frame.open();
    });
    $('.remove-feature-image-button').click(function(e) {
        e.preventDefault();
        $('#custom-feature-image-url').val('');
        $('.custom-feature-image-preview').html('');
        $(this).hide();
    });

    $('#uploadButton').on('click', function ( e ) {
        e.preventDefault();
        let fileInput = $('#iconUpload')[0].files[0];
        if (!fileInput) {
            alert('Please select a file to upload.');
            return;
        }

        let formData = new FormData();
        formData.append('icon', fileInput);

        $.ajax({
            url: ajax_object.ajax_url,
            type: 'POST',
            data: {
                action: 'upload_icon',
                nonce: ajax_object.nonce,
                formData: formData
            },
            success: function (response) {
                if (response.success) {
                    alert(response.data.message);
                    $('#previewImage').attr('src', response.data.url).show();
                } else {
                    alert(response.data.message);
                }
            },
            error: function () {
                alert('An error occurred while uploading the icon.');
            },
        });
    });

    let templates = [];
    $(document).on('click', '.templates', function ( e ) {
        e.preventDefault();
        let templateId = $(this).attr( 'id' );
        $(this).toggleClass('templateSelected');
        let postIds =  templateId.split('-');
        let postId = postIds[1];
        if( $(this).hasClass( 'templateSelected') ){
            templates.push( postId );
        }else{
            templates = templates.filter(function (item) {
                return item !== postId;
            });
        }
    });

    $(document).on('click', '.openAsTemplate', function ( e ) {

        e.preventDefault();
        let original_posts = $(this).attr('id');
        let original_post = original_posts.replace('open_', '');
        if( templates.length > 0 ){
            let postIds = templates.join("_");
            window.location.href = `${ajax_object.site_url}/wp-admin/post.php?post=${original_post}&action=edit&templateId=${postIds}`;
        }
    });

    $(document).on('click', '.templateLinks', function (e) {
        e.preventDefault();
        const $this = $(this);
        $this.addClass('focus-out');
        setTimeout(function () {
            window.location.href = $this.attr('href');
        }, 500);
    });

    $(document).on('click', '#enable_resize', function (e) {
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

    $(document).on('click', '#importFromTemplatePopUp', function ( e ) {
        e.preventDefault();
        let postId = $(this).parent().parent().attr('id');
        $.ajax({
            url: ajax_object.ajax_url,
            type: 'POST',
            data: {
                action: 'render_manage_seat_templates_for_import',
                nonce: ajax_object.nonce,
                paged: 1,
                postId: postId,
            },
            success: function (response) {
                if (response.success) {
                    let popUp = '<div id="templatePopupContainer" class="popup">\
                                            <div class="templatePopupContent">\
                                                <span id="templatePopupClose" class="templatePopupClose">&times;</span>\
                                                <div id="popupInnerContent">'+response.data+'\
                                                </div>\
                                            </div>\
                                        </div>';
                    $("#seatContentHolder").append( popUp );
                } else {
                    alert('Failed to load templates.');
                }
            },
            error: function () {
                alert('An error occurred.');
            },
        });

        $('#templatePopupContainer').show();

    });

    $(document).on('click', '#set_seat', function (e) {
        e.preventDefault();
        $(this).toggleClass('enable_set_seat');
        if( $(this).hasClass('enable_set_seat' ) ){
            $('#set_single_select').removeClass('enable_single_seat_selection');
            $('#set_multiselect').removeClass('enable_set_multiselect');
            $('#removeSelected').removeClass('enable_erase_seat');
            $('#set_shape').removeClass('enable_set_shape');
            $('#setTextnew').removeClass('enable_set_text');
            $('#copyPaste').removeClass('selectedPaste');
            $('body').removeClass('lasso-cursor');
            isSetTextMode = false;
            $('#dynamicShapeHolder').fadeOut();

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
            $('#copyPaste').removeClass('selectedPaste');
            $('body').removeClass('lasso-cursor');
            $("#make_circle").fadeIn();
            isSetTextMode = false;
            $('#dynamicShapeHolder').fadeIn();
        }else{
            $("#make_circle").fadeOut();
            $('#dynamicShapeHolder').fadeOut();
        }
    });

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
            $('#copyPaste').removeClass('selectedPaste');
            $('#dynamicShapeHolder').fadeOut();
            isSetTextMode = false;
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
            $('#copyPaste').removeClass('selectedPaste');
            $('#dynamicShapeHolder').fadeOut();
            $("#make_circle").fadeIn();
            isSetTextMode = false;
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
            $('#copyPaste').removeClass('selectedPaste');
            $('#dynamicShapeHolder').fadeOut();
            $('body').removeClass('lasso-cursor');

            isSetTextMode = false;
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

    $(document).on( 'click', '#setTextnew',function ( e ) {
        e.preventDefault();
        $(this).toggleClass('enable_set_text');
        if( $(this).hasClass('enable_set_text')){
            isSetTextMode = !isSetTextMode;
            $('#set_single_select').removeClass('enable_single_seat_selection');
            $('#set_seat').removeClass('enable_set_seat');
            $('#set_multiselect').removeClass('enable_set_multiselect');
            $('#removeSelected').removeClass('enable_erase_seat');
            $('#set_shape').removeClass('enable_set_shape');
            $('#copyPaste').removeClass('selectedPaste');
            $('#dynamicShapeHolder').fadeOut();
        }else{
            isSetTextMode = false;
        }
    });

    $(document).on( 'click', '#undo', function (e) {
        e.preventDefault();
        undo_data_display( removedData );

    });
    $(document).on("click", ".copyPaste", function (e) {
        e.preventDefault();
        $(this).toggleClass('selectedPaste');
        $('#set_single_select').removeClass('enable_single_seat_selection');
        $('#set_multiselect').removeClass('enable_set_multiselect');
        $('#removeSelected').removeClass('enable_erase_seat');
        $('#set_seat').removeClass('enable_set_seat');
        $('#setTextnew').removeClass('enable_set_text');
        $('#set_shape').removeClass('enable_set_shape');
    });

    let shapeIconName = '';
    let shapeIconImageUrl = '';
    $(document).on('click', '.shapeDisplayIcon', function (e) {
        shapeIconName = $(this).attr('id');
        shapeIconImageUrl = $(this).attr('src');
        $('.dynamicShape.selectedShape').each(function () {
            $(this).css({
                'background-image': `url(${shapeIconImageUrl})`,
                'background-color': '',
                'background-size': 'cover',
                'background-position': 'center',
                'background-repeat': 'no-repeat'
            });
            if( seatIconName === 'seatnull' ){
                seatIconName = '';
            }
            $(this).attr('data-background-image', shapeIconName);
        });
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
            if( seatIconName === 'seatnull' ) {
                imageUrl = '';
            }

            $('.childDiv.save.selected').each(function () {
                $(this).css({
                    'background-image': `url(${imageUrl})`,
                    'background-color': '',
                    'background-size': 'cover', // Ensure the image covers the div
                    'background-position': 'center', // Center the image
                    'background-repeat': 'no-repeat' // Prevent repeating
                });
                if( seatIconName === 'seatnull' ){
                    seatIconName = '';
                }
                $(this).attr('data-background-image', seatIconName);
            });
        }else{
            seatIconName = '';
            imageUrl = '';
        }
    });

    let parentWidth = $(".seatPlanHolder").css('width');
    // $("#parentDiv").css({ width: parentWidth});

    $(document).on('click', '.movement', function (e) {
        // alert('clicked');
        e.preventDefault();
        const text = $(this).attr('id');
        const offset = parseInt($("input[name='movementInPx']").val(), 10) || 15; // Default to 15 if empty or invalid
        let offsetX = 0;
        let offsetY = 0;
        if ( text === 'left' ) {
            offsetX = -offset;
        } else if ( text === 'right' ) {
            offsetX = offset;
        } else if ( text === 'top' ) {
            offsetY = -offset;
        } else if ( text === 'bottom' ) {
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

        $('.dynamicShape, .text-wrapper').each( function () {
            $(this).remove();
        });


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
    function hide_remove_shape_text_sellection(){
        $("#parentDiv").find('.text-wrapper').removeClass('textSelected');
        $("#parentDiv").find('.dynamicShape').removeClass('selectedShape');
        $(".dynamicShapeColorHolder").hide();
        $(".dynamicTextControlHolder").hide();
    }
    let seat_num = 0;
    $(document).on( "click", ".childDiv", function (e) {
        hide_remove_shape_text_sellection();
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
        }else{
            if( $this.hasClass('save') && $('#set_multiselect').hasClass('enable_set_multiselect' ) && !$('#set_seat').hasClass('enable_set_seat' ) ){
                $this.toggleClass("selected");
                make_rotate( $(this).attr('id') );
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
                        }, 300)
                    });
                }

                $(this).draggable({
                    containment: "#parentDiv",
                    drag: function (event, ui) {
                        const current = $(this);
                        const offsetX = ui.position.left - current.position().left;
                        const offsetY = ui.position.top - current.position().top;
                        isMultiSelecting = false;
                        isDragging = true;
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
            removed_seat_data( $(this), 'erase' );
            $("#undo").show();
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

        if( copyData.length > 0 ){
            if( $('.copyPaste').hasClass('selectedPaste')){
                let copyLeftPos = $(this).css('left');
                let copyTopPos = $(this).css('top');
                let copyDataRow = $(this).attr('data-row');
                let copyDataCol = $(this).attr('data-col');
                let copyDataID = $(this).attr('data-id');
                let copyId = "div_"+copyDataID;
                $(this).remove();
                let whereAppend = {
                    left: copyLeftPos,
                    top: copyTopPos,
                    row: copyDataRow,
                    col: copyDataCol,
                    data_id: copyDataID,
                    id: copyId,
                }

                copy_paste_seats( copyData, e, whereAppend );
            }
        }

    });

    function copy_paste_seats( removedData, e, whereAppend ){
        let lastElementData = {};
        let copy_paste_html = '';

        const x_axis =  whereAppend.left;
        const y_axis = whereAppend.top;

        $.each( removedData, function( index, value ) {
            lastElementData = value;
        });

        if( lastElementData.boxType === 'seats' ){
            copy_paste_html = `<div class="childDiv save" id="div_${whereAppend.id}" 
                          data-id="${whereAppend.data_id}" 
                          data-row="${whereAppend.row}" 
                          data-col="${whereAppend.col}" 
                          data-seat-num="${lastElementData.seat_number}" 
                          data-price="${lastElementData.price}" 
                          data-degree="${lastElementData.data_degree}" 
                          data-background-image="${lastElementData.backgroundImage}" 
                          style="
                              left: ${x_axis}; 
                              top: ${y_axis};  
                              width: ${lastElementData.width}; 
                              height: ${lastElementData.height}; 
                              background-color: ${lastElementData.color}; 
                              background-image: url('http://localhost/mage_people/wp-content/plugins/dynamic-seat-plan/assets/images/icons/seatIcons/${lastElementData.backgroundImage}.png'); 
                              z-index: ${lastElementData.z_index}; 
                              transform: rotate(${lastElementData.data_degree}deg);
                              border-radius: ${lastElementData.border_radius};
                          ">
                          <div class="tooltip" style="display: none; z-index: 999;">Price: ${lastElementData.price}</div>
                          <div class="seatNumber" id="seatNumber_${lastElementData.id}" style="display: block;">${lastElementData.seat_number}</div>
                      </div>`;
        }
        $("#parentDiv").append( copy_paste_html );
    }

    var removedData = [];
    function removed_seat_data( div, is_erase ){
        const id = div.data('id');
        const row = div.data('row');
        const col = div.data('col');
        const backgroundImage = div.data('background-image');
        const seat_number = div.data('seat-num');
        const data_degree = div.data('degree');
        const color = div.css('background-color');
        const price = div.data('price') || 0;
        const width =div.css('width') || 0;
        const height = div.css('height') || 0;
        const z_index = div.css('z-index') || 0;
        const left = div.css('left') || 0;
        const top = div.css('top') || 0;
        const border_radius = div.css('border-radius') || 0;
        const seatText =div.find('.seatText').text();
        const boxType = 'seats';
        if( is_erase === 'copy' ){
            copyData.push({ id, row, col, color, price, width, height, seat_number, left, top, z_index, data_degree, border_radius, seatText, backgroundImage, boxType });
        }else{
            $("#undo").show();
            removedData.push({ id, row, col, color, price, width, height, seat_number, left, top, z_index, data_degree, border_radius, seatText, backgroundImage, boxType });
        }
    }

    function removed_shape_data( div, is_erase = '' ){
        const shapeLeft = parseInt(div.css('left')) || 0;
        const shapeTop = parseInt(div.css('top')) || 0;
        const shapeWidth = parseInt(div.css('width')) || 0;
        const shapeHeight = parseInt(div.css('height')) || 0;
        const shapeBackgroundColor = div.css('background-color') || '';
        const shapeBorderRadius = div.css('border-radius') || '';
        const shapeClipPath = div.css('clip-path') || '';
        const shapeRotateDeg = div.data('shape-rotate') || 0;
        const boxType = 'shapes';
        if( is_erase === 'copy' ){
            copyData.push({ shapeLeft, shapeTop, shapeWidth, shapeHeight, shapeBackgroundColor, shapeBorderRadius, shapeClipPath, shapeRotateDeg, boxType });
        }else{
            $("#undo").show();
            removedData.push({ shapeLeft, shapeTop, shapeWidth, shapeHeight, shapeBackgroundColor, shapeBorderRadius, shapeClipPath, shapeRotateDeg, boxType });
        }

    }
    function removed_text_data( div, is_erase ){
        const textLeft = parseInt(div.css('left')) || 0;
        const textTop = parseInt(div.css('top')) || 0;
        const class_name = '';
        const color = div.children('.dynamic-text' ).css('color') || '';
        const fontSize = div.children('.dynamic-text').css('font-size') || '';
        const text = div.children('.dynamic-text').text() || '';
        const textRotateDeg = div.data('text-degree') || 0;
        const boxType = 'texts';
        if( is_erase === 'copy' ){
            copyData.push({ textLeft, textTop, class_name, color, fontSize, text, textRotateDeg, boxType});
        }else{
            $("#undo").show();
            removedData.push({ textLeft, textTop, class_name, color, fontSize, text, textRotateDeg, boxType});
        }

    }

    function undo_data_display( removedData ){
        var lastElementData = {};
        let html = '';
        if( removedData.length > 0 ){
            $.each( removedData, function( index, value ) {
                lastElementData = value;
            });
            removedData.pop();
            if( lastElementData.boxType === 'seats' ){
                html = `<div class="childDiv save" id="div_${lastElementData.id}" 
                          data-id="${lastElementData.id}" 
                          data-row="${lastElementData.row}" 
                          data-col="${lastElementData.col}" 
                          data-seat-num="${lastElementData.seat_number}" 
                          data-price="${lastElementData.price}" 
                          data-degree="${lastElementData.data_degree}" 
                          data-background-image="${lastElementData.backgroundImage}" 
                          style="
                              left: ${lastElementData.left}; 
                              top: ${lastElementData.top}; 
                              width: ${lastElementData.width}; 
                              height: ${lastElementData.height}; 
                              background-color: ${lastElementData.color}; 
                              background-image: url('http://localhost/mage_people/wp-content/plugins/dynamic-seat-plan/assets/images/icons/seatIcons/${lastElementData.backgroundImage}.png'); 
                              z-index: ${lastElementData.z_index}; 
                              transform: rotate(${lastElementData.data_degree}deg);
                              border-radius: ${lastElementData.border_radius};
                          ">
                          <div class="tooltip" style="display: none; z-index: 999;">Price: ${lastElementData.price}</div>
                          <div class="seatNumber" id="seatNumber_${lastElementData.id}" style="display: block;">${lastElementData.seat_number}</div>
                      </div>`;
            }else if( lastElementData.boxType === 'shapes' ){
                html = `<div class="dynamicShape ui-draggable ui-draggable-handle ui-resizable" 
                            data-shape-rotate="${lastElementData.shapeRotateDeg}" 
                            style="
                                left: ${lastElementData.shapeLeft}px; 
                                top: ${lastElementData.shapeTop}px; 
                                width: ${lastElementData.shapeWidth}px; 
                                height:${lastElementData.shapeHeight}px;
                                transform: rotate(${lastElementData.shapeRotateDeg}deg);
                                clip-path: ${lastElementData.shapeClipPath};
                                background-color: ${lastElementData.shapeBackgroundColor}; 
                                border-radius: ${lastElementData.shapeBorderRadius};
                                "
                            >
                            <div class="ui-resizable-handle ui-resizable-e" style="z-index: 90;"></div>
                            <div class="ui-resizable-handle ui-resizable-s" style="z-index: 90;"></div>
                            <div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" style="z-index: 90;"></div>
                        </div>`;
            }else if( lastElementData.boxType === 'texts' ){
                html = `
                <div class="text-wrapper" data-text-degree="${lastElementData.textRotateDeg}" 
                    style="
                        position: absolute; 
                        left: ${lastElementData.textLeft}px; 
                        top: ${lastElementData.textTop}px; 
                        transform: rotate(${lastElementData.textRotateDeg}deg);">
                     <span class="dynamic-text" 
                        style="
                            display: block; 
                            color: ${lastElementData.color}; 
                            font-size: ${lastElementData.fontSize};
                            cursor: pointer;">
                            ${lastElementData.text}
                    </span>
                </div>
                `;
            }

            $("#parentDiv").append(html);
        }else{
            $("#undo").hide();
        }
    }
    function copy_data_display( removedData, e ){
        let copy_paste_html = '';
        let lastElementData = {};
        const parentOffset = $('.parentDiv').offset();
        const x_axis = e.pageX - parentOffset.left;
        const y_axis = e.pageY - parentOffset.top;

        if( removedData.length > 0 ){
            $.each( removedData, function( index, value ) {
                lastElementData = value;
            });
            // removedData.pop();
            if( lastElementData.boxType === 'seats_old' ){
                copy_paste_html = `<div class="childDiv save" id="div_${lastElementData.id}" 
                          data-id="${lastElementData.id}" 
                          data-row="${lastElementData.row}" 
                          data-col="${lastElementData.col}" 
                          data-seat-num="${lastElementData.seat_number}" 
                          data-price="${lastElementData.price}" 
                          data-degree="${lastElementData.data_degree}" 
                          data-background-image="${lastElementData.backgroundImage}" 
                          style="
                              left: ${x_axis}px; 
                              top: ${y_axis}px;  
                              width: ${lastElementData.width}; 
                              height: ${lastElementData.height}; 
                              background-color: ${lastElementData.color}; 
                              background-image: url('http://localhost/mage_people/wp-content/plugins/dynamic-seat-plan/assets/images/icons/seatIcons/${lastElementData.backgroundImage}.png'); 
                              z-index: ${lastElementData.z_index}; 
                              transform: rotate(${lastElementData.data_degree}deg);
                              border-radius: ${lastElementData.border_radius};
                          ">
                          <div class="tooltip" style="display: none; z-index: 999;">Price: ${lastElementData.price}</div>
                          <div class="seatNumber" id="seatNumber_${lastElementData.id}" style="display: block;">${lastElementData.seat_number}</div>
                      </div>`;
            }
            else if( lastElementData.boxType === 'shapes' ){
                copy_paste_html = `<div class="dynamicShape ui-draggable ui-draggable-handle ui-resizable" 
                            data-shape-rotate="${lastElementData.shapeRotateDeg}" 
                            style="
                                left: ${x_axis}px; 
                                top: ${y_axis}px; 
                                width: ${lastElementData.shapeWidth}px; 
                                height:${lastElementData.shapeHeight}px;
                                transform: rotate(${lastElementData.shapeRotateDeg}deg);
                                clip-path: ${lastElementData.shapeClipPath};
                                background-color: ${lastElementData.shapeBackgroundColor}; 
                                border-radius: ${lastElementData.shapeBorderRadius};
                                "
                            >
                            <div class="ui-resizable-handle ui-resizable-e" style="z-index: 90;"></div>
                            <div class="ui-resizable-handle ui-resizable-s" style="z-index: 90;"></div>
                            <div class="ui-resizable-handle ui-resizable-se ui-icon ui-icon-gripsmall-diagonal-se" style="z-index: 90;"></div>
                        </div>`;
            }
            else if( lastElementData.boxType === 'texts' ){
                copy_paste_html = `
                <div class="text-wrapper" data-text-degree="${lastElementData.textRotateDeg}" 
                    style="
                        position: absolute; 
                        left: ${x_axis}px; 
                        top: ${y_axis}px;  
                        transform: rotate(${lastElementData.textRotateDeg}deg);">
                     <span class="dynamic-text" 
                        style="
                            display: block; 
                            color: ${lastElementData.color}; 
                            font-size: ${lastElementData.fontSize};
                            cursor: pointer;">
                            ${lastElementData.text}
                    </span>
                </div>
                `;
            }

            $("#parentDiv").append( copy_paste_html );
        }
    }

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
        colorChangeId = colorChangeId.replace('color', "");
        $('#' + colorChangeId).css('color', selectedColor);
    });


    $('#closePopup').click(function () {
        $('#popupContainer').fadeOut(); // Hide popup
    });
    $(document).on( 'click', '#templatePopupClose', function (e) {
        e.preventDefault();
        $('#templatePopupContainer').fadeOut(); // Hide popup
        $('#templatePopupContainer').remove();
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
        if ( !$('#'+rotate_id).hasClass('selected') ) {
            selectionOrder = selectionOrder.filter(divId => divId !== rotate_id );
        } else {
            selectionOrder.push( rotate_id );
        }
        if ( !( rotate_id in rotationData)) {
            rotationData[rotate_id] = { angle: 0, position: leftPosition, topPosition: topPosition };
        }
    }

    let distance = 10;
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

    /*$(document).on( 'click', '#rotateDone', function ( e ) {
        e.preventDefault();
        rotationData = {}; // Store rotation angles and positions for each div
        selectionOrder = [];
    });*/

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

    $('.savePlan').on('click', function (e) {
        e.preventDefault();
        /*const planName = $('#plan-name').val();
        if (!planName) {
            alert('Please enter a plan name!');
            return;
        }*/

        let clickedId = $(this).attr('id');
        let template = '';
        if( clickedId === 'savePlanAsTemplate'){
            template = 'template'
        }

        var seatPlanTexts = [];
        var selectedSeats = [];
        var dynamicShapes = [];
        $('.childDiv.save').each(function () {
            if ( $(this).css('background-color') !== 'rgb(255, 255, 255)') { // Not default white
                const id = $(this).data('id');
                const row = $(this).data('row');
                const col = $(this).data('col');
                const backgroundImage = $(this).data('background-image');
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

                selectedSeats.push({ id, row, col, color, price, width, height, seat_number, left, top, z_index, data_degree, border_radius, seatText, backgroundImage });
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

        $('.dynamicShape').each(function () {
            const textLeft = parseInt($(this).css('left')) || 0;
            const textTop = parseInt($(this).css('top')) || 0;
            const width = parseInt($(this).css('width')) || 0;
            const height = parseInt($(this).css('height')) || 0;
            const backgroundColor = $(this).css('background-color') || '';
            const borderRadius = $(this).css('border-radius') || '';
            const clipPath = $(this).css('clip-path') || '';
            const shapeRotateDeg = $(this).data('shape-rotate') || 0;
            dynamicShapes.push({ textLeft, textTop, width, height,  backgroundColor, borderRadius, clipPath, shapeRotateDeg});
        });

        if ( selectedSeats.length === 0 ) {
            alert('No seats selected to save!');
            return;
        }
        const postId = $('#plan_id').val();
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
                dynamicShapes: dynamicShapes,
                template: template,
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

    });

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
            $('.childDiv.save.dotted').each(function () {
                const $this = $(this);
                selectedDivs.push($this);
                selectedDraggableDivs.push($this);
                selectedSeatsDivs.push($this);
                $this.toggleClass('selected').removeClass('dotted');
                $this.css('z-index', 10);
                make_rotate( $(this).attr('id') );
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

                    if(!$(this).hasClass('save' ) && addEnableSeat){
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

    let selectShape = 'rectangle';
    $(document).on('click','.shapeText',function (e) {
        $(this).siblings().removeClass('shapeTextSelected')
        $(this).toggleClass('shapeTextSelected')
        selectShape = $(this).attr('id');
    });

    $(document).on('click','.parentDiv',function (e) {
        e.preventDefault();
        if ( $('#setTextnew').hasClass('enable_set_text') ) {
            $("#parentDiv").find('.text-wrapper').removeClass('textSelected');
            set_plan_text(e);
        }
        if( $('#set_shape').hasClass('enable_set_shape' ) ){
            $("#parentDiv").find('.dynamicShape').removeClass('selectedShape');
            make_shape( e, selectShape );
        }

        if( copyData.length > 0 ){
            if( $('.copyPaste').hasClass('selectedPaste')){
                copy_data_display( copyData, e );
            }
        }

    });

    $('#setShapeColor').on('input', function ( e ) {
        e.preventDefault();
        const color = $("#setShapeColor").val();
        if (color)  $("#parentDiv").find('.dynamicShape.selectedShape').css("background-color", color);
    });

    $("#removeDynamicShape").on("click", function (e) {
        e.preventDefault();
        let this_shape = $("#parentDiv").find('.dynamicShape.selectedShape');
        removed_shape_data( this_shape, 'erase' );
        const color = $("#setShapeColor").val();
        if (color)  $("#parentDiv").find('.dynamicShape.selectedShape').remove();
        $(".dynamicShapeColorHolder").hide();
    });

    var copyData = [];

    $(document).on("click", ".shapeCopyStore", function (e) {
        copyData = [];
        e.preventDefault();
        let getShapeData = $("#parentDiv").find('.dynamicShape.selectedShape');
        removed_shape_data( getShapeData, 'copy' );
        alert('Your item is copied select the paste button and click where you want to paste.')
    });
    $(document).on("click", ".textCopy", function (e) {
        copyData = [];
        e.preventDefault();
        const copyTextDiv = $("#parentDiv").find('.text-wrapper.textSelected');
        removed_text_data( copyTextDiv, 'copy' );
        alert('Your item is copied select the paste button and click where you want to paste.');
    });
    $(document).on("click", ".seatCopyStore", function (e) {
        copyData = [];
        e.preventDefault();
        if( $("#set_single_select").hasClass('enable_single_seat_selection')){
            const copySeatDiv = $("#parentDiv").find('.childDiv.save.selected');
            removed_seat_data( copySeatDiv, 'copy' );
            alert('Your item is copied select the paste button and click where you want to paste.');
        }

    });

    $(document).on("click", ".shapeRotate", function (e) {
        e.preventDefault();
        let getShape = $("#parentDiv").find('.dynamicShape.selectedShape');
        let deg = parseInt(getShape.attr('data-shape-rotate')) || 0;
        let leftRight = $(this).attr('id'); // ID of the clicked button
        if (leftRight === 'shapeRotateRight') {
            deg += 10;
        } else if (leftRight === 'shapeRotateLeft') {
            deg -= 10;
        }
        getShape.css('transform', `rotate(${deg}deg)`);
        getShape.attr('data-shape-rotate', deg);
    });

    $(document).on( 'click', '.zoom-in', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const dynamicText =  $("#parentDiv").find('.text-wrapper.textSelected').children('.dynamic-text');
        const currentSize = parseInt(dynamicText.css('font-size'));

        if (!isNaN(currentSize)) {
            dynamicText.css('font-size', currentSize + 1 + 'px');
        }
    });

    $(document).on( 'click', '.zoom-out', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const dynamicText =  $("#parentDiv").find('.text-wrapper.textSelected').children('.dynamic-text');
        const currentSize = parseInt(dynamicText.css('font-size'));
        if (!isNaN(currentSize)) {
            dynamicText.css('font-size', currentSize - 1 + 'px');
        }
    });

    $(document).on( 'click', '.remove-text', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const dynamicText =  $("#parentDiv").find('.text-wrapper.textSelected').children('.dynamic-text');

        const textDiv = $("#parentDiv").find('.text-wrapper.textSelected');
        removed_text_data( textDiv, 'erase' );
        dynamicText.parent().remove();
    });

    $(document).on("click", ".textRotate", function (e) {
        e.preventDefault();
        let getText =$("#parentDiv").find('.text-wrapper.textSelected');
        let textDeg = parseInt(getText.attr('data-text-degree')) || 0;
        let leftRight = $(this).attr('id'); // ID of the clicked button
        if (leftRight === 'textRotateRight') {
            textDeg += 10;
        } else if (leftRight === 'textRotateLeft') {
            textDeg -= 10;
        }
        getText.css('transform', `rotate(${textDeg}deg)`);
        getText.attr('data-text-degree', textDeg);
    });

    $('#setTextColor').on('input', function ( e ) {
        e.preventDefault();
        const color = $("#setTextColor").val();
        const dynamicText =  $("#parentDiv").find('.text-wrapper.textSelected').children('.dynamic-text');
        if (color)  dynamicText.css("color", color);
    });
    function make_shape(e, shape_type) {
        const parentOffset = $('.parentDiv').offset();
        const x = e.pageX - parentOffset.left;
        const y = e.pageY - parentOffset.top;

        let width = 100;
        let height = 100;
        let borderRadius = '0';
        let shapeStyle = {};

        switch (shape_type) {
            case 'circle':
                borderRadius = '50%';
                break;
            case 'rectangle':
                width = 120;
                height = 80;
                break;
            case 'square':
                width = height = 80;
                break;
            case 'triangle':
                shapeStyle = {
                    width: '0',
                    height: '0',
                    borderLeft: '25px solid transparent',
                    borderRight: '25px solid transparent',
                    borderBottom: '50px solid #1e90ff',
                    backgroundColor: 'transparent',
                };
                break;
            case 'oval':
                width = 120;
                height = 80;
                borderRadius = '50%';
                break;
            case 'pentagon':
                shapeStyle = {
                    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
                };
                break;
            case 'hexagon':
                shapeStyle = {
                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
                };
                break;
            case 'rhombus':
                shapeStyle = {
                    clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
                };
                break;
            case 'parallelogram':
                shapeStyle = {
                    clipPath: 'polygon(25% 0%, 100% 0%, 75% 100%, 0% 100%)',
                };
                break;
            case 'trapezoid':
                shapeStyle = {
                    clipPath: 'polygon(25% 0%, 75% 0%, 100% 100%, 0% 100%)',
                };
                break;
            default:
                console.warn('Invalid shape_type:', shape_type);
                return;
        }
        const shape = $('<div class="dynamicShape" data-shape-rotate="0"></div>').css({
            left: x + 'px',
            top: y + 'px',
            width: width + 'px',
            height: height + 'px',
            backgroundColor: '#1e90ff',
            borderRadius: borderRadius,
            ...shapeStyle,
        });

        $('.parentDiv').append(shape);
        shape.toggleClass('selectedShape');
        if( $('#set_shape').hasClass('enable_set_shape' ) ){
            $('#set_shape').removeClass('enable_set_shape');
        }

        $(".dynamicShapeColorHolder").show();

        shape.draggable({ containment: '.parentDiv' });
        // if (!['triangle', 'pentagon', 'hexagon', 'rhombus', 'parallelogram', 'trapezoid'].includes(shape_type)) {
        shape.resizable({
            containment: '.parentDiv',
            minHeight: 20,
            minWidth: 20,
        });
        // }
    }

    let isShapeDragging = false;
    let addEnableSeat = true;
    $(document).on("click", ".dynamicShape", function (e) {
        const isAlreadySelected = $(this).hasClass('selectedShape');
        $("#parentDiv").find('.dynamicShape').removeClass('selectedShape');
        $("#parentDiv").find('.text-wrapper').removeClass('textSelected');
        $(".dynamicTextControlHolder").hide();
        $("#setPriceColorHolder").hide();
        if (!isAlreadySelected) {
            $(this).addClass('selectedShape');
            $(".dynamicShapeColorHolder").show();
            if (!$(this).data("initialized")) {
                $(this).resizable({
                    containment: '.parentDiv',
                    minHeight: 1,
                    minWidth: 1,
                });

                $(this).draggable({
                    containment: "#parentDiv",
                    start: function () {
                        isShapeDragging = true;
                        addEnableSeat = false;
                    },
                    drag: function (event, ui) {
                        const current = $(this);
                        const offsetX = ui.position.left - current.position().left;
                        const offsetY = ui.position.top - current.position().top;
                        if (isTextDragging) {
                            $(this).css({
                                top: current.position().top + offsetY + "px",
                                left: current.position().left + offsetX + "px",
                            });
                        }
                    },
                    stop: textDragDebounce(function () {
                        isDragging = false;
                        addEnableSeat = true;
                        console.log("Drag operation stopped.");
                    }, 300),
                });
                $(this).data("initialized", true);
            }
        } else {
            // Hide the color holder if the shape is deselected
            $(".dynamicShapeColorHolder").hide();
        }

        if( $('#removeSelected').hasClass( 'enable_erase_seat' )) {
            removed_shape_data( $(this), 'erase' );
            $(this).remove();
        };

    });
    function set_plan_text( e ){
        const parentOffset = $('.parentDiv').offset();
        const x = e.pageX - parentOffset.left;
        const y = e.pageY - parentOffset.top;
        const inputX = x;
        const inputY = y;
        const input = $('<input type="text" class="dynamic-input">').css({
            position: 'absolute',
            left: inputX,
            top: inputY,
            transform: 'translate(-50%, -50%)',
            width: '120px',
            zIndex: 999,
        });
        $('.parentDiv').append(input);
        input.focus().blur(function () {
            const text = $(this).val().trim(); // Trim to remove extra spaces
            if (text) {
                $("#parentDiv").find('.text-wrapper').removeClass('textSelected');
                $(".dynamicTextControlHolder").show();
                const textWrapper = $('<div class="text-wrapper textSelected" data-text-degree="0"></div>').css({
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

                $(this).replaceWith(textWrapper);
                textWrapper.append(textDisplay);

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
                if( $('#setTextnew').hasClass('enable_set_text') ){
                    $('#setTextnew').removeClass('enable_set_text');
                }
            } else {
                $(this).remove();
            }
        });
    }

    let isTextDragging = false;
    let selectedTextDraggableDivs = [];
    $(document).on("click", ".text-wrapper", function (e) {
        const isAlreadyTextSelected = $(this).hasClass('textSelected');
        $("#parentDiv").find('.text-wrapper').removeClass('textSelected');
        $("#parentDiv").find('.dynamicShape').removeClass('selectedShape');
        $(".dynamicShapeColorHolder").hide();
        $("#setPriceColorHolder").hide();

        if (!isAlreadyTextSelected) {
            $(this).addClass('textSelected');
            $(".dynamicTextControlHolder").show();
            if (!$(this).data("textInitialized")) {
                $(this).draggable({
                    containment: "#parentDiv",
                    start: function () {
                        isShapeDragging = true;
                        addEnableSeat = false;
                    },
                    drag: function (event, ui) {
                        const current = $(this);
                        const offsetX = ui.position.left - current.position().left;
                        const offsetY = ui.position.top - current.position().top;
                        if (isTextDragging) {
                            $(this).css({
                                top: current.position().top + offsetY + "px",
                                left: current.position().left + offsetX + "px",
                            });
                        }
                    },
                    stop: textDragDebounce(function () {
                        isDragging = false;
                        addEnableSeat = true;
                        console.log("Drag operation stopped.");
                    }, 300),
                });
                $(this).data("textInitialized", true);
            }
        } else {
            $(".dynamicTextControlHolder").hide();
        }

        if( $('#removeSelected').hasClass( 'enable_erase_seat' )) {
            removed_text_data( $(this), 'erase'  );
            $(this).remove();
        };
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

    /*$(document).on('change', '#seatIconUpload', function () {
        const file = this.files[0];
        const imageInfoDiv = $('#seatIconUpload');

        if (file) {
            const fileName = file.name;
            const fileSize = (file.size / 1024).toFixed(2);
            const fileType = file.type;

        } else {
            imageInfoDiv.html('<p>No file selected.</p>');
        }
    });*/

    $(document).on('change', '#seatIconUpload', function () {
        const file = this.files[0];
        const formData = new FormData();

        if ( file ) {
            formData.append('image', file);
            formData.append('action', 'image_upload');
            formData.append('nonce', ajax_object.nonce);
            $.ajax({
                url: ajax_object.ajax_url,
                type: 'POST',
                data: formData,
                contentType: false,
                processData: false,
                success: function (response) {
                    if (response.success) {
                        alert(response.data.message);
                        let image_link = `<img class="seatIcon" id="${response.data.image_name}" src="${response.data.file_url}" alt="Uploaded Image">`;
                        $('#seatIconHolder').prepend( image_link );
                    } else {
                        alert(response.data.message);
                    }
                },
                error: function () {
                    alert('An error occurred while uploading the image.');
                },
            });
        } else {
            alert('No file selected.');
        }
    });


});