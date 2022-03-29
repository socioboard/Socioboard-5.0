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
    @php
        $content = '';
        $content .= isset($mediaData) && isset($mediaData['title']) ? $mediaData['title'].' ' : '';
        
        $formSubmissionAction = \Request::route()->getName() == "publish_content.scheduling-edit" ? route("publish_content.update", $scheduleId) : route("publish_content.share");

        $formSubmissionMethod = \Request::route()->getName() == "publish_content.scheduling-edit" ? "POST" : "POST"
    @endphp

    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">
        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container ">
                <!--begin::Schedule-->
                <div class="row">
                    <div class="col-xl-6 col-sm-12">
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Create Post</h3>
                                <a href="#" class="btn btn-sm font-weight-bold p-3 infoDiv" data-toggle="modal"
                                   data-target="#schedulePostModal">
                                    <i class="icon-md fas fa-info-circle"></i> Info
                                </a>
                            </div>
                            <!--end::Header-->

                            <!--begin::Body-->
                            <div class="card-body pt-2 position-relative overflow-hidden">
                                <form action="{{ $formSubmissionAction }}" method="{{$formSubmissionMethod}}"
                                      id="publishContentForm">
                                    <!-- begin:Accounts list -->
                                    <div class="row info-list socialAccountsDiv">
                                        @include('contentstudio::components.draft_social_accounts')
                                    </div>
                                    <!-- end:Accounts list -->
                                    <span id="errorText1" class="text-danger"></span>
                                    <div class="form-group mt-8 normal_post_area">
                                        <textarea name="content"
                                                  class="form-control border border-light h-auto py-4 rounded-lg font-size-h6 "
                                                  id="normal_post_area" rows="3" placeholder="Write Something here!"
                                                  required>{{ $content  }}</textarea>
                                    </div>
                                    <p class="text-right">Characters Remaining : <span id="errorText3" class="text-danger"></span></p>
                                    <div class="form-group" id="potgoingurldiv">
                                        <div class="input-icon">
                                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 outGoingUrlDiv"
                                                   type="text" name="outgoingUrl" autocomplete="off"
                                                   placeholder="Enter Outgoing URL"
                                                   value="{!! isset($mediaData) && isset($mediaData['sourceUrl']) ? $mediaData['sourceUrl'] : null !!}"/>
                                            <span><i class="fas fa-link"></i></span>
                                        </div>
                                        @if(sizeof($bitlyAccountsIds )!== 0)
                                            <div class="form-group mt-5 d-flex" id="input_urls_for_short">
                                                <input class="form-control form-control-solid py-7 mr-6 rounded-lg font-size-h6 link_to_be"
                                                       type="text" autocomplete="off"
                                                       placeholder="Enter URL To get Short Link" id="link_to_be">
                                                <input type="hidden" name="account_iddd"
                                                       value="{{$bitlyAccountsIds[0]}}" id="bitly_id">
                                                <a id="submitButton"
                                                   class="btn font-weight-bolder px-3 link-shorting-btn"
                                                   onclick="SortLink()">Get Shortened Link</a>
                                            </div>
                                            <div id="OutputURL">

                                            </div>
                                        @endif
                                    </div>

                                    <!-- image and video upload -->
                                    <div class="row mb-5">
                                        @if(isset($mediaData['type']) && $mediaData['type'] == 'image' && isset($mediaData['mediaUrl']))
                                            <div class="col-12 d-none" id="option_upload">
                                                @else
                                                    <div class="col-12" id="option_upload">
                                                        @endif
                                                        <ul class="btn-nav">
                                                            <li>
                                                    <span>
                                                        <i class="far fa-image fa-2x"></i>
                                                        <input type="file" name="" click-type="img-video-option" class="picupload picClass"
                                                            multiple accept=".jpg, .png, .jpeg" />
                                                        @if(isset($mediaData['type']) && $mediaData['type'] == 'image')
                                                            <input type="hidden" name="mediaUrl[]" id="media_url"
                                                                   value="{!! isset($mediaData) && isset($mediaData['mediaUrl']) ? $mediaData['mediaUrl'] : null !!}">
                                                        @endif
                                                    </span>
                                                            </li>
                                                            <li>
                                                    <span>
                                                        <i class="fas fa-video fa-2x"></i>
                                                        <input type="file" name="" click-type="img-video-option"
                                                               class="picupload videoClass"
                                                               multiple accept="video/*"/>
                                                    </span>
                                                            </li>
                                                        </ul>

                                                    </div>
                                                <div class="col-12" id="next_upload">

                                                </div>
                                                    <div id="insta_type" style="padding-left: 10px; color: red"></div>
                                                    <input type="hidden" id="accounttypes" name="accountTypes">
                                                    @if(isset($mediaData['type']) && $mediaData['type'] == 'image' && isset($mediaData['mediaUrl']))
                                                        <div class="col-12 d-block" id="hint_brand">
                                                            @else
                                                                <div class="col-12" id="hint_brand">
                                                                    @endif
                                                                    <ul id="media-list" class="clearfix">
                                                                        @if(isset($mediaData['type']) && $mediaData['type'] == 'image')
                                                                            @if(isset($mediaData) && isset($mediaData['mediaUrl']))
                                                                                <li>
                                                                                    <img src="{!! $mediaData['mediaUrl'] !!}"
                                                                                         style="object-fit: contain;"/>
                                                                                    <div class="post-thumb">
                                                                                        <div class="inner-post-thumb"><a
                                                                                                    href="javascript:void(0);"
                                                                                                    class="remove-pic"><i
                                                                                                        class="fa fa-times"
                                                                                                        aria-hidden="true"></i></a>
                                                                                            <div></div>
                                                                                        </div>
                                                                                    </div>
                                                                                </li>
                                                                            @endif
                                                                        @endif
                                                                        <li class="myupload">
                                                    <span>
                                                        <i class="fa fa-plus" aria-hidden="true"></i>
                                                        <input type="file" click-type="img-video-upload" id="picupload"
                                                            class="picupload"  multiple accept=".jpg, .png, .jpeg" title="Click to Add File" style="width: 100px"/>
                                                    </span>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                        </div>
                                    {{-- Start checking if the media has to been downloaded and then downloaded or not--}}
                                    @if(isset($downloadMedia) && isset($mediaData['mediaUrl']))
                                        <input type="hidden" name="mediaUrl" value="{{$mediaData['mediaUrl']}}">
                                        <input type="hidden" name='mediaType' value="{{$mediaData['type']}}">
                                    @endif
                                                        <input type="hidden"  id="twitterAccountsIds" data-list="{{json_encode($twitterAccountsIds) }}">
                                                        <input type="hidden" id="facebookAccountsIds" data-list="{{json_encode($facebookAccountsIds) }}">
                                                        <input type="hidden" id="linkedinAccountsIds" data-list="{{json_encode($linkedinAccountsIds) }}">
                                                        <input type="hidden" id="instagramAccountsIds" data-list="{{json_encode($instagramAccountsIds) }}">
                                                        <input type="hidden" id="tumblrAccountsIds" data-list="{{json_encode($tumblrAccountsIds) }}">
                                                        <input type="hidden" id="selectedAccountIds" data-list="{{json_encode($accountIds) }}">
                                    {{-- End checking if the media has to been downloaded and then downloaded or not--}}
                                    <!-- end of image and video upload -->

                                                        <!-- begin::schedule button -->
                                                        <div class="d-flex justify-content-around">
                                                            <button type="button" name="status" value="1"
                                                                    class="publishContentSubmit btn text-hover-success font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-4 postButton">
                                                                Post Now
                                                            </button>
                                                            <button type="button"
                                                                    class="btn text-hover-warning font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-4 schedule-post-btn scheduledButton">
                                                                Schedule Post
                                                            </button>
                                                            <button type="button" name="status" value="0"
                                                                    class="publishContentSubmit btn text-hover-success font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-4 draftButton">
                                                                Draft
                                                            </button>
                                                        </div>
                                                        <!-- end::schedule button -->

                                    <!-- begin::Schedule type -->
                                    <div class="schedule-div mt-5">
                                        <!--begin::Header-->
                                        <h3 class="card-title font-weight-bolder">Schedule type</h3>
                                        <!--end::Header-->
                                        <div class="mb-2">
                                            <div class="">
                                                <label class="radio radio-lg mb-2 link-shortening-label">
                                                    <input type="radio" class="custom-control-input schedule_normal_post" id="schedule_post" name="scheduling_type" value="0">
                                                    <span></span>
                                                    <div class="font-size-lg font-weight-bold ml-4">Normal Schedule Post</div>
                                                </label>

                                                <label class="radio radio-lg mb-2 link-shortening-label">
                                                    <input type="radio" class="custom-control-input day_schedule_post" id="day_schedule" name="scheduling_type" value="1">
                                                    <span></span>
                                                    <div class="font-size-lg font-weight-bold ml-4">Day Wise Schedule Post</div>

                                                </label>

                                            </div>
{{--                                            <div class="checkbox-list">--}}
{{--                                                <div class="custom-control custom-checkbox mb-5">--}}
{{--                                                    <input type="checkbox" class="custom-control-input schedule_normal_post" id="schedule_post" name="scheduling_type" value="0" >--}}
{{--                                                    <label class="custom-control-label" for="schedule_post"> &nbsp;&nbsp; Normal Schedule Post</label>--}}
{{--                                                </div>--}}

