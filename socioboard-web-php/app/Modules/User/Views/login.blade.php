@extends('User::master')

@section('title')
    <title>SocioBoard | Signin</title>
@endsection

@section('login')
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

                        <form class="margin-top-30 needs-validation" novalidate action="login" method="POST">
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
                                <div class="col-md-12 text-center">or</div>
                                <div class="col-md-6">
                                    <a href='{{env('APP_URL')}}social/facebook' class="btn btn-fb col-12">Sign in with
                                        Facebook</a>
                                </div>
                                <div class="col-md-6">
                                    <a href='{{env('APP_URL')}}social/google' class="btn btn-google col-12">Sign in with Google</a>
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

    @endsection


@section('script')
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
                     console.log(response);
                    document.getElementById("forgotPassword").reset();
                    if(response.code === 200){
                        console.log(response.message);
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