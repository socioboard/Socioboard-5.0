@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Reports Settings</title>
@endsection
@section('content')
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Profile-->
                <div class="row" data-sticky-container>
                    <!--begin::Aside-->
                    <div class="col-md-4" id="kt_profile_aside">
                        <div class="sticky" data-sticky="true" data-margin-top="160px" data-sticky-for="1023"
                             data-sticky-class="kt-sticky">
                            <!--begin::Profile Card-->
                            <div class="card card-custom card-stretch">
                                <!--begin::Body-->
                                <div class="card-body pt-4">
                                    <!--begin::User-->
                                    @if($userDetails->code === 200)
                                        <div class="d-flex align-items-center">
                                            <div class="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center">
                                                <div class="symbol-label"
                                                     style="background-image:url('<?php if (isset($userDetails->data->user->profile_picture)) {
                                                         echo userProfilePicAppend($userDetails->data->user->profile_picture);
                                                     }?>')"></div>
                                                <i class="symbol-badge bg-success"></i>
                                            </div>
                                            <div>
                                                <a href="#" class="font-weight-bolder font-size-h5 text-hover-primary">
                                                    {{$userDetails->data->user->first_name}}{{$userDetails->data->user->last_name}}
                                                </a>
                                            </div>
                                        </div>
                                        <!--end::User-->
                                        <!--begin::Contact-->
                                        <div class="py-9">
                                            <div class="d-flex align-items-center justify-content-between mb-2">
                                                <span class="font-weight-bold mr-2">Email:</span>
                                                <div
                                                   >{{$userDetails->data->user->email}}</div>
                                            </div>
                                            <div class="d-flex align-items-center justify-content-between mb-2">
                                                <span class="font-weight-bold mr-2">Phone:</span>
                                                <span class="">{{$userDetails->data->user->phone_no}}</span>
                                            </div>
                                        </div>
                                        <!--end::Contact-->
                                    @elseif($userDetails->code === 400)
                                        <div class="text-center">
                                            <div class="symbol symbol-150">
                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                            </div>
                                            <h6>{{$userDetails->error}}</h6>
                                        </div>
                                    @else
                                        <div class="text-center">
                                            <div class="symbol symbol-150">
                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                            </div>
                                            <h6>Some thing went wrong , can not get User details</h6>
                                        </div>
                                    @endif
                                </div>
                                <!--end::Body-->
                            </div>
                            <!--end::Profile Card-->
                        </div>
                    </div>
                    <!--end::Aside-->
                    <!--begin::Content-->
                    <div class="col-md-8">

                        <div class="tab-content" id="myTabContent1">
                            <div class="tab-pane fade show active" id="personal-info" role="tabpanel"
                                 aria-labelledby="personal-info-tab">
                                <!--begin::Card-->
                                <div class="card card-custom card-stretch">
                                    <!--begin::Header-->
                                    <div class="card-header py-3">
                                        <div class="card-title align-items-start flex-column">
                                            <h3 class="card-label font-weight-bolder">Report Setting</h3>
                                            <span class="font-weight-bold font-size-sm mt-1">Update your report settings (These will be your custom report PDF Logo and Brand Name)</span>
                                        </div>
                                        <div class="card-toolbar">
                                            <button type="reset" class="btn mr-2"
                                                    onclick="updateReportsSettings()">
                                                Save
                                                Changes
                                            </button>
                                            <button type="reset" class="btn mr-2" data-toggle="tooltip"
                                                    id="personal_info_note"
                                                    title="Please save the changes before you leave this section, other wise changes will be lost."
                                                    id="save_button_id"><i class="fas fa-comment-dots ml-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <!--end::Header-->

                                    <!--begin::Form-->
                                    <form class="form">
                                        <!--begin::Body-->
                                        <div class="card-body">
                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Company Name</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <input class="form-control form-control-lg form-control-solid"
                                                           type="text" id="companyName" onkeyup="checkKeyUp()"
                                                           value="{{$userDetails->data->user->company_name}}"/>
                                                </div>
                                            </div>

                                            <div class="form-group row">
                                                <label class="col-xl-3 col-lg-3 col-form-label">Company Logo</label>
                                                <div class="col-lg-9 col-xl-6">
                                                    <div class="image-input image-input-outline" id="kt_profile_avatar"
                                                         style="background-image: url('<?php if (isset($userDetails->data->user->company_logo)) {
                                                             echo SquareProfilePicAppend($userDetails->data->user->company_logo);
                                                         }?>')">
                                                        <div class="image-input-wrapper"></div>
                                                        <input type="hidden" value="" id="profile_pic">
                                                        <label class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow upload-button"
                                                               data-action="change" data-toggle="tooltip"
                                                               id="change_Logo"
                                                               title="Change Logo"
                                                        >
                                                            <i class="fas fa-pen icon-sm"></i>
                                                            <input type="file" name="profile_avatar" id="profile_avatar"
                                                                   class="file-upload" accept=".png, .jpg, .jpeg"/>
                                                            <input type="hidden" name="profile_avatar_remove"/>
                                                        </label>

                                                        <span onclick="removeLogo();"
                                                              class="btn btn-xs btn-icon btn-circle btn-white btn-hover-text-primary btn-shadow"
                                                              data-action="remove" data-toggle="tooltip"
                                                              id="remove_Logo"
                                                              title="Remove logo">
                                                                            <i class="ki ki-bold-close icon-xs "></i>
                                                                        </span>
                                                    </div>
                                                    <span class="form-text ">Allowed file types:  png, jpg, jpeg.</span>
                                                </div>
                                            </div>
                                        </div>
                                        <!--end::Body-->
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
@endsection
@section('scripts')
    <script src="/plugins/custom/intl-tel-input/build/js/intlTelInput.js"></script>
    <!--end::Global Theme Bundle-->
    <script>

        var input = document.querySelector("#phone"),
            errorMsg = document.querySelector("#error-msg"),
            validMsg = document.querySelector("#valid-msg");

        // here, the index maps to the error code returned from getValidationError - see readme
        var errorMap = ["Invalid number", "Invalid country code", "Too short", "Too long", "Invalid number"];

        // initialise plugin
        var iti = window.intlTelInput(input, {
            utilsScript: "../../build/js/utils.js?1613236686837"
        });

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

        // Authentication radio div hide show
        $(document).ready(function () {
            $('input[type="radio"]').click(function () {
                var inputValue = $(this).attr("value");
                var targetBox = $("." + inputValue);
                $(".box").not(targetBox).hide();
                $(targetBox).show();
            });
        });
    </script>


    <!-- begin:password show toggle -->
    <script>
        let logoclicked = 'false';
        $(document).ready(function () {
            $('#personal_info_note, #change_Logo, #remove_Logo').tooltip();
            $("#change_Logo").click(function () {
                logoclicked = 'true';
            });

            /**
             * TODO we've to update  the company logo on clicking on add logo  button.
             * This function is used for changing the logo of function and show on front end.
             * ! Do not change this function without referring UI.
             */
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

            // current passwd
            $("#home_tab").trigger("click");

        });

        var checkKeyUpValue = false;

        function checkKeyUp() {
            checkKeyUpValue = true;
        }

        let remove_avatar_value = 0;

        /**
         * TODO we've to remove  the company logo on clicking on remove logo  button.
         * This function is used for removing the logo of company and show on front end.
         * ! Do not change this function without referring UI.
         */
        function removeLogo() {
            remove_avatar_value = 1;
            $('#kt_profile_avatar').css('background-image', 'url(media/logos/sb-icon.svg)');
        }

        /**
         * TODO we've to update   the company reports settings on clicking on save changes  button.
         * This function is used for changing the company logo and company name on clicking on save changes button.
         * ! Do not change this function without referring UI and API for passing reports logo and name and update those.
         */
        function updateReportsSettings() {
            if (checkKeyUpValue === false) {
                if (logoclicked === 'false') {
                    toastr.error('No changes detected , please edit and save changes');
                } else {
                    updateSettingsReports();
                }

            } else {
                updateSettingsReports();
            }
        }

        function updateSettingsReports() {
            let file_data = $('#profile_avatar').prop('files')[0];
            let company_name = $('#companyName').val();
            let form_data = new FormData();
            let format = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
            if (company_name === '') {
                toastr.error('Company Name can not be empty');
            } else {
                if (format.test(company_name)) {
                    toastr.error('Special characters are not allowed for company name,only alphanumeric characters allowed.');

                } else {
                    if (company_name.length >= 3 && company_name.length <= 20) {
                        form_data.append('file', file_data);
                        form_data.append('companyName', company_name);
                        form_data.append('remove_avatar_value', remove_avatar_value);
                        $.ajax({
                            type: "post",
                            url: "/update-reports-settings",
                            headers: {
                                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                            },
                            data: form_data,
                            enctype: 'multipart/form-data',
                            cache: false,
                            contentType: false,
                            processData: false,
                            beforeSend: function () {
                            },
                            success: function (response) {
                                remove_avatar_value = 0;
                                if (response.code === 200) {
                                    toastr.success('Successfully Updated');

                                } else if (response.code === 400) {
                                    toastr.error(response.error);
                                } else {
                                    toastr.error('Some error occured, can not update settings of Reports');
                                }
                            }
                        });
                    } else {
                        toastr.error('Minimum 3 characters are allowed,and Maximun 20 charcters are allowed');
                    }
                }
            }
        }

        /**
         * TODO we've to show the updated company logo onload of the page.
         * This function is used for showing the updated logo of comapny logo on front end.
         * ! Do not change this function without referring UI and directory structure.
         */
        <?php
        function SquareProfilePicAppend($pic)
        {
            if (file_exists(public_path($pic))) {
                return env('APP_URL') . $pic;
            } else {
                if (filter_var($pic, FILTER_VALIDATE_URL) === FALSE) {
                    return env('APP_URL') . "media/logos/sb-icon.svg";
                } else {
                    return $pic;
                }
            }
        }
        ?>
        <?php
        function userProfilePicAppend($pic)
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
    </script>
@endsection