{{--                                                <div class="custom-control custom-checkbox mb-5">--}}
{{--                                                    <input type="checkbox" class="custom-control-input day_schedule_post" id="day_schedule" name="scheduling_type" value="1" >--}}
{{--                                                    <label class="custom-control-label" for="day_schedule"> &nbsp;&nbsp; Day Wise Schedule Post</label>--}}
{{--                                                </div>--}}
{{--                                            </div>--}}
                                        </div>
                                        <div class="p-1 mb-2" id="schedule_normal_div">
                                            <label for="schedule_normal_post">Select Date and Time</label>
                                            <div class="form-group">
{{--                                                <div class="input-icon" id='schedule_normal_post_daterange'>--}}
{{--                                                    <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="normal_schedule_datetime" autocomplete="off" placeholder="Select date range"/>--}}
{{--                                                    <span><i class="far fa-calendar-alt"></i></span>--}}
                                                    <input type="text" class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 datetimepicker-input" id="schedule_normal_post_daterange" name="normal_schedule_datetime" placeholder="Select date & time"  data-toggle="datetimepicker" data-target="#schedule_normal_post_daterange"/>
{{--                                                </div>--}}
                                            </div>
                                        </div>
                                        <div class="p-1 mb-2" id="day_wise_schedule_div">
                                            <label>Select Days</label>
                                            <div class="btn-group btn-group-toggle col-12" data-toggle="buttons">
                                                <label class="btn  active">
                                                    <input type="checkbox" id="sun" name="weekday[]" value="0" autocomplete="off" >Sun
                                                </label>
                                                <label class="btn ">
                                                    <input type="checkbox" id="mon" name="weekday[]" value="1" autocomplete="off" > Mon
                                                </label>
                                                <label class="btn ">
                                                    <input type="checkbox" id="tues" name="weekday[]" value="2" autocomplete="off"> Tues
                                                </label>
                                                <label class="btn ">
                                                    <input type="checkbox" id="wed" name="weekday[]" value="3" autocomplete="off"> Wed
                                                </label>
                                                <label class="btn ">
                                                    <input type="checkbox" id="thu" name="weekday[]" value="4" autocomplete="off"> Thu
                                                </label>
                                                <label class="btn ">
                                                    <input type="checkbox" id="fri" name="weekday[]" value="5" autocomplete="off"> Fri
                                                </label>
                                                <label class="btn ">
                                                    <input type="checkbox" id="sat" name="weekday[]" value="6" autocomplete="off"> Sat
                                                </label>
                                            </div>
                                            <hr/>
                                            <div>
                                                <div class="form-group">
                                                    <label for="day_schedule_post">Select Time</label>
                                                    <div class="form-group">
{{--                                                        <div class="input-icon" id='day_schedule_post_daterange'>--}}
{{--                                                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="day_wise_datetime" autocomplete="off" placeholder="select date range"/>--}}
{{--                                                            <span><i class="far fa-calendar-alt"></i></span>--}}
{{--                                                        </div>--}}
                                                        <input type="text" class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 datetimepicker-input" id="day_schedule_post_daterange" name="day_wise_datetime" placeholder="Select date & time"  data-toggle="datetimepicker" data-target="#day_schedule_post_daterange"/>
                                                    </div>
                                                </div>
                                            </div>
                                            <hr>
                                            <div>
                                                <label>Select types</label>
                                                <div class="radio-inline">
                                                    <label class="radio radio-rounded">
                                                        <input type="radio" checked="checked" name="mediaSelectionType" value="0" />
                                                        <span></span>
                                                        All images
                                                    </label>
                                                    <label class="radio radio-rounded">
                                                        <input type="radio" name="mediaSelectionType" value="1" />
                                                        <span></span>
                                                        Single image
                                                    </label>
                                                    <label class="radio radio-rounded">
                                                        <input type="radio" name="mediaSelectionType" value="2" />
                                                        <span></span>
                                                        Random images
                                                    </label>
                                                </div>
                                            </div>
                                        </div>

                                                            <div class="d-flex justify-content-around">
                                                                <button type="button" name="status"
                                                                        value="draft_scheduling"
                                                                        class="publishContentSubmit btn text-hover-success font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-4">
                                                                    Draft
                                                                </button>

                                                                <button type="button" name="status" value="scheduling"
                                                                        class="publishContentSubmit btn text-hover-success font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-4">
                                                                    Schedule
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <!-- end::Schedule type -->
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-6 col-sm-12 previewTabClass">
                        @include('contentstudio::scheduling.components._draft_preview')
                    </div>
                </div>
                <!--end::Schedule-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>

    <!-- begin:schedule post Modal-->
    <div class="modal fade schedul-post-modal" id="schedulePostModal" tabindex="-1" role="dialog" aria-labelledby="schedulePostModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="schedulePostModalLabel">Schedule Post</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="table-responsive">
                        <table class="table table-bordered">
                            <thead>
                            <tr>
                                <th width="50%">Available Networks</th>
                                <th width="50%">Un-Available Network</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>Twitter</td>
                                <td>Facebook normal profile</td>
                            </tr>
                            <tr>
                                <td>Facebook Pages</td>
                                <td>Instagram normal profile</td>
                            </tr>
                            <tr>
                                <td>Instagram Business Accounts</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td>LinkedIn Accounts</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td>LinkedIn Pages</td>
                                <td>-</td>
                            </tr>
                            <tr>
                                <td>Tumblr</td>
                                <td>-</td>
                            </tr>
                            </tbody>
                        </table>
                        <table class="table table-bordered">
                            <thead>
                            <tr>
                                <th width="50%">Add-Ons</th>
                                <th width="50%">Reasons why accounts not visible</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td><a href="#">Pinterest Publish</a></td>
                                <td>
                                    <ul>
                                        <li>Your accounts are not as available</li>
                                    </ul>
                                </td>
                            </tr>
                            <tr>
                                <td><a href="#">Youtube Publish</a></td>
                                <td>
                                    <ul>
                                        <li>Your accounts are locked</li>
                                    </ul>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <!-- end:schedule post Modal -->
