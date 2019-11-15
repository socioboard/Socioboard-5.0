@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Dashboardd</title>
@endsection

@section('style')
    <style>
        /*.rounded-circle{*/
        /*height:75px;*/
        /*width:75px;*/
        /*}*/

        .profile_action_dropdown .dropleft .dropdown-toggle::before {
            content: none !important;
        }
        .teamName{
            white-space: nowrap;

            overflow: hidden;

            text-overflow: ellipsis;

            max-width: 206px;

            min-width: auto;

            padding-top: 8px;
        }

    </style>
@endsection


@section('welcome')
    <div class="row margin-top-10">
        <div class="col-md-12">
            <h4>Welcome to Dashboard</h4>
        </div>
        <!-- dashboard stats -->
        <div class="col-md-3">
            <div class="shadow mb-5 bg-white rounded">
                <div class="card-body">
                    <div>
                        <h5>Team Name</h5>
                        <h2 class="teamName" title="{{$currentTeam['team_name']}}">{{$currentTeam['team_name']}}</h2>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-3">
            <div class="shadow mb-5 bg-white rounded">
                <div class="card-body">
                    <div>
                        <h5>Total Accounts Added</h5>
                        <h2>{{$totalAccount}}</h2>
                    </div>
                </div>
            </div>
        </div>
        {{--<div class="col-md-3">--}}
        {{--<div class="shadow mb-5 bg-white rounded">--}}
        {{--<div class="card-body">--}}
        {{--<div>--}}
        {{--<h5>BoardMe</h5>--}}
        {{--<h2>0</h2>--}}
        {{--</div>--}}
        {{--</div>--}}
        {{--</div>--}}
        {{--</div>--}}
        <div class="col-md-3">
            <div class="shadow mb-5 bg-white rounded">
                <div class="card-body">
                    <div>
                        <h5>Plan Details</h5>
                        @if( $activation['user_plan'] == env('BASIC') )
                            <h6><span style="font-size: 2rem;">Basic plan </span> <span class="badge badge-danger float-right" style="margin-top: 5px;">Upgrade
										it !</span></h6>
                        @elseif($activation['user_plan'] == env('STANDARD'))
                            <h6><span style="font-size: 2rem;">Standard</span> <span class="badge badge-danger float-right" style="margin-top: 5px;">Upgrade
										it !</span></h6>
                        @elseif($activation['user_plan'] == env('PREMIUM'))
                            <h6><span style="font-size: 2rem;">Premium User</span> <span class="badge badge-danger float-right" style="margin-top: 5px;">Upgrade
										it !</span></h6>
                        @elseif($activation['user_plan'] == env('DELUXE'))
                            <h6><span style="font-size: 2rem;">Deluxe User</span> <span class="badge badge-danger float-right" style="margin-top: 5px;">Upgrade
										it !</span></h6>
                        @elseif($activation['user_plan'] == env('TOPAZ'))
                            <h6><span style="font-size: 2rem;">Topaz User</span> <span class="badge badge-danger float-right" style="margin-top: 5px;">Upgrade
										it !</span></h6>
                        @elseif($activation['user_plan'] == env('RUBY'))
                            <h6><span style="font-size: 2rem;">Ruby User</span> <span class="badge badge-danger float-right" style="margin-top: 5px;">Upgrade
										it !</span></h6>
                        @elseif($activation['user_plan'] == env('GOLD'))
                            <h6><span style="font-size: 2rem;">Gold User</span> <span class="badge badge-danger float-right" style="margin-top: 5px;">Upgrade
										it !</span></h6>
                        @elseif($activation['user_plan'] == env('PLATINUM'))
                            <h6><span style="font-size: 2rem;">Platinum User</span> <span class="badge badge-danger float-right" style="margin-top: 5px;">Upgrade
										it !</span></h6>

                        @endif

                    </div>
                </div>
            </div>
        </div>
    </div>
@endsection

@section('social')
    {{--{{ session('FBError')}}--}}
    @if (session('FBError'))
        <script>
            errorMessage = '<?php echo session('FBError'); ?>';
            swal({
                title: 'Oops...',
                text: errorMessage,
                type:"error",
                showConfirmButton: false,
                timer: 3000
            });
        </script>
{{--        <h5 style="color: red;text-align: center">{{ session('FBError') }}</h5>--}}
    @endif

    @if($errors->any())
        <script>
            errorMessage = '<?php echo $errors->first(); ?>';
            swal({
                title: 'Oops...',
                text: errorMessage,
                type:"error",
                showConfirmButton: false,
                timer: 3000
            });
        </script>
{{--        <h5 style="color: red;text-align: center">{{$errors->first()}}</h5>--}}
    @endif

    <h5 style="color: red;text-align: center" id="accError"></h5>

    {{--@if(session()->has('facebookPage'))--}}

    {{--<input style="display: none"  class="fbpagesession"  id="facebookPageSession">--}}
    {{--@endif--}}



    <div class="row" id="social">
        <div class="col-md-4">
            <div class="shadow mb-5 bg-white rounded">
                <div class="card-body">
							<span class="card_social_ribbon">
								<i class="fas fa-globe-africa"></i>
							</span>
                    <div class="text-center">
                        <img class="rounded-circle" src="https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg"
                             alt="ChanchalSantra">
                        <h5 class="card-title no-space animated-background dummy_notext"></h5>
                        <p class="card-text animated-background dummy_notext"></p>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="text-center margin-top-10">
                                <h5 class="animated-background dummy_notext"></h5>
                                <h6 class="animated-background dummy_notext"></h6>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="text-center margin-top-10">
                                <h5 class="animated-background dummy_notext"></h5>
                                <h6 class="animated-background dummy_notext"></h6>
                            </div>
                        </div>
                    </div>
                </div>



                <div class="card-footer bg-transparent text-center">

                    <button class="btn btn-primary col-12" data-toggle="modal" data-target="#addProfileModal">Add Accounts</button>
                    <p class="margin-top-10"><b>*Note:</b> Click on "<b class="text-blue"> Add Accounts </b>" button to add social
                        profiles like
                        [ Facebook,
                        Twitter,
                         Instagram, YouTube ]</p>
                </div>
            </div>
        </div>

        <div >

        </div>
        <!-- facebook -->

        <!-- twitter -->

        <!-- instagram -->

        <!-- linkedIn -->

        <!-- tumblr -->
        {{--<div class="col-md-4 active_account">--}}
        {{--<div class="shadow mb-5 bg-white tumb-card rounded">--}}
        {{--<div class="card-body">--}}
        {{--<span class="card_social_ribbon">--}}
        {{--<i class="fab fa-tumblr"></i>--}}
        {{--</span>--}}
        {{--<span class="profile_close">--}}
        {{--<i class="fas fa-times"></i>--}}
        {{--</span>--}}
        {{--<div class="text-center">--}}
        {{--<img class="rounded-circle" src="https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg"--}}
        {{--alt="ChanchalSantra">--}}
        {{--<h5 class="card-title no-space">Chanchal Santra</h5>--}}
        {{--<p class="card-text">Design is a FUNNY word !!</p>--}}
        {{--</div>--}}
        {{--<div class="row">--}}
        {{--<div class="col-md-6">--}}
        {{--<div class="text-center">--}}
        {{--<h5>50</h5>--}}
        {{--<h6>Follower</h6>--}}
        {{--</div>--}}
        {{--</div>--}}
        {{--<div class="col-md-6">--}}
        {{--<div class="text-center">--}}
        {{--<h5>50</h5>--}}
        {{--<h6>Following</h6>--}}
        {{--</div>--}}
        {{--</div>--}}
        {{--</div>--}}
        {{--</div>--}}
        {{--<div class="card-footer bg-transparent">--}}
        {{--<a href="#" class="btn btn-primary col-md-12">View Feeds</a>--}}
        {{--<a href="#" class="btn btn-dark col-md-12 margin-top-10">Update Profile</a>--}}
        {{--<a href="#" class="btn btn-outline-dark col-md-12 margin-top-10">View Account</a>--}}
        {{--</div>--}}
        {{--</div>--}}
        {{--</div>--}}
        <!-- Google plus -->

        <!-- Youtube -->

        <!-- Google Analytics -->

    </div>
@endsection


