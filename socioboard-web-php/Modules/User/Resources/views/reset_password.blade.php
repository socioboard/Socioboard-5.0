@extends('user::Layouts._master')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Reset Password</title>
@endsection
@section('main-content')
    <!--begin::Forgot-->
    <div class="login-form pt-11">
        <!--begin::Form-->
        <form class="form" novalidate="novalidate" id="">
            @csrf
            <!--begin::Title-->
            <div class="text-center pb-8">
                <h2 class="font-weight-bolder font-size-h2 font-size-h1-lg">Reset Password</h2>
                <p class="font-weight-bold font-size-h4">Enter new password</p>
            </div>
            <!--end::Title-->
            <!--begin::Form group-->
            <div class="form-group">
                <div class="input-icon input-icon-right" id="new_password">
                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="password" placeholder="Enter new password" name="new_password_Name" id="new_password_Id" autocomplete="off"/>
                    <span><a href="javascript:;"><i class="fas fa-eye-slash toggle-password"></i></a></span>
                    <div class="error text-danger" id="new_password_Error1"></div>
                </div>
            </div>
            <!--end::Form group-->

            <!--begin::Form group-->
            <div class="form-group">
                <div class="input-icon input-icon-right" id="confirm_password">
                    <input class="form-control form-control-solid h-auto py-7 rounded-lg font-size-h6" type="password" placeholder="Confirm password"name="conform_password_Name" id="conform_password_Id" autocomplete="off"/>
                    <span><a href="javascript:;"><i class="fas fa-eye-slash toggle-password"></i></a></span>
                    <div class="error text-danger" id="conform_password_Error1"></div>
                </div>
            </div>
            <!--end::Form group-->
                <div class="error text-danger" id="reset_password_Error1"></div>
            <!--begin::Form group-->
            <div class="form-group d-flex flex-wrap flex-center pb-lg-0 pb-3">
                <a id="" class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 mx-4" onclick="newPasswordSubmit()">Reset Password</a>
                <button type="button" id="Sb_login_forgot_cancel" class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 mx-4">Cancel</button>
            </div>
            <!--end::Form group-->
        </form>
        <!--end::Form-->
    </div>
    <!--end::Forgot-->
@endsection
<script src="{{asset('../js/IncJsFiles/reset_password.js')}}"></script>
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script>
    let APP_URL = '{{env('APP_URL')}}';
    var email = '{{session()->get('forgot_password_user_email')}}';
    var token = '{{session()->get('otherToken')}}';
    $(document).ready(function () {
        $('#new_password a').on('click',function (event) {
            event.preventDefault();
            if($('#new_password input').attr("type") === "text"){
                $('#new_password input').attr('type', 'password');
                $('#new_password i').addClass( "fa-eye-slash" );
                $('#new_password i').removeClass( "fa-eye" );
            }else if($('#new_password input').attr("type") === "password"){
                $('#new_password input').attr('type', 'text');
                $('#new_password i').removeClass( "fa-eye-slash" );
                $('#new_password i').addClass( "fa-eye" );
            }
        })

        $("#confirm_password a").on('click', function(event) {
            event.preventDefault();
            if($('#confirm_password input').attr("type") === "text"){
                $('#confirm_password input').attr('type', 'password');
                $('#confirm_password i').addClass( "fa-eye-slash" );
                $('#confirm_password i').removeClass( "fa-eye" );
            }else if($('#confirm_password input').attr("type") === "password"){
                $('#confirm_password input').attr('type', 'text');
                $('#confirm_password i').removeClass( "fa-eye-slash" );
                $('#confirm_password i').addClass( "fa-eye" );
            }
        });
    })

</script>
