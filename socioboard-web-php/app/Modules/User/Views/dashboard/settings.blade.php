@extends('User::dashboard.master')
@section('title')
    <title>SocioBoard | Profile Settings</title>
@endsection
@section('style')
    <style type="text/css">
        .tab-pane {
            min-height: 500px;
        }

        .box{
            display: none;
        }
    </style>
@endsection


@section('account')
    <div class="border-0" style="padding: 50px 0;">
        <div class="card-body shadow rounded p-0">
            <div class="row">
                <div class="col-3 border-right p-0 bg-white">
                    <div class="nav flex-column nav-pills" id="v-pills-tab" role="tablist" aria-orientation="vertical">
                        <a class="nav-link rounded-0 active" id="v-pills-profile-settings-tab" data-toggle="pill"
                           href="#v-pills-profile-settings" role="tab" aria-controls="v-pills-profile-settings"
                           aria-selected="true">Profile Settings</a>
                        <a class="nav-link rounded-0" id="v-pills-password-tab" data-toggle="pill" href="#v-pills-password"
                           role="tab" aria-controls="v-pills-password" aria-selected="false"> Change Password</a>
{{--                        <a class="nav-link rounded-0" id="v-pills-messages-tab" data-toggle="pill" href="#v-pills-email"--}}
{{--                           role="tab" aria-controls="v-pills-email" aria-selected="false">Email And SMS</a>--}}
{{--                        removed temporarily--}}
{{--                        <a class="nav-link rounded-0" id="v-pills-privacy-security-tab" data-toggle="pill" href="#v-pills-privacy-security"--}}
{{--                           role="tab" aria-controls="v-pills-privacy-security" aria-selected="false">Privacy--}}
{{--                            and Security</a>--}}
                        <a class="nav-link rounded-0" id="v-pills-billing-tab" data-toggle="pill" href="#v-pills-billing"
                           role="tab" aria-controls="v-pills-billing" aria-selected="false">Billing and Plans</a>
                    </div>
                </div>
                <div class="col-9 bg-light">
                    <div class="tab-content" id="v-pills-tabContent">
                        <!-- edit profile -->
                        <div class="tab-pane fade show active" id="v-pills-profile-settings" role="tabpanel"
                             aria-labelledby="v-pills-profile-settings-tab">
                            <div class="p-5">
                                <h1 style="color: green" id="profileSuccess"></h1>
                                <form id="profileUpdate">
                                    <div class="form-group row">
                                        <label for="fname" class="col-sm-2 col-form-label"><b class="float-right">First Name</b></label>
                                        <div class="col-sm-4">
                                            <input type="text" name="firstName" class="form-control border border-light" id="fname"
                                                   placeholder="First Name" value=" {{session('user')['userDetails']->first_name}}">
                                            <p id="firstNameErr"  style="color: red;"></p>
                                        </div>
                                        <label for="fname" class="col-sm-2 col-form-label"><b class="float-right">Last Name</b></label>

                                        <div class="col-sm-4">
                                            <input type="text" name="lastName" class="form-control border border-light" id="lname"
                                                   placeholder="Last Name">
                                            <p id="lastNameErr"  style="color: red;"></p>
                                        </div>

                                    </div>
                                    <div class="form-group row">
                                        <label for="phone" class="col-sm-2 col-form-label"><b class="float-right">Phone</b></label>
                                        <div class="col-sm-6">
                                            <input type="tel" class="form-control" id="cnt_code" name="phone" >
                                        </div>
                                            <span id="valid-msg" class="hide">✓ Valid</span>
                                            <span id="error-msg" class="hide"></span>

                                    </div>
{{--                                    <div class="form-group row">--}}
{{--                                        <label for="phone" class="col-sm-2 col-form-label"><b class="float-right">Phone</b></label>--}}
{{--                                        <div class="col-sm-2">--}}
{{--                                            <input type="text" name="code" class="form-control border border-light" id="countrycode"--}}
{{--                                                   placeholder="+xx">--}}
{{--                                        </div><div class="col-sm-4">--}}
{{--                                            <input type="number" name="phone" class="form-control border border-light" id="phone"--}}
{{--                                                   placeholder="xxxxxxxxxx">--}}
{{--                                        </div>--}}
{{--                                        <p id="phoneNameErr"  style="color: red;"></p>--}}
{{--                                    </div>--}}
                                    <div class="form-group row">
                                        <label for="dob"  class="col-sm-2 col-form-label"><b class="float-right">DOB</b></label>
                                        <div class="col-sm-8">
                                            <input type="text" name="dob" class="form-control border border-light" id="dob"
                                                   placeholder="dd-mm-yyyy">
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label for="bio" class="col-sm-2 col-form-label"><b class="float-right">Bio</b></label>
                                        <div class="col-sm-8">
                                            <textarea name="bio" class="form-control border border-light" id="bio" rows="3"></textarea>
                                        </div>
                                    </div>
                                    <div class="form-group row">
                                        <label for="fname" class="col-sm-2 col-form-label">&nbsp;</label>
                                        <div class="col-sm-5">
                                            <button type="submit" class="btn btn-sm btn-primary">Submit</button>
                                        </div>
                                        {{--<div class="col-sm-5">--}}
                                            {{--<a href="" class="float-right mt-1">Temporarily disable my account</a>--}}
                                        {{--</div>--}}
                                    </div>
                                </form>
                            </div>
                        </div>
                        <!-- change password -->
                        <div class="tab-pane fade" id="v-pills-password" role="tabpanel" aria-labelledby="v-pills-password-tab">
                            {{--<p id="current_pw_err"  style="color: red;"></p>--}}

                            <div class="p-5">
                                <form id="change_pw">
                                    <div class="form-group row">
                                        <label for="old_passwd" class="col-sm-2 col-form-label"><b class="float-right">Old&nbsp;Password</b></label>

                                        <div class="col-sm-8">
                                            <input type="password" class="form-control border border-light" id="old_passwd" name="old_password">
                                        </div>
                                        <p id="old_passwd_err"  style="color: red;"></p>

                                    </div>
                                    <div class="form-group row">
                                        <label for="new_passwd" class="col-sm-2 col-form-label"><b class="float-right">New&nbsp;Password</b></label>
                                        <div class="col-sm-8">
                                            <input type="password" class="form-control border border-light" id="new_passwd" name="new_password">
                                        </div>
                                        <p id="new_passwd_err"  style="color: red;"></p>
                                    </div>
                                    <div class="form-group row">
                                        <label for="c_new_passwd" class="col-sm-2 col-form-label"><b class="float-right">Confirm
                                                New&nbsp;Password</b></label>
                                        <div class="col-sm-8">
                                            <input type="password" class="form-control border border-light" id="c_new_passwd" name="confirm_password">
                                        </div>
                                        <p id="conf_passwd_err"  style="color: red;"></p>
                                    </div>
                                    <div class="form-group row">
                                        <label for="fname" class="col-sm-2 col-form-label">&nbsp;</label>
                                        <div class="col-sm-5">
                                            <button type="submit" class="btn btn-sm btn-primary">Change
                                                Password</button>
                                        </div>
                                    </div>
                                    <div class="bg-white p-3">
                                        <h6 id="current_pw_err" class="text-danger text-center mt-1"></h6>
                                        <h6 id="current_pw_suc" class="text-center mt-1" style="color: green"></h6>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <!-- Email and SMS -->
                        <div class="tab-pane fade" id="v-pills-email" role="tabpanel" aria-labelledby="v-pills-email-tab">
                            <div class="p-5">
                                <form>
                                    <div class="bg-white p-2">
                                        <h5><b>Newsletter subscription</b></h5>
                                        <h6>You can change your email subscription status below </h6>
                                        <div class="custom-control custom-switch">
                                            <input type="checkbox" class="custom-control-input" id="daily_team_report">
                                            <label class="custom-control-label" for="daily_team_report">Daily
                                                Team Report Summary </label>
                                        </div>
                                        <div class="custom-control custom-switch mt-1">
                                            <input type="checkbox" class="custom-control-input" id="weekly_team_report">
                                            <label class="custom-control-label" for="weekly_team_report">Weekly
                                                Team Report Summary
                                            </label>
                                        </div>
                                        <div class="custom-control custom-switch mt-1">
                                            <input type="checkbox" class="custom-control-input" id="15_team_report">
                                            <label class="custom-control-label" for="15_team_report">15 Days
                                                Team Report Summary
                                            </label>
                                        </div>
                                        <div class="custom-control custom-switch mt-1">
                                            <input type="checkbox" class="custom-control-input" id="monthly_team_report">
                                            <label class="custom-control-label" for="monthly_team_report">Monthly
                                                Team Report Summary
                                            </label>
                                        </div>
                                        <div class="custom-control custom-switch mt-1">
                                            <input type="checkbox" class="custom-control-input" id="60_team_report">
                                            <label class="custom-control-label" for="60_team_report">60 Days
                                                Team Report Summary
                                            </label>
                                        </div>
                                        <div class="custom-control custom-switch mt-1">
                                            <input type="checkbox" class="custom-control-input" id="90_team_report">
                                            <label class="custom-control-label" for="90_team_report">90 Days
                                                Team Report Summary
                                            </label>
                                        </div>
                                        <div class="custom-control custom-switch mt-1">
                                            <input type="checkbox" class="custom-control-input" id="other_news">
                                            <label class="custom-control-label" for="other_news">Other
                                                Newsletters </label>
                                        </div>
                                    </div>
                                    <div class="bg-white p-2 mt-2">
                                        <h5><b>Schedule message update notification</b></h5>
                                        <div class="custom-control custom-switch mt-1">
                                            <input type="checkbox" class="custom-control-input" id="succ_sche">
                                            <label class="custom-control-label" for="succ_sche">Updates
                                                for success of schedule messages </label>
                                        </div>
                                        <div class="custom-control custom-switch mt-1">
                                            <input type="checkbox" class="custom-control-input" id="fail_sche">
                                            <label class="custom-control-label" for="fail_sche">Updates
                                                for failure of schedule messages</label>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                        <!-- privacy and security -->
                        <div class="tab-pane fade" id="v-pills-privacy-security" role="tabpanel"
                             aria-labelledby="v-pills-privacy-security-tab">
                            <div class="p-5">
                                <div class="bg-white p-2 mt-2">
                                    <h5><b>Two-Factor Authentication </b></h5>
                                    <p>Two-Factor Authentication, adds an extra layer of security for your
                                        Socioboard account. Whenever you log in to your account, after
                                        entering your username and password, you will be asked for a second
                                        authentication code that was sent to your mobile phone via text or
                                        free mobile app.</p>
                                    <a href="javascript:void(0);" class="" data-toggle="modal" data-target="#step_one_factor_Modal">Edit
                                        Two-Factor Authentication Setting</a>
                                </div>
                                <div class="bg-white p-2 mt-2 pb-5">
                                    <h5><b>Social Sign In </b></h5>
                                    <p>You can sign in to Socioboard quickly and easily using your social
                                        networks. If you share access to a social network with someone else
                                        then make sure to switch this off so that they can't sign in to your
                                        account. </p>
                                    <div class="row">
                                        <div class="col-md-6 col-sm-12">
                                            <h6 class="text-primary">Primary Account </h6>
                                            <div>
                                                <div class="shadow bg-white fb-card">
                                                    <div class="card-body">
                                                                <span class="card_social_ribbon" style="top: 30px;">
                                                                    <i class="fab fa-facebook-f"></i>
                                                                </span>
                                                        <div class="text-center">
                                                            <img class="rounded-circle" src="https://mir-s3-cdn-cf.behance.net/user/115/9cd6be10442367.5bb6f52b991c0.jpg"
                                                                 alt="ChanchalSantra">
                                                            <h5 class="card-title no-space">Chanchal Santra</h5>
                                                            <p class="card-text">chanchalsantra@globussoft.in</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="col-md-6 col-sm-12">
                                            <h6 class="text-primary">Secondary Account </h6>
                                            <div class="card-body rounded shadow mt-1">
                                                <div class="custom-control custom-switch">
                                                    <input type="checkbox" class="custom-control-input" id="profile_two">
                                                    <label class="custom-control-label" for="profile_two">Profile
                                                        Two</label>
                                                    <div class="float-right">
                                                        <img src="../../assets/imgs/64x64.jpg" class="rounded-circle avatar-30" />
                                                        <i class="fab fa-facebook-square"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="card-body rounded shadow mt-1">
                                                <div class="custom-control custom-switch">
                                                    <input type="checkbox" class="custom-control-input" id="profile_two1">
                                                    <label class="custom-control-label" for="profile_two1">Profile
                                                        Two</label>
                                                    <div class="float-right">
                                                        <img src="../../assets/imgs/64x64.jpg" class="rounded-circle avatar-30" />
                                                        <i class="fab fa-google-plus"></i>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="card-body rounded shadow mt-1 text-center">
                                                <a href="javascript:void(0);" class="btn btn-sm btn-primary col-12"
                                                   data-toggle="modal" data-target="#giveAccessModal">Add
                                                    Accounts</a>
                                                <small>To give acess please click on add account</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- privacy and security -->
                        <div class="tab-pane fade" id="v-pills-billing" role="tabpanel" aria-labelledby="v-pills-billing-tab">
                            <div class="p-5">
                                <div class="bg-white p-2 mt-2">
                                    <h5><b>Current Plan</b></h5>
                                    <h6>You're currently paying <b>{{session()->get('user')['userDetails']->userPlanDetails->plan_price}}</b> per month on your plan. </h6>
                                    <a href="{{env('APP_URL')}}updatePlan" class="btn btn-sm btn-primary">Switch To
                                        Business Plan</a>
                                    <a href=JavaScript:void(0); class="btn btn-sm btn-secondary" download="invoice.pdf"   onclick="getInvoice()" >Download
                                        Invoice</a>
                                    {{--<a href="javascript:void(0);" class="btn btn-sm btn-secondary">Download--}}
                                        {{--Invoice</a>--}}
                                    <a href="#" class="btn btn-sm btn-danger plan" id="0">Cancel Plan</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    @endsection


