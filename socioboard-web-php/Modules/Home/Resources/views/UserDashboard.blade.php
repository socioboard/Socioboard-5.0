@extends('home::layouts.UserLayout')
<head>
    <script src="//cdn.jsdelivr.net/npm/sweetalert2@10"></script>
</head>
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Dashboard</title>
@endsection
@section('content')
    @if(session('failed'))
        <script>
            Swal.fire({
                icon: 'error',
                text: "{{session('failed')}}",
            });
        </script>
    @elseif(session('success'))
        <script>
            Swal.fire({
                    icon: 'success',
                    title: "{{session('success')}}"
                }
            );
        </script>
    @endif
    <script>
        let plan_id = <?php echo(session()->get('user')['userDetails']['userPlanDetails']['plan_id']);?>;
        let offerSession = <?php echo(session()->get('review_session') !== null ? '1' : '0');?>;
    </script>
    <script>
        window.getCookie = function (name) {
            let match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
            if (match) return match[2];
        };
        //aMemberData for autoLogin
        localStorage.setItem('browser_id', '<?php echo(session()->get('user')['userDetails']['user_name']);?>');
        localStorage.setItem('random_key', '<?php echo(session()->get('user')['userDetails']['password']);?>');

        if (window.getCookie('SBPlan')) {
            document.cookie = 'SBPlan=; Path=/;path=/;domain=socioboard.com; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
            window.location.href = "https://appv5.socioboard.com/amember/member";
        }
        //    Check if plan is clicked or not
    </script>
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Dashboard-->
                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-3 col-sm-12">
                        <!--begin::Accounts-->
                        <a href="{{env('APP_URL')}}home/publishing/scheduling"
                           class="card card-custom gutter-b card-stretch"
                        >
                            <!--begin::Body-->
                            <div class="card-body position-relative overflow-hidden">
                                <i class="far fa-edit fa-3x"></i>
                                <h4 class="mt-3 font-weight-bolder">Create a New Post</h4>
                                <p>Publish, schedule or queue ....</p>
                            </div>
                            <!--end::Body-->
                        </a>
                        <!--end::Accounts-->
                    </div>
                    <div class="col-xl-3 col-sm-12">
                        <!--begin::Accounts-->
                        <a href="{{env('APP_URL')}}calendar-view" class="card card-custom gutter-b card-stretch"
                           id="calendarPost" title="">
                            <!--begin::Body-->
                            <div class="card-body position-relative overflow-hidden">
                                <i class="far fa-calendar-alt fa-3x"></i>
                                <h4 class="mt-3 font-weight-bolder">Calendar View</h4>
                                <p>Check your socio calendar ...</p>
                            </div>
                            <!--end::Body-->
                        </a>
                        <!--end::Accounts-->
                    </div>
                    <div class="col-xl-3 col-sm-12">
                        <!--begin::Accounts-->
                        <a href="{{env('APP_URL')}}get-team-reports" class="card card-custom gutter-b card-stretch">
                            <!--begin::Body-->
                            <div class="card-body position-relative overflow-hidden">
                                <i class="fas fa-chart-line fa-3x"></i>
                                <h4 class="mt-3 font-weight-bolder">Team Reports</h4>
                                <p>Check your team reports and ...</p>
                            </div>
                            <!--end::Body-->
                        </a>
                        <!--end::Accounts-->
                    </div>
                    <div class="col-xl-3 col-sm-12">
                        <!--begin::Accounts-->
                        @if (in_array(session()->get('user')['userDetails']['userPlanDetails']['plan_id'], [101, 102, 103]))
                            <a href="https://appsumo.com/" class="card card-custom gutter-b card-stretch appsumo-plan">
                                @else
                                    <a href="/plan-details-view" class="card card-custom gutter-b card-stretch">
                                    @endif
                                    <!--begin::Body-->
                                        <div class="card-body position-relative overflow-hidden">
                                            <i class="far fa-clock fa-3x"></i>
                                            <h4 class="mt-3 font-weight-bolder"><?php if (isset(session()->get('user')['userDetails']['userPlanDetails']['plan_name'])) echo session()->get('user')['userDetails']['userPlanDetails']['plan_name']; else  echo '-' ?>
                                                Plan</h4>
                                            <p id="account_expire_date_id"></p>
                                        </div>
                                        <!--end::Body-->
                                    </a>
                                    <!--end::Accounts-->
                    </div>
                </div>

                <div class="row">
                    <div class="col-xl-4">
                        <!--begin::Mixed Widget 2-->
                        <div class="card card-custom gutter-b card-stretch" id="ss-statsDiv">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Schedule Stats</h3>
                                <div class="card-toolbar flex-nowrap">
                                    <select class="form-control selectpicker" onchange="selectDateStats(this)">
                                        <option value="3">Last 7 Days</option>
                                        <option value="1">Today</option>
                                        <option value="2">Yesterday</option>
                                        <option value="4">This Month</option>
                                        <option value="6">Last Month</option>
                                    </select>
                                    <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                         title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                        <span node-id="ss-statsDiv_md4" class="ss addtcartclose"></span></div>
                                    <span class="spinner spinner-primary spinner-center" id="ss-statsDiv_md4" style="
    display: none;"></span>
                                </div>
                            </div>
                            <!--end::Header-->

                            <!--begin::Body-->
                            <div class="card-body d-flex flex-column">
                                <!--begin::Chart-->
                                <div class="flex-grow-1">
                                    <div id="line-adwords" class="card-rounded-bottom " style="height: 200px"></div>
                                </div>
                                <!--end::Chart-->

                                <!--begin::Stats-->
                                <div class="mt-10 mb-5">
                                    <!--begin::Row-->
                                    <div class="row row-paddingless mb-10">
                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-primary mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                        <span class="svg-icon svg-icon-lg svg-icon-primary">
                                                                <i class="far fa-clock fa-2x text-primary"></i>
                                                        </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="scheduledData">
                                                    </div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Scheduled</div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-success mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-success">
                                                                            <i class="far fa-calendar-check text-success fa-2x"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder"
                                                         id="publishedData"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">
                                                        Published
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-warning mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-warning">
                                                                            <i class="far fa-calendar-times text-warning fa-2x"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="failedData"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Failed</div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                    </div>
                                    <!--end::Row-->
                                </div>
                                <!--end::Stats-->
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Mixed Widget 2-->
                    </div>

                    <div class="col-xl-4">
                        <!--begin::Mixed Widget 16-->
                        <div class="card card-custom card-stretch gutter-b" id="ss-reportsDiv">
                            <!--begin::Header-->
                            <div class="card-header border-0 pt-5">
                                <div class="card-title">
                                    <div class="card-label">
                                        <div class="font-weight-bolder">Team Report</div>
                                        <div class="font-size-sm text-muted mt-2">{{session()->get('team')['teamName']}}</div>
                                    </div>
                                </div>
                                <div class="card-toolbar flex-nowrap">
                                    <select class="form-control selectpicker" onchange="selectDateReports(this)">
                                        <option value="3">Last 7 Days</option>
                                        <option value="1">Today</option>
                                        <option value="2">Yesterday</option>
                                        <option value="4">This Month</option>
                                        <option value="6">Last Month</option>
                                    </select>
                                    <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                         title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                        <span node-id="ss-reportsDiv_md4" class="ss addtcartclose"></span>
                                    </div>
                                    <span class="spinner spinner-primary spinner-center" id="ss-reportsDiv_md4" style="
    display: none;"></span>
                                </div>

                            </div>
                            <!--end::Header-->

                            <!--begin::Body-->
                            <div class="card-body d-flex flex-column">
                                <!--begin::Chart-->
                                <div class="flex-grow-1">
                                    <div id="team-report" style="height: 200px"></div>
                                </div>
                                <!--end::Chart-->

                                <!--begin::Items-->
                                <div class="mt-10 mb-5">
                                    <div class="row row-paddingless mb-10">
                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-danger mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                         <span class="svg-icon svg-icon-lg svg-icon-danger">
                                                                                <i class="fas fa-chart-pie fa-2x text-danger"></i>
                                                                         </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder"
                                                         id="socialProfileCount"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">
                                                        Social Profile
                                                        Count
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-warning mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                         <span class="svg-icon svg-icon-lg svg-icon-warning">
                                                                                <i class="far fa-clock text-warning fa-2x"></i>
                                                                         </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder"
                                                         id="Scheduled"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">
                                                        Schedule Publish
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->
                                    </div>

                                    <div class="row row-paddingless">
                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-success mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-success">
                                                                            <i class="far fa-calendar-check text-success fa-2x"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder"
                                                         id="published"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">
                                                        Publish
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-primary mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                         <span class="svg-icon svg-icon-lg svg-icon-primary">
                                                                                <i class="far fa-id-card fa-2x text-primary"></i>
                                                                         </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder"
                                                         id="totalPostCount"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">
                                                        Total Post Count
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->
                                    </div>
                                </div>
                                <!--end::Items-->
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Mixed Widget 16-->

                    </div>

                    <div class="col-xl-4 flex-nowrap">
                        <!--begin::Accounts-->
                        <div class="card card-custom gutter-b card-stretch" id="ss-viewAccountsDiv">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <h3 class="card-title font-weight-bolder">Accounts</h3>

                                <div class="card-toolbar">
                                    <a href="{{url('view-accounts')}}" class="btn btn-sm">
                                        View Accounts
                                    </a>
                                    <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                         title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                        <span node-id="ss-viewAccountsDiv_md4" class="ss addtcartclose"></span>
                                    </div>
                                    <span class="spinner spinner-primary spinner-center" id="ss-viewAccountsDiv_md4"
                                          style="
    display: none;"></span>
                                </div>
                            </div>
                            <!--end::Header-->

                            <!--begin::Body-->
                            <div class="card-body pt-2 position-relative" id="accountsSectionDiv">
                                <div class="d-flex justify-content-center">
                                    <button data-toggle="modal"
                                            data-target="#inviteModal"
                                            class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 col-6 mr-3">Send
                                        Invite
                                    </button>
                                    <button data-toggle="modal" data-target="#addAccountsModal"
                                            class="btn font-weight-bolder font-size-h6 px-8 py-4 my-3 col-6">Add
                                        Accounts
                                    </button>
                                </div>
                                <small class="text-center">Click on "<b> Add Accounts </b>"
                                    button to add social
                                    profiles
                                </small>
                                <!-- begin:Add Accounts Modal-->
                                <div class="modal fade" id="addAccountsModal" tabindex="-1"
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
                                                    <ul class="nav justify-content-center nav-pills"
                                                        id="AddAccountsTab"
                                                        role="tablist">
                                                        <li class="nav-item">
                                                            <a class="nav-link"
                                                               id="facebook-tab-accounts"
                                                               data-toggle="tab"
                                                               href="#facebook-add-accounts">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-facebook fa-2x"></i></span>

                                                            </a>
                                                        </li>
                                                        <li class="nav-item">
                                                            <a class="nav-link"
                                                               id="twitter-tab-accounts"
                                                               data-toggle="tab"
                                                               href="#twitter-add-accounts"
                                                               aria-controls="twitter">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-twitter fa-2x"></i></span>

                                                            </a>
                                                        </li>
                                                        <li class="nav-item">
                                                            <a class="nav-link"
                                                               id="instagram-tab-accounts"
                                                               data-toggle="tab"
                                                               href="#instagram-add-accounts"
                                                               aria-controls="instagram">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-instagram fa-2x"></i></span>

                                                            </a>
                                                        </li>
                                                        <li class="nav-item">
                                                            <a class="nav-link"
                                                               id="linkedin-tab-accounts"
                                                               data-toggle="tab"
                                                               href="#linkedin-add-accounts"
                                                               aria-controls="linkedin">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-linkedin fa-2x"></i></span>

                                                            </a>
                                                        </li>
                                                        <li class="nav-item">
                                                            <a class="nav-link"
                                                               id="youtube-tab-accounts"
                                                               data-toggle="tab"
                                                               href="#youtube-add-accounts"
                                                               aria-controls="youtube">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-youtube fa-2x"></i></span>

                                                            </a>
                                                        </li>
                                                        <li class="nav-item">
                                                            <a class="nav-link"
                                                               id="pinterest-tab-accounts"
                                                               data-toggle="tab"
                                                               href="#pinterest-add-accounts"
                                                               aria-controls="pinterest">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-pinterest fa-2x"></i></span>

                                                            </a>
                                                        </li>
                                                        <li class="nav-item">
                                                            <a class="nav-link" id="tumblr-tab-accounts"
                                                               data-toggle="tab"
                                                               href="#tumblr-add-accounts"
                                                               aria-controls="tumblr">
                                                                <span class="nav-text"><i
                                                                            class="fab fa-tumblr fa-2x"></i></span>

                                                            </a>
                                                        </li>
                                                    </ul>
                                                    <div class="tab-content mt-5"
                                                         id="AddAccountsTabContent">
                                                        <div class="tab-pane fade show active"
                                                             id="facebook-add-accounts" role="tabpanel"
                                                             aria-labelledby="facebook-tab-accounts">
                                                            <p>Socioboard needs permission to access and
                                                                publish content
                                                                to Facebook on your behalf. To grant
                                                                permission, you
                                                                must be an admin for your brand’s
                                                                Facebook page.</p>
                                                            <div class="d-flex justify-content-center">
                                                                <a href="/add-accounts/Facebook"
                                                                   type="button"
                                                                   class="btn btn-facebook font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                                                    a Facebook Profile</a>
                                                                <a href="/add-accounts/FacebookPage"
                                                                   type="button"
                                                                   class="btn btn-facebook fb_page_btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                >Add
                                                                    a Facebook FanPage</a>
                                                            </div>
                                                            @if($facebookpages === 1)
                                                                <div class="mt-3 fb_page_div" style="display: none;">
                                                                    <span>Choose Facebook pages for posting</span>
                                                                    <div class="scroll scroll-pull" data-scroll="true"
                                                                         data-wheel-propagation="true"
                                                                         style="height: 200px; overflow-y: scroll;">
                                                                    @for($i=0; $i<count(session()->get('pages')); $i++)                                                                        <!--begin::Page-->
                                                                        <div class="d-flex align-items-center flex-grow-1">
                                                                            <!--begin::Facebook Fanpage Profile picture-->
                                                                            <div class="symbol symbol-45 symbol-light mr-5">


                                                <span class="symbol-label">
                                                    <img src="{{session()->get('pages')[$i]->profilePicture}}"
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
                                                                                    <a href="{{session()->get('pages')[$i]->pageUrl}}"
                                                                                       class="font-weight-bold text-hover-primary font-size-lg mb-1">
                                                                                        {{session()->get('pages')[$i]->pageName}}
                                                                                    </a>
                                                                                    <!--end::Title-->

                                                                                    <!--begin::Data-->
                                                                                    <span class="text-muted font-weight-bold">
                                                        {{session()->get('pages')[$i]->fanCount}} followers
                                                    </span>
                                                                                    <!--end::Data-->
                                                                                </div>
                                                                                <!--end::Info-->
                                                                            </div>
                                                                            <!--end::Section-->
                                                                            <!--begin::Checkbox-->
                                                                            @if(session()->get('pages')[$i]->isAlreadyAdded===false)
                                                                                <div
                                                                                        class="custom-control custom-checkbox"
                                                                                        id="checkboxes">
                                                                                    <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4"
                                                                                           for="{{session()->get('pages')[$i]->pageId}}">
                                                                                        <input type="checkbox"
                                                                                               id="{{session()->get('pages')[$i]->pageId}}"
                                                                                               name="{{session()->get('pages')[$i]->pageName}}">
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
                                                        <div class="tab-pane fade"
                                                             id="twitter-add-accounts"
                                                             role="tabpanel"
                                                             aria-labelledby="twitter-tab-accounts">
                                                            <p>Please make sure you are logged in with
                                                                the proper
                                                                account when you authorize
                                                                Socioboard.</p>
                                                            <div class="d-flex justify-content-center">
                                                                <a href="/add-accounts/Twitter" id="twitterButton"
                                                                   type="button"
                                                                   class="btn btn-twitter font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                                                    a Twitter Profile</a>
                                                            </div>
                                                            <label class="checkbox mb-0 pt-5">
                                                                <input class="checkboxes2" type="checkbox" name="sb-twt"
                                                                       onclick="followSBTwitter();">
                                                                <span class="mr-2"></span>
                                                                Follow Socioboard on twitter for update
                                                                & announcements
                                                            </label>
                                                        </div>
                                                        <div class="tab-pane fade"
                                                             id="instagram-add-accounts"
                                                             role="tabpanel"
                                                             aria-labelledby="instagram-tab-accounts">
                                                            <p>To allow Socioboard access to your Instagram account, you
                                                                must first give authorization from the Instagram
                                                                website.</p>
                                                            <div class="d-flex justify-content-center">
                                                                <a href="/add-accounts/Instagram" type="button"
                                                                   class="btn btn-instagram font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                                                    a Instagram Profile</a>
                                                                <a href="/add-accounts/InstagramBusiness" type="button"
                                                                   class="btn btn-instagram font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                                                    a Business Account</a>
                                                            </div>
                                                            @if($instagrampages === 1)
                                                                <div class="mt-3 insta_page_div" style="display: none;">
                                                                    <span>Choose Instagram business accounts for posting</span>
                                                                    <div class="scroll scroll-pull" data-scroll="true"
                                                                         data-wheel-propagation="true"
                                                                         style="height: 200px; overflow-y: scroll;">
                                                                    @for($i=0; $i<count(session()->get('instagramPages')); $i++)                                                                        <!--begin::Page-->
                                                                        <div class="d-flex align-items-center flex-grow-1">
                                                                            <!--begin::Facebook Fanpage Profile picture-->
                                                                            <div class="symbol symbol-45 symbol-light mr-5">


                                                <span class="symbol-label">
                                                    <img src="{{session()->get('instagramPages')[$i]->profile_pic}}"
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
                                                                                    <a href="https://www.instagram.com/{{session()->get('instagramPages')[$i]->userName}}"
                                                                                       class="font-weight-bold text-hover-primary font-size-lg mb-1">
                                                                                        {{session()->get('instagramPages')[$i]->userName}}
                                                                                    </a>
                                                                                    <!--end::Title-->

                                                                                    <!--begin::Data-->
                                                                                    <span class="text-muted font-weight-bold">
                                                        {{session()->get('instagramPages')[$i]->fanCount}} followers
                                                    </span>
                                                                                    <!--end::Data-->
                                                                                </div>
                                                                                <!--end::Info-->
                                                                            </div>
                                                                            <!--end::Section-->
                                                                            <!--begin::Checkbox-->
                                                                            @if(session()->get('instagramPages')[$i]->isAlreadyAdded===false)
                                                                                <div
                                                                                        class="custom-control custom-checkbox"
                                                                                        id="checkboxes3">
                                                                                    <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4"
                                                                                           for="{{session()->get('instagramPages')[$i]->social_id}}">
                                                                                        <input type="checkbox"
                                                                                               id="{{session()->get('instagramPages')[$i]->social_id}}"
                                                                                               name="{{session()->get('instagramPages')[$i]->userName}}">
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
                                                        <div class="tab-pane fade"
                                                             id="linkedin-add-accounts"
                                                             role="tabpanel"
                                                             aria-labelledby="linkedin-tab-accounts">
                                                            <p>Grant access to your profile to share
                                                                updates and view
                                                                your feed.</p>
                                                            <div class="d-flex justify-content-center">
                                                                <a href="/add-accounts/LinkedIn"
                                                                   type="button"
                                                                   class="btn btn-linkedin font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                                                    a LinkedIn Profile</a>
                                                                <a href="/add-accounts/LinkedInCompany" type="button"
                                                                   class="btn btn-linkedin linkedin_page_btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                                                    a LinkedIn page</a>
                                                            </div>
                                                            @if($LinkedInpages === 1)
                                                                <div class="mt-3 linkedIn_Pages_div"
                                                                     style="display: none;">
                                                                    <span>Choose LinkedIN pages accounts for posting</span>
                                                                    <div class="scroll scroll-pull" data-scroll="true"
                                                                         data-wheel-propagation="true"
                                                                         style="height: 200px; overflow-y: scroll;">
                                                                    @for($i=0; $i<count(session()->get('LinkedInpages')); $i++)                                                                        <!--begin::Page-->
                                                                        <div class="d-flex align-items-center flex-grow-1">
                                                                            <!--begin::Facebook Fanpage Profile picture-->
                                                                            <div class="symbol symbol-45 symbol-light mr-5">


                                                <span class="symbol-label">
                                                    <img src="{{session()->get('LinkedInpages')[$i]->profilePicture}}"
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
                                                                                    <a href="{{session()->get('LinkedInpages')[$i]->profileUrl}}"
                                                                                       class="font-weight-bold text-hover-primary font-size-lg mb-1">
                                                                                        {{session()->get('LinkedInpages')[$i]->companyName}}
                                                                                    </a>
                                                                                    <!--end::Title-->
                                                                                </div>
                                                                                <!--end::Info-->
                                                                            </div>
                                                                            <!--end::Section-->
                                                                            <!--begin::Checkbox-->
                                                                            @if(session()->get('LinkedInpages')[$i]->isAlreadyAdded === false)
                                                                                <div
                                                                                        class="custom-control custom-checkbox"
                                                                                        id="checkboxes4">
                                                                                    <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4"
                                                                                           for="{{session()->get('LinkedInpages')[$i]->companyId}}">
                                                                                        <input type="checkbox"
                                                                                               id="{{session()->get('LinkedInpages')[$i]->companyId}}"
                                                                                               name="{{session()->get('LinkedInpages')[$i]->companyName}}">
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
                                                        <div class="tab-pane fade"
                                                             id="youtube-add-accounts"
                                                             role="tabpanel"
                                                             aria-labelledby="youtube-tab-accounts">
                                                            <p>To allow Socioboard access to your
                                                                Youtube account, you
                                                                must first give authorization from the
                                                                Youtube
                                                                Channel.</p>
                                                            <p><strong>Important Notes:</strong></p>
                                                            <ol class="twitter-add-accounts">
                                                                <li>
                                                                    YouTube's Terms of Services link <br/>
                                                                    <strong>Please Visit -</strong>
                                                                    <a href="https://www.youtube.com/t/terms">
                                                                        https://www.youtube.com/t/terms</a>
                                                                </li>
                                                                <li>
                                                                    Google privacy policy Link <br/>
                                                                    <strong>Please Visit -</strong>
                                                                    <a href="https://policies.google.com/privacy">
                                                                        https://policies.google.com/privacy</a>
                                                                </li>
                                                                <li>
                                                                    Google security settings page about revoking user
                                                                    access <br/>
                                                                    <strong>Please Visit -</strong>
                                                                    <a href="https://myaccount.google.com/permissions?pli=1">
                                                                        https://myaccount.google.com/permissions?pli=1</a>
                                                                </li>
                                                                <li>
                                                                    Handling YouTube Data and Content <br/>
                                                                    <strong>Official Terms -</strong>
                                                                    <a href="https://developers.google.com/youtube/terms/developer-policies#e.-handling-youtube-data-and-content">
                                                                        https://developers.google.com/youtube/terms/developer-policies#e.-handling-youtube-data-and-content.</a>
                                                                </li>
                                                            </ol>
                                                            <p>Storing of Data will be max 30 days.</p>
                                                            <strong>Please go throw all the links for Terms and
                                                                Policies</strong>
                                                            <div class="d-flex justify-content-center">
                                                                <a href="add-accounts/Youtube"
                                                                   type="button"
                                                                   class="btn btn-youtube font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Connect
                                                                    to
                                                                    your YouTube Channel</a>
                                                            </div>
                                                        </div>
                                                        <div class="tab-pane fade"
                                                             id="pinterest-add-accounts"
                                                             role="tabpanel"
                                                             aria-labelledby="pinterest-tab-accounts">
                                                            <p>Grant access to your profile to share updates and view
                                                                your feed.</p>
                                                            <div class="d-flex justify-content-center">
                                                                <a href="add-accounts/Pinterest" type="button"
                                                                   class="btn btn-pinterest font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                                                    a Pinterest Profile</a>
                                                            </div>
                                                        </div>
                                                        <div class="tab-pane fade"
                                                             id="tumblr-add-accounts"
                                                             role="tabpanel"
                                                             aria-labelledby="tumblr-tab-accounts">
                                                            <p>Grant access to your profile to share updates and view
                                                                your feed.</p>
                                                            <div class="d-flex justify-content-center">
                                                                <a href="/add-accounts/Tumblr" type="button"
                                                                   class="btn btn-tumblr font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Add
                                                                    a Tumblr Profile</a>
                                                            </div>
                                                        </div>
                                                        @if($bloggedpages === 1)
                                                            <div class="mt-3 tb_page_div" style="display: none;">
                                                                <span>Choose Blooged pages for posting</span>
                                                                <div class="scroll scroll-pull" data-scroll="true"
                                                                     data-wheel-propagation="true"
                                                                     style="height: 200px; overflow-y: scroll;">
                                                                @for($i=0; $i<count(session()->get('blogs')); $i++)                                                                        <!--begin::Page-->
                                                                    <div class="d-flex align-items-center flex-grow-1">
                                                                        <!--begin::Facebook Fanpage Profile picture-->
                                                                        <div class="symbol symbol-45 symbol-light mr-5">
                                                <span class="symbol-label">
                                                    <img src="{{session()->get('blogs')[$i]->ProfilePicture}}"
                                                         class="h-50 align-self-center" alt=""/>
                                                </span>
                                                                        </div>
                                                                        <!--end::Facebook Fanpage Profile picture-->
                                                                        <!--begin::Section-->
                                                                        <div
                                                                                class="d-flex flex-wrap align-items-center justify-content-between w-100">
                                                                            <div class="d-flex flex-column align-items-cente py-2 w-75">
                                                                                <a href="{{session()->get('blogs')[$i]->ProfileUrl}}"
                                                                                   class="font-weight-bold text-hover-primary font-size-lg mb-1">
                                                                                    {{session()->get('blogs')[$i]->FirstName}}
                                                                                </a>
                                                                                <span class="text-muted font-weight-bold">
                                                        {{session()->get('blogs')[$i]->FriendCount}} followers
                                                    </span>
                                                                            </div>
                                                                        </div>
                                                                        @if(session()->get('blogs')[$i]->isAlreadyAdded===false)
                                                                            <div
                                                                                    class="custom-control custom-checkbox"
                                                                                    id="checkboxes3">
                                                                                <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4"
                                                                                       for="{{session()->get('blogs')[$i]->SocialId}}">
                                                                                    <input type="checkbox"
                                                                                           id="{{session()->get('blogs')[$i]->SocialId}}"
                                                                                           name="{{session()->get('blogs')[$i]->FirstName}}">
                                                                                    <span></span>
                                                                                </label>
                                                                            </div>
                                                                        @endif
                                                                    </div>
                                                                    @endfor

                                                                </div>
                                                                <div class="d-flex justify-content-center">
                                                                    <a href="javascript:;" type="button"
                                                                       id="checkedPages4"
                                                                       class="btn btn-tumblr font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Submit
                                                                        for adding blogged pages</a>
                                                                </div>
                                                            </div>
                                                        @endif
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <!-- end:Add Accounts Modal -->
                                @if(isset($ErrorMessage))
                                    <div style="color: red;text-align:center;">
                                        {{$ErrorMessage}}
                                    </div>
                                @else
                                    @if($accounts['code'] === 200)
                                        <?php $count = 0; ?>
                                        @if(count($accounts['data']->teamSocialAccountDetails[0]->SocialAccount)!==0)
                                            @foreach($accounts['data']->teamSocialAccountDetails[0]->SocialAccount as $account)
                                                @if($account->account_type !== 13 && $account->account_type !== 14)
                                                    <?php if ($count == 7) break; ?>
                                                <!--begin::Item-->
                                                    @if($account->join_table_teams_social_accounts->is_account_locked === true)
                                                        <div
                                                                class="d-flex align-items-center flex-wrap mb-5 mt-5  ribbon ribbon-clip ribbon-left"
                                                                id="accountsSection{{$account->account_id}}">

                                                            <div class="ribbon-target" style="top: 12px;">
                                                                <span class="ribbon-inner bg-danger"></span>
                                                                locked
                                                            </div>
                                                            @else
                                                                <div class="d-flex align-items-center flex-wrap mb-5 mt-5"
                                                                     id="accountsSection{{$account->account_id}}">
                                                                @endif
                                                                <!--begin::profile pic-->
                                                                    <div class="symbol symbol-50 symbol-light mr-5">

                                                    <span class="symbol-label">
                                                        @if($account->account_type === 1 || $account->account_type === 2 )
                                                            <img src="{{$account->profile_pic_url}}" class="card-img-top" onerror=" this.onerror=null;this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUSuMWEcCUPi4dy_q-HfMpQYrlwDOxWOILlQ&usqp=CAU';"
                                                                 class="h-100 align-self-center" alt="avatar name"/>
                                                            @elseif($account->account_type === 4 )
                                                            <img src="{{$account->profile_pic_url}}" class="card-img-top" onerror=" this.onerror=null;this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRIy0G6PWiqV0NM13Zd3OBB0H6SixdDsPxcgQ&usqp=CAU';"
                                                                 class="h-100 align-self-center" alt="avatar name"/>
                                                        @elseif($account->account_type === 12 || $account->account_type === 5 )
                                                            <img src="{{$account->profile_pic_url}}" class="card-img-top" onerror=" this.onerror=null;this.src='https://i.imgur.com/TMVAonx.png';"
                                                                 class="h-100 align-self-center" alt="avatar name"/>
                                                        @elseif($account->account_type === 11 )
                                                            <img src="{{$account->profile_pic_url}}" class="card-img-top" onerror=" this.onerror=null;this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTldN9DuPhILuicsJc5JDGmDRWCI7Y-BXDLEA&usqp=CAU';"
                                                                 class="h-100 align-self-center" alt="avatar name"/>
                                                        @elseif($account->account_type === 9 )
                                                            <img src="{{$account->profile_pic_url}}" class="card-img-top" onerror=" this.onerror=null;this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2p64RiNbHCKAGcrR7ZnOHjaiULOeG1KWpuQ&usqp=CAU';"
                                                                 class="h-100 align-self-center" alt="avatar name"/>
                                                        @elseif($account->account_type === 6 || $account->account_type === 7)
                                                            <img src="{{$account->profile_pic_url}}" class="card-img-top" onerror=" this.onerror=null;this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAazafiWiEDZc4wDZ6pSbidJPw4CTOuLwSBA&usqp=CAU';"
                                                                 class="h-100 align-self-center" alt="avatar name"/>
                                                        @elseif($account->account_type === 16)
                                                            <img src="{{$account->profile_pic_url}}" class="card-img-top" onerror=" this.onerror=null;this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIqlxS7Cw_ggWMFVpVEQv-zWvfXqc36Bt0Lw&usqp=CAU';"
                                                                 class="h-100 align-self-center" alt="avatar name"/>
                                                        @elseif($account->account_type === 18)
                                                            <img src="{{$account->profile_pic_url}}" class="card-img-top" onerror=" this.onerror=null;this.src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOg6a1JGvLre53ishmhjU63uwyz7Ok7_LSAw&usqp=CAU';"
                                                                 class="h-100 align-self-center" alt="avatar name"/>
                                                            @endif
                                                    </span>
                                                                    </div>
                                                                    <!--end::profile pic-->

                                                                    <!--begin::Text-->
                                                                    <div class="SB-accounts-section d-flex flex-column flex-grow-1 mr-2">
                                                                        @if($account->join_table_teams_social_accounts->is_account_locked == true)
                                                                            <a class="font-weight-bold font-size-lg mb-1 truncate"
                                                                               id="name" data-toggle="tooltip"
                                                                               title="{{$account->first_name}}{{$account->last_name}}"
                                                                               disabled
                                                                            >{{$account->first_name}}{{$account->last_name}}  </a>
                                                                        @else
                                                                            <a id="name"
                                                                               class="font-weight-bold font-size-lg mb-1 truncate"
                                                                               data-toggle="tooltip"
                                                                               title="{{$account->first_name}}{{$account->last_name}}"
                                                                            >{{$account->first_name}}{{$account->last_name}}</a  id="name">
                                                                        @endif
                                                                        @if($account->account_type === 1 || $account->account_type === 3)
                                                                            <span
                                                                                    class="text-muted font-weight-bold">Facebook</span>
                                                                        @elseif($account->account_type === 2 )
                                                                            <span
                                                                                    class="text-muted font-weight-bold">Facebook page</span>
                                                                        @elseif($account->account_type === 4 )
                                                                            <span
                                                                                    class="text-muted font-weight-bold">Twitter</span>
                                                                        @elseif($account->account_type === 5 )
                                                                            <span
                                                                                    class="text-muted font-weight-bold">Instagram</span>
                                                                        @elseif($account->account_type === 6 )
                                                                            <span
                                                                                    class="text-muted font-weight-bold">LinkedIn</span>
                                                                        @elseif($account->account_type === 7 )
                                                                            <span
                                                                                    class="text-muted font-weight-bold">LinkedIn page</span>
                                                                        @elseif($account->account_type === 9 )
                                                                            <span
                                                                                    class="text-muted font-weight-bold">Youtube</span>
                                                                        @elseif($account->account_type === 8 || $account->account_type === 10 )
                                                                            <span
                                                                                    class="text-muted font-weight-bold">Google</span>
                                                                        @elseif( $account->account_type === 12 )
                                                                            <span
                                                                                    class="text-muted font-weight-bold">Instagram Business</span>
                                                                        @elseif( $account->account_type === 16 )
                                                                            <span
                                                                                    class="text-muted font-weight-bold">Tumblr</span>
                                                                        @elseif( $account->account_type === 11 )
                                                                            <span
                                                                                    class="text-muted font-weight-bold">Pinterest</span>
                                                                        @endif
                                                                    </div>
                                                                    <!--end::Text-->
                                                                    @if($account->join_table_teams_social_accounts->is_account_locked === false)
                                                                        @if( $account->account_type === 1)
                                                                            <a href="{{env('APP_URL')}}feeds/facebook{{$account->account_id}}"
                                                                               target="_blank"
                                                                               id="connectedButton" title="View Profile"
                                                                               class="add-account-section-btns btn label label-xl label-inline my-lg-0 my-2 font-weight-bolder">
                                                                                Connected</a>
                                                                        @elseif($account->account_type === 2)
                                                                            <a href="{{env('APP_URL')}}feeds/fbPages{{$account->account_id}}"
                                                                               target="_blank"
                                                                               id="connectedButton" title="View Profile"
                                                                               class="add-account-section-btns btn label label-xl label-inline my-lg-0 my-2 font-weight-bolder">
                                                                                Connected</a>
                                                                        @elseif($account->account_type === 9)
                                                                            <a href="{{env('APP_URL')}}feeds/youtube{{$account->account_id}}"
                                                                               target="_blank"
                                                                               id="connectedButton" title="View Profile"
                                                                               class="add-account-section-btns btn label label-xl label-inline my-lg-0 my-2 font-weight-bolder">
                                                                                Connected</a>
                                                                        @elseif($account->account_type === 4)
                                                                            <a href="{{env('APP_URL')}}feeds/twitter{{$account->account_id}}"
                                                                               target="_blank"
                                                                               id="connectedButton" title="View Profile"
                                                                               class="add-account-section-btns btn label label-xl label-inline my-lg-0 my-2 font-weight-bolder">
                                                                                Connected</a>
                                                                        @elseif($account->account_type === 5)
                                                                            <a href="{{env('APP_URL')}}feeds/instagram{{$account->account_id}}"
                                                                               target="_blank"
                                                                               id="connectedButton" title="View Profile"
                                                                               class="add-account-section-btns btn label label-xl label-inline my-lg-0 my-2 font-weight-bolder">
                                                                                Connected</a>
                                                                        @elseif($account->account_type === 7)
                                                                            <a href="{{env('APP_URL')}}feeds/linkedIn{{$account->account_id}}"
                                                                               target="_blank"
                                                                               id="connectedButton" title="View Profile"
                                                                               class="add-account-section-btns btn label label-xl label-inline my-lg-0 my-2 font-weight-bolder">
                                                                                Connected</a>
                                                                        @elseif($account->account_type === 12)
                                                                            <a href="{{env('APP_URL')}}feeds/Business{{$account->account_id}}"
                                                                               target="_blank"
                                                                               id="connectedButton" title="View Profile"
                                                                               class="add-account-section-btns btn label label-xl label-inline my-lg-0 my-2 font-weight-bolder">
                                                                                Connected</a>
                                                                        @elseif($account->account_type === 11)
                                                                            <a href="{{env('APP_URL')}}show-boards/Pinterest{{$account->account_id}}"
                                                                               target="_blank" id="connectedButton" title="View Profile"
                                                                               class="add-account-section-btns btn label label-xl label-inline my-lg-0 my-2 font-weight-bolder">Connected</a>
                                                                        @else
                                                                            <a href="{{$account->profile_url}}"
                                                                               target="_blank"
                                                                               id="connectedButton" title="View Profile"
                                                                               class="add-account-section-btns btn label label-xl label-inline my-lg-0 my-2 font-weight-bolder">
                                                                                Connected</a>
                                                                        @endif
                                                                    @else
                                                                        <a
                                                                                class="add-account-section-btns btn label label-xl label-inline my-lg-0 my-2 font-weight-bolder">
                                                                            Not Connected</a>
                                                                @endif
                                                                <!--begin::Account Dropdown-->
                                                                    <div class="dropdown dropdown-inline ml-2"
                                                                         id="quick_actions"
                                                                         title="Quick actions"
                                                                         data-placement="left">
                                                                        <a href="javascript:;"
                                                                           class="btn btn-hover-light-primary btn-sm btn-icon"
                                                                           data-toggle="dropdown"
                                                                           aria-haspopup="true"
                                                                           aria-expanded="false">
                                                                            <i class="ki ki-bold-more-hor"></i>
                                                                        </a>
                                                                        <div
                                                                                class="dropdown-menu p-0 m-0 dropdown-menu-md dropdown-menu-right account-dropdown-section">
                                                                            <!--begin::Navigation-->
                                                                            <ul class="navi navi-hover">
                                                                                @if($account->join_table_teams_social_accounts->is_account_locked == true)
                                                                                    <li class="navi-item">
                                                                                        <a href="javascript:;"
                                                                                           class="navi-link">
                                                                    <span class="navi-text">
                                                                        <span
                                                                                class="label label-xl label-inline label-primary"
                                                                                onclick="lock('{{$account->account_id}}',0 ,'{{$account->account_type}}')"><i
                                                                                    class="fas fa-user-lock fa-fw text-white"></i>&nbsp; Un-Lock This Account</span>

                                                                    </span>
                                                                                        </a>
                                                                                    </li>
                                                                                @else
                                                                                    <li class="navi-item">
                                                                                        <a href="javascript:;"
                                                                                           class="navi-link">
                                                                    <span class="navi-text">
                                                                        <span
                                                                                class="label label-xl label-inline label-primary"
                                                                                onclick="lock('{{$account->account_id}}',1,'{{$account->account_type}}')"><i
                                                                                    class="fas fa-user-lock fa-fw text-white"></i>&nbsp; Lock This Account</span>

                                                                    </span>
                                                                                        </a>
                                                                                    </li>
                                                                                @endif
                                                                                <li class="navi-item">
                                                                                    <a href="javascript:;"
                                                                                       class="navi-link"
                                                                                       data-toggle="modal"
                                                                                       data-target="#accountDeleteModal{{$account->account_id}}">
                                                                    <span class="navi-text">
                                                                        <span
                                                                                class="label label-xl label-inline label-danger"><i
                                                                                    class="far fa-trash-alt fa-fw text-white"></i> Delete This Account</span>

                                                                    </span>
                                                                                    </a>
                                                                                </li>
                                                                            </ul>
                                                                            <!--end::Navigation-->
                                                                        </div>
                                                                    </div>
                                                                    <!--end::Account Dropdown-->
                                                                </div>
                                                                <!--end::Item-->
                                                                <?php $count++; ?>
                                                                <div class="modal fade"
                                                                     id="accountDeleteModal{{$account->account_id}}"
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
                                                                                    This Account</h5>
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
                                                                                    <span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this Account?</span>
                                                                                </div>
                                                                                <div class="d-flex justify-content-center">
                                                                                    <button type="submit"
                                                                                            onclick="deleteSocialAcc('{{$account->account_id}}','{{$account->account_type}}')"
                                                                                            class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                                                                                            id="{{$account->account_id}}"
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
                                                            @endif
                                                            @endforeach
                                                            @else
                                                                <div class="text-center">
                                                                    <div class="symbol symbol-150">
                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                                    </div>
                                                                    <h6>Currently, no social account has added to
                                                                        this team yet.</h6>

                                                                </div>
                                                            @endif
                                                            @elseif($accounts['code'] === 400)
                                                                <div class="text-center">
                                                                    <div class="symbol symbol-150">
                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                                    </div>
                                                                    <h6> Can not get Accounts,please reload
                                                                        the page</h6>

                                                                </div>
                                                            @else
                                                                <div class="text-center">
                                                                    <div class="symbol symbol-150">
                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>
                                                                    </div>
                                                                    <h6> Can not get Accounts,please reload
                                                                        the page</h6>

                                                                </div>
                                                            @endif
                                                            @endif
                                                        </div>
                                                        <!--end::Body-->
                            </div>
                            <!--end::Accounts-->
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-xl-4 card-stretch">
                            <!--begin::Rss-->
                            <div class="card card-custom gutter-b card-stretch" id="ss-topRssDiv">
                                <!--begin::Header-->
                                <div class="card-header border-0 py-5">
                                    <h3 class="card-title font-weight-bolder">Recently Searched Top 5 RSS Links</h3>
                                    <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                         title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                        <span node-id="ss-topRssDiv_md4" class="ss addtcartclose"></span>
                                    </div>
                                    <span class="spinner spinner-primary spinner-center" id="ss-topRssDiv_md4" style="
    display: none;"></span>
                                </div><!--end::Header-->

                                <!--begin::Body-->
                                <div class="card-body pt-2 position-relative overflow-hidden">
                                    <!--begin::URL list-->
                                    @if(isset($rssurls['data']) && !empty($rssurls['data']))
                                        <div class="table-responsive">
                                            <table class="table table-borderless table-vertical-center">
                                                <thead>
                                                <tr>
                                                    <th class="p-0"></th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                @foreach($rssurls['data'] as $data)
                                                    <tr>
                                                        <td class="pl-0">
                                                            <div class="text-muted font-weight-bold d-block"
                                                                 id="title_id{{$data->_id}}" contenteditable="true"
                                                                 onblur="editFunction('{{$data->_id}}','{{$data->rssUrl}}','{{$data->description}}')">{{$data->title}}</div>
                                                            <a href="javascript:;"
                                                               class="font-weight-bolder text-hover-primary mb-1 font-size-lg"
                                                               onclick="viweFunction('{{$data->rssUrl}}')">{{$data->rssUrl}}</a>
                                                        </td>
                                                    </tr>
                                                @endforeach

                                                </tbody>
                                            </table>
                                        </div>
                                    @else
                                        <div class="text-center">
                                            <div class="symbol symbol-150">
                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                            </div>
                                            <h6>Currently, no RSS data.</h6>

                                        </div>
                                @endif
                                <!--end::URL list-->
                                </div>
                                <!--end::Body-->
                            </div>
                            <!--end::Rss-->
                        </div>
                        <div class="col-xl-8 card-stretch"
                             id="ss-publishHistoryDiv">
                            <!--begin::Rss-->
                            <div class="card card-custom gutter-b card-stretch">
                                <!--begin::Header-->
                                <div class="card-header border-0 py-5">
                                    <h3  class="card-title  text-hover-primary font-weight-bolder"> <a href="/home/publishing/schedule/history">Publishing History </a></h3>
                                    <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                         title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                        <span node-id="ss-publishHistoryDiv_md8" class="ss addtcartclose"></span>
                                    </div>
                                    <span class="spinner spinner-primary spinner-center" id="ss-publishHistoryDiv_md8"
                                          style="
    display: none;"></span>
                                </div>
                                <!--end::Header-->

                                <!--begin::Body-->
                                <div class="card-body pt-2 position-relative overflow-hidden">
                                    <!--begin::Table-->
                                    @if(isset($scheduleHistory) && !empty($scheduleHistory['data']->postContents))
                                        <div class="scroll scroll-pull" data-scroll="true" data-wheel-propagation="true"
                                             style="max-height: 320px;overflow-y: scroll;">
                                            <div class="table-responsive">
                                                <table class="table table-head-custom table-head-bg table-borderless table-vertical-center history_publishing_mobile">
                                                    <thead>
                                                    <tr class="">
                                                        <th style="min-width: 100px" class="pl-7"><span class="">Post</span></th>
                                                        <th style="min-width: 150px">Type</th>
                                                        <th style="min-width: 150px">Date</th>
                                                        <th style="min-width: 130px">Status</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    @foreach($scheduleHistory['data']->postContents as $item)
                                                        <tr>
                                                            <td class="pl-0 py-8" >
                                                                <div class="d-flex align-items-center">
                                                                    <div class="symbol symbol-50 flex-shrink-0 mr-4">
                                                                        <div class="symbol-label">
                                                                            @if($item->postType == "Image" && $item->mediaUrl !== [])
                                                                                <img src="{{env('API_URL_PUBLISH').$item->mediaUrl[0]}}"
                                                                                     alt=""
                                                                                     style="height: inherit; width: inherit; object-fit: contain;">
                                                                            @elseif($item->postType == "Video" && $item->mediaUrl !== [])
                                                                                <video style="object-fit: contain;height: inherit; width: inherit;"
                                                                                       autoplay muted>
                                                                                    <source src="{{env('API_URL_PUBLISH').$item->mediaUrl[0]}}">
                                                                                    Your browser does not support
                                                                                    the
                                                                                    video tag.
                                                                                </video>
                                                                            @endif
                                                                        </div>
                                                                    </div>
                                                                    <div class="history_publishing">
                                                                        <div
                                                                           class="font-weight-bolder mb-1 font-size-lg">Post
                                                                            :
                                                                            {{$item->description}}</div>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            @if($item->scheduleCategory === 0)
                                                                <td>
                                                                <span class="font-weight-bolder d-block font-size-lg">
                                                                    Normal Schedule
                                                                </span>
                                                                </td>
                                                            @else
                                                                <td>
                                                                <span class="font-weight-bolder d-block font-size-lg">
                                                                    Day-Wise Schedule
                                                                </span>
                                                                </td>
                                                            @endif
                                                            @if($item->createdDate!== null)
                                                                <td>
                                                                <span class="font-weight-bolder d-block font-size-lg">
                                                                    {{date("d-m-Y", strtotime($item->createdDate))}}
                                                                </span>
                                                                </td>
                                                                <td>
                                                                    Posted
                                                                </td>
                                                            @endif
                                                        </tr>
                                                    @endforeach
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    @else
                                        <div class="text-center">
                                            <div class="symbol symbol-150">
                                                <img src="/media/svg/illustrations/no-accounts.svg"/>
                                            </div>
                                            <h6>Currently, no published posts are available.</h6>
                                        </div>
                                @endif
                                <!--end::Table-->
                                </div>
                                <!--end::Body-->
                            </div>
                            <!--end::Rss-->
                        </div>
                    </div>
                    <!--end::Row-->
                    <!--end::Dashboard-->
                </div>
                <!--end::Container-->
            </div>
            <!--end::Entry-->
        </div>
        <!--end::Content-->
        <!-- begin::Delete account modal-->

        <!-- begin:Invite button Modal-->
        <div class="modal fade" id="inviteModal" tabindex="-1" role="dialog"
             aria-labelledby="inviteModalLabel"
             aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-xl" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="inviteModalLabel">Add Accounts By
                            Invitation</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                            <i aria-hidden="true" class="ki ki-close"></i>
                        </button>
                    </div>
                    <div class="modal-body invite-input-browse">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <div class="card text-center px-2 py-3">
                                    <h6>Download Format</h6>
                                    <i class="icon-xl fas fa-download"
                                       onclick="location.href='excel-file'"
                                    >
                                    </i>
                                </div>
                            </div>
                            <div class="col-md-9">
                                <div class="card px-4 py-3">
                                    <div class="card-body p-0">
                                        <h6 class="text-right">Bulk Upload</h6>
                                        <div class="d-flex">
                                            <button type="submit" class="btn btn-primary mr-3"
                                                    onclick="bulkInvite();">
                                                Bulk Invite
                                            </button>
                                            <div class="custom-file">
                                                <input accept=".xlsx" class="custom-file-input"
                                                       id="upload-bulk"
                                                       name="files[]"
                                                       type="file">
                                                <lable for="custom-file" id="lableInvite"
                                                       class="custom-file-label w-90">Choose file
                                                </lable>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="table-responsive mt-5 pt-5" id="invitation-table">
                            <table class="table" id="socialRows">
                                <tbody>

                                <tr>
                                    <th>
                                        <button class="table-add btn btn-sm"><i
                                                    class="fa fa-plus pr-0"
                                                    onclick="addRow(1)"></i></button>
                                    </th>
                                    <th>Remove</th>
                                    <th>Social Media</th>
                                    <th>Team Name</th>
                                    <th>Username</th>
                                    <th>Email</th>
                                    <th>Account Name</th>
                                </tr>
                                <tr>
                                    <td></td>
                                    <td class="">
                                    </td>
                                    <td>
                                        <select class="form-control h-auto py-4"
                                                id="socialMediaSelected1"
                                                onchange="getSelectedSocialValue()">
                                            <option selected disabled>Select Account</option>
                                            <option value="Facebook">Facebook</option>
                                            <option value="Twitter">Twitter</option>
                                            <option value="Instagram">Instagram</option>
                                            <option value="LinkedIn">LinkedIn</option>
                                            <option value="InstagramBusiness">Instagram Business</option>
                                            <option value="Youtube">Youtube</option>
                                            <option value="LinkedInPage">LinkedInPage</option>
                                            <option value="FacebookPage">FaceBookPage</option>
                                        </select>
                                    </td>
                                    <td>
                                        <select class="form-control h-auto py-4" id="teamDropDown1"
                                                onchange="getSelectedTeamValue()">
                                        </select>
                                    </td>
                                    <td>
                                        <input id="userID1" type="text"
                                               class="form-control h-auto py-4"
                                               placeholder="Type User ID">
                                    </td>
                                    <td>
                                        <input id="emailID1" type="email"
                                               class="form-control h-auto py-4"
                                               placeholder="Email ID">
                                    </td>
                                    <td>
                                        <input id="accountName1" type="text"
                                               class="form-control h-auto py-4"
                                               placeholder="Account Name">
                                    </td>
                                </tr>

                                </tbody>
                            </table>

                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-primary" onclick="sendInvite()">Send
                            Invite
                        </button>
                        <button id="bulkInvites" type="button" class="btn btn-primary" onclick="bulkInvite()">Bulk
                            Invite
                        </button>
                        <button type="button" class="btn btn-secondary" data-dismiss="modal">Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <!-- end:Invite button Modal -->

        <div class="modal fade" id="feebdackModel" tabindex="-1" role="dialog" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Review us</h5>
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close" onclick="setSession()">
                            <i aria-hidden="true" class="ki ki-close"></i>
                        </button>
                    </div>
                    <div class="modal-body text-center">
                        <img src="media/png/feedback-img.png" style="max-width: 430px; margin-bottom: 16px;">
                        <p>If you have 1 minute, you can give us a review on AppSumo by clicking on the button below. It helps us a lot!!</p>
                        <a onclick="setCookie('reviewCoolie', userID);" data-dismiss="modal" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Don't Show it</a>
                        <a onclick="setTheCookie('reviewCoolie', userID,365);" aria-label="Close" href="https://appsumo.com/products/socioboard/#reviews" target="_blank" class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3">Review us on AppSumo</a>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <!-- end::Delete account modal-->