{{--@section('nav')--}}
{{--<ul class="navbar-nav">--}}
{{--<li class="nav-item dropdown">--}}
{{--<a class="nav-link dropdown-toggle dropdown-toggle-none-c" href="#" id="teamNavbarDropdown" role="button"--}}
{{--data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">--}}
{{--<i class="fas fa-chalkboard-teacher text-primary" data-toggle="tooltip" data-placement="bottom" title="Teams"></i>--}}
{{--</a>--}}
{{--@if(session()->has('team'))--}}

{{--<div class="dropdown-menu" aria-labelledby="teamNavbarDropdown">--}}
{{--@for ($i = 0; $i < count(session()->get('team')['teamSocialAccountDetails']); $i++)--}}
{{--<a class="dropdown-item"  href="{{env('APP_URL')}}dashboard/{{session()->get('team')['teamSocialAccountDetails'][$i][0]->team_id}}" id="{{session()->get('team')['teamSocialAccountDetails'][$i][0]->team_id}}">{{session()->get('team')['teamSocialAccountDetails'][$i][0]->team_name}}</a>--}}

{{--@endfor--}}
{{--<div class="dropdown-divider"></div>--}}
{{--<a class="dropdown-item" href="{{env('APP_URL')}}acceptnvitation">Accept Invitation</a>--}}
{{--<a class="dropdown-item" href="{{env('APP_URL')}}view-team/{{session()->get('currentTeam')['team_id']}}" id="">View Team</a>--}}
{{--<a class="dropdown-item" href="{{env('APP_URL')}}create-team">Create Team</a>--}}

{{--</div>--}}
{{--@else--}}
{{--<div class="dropdown-menu" aria-labelledby="teamNavbarDropdown">--}}
{{--<a class="dropdown-item active" href="#">SocioBoard</a>--}}
{{--<div class="dropdown-divider"></div>--}}
{{--<a class="dropdown-item" href="{{env('APP_URL')}}create-team">Create Team</a>--}}
{{--<a class="dropdown-item" href="{{env('APP_URL')}}view-team?id=">View Team</a>--}}
{{--<a class="dropdown-item" href="{{env('APP_URL')}}create-team">Create Team</a>--}}
{{--</div>--}}
{{--@endif--}}
{{--</li>--}}
{{--</ul>--}}
{{--@endsection--}}

@section('addaccountModal')
    <div class="modal fade addFacebookPageModal" id="addProfileModal" tabindex="-1" role="dialog" aria-labelledby="addProfileModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addProfileModalLabel">Adding Profiles</h5>
                    <button id="closeModal" type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true" id="close-add-profile-modal">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist" style="margin-left: 100px">
                        <li class="nav-item">
                            <a class="nav-link active" id="pills-facebook-tab" data-toggle="pill" href="#pills-facebook" role="tab"
                               aria-controls="pills-facebook" aria-selected="true"><i class="fab fa-facebook-f"></i></a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="pills-twitter-tab" data-toggle="pill" href="#pills-twitter" role="tab" aria-controls="pills-twitter"
                               aria-selected="false"><i class="fab fa-twitter"></i></a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" id="pills-instagram-tab" data-toggle="pill" href="#pills-instagram" role="tab"
                               aria-controls="pills-instagram" aria-selected="false"><i class="fab fa-instagram"></i></a>
                        </li>
                        {{--<li class="nav-item">--}}
                        {{--<a class="nav-link" id="pills-linkedin-tab" data-toggle="pill" href="#pills-linkedin" role="tab" aria-controls="pills-linkedin"--}}
                        {{--aria-selected="false"><i class="fab fa-linkedin-in"></i></a>--}}
                        {{--</li>--}}
                        {{--<li class="nav-item">--}}
                        {{--<a class="nav-link" id="pills-tumblr-tab" data-toggle="pill" href="#pills-tumblr" role="tab" aria-controls="pills-tumblr"--}}
                        {{--aria-selected="false"><i class="fab fa-tumblr"></i></a>--}}
                        {{--</li>--}}
                        {{--<li class="nav-item">--}}
                        {{--<a class="nav-link" id="pills-google-tab" data-toggle="pill" href="#pills-google" role="tab" aria-controls="pills-google"--}}
                        {{--aria-selected="false"><i class="fab fa-google-plus-g"></i></a>--}}
                        {{--</li>--}}
                        <li class="nav-item">
                            <a class="nav-link" id="pills-youtube-tab" data-toggle="pill" href="#pills-youtube" role="tab" aria-controls="pills-youtube"
                               aria-selected="false"><i class="fab fa-youtube"></i></a>
                        </li>
                        {{--<li class="nav-item">--}}
                        {{--<a class="nav-link" id="pills-google-analytics-tab" data-toggle="pill" href="#pills-google-analytics" role="tab"--}}
                        {{--aria-controls="pills-google-analytics" aria-selected="false"><i class="fas fa-chart-line"></i></a>--}}
                        {{--</li>--}}
                        <li class="nav-item">
                            <a class="nav-link" id="pills-pinterest-tab" data-toggle="pill" href="#pills-pinterest"
                               role="tab" aria-controls="pills-pinterest" aria-selected="false"><i
                                        class="fab fa-pinterest-p"></i></a>
                        </li>
                    </ul>
                    <div class="tab-content" id="pills-tabContent">

                                                <div class="tab-pane fade show active" id="pills-facebook" role="tabpanel" aria-labelledby="pills-facebook-tab">
                            <div class="text-center">
                                <p>Socioboard needs permission to access and publish content to Facebook on your behalf. To grant permission,

                                    you must be an admin for your brand�s Facebook page.</p>

                                <a href="{{env('APP_URL')}}facebook-add/{{env('ACCOUNT_ADD_FB')}}/{{$currentTeam['team_id']}}"><button type="button" class="btn btn-fb btn-sm" >Add a Facebook Profile</button></a>
                                <a href="{{env('APP_URL')}}facebook-add/{{env('ACCOUNT_ADD_FBP')}}/{{$currentTeam['team_id']}}"><button type="button" class="btn btn-fb btn-sm fb_page_btn">Add a Facebook Fanpage</button></a>
                            </div>
                            <?php $fbPageCount = 0; ?>
                            @if($fbpcount == 1)

                                <div class="card margin-top-10 fb_page_div">
                                    <div class="card-body bg-white">
                                        <h6><b>Choose Facebook Pages To Connect</b></h6>
                                        <div class="fb_page_scroll">
                                            <ul class="list-group">

                                                <li class="list-group-item page_list">

                                                    @for($i=0; $i<count(session()->get('facebookPage')); $i++)
                                                        <div class="media">
                                                            <img class="mr-3 pp_50 rounded-circle" src="{{session()->get('facebookPage')[$i]->profilePicture}}" alt="page title">
                                                            <div class="media-body">
															<span class="float-right badge badge-secondary">
																<div class="custom-control custom-checkbox" id="checkboxes">
                                                                    <input type="checkbox" class="custom-control-input" id="{{session()->get('facebookPage')[$i]->pageId}}" name="{{session()->get('facebookPage')[$i]->pageName}}">
                                                                    <label class="custom-control-label" for="{{session()->get('facebookPage')[$i]->pageId}}"><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                </div>
															</span>
                                                                <h5 class="mt-2 mb-0 page_name">{{session()->get('facebookPage')[$i]->pageName}}</h5>
                                                                <b style="font-size: 12px;">Follower:</b> {{session()->get('facebookPage')[$i]->fanCount}}
                                                            </div>
                                                        </div>
                                                    @endfor


                                                </li>
                                            </ul>
                                        </div>
                                        <div class="">
                                            <p class="float-left">&nbsp;</p>
                                            <button type="button" id="checkedPages" class="btn btn-fb btn-sm margin-top-10 float-right">Add <i class="far fa-plus-square"></i></button>
                                        </div>
                                    </div>
                                </div>

                            @endif

                        </div>
                        <div class="tab-pane fade" id="pills-twitter" role="tabpanel" aria-labelledby="pills-twitter-tab">
                            <div class="text-center">
                                <p>Please make sure you are logged in with the proper account when you authorize Socioboard.</p>
                                <a href="{{env('APP_URL')}}twitter/{{$currentTeam['team_id']}}">    <button class="btn btn-sm btn-twt">Add a Twitter Profile</button></a>
                                <div class="form-group custom-control custom-checkbox margin-top-10">
                                    <input type="checkbox" class="custom-control-input" id="Remember_check" checked="">
                                    <label class="custom-control-label text-gray-light" for="Remember_check">Follow Socioboard on twitter for
                                        update & announcements</label>
                                </div>
                            </div>
                        </div>
                        <div class="tab-pane fade" id="pills-instagram" role="tabpanel" aria-labelledby="pills-instagram-tab">
                            <div class="text-center">
                                <p>To allow Socioboard access to your Instagram account, you must first give authorization from the Instagram
                                    website.</p>
                                <a href="{{env('APP_URL')}}instagram/{{$currentTeam['team_id']}}">       <button type="button" class="btn btn-inst btn-sm">Add a Instagram Profile</button></a>
                                <a href="{{env('APP_URL')}}/facebook-add/{{env('ACCOUNT_ADD_INSTAGRAM_PAGE')}}/{{$currentTeam['team_id']}}"> <button type="button" class="btn btn-inst btn-sm">Add a Instagram business page</button></a>
                            </div>

                            @if($instaBusiness == 1)

                                <div class="card margin-top-10 fb_page_div">
                                    <div class="card-body bg-white">
                                        <h6><b>Choose Instagram Business To Connect</b></h6>
                                        <div class="fb_page_scroll">
                                            <ul class="list-group">

                                                <li class="list-group-item page_list">

                                                    @for($i=0; $i<count(session()->get('InstaBusiness')); $i++)
                                                        <div class="media">
                                                            <img class="mr-3 pp_50 rounded-circle" src="{{session()->get('InstaBusiness')[$i]->profile_pic}}" alt="page title">
                                                            <div class="media-body">
															<span class="float-right badge badge-secondary">
																<div class="custom-control custom-checkbox" id="InstaBusinesscheckboxes">
                                                                    <input type="checkbox" class="custom-control-input" id="{{session()->get('InstaBusiness')[$i]->social_id}}" name="{{session()->get('InstaBusiness')[$i]->userName}}">
                                                                    <label class="custom-control-label" for="{{session()->get('InstaBusiness')[$i]->social_id}}"><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                </div>
															</span>
                                                                <h5 class="mt-2 mb-0 page_name">{{session()->get('InstaBusiness')[$i]->userName}}</h5>
                                                                <b style="font-size: 12px;">Follower:</b> {{session()->get('InstaBusiness')[$i]->fanCount}}
                                                            </div>
                                                        </div>
                                                    @endfor


                                                </li>
                                            </ul>
                                        </div>
                                        <div class="">
                                            <p class="float-left">&nbsp;</p>
                                            <button type="button" id="checkedInstaBusiness" class="btn btn-fb btn-sm margin-top-10 float-right">Add <i class="far fa-plus-square"></i></button>
                                        </div>
                                    </div>
                                </div>

                            @endif



                        </div>
                        <div class="tab-pane fade" id="pills-linkedin" role="tabpanel" aria-labelledby="pills-linkedin-tab">
                            <div class="text-center">
                                <p>Grant access to your profile to share updates and view your feed.</p>
                                <a href="{{env('APP_URL')}}linkedin-add/{{env('ACCOUNT_ADD_LINKEDIN')}}/{{$currentTeam['team_id']}}">
                                    <button type="button" class="btn btn-in btn-sm">Add a LinkedIn Profile</button>
                                </a>
                                <a href="{{env('APP_URL')}}linkedin-add/{{env('ACCOUNT_ADD_LINKEDINC')}}/{{$currentTeam['team_id']}}">
                                    <button type="button" class="btn btn-in btn-sm">Add a LinkedIn Company profile
                                    </button>
                                </a>
                            </div>

                            {{--to show pages--}}
                            @if($lnccount == 1)
                                <div class="card margin-top-10 in_page_div">
                                    <div class="card-body bg-white">
                                        {{$lnccount}}
                                        <h6><b>Choose Linkedin Company Pages To Connect</b></h6>
                                        <div class="fb_page_scroll">
                                            <ul class="list-group">
                                                <li class="list-group-item page_list">

                                                    @for($i=0; $i<count(session()->get('linkedCompany')); $i++)
                                                        @if(session()->get('linkedCompany')[$i]->isAlreadyAdded != true)
                                                            <div class="media">
                                                                <img class="mr-3 pp_50 rounded-circle" src="{{session()->get('linkedCompany')[$i]->profileUrl}}" alt="page title">
                                                                <div class="media-body">
															<span class="float-right badge badge-secondary">
																<div class="custom-control custom-checkbox" id="linkedincheckboxes">
                                                                    <input type="checkbox" class="custom-control-input" id="{{session()->get('linkedCompany')[$i]->companyId}}" name="{{session()->get('linkedCompany')[$i]->companyName}}">
                                                                    <label class="custom-control-label" for="{{session()->get('linkedCompany')[$i]->companyId}}"><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                </div>
															</span>
                                                                    <h5 class="mt-2 mb-0 page_name">{{session()->get('linkedCompany')[$i]->companyName}}</h5>
                                                                </div>
                                                            </div>
                                                        @endif
                                                    @endfor
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="">
                                            <p class="float-left">&nbsp;</p>
                                            <button type="button" id="checkedCompany" class="btn btn-fb btn-sm margin-top-10 float-right">Add <i class="far fa-plus-square"></i></button>
                                        </div>
                                    </div>
                                </div>
                            @endif
                        </div>
                        {{--<div class="tab-pane fade" id="pills-tumblr" role="tabpanel" aria-labelledby="pills-tumblr-tab">--}}
                        {{--<div class="text-center">--}}
                        {{--<p>To allow Socioboard access to your Tumblr account, you must first give authorization from the Tumblr--}}
                        {{--website.</p>--}}
                        {{--<button type="button" class="btn btn-tumb btn-sm">Add a Tumblr Profile</button>--}}
                        {{--</div>--}}
                        {{--</div>--}}
                        {{--<div class="tab-pane fade" id="pills-google" role="tabpanel" aria-labelledby="pills-google-tab">--}}
                        {{--<div class="text-center">--}}
                        {{--<p>Allow Socioboard access to your Google+ account, you must first give authorization from the Google website.</p>--}}
                        {{--<a href="{{env('APP_URL')}}googleAdd/{{$currentTeam['team_id']}}">   <button type="button" class="btn btn-google btn-sm">Add a Google+ Profile</button></a>--}}
                        {{--</div>--}}
                        {{--</div>--}}
                        <div class="tab-pane fade" id="pills-youtube" role="tabpanel" aria-labelledby="pills-youtube-tab">
                            <div class="text-center">
                                <p>To allow Socioboard access to your Youtube account, you must first give authorization from the Youtube
                                    website.</p>
                                <a href="{{env('APP_URL')}}google-account-add/{{env('ACCOUNT_ADD_YOUTUBE')}}/{{$currentTeam['team_id']}}"><button type="button" class="btn btn-yt btn-sm">Connect your personal youtube</button></a>
                            </div>

                            {{--to show analytics acc--}}
                            <?php $youtubeChannelsCount = 0; ?>
                            @if($youtubeChannels == 1)
                                <div class="card margin-top-10 in_page_div">
                                    <div class="card-body bg-white">
                                        <h6><b>Choose youtube channels To Connect</b></h6>
                                        <div class="fb_page_scroll">
                                            <ul class="list-group">
                                                <li class="list-group-item page_list">

                                                    @for($i=0; $i<count(session()->get('youtubeChannels')); $i++)
                                                        @if(!isset(session()->get('youtubeChannels')[$i]->isAlreadyAdded))<?php $youtubeChannelsCount++; ?>
                                                            <div class="media">
                                                                <img class="mr-3 pp_50 rounded-circle" src="{{session()->get('youtubeChannels')[$i]->channelImage}}" alt="page title">
                                                                <div class="media-body">
															<span class="float-right badge badge-secondary">
																<div class="custom-control custom-checkbox" id="channelCheckboxes">
                                                                    <input type="checkbox" class="custom-control-input" id="{{session()->get('youtubeChannels')[$i]->channelId}}" name="{{session()->get('youtubeChannels')[$i]->channelName}}">
                                                                    <label class="custom-control-label" for="{{session()->get('youtubeChannels')[$i]->channelId}}"><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                </div>
															</span>
                                                                    <h5 class="mt-2 mb-0 page_name">{{session()->get('youtubeChannels')[$i]->channelName}}</h5>
                                                                    <b style="font-size: 12px;">views:</b> {{session()->get('youtubeChannels')[$i]->friendshipCount->viewCount}}
                                                                    <b style="font-size: 12px;">comments:</b> {{session()->get('youtubeChannels')[$i]->friendshipCount->commentCount}}
                                                                </div>
                                                            </div>
                                                        @else
                                                            <div class="media">Channel {{session()->get('youtubeChannels')[$i]->channelName }} is already added</div>

                                                        @endif
                                                    @endfor
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="">
                                            @if($youtubeChannelsCount > 0)
                                            <p class="float-left">&nbsp;</p>
                                            <button type="button" id="checkedChannels" class="btn btn-fb btn-sm margin-top-10 float-right">Add <i class="far fa-plus-square"></i></button>
                                            @endif
                                        </div>
                                    </div>
                                </div>
                            @endif
                        </div>
                        <div class="tab-pane fade" id="pills-google-analytics" role="tabpanel" aria-labelledby="pills-google-analytics-tab">
                            <div class="text-center">
                                <p>Add your Google Analytics Account to see how your website traffic correlates with your social media
                                    activity.</p>
                                <a href="{{env('APP_URL')}}google-account-add/{{env('ACCOUNT_ADD_GA')}}/{{$currentTeam['team_id']}}"> <button type="button" class="btn btn-orange btn-sm">Connect your personal GoogleAnalytics</button></a>
                            </div>

                            {{--to show analytics acc--}}
                            @if($ganalyticscount == 1)
                                <div class="card margin-top-10 in_page_div">
                                    <div class="card-body bg-white">
                                        <h6><b>Choose GoogleAnalytics Accounts To Connect</b></h6>
                                        <div class="fb_page_scroll">
                                            <ul class="list-group">
                                                {{--{{session()->get('linkedCompany')[0]->isAlreadyAdded}}--}}
                                                <li class="list-group-item page_list">
                                                    @for($i=0; $i<count(session()->get('GoogleAnalytics')); $i++)
                                                        @if(!isset(session()->get('GoogleAnalytics')[$i]->isAlreadyAdded))
                                                            <div class="media">
                                                                <img class="mr-3 pp_50 rounded-circle" src="{{session()->get('GoogleAnalytics')[$i]->profileUrl}}" alt="page title">
                                                                <div class="media-body">
															<span class="float-right badge badge-secondary">
																<div class="custom-control custom-checkbox" id="Analyticscheckboxes">
                                                                    <input type="checkbox" class="custom-control-input" id="{{session()->get('GoogleAnalytics')[$i]->socialId}}" name="{{session()->get('GoogleAnalytics')[$i]->firstName}}">
                                                                    <label class="custom-control-label" for="{{session()->get('GoogleAnalytics')[$i]->socialId}}"><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                </div>
															</span>
                                                                    <h5 class="mt-2 mb-0 page_name">{{session()->get('GoogleAnalytics')[$i]->firstName}}</h5>
                                                                </div>
                                                            </div>
                                                        @endif
                                                    @endfor
                                                </li>
                                            </ul>
                                        </div>
                                        <div class="">
                                            <p class="float-left">&nbsp;</p>
                                            <button type="button" id="checkedAnalytic" class="btn btn-fb btn-sm margin-top-10 float-right">Add <i class="far fa-plus-square"></i></button>
                                        </div>
                                    </div>
                                </div>
                            @endif
                        </div>
                        {{--                        commented temporarily--}}

                        <div class="tab-pane fade" id="pills-pinterest" role="tabpanel"
                             aria-labelledby="pills-pinterest-tab">
                            <div class="text-center">
                                <p>To allow Socioboard access to your Pinterest account, you must first give
                                    authorization from the Pinterest website.</p>
                                <a href="{{env('APP_URL')}}pinterest/{{env('ACCOUNT_ADD_PINTEREST')}}/{{$currentTeam['team_id']}}">     <button type="button" class="btn btn-pin btn-sm">Connect your Pinterest</button></a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- profile delete modal -->
    <div class="modal fade" id="profileDeleteModal" tabindex="-1" role="dialog" aria-labelledby="profileDeletModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-body text-center">
                    <h2 class="text-danger"><i class="far fa-frown-open"></i></h2>
                    <h5>Are you sure you want to delete this account ?</h5>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal"><i class="fas fa-times"></i> No</button>
                    <button type="button" onclick="del()" class="btn btn-danger btn-sm"><i class="fas fa-check"></i> Yes</button>
                </div>
            </div>
        </div>
    </div>

    <input style="display:none" id="teamId" value="{{$currentTeam['team_id']}}">
    @include('User::dashboard.incModalPost')

            <!-- post modal -->
    <div class="modal fade" id="postModal" tabindex="-1" role="dialog" aria-labelledby="postModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header p-1 bg-light">
                    <h5 class="modal-title">Create post</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body p-2">
                    <form id="publishForm">
                        <!-- post input box -->
                        <div class="form-group">
								<textarea name="message" class="form-control border border-light" id="normal_post_area" rows="3"
                                          placeholder="Write something !" ></textarea>
                        </div>
                        <div class="form-group">
                            <input type="text" class="form-control border border-light" name="link" id="outgoing_link" placeholder="Enter outgoing link">
                        </div>
                        <p id="messageError" style="color: red" ></p>

                        <!-- image and video upload -->
                        <div class="row">
                            <div class="col-12" id="option_upload">
                                <small>Note: Add only 4 items at a single time.</small>
                                <ul class="btn-nav">
                                    <li>
											<span>
												<i class="far fa-image text-secondary"></i>
												<input type="file" name="imageName[]" click-type="type1" class="picupload" multiple
                                                       accept="image/*" />
											</span>
                                    </li>
                                    <li>
											<span>
												<i class="fas fa-video text-secondary"></i>
												<input type="file" name="videoupload[]" click-type="type1" class="picupload" multiple
                                                       accept="video/*" />
											</span>
                                    </li>
                                </ul>
                                <br/>

                            </div>
                            <div class="col-12" id="hint_brand">
                                <ul id="media-list" class="clearfix">
                                    <li class="myupload">
                                        {{--<span>--}}
                                        {{--<i class="fa fa-plus" aria-hidden="true"></i>--}}
                                        {{--<input type="file" click-type="type2" id="picupload" class="picupload"--}}
                                        {{--multiple>--}}
                                        {{--</span>--}}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <!-- end of image and video upload -->
                        <hr>
                        <!-- user or pages add list -->
                        <div class="row">
                            <div class="col-md-12">
                                <button type="button" id="add-account-for-publish" class="btn btn-fb btn-sm all_social_btn">Add Accounts</button>
                                <div class="all_social_div">
                                    <div>
                                        <ul class="nav nav-pills mb-3" id="pills-tab" role="tablist">
                                            <li class="nav-item">
                                                <a class="nav-link active" id="pills-facebook-profile-tab"
                                                   data-toggle="pill" href="#pills-facebook-profile" role="tab"
                                                   aria-controls="pills-facebook-profile" aria-selected="true"><i
                                                            class="fab fa-facebook-f"></i></a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" id="pills-twitter-profile-tab"
                                                   data-toggle="pill" href="#pills-twitter-profile" role="tab"
                                                   aria-controls="pills-twitter-profile" aria-selected="false"><i
                                                            class="fab fa-twitter"></i></a>
                                            </li>
                                            {{--<li class="nav-item">--}}
                                            {{--<a class="nav-link" id="pills-linkedin-profile-tab"--}}
                                            {{--data-toggle="pill" href="#pills-linkedin-profile" role="tab"--}}
                                            {{--aria-controls="pills-linkedin-profile" aria-selected="false"><i--}}
                                            {{--class="fab fa-linkedin-in"></i></a>--}}
                                            {{--</li>--}}
                                            {{--<li class="nav-item">--}}
                                            {{--<a class="nav-link" id="pills-insta-profile-tab"--}}
                                            {{--data-toggle="pill" href="#pills-insta-profile" role="tab"--}}
                                            {{--aria-controls="pills-insta-profile" aria-selected="false"><i--}}
                                            {{--class="fab fa-linkedin-in"></i></a>--}}
                                            {{--</li>--}}

                                            <li class="nav-item">
                                                <a class="nav-link" id="pills-pinterest-profile-tab"
                                                   data-toggle="pill" href="#pills-pinterest-profile" role="tab"
                                                   aria-controls="pills-pinterest-profile" aria-selected="false"><i
                                                            class="fab fa-pinterest-p"></i></a>
                                            </li>
                                        </ul>
                                        <div class="tab-content" id="pills-tabContent">
                                            <div class="tab-pane fade show active" id="pills-facebook-profile"
                                                 role="tabpanel" aria-labelledby="pills-facebook-profile-tab">
                                                <div class="card margin-top-10">
                                                    <div class="card-body bg-white p-2">
                                                        <h6><b>Choose Facebook Pages for posting</b></h6>
                                                        <div>
                                                            <ul class="list-group">
                                                                @for($i=0;$i<count($socialAccount);$i++)
                                                                    @if( $socialAccount[$i]->account_type == env('FACEBOOKPAGE'))
                                                                        @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked == false)
                                                                            <li class="list-group-item page_list">
                                                                                <div class="media">
                                                                                    <img class="mr-3 pp_50 rounded-circle"  src="{{$socialAccount[$i]->profile_pic_url}}"  alt="page title">
                                                                                    <div class="media-body">
																				<span  class="float-right badge badge-light" id="checkboxes">
																					<div class="custom-control custom-checkbox">
                                                                                        <input type="checkbox"   class="custom-control-input"  id="{{$socialAccount[$i]->social_id}}" name="{{$socialAccount[$i]->account_id}}">
                                                                                        <label  class="custom-control-label"  for="{{$socialAccount[$i]->social_id}}"><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                                    </div>
																				</span>
                                                                                        <h5 class="mt-2 mb-0 page_name"> {{$socialAccount[$i]->first_name}}</h5>
                                                                                        <b   style="font-size: 12px;">Follower:</b>
                                                                                        {{$socialAccount[$i]->friendship_counts}}

                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        @endif

                                                                    @endif
                                                                @endfor
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="tab-pane fade" id="pills-twitter-profile" role="tabpanel"
                                                 aria-labelledby="pills-twitter-profile-tab">
                                                <div class="card margin-top-10">
                                                    <div class="card-body bg-white p-2">
                                                        <h6><b>Choose Twitter profile for posting</b></h6>
                                                        <div>
                                                            <ul class="list-group">
                                                                @for($i=0;$i<count($socialAccount);$i++)
                                                                    @if($socialAccount[$i]->account_type == env('TWITTER') )
                                                                        @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked == false)
                                                                            <li class="list-group-item page_list">
                                                                                <div class="media">
                                                                                    <img class="mr-3 pp_50 rounded-circle"
                                                                                         src="{{$socialAccount[$i]->profile_pic_url}}"
                                                                                         alt="page title">

                                                                                    <div class="media-body">
																				<span class="float-right badge badge-light">
																					<div class="custom-control custom-checkbox"
                                                                                         id="checkboxes">
                                                                                        <input type="checkbox"
                                                                                               class="custom-control-input"
                                                                                               id="{{$socialAccount[$i]->social_id}}"
                                                                                               name="{{$socialAccount[$i]->account_id}}">
                                                                                        <label class="custom-control-label"
                                                                                               for="{{$socialAccount[$i]->social_id}}"><span
                                                                                                    style="display: flex; margin-top: 6px;">Add</span></label>
                                                                                    </div>
																				</span>
                                                                                        <h5 class="mt-2 mb-0 page_name"> {{$socialAccount[$i]->first_name}}</h5>
                                                                                        <b style="font-size: 12px;">Follower:</b>
                                                                                        {{$socialAccount[$i]->friendship_counts}}

                                                                                    </div>
                                                                                </div>
                                                                            </li>
                                                                        @endif
                                                                    @endif
                                                                @endfor
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="tab-pane fade" id="pills-linkedin-profile" role="tabpanel"
                                                 aria-labelledby="pills-linkedin-profile-tab">
                                                <div class="card margin-top-10">
                                                    <div class="card-body bg-white p-2">
                                                        <h6><b>Choose Linkedin Profile and Pages for posting</b>
                                                        </h6>
                                                        <div>
                                                            <ul class="list-group">
                                                                @for($i=0;$i<count($socialAccount);$i++)
                                                                    @if($socialAccount[$i]->account_type == env('LINKEDIN') || $socialAccount[$i]->account_type == env('LINKEDINCOMPANY'))
                                                                        should give a condition for lock
                                                                        <li class="list-group-item page_list">
                                                                            <div class="media">
                                                                                <img class="mr-3 pp_50 rounded-circle"  src="{{$socialAccount[$i]->profile_pic_url}}"  alt="page title">
                                                                                <div class="media-body">
																				<span  class="float-right badge badge-light">
																					<div class="custom-control custom-checkbox" id="checkboxes">
                                                                                        <input type="checkbox"   class="custom-control-input"  id="{{$socialAccount[$i]->social_id}}" name="{{$socialAccount[$i]->account_id}}">
                                                                                        <label  class="custom-control-label"  for="{{$socialAccount[$i]->social_id}}"><span style="display: flex; margin-top: 6px;">Add</span></label>
                                                                                    </div>
																				</span>
                                                                                    <h5 class="mt-2 mb-0 page_name"> {{$socialAccount[$i]->first_name}}</h5>
                                                                                    <b   style="font-size: 12px;">Follower:</b>
                                                                                    {{$socialAccount[$i]->friendship_counts}}

                                                                                </div>
                                                                            </div>
                                                                        </li>
                                                                    @endif
                                                                @endfor
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="tab-pane fade" id="pills-pinterest-profile" role="tabpanel"
                                                 aria-labelledby="pills-pinterest-profile-tab">
                                                <div class="card margin-top-10">
                                                    <div class="card-body bg-white p-2">
                                                        <h6><b>Choose Pinterest boards for posting</b></h6>
                                                        <div class="accordion" id="accordionExample">
                                                            @for($i=0;$i<count($socialAccount);$i++)
                                                                @if( $socialAccount[$i]->account_type == env('PINTEREST'))
                                                                    @if($socialAccount[$i]->join_table_teams_social_accounts->is_account_locked == false)
                                                                        <div class="card border-0">
                                                                            <div class="card-header bg-danger text-white p-1 m-0"
                                                                                 id="headingOne" style="cursor: pointer;">
                                                                                <div data-toggle="collapse"
                                                                                     data-target="#profile_pin_1"
                                                                                     aria-expanded="true"
                                                                                     aria-controls="profile_pin_1">
                                                                                    <div class="media">
                                                                                        <img src="{{$socialAccount[$i]->profile_pic_url}}"
                                                                                             class="mr-3 pp_50 rounded-circle"
                                                                                             alt="avatar">
                                                                                        <div class="media-body">
                                                                                            <h5 class="mt-0 mb-0">{{$socialAccount[$i]->first_name}}</h5>

                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                            @if($i == 0)
                                                                                <div id="profile_pin_1" class="collapse show" aria-labelledby="headingOne" data-parent="#accordionExample">
                                                                                    @else
                                                                                        <div id="profile_pin_1" class="collapse" aria-labelledby="headingOne" data-parent="#accordionExample">
                                                                                            @endif

                                                                                            <div class="card-body p-2">
                                                                                                <ul class="list-group">
                                                                                                    @for($j=0;$j<count($pinterestBoards);$j++)

                                                                                                        @if($pinterestBoards[$j]->account_id == $socialAccount[$i]->account_id)

                                                                                                            @for($l=0;$l<count($pinterestBoards[$j]->boards);$l++)
                                                                                                                <li class="list-group-item page_list">
                                                                                                                    <div class="media">
                                                                                                                        {{--<img class="mr-3 pp_50 rounded-circle"--}}
                                                                                                                        {{--src="{{$pinterestBoards[$j]->boards[$l]->board_url}}"--}}
                                                                                                                        {{--alt="page title">--}}
                                                                                                                        <div class="media-body">
                                                                                                                <span class="float-right badge badge-light">
                                                                                                                    <div class="custom-control custom-checkbox" id="boardsCheckbox">
                                                                                                                        <input type="checkbox" class="custom-control-input" id="{{$pinterestBoards[$j]->account_id}}_{{$pinterestBoards[$j]->boards[$l]->board_id}}" name="{{$pinterestBoards[$j]->account_id}}_{{$pinterestBoards[$j]->boards[$l]->board_id}}">
                                                                                                                        <label class="custom-control-label" for="{{$pinterestBoards[$j]->account_id}}_{{$pinterestBoards[$j]->boards[$l]->board_id}}">
                                                                                                                            <span style="display: flex; margin-top: 6px;">Add</span>
                                                                                                                        </label>
                                                                                                                    </div>
                                                                                                                </span>
                                                                                                                            <h5 class="mt-2 mb-0 page_name">{{$pinterestBoards[$j]->boards[$l]->board_name}}</h5>
                                                                                                                        </div>
                                                                                                                    </div>
                                                                                                                </li>
                                                                                                            @endfor
                                                                                                        @endif
                                                                                                    @endfor
                                                                                                </ul>
                                                                                            </div>
                                                                                        </div>
                                                                                </div>
                                                                            @endif
                                                                            @endif
                                                                            @endfor

                                                                        </div>
                                                        </div>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="float-right">
                                <button type="button" onclick="post(0)" class="btn btn-secondary"><i id="draftspinstyle" class="fa fa-spinner fa-spin" style="display: none"></i> <span id="draftspin">Draft</span></button>
                                <button type="button" onclick="post(1)" class="btn btn-primary"><i id="test" class="fa fa-spinner fa-spin" style="display: none"></i> <span id="testText">Post</span></button>
                            </div>
                        </div></form>
                </div>

            </div>
        </div>
    </div>

    <div class="">
        <button type="button" class="btn btn-primary btn-lg shadow post_floating_btn" data-toggle="modal" data-target="#postModal">
            <i class="fas fa-pencil-ruler" style="margin-top: 8px;"></i>
        </button>
    </div>
