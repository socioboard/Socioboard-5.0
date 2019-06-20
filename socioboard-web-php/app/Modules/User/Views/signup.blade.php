@extends('User::master')

@section('title')
    <title>SocioBoard | Signup</title>
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
                            <form class="margin-top-30 needs-validation" action="signup" method="POST" ac novalidate >
                                <div class="form-group">
                                    <label for="first_name">Enter your name<span class="text-orange-dark">*</span></label>
                                    <input type="text" class="form-control" id="first_name" placeholder="Name" required
                                           name="first_name">
                                    <div class="error" style="color: red;">{{ $errors->first('first_name') }}</div>
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
                                    <div class="error" style="color: red;">{{ $errors->first('username') }}</div>
                                    {{--<div class="invalid-feedback">--}}
                                    {{--{{ $errors->first('username') }}--}}
                                    {{--</div>--}}
                                    <div class="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="email_id">Your e-mail adress<span class="text-orange-dark">*</span></label>
                                    <input name="email_id" type="email" class="form-control" id="email_id" placeholder="Email"
                                           required >
                                    <div class="error" style="color: red;">{{ $errors->first('email_id') }}</div>
                                    <div class="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="passwd">Enter password<span class="text-orange-dark">*</span></label>
                                    <input type="password" class="form-control" id="passwd" placeholder="Password"
                                           required name="passwd">
                                    <p style="color: red" >Your password must atleast consist of 1 alphabet 1 nummeric character and 1 special character </p>
                                    <div class="error" style="color: red;">{{ $errors->first('passwd') }}</div>
                                    <div class="valid-feedback">
                                        Looks good!
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label for="c_passwd">Confirm password<span class="text-orange-dark">*</span></label>
                                    <input type="password" class="form-control" id="c_passwd" placeholder="Confirm Password"
                                           required name="c_passwd">
                                    <div class="error" style="color: red;">{{ $errors->first('c_passwd') }}</div>
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
                                        <button class="btn bg-orange-dark col-12" type="submit">Create an
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
    @endsection