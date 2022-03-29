@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Scheduling</title>
@endsection
@section('links')
    <link rel="stylesheet" type="text/css" href="{{asset('plugins/custom/emojionearea/css/emojionearea.min.css') }}"/>
    <!--begin::Page Vendors Styles(used by this page)-->
    <link href="{{asset('plugins/custom/fullcalendar/fullcalendar.bundle.css') }}" rel="stylesheet" type="text/css"/>
    <!--end::Page Vendors Styles-->
    <link rel="stylesheet" type="text/css" href="{{asset('plugins/custom/dropify/dist/css/dropify.min.css') }}"/>
    <link rel="stylesheet" type="text/css" href="{{asset('plugins/custom/emojionearea/css/emojionearea.min.css') }}">

@endsection
@section('content')

    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class="container pinterest-publish">
                <!--begin::Schedule-->
                <div class="row">
                    <div class="col-xl-6 col-sm-12">
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5 align-items-center">
                                <h3 class="card-title font-weight-bolder">Pinterest post</h3>
                            </div>
                            <!--end::Header-->

                            <!--begin::Body-->
                            <div class="card-body pt-2 position-relative overflow-hidden">
                                <!-- begin:info list -->
                                <form id="pinterest_publish_form" >
                                    @csrf
                                <div class="info-list">
                                    <ul class="nav justify-content-center nav-pills" id="AddAccountsTab" role="tablist">
                                        <li class="nav-item">
                                            <a class="nav-link active" id="facebook-tab-account" data-toggle="tab" href="#facebook-tab-account">
                                                <span class="nav-text"><i class="icon-xl fab fa-pinterest"></i></span>
                                            </a>
                                        </li>
                                    </ul>
                                    <div class="tab-content mt-5" id="AddAccountsTabContent">
                                        <div class="tab-pane fade show active" id="facebook-tab-account" role="tabpanel" aria-labelledby="facebook-tab-account">
                                            <div class="mt-3">
                                                <div>
                                                    <ul class="schedule-social-tabs">
                                                        <li class="font-size-md font-weight-normal">Character limit is 500.</li>
                                                        <li class="font-size-md font-weight-normal">You can post max 1 images at a time.</li>
                                                    </ul>
                                                    <!--begin::Page-->
                                                    <span>Choose Pinterest pages for posting</span>
                                                    @foreach( $socialAccounts as $accounts)
                                                    <div class="d-flex mt-3 align-items-center flex-grow-1">
                                                        <div class="w-100 accordion accordion-toggle-arrow" id="accordionExample1">
                                                            <div class="card mb-5">
                                                                <div id="boardsNameDiv" class="card-header rounded-sm boardDiv">
                                                                    <div class="card-title collapsed" data-toggle="collapse" data-target="#pinterest-post1{{$accounts->account_id}}">
                                                                        {{$accounts->user_name}}
                                                                    </div>
                                                                </div>
                                                                <div id="pinterest-post1{{$accounts->account_id}}" class="collapse" data-parent="#accordionExample1">
                                                                    <div class="card-body">
                                                                        <div class="row">
                                                                            @foreach($accounts->boardDetails as $boards)
                                                                            <div class="col-sm-6">
                                                                                <div class="d-flex flex-row justify-content-between align-items-center py-2">
                                                                                    <a href="javascript:;" class="font-weight-bold text-hover-primary font-size-lg">
                                                                                        {{$boards->board_name}}
                                                                                    </a>
                                                                                    <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4">
                                                                                        <input type="checkbox" name="board_id[]" value="{{$boards->board_id.','.$accounts->account_id}}" acc_id="2" >
                                                                                        <span></span>
                                                                                    </label>
                                                                                </div>

                                                                            </div>
                                                                                @endforeach
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    @endforeach
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                                <div class="form-group mt-5">
                                   <textarea
                                           class="form-control border border-light h-auto py-4 rounded-lg font-size-h6 normal_post_area"
                                           id="normal_post_area" rows="3" name="discription"
                                           placeholder="Write Something !"></textarea>
                                </div>
                                <div class="form-group">
                                    <div class="input-icon">
                                        <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 outGoingUrlDiv" type="text" name="outgoing-url" autocomplete="off" placeholder="Enter Outgoing url"/>
                                        <span><i class="fas fa-link"></i></span>
                                    </div>
                                </div>

                                <!-- image and video upload -->
                                <div id="animation"></div>
                                <div class="row mb-5 new_pic" id="new_pic">
                                    <div class="col-12" id="option_upload">
                                        <small>Note: Add only 1 items at a single time.</small>
                                        <ul class="btn-nav">
                                            <li>
                                                            <span>
                                                                <i class="far fa-image fa-2x"></i>
                                                                <input type="file" name="" click-type="img-video-option" class="picupload"
                                                                       multiple accept=".jpg, .png, .jpeg" />
                                                            </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                                <!-- end of image and video upload -->

                                <!-- begin::schedule button -->
                                <div class="d-flex justify-content-around">
                                    <button type="submit" id="publish_buttons" class="btn text-hover-success font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-6">Post now</button>
                                </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-6 col-sm-12 previewTabClass">
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Preview</h3>

                                <!--begin::Desktop and Mobile view-->
                                <ul class="nav nav-light-warning nav-pills" id="preview-tabs" role="tablist">
                                    <li class="nav-item" role="presentation">
                                        <a class="nav-link active" id="desktop-preview" data-toggle="tab" href="#desktop-preview" role="tab"
                                           aria-controls="desktop-preview">Desktop</a>
                                    </li>
                                    <li class="nav-item" role="presentation">
                                        <a class="nav-link" id="mobile-preview" data-toggle="tab" href="#mobile-preview" role="tab"
                                           aria-controls="mobile-preview">Mobile</a>
                                    </li>

                                </ul>
                                <!--begin::Desktop and Mobile view-->
                            </div>
                            <!--end::Header-->

                            <!--begin::Body-->
                            <div class="card-body pt-2 position-relative overflow-hidden">
                                <div>
                                    <ul class="nav nav-light-warning nav-pills" id="social-preview-tabs" role="tablist">
                                        <li class="nav-item">
                                            <a class="nav-link active" id="facebook-tab-preview" data-toggle="tab"
                                               href="#facebook-preview">
                                                <span class="nav-text">Pinterest</span>
                                            </a>
                                        </li>
                                    </ul>
                                    <div class="tab-content" id="preview-tabContent">
                                        <div>
                                            <div class="tab-content mt-5" id="PreviewTabContent">
                                                <div class="tab-pane fade show active" id="facebook-preview"
                                                     role="tabpanel" aria-labelledby="facebook-tab-preview">
                                                    <!--begin::Image-->
                                                    <div class="preview-tab">
                                                        <div class="preview-tab-inner">
                                                            <!--begin::Top-->
                                                            <div class="d-flex align-items-center">
                                                                <!--begin::Symbol-->
                                                                <div class="symbol symbol-40 symbol-light-success mr-5">
                                                                            <span class="symbol-label">
                                                                                <img src="{{ asset('/media/svg/avatars/047-girl-25.svg') }}"
                                                                                     class="h-75 align-self-end" alt=""/>
                                                                            </span>
                                                                </div>
                                                                <!--end::Symbol-->
                                                                <!--begin::Info-->
                                                                <div class="d-flex flex-column flex-grow-2">
                                                                    <a href="javascript:;"
                                                                       class="text-hover-primary mb-1 font-size-lg font-weight-bolder" id="account_name" title="Here it will be your selected account name in selected Platform">Account Name</a>
                                                                    <span class="text-muted font-weight-bold">Just now</span>
                                                                </div>
                                                                <!--end::Info-->
                                                            </div>
                                                            <!--end::Top-->

                                                            <!--begin::Bottom-->
                                                            <div class="pt-4">
                                                                <!--begin::Text-->
                                                                <h3 class="font-weight-bolder" id="preview_title"></h3>
                                                                <p class="font-size-lg font-weight-normal pt-5 mb-2"
                                                                   id="preview_text">

                                                                </p>
                                                                <!--end::Text-->
                                                                <!--begin::Image-->
                                                                <div class="" id="preview_image">
                                                                </div>
                                                                <!--end::Image-->

                                                                <!--begin::Action-->
                                                                <div class="d-flex justify-content-around mt-2">
                                                                    <div class=" font-weight-bolder font-size-sm p-2 disabled">
                                                                                <span class="svg-icon svg-icon-md svg-icon-danger">
                                                                                    <i class="fas fa-heart fa-fw"></i> Like
                                                                                </span>
                                                                    </div>
                                                                    <div class="font-weight-bolder font-size-sm p-2 disabled">
                                                                                <span class="svg-icon svg-icon-md svg-icon-dark-25">
                                                                                    <i class="fas fa-comments fa-fw"></i> Comments
                                                                                </span>
                                                                    </div>
                                                                    <div class="font-weight-bolder font-size-sm p-2 disabled">
                                                                                <span class="svg-icon svg-icon-md svg-icon-dark-25">
                                                                                    <i class="fas fa-share fa-fw"></i> Share
                                                                                </span>
                                                                    </div>
                                                                </div>
                                                                <!--end::Action-->
                                                            </div>
                                                            <!--end::Bottom-->
                                                        </div>
                                                    </div>
                                                    <!--end::Image-->
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!--end::Entry-->
                </div>
                <!--end::Content-->

            </div>
            <!--end::Wrapper-->
        </div>
        <!--end::Page-->
    </div>
    <!--end::Main-->