@endsection

@section('script')

    <script>
        function clearSession($page){
            console.log($page);

        }


        //for GA
        var eventCategory = 'User';
        var eventAction = 'Dashboard('+'{{$currentTeam['team_name']}}'+')';

        var teamid = $('#teamId').val();
        var delAccountId = "";
        var $lnc = 0;
        var fbp = 0;
        var yc = 0;
        var ga = 0;
        var insta =0;
        getNetworkOnLoad();


        //       To check if session exists for adding accounts
        $ga = {{$ganalyticscount}}
       $lnc = {{$lnccount}}
       $fbp = {{$fbpcount}}
       $yc = {{$youtubeChannels}}
       $insta = {{$instaBusiness}}



        //for triggerring the modal on hvng pages or company acc to be addded
        if ($ga == 1 || $lnc == 1 || $fbp == 1 || $yc ==1 || $insta == 1) {

            $('#addProfileModal').modal('show');
            if($yc==1){
                $("#pills-youtube-tab").trigger('click');
            }else if($lnc==1){
                $("#pills-linkedin").trigger('click');
            }else if($fbp==1){
                $("#pills-facebook").trigger('click');
            }else if($ga==1){
                $("#pills-google-analytics-tab").trigger('click');
            }
            if($insta === 1){
                $("#pills-instagram-tab").trigger('click');
            }
        }


        function getNetworkOnLoad(){
            var data = '';
            var twitter='';
            var linkedIn='';
            var insta='';
            var instaB='';
            var googlePlus='';
            var youtube='';
            var ganalytics='';
            var facebookPage='';
            var pinterest='';
            var teamId = $('#teamId').val();var teamActive = document.getElementById(teamId);
            teamActive.setAttribute('class', 'dropdown-item active');



            $.ajax({
                url: "/getTeamDetails",
                type: 'POST',
                data:{
                    "teamId":teamId
                },
                beforeSend:function(){
                },
                success: function (response) {
                    /*
                     * 200 => success
                     * 500 => Something went wrong(Exception)
                     * 400 => Access denied*/


                    if( response.data.SocialAccount.length === 0){
                        //integrate a no account image if asked

                    }else{
                        $.each(response.data.SocialAccount, function(key,value){
                            switch(value.account_type) {
                                case 1:
                                    // code block
                                {{--data += '<div class="col-md-4 active_account"><div class="shadow mb-5 bg-white fb-card rounded"><div class="card-body"><span class="card_social_ribbon"><i class="fab fa-facebook-f"></i></span> <div id="profile_action_dropdown"  class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" href="#" ><i class="fas fa-user-lock fa-fw"></i> Lock this account</a > <a class="dropdown-item profile_close" onclick="SocialAccountDelete('+value.account_id+');"><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div><div class="text-center"><img class="rounded-circle" src="'+value.profile_pic_url+'" alt="profile picture"><h5 class="card-title no-space">'+value.first_name+'</h5><p class="card-text">'+value.email+'</p></div><div class="row text-center mt-1"><div class="col-md-6"><h5>'+value.friendship_counts+'</h5></div><div class="col-md-6"><h5>Friends</h5>  </div></div></div> <div class="card-footer bg-transparent"><a href="{{env('APP_URL')}}view-facebook-feeds/'+value.account_id+'" class="btn btn-primary col-md-12">View Feeds</a><a href="#" class="btn btn-dark col-md-12 margin-top-10">Update Profile</a> <a href="#" class="btn btn-outline-dark col-md-12 margin-top-10">View Account</a> </div> </div></div>'--}}
                                    if(value.join_table_teams_social_accounts.is_account_locked === false){
                                        //do not add deactive class
                                        data += '<div class="col-md-4 active_account "> <div class="shadow mb-5 bg-white fb-card rounded">  <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-facebook-f"></i> </span> <div  class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',1);" ><i class="fas fa-user-lock fa-fw"></i> Lock this account</a > <a class="dropdown-item profile_close" onclick="SocialAccountDelete('+value.account_id+');"><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+ value.friendship_counts +'' +
                                                '</h5></div> <div class="col-md-6"> <h5>Friends</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="#" class="btn btn-primary col-md-12" >View Feeds</a > </div> </div> </div>'

                                    }else{
                                        data += '<div class="col-md-4 active_account "> <div class="shadow mb-5 bg-white fb-card rounded"> <div class="card_deactivate"> <span class="card_social_ribbon"> <i class="fab fa-facebook-f"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',0);"><i class="fas fa-user-lock fa-fw"></i> Un-Lock this account</a > <a class="dropdown-item profile_close" onclick="SocialAccountDelete('+value.account_id+');"><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'' +
                                                '</h5></div> <div class="col-md-6"> <h5>Friends</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="" class="btn btn-primary col-md-12" >View Feeds</a > </div> </div> </div>'

                                    }
                                    break;
                                case 2:
                                {{--facebookPage += '<div class="col-md-4 active_account"><div class="shadow mb-5 bg-white fb-card rounded"><div class="card-body"><span class="card_social_ribbon"><i class="fab fa-facebook-f"></i></span><span class="profile_close" onclick="SocialAccountDelete('+value.account_id+');"><i class="fas fa-times"></i></span><div class="text-center"><img class="rounded-circle" src="'+value.profile_pic_url+'" alt="profile picture"><h5 class="card-title no-space">'+value.first_name+'</h5></div><div class="row text-center mt-1"><div class="col-md-6"><h5>'+value.friendship_counts+'</h5></div><div class="col-md-6"><h5>Followers</h5>  </div></div></div> <div class="card-footer bg-transparent"><a href="{{env('APP_URL')}}view-facebook-feeds/'+value.account_id+'" class="btn btn-primary col-md-12">View Feeds</a><a href="#" class="btn btn-dark col-md-12 margin-top-10">Update Profile</a> <a href="#" class="btn btn-outline-dark col-md-12 margin-top-10">View Account</a> </div> </div></div>'--}}

                                    if(value.join_table_teams_social_accounts.is_account_locked === false){
                                        //do not add deactive class
                                        data += '<div class="col-md-4 active_account "> <div class="shadow mb-5 bg-white fb-card rounded"> <div class="card-body"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-facebook-f"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',1);" ><i class="fas fa-user-lock fa-fw"></i> Lock this account</a > <a class="dropdown-item profile_close" onclick="SocialAccountDelete('+value.account_id+');"><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Friends</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="{{env('APP_URL')}}view-facebook-feeds/'+value.account_id+'" class="btn btn-primary col-md-12" >View Feeds</a > </div> </div> </div> </div>'

                                    }else{
                                        data += '<div class="col-md-4 active_account "> <div class="shadow mb-5 bg-white fb-card rounded"> <div class="card_deactivate"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-facebook-f"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',0);"><i class="fas fa-user-lock fa-fw"></i> Un-Lock this account</a > <a class="dropdown-item profile_close" onclick="SocialAccountDelete('+value.account_id+');"><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Friends</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="#" class="btn btn-primary col-md-12" >View Feeds</a > </div> </div> </div> </div>'

                                    }

                                    break;
                                case 3:
                                    // code block
                                    break;
                                case 4:


                                    if(value.join_table_teams_social_accounts.is_account_locked === false){
                                        //do not add deactive class
                                        twitter += '<div class="col-md-4 active_account "> <div class="shadow mb-5 bg-white fb-card rounded"> <div class="card-body"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-twitter"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',1);" ><i class="fas fa-user-lock fa-fw"></i> Lock this account</a > <a class="dropdown-item profile_close" onclick="SocialAccountDelete('+value.account_id+');"><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Following</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="{{env('APP_URL')}}view-twitter-feeds/'+value.account_id+'" class="btn btn-primary col-md-12" >View Feeds</a > </div> </div> </div> </div>'

                                    }else{
                                        twitter += '<div class="col-md-4 active_account "> <div class="shadow mb-5 bg-white fb-card rounded"> <div class="card_deactivate"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-twitter"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',0);"><i class="fas fa-user-lock fa-fw"></i> Un-Lock this account</a > <a class="dropdown-item profile_close" onclick="SocialAccountDelete('+value.account_id+');"><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Following</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="#" class="btn btn-primary col-md-12" >View Feeds</a > </div> </div> </div> </div>'

                                    }
//                                        ' <div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white twt-card rounded"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-twitter"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" href="#" ><i class="fas fa-user-lock fa-fw"></i> Lock this account</a > <a class="dropdown-item profile_close" href="#" ><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="../assets/imgs/bydefault.png" alt="Avatar" /> <h5 class="card-title no-space">Chanchal Santra</h5> <p class="card-text">Design is a FUNNY word !!</p> </div> <div class="row"> <div class="col-md-6"> <div class="text-center"> <h5>50</h5> <h6>Follower</h6> </div> </div> <div class="col-md-6"> <div class="text-center"> <h5>50</h5> <h6>Following</h6> </div> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="feeds/twt_feeds.html" class="btn btn-primary col-md-12" >View Feeds</a > </div> </div> </div>';

//                                    twitter += '<div class="col-md-4 active_account"><div class="shadow mb-5 bg-white twt-card rounded"><div class="card-body"><span class="card_social_ribbon"><i class="fab fa-twitter"></i></span><span class="profile_close" onclick="SocialAccountDelete('+value.account_id+');"><i class="fas fa-times"></i></span><div class="text-center"><img class="rounded-circle" src="'+value.profile_pic_url+'" alt="profile picture"><h5 class="card-title">'+value.first_name+'</h5></div><div class="row"><div class="col-md-6"> <div class="text-center"> <h5>'+value.friendship_counts+'</h5> </div></div> <div class="col-md-6">   <h5>Follower</h5></div>  </div> </div> <div class="card-footer bg-transparent"><a href="#" class="btn btn-primary col-md-12">View Feeds</a> <a href="#" class="btn btn-dark col-md-12 margin-top-10">Update Profile</a>  <a href="#" class="btn btn-outline-dark col-md-12 margin-top-10">View Account</a></div></div> </div>'

                                    break;
                                case 5:
                                    if (value.join_table_teams_social_accounts.is_account_locked === false) {
                                        //do not add deactive class

                                        insta += ' ' +
                                                '<div class="col-md-4 active_account">' +
                                                '<div class="shadow mb-5 bg-white inst-card rounded"><div class="card-body"><span class="card_social_ribbon"><i class="fab fa-instagram"></i></span><div class="profile_action_dropdown dropleft"><span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" ><i class="fas fa-chevron-down"></i></span><div class="dropdown-menu" aria-labelledby="profile_drop"><a class="dropdown-item" onclick="lock(' + value.account_id + ',1);" ><i class="fas fa-user-lock fa-fw"></i>Lock this account</a > <a class="dropdown-item profile_close" onclick="SocialAccountDelete(' + value.account_id + ');" ><i class="far fa-trash-alt fa-fw"></i>Delete this account</a ></div></div><div class="text-center"><img class="rounded-circle card-avatar" src="' + value.profile_pic_url + '" alt="profile picture" /> <h5 class="card-title no-space">' + value.first_name + '</h5><p class="card-text">' + value.email + '</p></div><div class="row text-center mt-1"><div class="col-md-6"> <h5>' + value.friendship_counts + '</h5></div> <div class="col-md-6"> <h5>Following</h5></div></div></div><div class="card-footer bg-transparent"><a href="{{env('APP_URL')}}view-instagram-feeds/' + value.account_id + '" class="btn btn-primary col-md-12">View Feeds</a></div></div></div>'
                                    } else {
                                        insta += ' <div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white inst-card rounded"> <div class="card_deactivate"> <span class="card_social_ribbon"> <i class="fab fa-instagram"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock(' + value.account_id + ',0);" ><i class="fas fa-user-lock fa-fw"></i> Un-Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete(' + value.account_id + '); "><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="' + value.profile_pic_url + '" alt="profile picture" /> <h5 class="card-title no-space">' + value.first_name + '</h5> <p class="card-text">' + value.email + '</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>' + value.friendship_counts + '</h5></div> <div class="col-md-6"> <h5>Following</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="#" class="btn btn-primary col-md-12" >View Feeds</a > </div> </div> </div>'

                                    }
                                    break;
                                case 6:
                                    if(value.join_table_teams_social_accounts.is_account_locked === false){
                                        //do not add deactive class
                                        linkedIn += '<div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white in-card rounded"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-linkedin-in"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',1);" ><i class="fas fa-user-lock fa-fw"></i> Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete('+value.account_id+'); "><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Friends</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="{{env('APP_URL')}}view-facebook-feeds/'+value.account_id+'" class="btn btn-primary col-md-12">View Feeds</a> </div> </div> </div>'

                                    }else{
                                        linkedIn += ' <div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white in-card rounded"> <div class="card_deactivate"> <span class="card_social_ribbon"> <i class="fab fa-linkedin-in"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',0);" ><i class="fas fa-user-lock fa-fw"></i> Un-Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete('+value.account_id+'); " ><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div>  <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Friends</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="#" class="btn btn-primary col-md-12">View Feeds</a> </div> </div> </div>'
                                    }
                                    break;
                                case 7:
                                    if(value.join_table_teams_social_accounts.is_account_locked === false){
                                        //do not add deactive class
                                        linkedIn += '<div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white in-card rounded"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-linkedin-in"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',1);" ><i class="fas fa-user-lock fa-fw"></i> Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete('+value.account_id+'); "><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Friends</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="{{env('APP_URL')}}view-facebook-feeds/'+value.account_id+'" class="btn btn-primary col-md-12">View Feeds</a> </div> </div> </div>'

                                    }else{
                                        linkedIn += ' <div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white in-card rounded"> <div class="card_deactivate"> <span class="card_social_ribbon"> <i class="fab fa-linkedin-in"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',0);" ><i class="fas fa-user-lock fa-fw"></i> Un-Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete('+value.account_id+'); " ><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div>  <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Friends</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="{{env('APP_URL')}}view-facebook-feeds/'+value.account_id+'" class="btn btn-primary col-md-12">View Feeds</a> </div> </div> </div>'
                                    }

                                    break;
                                case 8:
                                    googlePlus += '<div class="col-md-4 active_account">  <div class="shadow mb-5 bg-white google-card rounded"><div class="card-body">    <span class="card_social_ribbon"><i class="fab fa-google-plus-g"></i> </span> <span class="profile_close" > <i class="fas fa-times"></i>  </span>   <div class="text-center">   <img class="rounded-circle" src="https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg"alt="ChanchalSantra"><h5 class="card-title no-space">Chanchal Santra</h5>   <p class="card-text">Design is a FUNNY word !!</p></div><div class="row"><div class="col-md-6"><div class="text-center"><h5>50</h5><h6>Follower</h6></div></div><div class="col-md-6"><div class="text-center"><h5>50</h5><h6>Following</h6></div></div></div> </div>  <div class="card-footer bg-transparent"><a href="#" class="btn btn-primary col-md-12">View Feeds</a>  <a href="#" class="btn btn-dark col-md-12 margin-top-10">Update Profile</a> <a href="#" class="btn btn-outline-dark col-md-12 margin-top-10">View Account</a> </div></div>  </div>';
                                    break;
                                case 9:
                                    if(value.join_table_teams_social_accounts.is_account_locked === false){
                                        //do not add deactive class
                                        youtube += '<div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white yt-card rounded"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-youtube"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',1);" ><i class="fas fa-user-lock fa-fw"></i> Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete('+value.account_id+'); "><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Subscriptions</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="{{env('APP_URL')}}get-feeds/'+value.account_id+'/'+value.account_type+'" class="btn btn-primary col-md-12">View Feeds</a> </div> </div> </div>'

                                    }else{
                                        youtube += ' <div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white yt-card rounded"> <div class="card_deactivate"> <span class="card_social_ribbon"> <i class="fab fa-youtube"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',0);" ><i class="fas fa-user-lock fa-fw"></i> Un-Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete('+value.account_id+'); " ><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div>  <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Subscriptions</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="#" class="btn btn-primary col-md-12">View Report</a> </div> </div> </div>'
                                    }
