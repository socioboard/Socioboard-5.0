<script type="text/javascript" src="/assets/plugins/scrollbar/jquery.mCustomScrollbar.concat.min.js"></script>
<script type="text/javascript" src="/assets/js/jquery.cookie.js"></script>
<script async defer src="https://connect.facebook.net/en_US/sdk.js"></script>

<script>
    window.fbAsyncInit = function () {
        FB.init({
            //xfbml: true,
            version: 'v3.1',
            appId: 730896073595509,
            autoLogAppEvents: true,
            //data-show-text: true
        });
    };
</script>

<script>
    // infinite scroll
    var currentPage = 1;
    var pageLoadingProcessing = 0;

    $(document).ready(function () {
        loadPageContent(currentPage);
    });
</script>


<script>
    // infinite scroll
    $(window).scroll(function () {
        if ($(window).scrollTop() >= $(document).height() - 1.5 * $(window).height()) {
            loadPageContent(currentPage);
        }
    });

    function loadPageContent(pageNum) {
        // Ajax loading first content page
        if (pageLoadingProcessing != 1) {
            pageLoadingProcessing = 1;

            $.ajax({
                url: "/view-facebook-feeds/{{$account_id}}/" + pageNum,
            }).done(function (content) {

                if (content.length > 100) {// not empty result
                    $('.lazy_feeds_div').append(content);
                    pageLoadingProcessing = 0;
                    currentPage++;
                    // renew FB objects
                    FB.XFBML.parse();
                    //FB.XFBML.parse(document.getElementById('ddd'));
                    //FB.XFBML.parse(document.getElementsByClassName('fb-post'));
                }
            });
        }
    }

    $(document).on('click', '.resocio_btn', function () {
        $('.clearimag').remove();
        $('.post-thumb').remove();
        var msg = "";
        msg = $(this).closest('.facebook-container').find('.fb-description').text();
        imageLink = $(this).closest('.facebook-container').find('.fb-mediaUrl').attr('data-url');
        $('#normal_post_area').data("emojioneArea").setText(msg);
        if(imageLink !== "") $("#link").attr("value", imageLink);

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
