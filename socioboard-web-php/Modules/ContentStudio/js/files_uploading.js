iterator = 11111111;
// Schedule post div open
$(".schedule-div").css({
    display: "none"
});
$(".schedule-post-btn").click(function() {
    $(".schedule-div").css({
        display: "block"
    });
});


// begin:normal post emoji
$("#normal_post_area").emojioneArea({
    pickerPosition: "right",
    tonesStyle: "bullet"
});
// end:normal post emoji
// begin:images and videos upload

$(function () {
    var names = {};
    $('#hint_brand').css("display", "none");
    $(document).on('change', '.picupload', function (event) {
        $('#hint_brand').css('display', 'block');
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        var getAttr = $(this).attr('click-type');
        var files = event.target.files;
        var output = document.getElementById("media-list");
        var z = 0;
        if (getAttr == 'img-video-option') {
            $('#media-list').html('');
            $('#media-list').html('<div><li class="myupload"><span><i class="fa fa-plus" aria-hidden="true"></i><input type="file" click-type="img-video-upload" id="picupload" class="picupload" title="Click to Add File" data-toggle="tooltip" multiple accept="video/*,.jpg, .png, .jpeg" style="width: 100px"></span></li></div>');
        }
        if (getAttr == 'img-video-option' || getAttr == 'img-video-upload'){
            // $('#hint_brand').css("display", "block");
            $('#option_upload').css("display", "none");
            
            for (var fileKey = 0; fileKey < files.length; fileKey++) {
                var checkIsUploaded = false;
                var fileItem = files[fileKey];

                names[iterator] = $(this).get(0).files[fileKey].name;
                if (fileItem.type.match('image')) {
                    var form_data = new FormData(); 
                    form_data.append('file', fileItem);

                    $.ajax({
                        url: '/discovery/content_studio/image/upload', // point to server-side PHP script 
                        dataType: 'text',  // what to expect back from the PHP script, if anything
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: form_data,                         
                        type: 'post',
                        success: (r)=>{
                            checkIsUploaded = true;
                            let response = JSON.parse(r); // display response from the PHP script, if any
                            // $('#picupload').tooltip();
                            checkIsUploaded = true
                            $("body").find('.defaultImage').remove();

                            if(response.type == 'image'){
                                $("body").find('.imageShow').prepend(`<img src='${response.media_url}' class='img-fluid image${iterator}' style="object-fit:contain;">`);

                                $("body").find("#media-list").prepend(`
                                    <li>
                                        <img src="${response.media_url}">
                                        <div class="post-thumb">
                                            <div class="inner-post-thumb">
                                                <a href="javascript:void(0);" class="remove-pic" data-id=${iterator}>
                                                    <i class="fa fa-times" aria-hidden="true"></i>
                                                </a>
                                            </div>
                                        </div>
                                    </li>
                                `)

                                $("body").find("#publishContentForm").append(`
                                    <input type='hidden' name='mediaUrl[]' class='image${iterator}' value="${response.mdia_path}">
                                `);

                                $("body").find("#picupload").parent().children('i').removeClass('fa-spinner').removeClass('fa-spin').addClass('fa-plus')
                                iterator++
                            }
                        }
                    });
                                               
                } else if(fileItem.type.match('video')) {
                    var form_data = new FormData();                  
                    form_data.append('file', files[0]);
                    $.ajax({
                        url: '/discovery/content_studio/video/upload', // point to server-side PHP script 
                        dataType: 'text',  // what to expect back from the PHP script, if anything
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: form_data,                         
                        type: 'post',
                        success: (r)=>{
                            $("body").find('.defaultImage').remove();
                            let response = JSON.parse(r); // display response from the PHP script, if any

                            if(response.type == 'video'){
                                $("body").find('.imageShow').prepend(`<video style="width:100%; height:auto" controls class='video${iterator}'><source src="${response.media_url}"></source></video>`);
                                
                                $("body").find("#media-list").prepend(`
                                    <li>
                                        <video style="width:100%; height:auto" ><source src="${response.media_url}"></source></video>
                                        <div class="post-thumb">
                                            <div class="inner-post-thumb">
                                                <a href="javascript:void(0);" class="remove-pic" data-id=${iterator}>
                                                    <i class="fa fa-times" aria-hidden="true"></i>
                                                </a>
                                            </div>
                                        </div>
                                    </li>
                                `)
                                $("body").find("#picupload").parent().children('i').removeClass('fa-spinner').removeClass('fa-spin').addClass('fa-plus')

                                $("body").find("#publishContentForm").append(`
                                    <input type='hidden' name='videoUrl[]' class='video${iterator}' value="${response.mdia_path}">
                                `);
                                iterator++
                            }
                        }
                    });
                }
            }
        } 
    });

    $('body').on('click', '.remove-pic', function () {
        $(this).parent().parent().parent().remove();
        var removeItem = $(this).attr('data-id');
        var yet = names.indexOf(removeItem);
        if (yet != -1) {
            names.splice(yet, 1);
        }
        // return array of file name
    });
    $('#hint_brand').on('hide', function (e) {
        names = [];
        z = 0;
    });
});

$(document).ready(function(){
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    let passedMediaUrl = $('input#media_url');
    if(passedMediaUrl.length){
        $.ajax({
            url: '/discovery/content_studio/media/download', // point to server-side PHP script 
            dataType: 'json',  // what to expect back from the PHP script, if anything
            data: { 'mediaUrl' : passedMediaUrl.val() },
            type: 'post',
            success: (response)=>{
                $("body").find('.defaultImage').remove();
                if(response.type == 'image'){
                    $("body").find('.imageShow').append(`<img src='${response.media_url}' class='img-fluid image${iterator}' style="object-fit:contain;">`);
                }
                $("body").find("#publishContentForm").append(`
                    <input type='hidden' name='mediaUrl[]' class='image${iterator}' value="${response.mdia_path}">
                `);
                iterator++;
            }
        });
    }
    passedMediaUrl.remove();
});
// end:images and videos upload