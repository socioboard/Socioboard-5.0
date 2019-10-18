<script>
    $(document).on("click", ".open-createPinBoardModal", function () {
        var accountId = document.getElementById('accountID').innerHTML;
        console.log(accountId);
        document.getElementById('accId').innerHTML = accountId;
        console.log(document.getElementById('accId').innerHTML);
    });


    $(document).on("click", "#pinCreate",function(){
        var account_id = document.getElementById('accId').innerHTML;
        var boardName = document.getElementById('boardname').value;
        var boardDesc = document.getElementById('decsription').value;
        console.log(account_id,boardName,boardDesc);
        $.ajax({
                url: "/pin-board-create",
                type: 'GET',
                data: {
                    accountId:account_id,
                    boardName:boardName,
                    boardDesc: boardDesc
                },
                beforeSend:function(){

                },
                success: function (response) {
                    if(response.code == 200){
                        console.log(response);
                        swal("Board created successfully..");
                        $('#createPinBoardModal').modal('hide');
                        $("#boardCreate").trigger("reset");
                    }else{
                        swal("Could not create board..Try again after some time");
                        $('#createPinBoardModal').modal('hide');
                        $("#boardCreate").trigger("reset");
                    }
                },
                error:function(error){
                    console.log(error)
                    $('#createPinBoardModal').modal('hide');
                    $("#boardCreate").trigger("reset");
                }
            })
    })


    // fo load start page
    currentPage = $('.nav-board').attr('data-boardId');

    $(document).on('click', '.nav-board', function () {
        var accountId = $(this).attr('data-AccountId');
        var pageId = $(this).attr('data-boardId');

        $('.lazy_feeds_div').html('loading...');
        document.location.href = '/view-pinterest-feeds/' + accountId + '/' + pageId + '';
    });

    $(document).on('click', '#re-socio-button', function () {
//        // feed the box
//        var content = $(this).parent().parent().parent().parent().find('div').first();
//        var className = content.find('span').attr('class');
//        var classStr = className.split('_');
//        var id = classStr[1]; // embedded pin id
//        var text = content.find('span [class=PIN_' + id + '_description]').html();
//        var src = content.find('span [class=PIN_' + id + '_img]').attr('data-pin-src');
//        var link = content.find('span [class=PIN_' + id + '_img]').attr('data-pin-href');
//        var type = 'Image';
//        //link
//        $('.modal-content button[data-role=send]').data('link', link);
//
//        // text
//        //$('#socialDoubledContainer').html( text);
//        $('.modal-content').find('.emojionearea-editor').html(text);
//
//        // image
//        addExternalMediaToList(id, type, src, text);
//        //$('#media-list').prepend('<li class="media_for_upload" data-media-id="'+id+'" data-media-path="'+img+'"><img src="'+img+'" title="'+text+'" /></li>');


        $('.clearimag').remove();
        $('.post-thumb').remove();
        var msg = "";
         imageLink = $(this).closest('.card').find('#pinterest-link').attr('data-link');
        msg = $(this).closest('.card').find('#pinterest-note').attr('data-note');
        console.log(msg,imageLink);
        $('#normal_post_area').data("emojioneArea").setText(msg);
        if(imageLink !== "") $("#link").attr("value", imageLink);

//            $('#reimage').attr('src', imageLink);

        $('#incpostModal').modal('show');
    });

    function deleteBoard(accId, brdId){
        console.log(accId,brdId);
        $.ajax({
            url: "/pin-board-delete",
            type: 'GET',
            data: {
                accountId:accId,
                boardId:brdId
            },
            beforeSend:function(){

            },
            success: function (response) {
                if(response.code == 200){
                    console.log(response);
                    swal("Board deleted..");
                    setTimeout(function() {
                        location.reload();
                    }, 1000);

                }else{
                    swal("Could not delete board..Try again after some time");
                    setTimeout(function() {
                        location.reload();
                    }, 1000);
                }
            },
            error:function(error){
                console.log(error)
            }
        })
    }

    function post(postStatus) {
        var form = document.getElementById('publishForm');

        var formData = new FormData(form);


        var selected = [];
        $('#checkboxes input:checked').each(function () {
            selected.push($(this).attr('name'));
        });
        formData.append('checked', selected);
//        formData.append('imagevideos', image);
        formData.append('postStatus', postStatus);

        $.ajax({
            url: "/publish-data-discovery",
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            type: 'POST',
            beforeSend: function () {
                $('#messageError').text("");
                if (postStatus == 1) {
                    $('#test').show();
                    $('#testText').html('Uploading');
                } else if (postStatus == 0) {
                    $('#draftspinstyle').show();
                    $('#draftspin').html('Uploading');
                }
            },
            success: function (response) {

                $('#test').hide();
                $('#testText').html('Post');

//                document.getElementById("publishForm").reset();
                $('#publishForm').trigger("reset");
//                        $(".emojionearea-editor").text("");
                $("#hint_brand").css("display", "none");
//                        $("#option_upload").css("display","block");
                $("#test").attr("disabled", true);
                if (response.code == 404) {
//                        console.log(response.message)
                    $('#messageError').text(response.message);
                } else if (response.code == 400) {
                    swal(response.message);
                } else if (response.code == 200) {
                    $(".emojionearea-editor").text("");
                    swal(response.message);

                    if (response.errors.length != 0) {
                        $.each(response.errors, function (key, value) {
                            console.log(value.error);
                            $.toaster({
                                priority: 'warning',
                                title: 'Could not publish on account',
                                message: ' ' + value.firstName + ' ' + value.error
                            })
                            ;
                        });
                    }

                    document.getElementById("publishForm").reset();
                    $('#incpostModal').modal('hide');
                } else if (response.code == 500) {
                    console.log(response.message);
                    swal("Something went wrong... Please try again after sometime")
                    $('#incpostModal').modal('hide');

                }
            },
            error: function (error) {
                console.log(error)
                swal("Something went wrong... Please try again after sometime")
                $('#incpostModal').modal('hide');
            }
        })
    }


</script>



