@extends('user::Layouts._master')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | SignUp</title>
@endsection
@section('main-content')
    <!--begin::Signup-->
    <div class="login-form pt-2">
        <!--begin::Form-->

        <!--begin::Title-->
        <div class="text-center pb-8">
            <h2 class="font-weight-bolder font-size-h2 font-size-h1-lg">Sign Up</h2>
            <p class="text-muted font-weight-bold font-size-h4">Enter Your Details To Create Your Account</p>
        </div>
        <!--end::Title-->
        <form id="sign_up_form">
        @csrf
        <!--begin::Form group-->
            <div class="form-group">
                <div class="input-icon">
                    <label for="firstName" style="display: none"></label>
                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="text"
                           value="{{ old('firstName') }}" placeholder="First Name" name="firstName" id="firstName"
                           autocomplete="off"/>
                    <span><i class="far fa-user"></i></span>
                </div>
                <div id="firstNameError" style="font-size: medium"></div>
                <span id="validFirstName" style="color: red;font-size: medium;"
                      role="alert">
                      <strong>{{ $errors->first('firstName') }}</strong>
                </span>
            </div>
            <!--end::Form group-->

            <div class="form-group">
                <div class="input-icon">
                    <label for="lastName" style="display: none"></label>
                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="text"
                           value="{{ old('lastName') }}" placeholder="Last Name" name="lastName" id="lastName"
                           autocomplete="off"/>
                    <span><i class="far fa-user"></i></span>
                </div>
                <div id="lastNameError" style="font-size: medium"></div>
                <span id="validLastName" style="color: red;font-size: medium" role="alert">
                      <strong>{{ $errors->first('lastName') }}</strong>
                </span>
            </div>

            <!--begin::Form group-->
            <div class="form-group">
                <div class="input-icon">
                    <label for="userName" style="display: none"></label>
                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="text"
                           placeholder="Username" name="userName" id="userName" value="{!! old('userName') !!}"
                           autocomplete="off"/>
                    <span><i class="far fa-user"></i></span>
                </div>
                <div id="userNameError" style="font-size: medium"></div>
                <span id="validUsername" style="color: red;font-size: medium" role="alert">
                      <strong>{{ $errors->first('userName') }}</strong>
                </span>
            </div>
            <!--end::Form group-->

            <!--begin::Form group-->
            <div class="form-group">
                <div class="input-icon">
                    <label for="email" style="display: none"></label>
                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="text"
                           id="email" value="{{old('email')}}" placeholder="Email" name="email" autocomplete="off"/>
                    <span><i class="far fa-envelope-open"></i></span>
                </div>
                <div id="emailError" style="font-size: medium"></div>
                <span id="validEmail" style="color: red;font-size: medium" role="alert">
                      <strong>{{ $errors->first('email') }}</strong>
                </span>
            </div>
            <!--end::Form group-->

            <!--begin::phone number input-->
            <div class="form-group">
                <div class="input-group input-group-lg">

                    <input id="phone" type="tel" name="phone" class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" placeholder="Phone Number"
                           value="" />
                </div>
                <span id="valid-msg" class="hide"></span>
                <span id='phoneError' style="font-size: medium"></span>
                <span id="error-msg" style="font-size: 0.9rem; color: rgb(246, 78, 96); margin-top: 0.25rem; width: 100%;"></span>
            </div>
            <!--end::phone number input-->

{{--            <div class="form-group d-flex align-items-center ">--}}
{{--                <button type="button" id="Sb_login_signup_cancel"--}}
{{--                        class="btn font-weight-bolder font-size-h6 px-8 otp-button" onclick="sendOTP()">Send OTP</button>--}}
{{--                <div class="input-icon ml-3">--}}
{{--                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="text"--}}
{{--                           name="otp" id="otp"  placeholder="Enter OTP"/>--}}
{{--                </div>--}}
{{--            </div>--}}
{{--            <span id='otpError' style="font-size: medium"></span>--}}


            <!--begin::Form group-->
            <div class="form-group">
                <div class="input-icon input-icon-right" id="new_password">
                    <label for="password" style="display: none"></label>
                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="password"
                           placeholder="Password" name="password" id="password" value="{{old('password')}}"/>
                    <span><a href="#"><i class="fas fa-eye-slash toggle-password"></i></a></span>

                </div>
                <span id='passwordError' style="font-size: medium"></span>
                <span id="validPassword" style="color: red;font-size: medium" role="alert">
                </span>
            </div>
            <!--end::Form group-->

            <!--begin::Form group-->
            <div class="form-group">
                <div class="input-icon input-icon-right" id="confirm_password">
                    <label for="passwordConfirmation" style="display: none"></label>
                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="password"
                           placeholder="Confirm Password" name="passwordConfirmation" id="passwordConfirmation"
                           value="{{ old('passwordConfirmation') }}"/>
                    <span><a href="javascript:;"><i class="fas fa-eye-slash toggle-password"></i></a></span>
                </div>
                <div id="passwordConfirmationError" style="font-size: medium"></div>
                <span id="validConfirmPassword" style="color: red;font-size: medium" role="alert">
                      <strong>{{ $errors->first('passwordConfirmation') }}</strong>
                </span>
            </div>
            <!--end::Form group-->

            <!--begin::Form group-->
            <div class="form-group">
                <label class="checkbox mb-0">
                    <input type="checkbox" checked name="agree" id="agree"/>
                    <span class="mr-2"></span>
                    I Agree to The &nbsp;<a href="https://socioboard.com/privacy-policy/" target="_blank" class="text-primary"> Terms and Conditions</a>.
                </label>
                <div id="agreeError" style="font-size: medium"></div>
            </div>
            <!--end::Form group-->

            <!--begin::Form group-->
            <div class="form-group d-flex flex-wrap flex-center">
                <button type="submit" id="submit" class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 mx-4">
                    Submit
                </button>
                <button type="reset" id="Sb_login_signup_cancel"
                        class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 mx-4">Cancel
                </button>
            </div>
            <!--end::Form group-->
        </form>
        <!--end::Form-->
    </div>

    <!--begin: Aside footer for desktop-->
{{--    <div class="text-center">--}}
{{--        <!-- Facebook login button -->--}}
{{--        <div>--}}
{{--            <button type="button" class="btn bg-facebook font-weight-bolder pl-20 pr-20 mt-5 font-size-h6"--}}
{{--                    onclick="location.href='/social/Facebook'">--}}


