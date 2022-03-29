toastr.options = {
    "closeButton": true,
    "debug": false,
    "newestOnTop": false,
    "progressBar": false,
    "positionClass": "toast-top-right",
    "preventDuplicates": false,
    "onclick": null,
    "showDuration": "4000",
    "hideDuration": "1000",
    "timeOut": "5000",
    "extendedTimeOut": "1000",
    "showEasing": "swing",
    "hideEasing": "linear",
    "showMethod": "fadeIn",
    "hideMethod": "fadeOut",
};
iterator = 0;
$('#account_name').tooltip();
$('#twitter-tab-preview, #facebook-tab-preview, #linkedin-tab-preview').tooltip();
let twitterAccountsIds = ($("#twitterAccountsIds").data('list')) ? $("#twitterAccountsIds").data('list') : [];
let facebookAccountsIds = $("#facebookAccountsIds").data('list') ? $("#facebookAccountsIds").data('list') : [];
let linkedinAccountsIds = $("#linkedinAccountsIds").data('list') ? $("#linkedinAccountsIds").data('list') : [];
let instagramAccountsIds = $("#instagramAccountsIds").data('list') ? $("#instagramAccountsIds").data('list') : [];
let tumblrAccountsIds = $("#tumblrAccountsIds").data('list') ? $("#tumblrAccountsIds").data('list') : [] ;
let selectedAccountIds = ($("#selectedAccountIds").data('list')) ? $("#selectedAccountIds").data('list') : [];
selectedAccountIds = selectedAccountIds.map(x => +x);
let twitter = 0;
let facebook = 0;
let linkedin = 0;
$(document.body).on('click', '.check_social_account', function (e) {
    let append = '';
    twitter = 0;
    facebook = 0;
    linkedin = 0;
    instagram = 0;
    tumblr = 0;
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
    if (instagram > 0) {
        $('#insta_type').empty().append('Media is required for Instagram and multi-media posts are not supported for instagram');
        document.getElementById("accounttypes").value = "true";
    } else {
        $('#insta_type').empty();
        document.getElementById("accounttypes").value = "false";
    }
    textCountData();
    $('#facebook_preview_ids').show();

    if ((selectedAccountIds.length > 0)) {
        append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">';
        if (twitter > 0) {
            ((twitterAccountsIds.includes(Number(SelectedId)))) ?
                append += '<li class="nav-item">' +
                    '<a class="nav-link active" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview" aria-controls="Twitter">' +
                    '<span class="nav-text">Twitter</span></a></li>' :
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview" aria-controls="Twitter">' +
                    '<span class="nav-text">Twitter</span></a></li>';
        } else {
            append += '<li class="nav-item">' +
                '<a class="nav-link" id="twitter-tab-preview" aria-controls="Twitter" title="Please select Twitter account to enable the Preview">' +
                '<span class="nav-text">Twitter</span></a></li>';
            if (twitterAccountsIds.includes(Number(SelectedId))) deselectIds();
        }

        if (facebook > 0) {
            ((facebookAccountsIds.includes(Number(SelectedId)))) ?
                append += '<li class="nav-item">' +
                    '<a class="nav-link active" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
                    '<span class="nav-text">Facebook</span></a></li>' :
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
                    '<span class="nav-text">Facebook</span></a></li>';
        } else {
            append += '<li class="nav-item">' +
                '<a class="nav-link" id="facebook-tab-preview" title="please select Facebook account to enable the Preview">' +
                '<span class="nav-text">Facebook</span></a></li>';
            if (facebookAccountsIds.includes(Number(SelectedId))) deselectIds();
        }

        if (linkedin > 0) {
            ((linkedinAccountsIds.includes(Number(SelectedId)))) ?
                append += '<li class="nav-item">' +
                    '<a class="nav-link active" id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview" aria-controls="contact">' +
                    '<span class="nav-text">Linkedin</span></a></li>' :
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview" aria-controls="contact">' +
                    '<span class="nav-text">Linkedin</span></a></li>';
        } else {
            append += '<li class="nav-item">' +
                '<a class="nav-link" id="linkedin-tab-preview" title="please select Linkedin account to enable the Preview">' +
                '<span class="nav-text">Linkedin</span></a></li>';
            if (linkedinAccountsIds.includes(Number(SelectedId))) deselectIds();
        }

        if (instagram > 0) {
            ((instagramAccountsIds.includes(Number(SelectedId)))) ?
                append += '<li class="nav-item">' +
                    '<a class="nav-link active" id="instagram-tab-preview" data-toggle="tab" href="#instagram-preview">' +
                    '<span class="nav-text">Instagram</span></a></li>' :
                append += '<li class="nav-item">' +
                    '<a class="nav-link " id="instagram-tab-preview" data-toggle="tab" href="#instagram-preview">' +
                    '<span class="nav-text">Instagram</span></a></li>';
        } else {
            append += '<li class="nav-item">' +
                '<a class="nav-link" id="instagram-tab-preview" title="please select instagram account to enable the Preview">' +
                '<span class="nav-text">Instagram</span></a></li>';
            if (instagramAccountsIds.includes(Number(SelectedId))) deselectIds();
        }
        if (tumblr > 0) {
            ((tumblrAccountsIds.includes(Number(SelectedId)))) ?
                append += '<li class="nav-item">' +
                    '<a class="nav-link active" id="tumblr-tab-preview" data-toggle="tab" href="#tumblr-preview">' +
                    '<span class="nav-text">Tumblr</span></a></li>' :
                append += '<li class="nav-item">' +
                    '<a class="nav-link active" id="tumblr-tab-preview" data-toggle="tab" href="#tumblr-preview">' +
                    '<span class="nav-text">Tumblr</span></a></li>';
        } else {
            append += '<li class="nav-item">' +
                '<a class="nav-link" id="tumblr-tab-preview" title="please select tumblr account to enable the Preview">' +
                '<span class="nav-text">Tumblr</span></a></li>';
            if (tumblrAccountsIds.includes(Number(SelectedId))) deselectIds();
        }

        append += '</ul>';
    } else {
        append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
            '<li class="nav-item">' +
            '<a class="nav-link" id="twitter-tab-preview" aria-controls="Twitter" title="Please select Twitter account to enable the Preview">' +
            '<span class="nav-text">Twitter</span></a></li>' +
            '<li class="nav-item">' +
            '<a class="nav-link" id="facebook-tab-preview" title="please select Facebook account to enable the Preview">' +
            '<span class="nav-text">Facebook</span></a></li>' +
            '<li class="nav-item">' +
            '<a class="nav-link" id="linkedin-tab-preview" title="please select Linkedin account to enable the Preview">' +
            '<span class="nav-text">Linkedin</span></a></li>' +
            '<li class="nav-item">' +
            '<a class="nav-link" id="instagram-tab-preview" title="please select instagram account to enable the Preview">' +
            '<span class="nav-text">Instagram</span></a></li></ul>';
            '<a class="nav-link" id="tumblr-tab-preview" title="please select tumblr account to enable the Preview">' +
            '<span class="nav-text">Tumblr</span></a></li></ul>';
    }


    function deselectIds() {
        if ((twitter > 0)) {
            setTimeout(function () {
                $("#twitter-tab-preview").addClass(" active");
            }, 50);
        } else if (facebook > 0) {
            setTimeout(function () {
                $("#facebook-tab-preview").addClass(" active");
            }, 50);
        } else if (linkedin > 0) {
            setTimeout(function () {
                $("#linkedin-tab-preview").addClass(" active");
            }, 50);
        } else if (instagram > 0) {
            setTimeout(function () {
                $("#instagram-tab-preview").addClass(" active");
            }, 50);
        }
    }


    $('#social-preview-tabs').empty().append(append);
    $('#twitter-tab-preview, #facebook-tab-preview, #linkedin-tab-preview', '#instagram-tab-preview').tooltip();
});