@endsection
@section('scripts')
    <!--begin::Global Theme Bundle(used by all pages)-->
    <script src="assets/plugins/global/plugins.bundle.js"></script>
    <script src="assets/plugins/custom/prismjs/prismjs.bundle.js"></script>

    <script src="assets/plugins/custom/dropify/dist/js/dropify.min.js"></script>
    <script src="assets/plugins/custom/emojionearea/js/emojionearea.min.js"></script>

    <script src="assets/js/main.js"></script>
    <script src="assets/js/custom.js"></script>
    <!--end::Global Theme Bundle-->
    <!-- facebook , linkedin pages toggle -->
    <script>


        // fb page list div open
        $(".fb_page_div").css({
            display: "none"
        });
        $(".fb_page_btn").click(function() {
            $(".fb_page_div").css({
                display: "block"
            });
        });


        // linkedin page list div open
        $(".linkedin_page_div").css({
            display: "none"
        });
        $(".linkedin_page_btn").click(function() {
            $(".linkedin_page_div").css({
                display: "block"
            });
        });


        // schedule_post


        $('#schedule_normal_post_daterange').datetimepicker();
        // day_schedule_post_daterange daterange

        $('#day_schedule_post_daterange').datetimepicker();


        // schedule div toggle
        $("#schedule_normal_div").hide();
        $(".schedule_normal_post").click(function () {
            if ($(this).is(":checked")) {
                $("#schedule_normal_div").show();
            } else {
                $("#schedule_normal_div").hide();
            }
        });

        $("#day_wise_schedule_div").hide();
        $(".day_schedule_post").click(function () {
            if ($(this).is(":checked")) {
                $("#day_wise_schedule_div").show();
            } else {
                $("#day_wise_schedule_div").hide();
            }
        });

    </script>

    <script>
        // Schedule post div open
        $(".schedule-div").css({
            display: "none"
        });
        $(".schedule-post-btn").click(function() {
            $(".schedule-div").css({
                display: "block"
            });
        });



        // end:normal post emoji
        // begin:images and videos upload

        $(document).on('keyup change paste insert', '#normal_post_area', function (e) {
            $("#preview_text").html($(this).val())
        })

        $(document).on('change', '.picupload', function (event) {
            $('#animation').empty().append('<i style="size: A5" class="fa fa-spinner fa-spin"></i>');
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
            if (getAttr == 'img-video-option') {
                $('#media-list').html('');
                $('#media-list').html('<div><li class="myupload"><span><i class="fa fa-plus" aria-hidden="true"></i><input type="file" click-type="img-video-upload" id="picupload" class="picupload" title="Click to Add File" data-toggle="tooltip" multiple accept="video/*,.jpg, .png, .jpeg" style="width: 100px"></span></li></div>');
            }
            if (getAttr == 'img-video-option' || getAttr == 'img-video-upload') {
                // $('#hint_brand').css("display", "block");
                $('#option_upload').css("display", "none");

                for (let fileKey = 0; fileKey < files.length; fileKey++) {
                    let checkIsUploaded = false;
                    let fileItem = files[fileKey];

                    // names[iterator] = $(this).get(0).files[fileKey].name;
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
                            success: (r) => {
                                $('#animation').empty();
                                checkIsUploaded = true;
                                let response = JSON.parse(r); // display response from the PHP script, if any
                                // $('#picupload').tooltip();
                                checkIsUploaded = true
                                $("body").find('.defaultImage').remove();

                                if (response.type == 'image') {
                                    // $("body").find('.imageShow').prepend(`<img src='${response.media_url}' class='img-fluid image${iterator}' style="object-fit:contain;">`);
                                    $('#preview_image').append(`<img src="${response.media_url}" style="width:100%; height:auto" controls class='video'></img>`);
                                    $("body").find("#new_pic").prepend(`
                                    <div id="video_data" style="position: relative; display: inline-block;">
                                        <img src="${response.media_url}" style="width:30%; height:auto">
                                        <button type="button" id="close_image" class="btn btn-xs btn-icon btn-light btn-hover-primary" data-dismiss="modal" aria-label="Close" id="Sb_quick_user_close" style="position: absolute; top:0px; margin-left: -10px">
                                            <i class="ki ki-close icon-xs text-muted"></i>
                                        </button>
                                    </div>
                                `)

                                    $("body").find("#pinterest_publish_form").append(`
                                    <input type='hidden' name='mediaUrl[]' class='image' value="${response.mdia_path}">
                                `);

                                    $("body").find("#picupload").parent().children('i').removeClass('fa-spinner').removeClass('fa-spin').addClass('fa-plus')
                                    iterator++
                                }
                            }
                        });

                    } else if (fileItem.type.match('video')) {
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
                            success: (r) => {
                                $('#animation').empty();
                                $("body").find('.defaultImage').remove();
                                let response = JSON.parse(r); // display response from the PHP script, if any

                                if (response.type == 'video') {
                                    $('#preview_video').append(`<video style="width:100%; height:auto" controls class='video${iterator}'><source src="${response.media_url}"></source></video>`);

                                    $("body").find("#new_pic").prepend(`
                                    <input type='hidden' name='videoUrl' value="${response.mdia_path}">

                                    <div id="video_data" style="position: relative; display: inline-block;">
                                        <video  style="width:30%; height:auto" ><source src="${response.media_url}"></source></video>
                                        <button type="button" id="close_image" class="btn btn-xs btn-icon btn-light btn-hover-primary" data-dismiss="modal" aria-label="Close" id="Sb_quick_user_close" style="position: absolute; top:0px; margin-left: -10px">
                                            <i class="ki ki-close icon-xs text-muted"></i>
                                        </button>
                                    </div>

                                `);
                                }
                            }
                        });
                    }
                }
            }
        });
        $(document).on('click', '#close_image', function (e) {
            $('#video_data,#new_pic,#preview_image').empty();
            $('#new_pic').append('<div class="col-12" id="option_upload">\n' +
                '                                            <ul class="btn-nav">\n' +
                '                                                <li>\n' +
                '                                                            <span>\n' +
                '                                                        <i class="fas fa-image fa-2x"></i>\n' +
                '                                                        <input type="file" name="" click-type="img-video-option"\n' +
                '                                                               class="picupload"\n' +
                '                                                               multiple accept=".jpg, .png, .jpeg"/>\n' +
                '                                                    </span>\n' +
                '                                                </li>\n' +
                '                                            </ul>\n' +
                '                                        </div>');
        })

        // end:images and videos upload

        $(document).on('submit', '#pinterest_publish_form', function (e) {
            e.preventDefault();
            $('#publish_buttons').empty().append('<i class="fa fa-spinner fa-spin"></i>Processing');
            let form = document.getElementById('pinterest_publish_form');
            let formData = new FormData(form);
            $.ajax({
                url: "/home/publishing/pinterest-schedule",
                data: formData,
                type: 'POST',
                processData: false,
                contentType: false,
                success: function (response) {
                    $('#publish_buttons').empty().append('Post Now');
                    if(response.code === 201){
                        for(let i=0; i<response.msg.length; i++){
                            toastr.error(response.msg[i]);
                        }
                    } else if (response.code === 401){
                        toastr.error(response.error)
                    } else if (response.code === 200){
                        toastr.success(response.message);
                    }else{
                        toastr.error(response.message);
                    }
                },
                error: function (error) {
                    $('#publish_buttons').empty().append('Post Now');
                    console.log(error)
                    toastr.error(error.error);
                }
            })
        })
    </script>
@endsection
