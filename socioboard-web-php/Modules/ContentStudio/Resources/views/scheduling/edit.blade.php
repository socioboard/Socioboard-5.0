@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Schedule edit</title>
@endsection
@section('links')
    <link rel="stylesheet"  type="text/css" href="{{asset('plugins/custom/emojionearea/css/emojionearea.min.css') }}" />
	<!--begin::Page Vendors Styles(used by this page)-->
	 <link href="{{asset('plugins/custom/fullcalendar/fullcalendar.bundle.css') }}" rel="stylesheet" type="text/css"/>
	<!--end::Page Vendors Styles-->
	<link rel="stylesheet" type="text/css" href="{{asset('plugins/custom/dropify/dist/css/dropify.min.css') }}" />
	<link rel="stylesheet"  type="text/css" href="{{asset('plugins/custom/emojionearea/css/emojionearea.min.css') }}">

{{--    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/eonasdan-bootstrap-datetimepicker/4.17.49/css/bootstrap-datetimepicker-standalone.css">--}}

@endsection
@section('content')
    @php
        $content = '';
        $content .= isset($mediaData) && isset($mediaData['title']) ? $mediaData['title'].' ' : '';
        $content .= isset($mediaData) && isset($mediaData['description']) ? $mediaData['description'] : '';
        $normalDate = isset($normalScheduleDate) ? $normalScheduleDate : null;
        $daywise = isset($daywisetime) ? $daywisetime : null;
        $timezone = session()->get('timezone');
        $normalDates = $normalDate!== null ? $normalDate : null;
        $dayDate = $daywise !== null ? $daywise : null;

    @endphp

    <script> let normaldate = '<?php echo $normalDates?>'</script>
    <script> let daywisedate = '<?php echo $dayDate?>'</script>
    <script> let timezone = '<?php echo $timezone?>'</script>
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
                                <h3 class="card-title font-weight-bolder">Edit Schedule post</h3>
                            </div>
                            <!--end::Header-->
                            <!--begin::Body-->
                            <div class="card-body pt-2 position-relative overflow-hidden">
                                <form action="{{ $formAction }}" method="POST" id="publishContentForm">
                                    @csrf
                                    <input type="hidden" name="type" value="{{ $type }}">
                                    <input type="hidden" name="ownerId" value="{{ $ownerId }}">
                                    <input type="hidden" name="teamId" value="{{ $teamId }}">
                                    <input type="hidden" name="socioQueue" value="{{ $socioQueue }}">
                                    <input type="hidden"  id="twitterAccountsIds" data-list="{{json_encode($twitterAccountsIds) }}">
                                    <input type="hidden" id="facebookAccountsIds" data-list="{{json_encode($facebookAccountsIds) }}">
                                    <input type="hidden" id="selectedAccountIds" data-list="{{json_encode($accountIds) }}">
                                    <input type="hidden" name="returntype" value="{{$returntype}}">
                                    <!-- begin:Accounts list -->
                                    <div class="row info-list">
                                        @include('contentstudio::components.draft_social_accounts')
                                    </div>
                                    <!-- end:Accounts list -->
                                    <div class="form-group">
                                        <textarea oninput="function textinput()" name="content" class="form-control border border-light h-auto py-4 rounded-lg font-size-h6" id="normal_post_area" rows="3" placeholder="Write something !" required >{{ $content  }}</textarea>
                                    </div>
                                    <div class="form-group">
                                        <div class="input-icon">
                                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" type="text" name="outgoingUrl" autocomplete="off" placeholder="Enter Outgoing url" value="{!! isset($mediaData) && isset($mediaData['sourceUrl']) ? $mediaData['sourceUrl'] : null !!}"/>
                                            <span><i class="fas fa-link"></i></span>
                                        </div>
                                    </div>
                                    <!-- image and video upload -->
                                    <div class="row mb-5">
                                        @if(isset($mediaData['type']) && strtolower($mediaData['type']) == ('image' || "video") && isset($mediaUrl))
                                            <div class="col-12 d-none" id="option_upload">
                                                @else
                                                    <div class="col-12" id="option_upload">
                                                        @endif
                                                        <small>Note: Add only 4 items at a single time.</small>
                                                        <ul class="btn-nav">
                                                            <li>
                                                    <span>
                                                        <i class="far fa-image fa-2x"></i>
                                                        <input type="file" name="" click-type="img-video-option" class="picupload"
                                                               multiple accept=".jpg, .png, .jpeg" />
                                                    </span>
                                                            </li>
                                                            <li>
                                                    <span>
                                                        <i class="fas fa-video fa-2x"></i>
                                                        <input type="file" name="" click-type="img-video-option" class="picupload"
                                                               multiple accept="video/*" />
                                                    </span>
                                                            </li>
                                                        </ul>
                                                    </div>
                                                    @if(isset($mediaData['type']) && strtolower($mediaData['type']) == ('image' || 'video') && isset($mediaUrl))
                                                        <div class="col-12 d-block" id="hint_brand" style="display: block">
                                                            @else
                                                                <div class="col-12" id="hint_brand">
                                                                    @endif
                                                                    <ul id="media-list" class="clearfix">
                                                                        @if(isset($mediaData['type']) && strtolower($mediaData['type']) == 'image')
                                                                            @if(isset($mediaUrl))
                                                                                @foreach($mediaUrl as $key => $value)
                                                                                    <li>
                                                                                        <img src="{!! $site_url.$value !!}" style="object-fit: contain;" />
                                                                                        <div class="post-thumb"><div class="inner-post-thumb"><a href="javascript:void(0);"  class="remove-pic" data-id='{{$key}}'><i class="fa fa-times" aria-hidden="true"></i></a><div></div>
                                                                                    </li>
                                                                                @endforeach
                                                                            @endif
                                                                        @endif
                                                                        @if(isset($mediaData['type']) && strtolower($mediaData['type']) == 'video')
                                                                            @if(isset($mediaUrl))
                                                                                @foreach($mediaUrl as $key => $value)
                                                                                    <li>
                                                                                        {{-- <img src="{!! $site_url.$value !!}"  /> --}}
                                                                                        <video class="video{{$key}}" autoplay  style="object-fit: contain;">
                                                                                            <source src="{{$site_url.$value}}">
                                                                                        </video>
                                                                                        <div class="post-thumb"><div class="inner-post-thumb"><a href="javascript:void(0);"  class="remove-pic" data-id='{{$key}}'><i class="fa fa-times" aria-hidden="true"></i></a><div></div>
                                                                                    </li>
                                                                                @endforeach
                                                                            @endif
                                                                        @endif
                                                                        <li class="myupload">
                                                    <span>
                                                        <i class="fa fa-plus" aria-hidden="true"></i>
                                                        @if($mediaData['type'] == 'image')
                                                            <input type="file" click-type="img-video-upload" id="picupload"
                                                                   class="picupload" multiple accept=".jpg, .png, .jpeg"/>
                                                        @else
                                                            <input type="file" click-type="img-video-upload" id="picupload"
                                                                   class="picupload" multiple accept="video/*">
                                                        @endif
                                                    </span>
                                                                        </li>
                                                                    </ul>
                                                                </div>
                                                                <div class="col-12" id="next_upload">

                                                                </div>
                                                        </div>
                                                        <!-- end of image and video upload -->

                                                        <!-- begin::schedule button -->
                                                        <div class="d-flex justify-content-around">
                                                            @if($type != 'schedule')
                                                                <button type="button" name="status" value="1" class="publishContentSubmit btn text-hover-success font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-4">Post now</button>
                                                                <button type="button" class="btn text-hover-warning font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-4 schedule-post-btn">Schedule post</button>
                                                                <button type="button" name="status" value="0" class="publishContentSubmit btn text-hover-success font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-4"> Draft</button>
                                                            @endif
                                                        </div>

                                                        <!-- end::schedule button -->

                                                        <!-- begin::Schedule type -->
                                                        <div class="schedule-div mt-5 @if($type == 'schedule') {{ 'd-block' }} @endif">
                                                            <!--begin::Header-->
                                                            <h3 class="font-weight-bolder">Schedule type</h3>
                                                            <!--end::Header-->
                                                            <div class="my-3">
                                                                <div class="schedule-div-block">
                                                                    <label class="radio radio-lg mb-5">
                                                                        <input type="radio" class="custom-control-input schedule_normal_post" id="schedule_post" name="scheduling_type" value="0"
                                                                         @if(isset($scheduleCategory) && $scheduleCategory == 0) {{ 'checked' }} @endif>
                                                                        <span></span>
                                                                        Normal Schedule Post
                                                                    </label>
                                                                    <label class="radio radio-lg">
                                                                        <input type="radio" class="custom-control-input day_schedule_post" id="day_schedule" name="scheduling_type" value="1" @if(!isset($scheduleCategory) ||$scheduleCategory == 1) {{ 'checked' }} @endif>
                                                                        <span></span>
                                                                        Day Wise Schedule Post
                                                                    </label>
                                                                </div>
{{--                                                                <div class="checkbox-list">--}}
{{--                                                                    <div class="custom-control custom-checkbox mb-5">--}}
{{--                                                                        <input type="checkbox" class="custom-control-input schedule_normal_post" id="schedule_post" name="scheduling_type" value="0"--}}
{{--                                                                        @if(isset($scheduleCategory) && $scheduleCategory == 0) {{ 'checked' }} @endif>--}}
{{--                                                                        <label class="custom-control-label" for="schedule_post"> &nbsp;&nbsp; Normal Schedule Post</label>--}}
{{--                                                                    </div>--}}

{{--                                                                    <div class="custom-control custom-checkbox mb-5">--}}
{{--                                                                        <input type="checkbox" class="custom-control-input day_schedule_post" id="day_schedule" name="scheduling_type" value="1" @if(!isset($scheduleCategory) ||$scheduleCategory == 1) {{ 'checked' }} @endif>--}}
{{--                                                                        <label class="custom-control-label" for="day_schedule"> &nbsp;&nbsp; Day Wise Schedule Post</label>--}}
{{--                                                                    </div>--}}
{{--                                                                </div>--}}
                                                            </div>
                                                            <div class="p-1 mb-2" id="schedule_normal_div" @if(!isset($scheduleCategory) || $scheduleCategory != 0) {{ 'style=display:none' }} @endif>
                                                                <label for="schedule_normal_post">Select Date and Time</label>
                                                                <div class="form-group">
                                                                    <input type="text" class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 datetimepicker-input" id="schedule_normal_post_daterange" name="normal_schedule_datetime" placeholder="Select date & time"  data-toggle="datetimepicker" data-target="#schedule_normal_post_daterange"/>
                                                                </div>
                                                            </div>
                                                            <div class="p-1 mb-2" id="day_wise_schedule_div" @if(isset($scheduleCategory) && $scheduleCategory != 1) {{ 'style=display:none' }} @endif>
                                                                <label>Select Days</label>
                                                                <div class="btn-group btn-group-toggle col-12" data-toggle="buttons">
                                                                    <label class="btn  active">
                                                                        <input type="checkbox" id="sun" name="weekday[]" value="7" autocomplete="off"
                                                                        @if(isset($daywiseScheduleTimer) && in_array(7, $daywiseScheduleTimer)) {{'checked'}} @endif>Sun
                                                                    </label>
                                                                    <label class="btn ">
                                                                        <input type="checkbox" id="mon" name="weekday[]" value="1" autocomplete="off"
                                                                        @if(isset($daywiseScheduleTimer) && in_array(1, $daywiseScheduleTimer)) {{'checked'}} @endif> Mon
                                                                    </label>
                                                                    <label class="btn ">
                                                                        <input type="checkbox" id="tues" name="weekday[]" value="2" autocomplete="off"
                                                                        @if(isset($daywiseScheduleTimer) && in_array(2, $daywiseScheduleTimer)) {{'checked'}} @endif> Tues
                                                                    </label>
                                                                    <label class="btn ">
                                                                        <input type="checkbox" id="wed" name="weekday[]" value="3" autocomplete="off"
                                                                        @if(isset($daywiseScheduleTimer) && in_array(3, $daywiseScheduleTimer)) {{'checked'}} @endif> Wed
                                                                    </label>
                                                                    <label class="btn ">
                                                                        <input type="checkbox" id="thu" name="weekday[]" value="4" autocomplete="off"
                                                                        @if(isset($daywiseScheduleTimer) && in_array(4, $daywiseScheduleTimer)) {{'checked'}} @endif> Thu
                                                                    </label>
                                                                    <label class="btn ">
                                                                        <input type="checkbox" id="fri" name="weekday[]" value="5" autocomplete="off"
                                                                        @if(isset($daywiseScheduleTimer) && in_array(5, $daywiseScheduleTimer)) {{'checked'}} @endif> Fri
                                                                    </label>
                                                                    <label class="btn ">
                                                                        <input type="checkbox" id="sat" name="weekday[]" value="6" autocomplete="off"
                                                                        @if(isset($daywiseScheduleTimer) && in_array(6, $daywiseScheduleTimer)) {{'checked'}} @endif> Sat
                                                                    </label>
                                                                </div>
                                                                <hr/>
                                                                <div>
                                                                    <div class="form-group">
                                                                        <label for="day_schedule_post">Select Time</label>
                                                                        <div class="form-group">
                                                                            <input type="text" class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 datetimepicker-input" id="day_schedule_post_daterange" name="day_wise_datetime" placeholder="Select date & time"  data-toggle="datetimepicker" data-target="#day_schedule_post_daterange"/>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <hr>
                                                                <div>
                                                                    <label>Select types</label>
                                                                    <div class="radio-inline">
                                                                        <label class="radio radio-rounded">
                                                                            <input type="radio" name="mediaSelectionType" value="0"
                                                                            @if(isset($mediaSelectionType) && $mediaSelectionType == 0 || !isset($mediaSelectionType) ) {{ 'checked' }} @endif/>
                                                                            <span></span>
                                                                            All images
                                                                        </label>
                                                                        <label class="radio radio-rounded">
                                                                            <input type="radio" name="mediaSelectionType" value="1"
                                                                            @if(isset($mediaSelectionType) && $mediaSelectionType == 1 ) {{ 'checked' }} @endif/>
                                                                            <span></span>
                                                                            Single image
                                                                        </label>
                                                                        <label class="radio radio-rounded">
                                                                            <input type="radio" name="mediaSelectionType" value="2"
                                                                            @if(isset($mediaSelectionType) && $mediaSelectionType == 2) {{ 'checked' }} @endif/>
                                                                            <span></span>
                                                                            Random images
                                                                        </label>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div class="d-flex justify-content-around">
                                                                <button type="button" name="status" value="draft_scheduling" class="publishContentSubmit btn text-hover-success font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-4">Draft</button>

                                                                <button type="button" name="status" value="scheduling" class="publishContentSubmit btn text-hover-success font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 col-4">Update schedule</button>
                                                            </div>
                                                        </div>
                                                        <!-- end::Schedule type -->

                                                        @if(isset($mediaUrl) && $mediaUrl)
                                                            @foreach($mediaUrl as $key => $media)
                                                                @if($mediaData['type'] == 'image')
                                                                    <input type='hidden' name='mediaUrl[]' class='image{{$key}}' value="{{$media}}">
                                                                @elseif($mediaData['type'] == 'video')
                                                                    <input type='hidden' name='videoUrl[]' class='image{{$key}}' value="{{$media}}">
                                    @endif
                                    @endforeach
                                    @endif
                                </form>
                            </div>
                        </div>
                    </div>
                    <div class="col-xl-6 col-sm-12">
                        @include('contentstudio::scheduling.components._draft_preview')
                    </div>
                </div>
                <!--end::Schedule-->
            </div>
            <!--end::Container-->
        </div>
    <!--end::Entry-->
	</div>
@endsection

@section('scripts')
    <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
    <script>
        {!! file_get_contents(Module::find('ContentStudio')->getPath() . '/js/scheduling.js'); !!}
    </script>
    <script src="{{asset('plugins/custom/dropify/dist/js/dropify.min.js') }}"></script>
    <script src="{{asset('plugins/custom/emojionearea/js/emojionearea.min.js') }}"></script>
{{--    <script src="https://cdnjs.cloudflare.com/ajax/libs/eonasdan-bootstrap-datetimepicker/4.17.49/js/bootstrap-datetimepicker.min.js"></script>--}}

    <!--end::Global Theme Bundle-->
    <!-- facebook , linkedin pages toggle -->
    <script>
        $(document).ready(function () {
            $('#schedule_normal_post_daterange').val(new Date(normaldate).toLocaleString("en-US", {timeZone: timezone}));
            $('#day_schedule_post_daterange').val(new Date(daywisedate).toLocaleString("en-US", {timeZone: timezone}))
        })
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

        $("#day_schedule_post_daterange").on("change.datetimepicker", function (e) {
            $('#day_schedule_post_daterange').datetimepicker('minDate', moment().add(3, 'minutes'));
        });

        $("#schedule_normal_post_daterange").on("change.datetimepicker", function (e) {
            $('#schedule_normal_post_daterange').datetimepicker('minDate', moment().add(3, 'minutes'));
        });

        // $("#day_wise_schedule_div").hide();
        $(".day_schedule_post").click(function () {
            if ($(this).is(":checked")) {
                $("#day_wise_schedule_div").show();
                $("#schedule_normal_div").hide();
                $("#schedule_post").prop("checked", false);
            } else {
                $("#day_wise_schedule_div").hide();
            }
        });
        $('#schedule_normal_post_daterange').datetimepicker();
        $('#day_schedule_post_daterange').datetimepicker();
        // schedule div toggle
        // $("#schedule_normal_div").hide();
        $(".schedule_normal_post").click(function () {
            if ($(this).is(":checked")) {
                $("#schedule_normal_div").show();
                $("#day_wise_schedule_div").hide();
                $("#day_schedule").prop("checked", false);
            } else {
                $("#schedule_normal_div").hide();
            }
        });

        // $("#day_wise_schedule_div").hide();
        $(".day_schedule_post").click(function () {
            if ($(this).is(":checked")) {
                $("#day_wise_schedule_div").show();
            } else {
                $("#day_wise_schedule_div").hide();
            }
        });

    </script>

    <script>
        let APP_URL = '<?php echo env('APP_URL'); ?>';
        {!! file_get_contents(Module::find('ContentStudio')->getPath() . '/js/files_uploading.js'); !!}
    </script>
@endsection