//                                    youtube += '<div class="col-md-4 active_account"><div class="shadow mb-5 bg-white yt-card rounded"><div class="card-body"><span class="card_social_ribbon"><i class="fab fa-youtube"></i></span><span class="profile_close" onclick="SocialAccountDelete('+value.account_id+');"><i class="fas fa-times"></i></span><div class="text-center"><img class="rounded-circle" src="'+value.profile_pic_url+'" alt="Profile picture"><h5 class="card-title no-space">'+value.first_name+'</h5></div><div class="row"><div class="col-md-6"><div class="text-center"><h5>'+value.friendship_counts+'</h5></div></div><div class="col-md-6"> <h5>Subscriptions</h5></div> </div> </div>  <div class="card-footer bg-transparent"><a href="#" class="btn btn-primary col-md-12">View Feeds</a> <a href="#" class="btn btn-dark col-md-12 margin-top-10">Update Profile</a>   <a href="#" class="btn btn-outline-dark col-md-12 margin-top-10">View Account</a></div></div> </div>'
                                    break;
                                case 10:

                                    if(value.join_table_teams_social_accounts.is_account_locked === false){
                                        //do not add deactive class
                                        ganalytics += '<div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white orange-card rounded"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fas fa-chart-line"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',1);" ><i class="fas fa-user-lock fa-fw"></i> Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete('+value.account_id+'); "><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Subscriptions</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="{{env('APP_URL')}}view-facebook-feeds/'+value.account_id+'" class="btn btn-primary col-md-12">View Feeds</a> </div> </div> </div>'

                                    }else{
                                        ganalytics += ' <div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white orange-card rounded"> <div class="card_deactivate"> <span class="card_social_ribbon"> <i class="fas fa-chart-line"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',0);" ><i class="fas fa-user-lock fa-fw"></i> Un-Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete('+value.account_id+'); " ><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div>  <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Subscriptions</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="#" class="btn btn-primary col-md-12">View Feeds</a> </div> </div> </div>'
                                    }
