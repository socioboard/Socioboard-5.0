<nav class="navbar fixed-top navbar-expand-lg navbar-light bg-white ">
    <div class="container">
        <a class="navbar-brand" href="{{env('APP_URL')}}dashboard/{{session()->get('team')['teamSocialAccountDetails'][0][0]->team_id}}">
            <strong class="text-orange-dark" data-toggle="tooltip" data-placement="bottom" title="SocioBoard">
                <img src="/assets/imgs/sb_icon.png" class="logo-brand" />
            </strong>
        </a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">

            @if(session()->get('user')['userDetails']->userPlanDetails->is_plan_active )
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item active">
                        <a class="nav-link" href="{{env('APP_URL')}}dashboard/{{session()->get('team')['teamSocialAccountDetails'][0][0]->team_id}}">Dashboard <span class="sr-only">(current)</span></a>
                    </li>
                    {{--<li class="nav-item dropdown">--}}
                    {{--<a class="nav-link dropdown-toggle" href="#" id="myFeedsNavbarDropdown" role="button" data-toggle="dropdown"--}}
                    {{--aria-haspopup="true" aria-expanded="false">--}}
                    {{--My feeds--}}
                    {{--</a>--}}
                    {{--<div class="dropdown-menu" aria-labelledby="myFeedsNavbarDropdown">--}}
                    {{--<a class="dropdown-item" href="./feeds/fb_feeds.html" title="Facebook Live Feeds is constantly updating the list of stories in the middle of your homepage. Live Feeds includes status updates, photos, videos, and links activity">Facebook</a>--}}
                    {{--<a class="dropdown-item" href="#" title="You can see your followers and following tweets. In addition, you can perform Re-tweet, Make Favorite, Sent Message, Spam, Reply, Task, Re-socio, and Reconnect">Twitter</a>--}}
                    {{--<a class="dropdown-item" href="#" title="You can see your Google Plus account live feeds and the Number of comment, like and share. You can also perform Reconnect, filter, and Re-socio">Google+</a>--}}
                    {{--<a class="dropdown-item" href="#" title="Instagram Feed page displays all the live activities been performed in Instagram like images, videos. In addition, you can Like, Comment, and create Task for the team members">Instagram</a>--}}
                    {{--<a class="dropdown-item" href="#" title="you can see your YouTube channel and watch or upload videos. Additional tasks like adding a comment, sort and Upload a new video">Youtube</a>--}}
                    {{--<a class="dropdown-item" href="#" title="You can find the page posts in LinkedIn page which is done through socioboard and LinkedIn page. In addition, you can add Comments and assign task to your team members">LinkedIn</a>--}}
                    {{--</div>--}}
                    {{--</li>--}}


                    {{--<li class="nav-item dropdown">--}}
                    {{--<a class="nav-link dropdown-toggle" href="#" id="myFeedsNavbarDropdown" role="button" data-toggle="dropdown"--}}
                    {{--aria-haspopup="true" aria-expanded="false">--}}
                    {{--Publishing--}}
                    {{--</a>--}}
                    {{--<div class="dropdown-menu" aria-labelledby="myFeedsNavbarDropdown">--}}
                    {{--<a class="dropdown-item" href="{{env('APP_URL')}}publish" title="Users Can Schedule Messages here by 'Selecting Profiles' which they need to post">Schedule--}}
                    {{--Messages</a>--}}
                    {{--<a class="dropdown-item" href="#" title="The 'Scheduled Messages' will appear here in the Queue until the time of publishing, Providing Options to users like Edit or Delete the Schedules">SocioQueue</a>--}}
                    {{--<a class="dropdown-item" href="#" title="Users Can Schedule Messages on day basis here by 'Selecting Profiles' which they need to post">Day--}}
                    {{--Wise SocioQueue</a>--}}
                    {{--<a class="dropdown-item" href="#" title="The Posts which are Saved to 'Drafts' will appear here, providing user options to Edit, Delete or Schedule the Stored Drafts">Drafts</a>--}}
                    {{--<a class="dropdown-item" href="#" title="Users can view details of their posts made through their 'Socioboard' account, it provides a detailed description of Posts, Date and Time of Schedules done">Calendar--}}
                    {{--View</a>--}}
                    {{--<a class="dropdown-item" href="#" title="You can see all your history for sent messages which are done through socioboard like (Compose, Schedule, Re-socio). In addition, you can Filter these Messages">History</a>--}}
                    {{--</div>--}}
                    {{--</li>--}}
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle active" href="#" id="myFeedsNavbarDropdown" role="button"
                           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            Publishing <span class="sr-only">(current)</span>
                        </a>
                        <div class="dropdown-menu" aria-labelledby="myFeedsNavbarDropdown">
                            <a class="dropdown-item" href="{{env('APP_URL')}}schedule_post"
                               title="Users Can Schedule Messages here by 'Selecting Profiles' which they need to post">Schedule
                                Messages</a>
                            <a class="dropdown-item" href="{{env('APP_URL')}}post_history"
                               title="Provides all the history about published and scheduled post.">History</a>
                        </div>
                    </li>

                    <li class="nav-item dropdown">
                        @if(session()->get('user')['userDetails']->userPlanDetails->content_studio == 1)
                            <a class="nav-link dropdown-toggle" href="#" id="ContentStudio" role="button"
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >
                                Content Studio
                            </a>
                            <div class="dropdown-menu" aria-labelledby="ContentStudio">
                                <a class="dropdown-item" href="{{env('APP_URL')}}content-studio/imgur" title="Imgur">Imgur</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}content-studio/flickr" title="Flickr">Flickr</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}content-studio/dailymotion" title="Dailymotion">Dailymotion</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}content-studio/newsapi" title="NewsApi">NewsApi</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}content-studio/pixabay" title="Pixabay">Pixabay</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}content-studio/giphy" title="Giphy">Giphy</a>
                            </div>
                        @else
                            <a class="nav-link dropdown-toggle" href="#" id="discoveryNavbarDropdown" role="button"
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onclick="planCheck({{session()->get('user')['userDetails']->userPlanDetails->content_studio}})">
                                Content Studio
                            </a>
                        @endif
                    </li>
                    <li class="nav-item dropdown">


                        @if(session()->get('user')['userDetails']->userPlanDetails->discovery == 1)
                            <a class="nav-link dropdown-toggle" href="#" id="boardNavbarDropdown" role="button" data-toggle="dropdown"
                               aria-haspopup="true" aria-expanded="false">
                                Discovery
                            </a>
                            <div class="dropdown-menu" aria-labelledby="boardNavbarDropdown">
                                <a class="dropdown-item" href="{{env('APP_URL')}}discovery/youtube" title="Youtube">YouTube</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}discovery/twitter" title="Twitter">Twitter</a>
                            </div>
                        @else
                            <a class="nav-link dropdown-toggle" href="#" id="boardNavbarDropdown" role="button" data-toggle="dropdown"
                               aria-haspopup="true" aria-expanded="false" onclick="planCheck({{session()->get('user')['userDetails']->userPlanDetails->discovery}})">
                                Discovery
                            </a>
                        @endif
                    </li>
                    <li class ="nav-item dropdown">
                        @if(session()->get('user')['userDetails']->userPlanDetails->rss_feeds == 1)
                            <a class="nav-link dropdown-toggle" href="#" id="rssDrop" role="button"
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >
                                RSS
                            </a>
                            <div class="dropdown-menu" aria-labelledby="rssDrop">
                                <a class="nav-link " href="{{env('APP_URL')}}rss-feed" >  Content Feeds</a>
                            </div>
                        @else
                            <a class="nav-link dropdown-toggle" href="#" id="rssDrop" role="button" onclick="planCheck({{session()->get('user')['userDetails']->userPlanDetails->rss_feeds}})"
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >
                                RSS
                            </a>
                        @endif
                    </li>
                    {{--<li class="nav-item dropdown">--}}


                    {{--@if(session()->get('user')['userDetails']->userPlanDetails->board_me == 1)--}}
                    {{--<a class="nav-link dropdown-toggle" href="#" id="boardNavbarDropdown" role="button" data-toggle="dropdown"--}}
                    {{--aria-haspopup="true" aria-expanded="false">--}}
                    {{--BoardMe--}}
                    {{--</a>--}}
                    {{--<div class="dropdown-menu" aria-labelledby="boardNavbarDropdown">--}}
                    {{--<a class="dropdown-item" href="{{env('APP_URL')}}discovery/youtube" title="Youtube">YouTube</a>--}}
                    {{--<a class="dropdown-item" href="{{env('APP_URL')}}discovery/twitter" title="Twitter">Twitter</a>--}}
                    {{--</div>--}}
                    {{--@else--}}
                    {{--<a class="nav-link dropdown-toggle" href="#" id="boardNavbarDropdown" role="button" data-toggle="dropdown"--}}
                    {{--aria-haspopup="true" aria-expanded="false" onclick="planCheck({{session()->get('user')['userDetails']->userPlanDetails->board_me}})">--}}
                    {{--BoardMe--}}
                    {{--</a>--}}
                    {{--@endif--}}
                    {{--</li>--}}
                    <li class="nav-item">
                        @if(session()->get('user')['userDetails']->userPlanDetails->board_me == 1)
                            <a class="nav-link" href="{{env('APP_URL')}}boardMe">BoardMe</a>
                        @else
                            <a class="nav-link" href="#" onclick="planCheck({{session()->get('user')['userDetails']->userPlanDetails->board_me}})">BoardMe</a>

                        @endif
                    </li>

                    <li class="nav-item dropdown">
                        @if(session()->get('user')['userDetails']->userPlanDetails->social_report == 1)
                            <a class="nav-link dropdown-toggle" href="#" id="ReportDropdown" role="button"
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >Report</a>

                            <div class="dropdown-menu" aria-labelledby="ReportDropdown">
                                <a class="dropdown-item" href="{{env('APP_URL')}}/report/{{env('REPORT_INITIAL')}}/{{env('FACEBOOKPAGE')}}" title="Facebook">Facebook
                                    Page</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}/report/{{env('REPORT_INITIAL')}}/{{env('TWITTER')}}"
                                   title="Twitter">Twitter</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}/report/{{env('REPORT_INITIAL')}}/{{env('INSTAGRAMBUSINESSPAGE')}}" title="Instagram">Instagram
                                    Business Account</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}/report/{{env('REPORT_INITIAL')}}/{{env('YOUTUBE')}}"
                                   title="YouTube">YouTube</a>
                                {{--<a class="dropdown-item" href="{{env('APP_URL')}}/report/{{env('REPORT_INITIAL')}}/{{env('TWITTER')}}"--}}
                                                                   {{--title="Twitter">Twitter</a>--}}
                            </div>
                        @else
                            <a class="nav-link dropdown-toggle" href="#" id="ReportDropdown" onclick="planCheck({{session()->get('user')['userDetails']->userPlanDetails->social_report}})">Report</a>
                        @endif

                    </li>

                    <li class="nav-item dropdown">
                        @if(session()->get('user')['userDetails']->userPlanDetails->share_library == 1)
                            <a class="nav-link dropdown-toggle" href="#" id="ReportDropdown" role="button"
                               data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" >Image Library</a>

                            <div class="dropdown-menu" aria-labelledby="ReportDropdown">
                                <a class="dropdown-item" href="{{env('APP_URL')}}/image-library/1" title="Private Image Library">Private Image Library</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}/image-library/0"
                                   title="Public Image Library">Public Image Library</a>
                            </div>
                        @else
                            <a class="nav-link dropdown-toggle" href="#" id="ReportDropdown" onclick="planCheck({{session()->get('user')['userDetails']->userPlanDetails->share_library}})">Report</a>
                        @endif

                    </li>
                    {{--<li class="nav-item">--}}
                    {{--<span class="nav-link" id="sidebarCollapse">More</span>--}}
                    {{--</li>--}}
                </ul>
                <ul class="navbar-nav">
                    <input type="hidden" id="ga_email" value="{{session('user')['userDetails']->email}}" />
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle dropdown-toggle-none-c" href="#" id="notficationDropdown"
                           role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" onclick="dec_notify()">
                            <i class="far fa-bell text-primary" data-toggle="tooltip" data-placement="bottom"
                               title="Notifications"></i>
                            <span class="badge badge-noti-count"></span>
                        </a>
                        <div class="dropdown-menu notification_drop p-0" aria-labelledby="notficationDropdown">
                            <div class="list-group list-group-flush p-0">
                                <div id="notify" style="max-height: 250px; overflow-y: scroll;">

                                </div>
                                <a href="{{env('APP_URL')}}seeAllNotifications"
                                   class="list-group-item list-group-item-action p-2 text-center text-primary">
                                    See All
                                </a>
                            </div>
                        </div>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle dropdown-toggle-none-c" href="#" id="teamNavbarDropdown" role="button"
                           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i class="fas fa-chalkboard-teacher text-primary" data-toggle="tooltip" data-placement="bottom" title="Teams"></i>
                        </a>
                        @if(session()->has('team'))

                            <div class="dropdown-menu" aria-labelledby="teamNavbarDropdown">
                                @for ($i = 0; $i < count(session()->get('team')['teamSocialAccountDetails']); $i++)
                                    <a class="dropdown-item"  href="{{env('APP_URL')}}dashboard/{{session()->get('team')['teamSocialAccountDetails'][$i][0]->team_id}}" id="{{session()->get('team')['teamSocialAccountDetails'][$i][0]->team_id}}">{{session()->get('team')['teamSocialAccountDetails'][$i][0]->team_name}}</a>

                                @endfor
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="{{env('APP_URL')}}accept-invitation">Invitation Request</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}view-team/{{session()->get('currentTeam')['team_id']}}" id="">View Team</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}create-team">Create Team</a>

                            </div>
                        @else
                            <div class="dropdown-menu" aria-labelledby="teamNavbarDropdown">
                                <a class="dropdown-item active" href="#">SocioBoard</a>
                                <div class="dropdown-divider"></div>
                                <a class="dropdown-item" href="{{env('APP_URL')}}accept-invitation">Invitation Request</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}view-team?id=">View Team</a>
                                <a class="dropdown-item" href="{{env('APP_URL')}}create-team">Create Team</a>
                            </div>
                        @endif
                    </li>
                </ul>

                <ul class="navbar-nav">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" id="settingsNavbarDropdown" role="button" data-toggle="dropdown"
                           aria-haspopup="true" aria-expanded="false">
                            {{session('user')['userDetails']->first_name}}
                        </a>
                        <div class="dropdown-menu" aria-labelledby="settingsNavbarDropdown">
                            <a class="dropdown-item" href="/settings">Settings</a>
                            {{--<a class="dropdown-item" href="#">Apps</a>--}}
                            {{--<a class="dropdown-item" href="#">E-wallet</a>--}}
                            {{--<a class="dropdown-item" href="#">YT Team Invite</a>--}}
                            {{--<a class="dropdown-item" href="#">Referral</a>--}}
                            {{--<a class="dropdown-item" href="#">Always Free</a>--}}
                            <a class="dropdown-item" href="{{env('APP_URL')}}link-shortening">Link Shortening</a>
                            <a class="dropdown-item" href="{{env('APP_URL')}}updatePlan" >Upgrade Plan</a>
                            <div class="dropdown-divider"></div>
                            <a class="dropdown-item" href="{{env('APP_URL')}}logout">Logout <i class="fas fa-sign-out-alt text-primary float-right"></i></a>
                        </div>
                    </li>
                </ul>
            @endif
        </div>
    </div>
</nav>


