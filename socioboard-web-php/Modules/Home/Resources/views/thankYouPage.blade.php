<!DOCTYPE html>
<html lang="en">
<!--begin::Head-->
<head>
    <base href="../">
    <meta charset="utf-8"/>
    <title>SocioBoard - Thankyou</title>
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>

    <meta name="google-site-verification" content=""/>
    <meta name="description"
          content="Be it marketing(finding leads/customers) on Social media, or listening to customer complaints, replying to them, managing multiple social media accounts from one single dashboard, finding influencers in a particular category and reaching out to them and many more things, Socioboard products can do it."/>
    <meta name="keywords"
          content="Social Media Management Software, Social Media Management tool, Open Source Social Media Management, Social Media Management"/>
    <meta name="author" content="Socioboard Technologies">
    <meta name="designer" content="Chanchal Santra">
    <meta name="csrf-token" content="{{ csrf_token() }}"/>
    <!--begin::Fonts-->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700"/>
    <!--end::Fonts-->

    <!--begin::Page Vendors Styles(used by this page)-->
    <link href="/plugins/custom/fullcalendar/fullcalendar.bundle.css" rel="stylesheet" type="text/css"/>
    <!--end::Page Vendors Styles-->


    <!--begin::Global Theme Styles(used by all pages)-->
    <link href="/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css"/>
    <link href="/plugins/custom/prismjs/prismjs.bundle.css" rel="stylesheet" type="text/css"/>
    <link href="/css/style.css" rel="stylesheet" type="text/css"/>
    <link href="/css/dark.css" rel="stylesheet" type="text/css" id="theme-link"/>
    <!--end::Global Theme Styles-->

    <!--begin::Layout Themes(used by all pages)-->

    <!--end::Layout Themes-->

    <link rel="shortcut icon" href="/media/logos/favicon.ico"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@10"></script>

</head>
<!--end::Head-->

<!--begin::Body-->
<body>
<div class="d-flex justify-content-center mt-5">
    <div class="theme-switch-wrapper mt-3 mr-5 text-center">
        <span class="opacity-50 font-weight-bold font-size-sm text-center d-none d-md-inline mt-4">Switch Theme</span>
        <span class="switch switch-outline switch-icon switch-dark switch-sm text-center">
                    <span><i class="fas fa-sun fa-fw text-warning mt-1"></i></span>
                    <label class="theme-switch" for="checkbox">
                        <input type="checkbox" id="checkbox" name="select" onclick="switchTheme(event)">
                        <span></span>
                    </label>
                    <span><i class="fas fa-moon fa-fw text-primary mt-1"></i></span>
                </span>
    </div>
</div>

<div class="text-center my-5" id="successAddDiv" style="display: none;">
    <i class="fas fa-check-circle checkmark mt-5"></i>
    <h3 class="mt-10">Successfully Approved For Adding Account</h3>