$(document).ready(function () {
    $('.info-list .nav-link').on('click', function(){
        $('.info-list').find('.active').removeClass('active');
    })
    $('body').on('click', '.publishContentItemShareBtn', function (e) {
        e.preventDefault();
        publishOrFeeds = 1;
        let btn = $(this);
        btn.html("<i class='fa fa-spinner fa-spin'></i> One Click");
        btn.attr('disabled', 1);
        $('body').find('#resocioModal').modal('hide');
        $('body').find('#resocioModal').remove();

        let el = $(this).closest('.publishContentItem');
        let mediaUrl = el.data('media-url');
        let sourceUrl = el.data('source-url');
        let publisherName = el.data('publisher-name');
        let title = el.data('title');
        let description = el.data('description');
        let type = el.data('type');

        let action = '/discovery/content_studio/publish-content/modal';

        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            type: 'post',
            url: action,
            data: {
                mediaUrl: mediaUrl,
                sourceUrl: sourceUrl,
                publisherName: publisherName,
                title: title,
                description: description,
                type: type,
            },
            success: function (data) {
                btn.removeAttr('disabled');
                btn.html("<i class='far fa-hand-point-up fa-fw'></i> One Click");
                $('body').append(data.html);
                $('body').find('#resocioModal').modal('show');
                // begin:normal post emoji
                $('body').find("#normal_post_area").emojioneArea({
                    pickerPosition: "right",
                    tonesStyle: "bullet"
                });
                downloadMediaUrl('publishtype');
            },
            error: function (error) {
                btn.removeAttr('disabled');
                btn.html("<i class='far fa-hand-point-up fa-fw'></i> One Click");
                if (error.responseJSON.message) {
                    toastr.error(`${error.responseJSON.message}`);
                }
            },
        });
    });

    $(document).on('click', '.publishContentSubmit', function (e) {
        e.preventDefault();
        let btn = $(this);
        let btnText = btn.text()
        let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        btn.html("<i class='fa fa-spinner fa-spin'></i> Processing");
        btn.attr('disabled', 1);

        let form = $(this).parents('form'); //#publishContentForm
        let formData = new FormData($(form)[0]);
        formData.append('status', btn.val());
        formData.append('timezone', timezone);
        let method = $(form).attr('method');
        let action = $(form).attr('action');
        $('body').find('.error-message').html('');
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            type: method,
            url: action,
            data: formData,
            dataType: 'JSON',
            contentType: false,
            cache: false,
            processData: false,
            success: function (data) {
                btn.html(btnText);
                btn.removeAttr('disabled');
                $("#resocioModal").modal('hide');
                if (data.code === 422) {
                    toastr.error(data.message);
                } else if (data.code === 423) {
                    data.data.map(element => {
                        toastr.error('Daily limit of posting for account ' + element.first_name + ' is exceeded');
                    })
                } else if (data.status === "success"){
                    toastr.success(data.message);
                    location.reload();
                } else if(data.status === "error"){
                    toastr.error(data.error)
                }
                else {
                    toastr.error(data.error);
                }

                if (data.returnto == "1") {
                    window.location.href = "/calendar-view";
                } else if (data.type_text == "socioQueue") {
                    (data.type_value == 0 || data.type_value == "0") ? location.replace('' + APP_URL + 'home/publishing/schedule/ready-queue') : location.replace('' + APP_URL + 'home/publishing/schedule/day-wise-socioqueue');
                }
            },
            error: function (error) {
                btn.html(btnText);
                btn.removeAttr('disabled');
                if (error.status === 422) {
                    let errors = $.parseJSON(error.responseText);
                    $.each(errors, function (key, value) {
                        if ($.isPlainObject(value)) {
                            $.each(value, function (key, value) {
                                $("#error-" + key).html(`${value}`);
                                toastr.error(`${value}`);
                            });
                        }
                    });
                } else if (error.responseJSON.message && error.responseJSON.message.length > 0) {
                    if (error.responseJSON.error === "Cannot read property 'dayId' of null" || error.responseJSON.error === "Cannot read property 'length' of undefined") {
                        toastr.error("Schedule Type And Respective Date or Day, Timings fields required ");
                    } else {
                        toastr.error(error.responseJSON.error);
                    }
                } else {
                    toastr.error(error.message);
                }
            },
        });
    });

});

