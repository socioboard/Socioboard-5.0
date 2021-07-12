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

$('#twitter-tab-preview, #facebook-tab-preview, #linkedin-tab-preview').tooltip();
let twitterAccountsIds = $("#twitterAccountsIds").data('list');
let facebookAccountsIds = $("#facebookAccountsIds").data('list');
let linkedinAccountsIds = $("#linkedinAccountsIds").data('list');
let selectedAccountIds = ($("#selectedAccountIds").data('list')) ? $("#selectedAccountIds").data('list') : [];
selectedAccountIds = selectedAccountIds.map(x => +x);
$(document.body).on('click', '.check_social_account', function (e) {
    let append = '';
    let twitter = 0;
    let facebook = 0;
    let linkedin = 0;
    if ($(this).is(':checked')) {
        selectedAccountIds.push(Number($(this).attr('acc_id')));
    } else {
        let index = selectedAccountIds.indexOf(Number($(this).attr('acc_id')));
        if (index > -1) {
            selectedAccountIds.splice(index, 1);
        }
    }
    selectedAccountIds.forEach(function (ids) {
        if ((selectedAccountIds.length > 0) && (twitterAccountsIds.includes(Number(ids)))) twitter++;
        if ((selectedAccountIds.length > 0) && (facebookAccountsIds.includes(Number(ids)))) facebook++;
        if ((selectedAccountIds.length > 0) && (linkedinAccountsIds.includes(Number(ids)))) linkedin++;
    });
    $('#facebook_preview_ids').show();
    if ((selectedAccountIds.length > 0) && (twitter > 0) || (facebook > 0) || (linkedin > 0)) {
        if((twitter > 0) && (facebook === 0) && (linkedin === 0)) {
                append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                    '<li class="nav-item">' +
                    '<a class="nav-link active" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview" aria-controls="Twitter">' +
                    '<span class="nav-text">Twitter</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="facebook-tab-preview" title="please select Facebook account to enable the Preview">'+
                    '<span class="nav-text">Facebook</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="linkedin-tab-preview" title="please select Linkedin account to enable the Preview">' +
                    '<span class="nav-text">Linkedin</span></a></li></ul>';

        } else if((facebook > 0) && (twitter === 0) && (linkedin === 0)) {
                append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                    '<li class="nav-item">' +
                    '<a class="nav-link" id="twitter-tab-preview" title="please select Twitter account to enable the Preview">' +
                    '<span class="nav-text">Twitter</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link active" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
                    '<span class="nav-text">Facebook</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="linkedin-tab-preview" title="please select Linkedin account to enable the Preview">' +
                    '<span class="nav-text">Linkedin</span></a></li></ul>';
        } else if((linkedin > 0) && (twitter === 0) && (facebook === 0)) {
                append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                    '<li class="nav-item">' +
                    '<a class="nav-link" id="twitter-tab-preview" title="please select Twitter account to enable the Preview">' +
                    '<span class="nav-text">Twitter</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="facebook-tab-preview" title="please select Facebook account to enable the Preview">' +
                    '<span class="nav-text">Facebook</span></a></li>';
                append +='<li class="nav-item">' +
                    '<a class="nav-link active" id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview">' +
                    '<span class="nav-text">Linkedin</span>' +
                    '</a></li></ul>';
        }
        else if((twitter > 0) && (facebook > 0) && (linkedin === 0)) {
          if (facebookAccountsIds.includes(Number($(this).attr('acc_id')))) {
                append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                    '<li class="nav-item">' +
                    '<a class="nav-link" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview">' +
                    '<span class="nav-text">Twitter</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link active" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
                    '<span class="nav-text">Facebook</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="linkedin-tab-preview" title="please select Linkedin account to enable the Preview">' +
                    '<span class="nav-text">Linkedin</span></a></li></ul>';
            } else {
                append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                    '<li class="nav-item">' +
                    '<a class="nav-link active" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview" aria-controls="Twitter">' +
                    '<span class="nav-text">Twitter</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
                    '<span class="nav-text">Facebook</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="linkedin-tab-preview" title="please select Linkedin account to enable the Preview">' +
                    '<span class="nav-text">Linkedin</span></a></li></ul>';
            }
        }
        else if((twitter > 0) && (linkedin > 0) && (facebook === 0)) {
           if (linkedinAccountsIds.includes(Number($(this).attr('acc_id')))) {
                append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                    '<li class="nav-item">' +
                    '<a class="nav-link" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview">' +
                    '<span class="nav-text">Twitter</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="facebook-tab-preview" title="please select Facebook account to enable the Preview">' +
                    '<span class="nav-text">Facebook</span></a></li></ul>';
                append +='<li class="nav-item">' +
                    '<a class="nav-link active" id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview"  aria-controls="contact>' +
                    '<span class="nav-text">Linkedin</span>' +
                    '</a></li>';
            } else {
                   append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                       '<li class="nav-item">' +
                       '<a class="nav-link active" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview" aria-controls="Twitter">' +
                       '<span class="nav-text">Twitter</span></a></li>';
                   append += '<li class="nav-item">' +
                       '<a class="nav-link" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
                       '<span class="nav-text">Facebook</span></a></li>';
                   append += '<li class="nav-item">' +
                       '<a class="nav-link" id="linkedin-tab-preview" title="please select Linkedin account to enable the Preview">' +
                       '<span class="nav-text">Linkedin</span></a></li></ul>';
                   }
        }
        else if((facebook > 0) && (linkedin > 0) && (twitter === 0)) {
             if (linkedinAccountsIds.includes(Number($(this).attr('acc_id')))) {
                append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                    '<li class="nav-item">' +
                    '<a class="nav-link" id="twitter-tab-preview" title="please select any account to enable the Preview">' +
                    '<span class="nav-text">Twitter</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
                    '<span class="nav-text">Facebook</span></a></li>';
                append +='<li class="nav-item">' +
                    '<a class="nav-link active" id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview" aria-controls="contact>' +
                    '<span class="nav-text">Linkedin</span>' +
                    '</a></li></ul>';
            } else {
                     append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                         '<li class="nav-item">' +
                         '<a class="nav-link" id="twitter-tab-preview" title="please select any account to enable the Preview">' +
                         '<span class="nav-text">Twitter</span></a></li>';
                     append += '<li class="nav-item">' +
                         '<a class="nav-link active" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
                         '<span class="nav-text">Facebook</span></a></li>';
                     append +='<li class="nav-item">' +
                         '<a class="nav-link" id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview">' +
                         '<span class="nav-text">Linkedin</span>' +
                         '</a></li></ul>';
             }
        } else if((facebook > 0) && (linkedin > 0) && (twitter > 0)) {
            if (twitterAccountsIds.includes(Number($(this).attr('acc_id')))) {
                append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                    '<li class="nav-item">' +
                    '<a class="nav-link active" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview" aria-controls="Twitter">' +
                    '<span class="nav-text">Twitter</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
                    '<span class="nav-text">Facebook</span></a></li>';
                append +='<li class="nav-item">' +
                    '<a class="nav-link " id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview">' +
                    '<span class="nav-text">Linkedin</span>' +
                    '</a></li></ul>';
            } else if (facebookAccountsIds.includes(Number($(this).attr('acc_id')))) {
                append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                    '<li class="nav-item">' +
                    '<a class="nav-link" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview">' +
                    '<span class="nav-text">Twitter</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link active" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
                    '<span class="nav-text">Facebook</span></a></li>';
                append +='<li class="nav-item">' +
                    '<a class="nav-link " id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview">' +
                    '<span class="nav-text">Linkedin</span>' +
                    '</a></li></ul>';
            } else if (linkedinAccountsIds.includes(Number($(this).attr('acc_id')))) {
                append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
                    '<li class="nav-item">' +
                    '<a class="nav-link" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview">' +
                    '<span class="nav-text">Twitter</span></a></li>';
                append += '<li class="nav-item">' +
                    '<a class="nav-link" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
                    '<span class="nav-text">Facebook</span></a></li>';
                append +='<li class="nav-item">' +
                    '<a class="nav-link active" id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview">' +
                    '<span class="nav-text">Linkedin</span>' +
                    '</a></li></ul>';
            }
        }
    }

    else if ((selectedAccountIds.length > 0) && (twitter > 0) && (facebook === 0) && (linkedin === 0)) {
        append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
            '<li class="nav-item">' +
            '<a class="nav-link active" id="twitter-tab-preview" data-toggle="tab" href="#twitter-preview" aria-controls="Twitter">' +
            '<span class="nav-text">Twitter</span></a></li>';
        append += '<li class="nav-item">' +
            '<a class="nav-link" id="facebook-tab-preview" title="please select Facebook account to enable the Preview">' +
            '<span class="nav-text">Facebook</span></a></li>';
        append += '<li class="nav-item">' +
            '<a class="nav-link" id="linkedin-tab-preview" title="please select Linkedin account to enable the Preview">' +
            '<span class="nav-text">Linkedin</span></a></li></ul>';
    } else if ((selectedAccountIds.length > 0) && (facebook > 0) && (twitter === 0) && (linkedin === 0)) {
        append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
            '<li class="nav-item">' +
            '<a class="nav-link" id="twitter-tab-preview" aria-controls="Twitter" title="Please select Twitter account to enable the Preview">' +
            '<span class="nav-text">Twitter</span></a></li>';
        append += '<li class="nav-item">' +
            '<a class="nav-link active" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
            '<span class="nav-text">Facebook</span></a></li>';
        append += '<li class="nav-item">' +
            '<a class="nav-link" id="linkedin-tab-preview" title="please select Linkedin account to enable the Preview">' +
            '<span class="nav-text">Linkedin</span></a></li></ul>';
    } else if ((selectedAccountIds.length >= 0) && (facebook === 0) && (twitter === 0) && (linkedin === 0)) {
        $('#facebook_preview_ids').hide();
        append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
            '<li class="nav-item">' +
            '<a class="nav-link" id="twitter-tab-preview" aria-controls="Twitter" title="please select any account to enable the Preview">' +
            '<span class="nav-text">Twitter</span></a></li>';
        append += '<li class="nav-item">' +
            '<a class="nav-link" id="facebook-tab-preview" title="please select any account to enable the Preview">' +
            '<span class="nav-text">Facebook</span></a></li>';
        append += '<li class="nav-item">' +
            '<a class="nav-link" id="linkedin-tab-preview" title="please select Linkedin account to enable the Preview">' +
            '<span class="nav-text">Linkedin</span></a></li></ul>';
    } else if ((selectedAccountIds.length > 0) && (linkedin > 0) && (facebook === 0) && (twitter === 0)) {
        append += '<li class="nav-item">' +
            '<a class="nav-link" id="twitter-tab-preview" title="please select Twitter account to enable the Preview">' +
            '<span class="nav-text">Twitter</span></a></li>';
        append += '<li class="nav-item">' +
            '<a class="nav-link" id="facebook-tab-preview" title="please select Facebook account to enable the Preview">' +
            '<span class="nav-text">Facebook</span></a></li>';
        append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
            '<li class="nav-item">' +
            '<a class="nav-link active" id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview" aria-controls="contact">' +
            '<span class="nav-text">Linkedin</span></a></li></ul>';
    }  else if ((selectedAccountIds.length > 0) && (facebook > 0)  && (linkedin > 0) && (twitter === 0)) {
        append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
            '<li class="nav-item">' +
            '<a class="nav-link" id="twitter-tab-preview" aria-controls="Twitter" title="Please select Twitter account to enable the Preview">' +
            '<span class="nav-text">Twitter</span></a></li>';
        append += '<li class="nav-item">' +
            '<a class="nav-link active" id="facebook-tab-preview" data-toggle="tab" href="#facebook-preview">' +
            '<span class="nav-text">Facebook</span></a></li>';
        append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
            '<li class="nav-item">' +
            '<a class="nav-link active" id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview" aria-controls="contact">' +
            '<span class="nav-text">Linkedin</span></a></li></ul>';
    } else if ((selectedAccountIds.length > 0) && (twitter > 0) && (linkedin > 0) && (facebook === 0)) {
        append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
            '<li class="nav-item">' +
            '<a class="nav-link" id="twitter-tab-preview" data-toggle="tab" aria-controls="Twitter">' +
            '<span class="nav-text">Twitter</span></a></li>';
        append += '<li class="nav-item">' +
            '<a class="nav-link" id="facebook-tab-preview" title="please select Facebook account to enable the Preview">' +
            '<span class="nav-text">Facebook</span></a></li>';
        append += '<ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">' +
            '<li class="nav-item">' +
            '<a class="nav-link active" id="linkedin-tab-preview" data-toggle="tab" href="#linkedin-preview" aria-controls="contact">' +
            '<span class="nav-text">Linkedin</span></a></li></ul>';
    }

    $('#social-preview-tabs').empty().append(append);
    $('#twitter-tab-preview, #facebook-tab-preview, #linkedin-tab-preview').tooltip();
});