</div>
<div class="container justify-content-end align-items-center">
    <div class="card invitation-instruction" id="thankYouDIv">
        <div class="logo">
            <!--begin::Logo-->
            <a href="index.html" class="mr-2">
                <img alt="SocioBoard" src="/media/logos/sb-icon.svg" class="mt-10">
            </a>
            <!--end::Logo-->
        </div>
        @if(isset($failed))
            <div class="text-center my-5">
                <i class="icon-lg fas fa-times-circle"></i>
                <h3 class="mt-10">{{$failed}}</h3>
            </div>
        @else
            @if(isset($instagramPageValue))
                <div class="modal fade" id="addAccountsModal" tabindex="-1"
                     role="dialog"
                     aria-labelledby="addAccountsModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-lg"
                         role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="addAccountsModalLabel">Add
                                    Accounts</h5>
                                <button type="button" class="close" data-dismiss="modal"
                                        aria-label="Close">
                                    <i aria-hidden="true" class="ki ki-close"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="">
                                    <div
                                            id="instagram-add-accounts"
                                            role="tabpanel"
                                            aria-labelledby="instagram-tab-accounts">
                                        @if($instagramPageValue === 1)
                                            <div class="mt-3 insta_page_div" style="display: none;">
                                                <span>Choose Instagram business accounts for posting</span>
                                                <div class="scroll scroll-pull" data-scroll="true"
                                                     data-wheel-propagation="true"
                                                     style="height: 200px; overflow-y: scroll;">
                                                @for($i=0; $i<count(session()->get('instaPages')); $i++)                                                                        <!--begin::Page-->
                                                    <div class="d-flex align-items-center flex-grow-1">
                                                        <!--begin::Facebook Fanpage Profile picture-->
                                                        <div class="symbol symbol-45 symbol-light mr-5">


                                                <span class="symbol-label">
                                                    <img src="{{session()->get('instaPages')[$i]['profile_pic']}}"
                                                         class="h-50 align-self-center" alt=""/>
                                                </span>
                                                        </div>
                                                        <!--end::Facebook Fanpage Profile picture-->
                                                        <!--begin::Section-->
                                                        <div
                                                                class="d-flex flex-wrap align-items-center justify-content-between w-100">
                                                            <!--begin::Info-->
                                                            <div class="d-flex flex-column align-items-cente py-2 w-75">
                                                                <!--begin::Title-->
                                                                <a href="https://www.instagram.com/{{session()->get('instaPages')[$i]['userName']}}"
                                                                   class="font-weight-bold text-hover-primary font-size-lg mb-1">
                                                                    {{session()->get('instaPages')[$i]['userName']}}
                                                                </a>
                                                                <!--end::Title-->

                                                                <!--begin::Data-->
                                                                <span class="text-muted font-weight-bold">
                                                        {{session()->get('instaPages')[$i]['fanCount']}} followers
                                                    </span>
                                                                <!--end::Data-->
                                                            </div>
                                                            <!--end::Info-->
                                                        </div>
                                                        <!--end::Section-->
                                                        <!--begin::Checkbox-->
                                                        @if(session()->get('instaPages')[$i]['isAlreadyAdded']===false)
                                                            <div
                                                                    class="custom-control custom-checkbox"
                                                                    id="checkboxes3">
                                                                <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4"
                                                                       for="{{session()->get('instaPages')[$i]['social_id']}}">
                                                                    <input type="checkbox"
                                                                           id="{{session()->get('instaPages')[$i]['social_id']}}"
                                                                           name="{{session()->get('instaPages')[$i]['userName']}}">
                                                                    <span></span>
                                                                </label>
                                                            </div>
                                                        @endif
                                                    </div>
                                                    @endfor
                                                </div>
                                                <div class="d-flex justify-content-center">
                                                    <a href="javascript:;" type="button"
                                                       id="checkedPages2"
                                                       class="btn btn-instagram font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Submit
                                                        for adding Instgram Business accounts</a>
                                                </div>

                                            </div>
                                        @endif
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                @if($instagramPageValue === 1)
                    <script type="text/javascript">
                        $(document).ready(function () {
                            setTimeout(function () {
                                $(".insta_page_div").css("display", "block");
                                $('#addAccountsModal').modal('show');
                            }, 1000);
                        });
                    </script>
                @else
                    <div class="text-center my-5">
                        <i class="icon-lg fas fa-times-circle"></i>
                        <h3 class="mt-10">{{$failed}}</h3>
                    </div>
                @endif
            @elseif(isset($linkedInPageValue))
                <div class="modal fade" id="addAccountsModal" tabindex="-1"
                     role="dialog"
                     aria-labelledby="addAccountsModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-lg"
                         role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="addAccountsModalLabel">Add
                                    Accounts</h5>
                                <button type="button" class="close" data-dismiss="modal"
                                        aria-label="Close">
                                    <i aria-hidden="true" class="ki ki-close"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="">
                                    <div
                                            id="linkedin-add-accounts"
                                            role="tabpanel"
                                            aria-labelledby="linkedin-tab-accounts">
                                        @if($linkedInPageValue === 1)
                                            <div class="mt-3 linkedIn_Pages_div"
                                                 style="display: none;">
                                                <span>Choose LinkedIN pages accounts for posting</span>
                                                <div class="scroll scroll-pull" data-scroll="true"
                                                     data-wheel-propagation="true"
                                                     style="height: 200px; overflow-y: scroll;">
                                                @for($i=0; $i<count(session()->get('linkedInPages')); $i++)                                                                        <!--begin::Page-->
                                                    <div class="d-flex align-items-center flex-grow-1">
                                                        <!--begin::Facebook Fanpage Profile picture-->
                                                        <div class="symbol symbol-45 symbol-light mr-5">


                                                <span class="symbol-label">
                                                    <img src="{{session()->get('linkedInPages')[$i]['profilePicture']}}"
                                                         class="h-50 align-self-center" alt=""/>
                                                </span>
                                                        </div>
                                                        <!--end::Facebook Fanpage Profile picture-->
                                                        <!--begin::Section-->
                                                        <div
                                                                class="d-flex flex-wrap align-items-center justify-content-between w-100">
                                                            <!--begin::Info-->
                                                            <div class="d-flex flex-column align-items-cente py-2 w-75">
                                                                <!--begin::Title-->
                                                                <a href="{{session()->get('linkedInPages')[$i]['profileUrl']}}"
                                                                   class="font-weight-bold text-hover-primary font-size-lg mb-1">
                                                                    {{session()->get('linkedInPages')[$i]['companyName']}}
                                                                </a>
                                                                <!--end::Title-->
                                                            </div>
                                                            <!--end::Info-->
                                                        </div>
                                                        <!--end::Section-->
                                                        <!--begin::Checkbox-->
                                                        @if(session()->get('linkedInPages')[$i]['isAlreadyAdded'] === false)
                                                            <div
                                                                    class="custom-control custom-checkbox"
                                                                    id="checkboxes4">
                                                                <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4"
                                                                       for="{{session()->get('linkedInPages')[$i]['companyId']}}">
                                                                    <input type="checkbox"
                                                                           id="{{session()->get('linkedInPages')[$i]['companyId']}}"
                                                                           name="{{session()->get('linkedInPages')[$i]['companyName']}}">
                                                                    <span></span>
                                                                </label>
                                                            </div>
                                                        @endif
                                                    </div>
                                                    @endfor
                                                </div>
                                                <div class="d-flex justify-content-center">
                                                    <a href="javascript:;" type="button"
                                                       id="checkedPages3"
                                                       class="btn btn-linkedin font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Submit
                                                        for adding LinkedIN pages</a>
                                                </div>

                                            </div>
                                        @endif
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                @if($linkedInPageValue === 1)
                    <script type="text/javascript">
                        $(document).ready(function () {
                            setTimeout(function () {
                                $(".linkedIn_Pages_div").css("display", "block");
                                $('#addAccountsModal').modal('show');
                            }, 1000);
                        });
                    </script>
                @else
                    <div class="text-center my-5">
                        <i class="icon-lg fas fa-times-circle"></i>
                        <h3 class="mt-10">{{$failed}}</h3>
                    </div>
                @endif
            @elseif(isset($facebookPageValue))
                <div class="modal fade" id="addAccountsModal" tabindex="-1"
                     role="dialog"
                     aria-labelledby="addAccountsModalLabel" aria-hidden="true">
                    <div class="modal-dialog modal-dialog-centered modal-lg"
                         role="document">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="addAccountsModalLabel">Add
                                    Accounts</h5>
                                <button type="button" class="close" data-dismiss="modal"
                                        aria-label="Close">
                                    <i aria-hidden="true" class="ki ki-close"></i>
                                </button>
                            </div>
                            <div class="modal-body">
                                <div class="">
                                    <div
                                            id="facebook-add-accounts"
                                            role="tabpanel"
                                            aria-labelledby="facebook-tab-accounts">
                                        @if($facebookPageValue === 1)
                                            <div class="mt-3 fb_page_div" style="display: none;">
                                                <span>Choose Facebook pages for posting</span>
                                                <div class="scroll scroll-pull" data-scroll="true"
                                                     data-wheel-propagation="true"
                                                     style="height: 200px; overflow-y: scroll;">
                                                @for($i=0; $i<count(session()->get('FbInvitePages')); $i++)                                                                        <!--begin::Page-->
                                                    <div class="d-flex align-items-center flex-grow-1">
                                                        <!--begin::Facebook Fanpage Profile picture-->
                                                        <div class="symbol symbol-45 symbol-light mr-5">


                                                <span class="symbol-label">
                                                    <img src="{{session()->get('FbInvitePages')[$i]['profilePicture']}}"
                                                         class="h-50 align-self-center" alt=""/>
                                                </span>
                                                        </div>
                                                        <!--end::Facebook Fanpage Profile picture-->
                                                        <!--begin::Section-->
                                                        <div
                                                                class="d-flex flex-wrap align-items-center justify-content-between w-100">
                                                            <!--begin::Info-->
                                                            <div class="d-flex flex-column align-items-cente py-2 w-75">
                                                                <!--begin::Title-->
                                                                <a href="{{session()->get('FbInvitePages')[$i]['pageUrl']}}"
                                                                   class="font-weight-bold text-hover-primary font-size-lg mb-1">
                                                                    {{session()->get('FbInvitePages')[$i]['pageName']}}
                                                                </a>
                                                                <!--end::Title-->

                                                                <!--begin::Data-->
                                                                <span class="text-muted font-weight-bold">
                                                        {{session()->get('FbInvitePages')[$i]['fanCount']}} followers
                                                    </span>
                                                                <!--end::Data-->
                                                            </div>
                                                            <!--end::Info-->
                                                        </div>
                                                        <!--end::Section-->
                                                        <!--begin::Checkbox-->
                                                        @if(session()->get('FbInvitePages')[$i]['isAlreadyAdded']===false)
                                                            <div
                                                                    class="custom-control custom-checkbox"
                                                                    id="checkboxes">
                                                                <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4"
                                                                       for="{{session()->get('FbInvitePages')[$i]['pageId']}}">
                                                                    <input type="checkbox"
                                                                           id="{{session()->get('FbInvitePages')[$i]['pageId']}}"
                                                                           name="{{session()->get('FbInvitePages')[$i]['pageName']}}">
                                                                    <span></span>
                                                                </label>
                                                            </div>
                                                        @endif
                                                    </div>

                                                    <!--end::Page-->
                                                    @endfor

                                                </div>

                                                <div class="d-flex justify-content-center">
                                                    <a href="javascript:;" type="button"
                                                       id="checkedPages"
                                                       class="btn btn-facebook font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Submit
                                                        for adding pages</a>
                                                </div>

                                            </div>
                                        @endif
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
                @if($facebookPageValue === 1)
                    <script type="text/javascript">
                        $(document).ready(function () {
                            setTimeout(function () {
                                $(".fb_page_div").css("display", "block");
                                $('#addAccountsModal').modal('show');
                            }, 1000);
                        });
                    </script>
                @else
                    <div class="text-center my-5">
                        <i class="icon-lg fas fa-times-circle"></i>
                        <h3 class="mt-10">{{$failed}}</h3>
                    </div>
                @endif
            @else
                <div class="text-center my-5" id="successAddDiv">
                    <i class="fas fa-check-circle checkmark mt-5"></i>
                    <h3 class="mt-10">Successfully Approved For Adding Account</h3>
                </div>
            @endif
        @endif
    </div>
