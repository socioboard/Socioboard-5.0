@extends('User::master')

@section('title')
    <title>SocioBoard | Signup</title>
    <script>

        (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
        })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

        ga('create', '{{env('GA_TRACK_ID')}}', 'auto', 'signup');
        ga('signup.send', 'pageview');
        ga('signup.send', 'event', {
            'eventCategory': 'Open',
            'eventAction': 'Signup'
        });
    </script>
    <!-- End Google Analytics -->
    @endsection

@section('signup')
        <section class="container">
            <div class="row justify-content-md-center margin-bottom-50 margin-top-50">
                <div class="col col-md-6">
                    <div class="card shadow mb-5">
                        <div class="card-body" style="padding: 40px;">

                            <h3 class="text-center" style="color: #282828; font-weight: bold;">Create an account</h3>

                            @if (session('status'))
                                <div style="color: green">
                                   {{ session('status') }}
                                </div>
                            @endif
                            @if (session('error'))
                                <div style="color: red">
                                    {{ session('error') }}
                                </div>
                            @endif
                            @if (session('invalidSocial'))
                                <div style="color: red">
                                    {{ session('invalidSocial') }}
                                </div>
                            @endif
                            <form class="margin-top-30 needs-validation"  id="signup-form" ac novalidate >
                                <div class="error" id="error" style="color: red;"></div>
                                <div class="form-group">
                                    <label for="first_name">Enter your name<span class="text-orange-dark">*</span></label>
                                    <input type="text" class="form-control" id="first_name" placeholder="Name" required
                                           name="first_name">
                                    <div class="error" id="fname" style="color: red;"></div>
                                    {{--<div class="invalid-feedback">--}}
                                        {{--{{ $errors->first('username') }}--}}
                                    {{--</div>--}}
                                    <div class="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="id_user_name">Enter UserName<span class="text-orange-dark">*</span></label>
                                    <input type="text" class="form-control" id="id_user_name" placeholder="UserName" required
                                           name="username">
                                    <div class="error" id="usrname" style="color: red;">{{ $errors->first('username') }}</div>
                                    {{--<div class="invalid-feedback">--}}
                                    {{--{{ $errors->first('username') }}--}}
                                    {{--</div>--}}
                                    <div class="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>

{{--                                {{for country code}}--}}
                                <div class="form-group">
                                    <label for="cnt_code" >Enter Mobile number</label>
                                    <input type="tel" class="form-control" id="cnt_code" name="phone" >
                                    <span id="valid-msg" class="hide">✓ Valid</span>
                                    <span id="error-msg" class="hide"></span>
                                </div>
                                    <div class="valid-feedback">
                                        Looks good!
                                    </div>
                                <div class="form-group">
                                    <label for="email_id">Your e-mail adress<span class="text-orange-dark">*</span></label>
                                    <input name="email_id" type="email" class="form-control" id="email_id" placeholder="Email"
                                           required >
                                    <div class="error" id="email" style="color: red;">{{ $errors->first('email_id') }}</div>
                                    <div class="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="passwd">Enter password<span class="text-orange-dark">*</span></label>
                                    <input type="password" class="form-control" id="passwd" placeholder="Password"
                                           required name="passwd">
                                    <p style="color: #123c24" >Your password must atleast consist of 1 alphabet 1 nummeric character and 1 special character </p>
                                    <div class="error" id="passwrd" style="color: red;">{{ $errors->first('passwd') }}</div>
                                    <div class="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="c_passwd">Confirm password<span class="text-orange-dark">*</span></label>
                                    <input type="password" class="form-control" id="c_passwd" placeholder="Confirm Password"
                                           required name="c_passwd">
                                    <div class="error" id="c_passwrd" style="color: red;">{{ $errors->first('c_passwd') }}</div>
                                    <div class="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                                {{--<div class="form-group" >--}}
                                    {{--<label>Choose your plan</label>--}}
                                    {{--<select class="form-control" required name="plan">--}}
                                        {{--<optgroup label="Basic Plans">--}}
                                            {{--<option value="0" selected="selected">Basic(Free)</option>--}}
                                            {{--<option value="1">Standard</option>--}}
                                            {{--<option value="2">Premium</option>--}}
                                            {{--<option value="3">Deluxe</option>--}}
                                        {{--</optgroup>--}}
                                        {{--<optgroup label="Expert Plans">--}}
                                            {{--<option value="4" >Topaz</option>--}}
                                            {{--<option value="5">Ruby</option>--}}
                                            {{--<option value="6">Gold</option>--}}
                                            {{--<option value="7">Platinum</option>--}}
                                        {{--</optgroup>--}}
                                    {{--</select>--}}
                                {{--</div>--}}
                                {{--<div class="form-group">--}}
                                    {{--<label>Choose your payment method</label>--}}
                                    {{--<select class="form-control" required name="payment">--}}
                                        {{--<option value="0" selected="selected">paypal</option>--}}
                                        {{--<option value="1">payumoney</option>--}}
                                    {{--</select>--}}
                                {{--</div>--}}
                                <div class="row">
                                    <div class="col col-12 margin-top-10">
                                        <button class="btn bg-orange-dark col-12" id="signup" type="submit">Create an
                                            account now</button>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-12 text-center text-gray-light">or</div>
                                    <div class="col-md-6">
                                       <a href='{{env('APP_URL')}}social/facebook' class="btn btn-fb col-12">Sign up with Facebook</a>
                                    </div>
                                    <div class="col-md-6">
                                        <a href='{{env('APP_URL')}}social/google' class="btn btn-google col-12">Sign up with Google</a>
                                    </div>
                                </div>
                                <div class="margin-top-30">
                                    <p class="text-gray-light">Already a member? <a href="/login" class="text-gray-light"><u>Login</u></a></p>
                                    <hr>
                                    <p class="text-center text-gray-light"><i class="fas fa-lock text-orange-light"></i>
                                        All your data is protected
                                        <br>
                                        By submitting the form, you accept the
                                        <a href="" class="text-gray-light"><u>Terms Of Use</u></a>
                                        and <a href="" class="text-gray-light"><u>Privacy Policy</u></a>
                                    </p>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    @endsection

