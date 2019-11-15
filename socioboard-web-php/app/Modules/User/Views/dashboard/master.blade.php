<!DOCTYPE html>
<html>


<head>

    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.9/sweetalert2.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/limonte-sweetalert2/6.6.9/sweetalert2.min.js"></script>
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <!-- Global site tag (gtag.js) - Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=UA-145069111-1"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'UA-145069111-1');
    </script>

    <meta http-equiv="Content-Type" content="application/javascript" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no" />
    @yield('title')
    <meta name="google-site-verification" content="" />
    <meta name="description"
          content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it." />
    <meta name="keywords"
          content="Social Media Management Software, Social Media Management tool, Open Source Social Media Management, Social Media Management" />
    <meta name="author" content="Socioboard Technologies">
    <meta name="designer" content="Chanchal Santra">

    {{--    {{for tel}}--}}
    <link rel="stylesheet" href="assets/plugins/intel-tel-input/intlTelInput.css">
    <link rel="apple-touch-icon" sizes="57x57" href="../assets/imgs/favicon/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="../assets/imgs/favicon/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="../assets/imgs/favicon/apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="../assets/imgs/favicon/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="../assets/imgs/favicon/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="../assets/imgs/favicon/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="../assets/imgs/favicon/apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="../assets/imgs/favicon/apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../assets/imgs/favicon/apple-icon-180x180.png">
    <link rel="icon" type="image/png" sizes="192x192" href="../assets/imgs/favicon/android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="../assets/imgs/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="../assets/imgs/favicon/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../assets/imgs/favicon/favicon-16x16.png">

    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" rel="stylesheet">

    <link rel="manifest" href="../assets/imgs/favicon/manifest.json">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="../assets/imgs/favicon/ms-icon-144x144.png">
    <meta name="theme-color" content="#ffffff">
    <meta property="og:site_name" content="socioboard.com">
    <meta property="og:title"
          content="Socioboard - Open Source Social Technology Enabler | Find More Customers on Social Media">
    <meta property="og:description"

          content="Be�it�marketing(finding�leads/customers)�on�Social�media,�or�listening�to�customer�complaints,�replying�to�them,�managing�multiple�social�media�accounts�from�one�single�dashboard,�finding�influencers�in�a�particular�category�and�reaching�out�to�them�and�many�more�things,�Socioboard�products�can�do�it.">

    <meta property="og:type" content="website">
    <meta property="og:image" content="http://i.imgur.com/1B8wv5m.png">
    <meta property="og:url" content="https://www.facebook.com/SocioBoard">
    <meta itemprop="name" content="Socioboard" />
    <meta itemprop="description"
          content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it." />


    <link rel="stylesheet" type="text/css" href="../assets/plugins/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="../assets/plugins/fontawesome/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="../assets/plugins/dropify/dist/css/dropify.min.css">
    <link rel="stylesheet" type="text/css" href="../assets/plugins/emojionearea/css/emojionearea.min.css">
    <link rel="stylesheet" type="text/css"
          href="../../assets/plugins/datetimepicker/build/css/bootstrap-datetimepicker.min.css">
    <link rel="stylesheet" type="text/css" href="../../assets/plugins/DataTables/DataTables/css/jquery.dataTables.css">
    <link rel="stylesheet" type="text/css" href="../../assets/plugins/DataTables/Select/css/select.dataTables.min.css">
    <!-- Scrollbar Custom CSS -->
    <link rel="stylesheet" href="../assets/plugins/scrollbar/jquery.mCustomScrollbar.min.css">
    <link rel="stylesheet" type="text/css" href="../assets/css/style.css">
    @yield('style')

</head>


<body>

<!-- Sidebar  -->

@include('User::dashboard.incSidebar')

<header>
    @include('User::dashboard.incNav')

</header>


