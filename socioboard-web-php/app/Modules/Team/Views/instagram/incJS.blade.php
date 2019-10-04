<script>
    // infinite scroll
    var currentPage = 1;
    var pageLoadingProcessing = 0;

    $(document).ready(function () {
        loadPageContent(currentPage);
    });

    $(window).scroll(function () {
        if ($(window).scrollTop() >= $(document).height() - 1.5 * $(window).height()) {
            loadPageContent(currentPage);
        }
    });

    $(".post_cmt_btn").click(function () {
        $(".post_cmt_div").toggle();
    });

    // normal post emoji
    $("#normal_post_area").emojioneArea({
        pickerPosition: "right",
        tonesStyle: "bullet"
    });

    // all social list div open
    $(".all_social_div").css({
        display: "none"
    });
    $(".all_social_btn").click(function () {
        $(".all_social_div").css({
            display: "block"
        });
        $(".all_social_btn").css({
            display: "none"
        });
    });


//    $(document).on('click', '#re-socio-button', function () {
//        // feed the box
//
//        //var content = $(this).parent().find('div');
//        var content = $(this).parent().parent().parent();
//        //console.log(content.html());
//
//        var src = '';
//        var img = content.find('.feed_posted_image').attr('src');
//        var video = content.find('video').attr('src');
//        var text = content.find('.feed_posted_text').html();
//        var id = $(this).attr('data-id'); // embedded pin id
//
//        if (undefined !== img) {
//            src = img;
//            type = 'image';
//            };
//        if (undefined !== video) {
//            src = video;
//            type = 'video';
//            };
//
//        /*
//        console.log('ID = ' + id);
//        console.log('IMG = ' + img);
//        console.log('VIDEO = ' + video);
//        console.log('TEXT = ' + text);
//        */
//
//        //link
//        $('.modal-content button[data-role=send]').data('link', $(this).attr('data-link'));
//        // text
//        $('.modal-content').find('.emojionearea-editor').html(text);
//        // image
//
//        addExternalMediaToList(id, type, src, text);
//    });

</script>

<script>
    // add files and upload to server
    function addExternalMediaToList(id, type, src, text) {
        // show file in the list
        $('#media-list').prepend('<li class="media_for_upload" data-media-id="' + id + '"><img src="' + src + '" title="' + text + '" /></li>');

        // add CSS style for uploading process
        mediaUploadStarted($("#media-list li:first"), id);

        // upload sterting
        $.ajax({
            method: "POST",
            url: "/view-facebook-feeds/{{$account_id}}/postFiles",
            data: {
                teamId: {{Session::get('currentTeam')['team_id']}},
                name: id,
                src: src,
                type: type,
               // message: text,
            }
        })
            .done(function (req) {
                var msg = jQuery.parseJSON(req);
                console.log(msg);
                mediaUploadFinished(msg.localFileId, msg.path);
            });

    }
</script>


<script>
    function loadPageContent(pageNum) {
        // Ajax loading first content page

        if (pageLoadingProcessing != 1) {
            pageLoadingProcessing = 1;

            $.ajax({
                url: "/view-instagram-feeds/{{$account_id}}/" + pageNum,
            }).done(function (content) {
                if (content.length > 100) {// not empty result

                    $('.lazy_feeds_div').append(content);
                    pageLoadingProcessing = 0;
                    currentPage++;
                }
            });
        }
    }

    //onresocio
    $(document).on('click', '.resocio_btn', function () {
        $('.clearimag').remove();
        $('.post-thumb').remove();
//            var appenddata = "";
        var msg = "";
        msg = $(this).closest('.card').find('.insta-caption').text();
        imageLink = $(this).closest('.card').find('.insta-mediaUrl').text();
//            var img = imageLink.split(',');
//            console.log("split===",img);
//            console.log(img.length);
//            if (imageLink !== '') {
//                for (i = 0; i < img.length; i++) {
//                    appenddata += "<li class='clearimag' ><img width='100px' height='100px' src='" + img[i] + "' " +
//                            "title='" + img[i] + "' /><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);'  class='remove-pic'><i class='fa fa-times' ></i></a><div></div></div>";
//                }
//                $('#media-list').prepend(appenddata);
//            }
        $('#normal_post_area').data("emojioneArea").setText(msg);
        $("#link").attr("value", imageLink);

//            $('#reimage').attr('src', imageLink);

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
//            formData.append('imagevideos', image);
        formData.append('postStatus', postStatus);

        $.ajax({
            url: "/publish-data-discovery",
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            type: 'POST',
            beforeSend: function () {
//                    $('#messageError').text("");
//                    if (postStatus == 1) {
//                        $('#test').show();
//                        $('#testText').html('Uploading');
//                    } else if (postStatus == 0) {
//                        $('#draftspinstyle').show();
//                        $('#draftspin').html('Uploading');
//                    }
                $('#messageError').text("");
                $('#test').show();
                $('#testText').html('Uploading');
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