
<!DOCTYPE html>
<html lang="en" >
<!--begin::Head-->
<head>
    <base href="">
    <meta charset="utf-8"/>
    <title>SocioBoard | AppSumo</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>

    <meta name="google-site-verification" content="" />
    <meta name="description" content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it." />
    <meta name="keywords" content="Social Media Management Software, Social Media Management tool, Open Source Social Media Management, Social Media Management" />
    <meta name="author" content="Socioboard Technologies">
    <meta name="designer" content="Chanchal Santra">

    <!--begin::Fonts-->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700"/>
    <!--end::Fonts-->

    <!--begin::Global Theme Styles(used by all pages)-->
    <link href="/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css"/>
    <link href="/plugins/custom/prismjs/prismjs.bundle.css" rel="stylesheet" type="text/css"/>

    <link href="/plugins/custom/intl-tel-input/build/css/intlTelInput.min.css" rel="stylesheet" type="text/css" />

    <link href="/css/style.css" rel="stylesheet" type="text/css"/>
    <link href="/css/dark.css" rel="stylesheet" type="text/css"/>
    <!--end::Global Theme Styles-->

    <!--begin::Layout Themes(used by all pages)-->
    <!--end::Layout Themes-->

    <link rel="shortcut icon" href="assets/media/logos/favicon.ico"/>

</head>
<!--end::Head-->

<!--begin::Body-->
<body  id="Sb_body"  class="header-fixed header-mobile-fixed subheader-enabled page-loading"  >

<!--begin::Main-->
<div class="d-flex flex-column flex-root">
    <!--begin::Login-->
    <div class="login login-2 login-signin-on d-flex flex-column flex-lg-row flex-column-fluid" id="Sb_login">
        <!--begin::Aside-->
        <div class="login-aside order-2 order-lg-1 d-flex flex-row-auto position-relative overflow-hidden mt-0" style="background-color: lightgrey">
            <!--begin: Aside Container-->
            <div class="d-flex flex-column-fluid flex-column justify-content-between pb-9 px-7 py-lg-13 px-lg-35">

                <!--begin::Aside body-->
                <div class="d-flex flex-column-fluid flex-column flex-center">
                    <!--begin::Signin-->
                    <div class="login-form py-11">
                        <!--begin::Form-->
                        <div class="text-center pb-4 appsumo-signup">
                            <img src="/media/logos/Socioboard-logo.svg" class="SB-log mr-3">
                            <span>with</span>
                            <img src="/media/logos/appsumo-logo-vector.png" alt="logo" class="img-responsive ml-3">

                        </div>
                        <div class="text-center">
                            <h3 class="my-5 font-weight-bolder appsumo-title">Welcome Sumo-ling!</h3>
                            <p class="text-muted font-weight-bold font-size-h4">Enter Your Details To Create Your Account</p>
                        </div>
                        <form id="appsumo_form">
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
                                <span id="validLastName" style="color: red;font-size: medium" role="alert">
                                      <strong>{{ $errors->first('lastName') }}</strong>
                                </span>
                            </div>

                            <!--begin::Form group-->
                            <div class="form-group">
                                <div class="input-icon">
                                    <label for="userName" style="display: none"></label>
                                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="text"
                                           placeholder="Username" name="userName" id="userName" value="{!! old('userName') !!}"/>
                                    <span><i class="far fa-user"></i></span>
                                </div>
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
                                           id="email_to_show" value="{{$email}}" placeholder="Email" name="email" disabled />
                                    <span><i class="far fa-envelope-open"></i></span>
                                    <input type="hidden" name="email" value="{{$email}}">
                                </div>
                                <span id="validEmail" style="color: red;font-size: medium" role="alert">
                                      <strong>{{ $errors->first('email') }}</strong>
                                </span>
                            </div>
                            <!--end::Form group-->

                            <!--begin::Form group-->
                            <div class="form-group">
                                <div class="input-icon input-icon-right" id="new_password">
                                    <label for="password" style="display: none"></label>
                                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="password"
                                           placeholder="Password" name="password" id="password" value="{{old('password')}}"/>
                                    <span><a href="#"><i class="fas fa-eye-slash toggle-password"></i></a></span>

                                </div>
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
                                    I Agree to The &nbsp;<a href="#" class="text-primary"> Terms and Conditions</a>.
                                </label>
                                <div id="agreeError" style="font-size: medium"></div>
                            </div>
                            <!--end::Form group-->

                            <!--begin::Form group-->
                            <div class="form-group d-flex flex-wrap flex-center">
                                <button type="submit" id="submit" class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 mx-4">
                                    Submit
                                </button>
                            </div>
                            <!--end::Form group-->
                        </form>
                        <div class="text-center pt-2">
        <span class="font-weight-bold font-size-h4">Already have an account? <a href="{{url('/login')}}"
                                                                                class="text-primary font-weight-bolder"
                                                                                id="">Sign In</a></span>
                        </div>
                    </div>


                    <!--end::Signin-->

                </div>
                <!--end::Aside body-->


            </div>
            <!--end: Aside Container-->
        </div>
        <!--begin::Aside-->

        <!--begin::Content-->
        <div class="content order-1 order-lg-2 d-flex flex-column w-100 pt-10 pb-0" style="background-color: #fff;">
            <!--begin::Title-->
            <div class="d-flex flex-column justify-content-center text-center mx-8 pt-md-5 pt-sm-5 px-lg-0 pt-2 px-7">
                <h3 class="display4 font-weight-bolder my-7 text-dark" style="color: #986923;">Hi, Sumo-ling ..!</h3>
            </div>
            <!--end::Title-->
            <div class="text-center appsumo-banner mt-3">
                <img src="/media/AppSumoBanner.jpg" alt="banner" class="appsumo">
            </div>

        </div>
        <!--end::Content-->
    </div>
    <!--end::Login-->
</div>
<!--end::Main-->



<!--begin::Global Theme Bundle(used by all pages)-->
<script src="/plugins/global/plugins.bundle.js"></script>
<script src="/plugins/custom/prismjs/prismjs.bundle.js"></script>
<script src="/js/main.js"></script>
<script src="/js/custom.js"></script>

<script src="/plugins/custom/intl-tel-input/build/js/intlTelInput.js"></script>
<script src="{{ asset('../js/IncJsFiles/sign_up.js') }}"></script>
<script src="{{asset('/plugins/custom/intl-tel-input/build/js/intlTelInput.js')}}"></script>
<!--end::Global Theme Bundle-->


<!--begin::otp phone number js-->
<script>

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

    // on keyup / change flag: resetOtp
    otpInput.addEventListener('change', resetOtp);
    otpInput.addEventListener('keyup', resetOtp);

</script>
<!--end::otp phone number js-->

<!-- begin:password show toggle -->
<script>
    $(document).ready(function() {
        $("#password_toggle a").on('click', function(event) {
            event.preventDefault();
            if($('#password_toggle input').attr("type") == "text"){
                $('#password_toggle input').attr('type', 'password');
                $('#password_toggle i').addClass( "fa-eye-slash" );
                $('#password_toggle i').removeClass( "fa-eye" );
            }else if($('#password_toggle input').attr("type") == "password"){
                $('#password_toggle input').attr('type', 'text');
                $('#password_toggle i').removeClass( "fa-eye-slash" );
                $('#password_toggle i').addClass( "fa-eye" );
            }
        });
    });


</script>
<!-- end:password show toggle -->


</body>
<!--end::Body-->
</html>