@endsection

@section('scripts')
    <script src="../assets/plugins/daterangepicker/daterangepicker.js"></script>
    <script src="../assets/plugins/daterangepicker/daterangepicker.js"></script>
    <script src="{{asset('js/accounts.js')}}"></script>
    <script>

        function setTheCookie(cname, cvalue, exdays) {
            $('#feebdackModel').modal('hide');
            const d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            let expires = "expires=" + d.toGMTString();
            document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
        }
        function lock(id, type, acctype) {
            var data = id;
            if (type == 1) {
                $.ajax({
                    url: '/lock-accounts/' + data,
                    type: 'GET',
                    processData: false,
                    cache: false,
                    success: function (response) {
                        if (response.code === 200) {
                            if (acctype === '2') {
                                toastr.success("Page Locked Successfully!", "", {
                                    timeOut: 1000,
                                    fadeOut: 1000,
                                    onHidden: function () {
                                        window.location.reload();
                                    }
                                });
                            } else {
                                toastr.success("Account Locked Successfully!", "", {
                                    timeOut: 1000,
                                    fadeOut: 1000,
                                    onHidden: function () {
                                        window.location.reload();
                                    }
                                });
                            }
                        } else if (response.code === 400) {
                            toastr.error(response.message, "Locking Error!");
                        } else if (response.code === 401) {
                            toastr.error(response.message, "Locking Failed!");
                        } else {
                            toastr.error(response.message, "Lock Error!");
                        }
                    },
                    error: function (error) {

                    }
                })
            } else if (type === 0) {
                $.ajax({
                    url: '/unlock-accounts/' + data,
                    type: 'GET',
                    processData: false,
                    cache: false,
                    success: function (response) {
                        if (response.code === 200) {
                            if (acctype === '2') {
                                toastr.success("Page Un-Locked Successfully!", "", {
                                    timeOut: 1000,
                                    fadeOut: 1000,
                                    onHidden: function () {
                                        window.location.reload();
                                    }
                                });
                            } else {
                                toastr.success("Account Un-Locked Successfully!", '', {
                                    timeOut: 1000,
                                    fadeOut: 1000,
                                    onHidden: function () {
                                        window.location.reload();
                                    }
                                });
                            }
                        } else if (response.code === 400) {
                            toastr.error(response.message, "Account Un-Locked Successfully!");
                        } else if (response.code === 401) {
                            toastr.error(response.message, "un-Locking failed!");
                        } else {
                            toastr.error(response.message, "un-Locking failed!");
                        }
                    },
                    error: function (error) {

                    }
                })
            }
        }

        //  Plan Details Start ****
        let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        let expire_date = '<?php echo(session()->get('user')['userDetails']['Activations']['account_expire_date']);?>';
        let plan_name = '<?php echo(session()->get('user')['userDetails']['userPlanDetails']['plan_name']);?>';
        let current_date = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
        let user_expire_date = moment(expire_date).tz(timezone).format('YYYY-MM-DD');
        let oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        let firstDate = new Date(current_date);
        let secondDate = new Date(user_expire_date);
        let diffDays = Math.round(Math.abs((firstDate - secondDate) / oneDay));
        @if (in_array(session()->get('user')['userDetails']['userPlanDetails']['plan_id'], [101, 102, 103]))
        $('#account_expire_date_id').empty().append('Lifetime Plan');
        @else
        $('#account_expire_date_id').empty().append(diffDays + ' Days remaining');
        @endif

        //  Plan Details End ****

        function getScheduledReports(timeInterval) {
            $.ajax({
                url: 'get-scheduled-reports-dashboard',
                type: 'GET',
                data: {
                    timeInterval, timezone
                },
                beforeSend: function () {
                    $('#line-adwords').empty();
                    $('.loader-class').remove();
                    $('#line-adwords').append('<div class="d-flex justify-content-center loader-class" >\n' +
                        '        <div class="spinner-border" role="status" style="display: none;">\n' +
                        '            <span class="sr-only">Loading...</span>\n' +
                        '        </div>\n' +
                        '\n' +
                        '        </div>');
                    $(".spinner-border").css("display", "block");

                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    if (response.data.code === 200) {
                        let date = [];
                        let published = [];
                        let postFailed = [];
                        let schedulePosts = [];
                        response.data.data.daywisesData.map(element => {
                            date.push(element.date);
                            published.push(element.postCount);
                            postFailed.push(element.postFailed);
                            schedulePosts.push(element.schedulePosts);
                        });
                        var optionsLine = {
                            chart: {
                                height: 328,
                                type: 'line',
                                zoom: {
                                    enabled: true
                                },
                                dropShadow: {
                                    enabled: true,
                                    top: 3,
                                    left: 2,
                                    blur: 4,
                                    opacity: 1,
                                }
                            },
                            tooltip: {
                                theme: 'dark'
                            },
                            stroke: {
                                curve: 'smooth',
                                width: 2
                            },
                            // colors: ["#3F51B5", '#2196F3'],
                            series: [{
                                name: "Scheduled",
                                data: schedulePosts
                            },
                                {
                                    name: "Published",
                                    data: published
                                },
                                {
                                    name: "Failed",
                                    data: postFailed
                                }
                            ],
                            markers: {
                                size: 6,
                                strokeWidth: 0,
                                hover: {
                                    size: 9
                                }
                            },
                            grid: {
                                show: true,
                                padding: {
                                    bottom: 0
                                }
                            },
                            labels: date,
                            xaxis: {
                                tooltip: {
                                    enabled: false
                                },
                                labels: {
                                    style: {
                                        fontSize: '8px'
                                    }
                                }
                            },
                            legend: {
                                position: 'top',
                                horizontalAlign: 'right',
                                offsetY: -20
                            }
                        }
                        var chartLine = new ApexCharts(document.querySelector('#line-adwords'), optionsLine);
                        chartLine.render();
                        $('#scheduledData').empty();
                        $('#failedData').empty();
                        $('#publishedData').empty();
                        $('#Scheduled').empty();
                        $('#socialProfileCount').empty();
                        $('#scheduledData').append(response.data.data.totalschedulePosts);
                        $('#failedData').append(response.data.data.totalpostFailed);
                        $('#publishedData').append(response.data.data.totalPost);
                    }
                }
            });
        }

        function getTeamReports(timeInterval) {
            $.ajax({
                url: 'get-scheduled-reports-dashboard',
                type: 'GET',
                data: {
                    timeInterval, timezone
                },
                beforeSend: function () {
                    $('#team-report').empty();
                    $('.loader-class').remove();
                    $('#team-report').append('<div class="d-flex justify-content-center loader-class" >\n' +
                        '        <div class="spinner-border" role="status" style="display: none;">\n' +
                        '            <span class="sr-only">Loading...</span>\n' +
                        '        </div>\n' +
                        '\n' +
                        '        </div>');
                    $(".spinner-border").css("display", "block");

                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    if (response.data.code === 200) {
                        $('#published').empty();
                        $('#Scheduled').empty();
                        $('#socialProfileCount').empty();
                        $('#totalPostCount').empty();
                        $('#published').append(response.data.data.totalPost);
                        $('#totalPostCount').append(response.data.data.totalPost);
                        $('#Scheduled').append(response.data.data.totalschedulePosts);
                        $('#socialProfileCount').append(response.socialAccCount);
                        var options = {
                            chart: {
                                height: 350,
                                type: "radialBar"
                            },
                            plotOptions: {
                                circle: {
                                    dataLabels: {
                                        showOn: "hover"
                                    }
                                }
                            },
                            series: [response.data.data.totalPost, response.data.data.totalPost, response.data.data.totalschedulePosts, response.socialAccCount],
                            labels: ["Total Post Count", "Publish", "Schedule Publish", "Social Profile Count"]
                        };

                        var chart = new ApexCharts(document.querySelector("#team-report"), options);

                        chart.render();

                    }

                }
            });
        }

        function editFunction(id, url, description) {
            let value = document.getElementById("title_id" + id).innerHTML;
            $.ajax({
                url: '/discovery/edit-rss-feeds',
                type: 'post',
                data: {
                    id: id,
                    title: value,
                    url: url,
                    description: description
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function (response) {
                    if (response.code === 200) toastr.success('Success');
                    else toastr.error(response.error);
                },
                error: function (error) {
                    toastr.error(error.error);
                }
            })
        }

        function displayFacebookPages() {
            $(".fb_page_div").css("display", "block");
            $("#facebook-tab-accounts").trigger("click");
        }

        function displayInstagramPages() {
            $(".insta_page_div").css("display", "block");
            $("#instagram-tab-accounts").trigger("click");
        }

        function displayLinkedInPages() {
            $(".linkedIn_Pages_div").css("display", "block");
            $("#linkedin-tab-accounts").trigger("click");
        }

        function displayTumblrPages() {//It displayes the tumbler pages from facebook account to modal in checkboxes to select
            $(".tb_page_div").css("display", "block");
        }

        function selectDateStats(data) {
            let timeInterval = parseInt(data.value);
            getScheduledReports(timeInterval);
        }

        function selectDateReports(data) {
            let timeInterval = parseInt(data.value);
            getTeamReports(timeInterval);
        }

        function followSBTwitter() {
            if ($('input.checkboxes2').is(':checked')) {
                $("#twitterButton").attr("href", "/add-accounts/twitterChecked");
            } else {
                $("#twitterButton").attr("href", "/add-accounts/Twitter");

            }
        }

        function setSession() {
            $.ajax({
                url: "/setSession",
                type: 'get',
            });
        }
        function keepTokenAlive() {
            $.ajax({
                url: '/keep-token-alive', //https://stackoverflow.com/q/31449434/470749
                method: 'post',
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                }
            }).then(function (result) {
                console.log(new Date() + ' ' + result + ' ' + $('meta[name="csrf-token"]').attr('content'));
            });
        }
        $(document).ready(function () {
            let reviewCookie = getCookie('reviewCoolie');
            if ((plan_id === 101 || plan_id === 102 || plan_id === 103 ) && (reviewCookie != userID) && offerSession !== 1 ){
                $('#feebdackModel').modal('show');
            }
            setInterval(keepTokenAlive, 1000 * 60 * 15); // every 15 mins

            $("#upload-bulk").change(function () {
                $('#lableInvite').html('File uploaded Successfully')
            });
            $("#home_tab").trigger("click");
            getScheduledReports(3);
            getTeamReports(3);
            appendTeams();
            $("#checkedPages").click(function () {
                var selected = [];
                $('#checkboxes input:checked').each(function () {
                    selected.push($(this).attr('name'));
                });
                $.ajax({
                    url: "/facebookPageAdd",
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
                                document.location.href = '{{env('APP_URL')}}dashboard';
                            }
                        } else if (response.code == 400) {
                            $('#addAccountsModal').modal('hide')
                            toastr.error(response.message);
                            document.location.href = '{{env('APP_URL')}}dashboard';
                        } else if (response.code == 500) {
                            $('#addAccountsModal').modal('hide')
                            toastr.error(response.message);
                            document.location.href = '{{env('APP_URL')}}dashboard';
                        }
                    },
                    error: function (error) {
                        toastr.error("Something went wrong.. Not able to add the accounts.")
//                    $('#error').text("Something went wrong.. Not able to create team");
                    }
                });
            });
            $("#checkedPages2").click(function () {
                var selected = [];
                $('#checkboxes3 input:checked').each(function () {
                    selected.push($(this).attr('name'));
                });
                $.ajax({
                    url: "/instagramPageAdd",
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
                                $('#addAccountsModal').modal('hide')
                                document.location.href = '{{env('APP_URL')}}dashboard';
                            }
                        } else if (response.code == 400) {
                            $('#addAccountsModal').modal('hide')
                            toastr.error(response.message);
                            document.location.href = '{{env('APP_URL')}}dashboard';
                        } else if (response.code == 500) {
                            $('#addAccountsModal').modal('hide')
                            toastr.error(response.message);
                            document.location.href = '{{env('APP_URL')}}dashboard';
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
                    url: "/linkedInPageAdd",
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
                                document.location.href = '{{env('APP_URL')}}dashboard';
                            }
                        } else if (response.code == 400) {
                            $('#addAccountsModal').modal('hide')
                            toastr.error(response.message);
                            document.location.href = '{{env('APP_URL')}}dashboard';
                        } else if (response.code == 500) {
                            $('#addAccountsModal').modal('hide')
                            toastr.error(response.message);
                            document.location.href = '{{env('APP_URL')}}dashboard';
                        }
                    },
                    error: function (error) {
                        toastr.error("Something went wrong.. Not able to add the accounts.")
//                    $('#error').text("Something went wrong.. Not able to create team");
                    }
                });
            });
        });

        $('#calendarPost,#scheduledPost,#name,#connectedButton,#quick_actions').tooltip();

        function deleteSocialAcc(id, type) {
            $.ajax({
                url: 'delete-social-account',
                data: {accid: id},
                type: 'get',
                dataType: 'json',
                success: function (response) {
                    if (response.code === 200) {
                        // $('div#accountsSection' + id).remove();
                        if (type === '2') {
                            toastr.success("Page Deleted Successfully!", "", {
                                timeOut: 1000,
                                fadeOut: 1000,
                                onHidden: function () {
                                    window.location.reload();
                                }
                            });
                        } else {
                            toastr.success("Account Deleted Successfully!", "", {
                                timeOut: 1000,
                                fadeOut: 1000,
                                onHidden: function () {
                                    window.location.reload();
                                }
                            });
                        }
                    } else if (response.code === 400) {
                        toastr.error(response.message, "Unable to delete Account");
                    } else {
                        toastr.error('Some error occurred', "Unable to delete Account");
                    }
                }
            });
        }


        $("#checkedPages4").click(function () {
            let selected = [];
            $('#checkboxes3 input:checked').each(function () {
                selected.push($(this).attr('name'));
            });
            $.ajax({
                url: "/tumblrPageAdd",
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
                                text: "Could not add Tumblr accounts as " + response.errorIds + "... Already added!!",
                            });
                        } else {
                            toastr.success("Tumblr accounts added successfully!");
                            $('#addAccountsModal').modal('hide');
                            location.reload();
                        }
                    } else if (response.code == 400) {
                        $('#addAccountsModal').modal('hide')
                        toastr.error(response.message);
                        document.location.href = '{{env('APP_URL')}}dashboard';
                    } else if (response.code == 500) {
                        $('#addAccountsModal').modal('hide')
                        toastr.error(response.message);
                        document.location.href = '{{env('APP_URL')}}dashboard';
                    }
                },
                error: function (error) {
                    toastr.error("Something went wrong.. Not able to add the accounts.")
//                    $('#error').text("Something went wrong.. Not able to create team");
                }
            });

        });

        $fbp = {{$facebookpages}}
            $inp = {{$instagrampages}}
            $linp = {{$LinkedInpages}}
            $tbp =
                {{$bloggedpages}}
                if($fbp === 1)
        {
            $('#addAccountsModal').modal('show');
            displayFacebookPages();
        }
        if ($inp === 1) {
            $('#addAccountsModal').modal('show');
            displayInstagramPages();
        }
        if ($linp === 1) {
            $('#addAccountsModal').modal('show');
            displayLinkedInPages();
        }

        if ($tbp === 1) {
            $('#addAccountsModal').modal('show');
            displayTumblrPages();
            $("#tumblr-tab-accounts").trigger("click");

        }
        $('#calendarPost,#scheduledPost').tooltip();

    </script>


@endsection