@section('script')
    <script src="/assets/plugins/intel-tel-input/intlTelInput.js"></script>
    <script>
        var input = document.querySelector("#cnt_code");
        // initialise plugin
        var iti = window.intlTelInput(input, {
            utilsScript: "assets/plugins/intel-tel-input/utils.js",
            initialCountry: "in",
            separateDialCode: true,
            customContainer: "col-md-12 no-padding intelinput-styles",
            utilsScript : "/assets/plugins/intel-tel-input/utils.js"
        });


            var errorMsg = document.querySelector("#error-msg"),
            validMsg = document.querySelector("#valid-msg");

        // here, the index maps to the error code returned from getValidationError - see readme
        var errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];




        var reset = function() {
            input.classList.remove("error");
            errorMsg.innerHTML = "";
            errorMsg.classList.add("hide");
            validMsg.classList.add("hide");
        };

        // on blur: validate
        input.addEventListener('blur', function() {
            reset();
            if (input.value.trim()) {
                if (iti.isValidNumber()) {
                    validMsg.classList.remove("hide");
                } else {
                    input.classList.add("error");
                    var errorCode = iti.getValidationError();
                    errorMsg.innerHTML = errorMap[errorCode];
                    errorMsg.classList.remove("hide");
                }
            }
        });

        // on keyup / change flag: reset
        input.addEventListener('change', reset);
        input.addEventListener('keyup', reset);
    </script>
    <script>
        $(document).ready(function(){

            $(document).on('submit','#signup-form',function(e){
                e.preventDefault();
                //get phn code
                var countryData = iti.getSelectedCountryData();
                var dialCode = countryData.dialCode;
                var form = document.getElementById('signup-form');
                var formData = new FormData(form);
                formData.append('dialcode',dialCode);
                $.ajax({
                    url: "/signup",
                    data: formData,
                    cache: false,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    beforeSend:function(){
//                        $('#mailFound').text("");
//                        $('#someError').text("");
//                        $('#mailNotFound').text("");
//                        $('#fp_email_id').val();
                    },
                    success: function (response) {
                        if(response['email_id'] !== undefined) document.getElementById('email').innerHTML = response['email_id'];
                        if(response['first_name'] !== undefined) document.getElementById('fname').innerHTML = response['first_name'];
                        if(response['username'] !== undefined) document.getElementById('usrname').innerHTML = response['username'];
                        if(response['passwd'] !== undefined) document.getElementById('passwrd').innerHTML = response['passwd'];
                        if(response['c_passwd'] !== undefined) document.getElementById('c_passwrd').innerHTML = response['c_passwd'];

                        if(response['code'] == 200){
                            document.getElementById("signup-form").reset();
                            if(response['message'])swal("Registered Successfully. Please check activation email");
                            setTimeout(function() {
                                window.location = '/login';
                            }, 2000);

                        } else if(response['code'] == 400){
                            swal(response['error']);
                        } else{
                            swal(response['error']);
                        }


                    },
                    error:function(error){
//                        document.getElementById("forgotPassword").reset();
//                        $('#fp_email_id').html();
//                        $('#someError').text(response.message);
//                        $('#passwdRecoveryModal').modal('toggle');
                    }
                })
            });
        });




    </script>
    @endsection
