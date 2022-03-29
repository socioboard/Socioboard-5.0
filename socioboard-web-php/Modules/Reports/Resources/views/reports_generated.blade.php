<!DOCTYPE html>
<html lang="en">
<!--begin::Head-->
<head>
    <base href="../">
    <meta charset="utf-8"/>
    <title>SocioBoard - Reports generated</title>
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

</head>
<!--end::Head-->

<!--begin::Body-->
<body id="Sb_body" class="header-fixed header-mobile-fixed page-loading  reports-header">

<!--begin::Main-->
<!--begin::Header Mobile-->
<div id="Sb_header_mobile" class="header-mobile header-mobile-fixed ">
    <!--begin::Logo-->
    <a href="{{env('APP_URL')}}dashboard">
        <img alt="SocioBoard" src="/media/logos/sb-icon.svg" style="width: 50px;" class="max-h-30px mt-5"/>
    </a>
    <!--end::Logo-->

    <!--begin::Toolbar-->
    <div class="d-flex align-items-center">
        <button class="btn p-0 burger-icon burger-icon-left ml-4" id="Sb_header_mobile_toggle">
            <span></span>
        </button>

        <button class="btn p-0 ml-2" id="Sb_header_mobile_topbar_toggle">
                <span class="svg-icon svg-icon-xl"><!--begin::Svg Icon | path:assets/media/svg/icons/General/User.svg-->
                    <i class="fas fa-user-cog"></i>
                </span>
        </button>
    </div>
    <!--end::Toolbar-->
</div>
<!--end::Header Mobile-->
<div class="d-flex flex-column flex-root">
    <!--begin::Page-->
    <div class="d-flex flex-row flex-column-fluid page">
        <!--begin::Wrapper-->
        <div class="d-flex flex-column flex-row-fluid wrapper" id="Sb_wrapper">
            <!--begin::Header-->
            <div id="Sb_header" class="header flex-column  header-fixed ">
                <!--begin::Top-->
                <div class="header-top">
                    <!--begin::Container-->
                    <div class=" container-fluid justify-content-end">
                        <!--begin::Left-->
                        <div class="logo">
                            <!--begin::Logo-->
                            <a href="{{env('APP_URL')}}dashboard" class="mr-2">
                                <img alt="SocioBoard" src="/media/logos/sb-icon.svg" class=" mt-5"/>
                            </a>
                            <!--end::Logo-->


                        </div>
                        <!--end::Left-->

                        <!--begin::Topbar-->
                        <div class="topbar mr-2">
                            <!-- dark switch -->
                            <div class="theme-switch-wrapper mt-3 mr-5">
                                <span
                                        class="opacity-50 font-weight-bold font-size-sm text-center d-none d-md-inline mt-4">Switch Theme</span>
                                <span class="switch switch-outline switch-icon switch-dark switch-sm">
                                      <span><i class="fas fa-sun fa-fw text-warning mt-1"></i></span>
                                            <label class="theme-switch" for="checkbox">
                                                <input type="checkbox" id="checkbox" name="select"
                                                       onclick="switchTheme(event)"/>
                                                <span></span>
                                            </label>
                                    <span><i class="fas fa-moon fa-fw text-primary mt-1"></i></span>
                                        </span>
                            </div>
                            <!--end::Search-->
                        </div>
                        <!--end::Topbar-->
                    </div>
                    <!--end::Container-->
                </div>
                <!--end::Top-->

            </div>
            <!--end::Header-->

            <!--begin::Content-->
            <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">
                <div id="rep-loader" style="text-align: center;">
                    <i class="fas fa-spinner fa-spin fa-3x"></i>
                </div>
                <!--begin::Entry-->
                <div class="d-flex flex-column-fluid">
                    <!--begin::Container-->
                    <div class=" container ">
                        <div class="row" id="html-sec">
                        </div>
                    </div>
                    <!--end::Container-->
                </div>
                <!--end::Entry-->
            </div>


        </div>
        <!--end::Wrapper-->
    </div>
    <!--end::Page-->
</div>
<!--end::Main-->

