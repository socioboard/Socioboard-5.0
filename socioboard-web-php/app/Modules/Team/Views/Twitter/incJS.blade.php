<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

<script type="text/javascript">

    var currentPage = 1;
    var pageLoadingProcessing = 0;

    $(document).ready(function () {
        // infinite scroll
        loadPageContent(currentPage);

        // comments div open
        $(".post_cmt_div").hide();


        // like toogle
        $(this).on("click", ".button-like", function () {
            $(this).toggleClass("liked");
        });


        // infinite scroll
        $(window).scroll(function () {
            if ($(window).scrollTop() >= $(document).height() - 1.5 * $(window).height()) {
                loadPageContent(currentPage);
            }
        });


        $(document).on('click', '#re-socio-button', function () {
            // feed the box
            var content = $(this).parent().parent().parent().parent().find('div').first();
            /*
            var className = content.find('span').attr('class');
            var classStr = className.split('_');
            var id = classStr[1]; // embedded pin id
            var text = content.find('span [class=PIN_' + id + '_description]').html();
            var src = content.find('span [class=PIN_' + id + '_img]').attr('data-pin-src');
            var link = content.find('span [class=PIN_' + id + '_img]').attr('data-pin-href');
            var type = 'Image';
            //link
            $('.modal-content button[data-role=send]').data('link', link);

            // text
            //$('#socialDoubledContainer').html( text);
            $('.modal-content').find('.emojionearea-editor').html(text);

            // image
            addExternalMediaToList(id, type, src, text);
            //$('#media-list').prepend('<li class="media_for_upload" data-media-id="'+id+'" data-media-path="'+img+'"><img src="'+img+'" title="'+text+'" /></li>');
       */
        });


    });


    $(document).on('click', '#re-socio-button', function () {
        // feed the box
        var content = $(this).parent().parent().parent().parent().find('div').first();
        var className = content.find('span').attr('class');
        var classStr = className.split('_');
        var id = classStr[1]; // embedded pin id
        var text = content.find('span [class=PIN_' + id + '_description]').html();
        var src = content.find('span [class=PIN_' + id + '_img]').attr('data-pin-src');
        var link = content.find('span [class=PIN_' + id + '_img]').attr('data-pin-href');
        var type = 'Image';
        //link
        $('.modal-content button[data-role=send]').data('link', link);

        // text
        //$('#socialDoubledContainer').html( text);
        $('.modal-content').find('.emojionearea-editor').html(text);

        // image
        addExternalMediaToList(id, type, src, text);
        //$('#media-list').prepend('<li class="media_for_upload" data-media-id="'+id+'" data-media-path="'+img+'"><img src="'+img+'" title="'+text+'" /></li>');
    });


    function loadPageContent(pageNum) {
        // Ajax loading first content page
        if (pageLoadingProcessing != 1) {
            pageLoadingProcessing = 1;
            $.ajax({
                url: "/view-twitter-feeds/{{$account_id}}/" + pageNum,
            }).done(function (content) {
                if (content.length > 100) {// not empty result
                    $('.lazy_feeds_div').append(content);
                    pageLoadingProcessing = 0;
                    currentPage++;
                }
            });
        }
    }
    $(document).on('click', '.resocio_btn', function () {
        $('.clearimag').remove();
        $('.post-thumb').remove();
        var appenddata = "";
        var msg = "";
        var i = 1;
        msg = $(this).closest('.card').find('.tweet-description').text();
        image = $(this).closest('.card').find('.tweet-mediaUrl').attr('id');
        var img = image.split(',');
        if (image !== '') {
            for (i = 0; i < img.length; i++) {
                appenddata += "<li class='clearimag' ><img width='100px' height='100px' src='" + img[i] + "' " +
                        "title='" + img[i] + "' /><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);'  class='remove-pic'><i class='fa fa-times' ></i></a><div></div></div>";
            }
            $('#media-list').prepend(appenddata);
        }
            $('#normal_post_area').data("emojioneArea").setText(msg);




        $('#reimage').attr('src', image);

        $('#incpostModal').modal('show');

    });

    function post(postStatus) {
        var form = document.getElementById('publishForm');

        var formData = new FormData(form);


        var selected = [];
        $('#checkboxes input:checked').each(function () {
            selected.push($(this).attr('name'));
        });
        formData.append('checked', selected);
        formData.append('imagevideos', image);
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
