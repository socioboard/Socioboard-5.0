<!DOCTYPE html>
<html lang="en" >
<!--begin::Head-->
<head>
    @include('user::Layouts._header')
</head>
<body  id="Sb_body"  class="header-fixed header-mobile-fixed subheader-enabled page-loading"  >

<!--begin::Main-->
<div class="d-flex flex-column flex-root">
    <!--begin::Login-->
    <div class="login login-2 login-signin-on d-flex flex-column flex-lg-row flex-column-fluid" id="Sb_login">
        <!--begin::Aside-->
        <div class="login-aside order-2 order-lg-1 d-flex flex-row-auto position-relative overflow-hidden">
            <!--begin: Aside Container-->
            <div class="d-flex flex-column-fluid flex-column justify-content-between py-9 px-7 py-lg-13 px-lg-35">

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
        <div class="content order-1 order-lg-2 d-flex flex-column w-100 pb-0" style="background-color: #eee;">
            <!--begin::Title-->
            <div class="d-flex flex-column justify-content-center text-center pt-lg-30 pt-md-5 pt-sm-5 px-lg-0 pt-2 px-7">
                <h3 class="display4 font-weight-bolder my-7 text-dark" style="color: #986923;">SocioBoard</h3>
                <p class="font-weight-bolder font-size-h2-md font-size-lg text-dark opacity-70">
                    Social Media Automation Toolkit For Small Businesses
                </p>
            </div>
            <!--end::Title-->

            <!--begin::Image-->
            <div class="content-img d-flex flex-row-fluid bgi-no-repeat bgi-position-y-bottom bgi-position-x-center" style="background-image: url({{asset('media/svg/illustrations/dashboard-boy.svg')}});"></div>
            <!--end::Image-->
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