<!-- begin::Floating Circle Menu-->
<div class="floating-circle-menu">
    <button class="floating-btn btn btn-icon text-hover-info btn-lg px-5">
        <i class="fa fa-plus"></i>
    </button>
    <div class="items-wrapper">
        <button class="btn btn-icon text-hover-info px-5" title="Print" data-toggle="tooltip" data-placement="top"
                onclick="window.print()">
            <i class="fas fa-print"></i>
        </button>
        {{--        <button class="btn btn-icon text-hover-info px-5" data-toggle="tooltip" data-placement="top" title="Export PDF">--}}
        {{--            <i class="fas fa-file-pdf"></i>--}}
        {{--        </button>--}}
        <a href="{{env('APP_URL')}}dashboard" class="btn btn-icon text-hover-info px-5" data-toggle="tooltip"
           data-placement="top"
           title="Back to site">
            <i class="fas fa-arrow-left"></i>
        </a>
        <button class="btn btn-icon text-hover-info px-5" title="Clear All" data-toggle="tooltip" data-placement="top">
            <i class="fas fa-broom" data-toggle="modal"  data-target="#accountDeleteModal2"></i>
        </button>
    </div>
</div>
<div class="modal fade"
     id="accountDeleteModal2"
     tabindex="-1"
     role="dialog"
     aria-labelledby="teamDeleteModalLabel"
     aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg"
         role="document">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"
                    id="teamDeleteModalLabel">Delete
                    all reports from cart</h5>
                <button type="button" class="close"
                        data-dismiss="modal"
                        aria-label="Close">
                    <i aria-hidden="true"
                       class="ki ki-close"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="text-center">
                    <img
                            src="/media/svg/icons/Communication/Delete-user.svg"/><br>
                    <span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete all reports?</span>
                </div>
                <div class="d-flex justify-content-center">
                    <button type="submit"
                            onclick="clearALL()"
                            class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                            data-dismiss="modal">
                        Delete it
                    </button>
                    <a href="javascript:;" type="button"
                       class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                       data-dismiss="modal">No
                        thanks.</a>
                </div>
            </div>
        </div>
    </div>
</div>
<script src="{{asset('plugins/global/plugins.bundle.js')}}"></script>
<script src="{{asset('plugins/custom/prismjs/prismjs.bundle.js')}}"></script>
<script src="{{asset('js/main.js')}}"></script>
<script src="{{asset('js/custom.js')}}"></script>
<script src="{{asset('plugins/custom/draggable/draggable.bundle.js')}}"></script>
<script src="//cdn.jsdelivr.net/npm/sweetalert2@11"></script>


<script>
    // begin::draggable card
    var SBCardDraggable = function () {

        return {
            //main function to initiate the module
            init: function () {
                var containers = document.querySelectorAll('.draggable-zone');

                console.log("containers " + containers.length);

                if (containers.length === 0) {
                    return false;
                }

                var swappable = new Sortable.default(containers, {
                    draggable: '.draggable',
                    handle: '.draggable .draggable-handle',
                    mirror: {
                        //appendTo: selector,
                        appendTo: 'body',
                        constrainDimensions: true
                    }
                });
            }
        };
    }();

    jQuery(document).ready(function () {
        SBCardDraggable.init();
    });
    // end::draggable card