@section('modals')
            <!-- Give Access Modal -->
    <div class="modal fade" id="giveAccessModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content ">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Secondary Accounts Access</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="form-group">
                            <label for="profile_email">Email address</label>
                            <input type="email" class="form-control" id="profile_email" aria-describedby="emailHelp"
                                   placeholder="Enter email">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
                    <button type="button" class="btn btn-primary">Submit</button>
                </div>
            </div>
        </div>
    </div>


    <!-- Plan Modal -->
    <div class="modal fade " id="planModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered" role="document">
            <div class="modal-content ">
                <div class="modal-header">
                    <h5 class="modal-title" id="socioboardplan">SocioBoard Plan</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
{{--                        {{session()->get('user')['userDetails']->Activations}}--}}

                        {{--@if(session()->get('user')['userDetails']['Activations'] == 0)--}}
                        {{--@endif--}}
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Free</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 0)
                                    <button  class="btn btn-primary btn-sm plan" >Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 0)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('BASIC')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 0)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('BASIC')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Standard</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 1)
                                    <button  class="btn btn-primary btn-sm plan">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 1)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('STANDARD')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 1)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('STANDARD')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Premium</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 2)
                                    <button  class="btn btn-primary btn-sm plan" >Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 2)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('PREMIUM')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 2)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('PREMIUM')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Deluxe</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 3)
                                    <button  class="btn btn-primary btn-sm plan">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 3)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('DELUXE')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 3)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('DELUXE')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Topaz</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 4)
                                    <button  class="btn btn-primary btn-sm plan">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 4)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('TOPAZ')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 4)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('TOPAZ')}}">Upgrade</button>
                                @endif
                            </div>
                        </div> <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Ruby</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 5)
                                    <button  class="btn btn-primary btn-sm plan">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 5)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('RUBY')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 5)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('RUBY')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Gold</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 6)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('GOLD')}}">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 6)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('GOLD')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 6)
                                    <button  class="btn btn-primary btn-sm plan">Upgrade</button>
                                @endif
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card-body text-center">
                                <h6>Platinum</h6>
                                @if(Session()->get('user')['userDetails']->Activations->user_plan == 7)
                                    <button  class="btn btn-primary btn-sm plan">Current</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan > 7)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('PLATINUM')}}">Downgrade</button>
                                @elseif(Session()->get('user')['userDetails']->Activations->user_plan < 7)
                                    <button  class="btn btn-primary btn-sm plan" id="{{env('PLATINUM')}}">Upgrade</button>
                                @endif
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- two steps Factor Modal - step one -->
    <div class="modal fade" id="step_one_factor_Modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="exampleModalLabel">Two-Factor Authentication</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    Do you want to activate Two-Factor Authentication ?
                </div>
                <div class="modal-footer">
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">No</button>
                        <button type="button" class="btn btn-primary active_factor" >Yes</button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- two steps Factor Modal - step two -->
            <!-- two steps Factor Modal - step two -->
            <div class="modal fade" id="step_two_factor_Modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
                 aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Two-Factor Authentication | SMS or E-Mail</h5>
                            <button type="button" onclick="closeModal()" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div style="align-content: center">
                            @if(Session::get('twoWayAuth') == 'false')
                                <h4 class="modal-title" style="color: #002752; text-align: center">You have not activated Two-Factor Authentication </h4>
                            @elseif(Session::get('twoWayAuth') == 'true')
                                <h4 class="modal-title" style="color: #002752; text-align: center">You have opted Mobile-otp login </h4>
                            @elseif(Session::get('twoWayAuth') == '2')
                                <h4 class="modal-title" style="color: #002752; text-align: center">You have opted Mobile and e-mail otp login </h4>
                            @endif

                        </div>


                        <div class="modal-body">
                            <div>
                                <form id="two-way-auth">
                                    <div class="custom-control custom-radio">
                                        <input type="radio" id="no_auth" name="customRadio" class="custom-control-input" value="no_auth">
                                        <label class="custom-control-label" for="no_auth">No Authentication</label>
                                    </div>
                                    <div class="custom-control custom-radio">
                                        <input type="radio" id="m_otp" name="customRadio" class="custom-control-input" value="m_otp">
                                        <label class="custom-control-label" for="m_otp">via mobile OTP</label>
                                    </div>
                                    <div class="custom-control custom-radio">
                                        <input type="radio" id="email_auth" name="customRadio" class="custom-control-input" value="email_auth">
                                        <label class="custom-control-label" for="email_auth">Via Email and Mobile OTP</label>
                                    </div>
                                    <hr>
                                    <div>
                                        <button class="btn bg-orange-dark float-right col-12">Update Details</button>
                                    </div>
                                </form>
                            </div>
{{--                            <div class="m_otp box">--}}
{{--                                <form>--}}
{{--                                    <div class="form-group">--}}
{{--                                        <label for="country_code">Country Code<span class="text-orange-dark">*</span></label>--}}
{{--                                        <input value="+1" class="form-control" id="country_code">--}}
{{--                                    </div>--}}
{{--                                    <div class="form-group">--}}
{{--                                        <label for="phone_number">Enter Phone Number<span class="text-orange-dark">*</span></label>--}}
{{--                                        <input placeholder="Phone number" class="form-control" id="phone_number">--}}
{{--                                    </div>--}}
{{--                                    <div>--}}
{{--                                        <button class="btn bg-orange-dark float-right col-12">Update Details</button>--}}
{{--                                    </div>--}}
{{--                                </form>--}}
{{--                            </div>--}}
{{--                            <div class="email_auth box">--}}
{{--                                <form>--}}
{{--                                    <div class="form-group">--}}
{{--                                        <label for="country_code">Country Code<span class="text-orange-dark">*</span></label>--}}
{{--                                        <input value="+1" class="form-control" id="country_code">--}}
{{--                                    </div>--}}
{{--                                    <div class="form-group">--}}
{{--                                        <label for="phone_number">Enter Phone Number<span class="text-orange-dark">*</span></label>--}}
{{--                                        <input placeholder="Phone number" class="form-control" id="phone_number">--}}
{{--                                    </div>--}}
{{--                                    <div>--}}
{{--                                        <div class="form-group">--}}
{{--                                            <label for="email">Enter Email<span class="text-orange-dark">*</span></label>--}}
{{--                                            <input placeholder="Email id" class="form-control" id="email">--}}
{{--                                        </div>--}}
{{--                                        <button class="btn bg-orange-dark float-right col-12">Update Details</button>--}}
{{--                                    </div>--}}
{{--                                </form>--}}
{{--                            </div>--}}
                        </div>
                    </div>
                </div>
            </div>
{{--    <div class="modal fade" id="step_two_factor_Modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"--}}
{{--         aria-hidden="true">--}}
{{--        <div class="modal-dialog modal-dialog-centered" role="document">--}}
{{--            <div class="modal-content">--}}
{{--                <div class="modal-header">--}}
{{--                    <h5 class="modal-title" id="exampleModalLabel">Two-Factor Authentication | SMS or E-Mail</h5>--}}
{{--                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">--}}
{{--                        <span aria-hidden="true">&times;</span>--}}
{{--                    </button>--}}
{{--                </div>--}}
{{--                <div class="modal-body">--}}
{{--                    <form>--}}
{{--                        <div class="form-group">--}}
{{--                            <label for="country_code">Country Code<span class="text-orange-dark">*</span></label>--}}
{{--                            <input value="+1" class="form-control" id="country_code">--}}
{{--                        </div>--}}
{{--                        <div class="form-group">--}}
{{--                            <label for="phone_number">Enter Phone Number<span class="text-orange-dark">*</span></label>--}}
{{--                            <input placeholder="Phone number" class="form-control" id="phone_number">--}}
{{--                        </div>--}}
{{--                        <div>--}}
{{--                            <button class="btn bg-orange-dark float-right col-12">Update Details</button>--}}
{{--                        </div>--}}
{{--                    </form>--}}
{{--                </div>--}}
{{--            </div>--}}
{{--        </div>--}}
{{--    </div>--}}

@endsection
@section('script')
    <script src="https://unpkg.com/sweetalert/dist/sweetalert.min.js"></script>
    <script src="/assets/plugins/intel-tel-input/intlTelInput.js"></script>
    <script>
        var input = document.querySelector("#cnt_code");
        // initialise plugin
        var iti = window.intlTelInput(input, {
            utilsScript: "/assets/plugins/intel-tel-input/utils.js",
            initialCountry: "in",
            separateDialCode: true,
            customContainer: "col-md-12 no-padding intelinput-styles",
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
        //for GA
        var eventCategory = 'User';
        var eventAction = 'Settings';
        //for Invoice
        getUserInfo();
        function getInvoice(){
            $.ajax({
                url: "/get-invoice",
                cache: false,
                processData: false,
                contentType: false,
                type: 'POST',
                success: function (response) {
                    if(response.code == 200){
//                        window.open(response.file);
                        var file = response.file;
                        window.open(file,'_blank');
                    }
                },
                error:function(error){
//                        document.getElementById("change_pw").reset();
                }
            })
        }
        function getUserInfo(){
            $.ajax({
                type: 'get',
                url: "/get-user-info",
                cache: false,
                processData: false,
                contentType: false,
                success: function (response) {
                    if(response['code'] == "200"){
                      if(response["details"]["phone_no"] != ''){
                          var phoneNum =  "+" +  response["details"]["phone_code"] + response["details"]["phone_no"] ;
                          iti.setNumber(phoneNum);
                      }
                      document.getElementById("lname").value = response['details']['last_name'];
                      document.getElementById("dob").value = response['details']['date_of_birth'];
                      document.getElementById("bio").value = response['details']['about_me'];
                    }
                    else{
                        swal(response['message']);
                    }

                },
                error:function(error){
                    console.log(error)
                }
            })




        }

        //reset step_two_factor_Modal
        function closeModal(id){
            document.getElementById("two-way-auth").reset();
            $(".box").hide();
            if(twoWay == 'false'){
                document.getElementById("no_auth").checked = true;
            }else if(twoWay == 'true'){
                document.getElementById("m_otp").checked = true;
            }else if(twoWay == '2'){
                document.getElementById("email_auth").checked = true;
            }
        }


        $(document).ready(function(){
             twoWay = '<?php echo json_encode(Session::get("twoWayAuth")) ; ?>';
            if(twoWay == 'false'){
                document.getElementById("no_auth").checked = true;
            }else if(twoWay == 'true'){
                document.getElementById("m_otp").checked = true;
            }else if(twoWay == '2'){
                document.getElementById("email_auth").checked = true;
            }

            $(document).on('submit', '#two-way-auth', function(e){
                e.preventDefault();
                var form = document.getElementById('two-way-auth');
                var formData = new FormData(form);
                $.ajax({
                    url: "/update-two-way-auth",
                    data: formData,
                    cache: false,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    beforeSend:function(){
                        $('#step_two_factor_Modal').modal('hide');
                    },
                    success: function (response) {
                        if(response.code == 200){
                            swal({
                                title: "Updated!",
                                text: "Two step authentication is updated." + response.message,
                                type: "success",
                                timer: 3000
                            });
                            function finish() {
                                location.reload(true);
                                $('#step_two_factor_Modal').modal('hide');
                            };

                        }
                        else if(response.code == 404){
                            swal({title : "Error!",
                                text : response.error + "Update your mobile number and then try to activate two-step-verification...",
                                icon:"warning",
                                closeOnClickOutside: false,
                                timer: 3000
                            }).then(()=>{
                                window.location = "{{env('APP_URL')}}settings";
                            })
                        }
                        else if(response.code == 201){
                            swal({
                                title: "Error!",
                                text: response.error,
                                type: "fail",
                                timer: 3000
                            });
                            function finish() {
                                location.reload(true);
                                $('#step_two_factor_Modal').modal('hide');
                            };
                        }
                    },
                    error:function(error){

                    }
                })

            });




            $(document).on('submit','#change_pw',function(e){
                e.preventDefault();
                var form = document.getElementById('change_pw');
                var formData = new FormData(form);
                $.ajax({
                    url: "/change-password",
                    data: formData,
                    cache: false,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    beforeSend:function(){
                        $('#conf_passwd_err').html("");
                        $('#new_passwd_err').html("");
                        $('#old_passwd_err').html("");
                        $('#current_pw_err').text("");
                        $('#current_pw_suc').text("");
                    },
                    success: function (response) {

                        if(response.code == 203){
                            $('#current_pw_err').text(response.errors);

                        }else if(response.code == 202){
//                            if(response.code)
                            if(response.errors.confirm_password != null) {
                                $('#conf_passwd_err').text(response.errors.confirm_password[0]);
                            }
                            if(response.errors.new_password !=null){
                                $('#new_passwd_err').text(response.errors.new_password);
                            }
                            if(response.errors.old_password !=null){
                                $('#old_passwd_err').text(response.errors.old_password);
                            }
                        }else if(response.code == 200){
                            $('#current_pw_suc').text(response.message);

                        }
//                        document.getElementById("change_pw").reset();
//                        if(response.code === 200){
//                        }else if(response.code === 404){
//
//                        }else{
//
//                        }
                    },
                    error:function(error){
//                        document.getElementById("change_pw").reset();
//                       console.log(error)
                    }
                })
            });
            $(document).on('submit','#profileUpdate',function(e){
                e.preventDefault();
                var countryData = iti.getSelectedCountryData();
                var dialCode = countryData.dialCode;
                var form = document.getElementById('profileUpdate');
                var formData = new FormData(form);
                formData.append('code',dialCode);
                $.ajax({
                    url: "/profile-update",
                    data: formData,
                    cache: false,
                    processData: false,
                    contentType: false,
                    type: 'POST',
                    beforeSend:function(){
                        $('#firstNameErr').html("");
                        $('#valid-msg').html("");
                        $('#error-msg').html("");
                        $('#lastNameErr').html("");
                        $('#profileSuccess').html("");
                    },
                    success: function (response) {
                        /*
                         * 201=>Profile Updation failed;(
                         * 200: Profile Updated Successfully!
                         * 500: Something went wrong*/
                        if(response.code == 202){
                            if(response.errors.firstName != null){
                                $('#firstNameErr').text(response.errors.firstName);
                            }
                            if(response.errors.phone != null){
                                $('#phoneNameErr').text(response.errors.phone[0]);
                            }
                            if(response.errors.lastName !=null){

                                $('#lastNameErr').text(response.errors.lastName);
                            }
                        }else if(response.code == 200){
                            swal("Updated!!", response.message, "success");
                            document.location.href = '{{env('APP_URL')}}settings';
//                            $('#profileSuccess').text(response.errors.lastName);
                        }else if(response.code == 201){
                            swal(response.message)

                        }
                    },
                    error: function(error){
//                        document.getElementById("change_pw").reset();
                       console.log(error)
                    }
                })
            });
            $(document).on('click','#TwoStepYes', function (){
//                $('#step_one_factor_Modal').modal('hide');
//                $('#step_two_factor_Modal').modal('show'); //TODO  uncommnent once phn updation api done
                $.ajax({
                    url: "Two-Step-activation",
                    type: "POST",
                    data: {twoStepActivate : 1},
                    success: function(response){
                        if(response == 200){
                            $('#step_one_factor_Modal').modal('hide');
                            swal("activated")
                        }else if(response == 400){
                            $('#step_one_factor_Modal').modal('hide');
                            swal("not changed")
                        }else if(response == 500){
                            swal("some error")
                        }
                    }
                });
            });
//
//            $(document).on('click','.plan',function(){
//                var currentPlan = $('#planInput').val();
//                var newPlan =this.id;
//
//                $.ajax({
//                    url:'updatePlan',
//                    type:'POST',
//                    data:{
//                        "currentPlan":currentPlan,
//                        "newPlan":newPlan
//                    },
//                    success:function(response){
//
//                        /*
//                        * 200 success 202 success => redirect url
//                        * 401 not valid plan
//                        * 500 exception
//                        * 400 something wrong */
//                        if(response.code === 202){
//                            document.location.href = response.redirectUrl;
//                        }else if(response.code == 200){
//                            swal({
//                                text: "Your plan is upgraded",
//                                type:"success",
//                                showConfirmButton: false,
//                                timer: 1500
//                            });
//                            location.reload();
//                        }else if(response.code == 400){
//                            swal({
//                                text: response.message,
//                                type:"warning",
//                                showConfirmButton: false,
//                                timer: 1500
//                            });
//
//                        }
//
//
////                        if(response.code == 200)
////                        {
////                            document.location.href = response.navigate;
////                        }else if(response.code==401){
////                            alert(response.message);
////                        }else {
////                            alert(response.message);
////                        }
//                    },
//                    error:function(error){
//                    }
//                })
//
//            })
        });
        $('.active_factor').click(function () {
            $('#step_one_factor_Modal').modal('hide');
            $('#step_two_factor_Modal').modal('show', function () {
            });
        });

        // Authentication radio div hide show
        $(document).ready(function(){
            $('input[type="radio"]').click(function(){
                var inputValue = $(this).attr("value");
                var targetBox = $("." + inputValue);
                $(".box").not(targetBox).hide();
                $(targetBox).show();
            });
        });

        // dob
        $(function () {
            $('#dob').datetimepicker({
                disabledTimeIntervals: false,
                maxDate:moment(),
            });
        });

    </script>
    @include('User::dashboard.planUpgradationjs')
        @endsection