let descriptionText = "";
$(document).on('keyup', '.emojionearea', function (e) {
    e.preventDefault();
    if (publishOrFeeds !== 1) {
        textCountData();
    }
});


function textCountData() {
    if (selectedAccountIds.length > 0) {
        $("#errorText1").text('');
        let count = "";
        if (twitter > 0 && facebook === 0 && linkedin === 0 && instagram === 0 && tumblr=== 0) count = 280;
        else if (facebook > 0 && twitter === 0 && linkedin === 0 && instagram === 0) count = 5000;
        else if (linkedin > 0 && twitter === 0 && facebook === 0) count = 700;
        else if (twitter > 0 && facebook > 0 && linkedin === 0) count = 280;
        else if (twitter > 0 && linkedin > 0 && facebook === 0) count = 280;
        else if (facebook > 0 && linkedin > 0 && twitter === 0) count = 700;
        else if (twitter > 0 && facebook > 0 && linkedin > 0) count = 280;
        else if (twitter === 0 && facebook === 0 && linkedin === 0 && instagram > 0) count = 2200;
        else if (twitter === 0 && facebook === 0 && linkedin === 0 && instagram === 0 && tumblr > 0) count = 2200;
        else if (twitter === 0 && facebook > 0 && linkedin === 0 && instagram > 0 && tumblr === 0) count = 2200;
        else if (twitter > 0 && facebook === 0 && linkedin === 0 && instagram > 0) count = 280;
        else if (twitter === 0 && facebook > 0 && linkedin === 0 && instagram > 0 && tumblr > 0) count = 2200;
        if (Number($(".emojionearea-editor").text().length) <= count) {
            descriptionText = $(".emojionearea-editor").text();
        } else {
            $(".emojionearea-editor").text(descriptionText.substring(0, count));
        }
        let charCount = $(".emojionearea-editor").text().length;
        $("#errorText3").text(charCount + "/" + count);
    } else {
        $("#errorText3").text('');
        $(".emojionearea-editor").text(descriptionText);
        $(".emojionearea-editor").text('');
        $("#errorText1").text('please select atleast one social account .');
    }
}