</script>
<script>
    $(document).ready(function () {
        const currentTheme = localStorage.getItem('theme');
        if (currentTheme) {
            document.documentElement.setAttribute('data-theme', currentTheme);
            if (currentTheme === 'dark') {
                toggleSwitch.checked = true;
            }
        }
        $('.floating-btn').click(function () {
            $('.floating-circle-menu').toggleClass('active')
            $('#removeThisCart').tooltip();
            $('#draggableButton').tooltip();
        });
        getReportImages();
    });

    function getReportImages() {
        $.ajax({
            type: 'get',
            url: '/get-reports-Images-onload',
            dataType: 'json',
            cache: false,
            processData: false,
            contentType: false,
            beforeSend: function () {
                $('div#html-sec').empty();
            },
            success: function (response) {
                if (response.code === 200) {
                    $('#rep-loader').remove();
                    if (response.data === 'No Data found') {
                        $('div#html-sec').append('<div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>\n' +
                            'Currently no reports have been added to the cart</h6>\n' +
                            '</div>');
                    } else {
                        let appendData = '';
                        response.data.map(element => {
                            if (element.title === 'md4') {
                                appendData += '<div class="col-md-4 draggable-zone" data-id="' + element.id + '">\n'
                            } else if (element.title === 'md8') {
                                appendData += '<div class="col-md-8 draggable-zone" data-id="' + element.id + '">\n'
                            } else if (element.title === 'd-flex') {
                                appendData += '<div class="col-md-8 draggable-zone" data-id="' + element.id + '">\n'
                            }
                            appendData += '<div class="card card-custom gutter-b draggable" tabindex="0">\n' +
                                '<div class="draggable-handle">\n' +
                                '<div class="button-block mt-2">\n' +
                                '<button data-toggle="modal"  data-target="#accountDeleteModal' + element.id + '" title="Remove this from cart" class="btn btn-xs btn-light btn-hover-primary" >\n' +
                                '<i class="ki ki-close icon-sm text-muted p-0"></i>\n' +
                                '</button>\n' +
                                '</div>\n' +
                                '<img src="https://publishv5.socioboard.com' + element.media_url + '" class="img-fluid">\n' +
                                '</div>\n' +
                                '</div>\n' +
                                '</div>';
                            appendData += '<div class="modal fade"\n' +
                                'id="accountDeleteModal' + element.id + '"\n' +
                                'tabindex="-1"\n' +
                                'role="dialog"\n' +
                                'aria-labelledby="teamDeleteModalLabel"\n' +
                                'aria-hidden="true">\n' +
                                '<div class="modal-dialog modal-dialog-centered modal-lg"\n' +
                                'role="document">\n' +
                                '<div class="modal-content">\n' +
                                '<div class="modal-header">\n' +
                                '<h5 class="modal-title"\n' +
                                'id="teamDeleteModalLabel">Delete\n' +
                                'This Report from cart</h5>\n' +
                                '<button type="button" class="close"\n' +
                                'data-dismiss="modal"\n' +
                                'aria-label="Close">\n' +
                                '<i aria-hidden="true"\n' +
                                'class="ki ki-close"></i>\n' +
                                '</button>\n' +
                                '</div>\n' +
                                '<div class="modal-body">\n' +
                                '<div class="text-center">\n' +
                                '<img\n' +
                                'src="/media/svg/icons/Communication/Delete-user.svg"/><br>\n' +
                                '<span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this report card?</span>\n' +
                                '</div>\n' +
                                '<div class="d-flex justify-content-center">\n' +
                                '<button type="submit"\n' +
                                'onclick="remove(\'' + element.id + '\')"\n' +
                                'class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"\n' +
                                'id="' + element.id + '"\n' +
                                'data-dismiss="modal">\n' +
                                'Delete it\n' +
                                '</button>\n' +
                                '<a href="javascript:;" type="button"\n' +
                                'class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"\n' +
                                'data-dismiss="modal">No\n' +
                                'thanks.</a>\n' +
                                '</div></div></div></div></div>';

                        });
                        $('div#html-sec').append(appendData);
                        SBCardDraggable.init();
                    }

                }
            }
        })
    }

    function remove(id) {
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
            },
            type: 'delete',
            url: 'delete-this-card',
            data: {
                id
            },
            success: function (response) {
                if (response.code === 200) {
                    $('div[data-id="'+id+'"]').remove();
                    toastr.success('The reports has deleted from cart');
                } else if (response.code === 400) {
                    toastr.error(response.error);
                } else {
                    toastr.error(response.error);
                }
            }
        });
    }

    function clearALL() {
                $.ajax({
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    type: 'delete',
                    url: 'delete-all-the-cards',
                    success: function (response) {
                        if (response.code === 200) {
                            toastr.success('Deleted all the reports from cart');
                            $('div#html-sec').empty();
                            $('div#html-sec').append('<div class="text-center">\n' +
                                '<div class="symbol symbol-150">\n' +
                                '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                '</div><h6>\n' +
                                'Currently no reports have been added to the cart</h6>\n' +
                                '</div>');
                        } else if (response.code === 400) {
                            toastr.error(response.error);
                        } else {
                            toastr.error(response.error);
                        }
                    }
                });
    }

</script>
</body>
<!--end::Body-->
</html>