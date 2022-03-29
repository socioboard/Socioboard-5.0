@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} - Accounts</title>
@endsection
@section('content')

    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">
        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Accounts-->
                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-12 card-stretch" id="ss-accountsDiv">
                        <div class="card card-custom gutter-b card-stretch acountDivCount">
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Accounts</h3>
                                <div class="card-toolbar">
                                    <a href="javascript:;" class="btn btn-sm font-weight-bold mr-5 SendInviteDIv"
                                       data-toggle="modal"
                                       data-target="#inviteModal">
                                        Send Invite
                                    </a>
                                    <a href="javascript:;" class="btn btn-sm font-weight-bold" data-toggle="modal"
                                       data-target="#addAccountsModal">
                                        <i class="fas fa-plus fa-fw"></i> Add Accounts
                                    </a>
                                    <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                         title="Add to custom Reports"><i class="fa fa-plus fa-md"
                                                                          aria-hidden="true"></i>
                                        <span node-id="ss-accountsDiv_md12" class="ss addtcartclose"></span>
                                    </div>
                                    <span class="spinner spinner-primary spinner-center" id="ss-accountsDiv_md12"
                                          style="
    display: none;"></span>
                                </div>
                            </div>
                            <!--end::Header-->

                            <!--begin::Body-->
                            <div class="card-body pt-2 position-relative overflow-hidden">
                                <div class="row d-flex justify-content-center">
                                    <?php $ytcount = $facebook = $twitter = $instagram = $linkedin = $facebookpage = $linkedinBusiness = $instagramPages = $tumblr = $pinterest = $tiktok = 0;
                                    ?>
                                    @if(isset($accountsCount))
                                        @if($accountsCount->code === 200)
                                            @foreach($accountsCount->data as $data)
                                                @switch($data->account_type)
                                                    @case(9)
                                                    <?php $ytcount = $data->count  ?>
                                                    @break
                                                    @case(4)
                                                    <?php $twitter = $data->count  ?>
                                                    @break
                                                    @case(5)
                                                    <?php $instagram = $data->count  ?>
                                                    @break
                                                    @case(1)
                                                    <?php $facebook = $data->count  ?>
                                                    @break
                                                    @case(6)
                                                    <?php $linkedin = $data->count  ?>
                                                    @break
                                                    @case(2)
                                                    <?php $facebookpage = $data->count  ?>
                                                    @break
                                                    @case(7)
                                                    <?php $linkedinBusiness = $data->count  ?>
                                                    @break
                                                    @case(12)
                                                    <?php $instagramPages = $data->count  ?>
                                                    @break
                                                    @case(16)
                                                    <?php $tumblr = $data->count  ?>
                                                    @break
                                                    @case(11)
                                                    <?php $pinterest = $data->count  ?>
                                                    @break
                                                    @case(18)
                                                    <?php $tiktok = $data->count  ?>
                                                    @break
                                                @endswitch
                                            @endforeach
                                        @endif
                                    @else
                                    @endif
                                    <div
                                            class="col-md-1 col-sm-12 card bg-facebook border-0 px-6 py-8 rounded-xl mr-4 mb-7">
                                                    <span class="svg-icon svg-icon-3x d-block my-2">
                                                         <i class="fab fa-facebook-f fa-2x"></i>
                                                        <b class="font-weight-bold font-size-h2 float-right">{{$facebook+$facebookpage}}</b>
                                                    </span>
                                    </div>
                                    <div
                                            class="col-md-1 col-sm-12 card bg-twitter border-0 px-6 py-8 rounded-xl mr-4 mb-7">
                                                    <span class="svg-icon svg-icon-3x d-block my-2">
                                                            <i class="fab fa-twitter fa-2x"></i>
                                                        <b class="font-weight-bold font-size-h2 float-right">{{$twitter}}</b>
                                                    </span>
                                    </div>
                                    <div
                                            class="col-md-1 col-sm-12 card bg-instagram border-0 px-6 py-8 rounded-xl mr-4 mb-7">
                                                    <span class="svg-icon svg-icon-3x d-block my-2">
                                                            <i class="fab fa-instagram fa-2x"></i>
                                                        <b class="font-weight-bold font-size-h2 float-right">{{$instagram+$instagramPages}}</b>
                                                    </span>
                                    </div>
                                    <div
                                            class="col-md-1 col-sm-12 card bg-linkedin border-0 px-6 py-8 rounded-xl mr-4 mb-7">
                                                    <span class="svg-icon svg-icon-3x d-block my-2">
                                                            <i class="fab fa-linkedin fa-2x"></i>
                                                        <b class="font-weight-bold font-size-h2 float-right">{{$linkedin+$linkedinBusiness}}</b>
                                                    </span>
                                    </div>
                                    <div
                                            class="col-md-1 col-sm-12 card bg-youtube border-0 px-6 py-8 rounded-xl mr-4 mb-7">
                                                    <span class="svg-icon svg-icon-3x d-block my-2">
                                                            <i class="fab fa-youtube fa-2x"></i>
                                                        <b class="font-weight-bold font-size-h2 float-right">{{$ytcount}}</b>
                                                    </span>
                                    </div>
                                    <div
                                            class="col-md-1 col-sm-12 card bg-pinterest border-0 px-6 py-8 rounded-xl mr-4 mb-7">
                                                    <span class="svg-icon svg-icon-3x d-block my-2">
                                                            <i class="fab fa-pinterest fa-2x"></i>
                                                        <b class="font-weight-bold font-size-h2 float-right">{{$pinterest}}</b>
                                                    </span>
                                    </div>
                                    <div
                                            class="col-md-1 col-sm-12 card bg-tumblr border-0 px-6 py-8 rounded-xl mr-4 mb-7">
                                                    <span class="svg-icon svg-icon-3x d-block my-2">
                                                            <i class="fab fa-tumblr fa-2x"></i>
                                                        <b class="font-weight-bold font-size-h2 float-right">{{$tumblr}}</b>
                                                    </span>
                                    </div>
                                        <div class="col-md-1 col-sm-12 card bg-tiktok border-0 px-6 py-8 rounded-xl mr-4 mb-7">
                                      <span class="svg-icon svg-icon-3x d-block my-2">
                                      <i class="fab fa-tiktok fa-2x"></i>
                                       <b class="font-weight-bold font-size-h2 float-right">{{$tiktok}}</b>
                                      </span>
                                    </div>

                                    {{--                                    <div--}}
                                    {{--                                            class="col-md-1 col-sm-12 card bg-google border-0 px-6 py-8 rounded-xl mr-4 mb-7">--}}
                                    {{--                                                    <span class="svg-icon svg-icon-3x d-block my-2">--}}
                                    {{--                                                            <i class="fab fa-google fa-2x"></i>--}}
                                    {{--                                                        <b class="font-weight-bold font-size-h2 float-right">0</b>--}}
                                    {{--                                                    </span>--}}
                                    {{--                                    </div>--}}
                                    <div class="col-md-1 col-sm-12 card border-0 px-3 py-4 rounded-xl mr-4 mb-7 text-center">
                                        <span class="post-count">{{$facebook+$facebookpage+$twitter+$instagram+$instagramPages+$linkedin+$linkedinBusiness+$ytcount+$pinterest+$tumblr+$tiktok}}</span>
                                        Total Accounts
                                    </div>
                                </div>

                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Accounts-->
                    </div>
                </div>

                <div class="row searchFilterDiv">
                    <div class="col-md-3">
                        <div class="form-group">
                            <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                    onchange="updateStartValue(this)">
                                <option selected disabled>Select Star</option>
                                <option value="One">One</option>
                                <option value="Two">Two</option>
                                <option value="Three">Three</option>
                                <option value="Four">Four</option>
                                <option value="Five">Five</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="form-group">
                            <select class="form-control select2 form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"
                                    id="sb_select2_accounts" name="param" multiple="multiple">
                                <option value="1">Facebook</option>
                                <option value="2">Facebook Pages</option>
                                <option value="4">Twitter</option>
                                <option value="5">Instagram</option>
                                <option value="12">Instagram Business</option>
                                <option value="6">Linkedin</option>
                                <option value="7">Linkedin Pages</option>
                                <option value="9">Youtube</option>
                                <option value="16">Tumblr</option>
                                <option value="11">Pinterest</option>
                                <option value="18">TikTok</option>
                            </select>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="form-group">
                            <div class="input-icon">
                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                       id="userName"
                                       type="text" name="username" autocomplete="off" placeholder="User Name"/>
                                <span><i class="far fa-user"></i></span>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-2">
                        <button type="submit" class="btn font-weight-bolder font-size-h6 px-8 py-4"
                                onclick="searchAccountsFilter()">Search
                        </button>
                    </div>
                </div>

                <div class="row card-stretch" id="accountsDIv">
                    <?php $count = 1; ?>
                    <?php $profileURLS = ''; ?>
                    <?php $profile = ''; ?>
                    @if(isset($ErrorMessage))
                        <div style="color: red;text-align:center;">
                            {{$ErrorMessage}}
                        </div>
                    @else
                        @if(isset($accounts))
                            <?php $count = 0 ?>
                            @if($accounts->code  === 200 )
                                @if(count($accounts->data->teamSocialAccountDetails[0]->SocialAccount)!==0 )
                                    @foreach($accounts->data->teamSocialAccountDetails[0]->SocialAccount as $account)
                                        @if($account->account_type !== 13 && $account->account_type !== 14)
                                                <?php $count++; ?>
                                            <?php $profile = $account->profile_url;?>
                                            @if($account->account_type === 1)
                                                <?php $profileURLS = env('APP_URL') . "feeds/facebook" . $account->account_id;?>
                                            @elseif($account->account_type === 2)
                                                <?php $profileURLS = env('APP_URL') . "feeds/fbPages" . $account->account_id;?>
                                                <?php $profile = "https://www.facebook.com/{{$account->user_name}}";?>
                                            @elseif($account->account_type === 9)
                                                <?php $profileURLS = env('APP_URL') . "feeds/youtube" . $account->account_id;?>
                                            @elseif($account->account_type === 4)
                                                <?php $profileURLS = env('APP_URL') . "feeds/twitter" . $account->account_id;?>
                                            @elseif($account->account_type === 5)
                                                <?php $profileURLS = env('APP_URL') . "feeds/instagram" . $account->account_id;?>
                                            @elseif($account->account_type === 16)
                                                <?php $profileURLS = env('APP_URL') . "feeds/Tumblr" . $account->account_id;?>
                                            @elseif($account->account_type === 11)
                                                <?php $profileURLS = env('APP_URL') . "show-boards/Pinterest" . $account->account_id;?>
                                            @elseif($account->account_type === 12)
                                                <?php $profileURLS = env('APP_URL') . "feeds/Business" . $account->account_id;?>
                                            @elseif($account->account_type === 7)
                                                <?php $profileURLS = env('APP_URL') . "feeds/linkedIn" . $account->account_id;?>
                                            @endif
                                            <div class="col-xl-3" id="accountsSection{{$account->account_id}}">
                                                <div class="card card-custom gutter-b card-stretch">
                                                    <div
                                                            class="card-body pt-2 position-relative overflow-hidden rounded  ribbon ribbon-top ribbon-ver">
                                                        @if($account->account_type === 1)
                                                            <div class="ribbon-target bg-facebook"
                                                                 style="top: -2px; right: 20px;">
                                                                <i class="fab fa-facebook-f"></i>
                                                            </div>
                                                        @elseif($account->account_type === 2)
                                                            <div class="ribbon-target bg-facebook"
                                                                 style="top: -2px; right: 20px;">
                                                                <i class="fab fa-facebook-f mr-1">p</i>
                                                            </div>
                                                        @elseif($account->account_type === 4)
                                                            <div class="ribbon-target" style="top: -2px; right: 20px;">
                                                                <i class="fab fa-twitter"></i>
                                                            </div>
                                                        @elseif($account->account_type === 5 )
                                                            <div class="ribbon-target bg-instagram"
                                                                 style="top: -2px; right: 20px;">
                                                                <i class="fab fa-instagram"></i>
                                                            </div>
                                                        @elseif($account->account_type === 12 )
                                                            <div class="ribbon-target bg-instagram"
                                                                 style="top: -2px; right: 20px;">
                                                                <i class="fab fa-instagram mr-1"> b</i>
                                                            </div>
                                                        @elseif($account->account_type === 6  )
                                                            <div class="ribbon-target bg-linkedin"
                                                                 style="top: -2px; right: 20px;">
                                                                <i class="fab fa-linkedin"></i>
                                                            </div>
                                                        @elseif($account->account_type === 7  )
                                                            <div class="ribbon-target bg-linkedin"
                                                                 style="top: -2px; right: 20px;">
                                                                <i class="fab fa-linkedin mr-1"></i>Page
                                                            </div>
                                                        @elseif($account->account_type === 9 )
                                                            <div class="ribbon-target bg-youtube"
                                                                 style="top: -2px; right: 20px;">
                                                                <i class="fab fa-youtube"></i>
                                                            </div>
                                                        @elseif($account->account_type === 16 )
                                                            <div class="ribbon-target bg-tumblr"
                                                                 style="top: -2px; right: 20px;">
                                                                <i class="fab fa-tumblr"></i>
                                                            </div>
                                                        @elseif($account->account_type === 11 )
                                                            <div class="ribbon-target bg-pinterest"
                                                                 style="top: -2px; right: 20px;">
                                                                <i class="fab fa-pinterest"></i>
                                                            </div>
                                                        @elseif($account->account_type === 18 )
                                                            <div class="ribbon-target bg-tiktok"
                                                                 style="top: -2px; right: 20px;">
                                                                <i class="fab fa-tiktok"></i>
                                                            </div>
                                                        @endif
                                                    <!--begin::User-->
                                                        <div
                                                                class="d-flex align-items-center  ribbon ribbon-clip ribbon-left">
                                                            <div id="status{{$account->account_id}}">
                                                                @if($account->join_table_teams_social_accounts->is_account_locked == true)
                                                                    <div class="ribbon-target accounts-lock-unlock lockButtonDiv"
                                                                         style="top: 12px;"
                                                                         onclick="lock('{{$account->account_id}}',0 ,'profileDivButton{{$count}}','profile-name{{$count}}','{{$profileURLS}}','{{$profile}}')">
                                                                        <span class="ribbon-inner bg-danger"></span>
                                                                        <i
                                                                                class="fas fa-user-lock fa-fw mr-2 text-white"></i>
                                                                        Un-Lock
                                                                    </div>
                                                                @else
                                                                    <div class="ribbon-target accounts-lock-unlock lockButtonDiv"
                                                                         style="top: 80px;"
                                                                         onclick="lock('{{$account->account_id}}',1 ,'profileDivButton{{$count}}','profile-name{{$count}}', '{{$profileURLS}}','{{$profile}}')">
                                                                        <span class="ribbon-inner bg-info"></span>
                                                                        <i
                                                                                class="fas fa-lock-open fa-fw mr-2 text-white"></i>
                                                                        Lock
                                                                    </div>
                                                                @endif
                                                            </div>
                                                            <div
                                                                    class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                                                <div class="symbol-label"
                                                                     style="background-image:url({{$account->profile_pic_url}})"></div>
                                                                <i class="symbol-badge bg-success"></i>
                                                            </div>
                                                            <div class="social-accounts-dev ">
                                                                @if($account->join_table_teams_social_accounts->is_account_locked === false)
                                                                    @if($account->account_type === 2)
                                                                        <a href="https://www.facebook.com/{{$account->user_name}}"
                                                                           target="_blank"
                                                                           class="profile-name{{$count}} profileLinkDiv">
                                                                            {{$account->first_name}} {{substr($account->last_name, 0, 7)}}
                                                                        </a>
                                                                    @elseif($account->account_type === 1)
                                                                        <a class="profile-name{{$count}} profileLinkDiv">
                                                                            {{$account->first_name}} {{substr($account->last_name, 0, 7)}}
                                                                        </a>
                                                                    @elseif($account->account_type ===  18)
                                                                        <a class="profile-name{{$count}} profileLinkDiv">
                                                                            {{$account->user_name}}
                                                                        </a>
                                                                    @else
                                                                        <a href="{{$account->profile_url}}"
                                                                           target="_blank"
                                                                           class="profile-name{{$count}} profileLinkDiv">
                                                                            {{$account->first_name}} {{substr($account->last_name, 0, 7)}}
                                                                        </a>
                                                                    @endif
                                                                @else
                                                                    <a class="profile-name{{$count}} profileLinkDiv">
                                                                        {{$account->first_name}} {{substr($account->last_name, 0, 7)}}
                                                                    </a>
                                                            @endif
                                                            <!-- begin:account star rating -->
                                                                <div class="rating-css">
                                                                    <div class="star-icon">
                                                                        <input type="radio"
                                                                               <?php if ($account->rating === 1) echo "checked";?> name="rating1{{$account->account_id}}"
                                                                               id="rating1{{$account->account_id}}"
                                                                               onclick="ratingUpdate('1', '{{$account->account_id}}');">
                                                                        <label
                                                                                for="rating1{{$account->account_id}}"
                                                                                class="fas fa-star"></label>
                                                                        <input type="radio"
                                                                               <?php if ($account->rating == 2) echo "checked";?> name="rating1{{$account->account_id}}"
                                                                               id="rating2{{$account->account_id}}"
                                                                               onclick="ratingUpdate('2', '{{$account->account_id}}');">
                                                                        <label
                                                                                for="rating2{{$account->account_id}}"
                                                                                class="fas fa-star"></label>
                                                                        <input type="radio"
                                                                               <?php if ($account->rating == 3) echo "checked";?> name="rating1{{$account->account_id}}"
                                                                               id="rating3{{$account->account_id}}"
                                                                               onclick="ratingUpdate('3', '{{$account->account_id}}');">
                                                                        <label
                                                                                for="rating3{{$account->account_id}}"
                                                                                class="fas fa-star"></label>
                                                                        <input type="radio"
                                                                               <?php if ($account->rating == 4) echo "checked";?> name="rating1{{$account->account_id}}"
                                                                               id="rating4{{$account->account_id}}"
                                                                               onclick="ratingUpdate('4', '{{$account->account_id}}');">
                                                                        <label
                                                                                for="rating4{{$account->account_id}}"
                                                                                class="fas fa-star"></label>
                                                                        <input type="radio"
                                                                               <?php if ($account->rating == 5) echo "checked";?> name="rating1{{$account->account_id}}"
                                                                               id="rating5{{$account->account_id}}"
                                                                               onclick="ratingUpdate('5', '{{$account->account_id}}');">
                                                                        <label
                                                                                for="rating5{{$account->account_id}}"
                                                                                class="fas fa-star"></label>
                                                                    </div>
                                                                </div>
                                                                <!-- end:account star rating -->
                                                                <div class="mt-2">
                                                                    @if($account->join_table_teams_social_accounts->is_account_locked === false)
                                                                        @if($account->account_type === 1)
                                                                            <?php $profileURLS = env('APP_URL') . "feeds/facebook" . $account->account_id;?>
                                                                            <a id="profileDivButton"
                                                                               href="{{env('APP_URL')}}feeds/facebook{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDiv profileDivButton{{$count}}">Profile</a>
                                                                        @elseif($account->account_type === 2)
                                                                            <?php $profileURLS = env('APP_URL') . "feeds/fbPages" . $account->account_id;?>
                                                                            <a id="profileDivButton"
                                                                               href="{{env('APP_URL')}}feeds/fbPages{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDiv profileDivButton{{$count}}">Profile</a>
                                                                        @elseif($account->account_type === 9)
                                                                            <?php $profileURLS = env('APP_URL') . "feeds/youtube" . $account->account_id;?>
                                                                            <a id="profileDivButton"
                                                                               href="{{env('APP_URL')}}feeds/youtube{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDiv profileDivButton{{$count}}">Profile</a>
                                                                        @elseif($account->account_type === 4)
                                                                            <?php $profileURLS = env('APP_URL') . "feeds/twitter" . $account->account_id;?>
                                                                            <a id="profileDivButton"
                                                                               href="{{env('APP_URL')}}feeds/twitter{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDiv profileDivButton{{$count}}">Profile</a>
                                                                        @elseif($account->account_type === 5)
                                                                            <?php $profileURLS = env('APP_URL') . "feeds/instagram" . $account->account_id;?>
                                                                            <a id="profileDivButton"
                                                                               href="{{env('APP_URL')}}feeds/instagram{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDiv profileDivButton{{$count}}">Profile</a>
                                                                        @elseif($account->account_type === 16)
                                                                            <?php $profileURLS = env('APP_URL') . "feeds/Tumblr" . $account->account_id;?>
                                                                            <a id="profileDivButton"
                                                                               href="{{env('APP_URL')}}feeds/Tumblr{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDiv profileDivButton{{$count}}">Profile</a>
                                                                        @elseif($account->account_type === 11)
                                                                            <?php $profileURLS = env('APP_URL') . "show-boards/Pinterest" . $account->account_id;?>
                                                                            <a id="profileDivButton"
                                                                               href="{{env('APP_URL')}}show-boards/Pinterest{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDiv profileDivButton{{$count}}">Profile</a>
                                                                        @elseif($account->account_type === 12)
                                                                            <?php $profileURLS = env('APP_URL') . "feeds/Business{" . $account->account_id;?>
                                                                            <a id="profileDivButton"
                                                                               href="{{env('APP_URL')}}feeds/Business{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDiv profileDivButton{{$count}}">Profile</a>
                                                                        @elseif($account->account_type === 7)
                                                                            <?php $profileURLS = env('APP_URL') . "feeds/linkedIn{" . $account->account_id;?>
                                                                            <a id="profileDivButton"
                                                                               href="{{env('APP_URL')}}feeds/linkedIn{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDiv profileDivButton{{$count}}">Profile</a>
                                                                        @elseif($account->account_type === 18)
                                                                            <a href="{{env('APP_URL')}}feeds/TikTok{{$account->account_id}}"
                                                                               target="_blank"
                                                                               class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDiv profileDivButton">Profile</a>
                                                                        @endif
                                                                    @else
                                                                        <a href="#"
                                                                           target="_blank"
                                                                           id="profileDivButton{{$count}}"
                                                                           onclick="return false"
                                                                           title="The Account is  Locked"
                                                                           class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDiv profileDivButton{{$count}}">Profile</a>
                                                                    @endif
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <!--end::User-->

                                                        <!--begin::Contact-->
                                                        <div class="py-9">
                                                            <br>
                                                            </br>
                                                            <!--                                                                    -->
                                                            <div
                                                                    class="d-flex align-items-center justify-content-between mb-2">
                                                                @foreach($accounts->data->SocialAccountStats as $stats)
                                                                    @if($account->account_id === $stats->account_id)
                                                                        @switch($account->account_type)
                                                                            @case(4)
                                                                            <span class="font-weight-bold mr-2">Following:</span>
                                                                            <a href="#"
                                                                               class="text-hover-primary">{{$stats->following_count}}</a>
                                                                            @break
                                                                            @case(1)
                                                                            <span class="font-weight-bold mr-2">Page Count:</span>
                                                                            <a href="#"
                                                                               class="text-hover-primary">{{$stats->page_count}}</a>
                                                                            @break
                                                                            @case(2)
                                                                            <span class="font-weight-bold mr-2">Like counts:</span>
                                                                            <a href="#"
                                                                               class="text-hover-primary">{{$stats->total_like_count}}</a>
                                                                            @break
                                                                        @endswitch
                                                                    @endif
                                                                @endforeach
                                                            </div>
                                                            <div
                                                                    class="d-flex align-items-center justify-content-between mb-2">
                                                                @foreach($accounts->data->SocialAccountStats as $stats)
                                                                    @if($account->account_id === $stats->account_id)
                                                                        @switch($account->account_type)
                                                                            @case(4)
                                                                            <span class="font-weight-bold mr-2">Followers:</span>
                                                                            <a href="#"
                                                                               class="text-hover-primary">{{$stats->follower_count}}</a>
                                                                            @break
                                                                            @case(12)
                                                                            <span class="font-weight-bold mr-2">Followers:</span>
                                                                            <a href="#"
                                                                               class="text-hover-primary">{{$stats->follower_count}}</a>
                                                                            @break
                                                                            @case(7)
                                                                            <span class="font-weight-bold mr-2">Followers:</span>
                                                                            <a href="#"
                                                                               class="text-hover-primary">{{$stats->follower_count}}</a>
                                                                            @break
                                                                            @case(1)
                                                                            <span class="font-weight-bold mr-2">Followers:</span>
                                                                            <a href="#"
                                                                               class="text-hover-primary">{{$stats->friendship_count}}</a>
                                                                            @break
                                                                            @case(2)
                                                                            <span class="font-weight-bold mr-2">Followers:</span>
                                                                            <a href="#"
                                                                               class="text-hover-primary">{{$stats->follower_count}}</a>
                                                                            @break
                                                                            @case(9)
                                                                            <span class="font-weight-bold mr-2">Subscription Counts:</span>
                                                                            <a href="#"
                                                                               class="text-hover-primary">{{$stats->subscription_count}}</a>
                                                                            @break
                                                                            @case(16)
                                                                            <span class="font-weight-bold mr-2">Followers:</span>
                                                                            <a href="#"
                                                                               class="text-hover-primary">{{$stats->follower_count}}</a>
                                                                            @break
                                                                        @endswitch
                                                                    @endif
                                                                @endforeach
                                                            </div>
                                                            <div
                                                                    class="d-flex align-items-center justify-content-between">
                                                                @foreach($accounts->data->SocialAccountStats as $stats)
                                                                    @if($account->account_id === $stats->account_id)
                                                                        @switch($account->account_type)
                                                                            @case(4)
                                                                            <span class="font-weight-bold mr-2">Feeds:</span>
                                                                            <a href="#"
                                                                               class="text-hover-primary">{{$stats->total_post_count}}</a>
                                                                            @break
                                                                        @endswitch
                                                                    @endif
                                                                @endforeach
                                                            </div>
                                                            <div
                                                                    class="d-flex align-items-center justify-content-between cronUpdateDiv">
                                                                    <span
                                                                            class="font-weight-bold mr-2">Cron Update:</span>
                                                                <span class="switch switch-sm switch-icon"
                                                                      id="cronModify{{$account->account_id}}">


                                                        <label>
                                                          <input type="checkbox" id="cronUpdate{{$account->account_id}}"
                                                                 <?php if ($account->refresh_feeds == 2) echo "checked" ?> name="select"
                                                                 onclick="cronUpdate({{$account->account_id}}, {{$account->refresh_feeds}});">
                                                            <span></span>
                                                        </label>
                                                    </span>
                                                            </div>
                                                        </div>
                                                        @switch($account->account_type)
                                                            @case(6)
                                                            <br><br><br><br>
                                                            @break
                                                            @case(5)
                                                            <br><br><br><br>
                                                            @break
                                                            @case(12)
                                                            <br><br><br>
                                                            @break
                                                            @case(7)
                                                            <br><br><br>
                                                            @break
                                                            @case(2)
                                                            <br><br>
                                                            @break
                                                            @case(9)<br><br><br>
                                                            @break
                                                            @case(1)<br><br>
                                                            @break
                                                            @case(4)<br>
                                                            @break
                                                            @case(16)
                                                            <br><br><br><br>
                                                            @break
                                                            @case(11)
                                                            <br><br><br><br>
                                                            @break
                                                        @endswitch
                                                        <div>
                                                            <a href="#" data-toggle="modal"
                                                               data-target="#accountDeleteModal{{$account->account_id}}"
                                                               class="btn text-danger font-weight-bolder font-size-h6 px-8 py-4 my-3 col-12"
                                                            >Delete
                                                                Account</a>
                                                        </div>
                                                        <!-- end:Delete button -->

                                                    </div>
                                                </div>
                                            </div>
                                            <!-- begin::Delete team modal-->
                                            <div class="modal fade" id="accountDeleteModal{{$account->account_id}}"
                                                 tabindex="-1"
                                                 role="dialog"
                                                 aria-labelledby="teamDeleteModalLabel"
                                                 aria-hidden="true">
                                                <div class="modal-dialog modal-dialog-centered modal-lg"
                                                     role="document">
                                                    <div class="modal-content">
                                                        <div class="modal-header">
                                                            <h5 class="modal-title" id="teamDeleteModalLabel">Delete
                                                                This Account</h5>
                                                            <button type="button" class="close" data-dismiss="modal"
                                                                    aria-label="Close">
                                                                <i aria-hidden="true" class="ki ki-close"></i>
                                                            </button>
                                                        </div>
                                                        <div class="modal-body">
                                                            <div class="text-center">
                                                                <img
                                                                        src="/media/svg/icons/Communication/Delete-user.svg"/><br>
                                                                <span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this Account?</span>
                                                            </div>
                                                            <div class="d-flex justify-content-center">
                                                                <button type="submit"
                                                                        onclick="deleteSocialAcc('{{$account->account_id}}','{{$account->account_type}}')"
                                                                        class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                        id="{{$account->account_id}}"
                                                                        data-dismiss="modal">
                                                                    Delete it
                                                                </button>
                                                                <a href="javascript:;" type="button"
                                                                   class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                   data-dismiss="modal">No
                                                                    thanks.</a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <!-- end::Delete account modal-->
                                        @endif
                                        <?php $count++; ?>
                                    @endforeach
                                    @endif
                                    @if($count === 0 )
                                        <div class="text-center noAccountsDiv">
                                            <div class="symbol symbol-150">
                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                            </div>
                                            <h6>Currently, no social account has added to
                                                this team yet.</h6>
                                        </div>
                                    @endif
                            @elseif($accounts['code']  === 400 )
                                <div style="color: Red;text-align:center;">
                                    Can not get Accounts,please reload the page
                                </div>
                            @endif
                        @else
                            <div class="text-center">
                                <div class="symbol symbol-150">
                                    <img src="/media/svg/illustrations/no-accounts.svg"/>
                                </div>
                                <div style="color: Red;text-align:center;">
                                    Can not get Accounts,please reload the page
                                </div>
                            </div>
                        @endif
                </div>
            @endif
            <!--end::Row-->
                <!--end::Accounts-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->
    <!-- begin:Add Accounts Modal-->
    <div class="modal fade" id="addAccountsModal" tabindex="-1"
         role="dialog"
         aria-labelledby="addAccountsModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg"
             role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addAccountsModalLabel">Add
                        Accounts</h5>
                    <button type="button" class="close" data-dismiss="modal"
                            aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="">
                        <ul class="nav justify-content-center nav-pills"
                            id="AddAccountsTab"
                            role="tablist">
                            <li class="nav-item">
                                <a class="nav-link active"
                                   id="facebook-tab-accounts"
                                   data-toggle="tab"
                                   href="#facebook-add-accounts">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-facebook fa-2x"></i></span>

                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link"
                                   id="twitter-tab-accounts"
                                   data-toggle="tab"
                                   href="#twitter-add-accounts"
                                   aria-controls="twitter">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-twitter fa-2x"></i></span>

                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link"
                                   id="instagram-tab-accounts"
                                   data-toggle="tab"
                                   href="#instagram-add-accounts"
                                   aria-controls="instagram">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-instagram fa-2x"></i></span>

                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link"
                                   id="linkedin-tab-accounts"
                                   data-toggle="tab"
                                   href="#linkedin-add-accounts"
                                   aria-controls="linkedin">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-linkedin fa-2x"></i></span>

                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link"
                                   id="youtube-tab-accounts"
                                   data-toggle="tab"
                                   href="#youtube-add-accounts"
                                   aria-controls="youtube">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-youtube fa-2x"></i></span>

                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link"
                                   id="pinterest-tab-accounts"
                                   data-toggle="tab"
                                   href="#pinterest-add-accounts"
                                   aria-controls="pinterest">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-pinterest fa-2x"></i></span>

                                </a>
                            </li>
                            <li class="nav-item">
                                <a class="nav-link" id="tumblr-tab-accounts"
                                   data-toggle="tab"
                                   href="#tumblr-add-accounts"
                                   aria-controls="tumblr">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-tumblr fa-2x"></i></span>

                                </a>
                            </li>

                            <li class="nav-item">
                                <a class="nav-link" id="tiktok-tab-accounts"
                                   data-toggle="tab" href="#tiktok-add-accounts"
                                   aria-controls="tiktok">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-tiktok fa-2x"></i></span>
                                </a>
                            </li>
                        </ul>
                        <div class="tab-content mt-5"
                             id="AddAccountsTabContent">
                            <div class="tab-pane fade show active"
                                 id="facebook-add-accounts" role="tabpanel"
                                 aria-labelledby="facebook-tab-accounts">
                                <p>Socioboard needs permission to access and
                                    publish content
                                    to Facebook on your behalf. To grant
                                    permission, you
                                    must be an admin for your brand’s
                                    Facebook page.</p>
                                <div class="d-flex justify-content-center">
                                    <a href="/add-accounts/Facebook"
                                       type="button"
                                       class="btn btn-facebook font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                        a Facebook Profile</a>
                                    <a href="/add-accounts/FacebookPage"
                                       type="button"
                                       class="btn btn-facebook fb_page_btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                    >Add
                                        a Facebook FanPage</a>
                                </div>
                                @if($facebookpages === 1)
                                    <div class="mt-3 fb_page_div" style="display: none;">
                                        <span>Choose Facebook pages for posting</span>
                                        <div class="scroll scroll-pull" data-scroll="true"
                                             data-wheel-propagation="true"
                                             style="height: 200px; overflow-y: scroll;">
                                        @for($i=0; $i<count(session()->get('pages')); $i++)                                                                        <!--begin::Page-->
                                            <div class="d-flex align-items-center flex-grow-1">
                                                <!--begin::Facebook Fanpage Profile picture-->
                                                <div class="symbol symbol-45 symbol-light mr-5">
                                                <span class="symbol-label">
                                                    <img src="{{session()->get('pages')[$i]->profilePicture}}"
                                                         class="h-50 align-self-center" alt=""/>
                                                </span>
                                                </div>
                                                <!--end::Facebook Fanpage Profile picture-->
                                                <!--begin::Section-->
                                                <div
                                                        class="d-flex flex-wrap align-items-center justify-content-between w-100">
                                                    <div class="d-flex flex-column align-items-cente py-2 w-75">
                                                        <a href="{{session()->get('pages')[$i]->pageUrl}}"
                                                           class="font-weight-bold text-hover-primary font-size-lg mb-1">
                                                            {{session()->get('pages')[$i]->pageName}}
                                                        </a>
                                                        <span class="text-muted font-weight-bold">
                                                        {{session()->get('pages')[$i]->fanCount}} followers
                                                    </span>
                                                    </div>
                                                </div>
                                                @if(session()->get('pages')[$i]->isAlreadyAdded===false)
                                                    <div
                                                            class="custom-control custom-checkbox"
                                                            id="checkboxes">
                                                        <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4"
                                                               for="{{session()->get('pages')[$i]->pageId}}">
                                                            <input type="checkbox"
                                                                   id="{{session()->get('pages')[$i]->pageId}}"
                                                                   name="{{session()->get('pages')[$i]->pageName}}">
                                                            <span></span>
                                                        </label>
                                                    </div>
                                                @endif
                                            </div>
                                            @endfor

                                        </div>
                                        <div class="d-flex justify-content-center">
                                            <a href="javascript:;" type="button"
                                               id="checkedPages"
                                               class="btn btn-facebook font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Submit
                                                for adding pages</a>
                                        </div>
                                    </div>
                                @endif

                            </div>
                            <div class="tab-pane fade"
                                 id="twitter-add-accounts"
                                 role="tabpanel"
                                 aria-labelledby="twitter-tab-accounts">
                                <p>Please make sure you are logged in with
                                    the proper
                                    account when you authorize
                                    Socioboard.</p>
                                <div class="d-flex justify-content-center">
                                    <a href="/add-accounts/Twitter"
                                       type="button"
                                       class="btn btn-twitter font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                        a Twitter Profile</a>
                                </div>
                                <label class="checkbox mb-0 pt-5">
                                    <input type="checkbox" name="sb-twt"
                                           checked/>
                                    <span class="mr-2"></span>
                                    Follow Socioboard on twitter for update
                                    & announcements
                                </label>
                            </div>
                            <div class="tab-pane fade"
                                 id="instagram-add-accounts"
                                 role="tabpanel"
                                 aria-labelledby="instagram-tab-accounts">
                                <p>To allow Socioboard access to your Instagram account, you
                                    must first give authorization from the Instagram website.</p>
                                <div class="d-flex justify-content-center">
                                    <a href="/add-accounts/Instagram" type="button"
                                       class="btn btn-instagram font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                        a Instagram Profile</a>
                                    <a href="/add-accounts/InstagramBusiness" type="button"
                                       class="btn btn-instagram font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                        a Business Account</a>
                                </div>
                            </div>
                            <div class="tab-pane fade"
                                 id="linkedin-add-accounts"
                                 role="tabpanel"
                                 aria-labelledby="linkedin-tab-accounts">
                                <p>Grant access to your profile to share
                                    updates and view
                                    your feed.</p>
                                <div class="d-flex justify-content-center">
                                    <a href="/add-accounts/LinkedIn"
                                       type="button"
                                       class="btn btn-linkedin font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                        a LinkedIn Profile</a>
                                    <a href="/add-accounts/LinkedInCompany" type="button"
                                       class="btn btn-linkedin linkedin_page_btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                        a LinkedIn page</a>
                                </div>

                            </div>
                            <div class="tab-pane fade"
                                 id="youtube-add-accounts"
                                 role="tabpanel"
                                 aria-labelledby="youtube-tab-accounts">
                                <p>To allow Socioboard access to your
                                    Youtube account, you
                                    must first give authorization from the
                                    Youtube
                                    Channel.</p>
                                <p><strong>Important Notes:</strong></p>
                                <ol class="twitter-add-accounts">
                                    <li>
                                        YouTube's Terms of Services link <br/>
                                        <strong>Please Visit -</strong>
                                        <a href="https://www.youtube.com/t/terms"> https://www.youtube.com/t/terms</a>
                                    </li>
                                    <li>
                                        Google privacy policy Link <br/>
                                        <strong>Please Visit -</strong>
                                        <a href="https://policies.google.com/privacy">
                                            https://policies.google.com/privacy</a>
                                    </li>
                                    <li>
                                        Google security settings page about revoking user access <br/>
                                        <strong>Please Visit -</strong>
                                        <a href="https://myaccount.google.com/permissions?pli=1">
                                            https://myaccount.google.com/permissions?pli=1</a>
                                    </li>
                                    <li>
                                        Handling YouTube Data and Content <br/>
                                        <strong>Official Terms -</strong>
                                        <a href="https://developers.google.com/youtube/terms/developer-policies#e.-handling-youtube-data-and-content">
                                            https://developers.google.com/youtube/terms/developer-policies#e.-handling-youtube-data-and-content.</a>
                                    </li>
                                </ol>
                                <p>Storing of Data will be max 30 days.</p>
                                <strong>Please go throw all the links for Terms and Policies</strong>
                                <div class="d-flex justify-content-center">
                                    <a href="add-accounts/Youtube"
                                       type="button"
                                       class="btn btn-youtube font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Connect
                                        your YouTube channel</a>
                                </div>
                            </div>
                            <div class="tab-pane fade"
                                 id="pinterest-add-accounts"
                                 role="tabpanel"
                                 aria-labelledby="pinterest-tab-accounts">
                                <p>Grant access to your profile to share updates and view
                                    your feed.</p>
                                <div class="d-flex justify-content-center">
                                    <a href="add-accounts/Pinterest" type="button"
                                       class="btn btn-pinterest font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                        a Pinterest Profile</a>
                                </div>
                            </div>
                            <div class="tab-pane fade"
                                 id="tumblr-add-accounts"
                                 role="tabpanel"
                                 aria-labelledby="tumblr-tab-accounts">
                                <p>Grant access to your profile to share updates and view your feed.</p>
                                <div class="d-flex justify-content-center">
                                    <a href="/add-accounts/Tumblr" type="button"
                                       class="btn btn-tumblr font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add a
                                        Tumblr Profile</a>
                                </div>
                            </div>
                            @if($bloggedpages === 1)
                                <div class="mt-3 tb_page_div" style="display: none;">
                                    <span>Choose Blooged pages for posting</span>
                                    <div class="scroll scroll-pull" data-scroll="true"
                                         data-wheel-propagation="true"
                                         style="height: 200px; overflow-y: scroll;">
                                    @for($i=0; $i<count(session()->get('blogs')); $i++)                                                                        <!--begin::Page-->
                                        <div class="d-flex align-items-center flex-grow-1">
                                            <!--begin::Facebook Fanpage Profile picture-->
                                            <div class="symbol symbol-45 symbol-light mr-5">
                                                <span class="symbol-label">
                                                    <img src="{{session()->get('blogs')[$i]->ProfilePicture}}"
                                                         class="h-50 align-self-center" alt=""/>
                                                </span>
                                            </div>
                                            <!--end::Facebook Fanpage Profile picture-->
                                            <!--begin::Section-->
                                            <div
                                                    class="d-flex flex-wrap align-items-center justify-content-between w-100">
                                                <div class="d-flex flex-column align-items-cente py-2 w-75">
                                                    <a href="{{session()->get('blogs')[$i]->ProfileUrl}}"
                                                       class="font-weight-bold text-hover-primary font-size-lg mb-1">
                                                        {{session()->get('blogs')[$i]->FirstName}}
                                                    </a>
                                                    <span class="text-muted font-weight-bold">
                                                        {{session()->get('blogs')[$i]->FriendCount}} followers
                                                    </span>
                                                </div>
                                            </div>
                                            @if(session()->get('blogs')[$i]->isAlreadyAdded===false)
                                                <div
                                                        class="custom-control custom-checkbox"
                                                        id="checkboxes3">
                                                    <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4"
                                                           for="{{session()->get('blogs')[$i]->SocialId}}">
                                                        <input type="checkbox"
                                                               id="{{session()->get('blogs')[$i]->SocialId}}"
                                                               name="{{session()->get('blogs')[$i]->FirstName}}">
                                                        <span></span>
                                                    </label>
                                                </div>
                                            @endif
                                        </div>
                                        @endfor

                                    </div>
                                    <div class="d-flex justify-content-center">
                                        <a href="javascript:;" type="button"
                                           id="checkedPages4"
                                           class="btn btn-tumblr font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Submit
                                            for adding blogged pages</a>
                                    </div>
                                </div>
                            @endif
                            <div class="tab-pane fade" id="tiktok-add-accounts"
                                 role="tabpanel" aria-labelledby="tiktok-tab-accounts">
                                <div class="font-size-lg font-weight-bold ml-4">Grant access to your TikTok profile to share
                                    updates and view
                                    your feed.
                                </div>
                                <div class="show_tiktok_divs">
                                    <div class="d-flex justify-content-center">
                                        <a href="add-accounts/TikTok" type="button"
                                           class="btn btn-tiktok font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                            a Tiktok Profile</a>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                </div>
            </div>
        </div>
    </div>
    <!-- begin:Invite button Modal-->
    <div class="modal fade" id="inviteModal" tabindex="-1" role="dialog" aria-labelledby="inviteModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="inviteModalLabel">Add Accounts By Invitation</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body invite-input-browse">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <div class="card text-center px-2 py-3">
                                <h6>Download Format</h6>
                                <i class="icon-xl fas fa-download" onclick="location.href='excel-file'"
                                >
                                </i>
                            </div>
                        </div>
                        <div class="col-md-9">
                            <div class="card px-4 py-3">
                                <div class="card-body p-0">
                                    <h6 class="text-right">Bulk Upload</h6>
                                    <div class="d-flex">
                                        <button type="submit" class="btn btn-primary mr-3" onclick="bulkInvite();">
                                            Send Invite
                                        </button>
                                        <div class="custom-file">
                                            <input accept=".xlsx" class="custom-file-input" id="upload-bulk"
                                                   name="files[]"
                                                   type="file">
                                            <lable for="custom-file" class="custom-file-label w-90" id="lableInvite">
                                                Choose file
                                            </lable>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="table-responsive mt-5 pt-5" id="invitation-table">
                        <table class="table" id="socialRows">
                            <tbody>

                            <tr>
                                <th>
                                    <button class="table-add btn btn-sm"><i class="fa fa-plus pr-0"
                                                                            onclick="addRow(1)"></i></button>
                                </th>
                                <th>Remove</th>
                                <th>Social Media</th>
                                <th>Team Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Account Name</th>
                            </tr>
                            <tr>
                                <td></td>
                                <td class="">
                                </td>
                                <td>
                                    <select class="form-control h-auto py-4" id="socialMediaSelected1"
                                            onchange="getSelectedSocialValue()">
                                        <option selected disabled>Select Account</option>
                                        <option value="Facebook">Facebook</option>
                                        <option value="Twitter">Twitter</option>
                                        <option value="Instagram">Instagram</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                        <option value="InstagramBusiness">Instagram Business</option>
                                        <option value="Youtube">Youtube</option>
                                        <option value="LinkedInPage">LinkedInPage</option>
                                        <option value="FacebookPage">FaceBookPage</option>
                                    </select>
                                </td>
                                <td>
                                    <select class="form-control h-auto py-4" id="teamDropDown1"
                                            onchange="getSelectedTeamValue()">
                                    </select>
                                </td>
                                <td>
                                    <input id="userID1" type="text" class="form-control h-auto py-4"
                                           placeholder="Type User ID">
                                </td>
                                <td>
                                    <input id="emailID1" type="email" class="form-control h-auto py-4"
                                           placeholder="Email ID">
                                </td>
                                <td>
                                    <input id="accountName1" type="text" class="form-control h-auto py-4"
                                           placeholder="Account Name">
                                </td>
                            </tr>

                            </tbody>
                        </table>

                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="sendInvite()">Send Invite</button>
                    <button id="bulkInvites" type="button" class="btn btn-primary" onclick="bulkInvite()">Bulk Invite
                    </button>
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    <!-- end:Invite button Modal -->
    </div>
    <!-- end:Add Accounts Modal -->
