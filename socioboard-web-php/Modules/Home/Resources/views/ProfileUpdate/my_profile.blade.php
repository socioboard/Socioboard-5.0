@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Profile Update</title>
@endsection
@section('links')
    <link href="{{asset('/plugins/custom/intl-tel-input/build/css/intlTelInput.css')}}" rel="stylesheet"
          type="text/css"/>
    <style>
        .iti__country-name {
            color: black;
        }

        .iti.iti--allow-dropdown {
            border-radius: inherit;
            background-color: #3a3b3c;
        }
    </style>
@endsection

@section('content')

    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Profile-->
                <div class="d-flex flex-row">
                    <!--begin::Aside-->
                    <div class="flex-row-auto offcanvas-mobile w-250px w-xxl-350px" id="kt_profile_aside">
                        <!--begin::Profile Card-->
                        <div class="card card-custom">
                            <!--begin::Body-->
                            <div class="card-body pt-4">

                                <!--begin::User-->
                                <div class="d-flex align-items-center">
                                    <div
                                            class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                        <div class="symbol-label" id="profile_picture_append"
                                             style="background-image:url('<?php if (isset($getProfileData['data']->user->profile_picture)) {
                                                 echo SquareProfilePicAppend($getProfileData['data']->user->profile_picture);
                                             }?>')"></div>
                                        <i class="symbol-badge bg-success"></i>
                                    </div>
                                    <div class="profile-personal-info">
                                        <a id="user_name_append"
                                           class="text-truncate font-weight-bolder font-size-h5 text-hover-primary">
                                            <?php if (isset($getProfileData['data']->user->first_name)) {
                                                echo $getProfileData['data']->user->first_name;
                                            }?>
                                        </a>
                                        <a id="last_name_append"
                                           class="text-truncate font-weight-bolder font-size-h5 text-hover-primary">
                                            <?php if ((isset($getProfileData['data']->user->last_name)) && ($getProfileData['data']->user->last_name != "nil")) {
                                                echo $getProfileData['data']->user->last_name;
                                            }?>
                                        </a>
                                        <div class="">
                                            {{--                                            UX designer--}}
                                        </div>
                                    </div>
                                </div>
                                <!--end::User-->

                                <!--begin::Contact-->
                                <div class="py-9">
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <span class="font-weight-bold mr-2">Email:</span>
                                        <a class="profile-personal-info"><?php if (isset($getProfileData['data']->user->email) && ($getProfileData['data']->user->email != "nil")) {
                                                echo $getProfileData['data']->user->email;
                                            } else echo ''?></a>
                                    </div>
                                    <div class="d-flex align-items-center justify-content-between mb-2">
                                        <span class="font-weight-bold mr-2">Phone:</span>
                                        <span class=""
                                              id="phone_number_append"><?php if (isset($getProfileData['data']->user->phone_no) && ($getProfileData['data']->user->phone_no != "nil")) {
                                                echo $getProfileData['data']->user->phone_no;
                                            } else echo ''?></span>
                                    </div>
                                    <div class="d-flex align-items-center justify-content-between">
                                        <span class="font-weight-bold mr-2">Location:</span>
                                        <span class="profile-personal-info"
                                              id="location_append"><?php if (isset($getProfileData['data']->user->address) && ($getProfileData['data']->user->address != "nil")) {
                                                echo $getProfileData['data']->user->address;
                                            } else echo ''?></span>
                                    </div>
                                </div>
                                <!--end::Contact-->

                                <div class="example-preview">
                                    <ul class="nav flex-column nav-pills" id="settingsTab" role="tablist">
                                        <li class="nav-item">
                                            <a class="nav-link py-4 active" id="personal-info-tab" data-toggle="tab"
                                               href="#personal-info">
                                                            <span class="navi-icon mr-2">
                                                                <span class="svg-icon">
                                                                    <i class="fas fa-user-check"></i>
                                                                </span>
                                                            </span>
                                                <span class="navi-text font-size-lg">
                                                                Personal Information
                                                            </span>
                                            </a>
                                        </li>
                                        <li class="nav-item">
                                            <a class="nav-link py-4" id="account-info-tab" data-toggle="tab"
                                               href="#account-info" aria-controls="account-info">
                                                            <span class="navi-icon mr-2">
                                                                <span class="svg-icon">
                                                                    <i class="fas fa-user-cog"></i>
                                                                </span>
                                                            </span>
                                                <span class="navi-text font-size-lg">
                                                                Account Information
                                                            </span>
                                            </a>
                                        </li>
                                        <?php if (isset($getProfileData['data']->user->Activations->signup_type) && ($getProfileData['data']->user->Activations->signup_type === 0)) {
                                        ?>
                                        <li class="nav-item">
                                            <a class="nav-link py-4" id="change-passwd-tab" data-toggle="tab"
                                               href="#change-passwd" aria-controls="change-passwd">
                                                            <span class="navi-icon mr-2">
                                                                <span class="svg-icon">
                                                                    <i class="fas fa-key"></i>
                                                                </span>
                                                            </span>
                                                <span class="navi-text font-size-lg">
                                                                Change Password
                                                            </span>
                                            </a>
                                        </li>
                                        <?php } ?>
                                        {{--                                        upcoming feature--}}
                                        {{--                                        <li class="nav-item">--}}
                                        {{--                                            <a class="nav-link py-4" id="email-settings-tab" data-toggle="tab" href="#email-settings"  aria-controls="email-settings" >--}}
                                        {{--                                                            <span class="navi-icon mr-2">--}}
                                        {{--                                                                <span class="svg-icon">--}}
                                        {{--                                                                    <i class="fas fa-envelope"></i>--}}
                                        {{--                                                                </span>--}}
                                        {{--                                                            </span>--}}
                                        {{--                                                <span class="navi-text font-size-lg">--}}
                                        {{--                                                                Email settings--}}
                                        {{--                                                            </span>--}}
                                        {{--                                            </a>--}}
                                        {{--                                        </li>--}}
                                    </ul>
                                </div>

                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Profile Card-->
                    </div>
                    <!--end::Aside-->
                    <!--begin::Content-->
                    <div class="flex-row-fluid ml-lg-8">

                        <div class="tab-content" id="myTabContent1">
                            <div class="tab-pane fade show active" id="personal-info" role="tabpanel"
                                 aria-labelledby="personal-info-tab">
                                <!--begin::Card-->
                                <div class="card card-custom card-stretch">
                                    <!--begin::Header-->
                                    <div class="card-header py-3">
                                        <div class="card-title align-items-start flex-column">
                                            <h3 class="card-label font-weight-bolder">Personal Information</h3>
                                            <span class="font-weight-bold font-size-sm mt-1">Update your personal information</span>
                                        </div>
                                        <div class="card-toolbar">
                                            <button type="reset" class="btn mr-2" id="save_button_id"
                                                    onclick="updateProfileData(1)">Save Changes
                                            </button>
                                            <button type="reset" class="btn mr-2 personal_info_note" data-toggle="tooltip" id="personal_info_note" title="Please save the changes before you leave this section, other wise changes will be lost." id="save_button_id"><i class="fas fa-comment-dots ml-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <!--end::Header-->

                                    <!--begin::Form-->
                                    <form class="form">
                                        <!--begin::Body-->
                                        <div class="card-body">
                                            <div class="row">
                                                <label class="col-xl-3"></label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <h5 class="font-weight-bold mb-6">Customer Info</h5>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Avatar</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <div class="image-input image-input-outline" id="kt_profile_avatar"
                                                         style="background-image: url('<?php if (isset($getProfileData['data']->user->profile_picture)) {
                                                             echo SquareProfilePicAppend($getProfileData['data']->user->profile_picture);
                                                         }?>')">
                                                        <div class="image-input-wrapper"></div>
                                                        <input type="hidden" value="" id="profile_pic">
                                                        <label
                                                            class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow upload-button changeAvatarClass"
                                                            data-action="change" data-toggle="tooltip" title=""
                                                            data-original-title="Change avatar">
                                                            <i class="fas fa-pen icon-sm "></i>
                                                            <input type="file" id="profile_avatar" name="profile_avatar"
                                                                   class="file-upload " accept=".png, .jpg, .jpeg"/>
                                                            <input type="hidden"  name="profile_avatar_remove"/>
                                                        </label>

                                                        <span
                                                                class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
                                                                data-action="cancel" data-toggle="tooltip"
                                                                title="Cancel avatar">
                                                                            <i class="ki ki-bold-close icon-xs "></i>
                                                                        </span>

                                                        <span onclick="removeAvatar();"
                                                              class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
                                                              data-action="remove" data-toggle="tooltip"
                                                              title="Remove avatar">
                                                                            <i class="ki ki-bold-close icon-xs profile_avatar_remove "></i>
                                                                        </span>
                                                    </div>
                                                    <span class="form-text ">Allowed file types:  png, jpg, jpeg.</span>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">First Name</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <input class="form-control form-control-lg form-control-solid"
                                                           type="text"
                                                           value="<?php if (isset($getProfileData['data']->user->first_name) && ($getProfileData['data']->user->first_name != "nil")) {
                                                               echo $getProfileData['data']->user->first_name;
                                                           } else echo ''?>" id="first_name_id"/>
                                                    <div class="error text-danger" id="first_name_Error1"></div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Last Name</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <input class="form-control form-control-lg form-control-solid"
                                                           type="text"
                                                           value="<?php if (isset($getProfileData['data']->user->last_name) && ($getProfileData['data']->user->last_name != "nil")) {
                                                               echo $getProfileData['data']->user->last_name;
                                                           } else echo ''?>" id="last_name_id"/>
                                                    <div class="error text-danger" id="last_name_Error1"></div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Company Name</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <input class="form-control form-control-lg form-control-solid"
                                                           type="text"
                                                           value="<?php if (isset($getProfileData['data']->user->working_at) && ($getProfileData['data']->user->working_at != "nil")) {
                                                               echo $getProfileData['data']->user->working_at;
                                                           } else echo ''?>" id="company_name_id"/>
                                                    <div class="error text-danger" id="company_Error1"></div>
                                                    <span class="form-text "></span>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Location</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <input class="form-control form-control-lg form-control-solid"
                                                           type="text"
                                                           value="<?php if (isset($getProfileData['data']->user->address) && ($getProfileData['data']->user->address != "nil")) {
                                                               echo $getProfileData['data']->user->address;
                                                           } else echo ''?>" id="location_name_id"/>
                                                    <div class="error text-danger" id="location_Error1"></div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <label class="col-xl-3"></label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <h5 class="font-weight-bold mt-10 mb-6">Contact Information</h5>
                                                </div>
                                            </div>

                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Contact Phone</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <div class="input-group input-group-lg input-group-solid">
                                                        <input id="phone_number_id" type="tel"
                                                               class="form-control form-control-lg form-control-solid text-white"
                                                               placeholder="Phone"
                                                               value="<?php if (isset($getProfileData['data']->user->phone_no) && ($getProfileData['data']->user->phone_no != "nil")) {
                                                                   echo $getProfileData['data']->user->phone_no;
                                                               } else echo ''?>"
                                                               style="width:475px; background-color: #3a3b3c"
                                                               onkeypress="return numbersOnly(event);"/>
                                                        <div class="error text-danger" id="phone_number_Error1"></div>
                                                    </div>
                                                    <span id="valid-msg" class="text-success hide">✓ Valid</span>
                                                    <span id="error-msg" class="text-danger hide"></span>
                                                </div>
                                            </div>

                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Email Address</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <div class="form-group">
                                                        <div class="input-icon">
                                                            <input type="text"
                                                                   class="form-control form-control-lg form-control-solid font-size-h6"
                                                                   name="emailid" autocomplete="off"
                                                                   value="<?php if (isset($getProfileData['data']->user->email) && ($getProfileData['data']->user->email != "nil")) {
                                                                       echo $getProfileData['data']->user->email;
                                                                   } else echo ''?>" id="email_address_id"
                                                                   placeholder="Email" disabled/>
                                                            <span><i class="far fa-envelope-open"></i></span>
                                                        </div>
                                                    </div>
                                                    <span class="form-text ">We'll never share your email with anyone else.</span>
                                                </div>
                                            </div>
                                        </div>
                                        <!--end::Body-->
                                    </form>
                                    <!--end::Form-->
                                </div>
                                <!-- end::Card -->
                            </div>
                            <div class="tab-pane fade" id="account-info" role="tabpanel"
                                 aria-labelledby="account-info-tab">
                                <!--begin::Card-->
                                <div class="card card-custom">
                                    <!--begin::Header-->
                                    <div class="card-header py-3">
                                        <div class="card-title align-items-start flex-column">
                                            <h3 class="card-label font-weight-bolder">Account Information</h3>
                                            <span class="text-muted font-weight-bold font-size-sm mt-1">You can update account details</span>
                                        </div>
                                        <div class="card-toolbar">
                                            <button type="reset" class="btn mr-2" id="account_information_save_id"
                                                    onclick="updateProfileData(2)">Save
                                                Changes
                                            </button>
                                            <button type="reset" class="btn mr-2" data-toggle="tooltip"
                                                    id="account_info_note"
                                                    title="Please save the changes before you leave this section, other wise changes will be lost."
                                                    id="save_button_id"><i class="fas fa-comment-dots ml-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <!--end::Header-->
                                    <!--begin::Form-->
                                    <form class="form">
                                        <div class="card-body">
                                            <!--begin::Heading-->
                                            <div class="row">
                                                <label class="col-xl-3"></label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <h5 class="font-weight-bold mb-6">Account:</h5>
                                                </div>
                                            </div>
                                            <!--begin::Form Group-->
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Username</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <input class="form-control form-control-lg form-control-solid"
                                                           type="text"
                                                           value="<?php if (isset($getProfileData['data']->user->user_name) && ($getProfileData['data']->user->user_name != "nil")) {
                                                               echo $getProfileData['data']->user->user_name;
                                                           } else echo ''?>" id="user_name_id"
                                                           onkeyup="usernameUpdate();"/>
                                                    <div class="error text-danger" id="user_name_Error"></div>
                                                    <div class="error text-success" id="user_name_success"></div>
                                                    <div class="error text-danger" id="user_name_Error1"></div>
                                                    {{--                                                    </div>--}}
                                                </div>
                                            </div>

                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Email Address</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <div class="form-group">
                                                        <div class="input-icon">
                                                            <input type="text"
                                                                   class="form-control form-control-lg form-control-solid font-size-h6"
                                                                   name="emailids" autocomplete="off"
                                                                   value="<?php if (isset($getProfileData['data']->user->email) && ($getProfileData['data']->user->email != "nil")) {
                                                                       echo $getProfileData['data']->user->email;
                                                                   } else echo ''?>" placeholder="Email"
                                                                   id="email2_name_id" disabled/>
                                                            <span><i class="far fa-envelope-open"></i></span>
                                                        </div>
                                                    </div>
                                                    <div style="display: none;">
                                                        <input type="hidden"
                                                               value="{{json_encode($getProfileData['data']->user->language) }}"
                                                               id="languageData">
                                                        <input type="hidden"
                                                               value="{{json_encode($getProfileData['data']->user->time_zone) }}"
                                                               id="timeZoneData">
                                                        <input type="hidden"
                                                               value="{{json_encode($getProfileData['data']->user->country) }}"
                                                               id="phoneCode">
                                                    </div>
                                                    <span class="form-text text-muted">Email will not be publicly displayed. <a
                                                                {{--                                                            href="#" class="kt-link">Learn more</a>.</span>--}}
                                                                href="#" class="kt-link"></a></span>
                                                </div>
                                            </div>

                                            <!--begin::Form Group-->
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Language</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <select class="form-control form-control-lg form-control-solid"
                                                            id="languages_id">
                                                    </select>
                                                    <div class="error text-danger" id="language_Error1"></div>
                                                </div>
                                            </div>
                                            <!--begin::Form Group-->
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Time Zone</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <select class="form-control form-control-lg form-control-solid"
                                                            id="timezone_id">

                                                    </select>
                                                    <div class="error text-danger" id="timezone_Error1"></div>
                                                </div>
                                            </div>

                                        {{--                                            up coming feature--}}
                                        <!--begin::Form Group-->
                                        {{--                                            <div class="form-group row align-items-center">--}}
                                        {{--                                                <label class="col-xl-3 col-lg-3 col-form-label">Communication</label>--}}
                                        {{--                                                <div class="col-lg-9 col-xl-6">--}}
                                        {{--                                                    <div class="checkbox-inline">--}}
                                        {{--                                                        <label class="checkbox">--}}
                                        {{--                                                            <input type="checkbox" checked="" />--}}
                                        {{--                                                            <span></span>--}}
                                        {{--                                                            Email--}}
                                        {{--                                                        </label>--}}
                                        {{--                                                        <label class="checkbox">--}}
                                        {{--                                                            <input type="checkbox" checked="" />--}}
                                        {{--                                                            <span></span>--}}
                                        {{--                                                            SMS--}}
                                        {{--                                                        </label>--}}
                                        {{--                                                        <label class="checkbox">--}}
                                        {{--                                                            <input type="checkbox" />--}}
                                        {{--                                                            <span></span>--}}
                                        {{--                                                            Phone--}}
                                        {{--                                                        </label>--}}
                                        {{--                                                    </div>--}}
                                        {{--                                                </div>--}}
                                        {{--                                            </div>--}}
                                        {{--                                            <!--begin::Form Group-->--}}
                                        {{--                                            <div class="separator separator-dashed my-5"></div>--}}
                                        {{--                                            <!--begin::Form Group-->--}}
                                        {{--                                            <div class="row">--}}
                                        {{--                                                <label class="col-xl-3"></label>--}}
                                        {{--                                                <div class="col-lg-9 col-xl-6">--}}
                                        {{--                                                    <h5 class="font-weight-bold mb-6">Security:</h5>--}}
                                        {{--                                                </div>--}}
                                        {{--                                            </div>--}}
                                        {{--                                            <!--begin::Form Group-->--}}
                                        {{--                                            <div class="form-group row">--}}
                                        {{--                                                <label class="col-xl-3 col-lg-3 col-form-label">Login verification</label>--}}
                                        {{--                                                <div class="col-lg-9 col-xl-6">--}}
                                        {{--                                                    <button type="button" class="btn btn-light-primary font-weight-bold btn-sm">Setup login verification</button>--}}
                                        {{--                                                    <p class="form-text text-muted pt-2">--}}
                                        {{--                                                        After you log in, you will be asked for additional information to confirm your identity and protect your account from being compromised.--}}
                                        {{--                                                        <a href="#" class="font-weight-bold">Learn more</a>.--}}
                                        {{--                                                    </p>--}}
                                        {{--                                                </div>--}}
                                        {{--                                            </div>--}}
                                        <!--begin::Form Group-->
                                            <div class="form-group row">
                                                {{--                                                <label class="col-xl-3 col-lg-3 col-form-label">Password reset verification</label>--}}
                                                <div class="col-lg-9 col-xl-6">
                                                    <div class="checkbox-inline">
                                                        {{--                                                        <label class="checkbox m-0">--}}
                                                        {{--                                                            <input type="checkbox" />--}}
                                                        {{--                                                            <span></span>--}}
                                                        {{--                                                            Require personal information to reset your password.--}}
                                                        {{--                                                        </label>--}}
                                                    </div>
                                                    <p class="form-text text-muted py-2">
                                                        {{--                                                        For extra security, this requires you to confirm your email or phone number when you reset your password.--}}
                                                        {{--                                                        <a href="#" class="font-weight-boldk">Learn more</a>.--}}
                                                    </p>
                                                    <button type="button"
                                                            class="btn btn-light-warning font-weight-bold btn-sm mr-5"
                                                            data-toggle="modal" data-target="#accountHoldModal">Holding
                                                        your account ?
                                                    </button>

                                                    <button type="button"
                                                            class="btn btn-light-danger font-weight-bold btn-sm mr-5"
                                                            data-toggle="modal" data-target="#accountDeleteModal">
                                                        Delete your account ?
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <!--end::Form-->
                                </div>
                                <!--end::Card-->
                            </div>
                            <div class="tab-pane fade" id="change-passwd" role="tabpanel"
                                 aria-labelledby="change-passwd-tab">
                                <!--begin::Card-->
                                <div class="card card-custom">
                                    <!--begin::Header-->
                                    <div class="card-header py-3">
                                        <div class="card-title align-items-start flex-column">
                                            <h3 class="card-label font-weight-bolder">Change Password</h3>
                                            <span class="font-weight-bold font-size-sm mt-1">Change your account password</span>
                                        </div>
                                        <div class="card-toolbar">
                                            <button type="reset" class="btn mr-2" onclick="changePassword()">Save
                                                Changes
                                            </button>
                                            <button type="reset" class="btn" onclick="cancelPasswordChanges()">Cancel
                                            </button>
                                        </div>
                                    </div>
                                    <!--end::Header-->

                                    <!--begin::Form-->
                                    <form class="form" id="reset_password_form_id">
                                        @csrf
                                        <div class="card-body">
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label text-alert">Current
                                                    Password</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <div class="input-icon input-icon-right" id="current_password_eye">
                                                        <input type="password"
                                                               class="form-control form-control-lg form-control-solid mb-2"
                                                               id="cuurent_password_ids" value=""
                                                               placeholder="Current password"/>
                                                        <span><a href="javascript:;"
                                                                 onclick="currentPasswordHideShow();"><i
                                                                        class="fas fa-eye-slash toggle-password"></i></a></span>
                                                    </div>
                                                    <div class="error text-danger"
                                                         id="current_password_Error"></div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label text-alert">New
                                                    Password</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <div class="input-icon input-icon-right" id="new_password_eye">
                                                        <input type="password"
                                                               class="form-control form-control-solid font-size-h6"
                                                               value="" id="new_password_ids"
                                                               placeholder="New password"/>
                                                        <span><a href="javascript:;" onclick="newPasswordHideShow();"><i
                                                                        class="fas fa-eye-slash toggle-password"></i></a></span>
                                                    </div>
                                                    <div class="error text-danger" id="new_password_Error"></div>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label text-alert">Verify
                                                    Password</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <div class="input-icon input-icon-right" id="confirm_password_eye">
                                                        <input type="password"
                                                               class="form-control form-control-solid font-size-h6"
                                                               value="" id="conform_password_ids"
                                                               placeholder="Verify password"/>
                                                        <span><a href="javascript:;"
                                                                 onclick="conformPasswordHideShow();"><i
                                                                        class="fas fa-eye-slash toggle-password"></i></a></span>
                                                    </div>
                                                    <div class="error text-danger"
                                                         id="conform_password_Error"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <!--end::Form-->
                                </div>
                                <!-- end::Card -->
                            </div>
                            <div class="tab-pane fade" id="email-settings" role="tabpanel"
                                 aria-labelledby="email-settings-tab">
                                <!--begin::Card-->
                                <div class="card card-custom">
                                    <!--begin::Header-->
                                    <div class="card-header py-3">
                                        <div class="card-title align-items-start flex-column">
                                            <h3 class="card-label font-weight-bolder">Email Settings</h3>
                                            <span
                                                    class="font-weight-bold font-size-sm mt-1">Change your email settings</span>
                                        </div>
                                        <div class="card-toolbar">
                                            <button type="reset" class="btn mr-2">Save Changes</button>
                                            <button type="reset" class="btn">Cancel</button>
                                        </div>
                                    </div>
                                    <!--end::Header-->

                                    <!--begin::Form-->
                                    <form class="form">
                                        <div class="card-body">
                                            <div class="row">
                                                <label class="col-xl-3"></label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <h5 class="font-weight-bold mb-6">Setup Email Notification:</h5>
                                                </div>
                                            </div>
                                            <div class="form-group row align-items-center">
                                                <label
                                                        class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left  text-lg-right">Email
                                                    Notification</label>
                                                <div class="col-lg-9 col-xl-6">
                                                                    <span class="switch switch-sm">
                                                                        <label>
                                                                            <input type="checkbox" checked="checked"
                                                                                   name="email_notification_1"/>
                                                                            <span></span>
                                                                        </label>
                                                                    </span>
                                                </div>
                                            </div>
                                            <div class="form-group row align-items-center">
                                                <label
                                                        class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left  text-lg-right">Send
                                                    Copy To Personal Email</label>
                                                <div class="col-lg-9 col-xl-6">
                                                                    <span class="switch switch-sm">
                                                                        <label>
                                                                            <input type="checkbox"
                                                                                   name="email_notification_2"/>
                                                                            <span></span>
                                                                        </label>
                                                                    </span>
                                                </div>
                                            </div>

                                            <div class="separator separator-dashed my-10"></div>

                                            <div class="row">
                                                <label class="col-xl-3"></label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <h5 class="font-weight-bold mb-6">Activity Related Emails:</h5>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label
                                                        class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left pt-0 text-lg-right">When
                                                    To Email</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <div class="checkbox-list">
                                                        <label class="checkbox">
                                                            <input type="checkbox"/>
                                                            <span></span>
                                                            Daily Team Report Summary
                                                        </label>
                                                        <label class="checkbox">
                                                            <input type="checkbox"/>
                                                            <span></span>
                                                            Weekly Team Report Summary
                                                        </label>
                                                        <label class="checkbox">
                                                            <input type="checkbox"/>
                                                            <span></span>
                                                            15 Days Team Report Summary
                                                        </label>
                                                        <label class="checkbox">
                                                            <input type="checkbox" checked="checked"/>
                                                            <span></span>
                                                            Monthly Team Report Summary
                                                        </label>
                                                        <label class="checkbox checkbox-primary">
                                                            <input type="checkbox"/>
                                                            <span></span>
                                                            60 Days Team Report Summary
                                                        </label>
                                                        <label class="checkbox checkbox-primary">
                                                            <input type="checkbox"/>
                                                            <span></span>
                                                            90 Days Team Report Summary
                                                        </label>
                                                        <label class="checkbox checkbox-primary">
                                                            <input type="checkbox" checked="checked"/>
                                                            <span></span>
                                                            Other Newsletters
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="separator separator-dashed my-10"></div>

                                            <div class="row">
                                                <label class="col-xl-3"></label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <h5 class="font-weight-bold mb-6">Schedule message update
                                                        notification:</h5>
                                                </div>
                                            </div>
                                            <div class="form-group row">
                                                <label
                                                        class="col-xl-3 col-lg-3 col-form-label font-weight-bold text-left pt-0 text-lg-right">Email
                                                    You With</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <div class="checkbox-list">
                                                        <label class="checkbox">
                                                            <input type="checkbox"/>
                                                            <span></span>
                                                            Updates for success of schedule messages
                                                        </label>
                                                        <label class="checkbox">
                                                            <input type="checkbox"/>
                                                            <span></span>
                                                            Updates for failure of schedule messages
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                    <!--end::Form-->
                                </div>
                                <!-- end::Card -->
                            </div>
                        </div>

                    </div>
                    <!--end::Content-->
                </div>
                <!--end::Profile-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->
    <!-- begin::Delete account modal-->
    <div class="modal fade" id="accountDeleteModal" tabindex="-1" role="dialog"
         aria-labelledby="accountDeleteModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="accountDeleteModalLabel">Delete Account</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="text-center">
                        <img src="media/svg/icons/Communication/Delete-user.svg"/><br>
                        <span
                                class="font-weight-bolder font-size-h4 "> Are you sure wanna delete this account? </span><br>
                        <span class="font-weight-bolder font-size-h4 "> If your account is deleted, you will not be able to log in to it! </span>
                    </div>
                    <div class="d-flex justify-content-center">
                        <a href="javascript:;" type="button"
                           class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                           data-dismiss="modal" id="account-delete" onclick="deletingAccount()">Delete it!!</a>
                        <a href="javascript:;" type="button"
                           class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No
                            thanks.</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end::Delete account modal-->

    <!-- begin::Holding account modal-->
    <div class="modal fade" id="accountHoldModal" tabindex="-1" role="dialog" aria-labelledby="accountHoldModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="accountHoldModalLabel">Hold Account</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="text-center">
                        <img src="media/svg/icons/Communication/Delete-user.svg"/><br>
                        <span class="font-weight-bolder font-size-h4 "> Are you sure wanna hold this account? </span><br>
                        <span class="font-weight-bolder font-size-h4 "> All your activities will be on hold! </span>
                    </div>
                    <div class="d-flex justify-content-center">
                        <a href="javascript:;" type="button"
                           class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                           data-dismiss="modal" id="account-hold" onclick="holdingAccount()">Hold it!!</a>
                        <a href="javascript:;" type="button"
                           class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3" data-dismiss="modal">No
                            thanks.</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end::Delete account modal-->

