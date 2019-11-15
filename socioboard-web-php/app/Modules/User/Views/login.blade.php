@extends('User::master')
<script type="text/javascript" src="https://code.jquery.com/jquery-1.7.1.min.js"></script>

@section('title')
    <title>SocioBoard | Signin</title>
    <script>

            (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
                        (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

            ga('create', '{{env('GA_TRACK_ID')}}', 'auto', {
                'name': 'login',
                'sessionControl': 'start',
                'alwaysSendReferrer': true
            });
            ga('login.send', 'pageview');
            ga('login.send', 'event', {
                'eventCategory': 'Open',
                'eventAction': 'Login'
            });
            ga(function(){

            });


    </script>
    <!-- End Google Analytics -->
@endsection

@section('login')
    <div class="modal fade" id="resetPasswordModal" tabindex="-1" role="dialog" aria-labelledby="resetPasswordModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content"><br/>
                <div class="error" style="color: red; text-align: center">{{session('restPwdMsgError')}}</div>
                <form id="resetPassword" action="/resetPassword" method="post">
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="reset_password">Reset Password</label>
                            <input type="email" class="form-control" id="reset_email_id" aria-describedby="resetemailHelp" required name="reset_email" readonly="readonly" value="{{session('resetPassword')}}"></br>
                            <input type="password" class="form-control" id="reset_password" aria-describedby="resetpasswordHelp" placeholder="Enter new password" required name="reset_password">
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </div>

                </form>
            </div>
        </div>
    </div>

    <section class="container">
        <div class="row justify-content-md-center margin-bottom-50 margin-top-50">
            <div class="col col-md-6">
                <div class="card shadow mb-5">
                    <div class="card-body" style="padding: 40px;">
                        <h3 class="text-center" style="color: #282828; font-weight: bold;">Login</h3>
                        <h6 id="mailFound" class="text-center" style="color: #0C7B42; font-weight: normal;"></h6>
                        <h6 id="someError" class="text-center" style="color: red; font-weight: normal;"></h6>
                        <h6 id="mailNotFound" class="text-center" style="color: red; font-weight: normal;"></h6>

                    @if(session('logout'))
                           <div style="color: green;text-align:center;">
                               {{session('logout')}}
                           </div>
                        @endif
                        @if (session('status'))
                            <div style="color: green">
                                {{ session('status') }}
                            </div>
                        @endif
                        @if (session('forgotPw'))
                            <div style="color: green">
                                {{ session('forgotPw') }}
                            </div>
                        @endif
                        @if(session('invalid'))
                            <div style="color: red;text-align:center;">
                                {{session('invalid')}}
                            </div>
                        @endif
                        @if(session('invalidSocial'))
                            <div style="color: red;text-align:center;">
                                {{session('invalidSocial')}}
                            </div>
                        @endif
                        @if(session('error'))
                            <div style="color: red;text-align:center;">
                                {{session('error')}}
                            </div>
                        @endif
                        @if(session('email_act'))
                            <div style="color: green;text-align:center;">
                                {{session('email_act')}}
                            </div>
                        @endif
                        @if(session('resetPassword'))
                                <script>
                                $(function() {
                                    $('#resetPasswordModal').modal('show');
                                });
                            </script>
                        @endif
                        @if(session('restPwdMsg'))
                            <div style="color: green;text-align: center;">{{session('restPwdMsg')}}</div>
                        @endif
                        @if(session('restPwdMsgError'))
                            <script>
                                $(function() {
                                    $('#resetPasswordModal').modal('show');
                                });
                            </script>
                        @endif
                        <form class="margin-top-30 needs-validation" id="login-form" novalidate action="login" method="POST">
                            <div class="form-group">
                                <label for="email_id">Your e-mail adress<span class="text-orange-dark">*</span></label>
                                <input type="email" class="form-control" id="email_id" placeholder="Email" required
                                       name="email">
                                <div class="error" style="color: red;">{{ $errors->first('email') }}</div>

                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="passwd">Your password<span class="text-orange-dark">*</span></label>
                                <input type="password" class="form-control" id="passwd" placeholder="Password"
                                       required name="passwd">
                                <div class="error" style="color: red;">{{ $errors->first('passwd') }}</div>
                                <div class="valid-feedback">
                                    Looks good!
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-6 col-sm-12">
                                    <div class="form-group custom-control custom-checkbox margin-top-10">
                                        <input type="checkbox" class="custom-control-input" id="Remember_check"
                                               value="" required>
                                        <label class="custom-control-label text-gray-light" for="Remember_check">Remember
                                            me</label>
                                        <div class="invalid-feedback">
                                            You must agree before submitting.
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6 col-sm-12">
                                    <button class="btn bg-orange-dark float-right col-12" type="submit">Login</button>
                                </div>
                            </div>
                            <div class="row">
                                <div class="col-md-12 text-center"><strong>OR</strong></div>
                                <div class="col-md-6">
                                    <a href="{{env('APP_URL')}}social/facebook">
                                        <img class="img-fluid" id="fb-Login" src="\assets\imgs\fb_btn.png"  alt="Submit" width="200" height="70">
                                    </a>

{{--                                    <a href='{{env('APP_URL')}}social/facebook' class="btn btn-fb col-12">Sign in with--}}
{{--                                        Facebook</a>--}}
                                </div>
                                <div class="col-md-6">
                                    <a href="{{env('APP_URL')}}social/google">
                                        <img class="img-fluid" id="google-Login" src="\assets\imgs\ggl_btn.png"  alt="Submit" width="200" height="70" >
                                    </a>
{{--                                    <a href='{{env('APP_URL')}}social/google' class="btn btn-google col-12">Sign in with Google</a>--}}
                                </div>
                            </div>
                            <div class="margin-top-30">
                                <p class="text-gray-light">Don't have an account? <a href="/signup" class="text-gray-light"><u>Create
                                            new</u></a></p>
                                <p class="text-gray-light"><a href="javascript:void();" class="text-gray-light"
                                                              data-toggle="modal" data-target="#passwdRecoveryModal"><u>I forgot my password</u></a></p>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Passwd Recovery Modal -->
    <div class="modal fade" id="passwdRecoveryModal" tabindex="-1" role="dialog" aria-labelledby="passwdRecoveryModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <form id="forgotPassword">
                    <div class="modal-body">
                        <div class="form-group">
                            <label for="email_id">Email address</label>
                            <input type="email" class="form-control" id="fp_email_id" aria-describedby="emailHelp"
                                   placeholder="Enter email" required name="fp_email">
                            <small id="emailHelp" class="form-text text-muted">We'll send you password recovery
                                link in your mailbox.</small>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary">Submit</button>
                    </div>

                </form>
            </div>
        </div>
    </div>

    <!-- Modal for mobile otp -->
    <div id="mob_otp" class="modal fade" role="dialog">
        <div class="modal-dialog">

            <!-- Modal content-->
            <form id="mob_otp_form" method="POST" action="mob-otp-login">
                <div class="modal-content" align="center">
                    <div class="modal-header">
                        <label class="custom-control-label" for="no_auth" style="color: #002752;text-align: center">Enter the otp sent to your mobile phone.</label>
                        <button type="button" class="close" data-dismiss="modal">&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <input type="hidden" id="mobile-otp-email" name="mobile_otp_email" >
                        </div>
                        <div class="form-group">
                            <input type="number" id="mobile-otp" name="mobile_otp">
                            <label class="custom-control-label" for="mobile_otp">Mobile OTP</label>
                        </div>
                    </div>
                    <hr>
                    <div>
                        <button class="btn bg-orange-dark float-right col-12">Submit</button>
                    </div>
                </div>
            </form>


        </div>
    </div>


    <!-- Modal for mobile & email otp -->
    <div id="email_otp" class="modal fade" role="dialog">
        <div class="modal-dialog">

            <!-- Modal content-->
            <form id="email_otp_form" method="POST" action="email-otp-login">
                <div class="modal-content" align="center">
                    <div class="modal-header">
                        <label class="form-group" for="no_auth" style="color: #002752;text-align: center">Enter the otp sent to your mobile phone and email.</label>
                        <button type="button" class="close" data-dismiss="modal" >&times;</button>
                    </div>
                    <div class="modal-body">
                        <div class="form-group">
                            <input type="hidden" id="mob-otp-email" name="mobile_otp_email" >
                        </div>
                        <div class="form-group">
                            <label class="custom-control" for="mobile_otp">Mobile OTP</label>
                            <input type="number" id="mob-otp" name="mobile_otp">
                        </div>
                        <div class="form-group">
                            <label class="custom-control" for="email_otp">Email OTP</label>
                            <input type="number" id="email-otp" name="email_otp">
                        </div>
                    </div>
                    <hr>
                    <div>
                        <button class="btn bg-orange-dark float-right col-12">Submit</button>
                    </div>
                </div>
            </form>
        </div>
    </div>


    @endsection


@section('script')
    //two step verification
    <script>
        if ( window.history.replaceState ) {
            window.history.replaceState( null, null, window.location.href );
        }
        var twoWayData = '<?php echo json_encode($twoWayData) ; ?>';
        twoWayData = JSON.parse(twoWayData);

        if(twoWayData.twoWayChoice == 1){
            document.getElementById("mobile-otp-email").value = twoWayData.email;
            $('#mob_otp').modal('show');
        }

        else if(twoWayData.twoWayChoice == 2){
            document.getElementById("mob-otp-email").value = twoWayData.email;
            $('#email_otp').modal('show');
        }
    </script>

    <script>
        $(document).ready(function(){
            $(document).on('submit','#forgotPassword',function(e){
                e.preventDefault();
                var form = document.getElementById('forgotPassword');
                var formData = new FormData(form);
                $.ajax({
                url: "/forgot-password",
                data: formData,
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                beforeSend:function(){
                    $('#mailFound').text("");
                    $('#someError').text("");
                    $('#mailNotFound').text("");
                    $('#fp_email_id').val();
                },
                success: function (response) {
                    document.getElementById("forgotPassword").reset();
                    if(response.code === 200){
                        $('#mailFound').text(response.message);
                        $('#passwdRecoveryModal').modal('toggle');
                    }else if(response.code === 404){
                        $('#mailNotFound').text(response.message);
                        $('#passwdRecoveryModal').modal('toggle');
                    }else{
                        $('#someError').text(response.message);
                        $('#passwdRecoveryModal').modal('toggle');
                    }
                },
                error:function(error){
                    document.getElementById("forgotPassword").reset();
                    $('#fp_email_id').html();
                    $('#someError').text(response.message);
                    $('#passwdRecoveryModal').modal('toggle');
                }
                })
            });
        });
    </script>
    @endsection
