@php
    $content = '';
    $content .= isset($mediaData) && isset($mediaData['title']) ? $mediaData['title'].' ' : '';
    $content .= isset($mediaData) && isset($mediaData['description']) ? $mediaData['description'] : '';
@endphp
<!-- begin::Re-socio-->
<div class="modal fade" id="resocioModal" tabindex="-1" role="dialog" aria-labelledby="resocioModalLabel" aria-hidden="true">
    <link rel="stylesheet"  type="text/css" href="assets/plugins/custom/emojionearea/css/emojionearea.min.css" />
    <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="resocioModalLabel">Re-Socio</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <i aria-hidden="true" class="ki ki-close"></i>
                </button>
            </div>
            <form action="{{ route('publish_content.share') }}" id="publishContentForm" method="POST">
                <div class="modal-body">
                    <div class="form-group">
                        <textarea class="form-control border border-light h-auto py-4 rounded-lg font-size-h6" id="normal_post_area" name="content" rows="3" placeholder="Write something !" >{!! $content !!}</textarea>
                        <span id="error-content" class="error-message form-text text-danger"></span>
                    </div>
                    <div class="form-group">
                        <div class="input-icon">
                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" id="outgoing_url" type="text" name="outgoingUrl" autocomplete="off" placeholder="Enter Outgoing Url"
                                   value="{!! isset($mediaData) && isset($mediaData['sourceUrl']) ? $mediaData['sourceUrl'] : null !!}" />
                            <span><i class="fas fa-link"></i></span>
                        </div>
                        <span id="error-outgoingUrl" class="error-message form-text text-danger"></span>
                    </div>
                    <input type="hidden" id="accounttypes" name="accountTypes">
                    <!-- image and video upload -->
                    <div class="row">
                        <div class="col-12" id="">
                            <ul id="media-list" class="clearfix">
                                @if(isset($mediaData['isType']) && $mediaData['isType'] !== 'no media')
                                <li class="mediaDivs">
                                    @if(isset($mediaData['type']) && $mediaData['type'] == 'image')
                                        @if(isset($mediaData) && isset($mediaData['mediaUrl']))
                                            <img src="{!! $mediaData['mediaUrl'] !!}" style="object-fit: contain;" />
                                        @else
                                            <img src="{{asset('/media/svg/illustrations/dashboard-boy.svg') }}" style="object-fit: contain;" />
                                        @endif
                                    @elseif(isset($mediaData['type']) && $mediaData['type'] == 'video')
                                    <video  autoplay controls style="object-fit: contain;">
                                        <source src="{{$mediaData['mediaUrl']}}">
                                    </video>
                                @endif
                                <!-- sample code for video added -->
                                        <div class="thumb-count"></div>
                                </li>
                                @endif
                                <li class="myupload">
                                  <span>
                                    <i class="fa fa-plus" aria-hidden="true"></i>
                                        @if(isset($mediaData['type']) && $mediaData['type'] == 'image')
                                          <input type="file" click-type="type2" id="picupload" class="picupload"
                                                 name="file[]" multiple accept=".jpg, .png, .jpeg" style="width: 100px"
                                                 title="Click to Add File"/>
                                      @elseif(isset($mediaData['type']) && $mediaData['type'] == 'video')
                                          <input type="file" click-type="type2" id="picupload" class="picupload"
                                                 name="file[]" multiple accept="video/*" style="width: 100px"
                                                 title="Click to Add File"/>
                                      @else
                                          <input type="file" click-type="type2" id="picupload" class="picupload"
                                                 name="file[]" multiple accept="video/*,.jpg, .png, .jpeg"
                                                 style="width: 100px" title="Click to Add File"/>
                                      @endif
                                      @if(isset($mediaData['type']) && $mediaData['type'] == 'image')
                                          <input type="hidden" name="mediaUrl" id="media_url"
                                                 value="{!! isset($mediaData) && isset($mediaData['mediaUrl']) ? $mediaData['mediaUrl'] : null !!}">
                                      @else
                                          <input type="hidden" name="mediaUrl" id="media_url"
                                                 value="{!! isset($mediaData) && isset($mediaData['mediaUrl']) ? $mediaData['mediaUrl'] : null !!}">
                                      @endif

                                  </span>
                                </li>
                            </ul>
                            <span id="error-file" class="error-message form-text text-danger"></span>
                        </div>
                    </div>
                    <!-- end of image and video upload -->
                @if(isset($socialAccounts) && !empty($socialAccounts))
                    <!-- begin:Accounts list -->

                        <ul class="nav justify-content-center nav-pills" id="AddAccountsTab" role="tablist">
                                @foreach($socialAccounts as $key => $socialAccount)
                                    <li class="nav-item">
                                            <a class="nav-link" id="{{$key}}-tab-accounts" data-toggle="tab" href="#{{$key}}-add-accounts">
                                                <span class="nav-text"><i class="fab fa-{{$key}} fa-2x"></i>
                                                    @if($key === 'linkedin-in')
                                                        [pages]
                                                    @endif
                                                </span>
                                            </a>
                                        </li>
                                @endforeach
                            </ul>
                            <span id="error-socialAccount" class="error-message form-text text-danger text-center"></span>
                            <div class="tab-content mt-5" id="AddAccountsTabContent">
                                @foreach($socialAccounts as $key => $socialAccountsGroups)
                                    <div class="tab-pane" id="{{$key}}-add-accounts" role="tabpanel" aria-labelledby="{{$key}}-tab-accounts">
                                        <div class="mt-3">
                                            <div class="scroll scroll-pull" data-scroll="true" data-wheel-propagation="true" style="height: 180px;overflow-y: scroll;">
                                                @foreach($socialAccountsGroups as $group => $socialAccountArray)
                                                    @if(($group === "account") || ($group === "page") || ($group === "business account"))
                                                        @if(ucwords($key) === "Twitter")
                                                            <ul class="schedule-social-tabs">
                                                                <li class="font-size-md font-weight-normal">Character limit is 280.</li>
                                                                <li class="font-size-md font-weight-normal">You can post max 4 images at a time.</li>
                                                            </ul>
                                                        @elseif(ucwords($key) === "Facebook")
                                                            <ul class="schedule-social-tabs">
                                                                <li class="font-size-md font-weight-normal">Character limit is 5000.</li>
                                                                <li class="font-size-md font-weight-normal">You can post max 4 images at a time.</li>
                                                            </ul>
                                                        @elseif(ucwords($key) === "Instagram")
                                                            <ul class="schedule-social-tabs">
                                                                <li class="font-size-md font-weight-normal">Character limit is 2200.</li>
                                                                <li class="font-size-md font-weight-normal">You can post max 1 image or 1 video at a time.</li>
                                                                <li class="font-size-md font-weight-normal">Image or video for posting is required.</li>
                                                            </ul>
                                                        @elseif(ucwords($key) === "Linkedin" || ($key) === "linkedin-in")
                                                            <ul class="schedule-social-tabs">
                                                                <li class="font-size-md font-weight-normal">Character limit is 700.</li>
                                                                <li class="font-size-md font-weight-normal">You can post max 1 image or 1 video at a time.</li>
                                                            </ul>
                                                        @elseif(ucwords($key) === "Tumblr")
                                                            <ul class="schedule-social-tabs">
                                                                <li class="font-size-md font-weight-normal">You can post max 1 image or 1 video at a time.</li>
                                                                <li class="font-size-md font-weight-normal">Media size should be less than 10MB .</li>
                                                            </ul>
                                                        @endif
                                                    @if($key === 'linkedin-in')
                                                        <?php $key='LinkedIn Pages'?>
                                                            @endif
                                                            <span>Choose {{ucwords($key)}} {{$group}} for posting </span>
                                                        @foreach($socialAccountArray as $group_key => $socialAccount)
                                                            @if($socialAccount->join_table_teams_social_accounts->is_account_locked == false)
                                                            <!--begin::Page-->
                                                                <div class="d-flex align-items-center flex-grow-1">
                                                                    <!--begin::Facebook Fanpage Profile picture-->
                                                                    <div class="symbol symbol-45 symbol-light mr-5">
                                                                    <span class="symbol-label">
                                                                        <img src="{{isset($socialAccount->profile_pic_url) ?  $socialAccount->profile_pic_url : null}}" class="w-100 align-self-center" alt=""/>
                                                                    </span>
                                                                    </div>
                                                                    <!--end::Facebook Fanpage Profile picture-->
                                                                    <!--begin::Section-->
                                                                    <div class="d-flex flex-wrap align-items-center justify-content-between w-100">
                                                                        <!--begin::Info-->
                                                                        <div class="d-flex flex-column align-items-cente py-2 w-75">
                                                                            <!--begin::Title-->
                                                                            <a href="javascript:;" class="font-weight-bold text-hover-primary font-size-lg mb-1">
                                                                                {{ $socialAccount->first_name.' '. $socialAccount->last_name }}
                                                                            </a>
                                                                            <!--end::Title-->

                                                                            <!--begin::Data-->
                                                                            <span class="text-muted font-weight-bold">
                                                                            {{-- 2M followers --}}
                                                                                {{ $socialAccount->friendship_counts }} followers
                                                                        </span>
                                                                            <!--end::Data-->
                                                                        </div>
                                                                        <!--end::Info-->
                                                                    </div>
                                                                    <!--end::Section-->
                                                                    <!--begin::Checkbox-->
                                                                    <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4">
                                                                        <input type="checkbox" class="custom-control-input check_social_account2" name="socialAccount[]" value="{{ $socialAccount->account_id }}" acc_id="{{ $socialAccount->account_id }}"/>
                                                                        {{-- <input type="hidden" name="account_id[{{ $socialAccount->account_id }}]" value="{{ $socialAccount->account_id }}"> --}}
                                                                        <span></span>
                                                                    </label>
                                                                    <!--end::Checkbox-->
                                                                </div>
                                                                <!--end::Page-->
                                                                @endif
                                                        @endforeach
                                                    @endif
                                                @endforeach
                                            </div>
                                        </div>
                                    </div>
                                @endforeach
                            </div>
                        <input type="hidden"  id="twitterAccountsIds2" data-list="{{json_encode($twitterAccountsIds) }}">
                        <input type="hidden" id="facebookAccountsIds2" data-list="{{json_encode($facebookAccountsIds) }}">
                        <input type="hidden" id="linkedinAccountsIds2" data-list="{{json_encode($linkedinAccountsIds) }}">
                        <input type="hidden" id="instagramAccountsIds2" data-list="{{json_encode($instagramAccountsIds) }}">
                        <input type="hidden" id="tumblrAccountsIds2" data-list="{{json_encode($tumblrAccountsIds) }}">
                        <input type="hidden" id="selectedAccountIds2" data-list="{{json_encode($accountIds) }}">
                        <input type="hidden" id="instagramInResocio" name="instagramInResocio">

                        <!-- end:Accounts list -->
                    @endif
                </div>


                <div class="modal-footer">
                    <button type="button"
                            class="btn text-hover-warning font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 schedule-post-btn">Schedule post</button>
                    <button type="button" name="status" value="0" class="publishContentSubmit btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 ">Draft</button>
                    <button type="button" name="status" value="1" class="publishContentSubmit btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3 ">Post</button>
                </div>

                <!-- begin::Schedule type -->
                <div class="schedule-div mt-5 px-5" style="display:none;">
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
                    </div>

                    <div class="d-flex justify-content-end mb-5">
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
<script>
    $(document.body).on('click', '.check_social_account2', function (e) {
        let instagramInResocio=false;
        let append = '';
        SelectedId = "";
        let twitter = 0;
        let facebook = 0;
        let linkedin = 0;
        let instagram = 0;
        let tumblr = 0;
        let facebookAccountsIds2 ;
        let twitterAccountsIds2 ;
        let linkedinAccountsIds2 ;
        let instagramAccountsIds2 ;
        let tumblrAccountsIds2 ;
        let selectedAccountIds2 ;
        twitterAccountsIds2 = ($("#twitterAccountsIds2").data('list')) ? $("#twitterAccountsIds2").data('list') : [];
        console.log(twitterAccountsIds2,'twitterAccountstwitterAccounts');
        facebookAccountsIds2 = $("#facebookAccountsIds2").data('list');
        linkedinAccountsIds2 = $("#linkedinAccountsIds2").data('list');
        instagramAccountsIds2 = $("#instagramAccountsIds2").data('list');
        tumblrAccountsIds2 = $("#tumblrAccountsIds2").data('list');
        selectedAccountIds2 = ($("#selectedAccountIds2").data('list')) ? $("#selectedAccountIds2").data('list') : [];
        selectedAccountIds2 = selectedAccountIds2.map(x => +x);
        if ($(this).is(':checked')) {
            selectedAccountIds2.push(Number($(this).attr('acc_id')));
            SelectedId = Number($(this).attr('acc_id'));
        } else {
            let index = selectedAccountIds2.indexOf(Number($(this).attr('acc_id')));
            SelectedId = Number($(this).attr('acc_id'));
            if (index > -1) {
                selectedAccountIds2.splice(index, 1);
            }
        }
        selectedAccountIds2.forEach(function (ids) {
            if ((selectedAccountIds2.length > 0) && (twitterAccountsIds2.includes(Number(ids)))) twitter++;
            if ((selectedAccountIds2.length > 0) && (facebookAccountsIds2.includes(Number(ids)))) facebook++;
            if ((selectedAccountIds2.length > 0) && (linkedinAccountsIds2.includes(Number(ids)))) linkedin++;
            if ((selectedAccountIds2.length > 0) && (instagramAccountsIds2.includes(Number(ids)))) instagram++;
            if ((selectedAccountIds2.length > 0) && (tumblrAccountsIds2.includes(Number(ids)))) tumblr++;
        });
        let chekMedia = $('ul').find('.mediaDivs').length;
        if (instagram > 0 && chekMedia === 0) {
            instagramInResocio=true;
            $("#instagramInResocio").attr("value",true);
        } else {
            $("#instagramInResocio").attr("value",false);
            instagramInResocio=false;
        }
    });



    $(".schedule-post-btn").click(function () {
        $(".schedule-div").removeAttr( 'style' );
        $(".schedule-div").attr("style","display:block;");
    });


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
    </script>

<!-- end::Re-socio-->