@endsection

<!--begin::Global Theme Bundle(used by all pages)-->

@section('scripts')

    <script src="../js/all_timezone.js"></script>
    <script src="../js/all_languages.js"></script>
    <script src="../js/IncJsFiles/profile_update.js"></script>
    <!--end::Global Theme Bundle-->
@endsection
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
<script src="../plugins/custom/intl-tel-input/build/js/intlTelInput.js"></script>

<script>
    <?php
    function SquareProfilePicAppend($pic)
    {
        if (file_exists(public_path($pic))) {
            return env('APP_URL') . $pic;
        } else {
            if (filter_var($pic, FILTER_VALIDATE_URL) === FALSE) {
                return env('APP_URL') . "media/svg/avatars/001-boy.svg";
            } else {
                return $pic;
            }
        }
    }
    ?>

    function getKeyByValue(object, value) {
        return Object.keys(object).find(key => object[key] === value);
    }

    let APP_URL = '<?php echo env('APP_URL'); ?>';
    let API_URL = '<?php echo env('API_URL'); ?>';
    let API_VERSION = '<?php echo env('API_VERSION'); ?>';


    $(document).ready(function () {
        $('#personal_info_note,#account_info_note').tooltip();
        $("#home_tab").trigger('click');
        let PHONE_CODE = (JSON.parse($("#phoneCode").val()) != "nil") ? JSON.parse($("#phoneCode").val()) : "in";
        let phone_country_code = 'in';
        if (PHONE_CODE.length === 2) {
            phone_country_code = PHONE_CODE;
        } else {
            phone_country_code = getKeyByValue(countries, PHONE_CODE);
        }
        let readURL = function (input) {
            if (input.files && input.files[0]) {
                let reader = new FileReader();
                reader.onload = function (e) {
                    $('#kt_profile_avatar').css('background-image', 'url(' + e.target.result + ')');
                    $('#profile_pic').val(e.target.result);
                };
                reader.readAsDataURL(input.files[0]);
            }
        };
        $(".file-upload").on('change', function () {
            readURL(this);
        });
        $(".upload-button").on('change', function () {
            $(".file-upload").click();
        });
        $('#valid-msg').hide();
        var input = document.querySelector("#phone_number_id"),
            errorMsg = document.querySelector("#error-msg"),
            validMsg = document.querySelector("#valid-msg");
//  here, the index maps to the error code returned from getValidationError - see readme
        var errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];

//  initialise plugin
        var iti = window.intlTelInput(input, {
            utilsScript: "../plugins/custom/intl-tel-input/build/js/utils.js?1613236686837",
            initialCountry: phone_country_code,
        });
        // window.intlTelInput(tel,{initialCountry: PHONE_CODE});
        var reset = function () {
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
                    $('#valid-msg').show();
                    $('#save_button_id').attr("disabled", false);
                } else {
                    input.classList.add("error");
                    var errorCode = iti.getValidationError();
                    errorMsg.innerHTML = errorMap[errorCode];
                    errorMsg.classList.remove("hide");
                    $('#valid-msg').hide();
                    $('#save_button_id').attr("disabled", true);
                }
            }
        });

