<!DOCTYPE html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no" />


    @yield('title')
    <meta name="google-site-verification" content="" />
    <meta name="description" content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it." />
    <meta name="keywords" content="Social Media Management Software, Social Media Management tool, Open Source Social Media Management, Social Media Management" />
    <meta name="author" content="Socioboard Technologies">
    <meta name="designer" content="Chanchal Santra">

{{--    {{for tel}}--}}
    <link rel="stylesheet" href="assets/plugins/intel-tel-input/intlTelInput.css">
    <link rel="apple-touch-icon" sizes="57x57" href="assets/imgs/favicon/apple-icon-57x57.png">
    <link rel="apple-touch-icon" sizes="60x60" href="assets/imgs/favicon/apple-icon-60x60.png">
    <link rel="apple-touch-icon" sizes="72x72" href="assets/imgs/favicon/apple-icon-72x72.png">
    <link rel="apple-touch-icon" sizes="76x76" href="assets/imgs/favicon/apple-icon-76x76.png">
    <link rel="apple-touch-icon" sizes="114x114" href="assets/imgs/favicon/apple-icon-114x114.png">
    <link rel="apple-touch-icon" sizes="120x120" href="assets/imgs/favicon/apple-icon-120x120.png">
    <link rel="apple-touch-icon" sizes="144x144" href="assets/imgs/favicon/apple-icon-144x144.png">
    <link rel="apple-touch-icon" sizes="152x152" href="assets/imgs/favicon/apple-icon-152x152.png">
    <link rel="apple-touch-icon" sizes="180x180" href="assets/imgs/favicon/apple-icon-180x180.png">
    <link rel="icon" type="image/png" sizes="192x192" href="assets/imgs/favicon/android-icon-192x192.png">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/imgs/favicon/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="96x96" href="assets/imgs/favicon/favicon-96x96.png">
    <link rel="icon" type="image/png" sizes="16x16" href="assets/imgs/favicon/favicon-16x16.png">
    <link rel="stylesheet" type="text/css" href="../assets/plugins/dropify/dist/css/dropify.min.css">
    <link rel="stylesheet" type="text/css" href="../assets/plugins/emojionearea/css/emojionearea.min.css">
    <link rel="manifest" href="assets/imgs/favicon/manifest.json">
    <meta name="msapplication-TileColor" content="#ffffff">
    <meta name="msapplication-TileImage" content="assets/imgs/favicon/ms-icon-144x144.png">
    <meta name="theme-color" content="#ffffff">
    <meta property="og:site_name" content="socioboard.com">
    <meta property="og:title" content="Socioboard - Open Source Social Technology Enabler | Find More Customers on Social Media">
    <meta property="og:description" content="Be�it�marketing(finding�leads/customers)�on�Social�media,�or�listening�to�customer�complaints,�replying�to�them,�managing�multiple�social�media�accounts�from�one�single�dashboard,�finding�influencers�in�a�particular�category�and�reaching�out�to�them�and�many�more�things,�Socioboard�products�can�do�it.">
    <meta property="og:type" content="website">
    <meta property="og:image" content="http://i.imgur.com/1B8wv5m.png">
    <meta property="og:url" content="https://www.facebook.com/SocioBoard">
    <meta itemprop="name" content="Socioboard" />
    <meta itemprop="description" content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it." />


    <link rel="stylesheet" type="text/css" href="assets/plugins/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="assets/plugins/fontawesome/css/all.min.css">
    <link rel="stylesheet" type="text/css" href="assets/css/style.css">



</head>
<body>
<header>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="/"><strong><i class="fas fa-yin-yang"></i> <span class="text-orange-dark">Socio</span><span
                        class="text-orange-light">Board</span></strong></a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
{{--        <div class="collapse navbar-collapse" id="navbarSupportedContent">--}}
{{--            <ul class="navbar-nav mr-auto"></ul>--}}
{{--            <ul class="navbar-nav">--}}
{{--                <li class="nav-item ">--}}
{{--                    <a class="nav-link" href="/">Home</a>--}}
{{--                </li>--}}
{{--                <li class="nav-item">--}}
{{--                    <a class="nav-item nav-link" href="#">Company</a>--}}
{{--                </li>--}}
{{--                <li class="nav-item">--}}
{{--                    <a class="nav-item nav-link" href="#">Products</a>--}}
{{--                </li>--}}
{{--                <li class="nav-item dropdown">--}}
{{--                    <a class="nav-link dropdown-toggle" href="#" id="VersionDropdown" role="button" data-toggle="dropdown"--}}
{{--                       aria-haspopup="true" aria-expanded="false">--}}
{{--                        Versions--}}
{{--                    </a>--}}
{{--                    <div class="dropdown-menu" aria-labelledby="VersionDropdown">--}}
{{--                        <a class="dropdown-item" href="#">Community</a>--}}
{{--                        <a class="dropdown-item" href="#">Agency</a>--}}
{{--                        <a class="dropdown-item" href="#">Enterprice</a>--}}
{{--                    </div>--}}
{{--                </li>--}}
{{--                <li class="nav-item">--}}
{{--                    <a class="nav-item nav-link" href="#">Pricing</a>--}}
{{--                </li>--}}
{{--                <li class="nav-item active">--}}
{{--                    <a class="nav-item nav-link" href="/login">SignIn <span class="sr-only">(current)</span></a>--}}
{{--                </li>--}}
{{--            </ul>--}}
{{--        </div>--}}
    </nav>
