{{--<script>--}}
    function onLoadImage(page, type) {
        $.ajax({
            url: "/image-library/" + type,
            type: 'POST',
            data: {
                pageId: page
            },
            beforeSend: function () {
                $("#bootLoader").css("display", "block");
                {{--$('#memory').text("");--}}
                appendData ="";
//                    $('#memory').append(memory);
            },
            success: function (response) {
                /*
                 * 200 => success
                 * 500 => Something went wrong(Exception)
                 * 400 => Access denied*/
                $("#bootLoader").css("display", "none");
                if (response.data.length === 0 && pageId === 1) {
                    $('#noData').text("No images uploaded yet");
                    action = "active";
                    //integrate a no account image if asked

                }

                if(pageId == 1){
                    var memory = ' [ Total Used Space - <b class="text-primary" ><small>' +(response.usedSize).toFixed(2) + ' MB</small>/ ' + Math.round(response.totalSize) + 'MB </b> ]'
                    $('#memory').append(memory);
                }
                pageId += 1;
                if (response.data.length !== 0) {
                    action = "inactive";

                }
                if (response.code == 200) {
                    $.each(response.data, function (key, value) {
                        var stringData = JSON.stringify(value);
                        var chk = stringData.replace(/\s/g, '__');


//                            if(value.m)
                        appendData += ' <div class="card border-light"> <img src="{{env('API_URL_FEEDS')}}' + value.media_url + '" id="imageDet" data-id=' + chk + ' class="card-img-top" alt="..." data-toggle="modal" data-target="#viewImgModal" />' +
                                ' <div class="text-center p-1"> ' +
                                '<a class="btn btn-sm btn-primary clickImage"  data-id=' + value.media_url + ' href="#" data-toggle="modal" data-target="#postModal"> ' +
                                '<i class="far fa-hand-pointer"></i> 1-click</a> <a class="btn btn-sm btn-danger" href="{{env('APP_URL')}}media-delete/' + value.id + '" > ' +
                                '<i class="far fa-trash-alt"></i> Delete</a> </div> ' +
                                '</div>'
                    });
                    $('#media').append(appendData);
                }




            },
            error: function (error) {
                console.log(error)
//                    $('#error').text("Something went wrong.. Not able to create team");
            }
        });
    }
    $(window).scroll(function () {
//            return false;
        if (($(window).scrollTop() + $(window).height()) >= $("#media").height() && action == 'inactive') {
//                    $('#load_popular_message').html("<button class='btn btn-primary' id='load-popular-button'>Click to get more coupons</button>");
            action = 'active';

            setTimeout(function () {
                onLoadImage(pageId, imageType);

            }, 1000);
        }
    });


    function deleteMedia(mediaId) {
        $.ajax({
            url: "/media-delete",
            type: 'POST',
            data: {
                mediaId: mediaId,
                isForceDelete: 1 // always force delete
            },
            beforeSend: function () {
            },
            success: function (response) {
                /*
                 * 200 => success
                 * 500 => Something went wrong(Exception)
                 * 400 => Access denied*/

                if (response.code == 200) {
                    swal("media deleted successfully");
                } else {
                    swal("media deletion failed");
                }

            },
            error: function (error) {
                console.log(error)
                swal("media deletion failed");
            }
        });
    }


    function uploadMedia(privacy) {

        var form = document.getElementById('uploadMediaForm');
        var formData = new FormData(form);
        $.ajax({
            url: "/upload-media/" + privacy,
            data: formData,
            cache: false,
            processData: false,
            contentType: false,
            type: 'POST',
            beforeSend: function () {
                $('#mediaError').text("");
                $('#titleError').text("");

            },
            success: function (response) {
                /*
                 * 200 => success
                 * 500 => Something went wrong(Exception)
                 * 400 => Access denied*/
                console.log(response);
                if (response.code == 200) {
                    swal(response.message);
                    setTimeout(function () {
                        location.reload();
                    }, 1500);
                } else if (response.code == 400) {
                    if (response.error['media'] != null) {
                         document.getElementById('error-title').innerHTML = response.error['title'];
                    }
                    if (response.error['title'] != null) {
                         document.getElementById('error-image').innerHTML =response.error['media'];

                    }
                } else {
                    swal(response.message);
                }

            },
            error: function (error) {
                console.log(error)

//                    $('#error').text("Something went wrong.. Not able to create team");
            }
        })
    }
    $(document).on('click', '#imageDet', function () {
        var url = $(this).data('id');
        var media = '<?php echo env('API_URL_FEEDS'); ?>' + url.media_url;
        var title = url.title.replace(/__/g, " ")
        var size = Math.floor(url.media_size / 1024) + " KB";
        var privacy = "private";
        if (url.privacy_type == 0) {
            privacy = "public";
        }
        $('#imgModal').attr('src', media);
        $('#nameModal').text(title);
        $('#socioModal').attr('data-id', url.media_url);
        $('#dateModal').text(url.created_date.split("__")[0]);
        $('#privacyModal').text(privacy);
        $('#sizeModal').text(size);
    });
{{--</script>--}}