<main>
    <div class="container margin-top-60">
        @yield('welcome')

                <!-- all social profiles -->
        @yield('social')

        {{--Accounts part--}}
        @yield('account')
        @yield('link-shortening')
        {{--@yield('linkShortening')--}}
        @yield('createteam')

        @yield('viewTeam')


        @yield('facebookFeed')


        @yield('publish')
        @yield('acceptInvitation')
        @yield('loader')
        @yield('price')
        @yield('seeAllNotifications')

        {{-- Discovery --}}
        @yield('imgur')
        @yield('giphy')
        @yield('pixabay')
        @yield('dailymotion')
        @yield('flickr')
        @yield('newsapi')
        @yield('rssDiscovery')
        @yield('youtubeDiscovery')
        @yield('twitterDiscovery')
        @yield('boardMeList')



        {{--Schedule --}}
        @yield('schedule')
        @yield('post_hitory')


        {{--image library--}}
        @yield('public_library')



    </div>



    {{--<footer>--}}
    {{--<div class="main_footer">--}}
    {{--<div class="container">--}}
    {{--<div class="row">--}}
    {{--<div class="col-md-3 text-center">--}}
    {{--<img src="../assets/imgs/sb_icon.png" class="img-fluid" style="width: 100px;padding: 10px;">--}}
    {{--<h3>SOCIOBOARD</h3>--}}
    {{--</div>--}}
    {{--<div class="col-md-3">--}}
    {{--<h6><strong>SOCIOBOARD</strong></h6>--}}
    {{--<ul class="no-padding">--}}
    {{--<li>--}}
    {{--<a href="#" class="text-white">Page 1</a>--}}
    {{--</li>--}}
    {{--<li>--}}
    {{--<a href="#" class="text-white">Page 2</a>--}}
    {{--</li>--}}
    {{--<li>--}}
    {{--<a href="#" class="text-white">Page 3</a>--}}
    {{--</li>--}}
    {{--<li>--}}
    {{--<a href="#" class="text-white">Page 4</a>--}}
    {{--</li>--}}
    {{--</ul>--}}
    {{--</div>--}}
    {{--<div class="col-md-3">--}}
    {{--<h6><strong>COMPANY</strong></h6>--}}
    {{--<ul class="no-padding">--}}
    {{--<li>--}}
    {{--<a href="#" class="text-white">Careers</a>--}}
    {{--</li>--}}
    {{--<li>--}}
    {{--<a href="#" class="text-white">Training</a>--}}
    {{--</li>--}}
    {{--<li>--}}
    {{--<a href="#" class="text-white">FAQs</a>--}}
    {{--</li>--}}
    {{--<li>--}}
    {{--<a href="#" class="text-white">Page 4</a>--}}
    {{--</li>--}}
    {{--</ul>--}}
    {{--</div>--}}
    {{--<div class="col-md-3">--}}
    {{--<h6><strong>SOCIAL</strong></h6>--}}
    {{--<ul class="no-padding">--}}
    {{--<li>--}}
    {{--<div class="fb-like text-white" data-href="https://www.facebook.com/SocioBoard" data-layout="button"--}}
    {{--data-action="like" data-size="small" data-show-faces="false" data-share="true"></div>--}}
    {{--</li>--}}
    {{--<li class="mt-2">--}}
    {{--<a href="https://twitter.com/share" class="twitter-share-button" data-show-count="false">Tweet</a>--}}
    {{--<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>--}}
    {{--</li>--}}
    {{--<li>--}}
    {{--<a class="twitter-follow-button" href="https://twitter.com/Socioboard" data-show-screen-name="false">Follow</a>--}}
    {{--</li>--}}
    {{--<li>--}}
    {{--<a href="https://www.youtube.com/channel/UCcxAmhWPh6AXfpaG2Eq4pzw/featured" target="_blank" class="btn btn-yt-tutorial btn-sm text-white">--}}
    {{--<i class="fab fa-youtube"></i> <b>tutorial</b>--}}
    {{--</a>--}}
    {{--</li>--}}
    {{--<li>--}}
    {{--<a href="https://play.google.com/store/apps/details?id=com.socioboard&hl=en" target="_blank" class="btn btn-sm btn-android-app"><i--}}
    {{--class="fab fa-google-play"></i> <b>Android--}}
    {{--App</b></a>--}}
    {{--<a href="https://itunes.apple.com/sg/app/socioboard/id923398550?mt=8" target="_blank" class="btn btn-sm btn-app-store"><i--}}
    {{--class="fab fa-apple"></i> <b>IOS App</b></a>--}}
    {{--</li>--}}
    {{--</ul>--}}
    {{--</div>--}}
    {{--</div>--}}
    {{--</div>--}}
    {{--</div>--}}
    {{--<div class="sub_footer">--}}
    {{--<div class="container">--}}
    {{--<div class="row">--}}
    {{--<div class="col-md-12">--}}
    {{--<p class="no-space text-center">--}}

    {{--Copyright � 2014 - 2019 Socioboard Technologies Pvt. Ltd. All Rights Reserved.--}}


    {{--&nbsp; <a href="../PrivacyPolicy.html" target="_blank" class="text-orange-light">Privacy Policy</a>--}}
    {{--&nbsp; <a href="../Refund_Policy.html" target="_blank" class="text-orange-light">Refund Policy</a>--}}
    {{--&nbsp; <a href="../TermsConditions.html" target="_blank" class="text-orange-light">Terms Conditions</a>--}}
    {{--</p>--}}
    {{--</div>--}}
    {{--</div>--}}
    {{--</div>--}}
    {{--</div>--}}
    {{--</footer>--}}

    <!-- Add Profile Modal -->
    @yield('addaccountModal')

            <!-- profile delete modal -->
    <div class="modal fade" id="profileDeleteModal" tabindex="-1" role="dialog" aria-labelledby="profileDeletModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-body text-center">
                    <h2 class="text-danger"><i class="far fa-frown-open"></i></h2>
                    <h5>Are you want to delete this account ?</h5>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary btn-sm" data-dismiss="modal"><i class="fas fa-times"></i> No</button>
                    <button type="button" class="btn btn-danger btn-sm yes_del_btn"><i class="fas fa-check"></i> Yes</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Plan Modal -->
    <div class="modal fade " id="planModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content ">
                <div class="modal-header">
                    <h5 class="modal-title" id="socioboardplan">SocioBoard Plan</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        {{--                        {{session()->get('user')['userDetails']->Activations}}--}}

                        {{--@if(session()->get('user')['userDetails']['Activations'] == 0)--}}
                        {{--@endif--}}
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Free</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 0)
                                    <button  class="btn btn-primary btn-sm plan" >Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 0)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('BASIC')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 0)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('BASIC')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Standard</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 1)
                                    <button  class="btn btn-primary btn-sm plan">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 1)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('STANDARD')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 1)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('STANDARD')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Premium</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 2)
                                    <button  class="btn btn-primary btn-sm plan" >Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 2)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('PREMIUM')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 2)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('PREMIUM')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Deluxe</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 3)
                                    <button  class="btn btn-primary btn-sm plan">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 3)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('DELUXE')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 3)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('DELUXE')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Topaz</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 4)
                                    <button  class="btn btn-primary btn-sm plan">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 4)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('TOPAZ')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 4)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('TOPAZ')}}">Upgrade</button>
                                @endif
                            </div>
                        </div> <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Ruby</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 5)
                                    <button  class="btn btn-primary btn-sm plan">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 5)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('RUBY')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 5)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('RUBY')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Gold</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 6)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('GOLD')}}">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 6)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('GOLD')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 6)
                                    <button  class="btn btn-primary btn-sm plan">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Platinum</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 7)
                                    <button  class="btn btn-primary btn-sm plan">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 7)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('PLATINUM')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 7)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('PLATINUM')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <?php

    //for socket getting teams id
    $data = Session::get('team')['teamSocialAccountDetails'];
    foreach($data as $team){
        $teamId[] = $team[0]->team_id;
    }
    $value = json_encode($teamId);

    //gettting current team id
    $teamId =Session::get('currentTeam')['team_id'];

    ?>
    <input type="hidden" id="userID" value={{session()->get('user')['userDetails']->user_id}} />
    <input type="hidden" id="teamSocket" value="{{$value}}" />
    <input style="display:none" id="teamId" value="{{$teamId}}">
    <input style="display: none" id="planInput" value="{{session()->get('user')['userDetails']->Activations->user_plan}}" >

