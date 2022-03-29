
@if(isset($socialAccounts) && !empty($socialAccounts) && count($socialAccounts) > 0)

    <div class="col-md-8 px-0 accounts-border text-center">
        <h5>Social accounts</h5>
        <ul class="nav justify-content-center nav-pills mt-3" id="AddAccountsTab" role="tablist">
            @php $accountTypes = []; @endphp
            @foreach($socialAccounts as $key => $socialAccount)
                @php
                    array_push($accountTypes,$key);
                @endphp

            @endforeach
                @if(in_array("twitter",$accountTypes))
                    <li class="nav-item" data-toggle="tooltip" data-placement="top" title="Twitter">
                        <a class="nav-link" data-toggle="tab" id="twitter-tab-accounts" href="#twitter-add-accounts" aria-controls="twitter" >
                            <span class="nav-text"><i class="fab fa-twitter fa-2x"></i></span>
                        </a>
                    </li>
                @endif
                    @if(in_array("facebook",$accountTypes))
                        <li class="nav-item" data-toggle="tooltip" data-placement="top" title="Facebook">
                            <a class="nav-link" data-toggle="tab" id="facebook-tab-accounts" href="#facebook-add-accounts" aria-controls="facebook" >
                                <span class="nav-text"><i class="fab fa-facebook fa-2x"></i></span>
                            </a>
                        </li>
                    @endif
                    @if(in_array("linkedin",$accountTypes))
                        <li class="nav-item" data-toggle="tooltip" data-placement="top" title="LinkedIn">
                            <a class="nav-link" data-toggle="tab" id="linkedin-tab-accounts" href="#linkedin-add-accounts" aria-controls="linkedin" >
                                <span class="nav-text"><i class="fab fa-linkedin fa-2x"></i></span>
                            </a>
                        </li>
                    @endif
                    @if( in_array("instagram",$accountTypes))
                        <li class="nav-item" data-toggle="tooltip" data-placement="top" title="Instagram">
                            <a class="nav-link" data-toggle="tab" id="instagram-tab-accounts" href="#instagram-add-accounts" aria-controls="instagram" >
                                <span class="nav-text"><i class="fab fa-instagram fa-2x"></i></span>
                            </a>
                        </li>
                    @endif
        </ul>
    </div>
    <div class="col-md-4 px-0 text-center">
        <h5>Blog accounts</h5>
        <ul class="nav justify-content-center nav-pills mt-3" id="AddAccountsTab" role="tablist">
            @foreach($socialAccounts as $key => $socialAccount)
                @if($key !== "bitly" && $key=== 'tumblr')
                    <li class="nav-item" data-toggle="tooltip" data-placement="top" title="{{$key}}">
                        <a class="nav-link" data-toggle="tab" id="{{$key}}-tab-accounts" href="#{{$key}}-add-accounts"  aria-controls="{{$key}}" >
                            <span class="nav-text"><i class="fab fa-{{$key}} fa-2x"></i></span>
                        </a>
                    </li>
                @endif
            @endforeach
        </ul>
    </div>
    <span id="error-socialAccount" class="error-message form-text text-danger text-center"></span>
    <div class="col-md-12">


    <div class="tab-content mt-5" id="AddAccountsTabContent">
        @foreach($socialAccounts as $key => $socialAccountsGroups)
            <div class="tab-pane" id="{{$key}}-add-accounts" role="tabpanel" aria-labelledby="{{$key}}-tab-accounts">
                <div class="mt-3">
                    <div class="scroll scroll-pull" data-scroll="true" data-wheel-propagation="true" style="max-height: 300px;overflow-y: scroll;">
                        @foreach($socialAccountsGroups as $group => $socialAccountArray)
                            @if(($group === "account") || ($group === "page") || ($group === "business account") || ($group === "pages"))
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
                                        <li class="font-size-md font-weight-normal">Video aspect ratio should be from 4/5 to 16/9.</li>
                                        <li class="font-size-md font-weight-normal">Maximum video File size should be 100MB.</li>
                                    </ul>
                                @elseif(ucwords($key) === "Linkedin" && $group === "page")
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
                                @if($key === 'facebook')
                                @endif
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

                                        @if($socialAccount->account_type !== 6 && $socialAccount->account_type !== 16)
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
                                    <label class="custom-control custom-checkbox mr-5">
                                        <input type="checkbox" class="custom-control-input check_social_account" value="{{ $socialAccount->account_id }}"  name="socialAccount[]" acc_id="{{$socialAccount->account_id}}" @if(isset($accountIds) && in_array($socialAccount->account_id, $accountIds)) {{ 'checked' }} @endif>
                                        <span class="custom-control-label"></span>
                                    </label>

{{--                                    <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4">--}}
{{--                                        <input type="checkbox" name="socialAccount[]" value="{{ $socialAccount->account_id }}" class="check_social_account" acc_id="{{$socialAccount->account_id}}" @if(isset($accountIds) && in_array($socialAccount->account_id, $accountIds)) {{ 'checked' }} @endif/>--}}
{{--                                        <span></span>--}}
{{--                                    </label>--}}
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
    </div>
    @else
    <div class="col-md-12 px-0 text-center">
        <h4>Please add Social Accounts to Publish Posts  </h4>
    </div>
@endif