$(document).ready(function () {
    $('body').on('click', '.publishContentItemShareBtn', function (e) {
        e.preventDefault();
        let btn = $(this);
        btn.html("<i class='fa fa-spinner fa-spin'></i> 1 Click");
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
                btn.html("<i class='far fa-hand-point-up fa-fw'></i> 1 Click");
                $('body').append(data.html);
                $('body').find('#resocioModal').modal('show');
                // begin:normal post emoji
                $('body').find("#normal_post_area").emojioneArea({
                    pickerPosition: "right",
                    tonesStyle: "bullet"
                });
                downloadMediaUrl();
            },
            error: function (error) {
                btn.removeAttr('disabled');
                btn.html("<i class='far fa-hand-point-up fa-fw'></i> 1 Click");
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

        btn.html("<i class='fa fa-spinner fa-spin'></i> Processing");
        btn.attr('disabled', 1);

        let form = $(this).parents('form'); //#publishContentForm
        let formData = new FormData($(form)[0]);
        formData.append('status', btn.val());
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
                toastr.success(data.message);
                if(data.type_text == "socioQueue") {
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
                    if (error.responseJSON.error === "Cannot read property 'dayId' of null" || error.responseJSON.error ==="Cannot read property 'length' of undefined"){
                        toastr.error("Schedule Type And Respective Date or Day, Timings fields required ");
                    }else {
                        toastr.error(error.responseJSON.error);
                    }

                }
            },
        });
    });
});


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
            $("#media-list").html(
                '<li class="myupload"><span><i class="fas fa-plus" aria-hidden="true"></i><input type="file" click-type="type2" id="picupload" class="picupload" title="Click to Add File" data-toggle="tooltip" multiple></span></li>'
            );
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

                                $("body").find( "#publishContentForm").append(`
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

downloadMediaUrl = function () {
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
            data: {'mediaUrl': passedMediaUrl.val()},
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