// on keyup / change flag: reset
        input.addEventListener('change', reset);
        input.addEventListener('keyup', reset);
    });

    <!-- begin:password show toggle -->
    function currentPasswordHideShow() {
        event.preventDefault();
        // $('#' + enableStorage).show();
        if ($('#current_password_eye input').attr("type") == "text") {
            $('#current_password_eye input').attr('type', 'password');
            $('#current_password_eye i').addClass("fa-eye-slash");
            $('#current_password_eye i').removeClass("fa-eye");
        } else if ($('#current_password_eye input').attr("type") == "password") {
            $('#current_password_eye input').attr('type', 'text');
            $('#current_password_eye i').removeClass("fa-eye-slash");
            $('#current_password_eye i').addClass("fa-eye");
        }
    }

    // New Passwd
    function newPasswordHideShow() {
        event.preventDefault();
        if ($('#new_password_eye input').attr("type") == "text") {
            $('#new_password_eye input').attr('type', 'password');
            $('#new_password_eye i').addClass("fa-eye-slash");
            $('#new_password_eye i').removeClass("fa-eye");
        } else if ($('#new_password_eye input').attr("type") == "password") {
            $('#new_password_eye input').attr('type', 'text');
            $('#new_password_eye i').removeClass("fa-eye-slash");
            $('#new_password_eye i').addClass("fa-eye");
        }
    };

    // Confirm new passwd
    function conformPasswordHideShow() {
        event.preventDefault();
        if ($('#confirm_password_eye input').attr("type") == "text") {
            $('#confirm_password_eye input').attr('type', 'password');
            $('#confirm_password_eye i').addClass("fa-eye-slash");
            $('#confirm_password_eye i').removeClass("fa-eye");
        } else if ($('#confirm_password_eye input').attr("type") == "password") {
            $('#confirm_password_eye input').attr('type', 'text');
            $('#confirm_password_eye i').removeClass("fa-eye-slash");
            $('#confirm_password_eye i').addClass("fa-eye");
        }
    };
</script>
