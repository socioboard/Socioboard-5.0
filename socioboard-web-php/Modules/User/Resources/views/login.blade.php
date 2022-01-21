@extends('user::Layouts._master')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Login</title>
@endsection
@section('main-content')
    <!--begin::Signin-->
    <div id="error" hidden style="color: red;text-align:center;">

    </div>
    <div class="login-form">
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
            @if(isset($result))
                <div style="color: red;text-align:center;">
                    {{$result}}
                </div>
            @endif
            @if(session('SuccessMessage'))
                <div style="color: forestgreen;text-align:center;">
                    {{session('SuccessMessage')}}
                </div>
            @endif
            @if(session('ErrorMessage'))
                <div style="color: red;text-align:center;">
                    {{session('ErrorMessage')}}
                </div>
            @endif

            <div class="form" id="form">
                <!--begin::Title-->
                <div class="text-center pb-8">
                    <h2 class="font-weight-bolder font-size-h2 font-size-h1-lg">Sign In</h2>
                    <span class="font-weight-bold font-size-h4">Or <a href="{{url('/register')}}"
                                                                      class="text-primary font-weight-bolder"
                                                                      id="Sb_login_signup">Create An Account</a></span>
                    <input id="custId" type="hidden" data-toggle="modal" data-target="#signupModal">
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
                                   name="emailOrUsername" id="emailOrUsername" autocomplete="off"
                                   placeholder="Email Or User Name"/>
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
                            <a href=""
                               class="text-primary font-size-h6 font-weight-bolder text-hover-primary pt-5"
                               data-toggle="modal" data-target="#forgotPasswordModel">
                                Forgot Password ?
                            </a>

                        </div>
                        <div class="d-flex justify-content-end mt-5">
                            <a href="" class="text-primary font-size-h6 font-weight-bolder text-hover-primary"
                               data-toggle="modal" data-target="#emailActivationModalLabel">
                                Get Activation Link
                            </a>
                        </div>
                    </div>
                    <div class="text-center pt-2">
                        <button type="submit" id="login_button"
                                class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3">Sign In
                        </button>
                    </div>
                </form>
            </div>
            <!--end::Form-->
            <!--begin: Aside footer for desktop-->
            <div class="text-center login-social-btns">
                <!-- Email login button -->
                <div>
                    <!-- begin:Email modal -->
                    <div class="modal fade" id="emailActivationModalLabel" tabindex="-1" role="dialog"
                         aria-labelledby="emailActivationModalLabel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered modal" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="emailModalLabel">Email of Account which need to
                                        verify</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <i aria-hidden="true" class="ki ki-close"></i>
                                    </button>
                                </div>
                                <form id="activationForm">
                                    @csrf
                                    <div class="modal-body">
                                        <!--begin::Form group-->
                                        <div class="form-group">
                                            <div class="input-icon">
                                                <label for="emailLoginId" style="display: none"></label>
                                                <input
                                                        class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6"
                                                        type="text" name="email" id="emailId"
                                                        autocomplete="off"
                                                        placeholder="Email"/>
                                                <span><i class="far fa-envelope"></i></span>
                                                <div class="error text-danger" id="emailError1"></div>
                                            </div>
                                        </div>
                                        If you use <b>Sign in with Email</b> option or <b>Update Password</b> that time
                                        also your email verification will be done automatically.
                                        <!--end::Form group-->
                                    </div>
                                    <div class="modal-footer" style="padding: 8px 21px 20px 21px">
                                        <button type="submit" id="activation" class="btn font-weight-bolder ">Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <!-- end:email modal -->
                    <!-- begin:Forgot password modal -->
                    <div class="modal fade" id="forgotPasswordModel" tabindex="-1" role="dialog"
                         aria-labelledby="forgotPasswordModel" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered modal" role="document">
                            <div class="modal-content">
                                <div class="modal-header">
                                    <h5 class="modal-title" id="emailModalLabel">Enter your email to reset your
                                        password</h5>
                                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                        <i aria-hidden="true" class="ki ki-close"></i>
                                    </button>
                                </div>
                                <form id="forgot_form">
                                    @csrf
                                    <div class="modal-body">
                                        <!--begin::Form group-->
                                        <div class="form-group">
                                            <div class="input-icon">
                                                <label for="emailLoginId" style="display: none"></label>
                                                <input
                                                        class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6"
                                                        type="text" name="emailId" id="emailId"
                                                        autocomplete="off"
                                                        placeholder="Email"/>
                                                <span><i class="far fa-envelope"></i></span>
                                                <div class="error text-danger" id="emailError1"></div>
                                            </div>
                                        </div>
                                        <!--end::Form group-->
                                    </div>
                                    <div class="modal-footer" style="padding: 8px 21px 20px 21px">
                                        <button type="submit" id="forgot_button" class="btn font-weight-bolder ">Submit
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <!-- end:forgot password modal -->
                    <!-- begin:Activation Email modal -->
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
                    <!-- end:Activation Email modal -->
                </div>
                <!-- end:Email login button -->
                <!-- Facebook login button -->
                <div>
                    <button type="button" class="btn bg-facebook font-weight-bolder mt-5 font-size-h6"
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
                    <button type="button" class="btn bg-google font-weight-bolder  mt-5 font-size-h6"
                            onclick="location.href='/social/Google'">
                                    <span class="svg-icon svg-icon-md">
                                        <i class="fab fa-google"></i>
                                    </span>
                        Sign in with Google
                    </button>
                </div>
                <!-- end:Google background-color: #eee;login button -->
                <!-- Twitter login button -->
                <div>
                    <button type="button" class="btn bg-twitter font-weight-bolder  mt-5 font-size-h6"
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
                    <button type="button" class="btn bg-github font-weight-bolder  mt-5 font-size-h6"
                            onclick="location.href='/social/GitHub'">
                                    <span class="svg-icon svg-icon-md">
                                        <i class="fab fa-github"></i>
                                    </span>
                        Sign in with Github
                    </button>
                </div>
                <button type="button" class="btn font-weight-bolder  mt-5 font-size-h6"
                        data-toggle="modal" data-target="#emailSignInModal">
                                    <span class="svg-icon svg-icon-md">
                                        <i class="far fa-envelope"></i>
                                    </span>
                    Sign in with Email
                </button>

                <!-- end:Git-hub login button -->
            </div>
            <!--end: Aside footer for desktop-->
        </div>
    </div>
    <!--end::Signin-->


    <!--begin: OTP modal-->
    <div class="modal fade" data-backdrop="static" data-keyboard="false" id="signupModal" tabindex="-1" role="dialog"
         aria-labelledby="signupModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-md" role="document">
            <div class="modal-content">
                <div class="modal-header d-block text-center">
                    <h5 class="modal-title" id="signupModalLabel">Sign up with your Phone number</h5>
                </div>
                <div class="modal-body">

                    <!--begin::phone number input-->
                    <div class="form-group">
                        <div class="input-group input-group-lg">
                            <input id="phoneOtp" type="tel"
                                   class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6"
                                   placeholder="Phone Number" value=""/>
                        </div>
                        <span id="valid-otp-msg" class="hide"></span>
                        <span id="error-otp-msg" class="hide"></span>
                    </div>
                    <!--end::phone number input-->
                    <div class="d-flex justify-content-center">
                        <button type="button" class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3"
                                onclick="sendOTP()">Send OTP
                        </button>
                    </div>
                    <div class="otp-modal  d-block text-center mt-5">
                        <h5 class="modal-title" id="signupModalLabel">Verify Yourself</h5>
                        <div class="mt-3">
                            <span>A text with a 6 digit code has been sent to your mobile number</span>
                        </div>
                        <div class="form-group">
                            <div class="input-icon mt-5 text-left font-size-h4">
                                <!-- <label for="otp">OTP</label> -->
                                <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6"
                                       type="text" id="otpNumber"
                                       placeholder="OTP" name="otp" autocomplete="off"/>
                            </div>
                            <div class="d-flex justify-content-center my-5" onclick="verifyTheMobileNumber()">
                                <button type="button" class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3">
                                    Continue
                                </button>
                            </div>
                            <div class="mb-4"><span class="text-sm inline mr-1">Trouble recieving the OTP?</span><a
                                        class="inline cursor-pointer edit-number" onclick="sendOTP()">RE-SEND OTP</a>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>

    @if(session('NocontactNumber'))
        <script>
            var value = true;
        </script>
    @else
        <script>
            var value = false;
        </script>
    @endif
    <!--end: OTP modal-->
