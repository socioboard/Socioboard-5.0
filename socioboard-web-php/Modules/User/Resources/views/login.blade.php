@extends('user::Layouts._master')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Login</title>
@endsection
@section('main-content')
    <!--begin::Signin-->
    <div id="error" hidden style="color: red;text-align:center;">

    </div>
    <div class="login-form py-11">
        <!--begin::Form-->
        <div class="form">
            <!--begin::Title-->
            <!--begin::Form-->
            @if(session('invalidSocial'))
                <div style="color: red;text-align:center;">
                    {{session('invalidSocial')}}
                </div>
            @endif
            @if(isset($ErrorMessage))
                <div style="color: red;text-align:center;">
                    {{$ErrorMessage}}
                </div>
            @endif

            <div class="form" id="form">
                <!--begin::Title-->
                <div class="text-center pb-8">
                    <h2 class="font-weight-bolder font-size-h2 font-size-h1-lg">Sign In</h2>
                    <span class="font-weight-bold font-size-h4">Or <a href="{{url('/register')}}"
                                                                      class="text-primary font-weight-bolder"
                                                                      id="Sb_login_signup">Create An Account</a></span>
                </div>
                <!--end::Title-->
                <form class="form" novalidate="novalidate" method="post" action="{{url('/login')}}" id="login_form">
                @csrf
                <!--begin::Form group-->
                    <div class="form-group">
                        <div class="input-icon">
                            <label for="emailOrUsername" style="display: none"></label>
                            <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6"
                                   type="text"
                                   name="emailOrUsername" id="emailOrUsername" autocomplete="off" placeholder="Email"/>
                            <span><i class="far fa-user"></i></span>
                        </div>
                        <span id="validEmail" style="color: red;font-size: medium;" role="alert">
                      <strong>{{ $errors->first('emailOrUsername') }}</strong>
                </span>
                    </div>
                    <!--end::Form group-->

                    <!--begin::Form group-->
                    <div class="form-group">
                        <div class="input-icon input-icon-right" id="new_password">
                            <label for="password" style="display: none"></label>
                            <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6"
                                   type="password" name="password" id="password"
                                   placeholder="Password"/>
                            <span><a href="javascript:;"><i class="fas fa-eye-slash toggle-password"></i></a></span>
                        </div>
                        <span id="validPassword" style="color: red;font-size: medium;" role="alert">
                      <strong>{{ $errors->first('password') }}</strong>
                    </span>
                    </div>
                    <!--end::Form group-->
                    <!--begin::Form group-->
                    <div class="form-group">
                        <div class="d-flex justify-content-between mt-n5">
                            <label class="checkbox mb-0 pt-5">
                                <input type="checkbox" name="remember-me"/>
                                <span class="mr-2"></span>
                                Remember Me
                            </label>
                            <a href="{{url('/forgot-password')}}"
                               class="text-primary font-size-h6 font-weight-bolder text-hover-primary pt-5">
                                Forgot Password ?
                            </a>
                        </div>
                    </div>
                    <!--end::Form group-->
                    <!--begin::Action-->
                    <div class="text-center pt-2">
                        <button type="submit" id="login_button"
                                class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3">Sign In
                        </button>
                    </div>
                    <!--end::Action-->
                </form>
            </div>
            <!--end::Form-->
            <!--begin: Aside footer for desktop-->
            <div class="text-center">
                <!-- Email login button -->
                <div>
                    <button type="button" class="btn font-weight-bolder pl-20 pr-20 mt-5 font-size-h6"
                            data-toggle="modal" data-target="#emailSignInModal">
                                    <span class="svg-icon svg-icon-md">
                                        <i class="far fa-envelope"></i>
                                    </span>
                        Sign in with Email
                    </button>
                    <!-- begin:Email modal -->
                    <div class="modal fade" id="emailSignInModal" tabindex="-1" role="dialog"
                         aria-labelledby="emailSignInModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered modal" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="emailSignInModalLabel">Email</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <i aria-hidden="true" class="ki ki-close"></i>
                                    </button>
                                </div>
                                <div class="modal-body">
                                    <!--begin::Form group-->
                                    <div class="form-group">
                                        <div class="input-icon">
                                            <label for="emailLoginId" style="display: none"></label>
                                            <input
                                                    class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                                    type="text" name="emailLoginName" id="emailLoginId"
                                                    autocomplete="off"
                                                    placeholder="Email"/>
                                            <div class="error text-danger" id="emailLoginError1"></div>
                                        </div>
                                    </div>
                                    <!--end::Form group-->
                                </div>

                                <div class="modal-footer" style="padding: 8px 21px 20px 21px">
                                    <button type="button" class="btn font-weight-bolder "
                                            onclick="emailLogin()">Submit
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <!-- end:email modal -->
                </div>
                <!-- end:Email login button -->
                <!-- Facebook login button -->
                <div>
                    <button type="button" class="btn bg-facebook font-weight-bolder pl-20 pr-20 mt-5 font-size-h6"
                            onclick="location.href='/social/Facebook'">
                                    <span class="svg-icon svg-icon-md">
                                        <i class="fab fa-facebook"> </i>
                                    </span>
                        Sign in with Facebook
                    </button>
                </div>
                <!-- end:Facebook login button -->
                <!-- Google login button -->
                <div>
                    <button type="button" class="btn bg-google font-weight-bolder pl-20 pr-20 mt-5 font-size-h6"
                            onclick="location.href='/social/Google'">
                                    <span class="svg-icon svg-icon-md">
                                        <i class="fab fa-google"></i>
                                    </span>
                        Sign in with Google
                    </button>
                </div>
                <!-- end:Google login button -->

                <!-- Twitter login button -->
                <div>
                    <button type="button" class="btn bg-twitter font-weight-bolder pl-20 pr-20 mt-5 font-size-h6"
                            onclick="location.href='/social/Twitter'">
                                    <span class="svg-icon svg-icon-md">
                                        <i class="fab fa-twitter"></i>
                                    </span>
                        Sign in with Twitter
                    </button>
                </div>
                <!-- end:Twitter login button -->
                <!-- Git-hub login button -->
                <div>
                    <button type="button" class="btn bg-github font-weight-bolder pl-20 pr-20 mt-5 font-size-h6"
                            onclick="location.href='/social/GitHub'">
                                    <span class="svg-icon svg-icon-md">
                                        <i class="fab fa-github"></i>
                                    </span>
                        Sign in with Github
                    </button>
                </div>
                <!-- end:Git-hub login button -->
            </div>
            <!--end: Aside footer for desktop-->
        </div>
    </div>
    <!--end::Signin-->
@endsection
@section('script')
    <script src="{{asset('../js/IncJsFiles/login.js')}}"></script>
    <script>
        sessionStorage.clear();//destroying session.
        /**
         * TODO We have to switch theme from dark to white and vice versa based on day or night time , if its day time then white and if its night time the dark theme.
         * This function is used for switching theme of dark and night based on day or night time on every 15 minutes it will check and run code.
         * ! Do not change this function without checking script code of changing theme.
         */
        function changeThemeByTime() {
            let date = new Date();
            let hours = date.getHours();
            if (hours >= 7 && hours < 18) {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }

        }
        $(document).ready(function () {//calling function on onload of the page to determine the theme change
            changeThemeByTime();
        });
        localStorage.setItem('isLoggedIn', '0');
    </script>
@endsection