@endsection

@section('scripts')
    <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
    <script>
        {!! file_get_contents(Module::find('ContentStudio')->getPath() . '/js/scheduling.js'); !!}
    </script>
    <script src="{{asset('plugins/custom/dropify/dist/js/dropify.min.js') }}"></script>
    <script src="{{asset('plugins/custom/emojionearea/js/emojionearea.min.js') }}"></script>

    <!--end::Global Theme Bundle-->
    <!-- facebook , linkedin pages toggle -->
    <script>
        var faIconsForDateTimePicker = {
            time: "fa fa-clock-o",
            date: "fa fa-calendar",
            up: "fa fa-arrow-up",
            down: "fa fa-arrow-down",

            previous: 'fa fa-arrow-right',
            next: 'fa fa-arrow-left',
            today: 'fa fa-user',
            clear: 'fa fa-trash',
            close: 'fa fa-remove'
        };
        // fb page list div open
        $(".fb_page_div").css({
            display: "none"
        });

        $(".fb_page_btn").click(function () {
            $(".fb_page_div").css({
                display: "block"
            });
        });


        // linkedin page list div open
        $(".linkedin_page_div").css({
            display: "none"
        });

        $(".linkedin_page_btn").click(function () {
            $(".linkedin_page_div").css({
                display: "block"
            });
        });

        // schedule_post
        // schedule_normal_post daterange
        var start = moment().subtract(29, 'days');
        var end = moment();

        $('#schedule_normal_post_daterange input').datetimepicker({
            // Formats
            // follow MomentJS docs: https://momentjs.com/docs/#/displaying/format/
            format: 'YYYY-MM-DD hh:mm',
            icons: faIconsForDateTimePicker,
            useCurrent: false
        });
        // $("#schedule_normal_post_daterange").on("change.datetimepicker", function (e) {
        //     $('#schedule_normal_post_daterange').datetimepicker('minDate', moment().add(3, 'minutes'));
        // });

        // schedule_normal_post daterange
        var start = moment().subtract(29, 'days');
        var end = moment();

        $('#day_schedule_post_daterange input').datetimepicker({
            // Formats
            // follow MomentJS docs: https://momentjs.com/docs/#/displaying/format/
            format: 'YYYY-MM-DD hh:mm',
            icons: faIconsForDateTimePicker,
            useCurrent: false
        });
        // $("#day_schedule_post_daterange").on("change.datetimepicker", function (e) {
        //     $('#day_schedule_post_daterange').datetimepicker('minDate', moment().add(3, 'minutes'));
        // });

        // schedule div toggle
        $("#schedule_normal_div").hide();
        $(".schedule_normal_post").click(function () {
            if ($(this).is(":checked")) {
                $("#schedule_normal_div").show();
                $("#day_wise_schedule_div").hide();
                $("#day_schedule").prop("checked", false);
            } else {
                $("#schedule_normal_div").hide();
            }
        });

        $("#day_wise_schedule_div").hide();
        $(".day_schedule_post").click(function () {
            if ($(this).is(":checked")) {
                $("#day_wise_schedule_div").show();
                $("#schedule_normal_div").hide();
                $("#schedule_post").prop("checked", false);
            } else {
                $("#day_wise_schedule_div").hide();
            }
        });


        $(document).ready(function () {
            $('emojionearea-filters-scroll').on('change','textarea',function(){
                    $(".emojionearea-filter").removeClass("active");
            });
        });

        function SortLink() {
            $('#submitButton').empty().append('<i class="fa fa-spinner fa-spin"></i>Processing');
            let short_link = $('#link_to_be').val();
            let account = $('#bitly_id').val();
            $.ajax({
                type: "post",
                url: "/bitly/get-shortened-link",
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                data:{
                    'short_link' : short_link,
                    'acc_id' : account
                } ,
                success: function (response) {
                    $('#submitButton').empty().append('Get Shortened Link');
                    if (response.code === 200){
                        $('#OutputURL').empty().append('<div class="link-shortening-text" id="responseURL">'+response.data.link+'<span class="ml-auto"><i class="icon-md far fa-file-alt" onclick="myFunction()"></i></span></div>')
                    }else if (response.error == "\"long_url\" must be a string"){
                        toastr.error("URL field is required");
                    } else {
                        toastr.error(response.message);
                    }
                },
                error: function (error) {
                    $('#submitButton').empty().append('Get Shortened Link');
                    toastr.error(error.message);
                },
            });
        }
        function myFunction() {
            let copyText = document.getElementById("responseURL");
            let elementText = copyText.textContent; //get the text content from the element
            navigator.clipboard.writeText(elementText);
            toastr.success('Copied')
        }

    </script>

    <script>
        {!! file_get_contents(Module::find('ContentStudio')->getPath() . '/js/files_uploading.js'); !!}
    </script>
@endsection