</header>
<main>

   @yield('index')
   @yield('signup')

   @yield('login')
    @yield('twoStepAuth')



    <footer>
        <div class="main_footer">
            <div class="container">
                <div class="row">
                    <div class="col-md-3 text-center">
                        <img src="assets/imgs/sb_icon.png" class="img-fluid" style="width: 100px;padding: 10px;">
                        <h3>SOCIOBOARD</h3>
                    </div>
                    <div class="col-md-3">
                        <h6><strong>COMPANY</strong></h6>
                        <ul class="no-padding">
                            <li>
                                <a href="#" class="text-white">Careers</a>
                            </li>
                            <li>
                                <a href="#" class="text-white">Training</a>
                            </li>
                            <li>
                                <a href="#" class="text-white">FAQs</a>
                            </li>
                            <li>
                                <a href="#" class="text-white">Page 4</a>
                            </li>
                        </ul>
                    </div>
                    <div class="col-md-3">
                        <h6><strong>INSIGHTS</strong></h6>
                        <ul class="no-padding">
                            <li>
                                <a href="#" class="text-white">Wiki</a>
                            </li>
                            <li>
                                <a href="#" class="text-white">Blogs</a>
                            </li>
                            <li>
                                <a href="#" class="text-white">Download</a>
                            </li>
                            <li>
                                <a href="#" class="text-white">Page 4</a>
                            </li>
                        </ul>
                    </div>
                    <div class="col-md-3">
                        <h6><strong>SOCIAL</strong></h6>
                        <ul class="no-padding">
                            <li>
                                <div class="fb-like text-white" data-href="https://www.facebook.com/SocioBoard"
                                     data-layout="button" data-action="like" data-size="small" data-show-faces="false"
                                     data-share="true"></div>
                            </li>
                            <li class="mt-2">
                                <a href="https://twitter.com/share" class="twitter-share-button" data-show-count="false">Tweet</a>
                                <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
                            </li>
                            <li>
                                <a class="twitter-follow-button" href="https://twitter.com/Socioboard"
                                   data-show-screen-name="false">Follow</a>
                            </li>
                            <li>
                                <a href="https://www.youtube.com/channel/UCcxAmhWPh6AXfpaG2Eq4pzw/featured" target="_blank"
                                   class="btn btn-yt-tutorial btn-sm text-white">
                                    <i class="fab fa-youtube"></i> <b>tutorial</b>
                                </a>
                            </li>
                            <li>
                                <a href="https://play.google.com/store/apps/details?id=com.socioboard&hl=en" target="_blank"
                                   class="btn btn-sm btn-android-app"><i class="fab fa-google-play"></i> <b>Android
                                        App</b></a>
                                <a href="https://itunes.apple.com/sg/app/socioboard/id923398550?mt=8" target="_blank"
                                   class="btn btn-sm btn-app-store"><i class="fab fa-apple"></i> <b>IOS App</b></a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        <div class="sub_footer">
            <div class="container">
                <div class="row">
                    <div class="col-md-12">
                        <p class="no-space text-center">
                            Copyright � 2014 - 2019 Socioboard Technologies Pvt. Ltd. All Rights Reserved.
                            &nbsp; <a href="PrivacyPolicy.html" target="_blank" class="text-orange-light">Privacy
                                Policy</a>
                            &nbsp; <a href="Refund_Policy.html" target="_blank" class="text-orange-light">Refund
                                Policy</a>
                            &nbsp; <a href="TermsConditions.html" target="_blank" class="text-orange-light">Terms
                                Conditions</a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </footer>
</main>


<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-58515856-3"></script>
<script src="../assets/js/sweetalert.min.js"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());

    gtag('config', 'UA-58515856-3');
</script>

<script type="text/javascript" src="assets/js/jquery-3.3.1.slim.min.js"></script>
<script type="text/javascript" src="assets/js/jquery-3.3.1.min.js"></script>
<script type="text/javascript" src="assets/plugins/popper/umd/popper.min.js"></script>
<script type="text/javascript" src="assets/plugins/bootstrap/js/bootstrap.min.js"></script>
<script type="text/javascript" src="../assets/plugins/dropify/dist/js/dropify.min.js"></script>

<script type="text/javascript" src="../assets/plugins/emojionearea/js/emojionearea.min.js"></script>

<script type="text/javascript" src="assets/js/main.js"></script>
<!-- facebook like and share code -->
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
<!-- end of fb like and share code -->



@yield('script')


</body>

</html>