@endsection

@section('scripts')
    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    <script src="{{asset('js/accounts.js')}}"></script>
    <script src="https://unpkg.com/intro.js/minified/intro.min.js"></script>

    <script>

        $('#sb_select2_accounts').select2({
            placeholder: 'Select Social Media',
        });


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


        /**
         * TODO we've to delete particular social account from socioboard.
         * This function is used for delete particular social account added in socioboard.
         * @param {integer) account id of particular social account   (twitter ,facebook ,youtube).
         * @param {integer) account type of particular social account   (twitter ,facebook ,youtube).
         * ! Do not change this function without referring API format of deleting social account.
         */
        function deleteSocialAcc(id, type) {
            $.ajax({
                url: 'delete-social-account',
                data: {accid: id},
                type: 'get',
                dataType: 'json',
                success: function (response) {
                    if (response.code === 200) {
                        $('div#accountsSection' + id).remove();
                        if (type === '2') {
                            toastr.success("Page Deleted Successfully");
                        } else {
                            toastr.success("Account Deleted Successfully");
                        }
                        location.reload();
                    } else if (response.code === 400) {
                        toastr.error(response.message, "Unable To Delete Account");
                    } else {
                        toastr.error('Some error occured', "Unable To Delete Account");
                    }
                }
            });
        }

        $fbp =
                {{$facebookpages}}
                    $tbp =
                        {{$bloggedpages}}
                        if($fbp === 1)
        {
            $('#addAccountsModal').modal('show');
            displayFacebookPages();
        }

        function displayFacebookPages() {//It displayes the facebook pages from facebook account to modal in checkboxes to select
            $(".fb_page_div").css("display", "block");
        }

        if ($tbp === 1) {
            $('#addAccountsModal').modal('show');
            displayTumblrPages();
            $("#tumblr-tab-accounts").trigger("click");

        }

        function displayTumblrPages() {//It displayes the tumbler pages from facebook account to modal in checkboxes to select
            $(".tb_page_div").css("display", "block");
        }

        $(document).ready(function () {// This added facebook pages to socioboard whichever is selected from checkboxes on submit.
            $("#home_tab").trigger("click");
            $("#upload-bulk").change(function () {
                $('#lableInvite').html('File uploaded Successfully')
            });
            appendTeams();
            $("#checkedPages").click(function () {
                let selected = [];
                $('#checkboxes input:checked').each(function () {
                    selected.push($(this).attr('name'));
                });
                $.ajax({
                    url: "/facebookPageAdd",
                    type: 'POST',
                    data: {
                        "pages": selected,
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    beforeSend: function () {
                    },
                    success: function (response) {
                        if (response.code === 200) {
                            if (response.errorIds.length !== 0) {
                                $('#addAccountsModal').modal('hide')
                                Swal.fire({
                                    icon: 'warning',
                                    text: "Could not add Facebook pages as " + response.errorIds + "... Already added!!",
                                });
                            } else {
                                toastr.success("Facebook pages added successfully!");
                                $('#addAccountsModal').modal('hide')
                                document.location.href = '{{env('APP_URL')}}view-accounts';
                            }
                        } else if (response.code == 400) {
                            $('#addAccountsModal').modal('hide')
                            toastr.error(response.message);
                        } else if (response.code == 500) {
                            $('#addAccountsModal').modal('hide')
                            toastr.error(response.message);
                        }
                    },
                    error: function (error) {
                        toastr.error("Something went wrong.. Not able to add the accounts.")
                    }
                });
            });
        });

        let last_selected;

        function updateStartValue(data) {//This function updates values of current star value selected from dropdown.
            last_selected = data.value;
        }

        /**
         * TODO we've to show the social accounts based on search filter in accounts page.
         * This function is used to show the social accounts based on search filter in accounts page.
         * ! Do not change this function without referring API format of Searching social accounts from search filter input values.
         */
        function searchAccountsFilter() {
            let selectedAccountTypes = [];
            let selecteddepartmentNames = [];
            $('#sb_select2_accounts').select2('data').forEach(function (dept) {
                selectedAccountTypes.push(dept.id);
                selecteddepartmentNames.push(dept.text);
            });
            let username = $('#userName').val();
            let selected_star;
            let count = 1;
            let profileButtonURls = '';
            let profileUrls = '';
            if (last_selected === undefined && username === '' && selecteddepartmentNames.length === 0) {
                toastr.error('Please first select any search filter value');
            } else {
                if (last_selected === 'One') {
                    selected_star = 1;
                } else if (last_selected === 'Two') {
                    selected_star = 2;
                } else if (last_selected === 'Three') {
                    selected_star = 3;
                } else if (last_selected === 'Four') {
                    selected_star = 4;
                } else if (last_selected === 'Five') {
                    selected_star = 5;
                } else {
                    selected_star = null;
                }
                $.ajax({
                    url: "search-Accounts-filter",
                    type: 'POST',
                    data: {
                        selected_star, username, selectedAccountTypes
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    beforeSend: function () {
                        $('#accountsDIv').empty().append('<div class="d-flex justify-content-center" >\n' +
                            '<div class="spinner-border" role="status"  style="display: none;">\n' +
                            '<span class="sr-only">Loading...</span>\n' +
                            '</div>\n' +
                            '</div>');
                        $(".spinner-border").css("display", "block");
                    },
                    success: function (response) {
                        $(".spinner-border").css("display", "none");
                        if (response.data.code === 200) {
                            let appendData = '';
                            if (response.data.data.teamSocialAccountDetails.length > 0) {
                                response.data.data.teamSocialAccountDetails[0].SocialAccount.map(element => {
                                        if (element.account_type === 1) {
                                            profileButtonURls = 'feeds/facebook' + element.account_id + '';
                                        } else if (element.account_type === 2) {
                                            profileButtonURls = 'feeds/fbPages' + element.account_id + '';

                                        } else if (element.account_type === 9) {
                                            profileButtonURls = 'feeds/youtube' + element.account_id + '';

                                        } else if (element.account_type === 4) {
                                            profileButtonURls = 'feeds/twitter' + element.account_id + '';

                                        } else if (element.account_type === 16) {
                                            profileButtonURls = 'feeds/Tumblr' + element.account_id + '';

                                        } else if (element.account_type === 11) {
                                            profileButtonURls = 'show-boards/Pinterest' + element.account_id + '';

                                        } else if (element.account_type === 12) {
                                            profileButtonURls = 'feeds/Business' + element.account_id + '';

                                        } else if (element.account_type === 7) {
                                            profileButtonURls = 'feeds/linkedIn' + element.account_id + '';

                                        } else if (element.account_type === 5) {
                                            profileButtonURls = 'feeds/instagram' + element.account_id + '';
                                        }
                                        else if (element.account_type === 18) {
                                            profileButtonURls = 'feeds/TikTok' + element.account_id + '';
                                        }
                                        if (element.account_type === 1|| element.account_type === 18) {
                                            profileUrls = '';
                                        } else {
                                            profileUrls = element.profile_url;
                                        }
                                        appendData += '<div class="col-xl-3">\n' +
                                            '<div class="card card-custom gutter-b card-stretch">\n' +
                                            '<div\n' +
                                            'class="card-body pt-2 position-relative overflow-hidden rounded  ribbon ribbon-top ribbon-ver">';
                                        if (element.account_type === 1) {
                                            appendData += '<div class="ribbon-target bg-facebook" style="top: -2px; right: 20px;">\n' +
                                                '<i class="fab fa-facebook-f"></i>\n' +
                                                '</div>';
                                        } else if (element.account_type === 2) {
                                            appendData += '<div class="ribbon-target bg-facebook" style="top: -2px; right: 20px;">\n' +
                                                '<i class="fab fa-facebook-f mr-1">p</i>\n' +
                                                '</div>';
                                        } else if (element.account_type === 4) {
                                            appendData += '<div class="ribbon-target" style="top: -2px; right: 20px;">\n' +
                                                '<i class="fab fa-twitter"></i>\n' +
                                                '</div>';
                                        } else if (element.account_type === 5) {
                                            appendData += '<div class="ribbon-target bg-instagram" style="top: -2px; right: 20px;">\n' +
                                                '<i class="fab fa-instagram"></i>\n' +
                                                '</div>';
                                        } else if (element.account_type === 12) {
                                            appendData += '<div class="ribbon-target bg-instagram mr-1" style="top: -2px; right: 20px;">\n' +
                                                '<i class="fab fa-instagram"></i> b\n' +
                                                '</div>';
                                        } else if (element.account_type === 6) {
                                            appendData += '<div class="ribbon-target bg-linkedin" style="top: -2px; right: 20px;">\n' +
                                                '<i class="fab fa-linkedin"></i>\n' +
                                                '</div>';
                                        } else if (element.account_type === 7) {
                                            appendData += '<div class="ribbon-target bg-linkedin" style="top: -2px; right: 20px;">\n' +
                                                '<i class="fab fa-linkedin mr-1">Page</i>\n' +
                                                '</div>';
                                        } else if (element.account_type === 9) {
                                            appendData += '<div class="ribbon-target bg-youtube" style="top: -2px; right: 20px;">\n' +
                                                '<i class="fab fa-youtube"></i>\n' +
                                                '</div>';
                                        } else if (element.account_type === 16) {
                                            appendData += '<div class="ribbon-target bg-tumblr" style="top: -2px; right: 20px;">\n' +
                                                '<i class="fab fa-tumblr"></i>\n' +
                                                '</div>';
                                        } else if (element.account_type === 11) {
                                            appendData += '<div class="ribbon-target bg-pinterest" style="top: -2px; right: 20px;">\n' +
                                                '                                                <i class="fab fa-pinterest"></i>\n' +
                                                '                                                </div>';
                                        }
                                        else if (element.account_type === 18) {
                                            appendData += '<div class="ribbon-target bg-tiktok" style="top: -2px; right: 20px;">\n' +
                                                '                                                <i class="fab fa-tiktok"></i>\n' +
                                                '                                                </div>';
                                        }
                                        appendData += '<div\n' +
                                            'class="d-flex align-items-center  ribbon ribbon-clip ribbon-left">\n' +
                                            '<div id="status' + element.account_id + '">';
                                        if (element.join_table_teams_social_accounts.is_account_locked === true) {
                                            appendData += `<div class="ribbon-target accounts-lock-unlock"
                                                                         style="top: 12px;"
                                                                         onclick="lock(${element.account_id}, 0,'profileDivButton${count}','profile-name${count}','${profileButtonURls}', '${profileUrls}')">
                                                                        <span class="ribbon-inner bg-danger"></span>
                                                                        <i
                                                                                class="fas fa-user-lock fa-fw mr-2 text-white"></i>
                                                                        Un-Lock
                                                                    </div>`;
                                        } else {
                                            appendData += `<div class="ribbon-target accounts-lock-unlock"
                                                                         style="top: 80px;"
                                                                         onclick="lock(${element.account_id}, 1,'profileDivButton${count}','profile-name${count}','${profileButtonURls}', '${profileUrls}')">
                                                                        <span class="ribbon-inner bg-info"></span>
                                                                        <i
                                                                                class="fas fa-lock-open fa-fw mr-2 text-white"></i>
                                                                        Lock
                                                                    </div>`;
                                        }
                                        appendData += '</div><div\n' +
                                            'class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">\n' +
                                            '<div class="symbol-label"\n' +
                                            'style="background-image:url(' + element.profile_pic_url + ')"></div>\n' +
                                            '<i class="symbol-badge bg-success"></i>\n' +
                                            '</div>';
                                        appendData += '<div>\n';
                                        if (element.account_type === 1) {
                                            appendData += '<a class="profile-name' + count + '" target="_blank">\n' +
                                                '' + element.first_name + " " + element.last_name + '\n' +
                                                '</a>\n';
                                        } else if (element.account_type === 18) {
                                        appendData += '<a class="profile-name' + count + '" target="_blank">\n' +
                                            '' + element.user_name + '\n' +
                                            '</a>\n';
                                    }
                                        else {
                                            profileUrls = element.profile_url;
                                            appendData += '<a class="profile-name' + count + '"  href="' + element.profile_url + '"\n' +
                                                'target="_blank">\n' +
                                                '' + element.first_name + " " + element.last_name + '\n' +
                                                '</a>\n';
                                        }
                                        appendData += ' <div class="rating-css">\n' +
                                            '<div class="star-icon">\n' +
                                            '<input type="radio"';
                                        if (element.rating === 1) appendData += 'checked';
                                        appendData += ' name="rating1' + element.account_id + '" id="rating1' + element.account_id + '"\n' +
                                            'onclick="ratingUpdate(\'1\', \'' + element.account_id + '\');">\n' +
                                            '<label\n' +
                                            'for="rating1' + element.account_id + '"\n' +
                                            'class="fas fa-star"></label>\n' +
                                            '<input type="radio"';
                                        if (element.rating === 2) appendData += 'checked';
                                        appendData += ' name="rating2' + element.account_id + '" id="rating2' + element.account_id + '"\n' +
                                            'onclick="ratingUpdate(\'2\', \'' + element.account_id + '\');">\n' +
                                            '<label\n' +
                                            'for="rating2' + element.account_id + '"\n' +
                                            'class="fas fa-star"></label>\n' +
                                            '<input type="radio"';
                                        if (element.rating === 3) appendData += ' checked ';
                                        appendData += ' name="rating3' + element.account_id + '" id="rating3' + element.account_id + '"\n' +
                                            'onclick="ratingUpdate(\'3\', \'' + element.account_id + '\');">\n' +
                                            '<label\n' +
                                            'for="rating3' + element.account_id + '"\n' +
                                            'class="fas fa-star"></label>\n' +
                                            '<input type="radio"';
                                        if (element.rating === 4) appendData += ' checked ';
                                        appendData += ' name="rating4' + element.account_id + '" id="rating4' + element.account_id + '"\n' +
                                            'onclick="ratingUpdate(\'4\', \'' + element.account_id + '\');">\n' +
                                            '<label\n' +
                                            'for="rating4' + element.account_id + '"\n' +
                                            'class="fas fa-star"></label>\n' +
                                            '<input type="radio"';
                                        if (element.rating === 5) appendData += ' checked ';
                                        appendData += ' name="rating5' + element.account_id + '" id="rating5' + element.account_id + '"\n' +
                                            'onclick="ratingUpdate(\'5\', \'' + element.account_id + '\');">\n' +
                                            '<label\n' +
                                            'for="rating5' + element.account_id + '"\n' +
                                            'class="fas fa-star"></label>\n' +
                                            '</div>\n' +
                                            '</div>';
                                        appendData += '<div class="mt-2">\n';
                                        if (element.join_table_teams_social_accounts.is_account_locked === false) {
                                            if (element.account_type === 1) {
                                                profileButtonURls = 'feeds/facebook' + element.account_id + '';
                                                appendData += '<a href="feeds/facebook' + element.account_id + '"\n' +
                                                    'target="_blank"\n' +
                                                    'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDivButton' + count + ' ">Profile</a>\n';
                                            } else if (element.account_type === 2) {
                                                profileButtonURls = 'feeds/fbPages' + element.account_id + '';
                                                appendData += '<a href="feeds/fbPages' + element.account_id + '"\n' +
                                                    'target="_blank"\n' +
                                                    'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDivButton' + count + '">Profile</a>\n';
                                            } else if (element.account_type === 9) {
                                                profileButtonURls = 'feeds/youtube' + element.account_id + '';
                                                appendData += '<a href="feeds/youtube' + element.account_id + '"\n' +
                                                    'target="_blank"\n' +
                                                    'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDivButton' + count + '">Profile</a>\n';
                                            } else if (element.account_type === 4) {
                                                profileButtonURls = 'feeds/twitter' + element.account_id + '';
                                                appendData += '<a href="feeds/twitter' + element.account_id + '"\n' +
                                                    'target="_blank"\n' +
                                                    'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDivButton' + count + '">Profile</a>\n';
                                            } else if (element.account_type === 16) {
                                                profileButtonURls = 'feeds/Tumblr' + element.account_id + '';
                                                appendData += '<a href="feeds/Tumblr' + element.account_id + '"\n' +
                                                    'target="_blank"\n' +
                                                    'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDivButton' + count + '">Profile</a>\n';
                                            } else if (element.account_type === 11) {
                                                profileButtonURls = 'show-boards/Pinterest' + element.account_id + '';
                                                appendData += '<a href="show-boards/Pinterest' + element.account_id + '"\n' +
                                                    'target="_blank"\n' +
                                                    'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDivButton' + count + '">Profile</a>\n';
                                            } else if (element.account_type === 12) {
                                                profileButtonURls = 'feeds/Business' + element.account_id + '';
                                                appendData += '<a href="feeds/Business' + element.account_id + '"\n' +
                                                    'target="_blank"\n' +
                                                    'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDivButton' + count + '">Profile</a>\n';
                                            } else if (element.account_type === 7) {
                                                profileButtonURls = 'feeds/linkedIn' + element.account_id + '';
                                                appendData += '<a href="feeds/linkedIn' + element.account_id + '"\n' +
                                                    'target="_blank"\n' +
                                                    'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDivButton' + count + '">Profile</a>\n';
                                            } else if (element.account_type === 5) {
                                                profileButtonURls = 'feeds/instagram' + element.account_id + '';
                                                appendData += '<a href="feeds/instagram' + element.account_id + '"\n' +
                                                    'target="_blank"\n' +
                                                    'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDivButton' + count + '">Profile</a>\n';
                                            }
                                        } else {
                                            appendData += '<a href="#"\n' +
                                                'target="_blank"\n' +
                                                'class="btn btn-sm font-weight-bold mr-2 py-2 px-3 px-xxl-5 my-1 profileDivButton' + count + '">Profile</a>\n';
                                        }
                                        appendData +=
                                            '</div>\n' +
                                            '</div>\n' +
                                            '</div>';
                                        appendData += '<div class="py-9">\n' +
                                            '<div class="d-flex align-items-center justify-content-between mb-2">\n';
                                        response.data.data.SocialAccountStats.map(data => {
                                            if (element.account_id === data.account_id) {
                                                switch (element.account_type) {
                                                    case 4:
                                                        appendData += '<span class="font-weight-bold mr-2">Following:</span>\n' +
                                                            '<a href="#"\n' +
                                                            'class="text-hover-primary">' + data.following_count + '</a>';
                                                        break;
                                                    case 1:
                                                        appendData += '<span class="font-weight-bold mr-2">Page Count:</span>\n' +
                                                            '<a href="#"\n' +
                                                            'class="text-hover-primary">' + data.page_count + '</a>';
                                                        break;
                                                    case 2:
                                                        appendData += '<span class="font-weight-bold mr-2">Like Count:</span>\n' +
                                                            '<a href="#"\n' +
                                                            'class="text-hover-primary">' + data.total_like_count + '</a>';
                                                        break;
                                                    default:
                                                }
                                            }

                                        });
                                        appendData += '</div>';
                                        appendData += '<div class="d-flex align-items-center justify-content-between mb-2">\n';
                                        response.data.data.SocialAccountStats.map(data => {
                                            if (element.account_id === data.account_id) {
                                                switch (element.account_type) {
                                                    case 4:
                                                        appendData += '<span class="font-weight-bold mr-2">Followers:</span>\n' +
                                                            '<a href="#"\n' +
                                                            'class="text-hover-primary">' + data.follower_count + '</a>';
                                                        break;
                                                    case 1:
                                                        appendData += '<span class="font-weight-bold mr-2">Followers:</span>\n' +
                                                            '<a href="#"\n' +
                                                            'class="text-hover-primary">' + data.friendship_count + '</a>';
                                                        break;
                                                    case 2:
                                                        appendData += '<span class="font-weight-bold mr-2">Followers:</span>\n' +
                                                            '<a href="#"\n' +
                                                            'class="text-hover-primary">' + data.follower_count + '</a>';
                                                        break;
                                                    case 9:
                                                        appendData += '<span class="font-weight-bold mr-2">Subscription Counts:</span>\n' +
                                                            '<a href="#"\n' +
                                                            'class="text-hover-primary">' + data.subscription_count
                                                        break;
                                                    case 12:
                                                        appendData += '<span class="font-weight-bold mr-2">Followers :</span>\n' +
                                                            '<a href="#"\n' +
                                                            'class="text-hover-primary">' + data.follower_count
                                                        break;
                                                    case 7:
                                                        appendData += '<span class="font-weight-bold mr-2">Followers :</span>\n' +
                                                            '<a href="#"\n' +
                                                            'class="text-hover-primary">' + data.follower_count
                                                        break;
                                                }
                                            }
                                        });
                                        appendData += ' </div>';

                                        appendData += '<div class="d-flex align-items-center justify-content-between mb-2">\n';
                                        response.data.data.SocialAccountStats.map(data => {
                                            if (element.account_id === data.account_id) {
                                                switch (element.account_type) {
                                                    case 4:
                                                        appendData += '<span class="font-weight-bold mr-2">Feeds:</span>\n' +
                                                            '<a href="#"\n' +
                                                            'class="text-hover-primary">' + data.total_post_count + '</a>';
                                                        break;
                                                    case 1:
                                                        appendData += '<span class="font-weight-bold mr-2">Feeds:</span>\n' +
                                                            '<a href="#"\n' +
                                                            'class="text-hover-primary">' + data.friendship_count + '</a>';
                                                        break;
                                                }
                                            }
                                            count++;
                                        });
                                        appendData += '</div>\n';
                                        appendData += '<div\n' +
                                            'class="d-flex align-items-center justify-content-between">\n' +
                                            '<span\n' +
                                            'class="font-weight-bold mr-2">Cron Update:</span>\n' +
                                            '<span class="switch switch-sm switch-icon"\n' +
                                            'id="cronModify' + element.account_id + '">\n' +
                                            '<label>\n' +
                                            '<input type="checkbox" id="cronUpdate' + element.account_id + '"\n';
                                        if (element.refresh_feeds === 2) appendData += 'checked ';
                                        appendData += 'name="select"\n'
                                        appendData += 'onclick="cronUpdate(' + element.account_id + ', ' + element.refresh_feeds + ');">\n' +
                                            '<span></span>\n' +
                                            '</label>\n' +
                                            '</span>\n' +
                                            '</div>' +
                                            '</div>';
                                        appendData += '<div>\n' +
                                            '<a href="javascript:;" class="btn text-danger font-weight-bolder font-size-h6 px-8 py-4 my-3 col-12" data-toggle="modal" data-target="#accountDeleteModal' + element.account_id + '" >Delete account</a> \n' +
                                            '</div>';
                                        appendData += '</div>\n' +
                                            '</div>\n' +
                                            '</div>';
                                        switch (element.account_type) {
                                            case 2:
                                                appendData += '<br><br>';
                                                break;
                                            case 9:
                                                appendData += '<br><br>';
                                                break;
                                        }
                                        appendData += '<div class="modal fade" id="accountDeleteModal' + element.account_id + '"\n' +
                                            'tabindex="-1"\n' +
                                            'role="dialog"\n' +
                                            'aria-labelledby="teamDeleteModalLabel"\n' +
                                            'aria-hidden="true">\n' +
                                            '<div class="modal-dialog modal-dialog-centered modal-lg"\n' +
                                            'role="document">\n' +
                                            '<div class="modal-content">\n' +
                                            '<div class="modal-header">\n' +
                                            '<h5 class="modal-title" id="teamDeleteModalLabel">Delete\n' +
                                            'This Account</h5>\n' +
                                            '<button type="button" class="close" data-dismiss="modal"\n' +
                                            'aria-label="Close">\n' +
                                            '<i aria-hidden="true" class="ki ki-close"></i>\n' +
                                            '</button>\n' +
                                            '</div>\n' +
                                            '<div class="modal-body">\n' +
                                            '<div class="text-center">\n' +
                                            '<img\n' +
                                            'src="/media/svg/icons/Communication/Delete-user.svg"/><br>\n' +
                                            '<span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this Account?</span>\n' +
                                            '</div>\n' +
                                            '<div class="d-flex justify-content-center">\n' +
                                            '<button type="submit"\n' +
                                            'onclick="deleteSocialAcc(' + element.account_id + ')"\n' +
                                            'class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"\n' +
                                            'id="' + element.account_id + '"\n' +
                                            'data-dismiss="modal">\n' +
                                            'Delete it\n' +
                                            '</button>\n' +
                                            '<a href="javascript:;" type="button"\n' +
                                            'class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"\n' +
                                            'data-dismiss="modal">No\n' +
                                            'thanks.</a>\n' +
                                            '</div>\n' +
                                            '</div>\n' +
                                            '</div>\n' +
                                            '</div>\n' +
                                            '</div>';
                                    }
                                );
                                $('#accountsDIv').append(appendData);
                            } else {
                                $('#accountsDIv').append('<div class="text-center">\n' +
                                    '<div class="symbol symbol-150">\n' +
                                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '</div>\n' +
                                    '<h6>No Social Account has been found for this search filter</h6>\n' +
                                    '</div>');
                            }
                        } else if (response.data.code === 400) {
                            $('#accountsDIv').append('<div class="text-center">\n' +
                                '<div class="symbol symbol-150">\n' +
                                '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                '</div>\n' +
                                '<h6>' + response.data.error + '</h6>\n' +
                                '</div>');
                        } else {
                            $('#accountsDIv').append('<div class="text-center">\n' +
                                '<div class="symbol symbol-150">\n' +
                                '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                '</div>\n' +
                                '<h6>' + 'Some error occured,Can not get accounts' + '</h6>\n' +
                                '</div>');
                        }
                    }
                });
            }
        }

        $("#checkedPages4").click(function () {
            let selected = [];
            $('#checkboxes3 input:checked').each(function () {
                selected.push($(this).attr('name'));
            });
            $.ajax({
                url: "/tumblrPageAdd",
                type: 'POST',
                data: {
                    "pages": selected,
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                beforeSend: function () {
                },
                success: function (response) {
                    if (response.code === 200) {
                        if (response.errorIds.length !== 0) {
                            $('#addAccountsModal').modal('hide')
                            Swal.fire({
                                icon: 'warning',
                                text: "Could not add Tumblr accounts as " + response.errorIds + "... Already added!!",
                            });
                        } else {
                            toastr.success("Tumblr accounts added successfully!");
                            $('#addAccountsModal').modal('hide');
                            location.reload();
                        }
                    } else if (response.code == 400) {
                        $('#addAccountsModal').modal('hide')
                        toastr.error(response.message);
                    } else if (response.code == 500) {
                        $('#addAccountsModal').modal('hide')
                        toastr.error(response.message);
                    }
                },
                error: function (error) {
                    toastr.error("Something went wrong.. Not able to add the accounts.")
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });

        });

        $('#profileDivButton, #chatDivButton').tooltip();


    </script>

@endsection