</div>


<!--begin::Global Theme Bundle(used by all pages)-->
<script src="/plugins/global/plugins.bundle.js"></script>
<script src="/plugins/custom/prismjs/prismjs.bundle.js"></script>
<script src="/js/main.js"></script>
<script src="/js/custom.js"></script>
<script>
    $("#checkedPages2").click(function () {
        var selected = [];
        $('#checkboxes3 input:checked').each(function () {
            selected.push($(this).attr('name'));
        });
        $.ajax({
            url: "/instagramPageAddByInvite",
            type: 'POST',
            data: {
                "pages": selected,
            },
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            beforeSend: function () {
            },
            success: function (response) {
                if (response.code === 200) {
                    if (response.errorIds.length !== 0) {
                        $('#addAccountsModal').modal('hide')
                        Swal.fire({
                            icon: 'warning',
                            text: "Could not add Instagram Business as " + response.errorIds + "... Already added!!",
                        });
                    } else {
                        toastr.success("Instagram Business accounts added successfully!");
                        $('#addAccountsModal').modal('hide');
                        $('#thankYouDIv').append(
                            '                <div class="text-center my-5">\n' +
                            '                    <i class="fas fa-check-circle checkmark mt-5"></i>\n' +
                            '                    <h3 class="mt-10">Successfully Approved For Adding Account</h3>\n' +
                            '                </div>');
                    }
                } else if (response.code == 400) {
                    $('#addAccountsModal').modal('hide')
                    toastr.error(response.message);
                } else if (response.code == 500) {
                    $('#addAccountsModal').modal('hide')
                    toastr.error(response.message);
                }
            },
            error: function (error) {
                toastr.error("Something went wrong.. Not able to add the accounts.")
//                    $('#error').text("Something went wrong.. Not able to create team");
            }
        });
    });

    $("#checkedPages3").click(function () {
        var selected = [];
        $('#checkboxes4 input:checked').each(function () {
            selected.push($(this).attr('name'));
        });
        $.ajax({
            url: "/linkedInPageAddByInvite",
            type: 'POST',
            data: {
                "pages": selected,
            },
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            beforeSend: function () {
            },
            success: function (response) {
                if (response.code === 200) {
                    if (response.errorIds.length !== 0) {
                        $('#addAccountsModal').modal('hide')
                        Swal.fire({
                            icon: 'warning',
                            text: "Could not add LinkedIn pages as " + response.errorIds + "... Already added!!",
                        });
                    } else {
                        toastr.success("LinkedIn pages added successfully!");
                        $('#addAccountsModal').modal('hide')
                        $('#thankYouDIv').append(
                            '                <div class="text-center my-5">\n' +
                            '                    <i class="fas fa-check-circle checkmark mt-5"></i>\n' +
                            '                    <h3 class="mt-10">Successfully Approved For Adding Account</h3>\n' +
                            '                </div>');
                    }
                } else if (response.code == 400) {
                    $('#addAccountsModal').modal('hide')
                    toastr.error(response.error);
                } else if (response.code == 500) {
                    $('#addAccountsModal').modal('hide')
                    toastr.error(response.error);
                }
            },
            error: function (error) {
                toastr.error("Something went wrong.. Not able to add the accounts.")
//                    $('#error').text("Something went wrong.. Not able to create team");
            }
        });
    });

    $("#checkedPages").click(function () {
        var selected = [];
        $('#checkboxes input:checked').each(function () {
            selected.push($(this).attr('name'));
        });
        $.ajax({
            url: "/facebookPageAddByInvite",
            type: 'POST',
            data: {
                "pages": selected,
            },
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            beforeSend: function () {
            },
            success: function (response) {
                if (response.code === 200) {
                    if (response.errorIds.length !== 0) {
                        $('#addAccountsModal').modal('hide')
                        Swal.fire({
                            icon: 'warning',
                            text: "Could not add Facebook pages as " + response.errorIds + "... Already added!!",
                        });
                    } else {
                        toastr.success("Facebook pages added successfully!");
                        $('#addAccountsModal').modal('hide')
                        $('#thankYouDIv').append(
                            '                <div class="text-center my-5">\n' +
                            '                    <i class="fas fa-check-circle checkmark mt-5"></i>\n' +
                            '                    <h3 class="mt-10">Successfully Approved For Adding Account</h3>\n' +
                            '                </div>');
                    }
                } else if (response.code == 400) {
                    $('#addAccountsModal').modal('hide')
                    toastr.error(response.error);
                } else if (response.code == 500) {
                    $('#addAccountsModal').modal('hide')
                    toastr.error(response.message);
                }
            },
            error: function (error) {
                toastr.error("Something went wrong.. Not able to add the accounts.")
//                    $('#error').text("Something went wrong.. Not able to create team");
            }
        });
    });
    $(document).ready(function () {
        $('#checkbox').click();
        $("#checkbox").on('click', function () {
            $('#checkbox').click();
        });
    });
</script>
</body>
<!--end::Body-->
</html>