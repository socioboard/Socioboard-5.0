
<div class="modal fade" id="resocioModal" tabindex="-1" role="dialog" aria-labelledby="resocioModalLabel"
     aria-hidden="true">
    <form id="one_click_form_id">
        @csrf
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="resocioModalLabel">Re-Socio</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <textarea class="form-control border border-light h-auto py-4 rounded-lg font-size-h6"
                                  name="normal_text_area" id="normal_post_area_id" rows="3" placeholder="Write something !" required></textarea>
                        <div class="error text-danger" id="text_area_error1"></div>
                    </div>

                    <div class="form-group">
                        <div class="input-icon">
                            <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 " id="outgoing_url_id"
                                   type="text" name="outgoing_url" autocomplete="off" placeholder="Enter Outgoing url"/>
                            <span><i class="fas fa-link"></i></span>
                            <div class="error text-danger" id="text_area_error2"></div>
                        </div>
                    </div>

                    <!-- image and video upload -->
                    <div class="row">
                        <div class="col-12" id="">
                            <ul id="media-list" class="clearfix">
                                <li id="selected_image_id">
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div id="aspect_ratio"></div>
                    <div class="error text-danger" id="add_image_error1"></div>
                    <!-- end of image and video upload -->
                    <!-- begin:Accounts list -->
                    <div class="error text-danger" id="add_account_error1"></div>
                    @if(isset($socialAccounts) && !empty($socialAccounts))
                        <ul class="nav justify-content-center nav-pills AddAccountsTab" id="AddAccountsTab" role="tablist">
                            @foreach($socialAccounts as $key => $socialAccount)
                                <li class="nav-item">
                                    <a class="nav-link" id="{{$key}}-tab-accounts" data-toggle="tab" href="#{{$key}}-add-accounts">
                                        <span class="nav-text"><i class="fab fa-{{$key}} fa-2x"></i></span>
                                        @if($key === 'linkedin-in')
                                            [pages]
                                        @endif
                                    </a>
                                </li>
                            @endforeach
                        </ul>

                        <div class="tab-content mt-5" id="AddAccountsTabContent">
                            @foreach($socialAccounts as $key => $socialAccountsGroups)
                                <div class="tab-pane" id="{{$key}}-add-accounts" role="tabpanel" aria-labelledby="{{$key}}-tab-accounts">
                                    <div class="mt-3">
                                        <div class="scroll scroll-pull" data-scroll="true" data-wheel-propagation="true" style="height: 180px;overflow-y: scroll;">
                                            @foreach($socialAccountsGroups as $group => $socialAccountArray)
                                                @if(($group == "account") || ($group == "page") || ($group == "business account"))
                                                    @if(ucwords($key) === "Twitter")
                                                        <ul class="schedule-social-tabs">
                                                            <li class="font-size-md font-weight-normal">The Character limit is 280.</li>
                                                            <li class="font-size-md font-weight-normal">You can only post four Images at a time.</li>
                                                        </ul>
                                                    @elseif(ucwords($key) === "Facebook")
                                                        <ul class="schedule-social-tabs">
                                                            <li class="font-size-md font-weight-normal">The Character limit is 5000.</li>
                                                            <li class="font-size-md font-weight-normal">You can only post four Images at a time.</li>
                                                        </ul>
                                                    @elseif(ucwords($key) === "Instagram")
                                                        <ul class="schedule-social-tabs">
                                                            <li class="font-size-md font-weight-normal">The Character limit is 2200.</li>
                                                            <li class="font-size-md font-weight-normal">You can only post one Image or a video at a time.</li>
                                                            <li class="font-size-md font-weight-normal">If You Select Multiple media files, then only first selected media will be published.</li>
                                                            <li class="font-size-md font-weight-normal">An Image or video for posting is required.</li>
                                                            <li class="font-size-md font-weight-normal">Image Pixel should be 1:1 resolution.</li>
                                                        </ul>
                                                    @elseif(ucwords($key) === "Linkedin" || ($key) === "linkedin-in")
                                                        <ul class="schedule-social-tabs">
                                                            <li class="font-size-md font-weight-normal">The Character limit is 700.</li>
                                                            <li class="font-size-md font-weight-normal">You can only post one Image or a video at a time.</li>
                                                            <li class="font-size-md font-weight-normal">If You Select Multiple media files, then only first selected media will be published.</li>
                                                        </ul>
                                                    @elseif(ucwords($key) === "Tumblr")
                                                        <ul class="schedule-social-tabs">
                                                            <li class="font-size-md font-weight-normal">You can only post one Image or a video at a time.</li>
                                                            <li class="font-size-md font-weight-normal">Media size should be less than 10MB .</li>
                                                            <li class="font-size-md font-weight-normal">If You Select Multiple media files, then only first selected media will be published.</li>
                                                        </ul>
                                                    @endif
                                                    <span>Choose {{ucwords($key)}} {{$group}} for posting </span>
                                                    @foreach($socialAccountArray as $group_key => $socialAccount)
                                                        @if($key == 'facebook')
                                                        @endif
                                                    <!--begin::Page-->
                                                        <div class="d-flex align-items-center flex-grow-1">
                                                            <!--begin::Facebook Fanpage Profile picture-->
                                                            <div class="symbol symbol-45 symbol-light mr-5">
                                        <span class="symbol-label">
<img src="{{isset($socialAccount->profile_pic_url) ?  $socialAccount->profile_pic_url : null}}"  onerror=" this.onerror=null;this.src='https://s.pinimg.com/images/user/default_600.png';" class="w-100 align-self-center" alt=""/>                                        </span>
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
                                                                @if($socialAccount->account_type !== 6)
                                                                    <!--begin::Data-->
                                                                        <span class="text-muted font-weight-bold">
                                                                            {{ $socialAccount->friendship_counts }} followers
                                                                        </span>
                                                                @endif
                                                                <!--end::Data-->
                                                                </div>
                                                                <!--end::Info-->
                                                            </div>
                                                            <!--end::Section-->
                                                            <!--begin::Checkbox-->
                                                            <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4">
                                                                <input type="checkbox" name="socialAccount[]" value="{{ $socialAccount->account_id }}" @if(isset($accountIds) && in_array($socialAccount->account_id, $accountIds)) {{ 'checked' }} @endif/>
                                                                <span></span>
                                                            </label>
                                                            <!--end::Checkbox-->
                                                        </div>
                                                        <!--end::Page-->
                                                    @endforeach
                                                @endif
                                            @endforeach
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                @endif
                <!-- end:Accounts list -->
                </div>

                <div class="modal-footer">
                    <button type="submit"  class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" form="checkRoute"><i class="fas fa-history fa-fw"></i>Schedule</button>
                    <button type="button" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" onclick="draftPostFunction(0);">Draft</button>
                    <button type="button" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" onclick="draftPostFunction(1);">Post
                    </button>
                </div>
            </div>
        </div>

    </form>
</div>

<script>
    let imageLink=$('#image_URLS').attr('src');
$(".schedule-div").css({
        display: "none"
    });
    $(".schedule-post-btn").click(function () {
        $(".schedule-div").css({
            display: "block"
        });
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

