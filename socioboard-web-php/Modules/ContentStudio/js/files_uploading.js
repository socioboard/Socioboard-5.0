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
    let names = {};
    $('#hint_brand').css("display", "none");
    let twitterAccountsIds = $("#twitterAccountsIds").data('list');
    let facebookAccountsIds = $("#facebookAccountsIds").data('list');
    let linkedinAccountsIds = $("#linkedinAccountsIds").data('list');
    let instagramAccountsIds = $("#instagramAccountsIds").data('list');
    let tumblrAccountsIds = $("#tumblrAccountsIds").data('list');
    let selectedAccountIds = ($("#selectedAccountIds").data('list')) ? $("#selectedAccountIds").data('list') : [];
    selectedAccountIds = selectedAccountIds.map(x => +x);
    let twitter = 0; let facebook = 0; let linkedin = 0; let instagram = 0; let tumblr = 0;
    $(document.body).on('click', '.check_social_account', function (e) {
        let append = '';
        SelectedId = "";
        if ($(this).is(':checked')) {
            selectedAccountIds.push(Number($(this).attr('acc_id')));
            SelectedId = Number($(this).attr('acc_id'));
        } else {
            let index = selectedAccountIds.indexOf(Number($(this).attr('acc_id')));
            SelectedId = Number($(this).attr('acc_id'));
            if (index > -1) {
                selectedAccountIds.splice(index, 1);
            }
        }
        selectedAccountIds.forEach(function (ids) {
            if ((selectedAccountIds.length > 0) && (twitterAccountsIds.includes(Number(ids)))) twitter++;
            if ((selectedAccountIds.length > 0) && (facebookAccountsIds.includes(Number(ids)))) facebook++;
            if ((selectedAccountIds.length > 0) && (linkedinAccountsIds.includes(Number(ids)))) linkedin++;
            if ((selectedAccountIds.length > 0) && (instagramAccountsIds.includes(Number(ids)))) instagram++;
            if ((selectedAccountIds.length > 0) && (tumblrAccountsIds.includes(Number(ids)))) tumblr++;
        });
    });

    $(document).on('change', '.picupload', function (event) {
        $('#hint_brand').css('display', 'block');
        $.ajaxSetup({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            }
        });
        let getAttr = $(this).attr('click-type');
        let files = event.target.files;
        let output = document.getElementById("media-list");
        let z = 0;

        if (getAttr == 'img-video-option' || getAttr == 'img-video-upload'){
            // $('#hint_brand').css("display", "block");
            $('#option_upload').css("display", "none");
            $('#next_upload').empty();

            for (let fileKey = 0; fileKey < files.length; fileKey++) {
                let checkIsUploaded = false;
                let fileItem = files[fileKey];

                names[iterator] = $(this).get(0).files[fileKey].name;
                if (fileItem.type.match('image')) {
                    let form_data = new FormData();
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
                                if (getAttr == 'img-video-option') {
                                    $('#media-list').html('');
                                    if (!((instagram > 0 || linkedin> 0) && twitter === 0 && facebook === 0 && tumblr === 0 )) {
                                        $('#media-list').html('<div><li class="myupload"><span><i class="fa fa-plus" aria-hidden="true"></i><input type="file" click-type="img-video-upload" id="picupload" class="picupload" title="Click to Add File" data-toggle="tooltip" multiple accept=".jpg, .png, .jpeg" style="width: 100px"></span></li></div>');
                                    } else {
                                        $('#media-list').html('<div><li class="myupload"><span></div>');
                                    }
                                }

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
                    let form_data = new FormData();
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
                                if (getAttr == 'img-video-option') {
                                    $('#media-list').html('');
                                    if (!((instagram > 0 || linkedin> 0) && twitter === 0 && facebook === 0 && tumblr === 0 )) {
                                        $('#media-list').html('<div><li class="myupload"><span><i class="fa fa-plus" aria-hidden="true"></i><input type="file" click-type="img-video-upload" id="picupload" class="picupload" title="Click to Add File" data-toggle="tooltip" multiple accept="video/*" style="width: 100px"></span></li></div>');
                                    } else {
                                        $('#media-list').html('<div><li class="myupload"><span></div>');
                                    }
                                }
                                
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
        let removeItem = $(this).attr('data-id');
        let lists = $('#media-list li').length;
        if (lists == 1){
            $('.myupload').remove();
            $('#next_upload').empty().append('<small>Note: Add only 4 items at a single time.</small>\n' +
                '                                                    <ul class="btn-nav">\n' +
                '                                                        <li>\n' +
                '                                                            <span>\n' +
                '                                                                <i class="far fa-image fa-2x"></i>\n' +
                '                                                                <input type="file" name="" click-type="img-video-option" class="picupload"\n' +
                '                                                                    multiple accept=".jpg, .jpeg" />\n' +
                '                                                            </span>\n' +
                '                                                        </li>\n' +
                '                                                        <li>\n' +
                '                                                            <span>\n' +
                '                                                                <i class="fas fa-video fa-2x"></i>\n' +
                '                                                                <input type="file" name="" click-type="img-video-option" class="picupload"\n' +
                '                                                                    multiple accept="video/*" />\n' +
                '                                                            </span>\n' +
                '                                                        </li>\n' +
                '                                                    </ul>');
        }

        let yet = names.indexOf(removeItem);
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