// begin::sticky
var sticky = new Sticky('.sticky');
// end::sticky

// accounts list div open
$(".accounts-list-div").css({
    display: "none"
});
$(".accounts-list-btn").click(function () {
    $(".accounts-list-div").css({
        display: "block"
    });
});

// end:normal post emoji
// begin:images and videos upload
$(function () {
    var names = [];
    $("#hint_brand").css("display", "none");
    $("body").on("change", ".picupload", function (event) {

        var getAttr = $(this).attr("click-type");
        var files = event.target.files;
        if (files.length > 0) {
            $("body").find("#picupload").parent().children('i').removeClass('fa-plus').addClass('fa-spinner').addClass('fa-spin');
        }
        var output = document.getElementById("media-list");
        var z = 0;
        if (getAttr == "type1") {
            $("#media-list").html("");
            if (!(instagram > 0 && twitter === 0 && facebook === 0 && tumblr === 0 && linkedin === 0 )) {
                $("#media-list").html(
                    '<li class="myupload"><span><i class="fas fa-plus" aria-hidden="true"></i><input type="file" click-type="type2" id="picupload" class="picupload" title="Click to Add images" data-toggle="tooltip" multiple></span></li>'
                );
            }
            $('#picupload').tooltip();
            $("#hint_brand").css("display", "block");
            $("#option_upload").css("display", "none");
            for (var i = 0; i < files.length; i++) {
                $.ajaxSetup({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    }
                });

                var file = files[i];
                names.push($(this).get(0).files[i].name);
                if (file.type.match("image")) {
                    var formData = new FormData();
                    formData.append('file', file);
                    $.ajax({
                        url: '/discovery/content_studio/image/upload', // point to server-side PHP script 
                        dataType: 'text',  // what to expect back from the PHP script, if anything
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: formData,
                        type: 'post',
                        success: (r) => {
                            let response = JSON.parse(r); // display response from the PHP script, if any

                            $("body").find("#publishContentForm").append(`
                                <input type='hidden' name='mediaUrl[]' class='image${iterator}' value="${response.mdia_path}">
                            `);
                            iterator++;
                        }
                    });
                } else {
                    var formData = new FormData();
                    formData.append('file', file);
                    $.ajax({
                        url: '/discovery/content_studio/image/upload', // point to server-side PHP script 
                        dataType: 'text',  // what to expect back from the PHP script, if anything
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: formData,
                        type: 'post',
                        success: (r) => {
                            let response = JSON.parse(r); // display response from the PHP script, if any

                            $("body").find("#publishContentForm").append(`
                                <input type='hidden' name='videoUrl[]' class='image${iterator}' value="${response.mdia_path}">
                            `);
                            iterator++;
                        }
                    });
                }
            }
        } else if (getAttr == "type2") {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                names.push($(this).get(0).files[i].name);

                if (file.type.match("image")) {
                    var formData = new FormData();
                    formData.append('file', file);
                    $.ajax({
                        url: '/discovery/content_studio/image/upload', // point to server-side PHP script
                        dataType: 'text',  // what to expect back from the PHP script, if anything
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: formData,
                        type: 'post',
                        success: (r) => {
                            let response = JSON.parse(r); // display response from the PHP script, if any

                            if (response.type == 'image') {
                                $("body").find('.imageShow').append(`<img src='${response.media_url}' class='img-fluid image${iterator}' style="object-fit:contain;">`);

                                $("body").find("#media-list").prepend(`
                            <li>
                                <img src="${response.media_url}" style="object-fit:contain;">
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
                    // } else if (fileItem.type.match('video')) {
                } else {
                    var formData = new FormData();
                    formData.append('file', file);
                    $.ajax({
                        url: '/discovery/content_studio/image/upload', // point to server-side PHP script
                        dataType: 'text',  // what to expect back from the PHP script, if anything
                        cache: false,
                        contentType: false,
                        processData: false,
                        data: formData,
                        type: 'post',
                        success: (r) => {
                            let response = JSON.parse(r); // display response from the PHP script, if any
                            if (response.type == 'video') {
                                $("body").find('.imageShow').append(`<video style="width:100%; height:auto" controls class='video${iterator}'><source src="${response.media_url}"></source></video>`);

                                $("body").find("#media-list").prepend(`
                            <li>
                                <video width="100" height="100"
                                ><source src="${response.media_url}"></source></video>
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

    $("body").on("click", ".remove-pic", function () {
        $(this).parent().parent().parent().remove();
        let removeItem = $(this).attr('data-id');
        let lists = $('#media-list li').length;
        if (lists == 1) {
            $('.myupload').remove();
            $('#next_upload').empty().append('<small>Note: Add only 4 items at a single time.</small>\n' +
                '                                                    <ul class="btn-nav">\n' +
                '                                                        <li>\n' +
                '                                                            <span>\n' +
                '                                                                <i class="far fa-image fa-2x"></i>\n' +
                '                                                                <input type="file" name="" click-type="img-video-option" class="picupload"\n' +
                '                                                                    multiple accept=".jpg, .png .jpeg" />\n' +
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
        let image = `.image${+removeItem}`;
        let video = `.video${+removeItem}`;
        $("body").find(image).remove()
        $("body").find(video).remove()
    });

    $("#hint_brand").on("hide", function (e) {
        names = [];
        z = 0;
    });


});
// end:images and videos upload

downloadMediaUrl = function (feedtype) {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });
    let passedMediaUrl = $('body').find('input#media_url');
    if (passedMediaUrl.length) {
        $.ajax({
            url: '/discovery/content_studio/media/download', // point to server-side PHP script 
            dataType: 'json',  // what to expect back from the PHP script, if anything
            data: {'mediaUrl': passedMediaUrl.val(), 'feedtype': feedtype},
            type: 'post',
            success: (response) => {
                $("body").find('.defaultImage').remove();
                if (response.type == 'image') {
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
}

// end:images and videos upload