@endsection
@section('script')
    <script src="{{asset('../js/IncJsFiles/login.js')}}"></script>
    <script src="{{asset('/plugins/custom/intl-tel-input/build/js/intlTelInput2.js')}}"></script>
    <script>
        sessionStorage.clear();//destroying session.
        /**
         * TODO We have to switch theme to white theme by default.
         * This function is switch theme to white theme by default.
         * ! Do not change this function without checking script code of changing theme.
         */
        function changeThemeWhiteDefault() {
            if (getCookie('themeNow') === 'light' || getCookie('themeNow') === undefined) {
                document.documentElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }

        }

        function getCookie(cname) {
            let name = cname + "=";
            let decodedCookie = decodeURIComponent(document.cookie);
            let ca = decodedCookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }

        $(document).ready(function () {//calling function on onload of the page to determine the theme change
            if (value === true) {
                $('#custId').trigger('click');
            }
            changeThemeWhiteDefault();
        });
        localStorage.setItem('isLoggedIn', '0');

        <!--begin::otp phone number js-->

        var otpInput = document.querySelector("#phoneOtp"),
            otpErrorMsg = document.querySelector("#error-otp-msg"),
            otpValidMsg = document.querySelector("#valid-otp-msg");

        // here, the index maps to the error code returned from getValidationError - see readme
        var errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];

        // initialise plugin
        var itiOtp = window.intlTelInput(otpInput, {
            utilsScript: "../../build/js/utils.js?1613236686837"
        });

        var resetOtp = function () {
            otpInput.classList.remove("error");
            otpErrorMsg.innerHTML = "";
            otpErrorMsg.classList.add("hide");
            otpValidMsg.classList.add("hide");
        };

        // on blur: validate
        otpInput.addEventListener('blur', function () {
            resetOtp();
            if (otpInput.value.trim()) {
                if (itiOtp.isValidNumber()) {
                    otpValidMsg.classList.remove("hide");
                } else {
                    otpInput.classList.add("error");
                    var errorCode = itiOtp.getValidationError();
                    otpErrorMsg.innerHTML = errorMap[errorCode];
                    otpErrorMsg.classList.remove("hide");
                }
            }
        });
        // on keyup / change flag: reset
        otpInput.addEventListener('change', reset);
        otpInput.addEventListener('keyup', reset);

        <!--end::otp phone number js-->


        function sendOTP() {
            let countrycoder = $('.iti__selected-flag').attr('title');
            let phoneno = $('#phoneOtp').val();
            $('#error-otp-msg').remove();
            let code = countrycoder.match(/\d+/)[0]
            if (phoneno === '') {
                toastr.error('Please Enter the mobile number first');
            } else {
                $.ajax({
                    url: 'send-mobile-otp',
                    data: {phoneno, code},
                    type: 'get',
                    dataType: 'json',
                    success: function (response) {
                        if (response.code === 200) {
                            toastr.success('Have sent OTP to mobile number successfully,please check');
                        } else if (response.code === 400) {
                            toastr.error("Can not send OTP.", response.error);

                        } else {
                            toastr.error('Some error occured, Can not send the OTP');

                        }
                    }
                });
            }
        }

        function verifyTheMobileNumber() {
            let countrycoder = $('.iti__selected-flag').attr('title');
            let countryName = countrycoder.replace(/[^A-Za-z]+/g, '');
            let phoneno = $('#phoneOtp').val();
            $('#error-otp-msg').remove();
            let mob = /^[1-9]{1}[0-9]{9}$/;
            let code = countrycoder.match(/\d+/)[0];
            let otp = $('#otpNumber').val();
            if (mob.test(phoneno) === false) {
                toastr.error("Please enter valid mobile number.");
                phoneno.focus();
                return false;
            } else if (phoneno === '') {
                toastr.error('Please Enter the mobile number first');
            } else if (otp === '') {
                toastr.error('Please Enter OTP from mobile');
            } else {
                $.ajax({
                    url: 'verify-mobile-otp',
                    type: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    data: {phoneno, code, otp},
                    dataType: 'json',
                    success: function (response) {
                        if (response.code === 200) {
                            if (response.data.status === 'approved') {
                                $.ajax({
                                    url: "/update-session",
                                    type: 'post',
                                    data: {
                                        phoneno, code, countryName
                                    },
                                    headers: {
                                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                                    },
                                    dataType: 'json',
                                    beforeSend: function () {
                                    },
                                    success: function (response) {
                                        if (response.code === 200) {
                                            toastr.success("Verified!", "", {
                                                timeOut: 2000,
                                                fadeOut: 3000,
                                                onHidden: function () {
                                                    document.location.href = '{{env('APP_URL')}}dashboard';
                                                }
                                            });
                                        } else if (response['code'] === 400) {
                                            if (response.error === 'Error: The requested resource /Services/VAb998f968120dfd40106eb6ca4bcd39a4/VerificationCheck was not found') {
                                                toastr.error('You have entered wrong or Expired OTP', 'Login failed!!');
                                            } else {
                                                toastr.error(response.error, 'Login failed!!');
                                            }
                                        } else if (response.code === 401) {
                                            toastr.error(response.error);
                                        } else {
                                            toastr.error('Some error ,occured please reload the page');
                                        }
                                    },
                                });
                            } else {
                                toastr.error('You have entered wrong OTP, please try again');
                            }
                        } else if (response.code === 400) {
                            toastr.error(response.error);
                        } else {
                            toastr.error('Some error occured, Can not verify the OTP');
                        }
                    }
                });
            }
        }


    </script>
@endsection

