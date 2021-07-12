@if(isset($socialAccounts) && !empty($socialAccounts))

<ul class="nav justify-content-center nav-pills" id="AddAccountsTab" role="tablist">
    @foreach($socialAccounts as $key => $socialAccount)
        <li class="nav-item">
            <a class="nav-link" id="{{$key}}-tab-accounts" data-toggle="tab" href="#{{$key}}-add-accounts">
                <span class="nav-text"><i class="fab fa-{{$key}} fa-2x"></i></span>
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
                            @if(($group == "account") || ($group == "page"))
                                <span>Choose {{ucwords($key)}} {{$group}} for posting </span>
                        @foreach($socialAccountArray as $group_key => $socialAccount)
                            @if($key == 'facebook')
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

                                            <!--begin::Data-->
                                            <span class="text-muted font-weight-bold">
                                                {{ $socialAccount->friendship_counts }} followers
                                            </span>
                                            <!--end::Data-->
                                        </div>
                                        <!--end::Info-->
                                    </div>
                                    <!--end::Section-->
                                    <!--begin::Checkbox-->
                                    <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4">
                                        <input type="checkbox" name="socialAccount[]" value="{{ $socialAccount->account_id }}" @if(isset($accountIds) && in_array($socialAccount->account_id, $accountIds)) {{ 'checked' }} @endif/>
                                        {{-- <input type="hidden" name="account_id[{{ $socialAccount->account_id }}]" value="{{ $socialAccount->account_id }}"> --}}
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