</main>
@yield('modals')
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>


<script type="text/javascript" src="../assets/js/jquery-3.3.1.min.js"></script>
<script type="text/javascript" src="../assets/plugins/popper/umd/popper.min.js"></script>
<script type="text/javascript" src="../assets/plugins/bootstrap/js/bootstrap.min.js"></script>
<script type="text/javascript" src="../assets/plugins/dropify/dist/js/dropify.min.js"></script>


<script type="text/javascript" src="../../assets/plugins/emojionearea/js/emojionearea.min.js"></script>
<script src="../assets/js/sweetalert.min.js"></script>
<!-- jQuery Custom Scroller CDN -->
<script src="../assets/plugins/scrollbar/jquery.mCustomScrollbar.concat.min.js"></script>
<script type="text/javascript" src="../../assets/plugins/DataTables/DataTables/js/jquery.dataTables.min.js"></script>
<script type="text/javascript" src="../../assets/plugins/DataTables/Select/js/dataTables.select.min.js"></script>


{{--<script type="text/javascript" src="../assets/js/main.js"></script>--}}
<script src="../../assets/plugins/moment.min.js"></script>
<script type="text/javascript" src="../../assets/plugins/datetimepicker/build/js/bootstrap-datetimepicker.min.js"></script>
{{--<script for toaster--}}
<script type="text/javascript" src="../assets/plugins/toaster/jquery.toaster.js"></script>


<!--   $('#addProfileModal').modal('show'); like and share code -->
<div id="fb-root"></div>
<script>
    (function (d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) return;
        js = d.createElement(s); js.id = id;
        js.src = 'https://connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v3.2&appId=1551064375135193&autoLogAppEvents=1';
        fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
</script>

<!-- sidebar toggle -->
<script type="text/javascript">
    $(document).ready(function () {
        $("#sidebar").mCustomScrollbar({
            theme: "minimal"
        });

        $('#dismiss, .overlay').on('click', function () {
            $('#sidebar').removeClass('active');
            $('.overlay').removeClass('active');
        });

        $('#sidebarCollapse').on('click', function () {

            $('#sidebar').addClass('active');
            $('.overlay').addClass('active');
            $('.collapse.in').toggleClass('in');
            $('a[aria-expanded=true]').attr('aria-expanded', 'false');
        });
    });
</script>

@yield('script')
{{--Plan   (Aishwarya M)--}}

@include('User::dashboard.incPlanChangeJs')

{{--uncomment in local--}}


@include('User::dashboard.incNotificationJs')
        <!-- Google Analytics -->
<script>
    window.ga=window.ga||function(){(ga.q=ga.q||[]).push(arguments)};ga.l=+new Date;
    ga('create', '{{env('GA_TRACK_ID')}}', 'auto', {
        'name': 'event'
    });
    ga('event.send', 'pageview');
    ga('event.send', 'event', {
        'eventCategory': eventCategory,
        'eventAction': eventAction,
        'eventLabel': '{{session('user')['userDetails']->email}}'
    });
</script>
<script async src='https://www.google-analytics.com/analytics.js'></script>
<!-- End Google Analytics -->
</body>

</html>