{{--                                    <span class="svg-icon svg-icon-md">--}}
{{--                                        <i class="fab fa-facebook"></i>--}}
{{--                                    </span>--}}
{{--                Sign in with Facebook--}}
{{--            </button>--}}
{{--        </div>--}}
{{--        <!-- end:Facebook login button -->--}}
{{--        <!-- Google login button -->--}}
{{--        <div>--}}
{{--            <button type="button" class="btn bg-google font-weight-bolder pl-20 pr-20 mt-5 font-size-h6"  onclick="location.href='/social/Google'">--}}
{{--                                    <span class="svg-icon svg-icon-md">--}}
{{--                                        <i class="fab fa-google"></i>--}}
{{--                                    </span>--}}
{{--                Sign in with Google--}}
{{--            </button>--}}
{{--        </div>--}}
{{--        <!-- end:Google login button -->--}}

{{--        <!-- Twitter login button -->--}}
{{--        <div>--}}
{{--            <button type="button" class="btn bg-twitter font-weight-bolder pl-20 pr-20 mt-5 font-size-h6"--}}
{{--                    onclick="location.href='/social/Twitter'">--}}


{{--                                    <span class="svg-icon svg-icon-md">--}}
{{--                                        <i class="fab fa-twitter"></i>--}}
{{--                                    </span>--}}
{{--                Sign in with Twitter--}}
{{--            </button>--}}
{{--        </div>--}}
{{--        <!-- end:Twitter login button -->--}}
{{--        <!-- Git-hub login button -->--}}
{{--        <div>--}}
{{--            <button type="button" class="btn bg-github font-weight-bolder pl-20 pr-20 mt-5 font-size-h6" onclick="location.href='/social/GitHub'">--}}
{{--                                    <span class="svg-icon svg-icon-md">--}}
{{--                                        <i class="fab fa-github" ></i>--}}


{{--                                    </span>--}}
{{--                Sign in with Github--}}
{{--            </button>--}}
{{--        </div>--}}
{{--        <!-- end:Git-hub login button -->--}}
{{--    </div>--}}
    <!--end: Aside footer for desktop-->

    <!--end::SignUp-->

@endsection
@section('footer-content')
    <!-- begin:SignIn -->
    <div class="text-center pt-2">
        <span class="font-weight-bold font-size-h4">Already have an account? <a href="{{url('/login')}}"
                                                                                class="text-primary font-weight-bolder"
                                                                                id="">Sign In</a></span>
    </div>
    <!-- end:SignIn -->
@endsection

@section('script')
    <script src="{{ asset('../js/IncJsFiles/sign_up.js') }}"></script>
    <script src="{{asset('/plugins/custom/intl-tel-input/build/js/intlTelInput.js')}}"></script>

    <script>
        let PHONE_CODE = $("#phone").val() != "nil"? $("#phone").val(): "in";
        let input = document.querySelector("#phone"),
            errorMsg = document.querySelector("#error-msg"),
            validMsg = document.querySelector("#valid-msg");

        // here, the index maps to the error code returned from getValidationError - see readme
        let errorMap = ["❌ Invalid number", "❌ Invalid country code", "❌ Too short", "❌ Too long", "❌ Invalid number"];

        // initialize plugin
        let iti = window.intlTelInput(input, {
            utilsScript: "../plugins/custom/intl-tel-input/build/js/utils.js?1613236686837",
            initialCountry: PHONE_CODE,
        });

        let reset = function () {
            input.classList.remove("error");
            errorMsg.innerHTML = "";
            errorMsg.classList.add("hide");
            validMsg.classList.add("hide");
        };

        // on blur: validate
        input.addEventListener('blur', function () {
            reset();
            if (input.value.trim()) {
                if (iti.isValidNumber()) {
                    validMsg.classList.remove("hide");
                } else {
                    input.classList.add("error");
                    let errorCode = iti.getValidationError();
                    errorMsg.innerHTML = errorMap[errorCode];
                    errorMsg.classList.remove("hide");
                }
            }
        });

        // on keyup / change flag: reset
        input.addEventListener('change', reset);
        input.addEventListener('keyup', reset);

        function sendOTP()
        {
            let countrycoder = $('.iti__selected-flag').attr('title');
            let phoneno = $('#phone').val();
            let code = countrycoder.match(/\d+/)[0];
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
                            toastr.error("Can not send OTP.",response.error);
                        } else {
                            toastr.error('Some error occured, Can not send the OTP');

                        }
                    }
                });
            }
        }
    </script>
@endsection

