<!DOCTYPE html>
<html lang="en" >
<!--begin::Head-->
<head>
    @include('user::Layouts._header')
    <!-- Hotjar Tracking Code for https://appv5.socioboard.com/login -->
        <script>
            (function(h,o,t,j,a,r){
                h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
                h._hjSettings={hjid:2537425,hjsv:6};
                a=o.getElementsByTagName('head')[0];
                r=o.createElement('script');r.async=1;
                r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
                a.appendChild(r);
            })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
        </script>
        <!-- Global site tag (gtag.js) - Google Analytics -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-72806503-3"></script>
        <script>
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'UA-72806503-3');
        </script>
        <link href="/plugins/custom/intl-tel-input/build/css/intlTelInput.min.css" rel="stylesheet" type="text/css" />
</head>
<body  id="Sb_body"  class="header-fixed header-mobile-fixed subheader-enabled page-loading"  >

<!--begin::Main-->
<div class="d-flex flex-column flex-root">
    <!--begin::Login-->
    <div class="login login-2 login-signin-on d-flex flex-column flex-lg-row flex-column-fluid" id="Sb_login">
        <!--begin::Aside-->
        <div class="login-aside order-2 order-lg-1 d-flex flex-row-auto position-relative overflow-hidden">
            <!--begin: Aside Container-->
            <div class="d-flex flex-column justify-content-between py-9 px-7 py-lg-13 px-lg-35">

                <!--begin::Aside body-->
                <div class="d-flex flex-column-fluid flex-column flex-center">

                    <!--begin::Signup-->
                @yield('main-content')
                    <!--end::Signup-->
                </div>
                <!--end::Aside body-->
                <!-- begin:Signin -->
            @yield('footer-content')
                <!-- end:Signin -->
            </div>
            <!--end: Aside Container-->
        </div>
        <!--begin::Aside-->

        <!--begin::Content-->
        <div class="content order-1 order-lg-2 d-flex flex-column w-100 pb-0" style="background-color: #fff;">
            <!--begin::Title-->
            <div class="d-flex flex-column justify-content-center text-center pt-md-5 pt-sm-5 px-lg-0 pt-2 px-7">
                <h3 class="display4 font-weight-bolder my-7 text-dark" style="color: #986923;">SocioBoard</h3>
                <p class="font-weight-bolder font-size-h2-md font-size-lg text-dark opacity-70">
                    Social Media Publishing Simplified
                </p>
            </div>
            <!--end::Title-->
            <!--begin::carousel image-->
            <div id="SB_carouselIndicator" class="carousel slide" data-ride="carousel">
                <ol class="carousel-indicators">
                    <li data-target="#SB_carouselIndicator" data-slide-to="0" class="active"></li>
                    <li data-target="#SB_carouselIndicator" data-slide-to="1"></li>
                    <li data-target="#SB_carouselIndicator" data-slide-to="2"></li>
                    <li data-target="#SB_carouselIndicator" data-slide-to="3"></li>
                    <li data-target="#SB_carouselIndicator" data-slide-to="4"></li>
                    <li data-target="#SB_carouselIndicator" data-slide-to="5"></li>
                    <li data-target="#SB_carouselIndicator" data-slide-to="6"></li>
                </ol>
                <div class="carousel-inner SB_carousel-inner">
                    <div class="carousel-item active">
                        <img src="/media/png/dashboard_slider.png" class="d-block w-80 mr-auto ml-auto"  alt="...">
                        <div class="carousel-caption">
                            <a href="https://socioboard.com/book-a-demo/" target="_blank">
                                <button type="button" class="btn font-weight-bold text-center py-4 px-5">Book A Demo</button>
                            </a>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <img src="/media/png/youtube_slider.png" class="d-block w-80 mr-auto ml-auto" alt="...">
                        <div class="carousel-caption">
                            <a href="https://socioboard.com/book-a-demo/" target="_blank">
                                <button type="button" class="btn font-weight-bold text-center py-4 px-5">Book A Demo</button>
                            </a>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <img src="/media/png/contentstdio_slider.png" class="d-block w-80 mr-auto ml-auto" alt="...">
                        <div class="carousel-caption">
                            <a href="https://socioboard.com/book-a-demo/" target="_blank">
                                <button type="button" class="btn font-weight-bold text-center py-4 px-5">Book A Demo</button>
                            </a>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <img src="/media/png/discover_slider.png" class="d-block w-80 mr-auto ml-auto" alt="...">
                        <div class="carousel-caption">
                            <a href="https://socioboard.com/book-a-demo/" target="_blank">
                                <button type="button" class="btn font-weight-bold text-center py-4 px-5">Book A Demo</button>
                            </a>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <img src="/media/png/teams_slider.png" class="d-block w-80 mr-auto ml-auto" alt="...">
                        <div class="carousel-caption">
                            <a href="https://socioboard.com/book-a-demo/" target="_blank">
                                <button type="button" class="btn font-weight-bold text-center py-4 px-5">Book A Demo</button>
                            </a>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <img src="/media/png/reports_slider.png" class="d-block w-80 mr-auto ml-auto" alt="...">
                        <div class="carousel-caption">
                            <a href="https://socioboard.com/book-a-demo/" target="_blank">
                                <button type="button" class="btn font-weight-bold text-center py-4 px-5">Book A Demo</button>
                            </a>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <img src="/media/png/gallery_slider.png" class="d-block w-80 mr-auto ml-auto" alt="...">
                        <div class="carousel-caption">
                            <a href="https://socioboard.com/book-a-demo/" target="_blank">
                                <button type="button" class="btn font-weight-bold text-center py-4 px-5">Book A Demo</button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <!--end::carousel image-->
        </div>
        <!--end::Content-->
    </div>
    <!--end::Login-->
</div>
<!--end::Main-->





<!-- Facebook login script -->
@include('user::Layouts._footer')
<!-- end:Facebook login script-->

<!--begin::Global Theme Bundle(used by all pages)-->
@include('user::Layouts._common_script_links')
<!--end::Global Theme Bundle-->

</body>
