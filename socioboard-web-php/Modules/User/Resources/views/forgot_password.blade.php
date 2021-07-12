@extends('user::Layouts._master')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Forgot Password</title>
@endsection
@section('main-content')
    <!--begin::Forgot-->
    <div class="login-form pt-11">
        <!--begin::Form-->
        <form class="form" novalidate="novalidate" id="">
        @csrf
        <!--begin::Title-->
            <div class="text-center pb-8">
                <h2 class="font-weight-bolder font-size-h2 font-size-h1-lg">Forgotten Password ?</h2>
                <p class="font-weight-bold font-size-h4">Enter your email to reset your password</p>
            </div>
            <!--end::Title-->
            @if(session()->has('message'))
                <div class="alert alert-danger">
                    {{ session()->get('message') }}
                </div>
        @endif
        <!--begin::Form group-->
            <div class="form-group">
                <div class="input-icon">
                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="email"
                           name="forgotPasswordEmailName" id="forgotPasswordEmailId" placeholder="Email"
                           autocomplete="off"/>
                    <span><i class="far fa-envelope-open"></i></span>
                    <div class="error text-danger" id="forgotPasswordEmailError1"></div>
                </div>
            </div>
            <!--end::Form group-->

            <!--begin::Form group-->
            <div class="form-group d-flex flex-wrap flex-center pb-lg-0 pb-3">
                {{--                                <a id="" href="login.html" class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 mx-4"   onclick="forgotPasswordSubmit()">Submit</a>--}}
                {{--                                <a id="forgotPasswordId" class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 mx-4"   onclick="forgotPasswordSubmit()">Submit</a>--}}
                <a id="" class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 mx-4"
                   onclick="forgotPasswordSubmit()">Submit</a>
                <a href="{{url('/login')}}" id="Sb_login_forgot_cancel"
                   class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 mx-4">
                    Cancel
                </a>
            </div>
            <!--end::Form group-->
        </form>
        <!--end::Form-->
    </div>
    <!--end::Forgot-->
@endsection
<script src="{{asset('js/IncJsFiles/forgot_password.js')}}"></script>