//                                    ganalytics += '<div class="col-md-4 active_account"><div class="shadow mb-5 bg-white orange-card rounded">  <div class="card-body">  <span class="card_social_ribbon">  <i class="fas fa-chart-line"></i>  </span>   <span class="profile_close">   <i class="fas fa-times"></i>   </span>   <div class="text-center">    <img class="rounded-circle" src="https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg"alt="ChanchalSantra"> <h5 class="card-title no-space">Chanchal Santra</h5> <p class="card-text">Design is a FUNNY word !!</p></div> <div class="row">   <div class="col-md-6">   <div class="text-center">    <h5>50</h5>   <h6>Follower</h6>   </div>   </div>   <div class="col-md-6">   <div class="text-center">   <h5>50</h5>   <h6>Following</h6>    </div>    </div>    </div>    </div>         <div class="card-footer bg-transparent">         <a href="#" class="btn btn-primary col-md-12">View Feeds</a> <a href="#" class="btn btn-dark col-md-12 margin-top-10">Update Profile</a> <a href="#" class="btn btn-outline-dark col-md-12 margin-top-10">View Account</a></div></div></div>'

                                    break;

                                case 11:
                                    if(value.join_table_teams_social_accounts.is_account_locked === false){
                                        //do not add deactive class
                                        pinterest += '  <div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white pin-card rounded"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-pinterest-p"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',1);" ><i class="fas fa-user-lock fa-fw"></i> Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete('+value.account_id+'); " ><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture"/> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"> <div class="col-md-6">  <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Friends</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="{{env('APP_URL')}}view-pinterest-feeds/'+value.account_id+'" class="btn btn-primary col-md-12" class="btn btn-primary col-md-12">View Feeds</a> </div> </div> </div>'

                                    }else{
                                        pinterest += '   <div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white pin-card rounded"> <div class="card_deactivate"> <span class="card_social_ribbon"> <i class="fab fa-pinterest-p"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',0);" ><i class="fas fa-user-lock fa-fw"></i> Un- Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete('+value.account_id+'); " ><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture"/> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"> <div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Friends</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="{{env('APP_URL')}}view-pinterest-feeds/'+value.account_id+'" class="btn btn-primary col-md-12" class="btn btn-primary col-md-12">View Feeds</a> </div> </div> </div>'
                                    }


                                    break;
                                case 12:
                                    if(value.join_table_teams_social_accounts.is_account_locked === false){
                                        //do not add deactive class
//                                        alert(value.profile_pic_url);
                                        if(value.profile_pic_url === ""){
                                            instaB += ' <div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white inst-card rounded"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-instagram"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',1);" ><i class="fas fa-user-lock fa-fw"></i>Lock this account</a > <a class="dropdown-item profile_close" onclick="SocialAccountDelete('+value.account_id+');" ><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="{{env('APP_URL')}}assets/imgs/user-avatar.png" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Follower</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="{{env('APP_URL')}}get-feeds/'+value.account_id+'/'+value.account_type+'" class="btn btn-primary col-md-12" >View Feeds</a > </div> </div> </div>'

                                        }else{
                                            instaB += ' <div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white inst-card rounded"> <div class="card-body"> <span class="card_social_ribbon"> <i class="fab fa-instagram"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',1);" ><i class="fas fa-user-lock fa-fw"></i>Lock this account</a > <a class="dropdown-item profile_close" onclick="SocialAccountDelete('+value.account_id+');" ><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Follower</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="{{env('APP_URL')}}get-feeds/'+value.account_id+'/'+value.account_type+'" class="btn btn-primary col-md-12" >View Feeds</a > </div> </div> </div>'
                                        }

                                    }else{
                                        instaB += ' <div class="col-md-4 active_account"> <div class="shadow mb-5 bg-white inst-card rounded"> <div class="card_deactivate"> <span class="card_social_ribbon"> <i class="fab fa-instagram"></i> </span> <div class="profile_action_dropdown dropleft"> <span class="dropdown-toggle" id="profile_drop" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" > <i class="fas fa-chevron-down"></i> </span> <div class="dropdown-menu" aria-labelledby="profile_drop"> <a class="dropdown-item" onclick="lock('+value.account_id+',0);" ><i class="fas fa-user-lock fa-fw"></i> Un-Lock this account</a > <a class="dropdown-item profile_close" onclick=" SocialAccountDelete('+value.account_id+'); "><i class="far fa-trash-alt fa-fw"></i> Delete this account</a > </div> </div> <div class="text-center"> <img class="rounded-circle card-avatar" src="'+value.profile_pic_url+'" alt="profile picture" /> <h5 class="card-title no-space">'+value.first_name+'</h5> <p class="card-text">'+value.email+'</p> </div> <div class="row text-center mt-1"><div class="col-md-6"> <h5>'+value.friendship_counts+'</h5></div> <div class="col-md-6"> <h5>Follower</h5> </div> </div> </div> <div class="card-footer bg-transparent"> <a href="#" class="btn btn-primary col-md-12" >View Report</a > </div> </div> </div>'
                                    }

                                default:
                                    // code block
                                    break;
                            }

                        });
                    }

                    $("#social").append(data);
                    $("#social").append(twitter);
                    $("#social").append(insta);
                    $("#social").append(linkedIn);
                    $("#social").append(googlePlus);
                    $("#social").append(youtube);
                    $("#social").append(ganalytics);
                    $("#social").append(facebookPage);
                    $("#social").append(pinterest);
                    $("#social").append(instaB);
                },
                error:function(error){
                    console.log(error)
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        }


        function SocialAccountDelete(accountid){
            $('#profileDeleteModal').modal('show', function () {
            });
            delAccountId = accountid;
        }

        function del() {
            $.ajax({
                url: "/deleteSocialAccount",
                type: 'POST',
                data:{
                    "teamId":teamid,
                    "accountId":delAccountId
                },
                beforeSend:function(){
                    $('#profileDeleteModal').modal('hide')
                },
                success: function (response) {
                    if(response.code == 200){
                        swal({
                            text: "Account deleted successfully",
                            type:"success",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        document.location.href = '{{env('APP_URL')}}dashboard/'+teamid;
                    }else if(response.code == 400){
                        swal({
                            text: response.message,
                            type:"warning",
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }else{
                        swal({
                            text: "Sorry, Not able to process account deletion currently",
                            type:"warning",
                            showConfirmButton: false,
                            timer: 1500
                        });
                    }
                },
                error:function(error){
                    alert("Something went wrong..")
                    //                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        }

        $(document).on('click','#checkedCompany',function() {
            var selectedCom = [];
            $('#linkedincheckboxes input:checked').each(function() {
                selectedCom.push($(this).attr('name'));
            });

            $.ajax({
                url: "/linkedInCompany",
                type: 'POST',
                data:{
                    "company":selectedCom,
                    "teamId":teamid
                },
                beforeSend:function(){
                },
                success: function (response) {
                    /*200=>success account added
                     * 400 => access denied
                     * 500 =>exception*/

                    if(response.code == 200){
                        document.location.href = '{{env('APP_URL')}}dashboard/'+teamid;
                    }else if(response.code == 400){
                        $('#addProfileModal').modal('hide')
                        swal({text: response.message,
                            icon: "error",
                            buttons: true,
                            dangerMode: true,});
                    }else if(response.code == 500){
                        $('#addProfileModal').modal('hide')
                        swal({text: response.message,
                            icon: "error",
                            buttons: true,
                            dangerMode: true,});
                    }
                },
                error:function(error){
                    alert("Something went wrong.. Not able to delete team")
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        });
        $(document).on('click','#checkedAnalytic',function() {
            var selectedAna = [];
            $('#Analyticscheckboxes input:checked').each(function() {
                selectedAna.push($(this).attr('name'));
            });

            $.ajax({
                url: "/googleAnalyticsAccount",
                type: 'POST',
                data:{
                    "analytics":selectedAna,
                    "teamId":teamid
                },
                beforeSend:function(){
                },
                success: function (response) {
                    /*200=>success account added
                     * 400 => access denied
                     * 500 =>exception*/

                    if(response.code == 200){
                        document.location.href = '{{env('APP_URL')}}dashboard/'+teamid;
                    }else if(response.code == 400){
                        $('#addProfileModal').modal('hide')
                        swal({text: response.message,
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,});
                    }else if(response.code == 500){
                        $('#addProfileModal').modal('hide')
                        swal({text: response.message,
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,});
                    }
                },
                error:function(error){
                    alert("Something went wrong.. Not able to delete team");
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        });
        $(document).on('click','#checkedChannels',function() {
            var selectedChannels = [];
            $('#channelCheckboxes input:checked').each(function() {
                selectedChannels.push($(this).attr('name'));
            });

            $.ajax({
                url: "/youtubeChannels",
                type: 'POST',
                data:{
                    "channels":selectedChannels,
                    "teamId":teamid
                },
                beforeSend:function(){
                },
                success: function (response) {
                    /*200=>success account added
                     * 400 => access denied
                     * 500 =>exception*/

                    if(response.code == 200){
                        document.location.href = '{{env('APP_URL')}}dashboard/'+teamid;
                    }else if(response.code == 400){
                        $('#addProfileModal').modal('hide')
                        swal({text: response.message,
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,});
                    }else if(response.code == 500){
                        $('#addProfileModal').modal('hide')
                        swal({text: response.message,
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,});
                    }
                },
                error:function(error){
                    alert("Something went wrong.. Not able to delete team");
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        });


        $( "#checkedInstaBusiness").click(function() {

            var selected = [];
            $('#InstaBusinesscheckboxes input:checked').each(function() {
                selected.push($(this).attr('name'));
            });

            var teamId = $('#teamId').val();

            $.ajax({
                url: "/insta-business-add",
                type: 'POST',
                data:{
                    "pages":selected,
                    "teamId":teamId
                },
                beforeSend:function(){
                },
                success: function (response) {
                    console.log("Insta==>",response);
                    /*200=>success account added
                     * 400 => access denied
                     * 500 =>exception*/
                    if(response.code == 200){
                        if(response.errorIds.length != 0){
                            swal({title : "Error!",
                                text : "Could not add "+response.errorIds+"... Already added!!",
                                icon:"error",
                                closeOnClickOutside: false,
                                timer: 5000
                            }).then(()=>{
                                $('#addProfileModal').modal('hide');
                                document.location.href = '{{env('APP_URL')}}dashboard/'+teamId;
                            });
                        }
                        document.location.href = '{{env('APP_URL')}}dashboard/'+teamId;
                    }else if(response.code == 400){
                        $('#addProfileModal').modal('hide')

                        swal({
                            text: response.message,
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,});
                    }else if(response.code == 500){
                        $('#addProfileModal').modal('hide')
                        swal({text: response.message,
                            icon: "warning",
                            buttons: true,
                            dangerMode: true,});
                    }
                },
                error:function(error){
                    console.log("  " +error);
//                    alert("Something went wrong.. Not able to delete team")
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        });


        //       Ajax for clearing profile session
        $('#close-add-profile-modal').click(function(){

            $.ajax({
                url: "/clear-add-profile-session",
                type: 'GET',
                beforeSend:function(){
                },
                success: function (response) {

                }
            })
        });
        $(document).ready(function(){
            $( "#checkedPages").click(function() {
                var selected = [];
                $('#checkboxes input:checked').each(function() {
                    selected.push($(this).attr('name'));
                });

                var teamId = $('#teamId').val();

                $.ajax({
                    url: "/facebookPageAdd",
                    type: 'POST',
                    data:{
                        "pages":selected,
                        "teamId":teamId
                    },
                    beforeSend:function(){
                    },
                    success: function (response) {
                        console.log(response);
                        /*200=>success account added
                         * 400 => access denied
                         * 500 =>exception*/
                        if(response.code == 200){
                            if(response.errorIds.length != 0){
                                swal({title : "Error!",
                                    text : "Could not add "+response.errorIds+"... Already added!!",
                                    icon:"error",
                                    closeOnClickOutside: false,
                                    timer: 3000
                                }).then(()=>{
                                    $('#addProfileModal').modal('hide');
                                    document.location.href = '{{env('APP_URL')}}dashboard/'+teamId;
                            });
                            }

                            else document.location.href = '{{env('APP_URL')}}dashboard/'+teamId;
                        }else if(response.code == 400){
                            $('#addProfileModal').modal('hide')

                            swal({
                                text: response.message,
                                icon: "error",
                                buttons: true,
                                dangerMode: true,});
                        }else if(response.code == 500){
                            $('#addProfileModal').modal('hide')
                            swal({text: response.message,
                                icon: "error",
                                buttons: true,
                                dangerMode: true,});
                        }
                    },
                    error:function(error){
                        alert("Something went wrong.. Not able to add the accounts.")
//                    $('#error').text("Something went wrong.. Not able to create team");
                    }
                });
            });

        });

    </script>


    {{--post modal script--}}
    <script>


        // normal post emoji

        $("#normal_post_area").emojioneArea({
            pickerPosition: "right",
            tonesStyle: "bullet"
        });

        // all social list div open
        $('.all_social_div').css({
            'display': 'none'
        });
        $('.all_social_btn').click(function () {
            $('.all_social_div').css({
                'display': 'block'
            });
            $('.all_social_btn').css({
                'display': 'none'
            });
        });
        //    images and videos upload
        $(function () {
            var names = [];
            $('#hint_brand').css("display", "none");
            $('body').on('change', '.picupload', function (event) {

                var getAttr = $(this).attr('click-type');
                var files = event.target.files;
                var output = document.getElementById("media-list");
                var z = 0
                if (getAttr == 'type1') {
                    $('#media-list').html('');
                    //                $('#media-list').html('<li class="myupload"><span><i class="fa fa-plus" aria-hidden="true"></i><input type="file" click-type="type2" id="picupload" class="picupload" multiple></span></li>');
                    $('#hint_brand').css("display", "block");
                    $('#option_upload').css("display", "none");
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        names.push($(this).get(0).files[i].name);
                        if (file.type.match('image')) {
                            var picReader = new FileReader();
                            picReader.fileName = file.name
                            picReader.addEventListener("load", function (event) {
                                var picFile = event.target;
                                var div = document.createElement("li");
                                div.innerHTML = "<img src='" + picFile.result + "'" +
                                        "title='" + picFile.name + "'/><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);' data-id='" + event.target.fileName + "' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);
                            });
                        } else {
                            var picReader = new FileReader();
                            picReader.fileName = file.name
                            picReader.addEventListener("load", function (event) {
                                var picFile = event.target;
                                var div = document.createElement("li");
                                div.innerHTML = "<video src='" + picFile.result + "'" +
                                        "title='" + picFile.name + "'></video><div id='" + z + "'  class='post-thumb'><div  class='inner-post-thumb'><a data-id='" + event.target.fileName + "' href='javascript:void(0);' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);
                            });
                        }
                        picReader.readAsDataURL(file);
                    }
                } else if (getAttr == 'type2') {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        names.push($(this).get(0).files[i].name);
                        if (file.type.match('image')) {
                            var picReader = new FileReader();
                            picReader.fileName = file.name
                            picReader.addEventListener("load", function (event) {
                                var picFile = event.target;
                                var div = document.createElement("li");
                                div.innerHTML = "<img src='" + picFile.result + "'" +
                                        "title='" + picFile.name + "'/><div  class='post-thumb'><div class='inner-post-thumb'><a href='javascript:void(0);' data-id='" + event.target.fileName + "' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);

                            });
                        } else {
                            var picReader = new FileReader();
                            picReader.fileName = file.name
                            picReader.addEventListener("load", function (event) {

                                var picFile = event.target;

                                var div = document.createElement("li");

                                div.innerHTML = "<video src='" + picFile.result + "'" +
                                        "title='" + picFile.name + "'></video><div class='post-thumb'><div  class='inner-post-thumb'><a href='javascript:void(0);' data-id='" + event.target.fileName + "' class='remove-pic'><i class='fa fa-times' aria-hidden='true'></i></a><div></div>";
                                $("#media-list").prepend(div);

                            });
                        }
                        picReader.readAsDataURL(file);
                    }
                    // return array of file name
                }

            });

            $('body').on('click', '.remove-pic', function () {
                $(this).parent().parent().parent().remove();
                var removeItem = $(this).attr('data-id');
                var yet = names.indexOf(removeItem);
                if (yet != -1) {
                    names.splice(yet, 1);
                }

                // return array of file name
                $('#option_upload').css("display", "block");
            });
            $('#hint_brand').on('hide', function (e) {
                names = [];
                z = 0;
            });
        });





        //to get the country code
        getCountryCode();
        function getCountryCode(){
            $.ajax({
                url: "https://ipapi.co/json/",
                type: 'GET',
                success: function (response) {
                    var country = (window.location.hostname);
                    document.cookie = 'country='+response.country+";"+ ';domain='+country+';path=/';
                },
                error:function(error){
                    console.log(error);
                    //                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });
        }

        //    Lock and unlock acc 0=> unlock, 1=> lock
        function lock(accId,lockStat){
            $.ajax({
                type: "POST",
                url: "/lock-account",
                data:{
                    accId:accId,
                    lockStat: lockStat
                },
                beforeSend: function(){
                },
                cache: false,
                success: function(response){
                    if(response.code == 200){
                        swal({
                            text: "Account Unlocked successfully",
                            type:"success",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        document.location.href = '{{env('APP_URL')}}dashboard/'+teamid;
                    }else if(response.code == 201){
                        swal({
                            text: "Account locked successfully",
                            type:"success",
                            showConfirmButton: false,
                            timer: 1500
                        });
                        document.location.href = '{{env('APP_URL')}}dashboard/'+teamid;
                    }

                }
            });
        }

       $(document).on('click', '#addAccountModal', function(e){
           e.preventDefault();
           $('#postModal').modal('hide');
           $('#addProfileModal').modal('show');
       })
    </script>

@endsection
