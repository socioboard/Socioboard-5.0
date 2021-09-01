<!DOCTYPE html>
<html lang="en">
<!--begin::Head-->
<head>
    <!-- Google Analytics -->
    <script>
        window.ga = window.ga || function () {
            (ga.q = ga.q || []).push(arguments)
        };
        ga.l = +new Date;
        ga('create', 'UA-153612010-1', 'auto');
        ga('send', 'pageview');
    </script>
    <script async src='https://www.google-analytics.com/analytics.js'></script>
    <!-- End Google Analytics -->

    <!-- Hotjar Tracking Code for https://appv5.socioboard.com/login -->
    <script>
        (function (h, o, t, j, a, r) {
            h.hj = h.hj || function () {
                (h.hj.q = h.hj.q || []).push(arguments)
            };
            h._hjSettings = {hjid: 2537425, hjsv: 6};
            a = o.getElementsByTagName('head')[0];
            r = o.createElement('script');
            r.async = 1;
            r.src = t + h._hjSettings.hjid + j + h._hjSettings.hjsv;
            a.appendChild(r);
        })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=');
    </script>

@include('user::Layouts._header')
@yield('links')
<!--end::Global Theme Styles-->

    <!--begin::Layout Themes(used by all pages)-->
    <!--end::Layout Themes-->
    <link rel="shortcut icon" href="{{asset('public/media/logos/favicon.ico')}}"/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.1.0/css/font-awesome.min.css">
    <style>
        #notification {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: auto;
            color: red;
        }
    </style>

</head>
<!--end::Head-->

<!--begin::Body-->
<body id="Sb_body" class="header-fixed header-mobile-fixed subheader-enabled page-loading">
<!--begin::Main-->
<!--begin::Header Mobile-->
<div id="Sb_header_mobile" class="header-mobile header-mobile-fixed ">
    <!--begin::Logo-->
    <a onclick="planCheck('{{env('APP_URL')}}dashboard')">
        <img alt="SocioBoard" src="{{asset('media/logos/sb-icon.svg')}}" style="width: 50px;" class="max-h-30px mt-5"/>
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
                    <div class=" container-fluid ">
                        <!--begin::Left-->
                        <div class="d-none d-lg-flex align-items-center mr-3">
                            <!--begin::Logo-->
                            <a class="mr-2" onclick="planCheck({{env('APP_URL')}}dashboard)">
                                <img alt="SocioBoard" src="{{asset('media/logos/sb-icon.svg')}}" style="width: 50px;"
                                     class="max-h-35px mt-5"/>
                            </a>
                            <!--end::Logo-->

                            <!--begin::Tab Navs(for desktop mode)-->
                            <ul class="header-tabs nav align-self-end font-size-lg" role="tablist">
                                <!--begin::Item-->
                                <li class="nav-item">
                                    <a href="#" class="nav-link py-4 px-6 " data-toggle="tab" id="home_tab"
                                       data-target="#Sb_header_dashboard" role="tab">
                                        Home
                                    </a>
                                </li>
                                <!--end::Item-->


                                <!--begin::Item-->
                                <li class="nav-item mr-3">
                                    <a href="#" id="discovery"
                                       class="nav-link py-4 px-6 {{ request()->is('discovery*') ? 'active' : 'no-active'  }}"
                                       data-toggle="tab"
                                       data-target="#Sb_header_discovery" role="tab">
                                        Discovery
                                    </a>
                                </li>
                                <!--end::Item-->

                                <!--begin::Item-->
                                <li class="nav-item mr-3">
                                    <a href="#" class="nav-link py-4 px-6" data-toggle="tab"
                                       data-target="#Sb_header_reports" role="tab" id="reportsButton">
                                        Reports
                                    </a>
                                </li>
                                <!--end::Item-->

                                <!--begin::Item-->
                                <li class="nav-item mr-3">
                                    <a href="#" id="boards" class="nav-link py-4 px-6" data-toggle="tab"
                                       data-target="#Sb_header_boards" role="tab">
                                        Boards
                                    </a>
                                </li>
                                <!--end::Item-->

                                <!--begin::Item-->
                                <li class="nav-item mr-3">
                                    <a href="#" id="imageLibrary" class="nav-link py-4 px-6" data-toggle="tab"
                                       data-target="#Sb_header_library" role="tab">
                                        Image Library
                                    </a>
                                </li>
                                <!--end::Item-->

                                <!--begin::Item-->
                                <li class="nav-item mr-3">
                                    <a href="#" class="nav-link py-4 px-6" data-toggle="tab"
                                       data-target="#Sb_header_chat" role="tab">
                                        Chat
                                    </a>
                                </li>
                                <!--end::Item-->
                            </ul>
                            <!--begin::Tab Navs-->
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
                            <div class="dropdown mr-2">
                                <!--begin::Toggle-->
                                <div class="topbar-item">
                                    <a id="reportsCart" onclick="planCheck('{{env('APP_URL')}}get-reports-Images')"
                                       title="Custom Reports" class="btn btn-icon btn-dropdown btn-lg mr-1 reports-btn">
                                                <span class="symbol svg-icon svg-icon-xl">
                                                    <i class="fas fa-chart-line"></i>
                                                    <span class="badge badge-danger badge-pill"
                                                          id="reportsCount"></span>
                                                </span>
                                    </a>
                                </div>
                                <!--end::Toggle-->

                            </div>
                            <!--begin::Notifications-->
                            <div class="dropdown">
                                <!--begin::Toggle-->
                                <div id="nofifications" class="topbar-item notificationsIcon" data-toggle="dropdown"
                                     disabled
                                     title="Notifications" data-offset="10px,0px"
                                     onclick="checkPlanExpiryNotifications()">
                                    <div class="btn btn-icon btn-dropdown btn-lg mr-1 pulse pulse-danger">
                                                <span class="symbol svg-icon svg-icon-xl">
                                                    <i class="fas fa-bell"></i>
                                                <i id="notification-user"></i>
                                                </span>
                                        <span class="pulse-ring"></span>
                                    </div>
                                </div>
                                <!--end::Toggle-->

                                <!--begin::Dropdown-->
                                <div
                                        class="dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim-up dropdown-menu-lg"
                                        id="notificationsButton">
                                    <form>
                                        <!--begin::Header-->
                                        <div class="d-flex flex-column pt-5 bgi-size-cover bgi-no-repeat rounded-top"
                                             style="background-image: url("{{asset('media/misc/bg-1.jpg')}}")">
                                        <!--begin::Title-->
                                        <h4 class="d-flex flex-center rounded-top">
                                            <span class="text-white">User Notifications</span>
                                        </h4>
                                        <!--end::Title-->

                                        <!--begin::Tabs-->
                                        <ul class="nav nav-bold nav-tabs nav-tabs-line nav-tabs-line-3x nav-tabs-line-active-border-success mt-3 px-8"
                                            role="tablist">
                                            {{--                                            <li class="nav-item">--}}
                                            {{--                                                <a class="nav-link active show" data-toggle="tab"--}}
                                            {{--                                                   href="#topbar_notifications_notifications">All</a>--}}
                                            {{--                                            </li>--}}
                                            {{--                                            <li class="nav-item">--}}
                                            {{--                                                <a class="nav-link" data-toggle="tab"--}}
                                            {{--                                                   href="#topbar_notifications_publishing">Publishing</a>--}}
                                            {{--                                            </li>--}}
                                            <li class="nav-item">
                                                <a class="nav-link" data-toggle="tab" id="teams_tab"
                                                   href="#topbar_notifications_teams">Teams</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-toggle="tab" href="#topbar_activity_log"
                                                   onclick="clickFunction()">Activity log
                                                </a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-toggle="tab"
                                                   href="#topbar_user_log">User</a>
                                            </li>
                                            <li class="nav-item">
                                                <a class="nav-link" data-toggle="tab"
                                                   href="#topbar_publishing">publishing</a>
                                            </li>
                                        </ul>
                                        <!--end::Tabs-->
                                </div>
                                <!--end::Header-->

                                <!--begin::Content-->
                                <div class="tab-content">
                                    <!--begin::Tabpane-->
                                    <!--end::Tabpane-->

                                    <!--begin::Tabpane-->
                                    <div class="tab-pane" id="topbar_notifications_publishing" role="tabpanel">
                                        <!--begin::Nav-->
                                        <div class="navi navi-hover scroll my-4" data-scroll="true" data-height="300"
                                             data-mobile-height="200">
                                            <!--begin::Item-->
                                            <a href="#" class="navi-item">
                                                <div class="navi-link">
                                                    <div class="navi-icon mr-2">
                                                        <i class="flaticon2-line-chart text-success"></i>
                                                    </div>
                                                    <div class="navi-text">
                                                        <div class="font-weight-bold">
                                                            New report has been received
                                                        </div>
                                                        <div class="text-muted">
                                                            23 hrs ago
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                            <!--end::Item-->

                                            <!--begin::Item-->
                                            <a href="#" class="navi-item">
                                                <div class="navi-link">
                                                    <div class="navi-icon mr-2">
                                                        <i class="flaticon2-paper-plane text-danger"></i>
                                                    </div>
                                                    <div class="navi-text">
                                                        <div class="font-weight-bold">
                                                            Finance report has been generated
                                                        </div>
                                                        <div class="text-muted">
                                                            25 hrs ago
                                                        </div>
                                                    </div>
                                                </div>
                                            </a>
                                            <!--end::Item-->
                                        </div>
                                        <!--end::Nav-->
                                    </div>
                                    <!--end::Tabpane-->

                                    <!--begin::Tabpane-->
                                    <div class="tab-pane" id="topbar_notifications_teams" role="tabpanel">
                                        <!--begin::Nav-->
                                        <div class="scroll pr-7 mr-n7" data-scroll="true" data-height="300"
                                             data-mobile-height="200" id="invitation"
                                             style="max-height: 300px;overflow-y: scroll;">
                                            <!--begin::Item-->
                                            <!--end::Nav-->
                                        </div>
                                        <div class="d-flex align-items-center mt-4 ml-4" id="readAllTeam">
                                            <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4">
                                                <input type="checkbox" value="1" id="checkboxes1"/>
                                                <span></span>
                                            </label>
                                            <span>Read all team notifications</span>
                                        </div>
                                        <hr>
                                    </div>
                                    <!--end::Tabpane-->
                                    <div class="tab-pane" id="topbar_activity_log" role="tabpanel">
                                        <!--begin::Scroll-->
                                        <div class="scroll pr-7 mr-n7" data-scroll="true" data-height="100"
                                             data-mobile-height="200" id="recent_activities"
                                             style="max-height: 300px;overflow-y: scroll;">

                                        </div>
                                        <!--end::Scroll-->

                                        <!--begin::Action-->
                                        <div class="d-flex flex-center mb-3 pt-7"></div>
                                        <!--end::Action-->
                                    </div>

                                    <div class="tab-pane" id="topbar_user_log" role="tabpanel">
                                        <!--begin::Scroll-->
                                        <div class="scroll pr-7 mr-n7" data-scroll="true" data-height="100"
                                             data-mobile-height="200" id="userNotiFications"
                                             style="max-height: 300px;overflow-y: scroll;">
                                        </div>
                                        <div class="d-flex align-items-center mt-4 ml-4" id="readAllUser">
                                            <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4">
                                                <input type="checkbox" id="checkboxes2" value="1"/>
                                                <span></span>
                                            </label>
                                            <span>Read all User notifications</span>
                                        </div>
                                        <hr>
                                        <!--end::Action-->
                                    </div>

                                    <div class="tab-pane" id="topbar_publishing" role="tabpanel">
                                        <!--begin::Scroll-->
                                        <div class="scroll pr-7 mr-n7" data-scroll="true" data-height="100"
                                             data-mobile-height="200" id="publishNotiFications"
                                             style="max-height: 300px;overflow-y: scroll;">
                                        </div>
                                        <div class="d-flex align-items-center mt-4 ml-4" id="readAllPublish">
                                            <label class="checkbox checkbox-lg checkbox-lg flex-shrink-0 mr-4">
                                                <input type="checkbox" id="checkboxes2" value="1"/>
                                                <span></span>
                                            </label>
                                            <span>Read all publishing notifications</span>
                                        </div>
                                        <hr>
                                        <!--end::Action-->
                                    </div>
                                </div>
                                <!--end::Content-->
                                </form>
                            </div>
                            <!--end::Dropdown-->
                        </div>
                        <!--end::Notifications-->

                        <!--begin::Chat-->
                        <div class="topbar-item mr-2">
                            <div class="btn btn-icon btn-lg" data-toggle="modal" data-target="" title="Coming Soon"
                                 id="chats">
                                        <span class="svg-icon svg-icon-xl">
                                            <i class="fas fa-comments"></i>
                                        </span>
                            </div>
                        </div>
                        <!--end::Chat-->
                        <!--begin::Team-->
                        <div class="dropdown">
                            <!--begin::User-->
                            <div class="topbar-item" data-toggle="dropdown" data-offset="10px,0px"
                                 onclick="teamCount()">
                                <div class="btn btn-icon btn-dropdown w-lg-auto d-flex align-items-center btn-lg px-2"
                                     id="Sb_team">
                                    <div class="d-flex flex-column text-right pr-lg-3">
                                        <span
                                                class="font-weight-bold font-size-sm d-none d-md-inline"><?php if (isset(session()->get('team')['teamName'])) echo session()->get('team')['teamName']; else  echo 'N/A' ?></span>

                                        <span class="font-weight-bolder font-size-sm d-none d-md-inline">Team</span>

                                        <?php if (isset(session()->get('team')['teamName'])) $team = session()->get('team')['teamName']; else  $team = 'N/A' ?>
                                    </div>
                                    <span class="symbol symbol-35">
                                                    <span class="symbol-label font-size-h5 font-weight-bold ">{{strtoupper(substr($team,0,1))}}T</span>
                                                </span>
                                </div>
                            </div>
                            <!--end::User-->

                            <!--begin::Dropdown-->
                            <div class="dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim-up dropdown-menu-lg">
                                <!--begin:Header-->
                                <div class="d-flex flex-column flex-center py-3 bgi-size-cover bgi-no-repeat rounded-top">
                                    <h4 class="font-weight-bold">
                                        <?php if (isset(session()->get('team')['teamName'])) echo session()->get('team')['teamName']; else  echo 'N/A' ?>
                                        Team
                                    </h4>
                                </div>
                                <!--end:Header-->

                                <!--begin:Nav-->
                                <div class="row row-paddingless" id="team_count">

                                </div>
                                <!--end:Nav-->
                            </div>
                            <!--end::Dropdown-->
                        </div>
                        &nbsp;&nbsp;
                        <!--end::Team-->

                        <!--begin::User-->
                        <div class="topbar-item">
                            <div class="btn btn-icon w-lg-auto d-flex align-items-center btn-lg px-2"
                                 id="Sb_quick_user_toggle">
                                <div class="d-flex flex-column text-right pr-lg-3">
                                    <span
                                            class="font-weight-bold font-size-sm d-none d-md-inline"><?php if (isset(session()->get('user')['userDetails']['first_name']) && (session()->get('user')['userDetails']['first_name'] != "nil")) echo session()->get('user')['userDetails']['first_name']; else   echo '' ?>
</span>
                                    <span
                                            class="font-weight-bolder font-size-sm d-none d-md-inline"><?php if (isset(session()->get('user')['userDetails']['last_name']) && (session()->get('user')['userDetails']['last_name'] != "nil")) echo session()->get('user')['userDetails']['last_name']; else  echo '' ?></span>
                                </div>
                                <span class="symbol symbol-35">
                                                <span class="symbol-label font-size-h5 font-weight-bold "><img
                                                            src="<?php echo SquareProfilePic(); ?>"
                                                            id="header_image_out"
                                                            class="symbol-label font-size-h5 font-weight-bold "></span>
                                            </span>
                            </div>
                        </div>
                        <!--end::User-->
                    </div>
                    <!--end::Topbar-->
                </div>
                <!--end::Container-->
            </div>
            <!--end::Top-->

            <!--begin::Bottom-->
            <div class="header-bottom">
                <!--begin::Container-->
                <div class=" container-fluid ">
                    <!--begin::Header Menu Wrapper-->
                    <div class="header-navs header-navs-left" id="Sb_header_navs">
                        <!--begin::Tab Navs(for tablet and mobile modes)-->
                        <ul class="header-tabs p-5 p-lg-0 d-flex d-lg-none nav nav-bold nav-tabs" role="tablist">
                            <!--begin::Item-->
                            <li class="nav-item mr-2">
                                <a href="#" class="nav-link btn btn-clean active" data-toggle="tab"
                                   data-target="#Sb_header_dashboard" role="tab">
                                    Home
                                </a>
                            </li>
                            <!--end::Item-->

                            <!--begin::Item-->
                            <li class="nav-item mr-2">
                                <a href="#" class="nav-link btn btn-clean" data-toggle="tab"
                                   data-target="#Sb_header_discovery" role="tab">
                                    Discovery
                                </a>
                            </li>
                            <!--end::Item-->

                            <!--begin::Item-->
                            <li class="nav-item mr-2">
                                <a href="#" class="nav-link btn btn-clean" data-toggle="tab"
                                   data-target="#Sb_header_reports" role="tab" id="reportsButton">
                                    Reports
                                </a>
                            </li>
                            <!--end::Item-->

                            <!--begin::Item-->
                            <li class="nav-item mr-3">
                                <a href="#" class="nav-link py-4 px-6" data-toggle="tab" data-target="#Sb_header_boards"
                                   role="tab">
                                    Boards
                                </a>
                            </li>
                            <!--end::Item-->

                            <!--begin::Item-->
                            <li class="nav-item mr-3">
                                <a href="#" class="nav-link py-4 px-6" data-toggle="tab"
                                   data-target="#Sb_header_library" role="tab">
                                    Image Library
                                </a>
                            </li>
                            <!--end::Item-->

                            <!--begin::Item-->
                            <li class="nav-item mr-3">
                                <a href="#" class="nav-link py-4 px-6" data-toggle="tab" data-target="#Sb_header_chat"
                                   role="tab">
                                    Chat
                                </a>
                            </li>
                            <!--end::Item-->

                        </ul>
                        <!--begin::Tab Navs-->

                        <!--begin::Tab Content-->
                        <div class="tab-content">
                            <!--begin::Dashboard Tab Pane-->
                            <div class="tab-pane py-5 p-lg-0 show @if(request()->is('dashboard*') || request()->is('home*')) {{'active'}} @endif"
                                 id="Sb_header_dashboard">
                                <!--begin::Menu-->
                                <div id="Sb_header_menu"
                                     class="header-menu header-menu-mobile  header-menu-layout-default ">
                                    <!--begin::Nav-->
                                    <ul class="menu-nav ">
                                        <li class="menu-item " aria-haspopup="true">
                                            <a onclick="planCheck('{{env('APP_URL')}}dashboard')"
                                               class="menu-link btn font-weight-bold my-2 my-lg-0 mr-3">
                                                <span class="menu-text"><i class="fas fa-tachometer-alt fa-fw"></i> Dashboard</span>
                                            </a>
                                        </li>
                                        <li class="menu-item menu-item-submenu menu-item-rel" data-menu-toggle="click"
                                            aria-haspopup="true">
                                            <a href="javascript:;"
                                               class="menu-link menu-toggle btn font-weight-bold my-2 my-lg-0 mr-3">
                                                <span class="menu-text"><i
                                                            class="fas fa-film fa-fw"></i> Publishing</span>
                                                <span class="menu-desc"></span><i class="menu-arrow"></i>
                                            </a>
                                            <div class="menu-submenu menu-submenu-classic menu-submenu-left">
                                                <ul class="menu-subnav">
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="{{route('publish_content.scheduling')}}"
                                                           class="menu-link">
                                                            <span class="menu-text">Schedule Messages</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="{{route('youtube-publish')}}"
                                                           class="menu-link">
                                                            <span class="menu-text">Youtube Publish</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="{{route('schedule-ready-queue-history')}}"
                                                           class="menu-link">
                                                            <span class="menu-text">SocioQueue</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="{{route('schedule-day-wise-history')}}"
                                                           class="menu-link">
                                                            <span class="menu-text">Day Wise SocioQueue</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="{{route('drafts-history')}}" class="menu-link">
                                                            <span class="menu-text">Drafts</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="/calendar-view" class="menu-link"
                                                        >
                                                            <span class="menu-text">Calendar View</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="{{route('schedule-done-history')}}" class="menu-link">
                                                            <span class="menu-text">History</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li class="menu-item  menu-item-submenu menu-item-rel" data-menu-toggle="click"
                                            aria-haspopup="true">
                                            <a href="javascript:;"
                                               class="menu-link menu-toggle btn font-weight-bold my-2 my-lg-0 mr-3">
                                                <span class="menu-text"><i class="fas fa-people-arrows fa-fw"></i> Engagement</span>
                                                <span class="menu-desc"></span><i class="menu-arrow"></i>
                                            </a>
                                            <div class="menu-submenu menu-submenu-classic menu-submenu-left">
                                                <ul class="menu-subnav">
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="" class="menu-link" onclick="return false"
                                                           id="twitter_analyutics" title="Coming Soon">
                                                            <span class="menu-text">Twitter Analytics</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="" class="menu-link" onclick="return false"
                                                           id="twitter_inbox" title="Coming Soon">
                                                            <span class="menu-text">Twitter Inbox</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="" class="menu-link" onclick="return false" id="my_task"
                                                           title="Coming Soon">
                                                            <span class="menu-text">My Task</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="" class="menu-link" onclick="return false"
                                                           id="youtube_inbox" title="Coming Soon">
                                                            <span class="menu-text">Youtube Inbox</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                    </ul>
                                    <!--end::Nav-->
                                </div>
                                <!--end::Menu-->
                            </div>
                            <!--begin::Dashboard Tab Pane-->

                            <!--begin::Discovery Tab Pane-->
                            <div class="tab-pane py-5 p-lg-0 justify-content-between @if(request()->is('discovery/content_studio/*')) {{'active'}} @endif"
                                 id="Sb_header_discovery">
                                <!--begin::Menu-->
                                <div id="Sb_header_menu_1"
                                     class="header-menu header-menu-mobile  header-menu-layout-default">
                                    <!--begin::Nav-->
                                    <ul class="menu-nav">
                                        <li class="menu-item  menu-item-submenu menu-item-rel" data-menu-toggle="click"
                                            aria-haspopup="true">
                                            <a href="javascript:;"
                                               class="menu-link menu-toggle btn font-weight-bold my-2 my-lg-0 mr-3">
                                                <span class="menu-text"><i
                                                            class="fas fa-search fa-fw"></i> Discovery</span>
                                                <span class="menu-desc"></span><i class="menu-arrow"></i>
                                            </a>
                                            <div class="menu-submenu menu-submenu-classic menu-submenu-left">
                                                <ul class="menu-subnav">
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="javascript:;" class="menu-link menu-toggle"><i
                                                                    class="menu-bullet menu-bullet-dot"><span></span></i>
                                                            <span class="menu-text">Social</span><i
                                                                    class="menu-arrow"></i>
                                                        </a>
                                                        <div class="menu-submenu menu-submenu-classic menu-submenu-right">
                                                            <ul class="menu-subnav">
                                                                <li class="menu-item" aria-haspopup="true">

                                                                    <a href="/discovery/youtube"
                                                                       class="menu-link "><i
                                                                                class="menu-bullet menu-bullet-dot"><span></span></i>
                                                                        <span class="menu-text">YouTube</span></a>
                                                                </li>
                                                                <li class="menu-item" aria-haspopup="true">
                                                                    <a href="/discovery/twitter"
                                                                       class="menu-link "><i
                                                                                class="menu-bullet menu-bullet-dot"><span></span></i>
                                                                        <span class="menu-text">Twitter</span></a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="javascript:;" class="menu-link menu-toggle"><i
                                                                    class="menu-bullet menu-bullet-dot"><span></span></i>
                                                            <span class="menu-text">Search</span><i
                                                                    class="menu-arrow"></i>
                                                        </a>
                                                        <div
                                                                class="menu-submenu menu-submenu-classic menu-submenu-right">
                                                            <ul class="menu-subnav">
                                                                <li class="menu-item" aria-haspopup="true">
                                                                    <a href="" title="Coming Soon"
                                                                       onclick="return false" id="discovery_id"
                                                                       class="menu-link "><i
                                                                                class="menu-bullet menu-bullet-dot"><span></span></i>
                                                                        <span class="menu-text">Discovery</span></a>
                                                                </li>
                                                                <li class="menu-item" aria-haspopup="true">
                                                                    <a href="" title="Coming Soon"
                                                                       onclick="return false" id="smart_search_id"
                                                                       class="menu-link "><i
                                                                                class="menu-bullet menu-bullet-dot"><span></span></i>
                                                                        <span class="menu-text">Smart Search</span></a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="javascript:;" class="menu-link menu-toggle">
                                                            <i class="menu-bullet menu-bullet-dot"><span></span></i>
                                                            <span class="menu-text">Group Post</span><i
                                                                    class="menu-arrow"></i>
                                                        </a>
                                                        <div
                                                                class="menu-submenu menu-submenu-classic menu-submenu-right">
                                                            <ul class="menu-subnav">
                                                                <li class="menu-item" aria-haspopup="true">
                                                                    <a href="" title="Coming Soon"
                                                                       onclick="return false" id="facebook_group_post"
                                                                       class="menu-link ">
                                                                        <i class="menu-bullet menu-bullet-dot"><span></span></i>
                                                                        <span
                                                                                class="menu-text">Facebook Group Post</span>
                                                                    </a>
                                                                </li>
                                                                <li class="menu-item" aria-haspopup="true">
                                                                    <a href="" title="Coming Soon"
                                                                       onclick="return false" id="linkedin_group_post"
                                                                       class="menu-link ">
                                                                        <i class="menu-bullet menu-bullet-dot"><span></span></i>
                                                                        <span
                                                                                class="menu-text">Linkedin Group Post</span>
                                                                    </a>
                                                                </li>
                                                            </ul>
                                                        </div>
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li class="menu-item  menu-item-submenu menu-item-rel" data-menu-toggle="click"
                                            aria-haspopup="true">
                                            <a href="javascript:;"
                                               class="menu-link menu-toggle btn font-weight-bold my-2 my-lg-0 mr-3">
                                                <span class="menu-text"><i class="fas fa-images fa-fw"></i> Feeds</span>
                                                <span class="menu-desc"></span><i class="menu-arrow"></i>
                                            </a>
                                            <div class="menu-submenu menu-submenu-classic menu-submenu-left">
                                                <ul class="menu-subnav">
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a onclick="planCheck('{{env('APP_URL')}}feeds/facebook')"
                                                           class="menu-link">
                                                            <span class="menu-text">Facebook</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                                aria-haspopup="true">
                                                        <a onclick="planCheck('{{env('APP_URL')}}feeds/instagram')"
                                                           class="menu-link"
                                                        >
                                                            <span class="menu-text">Instagram</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a onclick="planCheck('{{env('APP_URL')}}feeds/Business')"
                                                           class="menu-link"
                                                        >
                                                            <span class="menu-text">Instagram Business</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a onclick="planCheck('{{env('APP_URL')}}feeds/twitter')"
                                                           class="menu-link">
                                                            <span class="menu-text">Twitter</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a onclick="planCheck('{{env('APP_URL')}}feeds/youtube')"
                                                           class="menu-link">
                                                            <span class="menu-text">Youtube</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a onclick="planCheck('{{env('APP_URL')}}feeds/linkedIn')" class="menu-link"
                                                           id="linkedinFeeds" >
                                                            <span class="menu-text">Linkedin</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li class="menu-item  menu-item-submenu menu-item-rel" data-menu-toggle="click"
                                            aria-haspopup="true">
                                            <a href="javascript:;"
                                               class="menu-link menu-toggle btn font-weight-bold my-2 my-lg-0 mr-3">
                                                <span class="menu-text"><i class="far fa-newspaper fa-fw"></i> Content Studio</span>
                                                <span class="menu-desc"></span><i class="menu-arrow"></i>
                                            </a>
                                            <div class="menu-submenu menu-submenu-classic menu-submenu-left">
                                                <ul class="menu-subnav">
                                                    <li id="imgur" class="menu-item  menu-item-submenu"
                                                        data-menu-toggle="hover" aria-haspopup="true">
                                                        <a onclick="planCheck('{{route('discovery.content_studio.imgur')}}')"
                                                           class="menu-link">
                                                            <span class="menu-text">Imgur</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true" id="flickr">
                                                        <a onclick="planCheck('{{route('discovery.content_studio.flickr')}}')"
                                                           class="menu-link">
                                                            <span class="menu-text">Flickr</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true" id="dailymotione">
                                                        <a onclick="planCheck('{{route('discovery.content_studio.dailymotione')}}')"
                                                           class="menu-link">
                                                            <span class="menu-text">Dailymotion</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true" id="newApi">
                                                        <a onclick="planCheck('{{route('discovery.content_studio.news_api')}}')"
                                                           class="menu-link">
                                                            <span class="menu-text">News_Api</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true" id="pixabay">
                                                        <a onclick="planCheck('{{route('discovery.content_studio.pixabay')}}')"
                                                           class="menu-link">
                                                            <span class="menu-text">Pixabay</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true" id="giphy">
                                                        <a onclick="planCheck('{{route('discovery.content_studio.giphy')}}')"
                                                           class="menu-link">
                                                            <span class="menu-text">Giphy</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true" id="mostShared">
                                                        <a href="" onclick="return false"
                                                           id="most_shared" title="Coming Soon"
                                                           class="menu-link">
                                                            <span class="menu-text">Most Shared</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true" id="trendingNow">
                                                        <a href="" onclick="return false"
                                                           id="trending_now" title="Coming Soon"
                                                           class="menu-link">
                                                            <span class="menu-text">Trending Now</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true" id="shareathonQueue">
                                                        <a href="" onclick="return false"
                                                           id="shereathon_queue" title="Coming Soon"
                                                           class="menu-link">
                                                            <span class="menu-text">Shareathon Queue</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li class="menu-item  menu-item-submenu menu-item-rel" data-menu-toggle="click"
                                            aria-haspopup="true">
                                            <a href="javascript:;"
                                               class="menu-link menu-toggle btn font-weight-bold my-2 my-lg-0 mr-3">
                                                <span class="menu-text"><i class="fas fa-rss fa-fw"></i> Automated RSS Feeds</span>
                                                <span class="menu-desc"></span><i class="menu-arrow"></i>
                                            </a>
                                            <div class="menu-submenu menu-submenu-classic menu-submenu-left">
                                                <ul class="menu-subnav">
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="" class="menu-link" onclick="return false"
                                                           id="conted_feeds_id" title="Coming Soon">
                                                            <span class="menu-text">Content Feeds</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="" class="menu-link" onclick="return false"
                                                           id="automated_rss_feeds" title="Coming Soon">
                                                            <span class="menu-text">Automated RSS Feeds</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="rss/posted.html" class="menu-link"
                                                           onclick="return false" id="posted_rss_feeds"
                                                           title="Coming Soon">
                                                            <span class="menu-text">Posted RSS Feeds</span>
                                                        </a>
                                                    </li>
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="/discovery/rss-feeds"
                                                           class="menu-link">
                                                            <span class="menu-text">RSS Feeds</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                        <li class="menu-item  menu-item-submenu menu-item-rel" data-menu-toggle="click"
                                            aria-haspopup="true">
                                            <a href="javascript:;" onclick="return false" id="ShareathonButton"
                                               title="Coming Soon"
                                               class="menu-link menu-toggle btn font-weight-bold my-2 my-lg-0 mr-3">
                                                <span class="menu-text"><i class="fas fa-share-alt-square fa-fw"></i> Shareathon</span>
                                                <span class="menu-desc"></span><i class="menu-arrow"></i>
                                            </a>
                                            <div class="menu-submenu menu-submenu-classic menu-submenu-left">
                                                <ul class="menu-subnav">
                                                    <li class="menu-item  menu-item-submenu" data-menu-toggle="hover"
                                                        aria-haspopup="true">
                                                        <a href="#" class="menu-link" onclick="return false"
                                                           id="Shareathon" title="Coming Soon">
                                                            <span class="menu-text">Page Shareathon</span>
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </li>
                                    </ul>
                                    <!--end::Nav-->
                                </div>
                                <!--end::Menu-->
                            </div>
                            <!--begin::Discovery Tab Pane-->

                            <!--begin::reports Tab Pane-->
                            <div class="tab-pane p-5 p-lg-0 justify-content-between" id="Sb_header_reports">
                                <div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center">
                                    <!--begin::Actions-->
                                    <a href="#"
                                       class="btn font-weight-bold mr-3 my-2 my-lg-0"
                                       onclick="return false" id="archiveReports" title="Coming Soon">
                                        <i class="fas fa-clipboard-check fa-fw"></i> Archived Report
                                    </a>

                                    <a href="#"
                                       class="btn font-weight-bold mr-3 my-2 my-lg-0" onclick="return false"
                                       id="primitiveReports"
                                       title="Coming Soon">
                                        <i class="fas fa-notes-medical fa-fw"></i> Primitive Report
                                    </a>

                                    <a onclick="planCheck('{{env('APP_URL')}}get-team-reports')"
                                       class="btn font-weight-bold mr-3 my-2 my-lg-0">
                                        <i class="fas fa-id-badge fa-fw"></i> Team Report
                                    </a>
                                    <!--end::Actions-->
                                    <a onclick="planCheck('{{env('APP_URL')}}get-twitter-reports')"
                                       class="btn font-weight-bold mr-3 my-2 my-lg-0">
                                        <i class="fas fa-id-badge fa-fw"></i> Twitter Report
                                    </a>

                                    <a onclick="planCheck('{{env('APP_URL')}}get-youtube-reports')"
                                       class="btn font-weight-bold mr-3 my-2 my-lg-0"
                                    >
                                        <i class="fas fa-id-badge fa-fw"></i> Youtube Report
                                    </a>

                                    <a onclick="planCheck('{{env('APP_URL')}}get-facebook-reports')"
                                       class="btn font-weight-bold mr-3 my-2 my-lg-0"
                                    >
                                        <i class="fas fa-id-badge fa-fw"></i> Facebook Report
                                    </a>
                                </div>
                            </div>
                            <!--begin::reports Tab Pane-->

                            <!--begin::Boards Tab Pane-->
                            <div class="tab-pane p-5 p-lg-0 justify-content-between" id="Sb_header_boards">
                                <div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center">
                                    <!--begin::Actions-->
                                    <a onclick="planCheck('{{env('APP_URL')}}boards/view-boards')"
                                       class="btn font-weight-bold mr-3 my-2 my-lg-0">
                                        <i class="fas fa-chalkboard fa-fw"></i> View Boards
                                    </a>

                                    <a onclick="planCheck('{{env('APP_URL')}}boards/create-boards')"
                                       class="btn font-weight-bold mr-3 my-2 my-lg-0">
                                        <i class="fas fa-chalkboard-teacher fa-fw"></i> Create Board
                                    </a>
                                    <!--end::Actions-->
                                </div>

                            </div>
                            <!--begin::Boards Tab Pane-->

                            <!--begin::Image Library Tab Pane-->
                            <div class="tab-pane p-5 p-lg-0 justify-content-between" id="Sb_header_library">
                                <div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center">
                                    <!--begin::Actions-->
                                    <a onclick="planCheck('{{env('APP_URL')}}imagelibary/public-images')"
                                       class="btn font-weight-bold mr-3 my-2 my-lg-0">
                                        <i class="fas fa-eye fa-fw"></i> Public
                                    </a>

                                    <a onclick="planCheck('{{env('APP_URL')}}imagelibary/private-images')"
                                       class="btn font-weight-bold mr-3 my-2 my-lg-0">
                                        <i class="fas fa-eye-slash fa-fw"></i> Private
                                    </a>

                                    <a onclick="planCheck('{{env('APP_URL')}}imagelibary/gallery-images')"
                                       class="btn font-weight-bold mr-3 my-2 my-lg-0">
                                        <i class="far fa-image"></i> Gallery
                                    </a>
                                    <!--end::Actions-->
                                </div>

                            </div>
                            <!--begin::Image Library Tab Pane-->

                            <!--begin::Chat Tab Pane-->

                            <div class="tab-pane p-5 p-lg-0 justify-content-between" id="Sb_header_chat">
                                <div class="d-flex flex-column flex-lg-row align-items-start align-items-lg-center">
                                    <!--begin::Actions-->
                                    <a href="" class="btn font-weight-bold mr-3 my-2 my-lg-0" title="Coming Soon"
                                       onclick="return false" id="group_chat">
                                        <i class="fas fa-comments fa-fw"></i> Group Chat
                                    </a>
                                    <!--end::Actions-->
                                </div>
                            </div>
                            <!--begin::Chat Tab Pane-->
                        </div>
                        <!--end::Tab Content-->
                    </div>
                    <!--end::Header Menu Wrapper-->
                </div>
                <!--end::Container-->
            </div>
            <!--end::Bottom-->
        </div>
        <br>
        <!--end::Header-->
    {{-- Begin content for login --}}
    @yield('content')
    <!-- begin::User Panel-->
        <div id="Sb_quick_user" class="offcanvas offcanvas-right p-10">
            <!--begin::Header-->
            <div class="offcanvas-header d-flex align-items-center justify-content-between pb-5">
                <h3 class="font-weight-bold m-0">
                    User Profile
                    {{--                    <small class="text-muted font-size-sm ml-2">12 messages</small>--}}
                </h3>
                <a href="#" class="btn btn-xs btn-icon btn-light btn-hover-primary" id="Sb_quick_user_close">
                    <i class="ki ki-close icon-xs text-muted"></i>
                </a>
            </div>
            <!--end::Header-->

            <!--begin::Content-->
            <div class="offcanvas-content pr-5 mr-n5">
                <!--begin::Header-->
                <div class="d-flex align-items-center mt-5">
                    <div class="symbol symbol-100 mr-5">
                        <div class="symbol-label" id="header_picture"
                             style="background-image:url(<?php echo SquareProfilePic(); ?>)"></div>
                        <i class="symbol-badge bg-success"></i>
                    </div>
                    <div class="d-flex flex-column">
                        <a href="#" class="text-truncate font-weight-bolder font-size-h5 text-hover-primary">
                            <?php if ((isset(session()->get('user')['userDetails']['first_name'])) && ((session()->get('user')['userDetails']['first_name'] !== "nil"))) echo session()->get('user')['userDetails']['first_name']; else  echo '' ?>
                            <?php if ((isset(session()->get('user')['userDetails']['last_name'])) && ((session()->get('user')['userDetails']['last_name'] !== "nil"))) echo session()->get('user')['userDetails']['last_name']; else  echo '' ?>
                        </a>
                        {{--                        <div class="text-muted mt-1">--}}
                        {{--                        </div>--}}
                        <div class="navi mt-2">
                            <a href="#" class="navi-item">
                            <span class="navi-link p-0 pb-2">
{{--                                <span class="navi-icon mr-1">--}}
                                {{--                                    <span class="svg-icon svg-icon-lg svg-icon-primary">--}}
                                {{--                                        <i class="fas fa-circle text-success"></i>--}}
                                {{--                                    </span>--}}
                                {{--                                </span>--}}
                                <span class="navi-text text-hover-primary"><?php if (isset(session()->get('user')['userDetails']['email'])) echo session()->get('user')['userDetails']['email']; else  echo '' ?></span>
                            </span>
                            </a>
                            <a href="/logout" class="btn btn-sm font-weight-bolder py-2 px-5" onclick="logoutUser()">Sign
                                Out</a>
                        </div>
                    </div>
                </div>
                <!--end::Header-->

                <!--begin::Separator-->
                <div class="separator separator-dashed mt-8 mb-5"></div>
                <!--end::Separator-->

                <!--begin::Nav-->
                <div class="navi navi-spacer-x-0 p-0">
                    <!--begin::Item-->
                    <a href="/profile-update" class="navi-item">
                        <div class="navi-link">
                            <div class="symbol symbol-40 bg-light mr-3">
                                <div class="symbol-label">
                                <span class="svg-icon svg-icon-md svg-icon-success"><!--begin::Svg Icon | path:assets/media/svg/icons/General/Notification2.svg-->
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                         width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <rect x="0" y="0" width="24" height="24"/>
                                            <path
                                                    d="M13.2070325,4 C13.0721672,4.47683179 13,4.97998812 13,5.5 C13,8.53756612 15.4624339,11 18.5,11 C19.0200119,11 19.5231682,10.9278328 20,10.7929675 L20,17 C20,18.6568542 18.6568542,20 17,20 L7,20 C5.34314575,20 4,18.6568542 4,17 L4,7 C4,5.34314575 5.34314575,4 7,4 L13.2070325,4 Z"
                                                    fill="#000000"/>
                                            <circle fill="#000000" opacity="0.3" cx="18.5" cy="5.5" r="2.5"/>
                                        </g>
                                    </svg><!--end::Svg Icon-->
                                </span>
                                </div>
                            </div>
                            <div class="navi-text">
                                <div class="font-weight-bold">
                                    My Profile
                                </div>
                                <div class="text-muted">
                                    Account Settings And More
                                    <span class="label label-light-danger label-inline font-weight-bold"><b>Update</b></span>
                                </div>
                            </div>
                        </div>
                    </a>
                    <!--end:Item-->

                    <!--begin::Item-->
                    {{--                    <a href="custom/apps/user/profile-3.html" class="navi-item">--}}
                    <a class="navi-item">
                        <div class="navi-link">
                            <div class="symbol symbol-40 bg-light mr-3">
                                <div class="symbol-label">
                                <span class="svg-icon svg-icon-md svg-icon-warning"><!--begin::Svg Icon | path:assets/media/svg/icons/Shopping/Chart-bar1.svg-->
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                         width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <rect x="0" y="0" width="24" height="24"/>
                                            <rect fill="#000000" opacity="0.3" x="12" y="4" width="3" height="13"
                                                  rx="1.5"/>
                                            <rect fill="#000000" opacity="0.3" x="7" y="9" width="3" height="8"
                                                  rx="1.5"/>
                                            <path
                                                    d="M5,19 L20,19 C20.5522847,19 21,19.4477153 21,20 C21,20.5522847 20.5522847,21 20,21 L4,21 C3.44771525,21 3,20.5522847 3,20 L3,4 C3,3.44771525 3.44771525,3 4,3 C4.55228475,3 5,3.44771525 5,4 L5,19 Z"
                                                    fill="#000000" fill-rule="nonzero"/>
                                            <rect fill="#000000" opacity="0.3" x="17" y="11" width="3" height="6"
                                                  rx="1.5"/>
                                        </g>
                                    </svg><!--end::Svg Icon-->
                                </span>
                                </div>
                            </div>
                            <div class="navi-text">
                                <div class="font-weight-bold" title="Coming Soon" id="my_messages_id">
                                    My Messages
                                </div>
                                <div class="text-muted">
                                    Inbox And Tasks
                                </div>
                            </div>
                        </div>
                    </a>
                    <!--end:Item-->

                    <!--begin::Item-->
                    {{--                    <a href="custom/apps/user/profile-2.html" class="navi-item">--}}
                    <a class="navi-item">
                        <div class="navi-link">
                            <div class="symbol symbol-40 bg-light mr-3">
                                <div class="symbol-label">
                                <span class="svg-icon svg-icon-md svg-icon-danger"><!--begin::Svg Icon | path:assets/media/svg/icons/Files/Selected-file.svg-->
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                         width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <polygon points="0 0 24 0 24 24 0 24"/>
                                            <path
                                                    d="M4.85714286,1 L11.7364114,1 C12.0910962,1 12.4343066,1.12568431 12.7051108,1.35473959 L17.4686994,5.3839416 C17.8056532,5.66894833 18,6.08787823 18,6.52920201 L18,19.0833333 C18,20.8738751 17.9795521,21 16.1428571,21 L4.85714286,21 C3.02044787,21 3,20.8738751 3,19.0833333 L3,2.91666667 C3,1.12612489 3.02044787,1 4.85714286,1 Z M8,12 C7.44771525,12 7,12.4477153 7,13 C7,13.5522847 7.44771525,14 8,14 L15,14 C15.5522847,14 16,13.5522847 16,13 C16,12.4477153 15.5522847,12 15,12 L8,12 Z M8,16 C7.44771525,16 7,16.4477153 7,17 C7,17.5522847 7.44771525,18 8,18 L11,18 C11.5522847,18 12,17.5522847 12,17 C12,16.4477153 11.5522847,16 11,16 L8,16 Z"
                                                    fill="#000000" fill-rule="nonzero" opacity="0.3"/>
                                            <path
                                                    d="M6.85714286,3 L14.7364114,3 C15.0910962,3 15.4343066,3.12568431 15.7051108,3.35473959 L20.4686994,7.3839416 C20.8056532,7.66894833 21,8.08787823 21,8.52920201 L21,21.0833333 C21,22.8738751 20.9795521,23 19.1428571,23 L6.85714286,23 C5.02044787,23 5,22.8738751 5,21.0833333 L5,4.91666667 C5,3.12612489 5.02044787,3 6.85714286,3 Z M8,12 C7.44771525,12 7,12.4477153 7,13 C7,13.5522847 7.44771525,14 8,14 L15,14 C15.5522847,14 16,13.5522847 16,13 C16,12.4477153 15.5522847,12 15,12 L8,12 Z M8,16 C7.44771525,16 7,16.4477153 7,17 C7,17.5522847 7.44771525,18 8,18 L11,18 C11.5522847,18 12,17.5522847 12,17 C12,16.4477153 11.5522847,16 11,16 L8,16 Z"
                                                    fill="#000000" fill-rule="nonzero"/>
                                        </g>
                                    </svg><!--end::Svg Icon-->
                                </span>
                                </div>
                            </div>
                            <div class="navi-text">
                                <div class="font-weight-bold" title="Coming Soon" id="my_activities_id">
                                    My Activities
                                </div>
                                <div class="text-muted">
                                    Logs And Notifications
                                </div>
                            </div>
                        </div>
                    </a>
                    <!--end:Item-->

                    <!--begin::Item-->
                    {{--                    <a href="custom/apps/userprofile-1/overview.html" class="navi-item">--}}
                    <a class="navi-item">
                        <div class="navi-link">
                            <div class="symbol symbol-40 bg-light mr-3">
                                <div class="symbol-label">
                                <span class="svg-icon svg-icon-md svg-icon-primary"><!--begin::Svg Icon | path:assets/media/svg/icons/Communication/Mail-opened.svg-->
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                         width="24px" height="24px" viewBox="0 0 24 24" version="1.1">
                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <rect x="0" y="0" width="24" height="24"/>
                                            <path
                                                    d="M6,2 L18,2 C18.5522847,2 19,2.44771525 19,3 L19,12 C19,12.5522847 18.5522847,13 18,13 L6,13 C5.44771525,13 5,12.5522847 5,12 L5,3 C5,2.44771525 5.44771525,2 6,2 Z M7.5,5 C7.22385763,5 7,5.22385763 7,5.5 C7,5.77614237 7.22385763,6 7.5,6 L13.5,6 C13.7761424,6 14,5.77614237 14,5.5 C14,5.22385763 13.7761424,5 13.5,5 L7.5,5 Z M7.5,7 C7.22385763,7 7,7.22385763 7,7.5 C7,7.77614237 7.22385763,8 7.5,8 L10.5,8 C10.7761424,8 11,7.77614237 11,7.5 C11,7.22385763 10.7761424,7 10.5,7 L7.5,7 Z"
                                                    fill="#000000" opacity="0.3"/>
                                            <path
                                                    d="M3.79274528,6.57253826 L12,12.5 L20.2072547,6.57253826 C20.4311176,6.4108595 20.7436609,6.46126971 20.9053396,6.68513259 C20.9668779,6.77033951 21,6.87277228 21,6.97787787 L21,17 C21,18.1045695 20.1045695,19 19,19 L5,19 C3.8954305,19 3,18.1045695 3,17 L3,6.97787787 C3,6.70173549 3.22385763,6.47787787 3.5,6.47787787 C3.60510559,6.47787787 3.70753836,6.51099993 3.79274528,6.57253826 Z"
                                                    fill="#000000"/>
                                        </g>
                                    </svg><!--end::Svg Icon-->
                                </span>
                                </div>
                            </div>
                            <div class="navi-text">
                                <div class="font-weight-bold" title="Coming Soon" id="my_task_id">
                                    My Tasks
                                </div>
                                <div class="text-muted">
                                    Latest Tasks And Projects
                                </div>
                            </div>

                        </div>
                    </a>
                    <a href="{{route('auto-email-reports')}}" class="navi-item">
                        <div class="navi-link">
                            <div class="symbol symbol-40 bg-light mr-3">
                                <div class="symbol-label">
                                    <i class="fa fa-envelope text-info"></i>
                                </div>
                            </div>
                            <div class="navi-text">
                                <div class="font-weight-bold">
                                    Auto Email Reports
                                </div>
                                <div class="text-muted">
                                    Latest Email Reports
                                </div>
                            </div>
                        </div>
                    </a>
                    <!--end:Item-->
                    <a href="reports-settings" class="navi-item" id="reports_Settings">
                        <div class="navi-link">
                            <div class="symbol symbol-40 bg-light mr-3">
                                <div class="symbol-label">
                                <span class="svg-icon svg-icon-md svg-icon-danger">
                                    <!--begin::Svg Icon | path:assets/media/svg/icons/Shopping/Chart-bar1.svg-->
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                         width="24px" height="24px"
                                         viewBox="0 0 24 24" version="1.1">
                                        <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                                            <rect x="0" y="0" width="24" height="24"/>
                                            <rect fill="#000000" opacity="0.3" x="12" y="4" width="3" height="13"
                                                  rx="1.5"/>
                                            <rect fill="#000000" opacity="0.3" x="7" y="9" width="3" height="8"
                                                  rx="1.5"/>
                                            <path
                                                    d="M5,19 L20,19 C20.5522847,19 21,19.4477153 21,20 C21,20.5522847 20.5522847,21 20,21 L4,21 C3.44771525,21 3,20.5522847 3,20 L3,4 C3,3.44771525 3.44771525,3 4,3 C4.55228475,3 5,3.44771525 5,4 L5,19 Z"
                                                    fill="#000000" fill-rule="nonzero"/>
                                            <rect fill="#000000" opacity="0.3" x="17" y="11" width="3" height="6"
                                                  rx="1.5"/>
                                        </g>
                                    </svg>
                                    <!--end::Svg Icon-->
                                </span>
                                </div>
                            </div>
                            <div class="navi-text">
                                <div class="font-weight-bold">
                                    Reports Settings
                                </div>
                                <div class="text-muted">
                                    Reports Settings And More
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
                <!--end::Nav-->

                <!--begin::Separator-->
                <div class="separator separator-dashed my-7"></div>
                <!--end::Separator-->

                <!--begin::Notifications-->
            {{--                <div>--}}
            {{--                    <!--begin:Heading-->--}}
            {{--                    <h5 class="mb-5">--}}
            {{--                        Recent Notifications--}}
            {{--                    </h5>--}}
            {{--                    <!--end:Heading-->--}}

            {{--                    <!--begin::Item-->--}}
            {{--                    <div class="d-flex align-items-center bg-light-warning rounded p-5 gutter-b">--}}
            {{--                    <span class="svg-icon svg-icon-warning mr-5">--}}
            {{--                        <span class="svg-icon svg-icon-lg"><!--begin::Svg Icon | path:assets/media/svg/icons/Home/Library.svg-->--}}
            {{--                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"--}}
            {{--                                 width="24px" height="24px" viewBox="0 0 24 24" version="1.1">--}}
            {{--                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">--}}
            {{--                                    <rect x="0" y="0" width="24" height="24"/>--}}
            {{--                                    <path--}}
            {{--                                            d="M5,3 L6,3 C6.55228475,3 7,3.44771525 7,4 L7,20 C7,20.5522847 6.55228475,21 6,21 L5,21 C4.44771525,21 4,20.5522847 4,20 L4,4 C4,3.44771525 4.44771525,3 5,3 Z M10,3 L11,3 C11.5522847,3 12,3.44771525 12,4 L12,20 C12,20.5522847 11.5522847,21 11,21 L10,21 C9.44771525,21 9,20.5522847 9,20 L9,4 C9,3.44771525 9.44771525,3 10,3 Z"--}}
            {{--                                            fill="#000000"/>--}}
            {{--                                    <rect fill="#000000" opacity="0.3"--}}
            {{--                                          transform="translate(17.825568, 11.945519) rotate(-19.000000) translate(-17.825568, -11.945519) "--}}
            {{--                                          x="16.3255682" y="2.94551858" width="3" height="18" rx="1"/>--}}
            {{--                                </g>--}}
            {{--                            </svg><!--end::Svg Icon-->--}}
            {{--                        </span>--}}
            {{--                    </span>--}}

            {{--                        <div class="d-flex flex-column flex-grow-1 mr-2">--}}
            {{--                            <a href="#" class="font-weight-normal  text-hover-primary font-size-lg mb-1">Another purpose--}}
            {{--                                persuade</a>--}}
            {{--                            <span class="text-muted font-size-sm">Due in 2 Days</span>--}}
            {{--                        </div>--}}

            {{--                        <span class="font-weight-bolder text-warning py-1 font-size-lg">+28%</span>--}}
            {{--                    </div>--}}
            {{--                    <!--end::Item-->--}}

            {{--                    <!--begin::Item-->--}}
            {{--                    <div class="d-flex align-items-center bg-light-success rounded p-5 gutter-b">--}}
            {{--                    <span class="svg-icon svg-icon-success mr-5">--}}
            {{--                        <span class="svg-icon svg-icon-lg"><!--begin::Svg Icon | path:assets/media/svg/icons/Communication/Write.svg-->--}}
            {{--                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"--}}
            {{--                                 width="24px" height="24px" viewBox="0 0 24 24" version="1.1">--}}
            {{--                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">--}}
            {{--                                    <rect x="0" y="0" width="24" height="24"/>--}}
            {{--                                    <path--}}
            {{--                                            d="M12.2674799,18.2323597 L12.0084872,5.45852451 C12.0004303,5.06114792 12.1504154,4.6768183 12.4255037,4.38993949 L15.0030167,1.70195304 L17.5910752,4.40093695 C17.8599071,4.6812911 18.0095067,5.05499603 18.0083938,5.44341307 L17.9718262,18.2062508 C17.9694575,19.0329966 17.2985816,19.701953 16.4718324,19.701953 L13.7671717,19.701953 C12.9505952,19.701953 12.2840328,19.0487684 12.2674799,18.2323597 Z"--}}
            {{--                                            fill="#000000" fill-rule="nonzero"--}}
            {{--                                            transform="translate(14.701953, 10.701953) rotate(-135.000000) translate(-14.701953, -10.701953) "/>--}}
            {{--                                    <path--}}
            {{--                                            d="M12.9,2 C13.4522847,2 13.9,2.44771525 13.9,3 C13.9,3.55228475 13.4522847,4 12.9,4 L6,4 C4.8954305,4 4,4.8954305 4,6 L4,18 C4,19.1045695 4.8954305,20 6,20 L18,20 C19.1045695,20 20,19.1045695 20,18 L20,13 C20,12.4477153 20.4477153,12 21,12 C21.5522847,12 22,12.4477153 22,13 L22,18 C22,20.209139 20.209139,22 18,22 L6,22 C3.790861,22 2,20.209139 2,18 L2,6 C2,3.790861 3.790861,2 6,2 L12.9,2 Z"--}}
            {{--                                            fill="#000000" fill-rule="nonzero" opacity="0.3"/>--}}
            {{--                                </g>--}}
            {{--                            </svg><!--end::Svg Icon-->--}}
            {{--                        </span>--}}
            {{--                    </span>--}}
            {{--                        <div class="d-flex flex-column flex-grow-1 mr-2">--}}
            {{--                            <a href="#" class="font-weight-normal  text-hover-primary font-size-lg mb-1">Would be to--}}
            {{--                                people</a>--}}
            {{--                            <span class="text-muted font-size-sm">Due in 2 Days</span>--}}
            {{--                        </div>--}}
            {{--                        <span class="font-weight-bolder text-success py-1 font-size-lg">+50%</span>--}}
            {{--                    </div>--}}
            {{--                    <!--end::Item-->--}}

            {{--                    <!--begin::Item-->--}}
            {{--                    <div class="d-flex align-items-center bg-light-danger rounded p-5 gutter-b">--}}
            {{--                    <span class="svg-icon svg-icon-danger mr-5">--}}
            {{--                        <span class="svg-icon svg-icon-lg"><!--begin::Svg Icon | path:assets/media/svg/icons/Communication/Group-chat.svg-->--}}
            {{--                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"--}}
            {{--                                 width="24px" height="24px" viewBox="0 0 24 24" version="1.1">--}}
            {{--                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">--}}
            {{--                                    <rect x="0" y="0" width="24" height="24"/>--}}
            {{--                                    <path--}}
            {{--                                            d="M16,15.6315789 L16,12 C16,10.3431458 14.6568542,9 13,9 L6.16183229,9 L6.16183229,5.52631579 C6.16183229,4.13107011 7.29290239,3 8.68814808,3 L20.4776218,3 C21.8728674,3 23.0039375,4.13107011 23.0039375,5.52631579 L23.0039375,13.1052632 L23.0206157,17.786793 C23.0215995,18.0629336 22.7985408,18.2875874 22.5224001,18.2885711 C22.3891754,18.2890457 22.2612702,18.2363324 22.1670655,18.1421277 L19.6565168,15.6315789 L16,15.6315789 Z"--}}
            {{--                                            fill="#000000"/>--}}
            {{--                                    <path--}}
            {{--                                            d="M1.98505595,18 L1.98505595,13 C1.98505595,11.8954305 2.88048645,11 3.98505595,11 L11.9850559,11 C13.0896254,11 13.9850559,11.8954305 13.9850559,13 L13.9850559,18 C13.9850559,19.1045695 13.0896254,20 11.9850559,20 L4.10078614,20 L2.85693427,21.1905292 C2.65744295,21.3814685 2.34093638,21.3745358 2.14999706,21.1750444 C2.06092565,21.0819836 2.01120804,20.958136 2.01120804,20.8293182 L2.01120804,18.32426 C1.99400175,18.2187196 1.98505595,18.1104045 1.98505595,18 Z M6.5,14 C6.22385763,14 6,14.2238576 6,14.5 C6,14.7761424 6.22385763,15 6.5,15 L11.5,15 C11.7761424,15 12,14.7761424 12,14.5 C12,14.2238576 11.7761424,14 11.5,14 L6.5,14 Z M9.5,16 C9.22385763,16 9,16.2238576 9,16.5 C9,16.7761424 9.22385763,17 9.5,17 L11.5,17 C11.7761424,17 12,16.7761424 12,16.5 C12,16.2238576 11.7761424,16 11.5,16 L9.5,16 Z"--}}
            {{--                                            fill="#000000" opacity="0.3"/>--}}
            {{--                                </g>--}}
            {{--                            </svg><!--end::Svg Icon-->--}}
            {{--                        </span>--}}
            {{--                    </span>--}}
            {{--                        <div class="d-flex flex-column flex-grow-1 mr-2">--}}
            {{--                            <a href="#" class="font-weight-normel  text-hover-primary font-size-lg mb-1">Purpose would--}}
            {{--                                be to persuade</a>--}}
            {{--                            <span class="text-muted font-size-sm">Due in 2 Days</span>--}}
            {{--                        </div>--}}

            {{--                        <span class="font-weight-bolder text-danger py-1 font-size-lg">-27%</span>--}}
            {{--                    </div>--}}
            {{--                    <!--end::Item-->--}}

            {{--                    <!--begin::Item-->--}}
            {{--                    <div class="d-flex align-items-center bg-light-info rounded p-5">--}}
            {{--                    <span class="svg-icon svg-icon-info mr-5">--}}
            {{--                        <span class="svg-icon svg-icon-lg"><!--begin::Svg Icon | path:assets/media/svg/icons/General/Attachment2.svg-->--}}
            {{--                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"--}}
            {{--                                 width="24px" height="24px" viewBox="0 0 24 24" version="1.1">--}}
            {{--                                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">--}}
            {{--                                    <rect x="0" y="0" width="24" height="24"/>--}}
            {{--                                    <path--}}
            {{--                                            d="M11.7573593,15.2426407 L8.75735931,15.2426407 C8.20507456,15.2426407 7.75735931,15.6903559 7.75735931,16.2426407 C7.75735931,16.7949254 8.20507456,17.2426407 8.75735931,17.2426407 L11.7573593,17.2426407 L11.7573593,18.2426407 C11.7573593,19.3472102 10.8619288,20.2426407 9.75735931,20.2426407 L5.75735931,20.2426407 C4.65278981,20.2426407 3.75735931,19.3472102 3.75735931,18.2426407 L3.75735931,14.2426407 C3.75735931,13.1380712 4.65278981,12.2426407 5.75735931,12.2426407 L9.75735931,12.2426407 C10.8619288,12.2426407 11.7573593,13.1380712 11.7573593,14.2426407 L11.7573593,15.2426407 Z"--}}
            {{--                                            fill="#000000" opacity="0.3"--}}
            {{--                                            transform="translate(7.757359, 16.242641) rotate(-45.000000) translate(-7.757359, -16.242641) "/>--}}
            {{--                                    <path--}}
            {{--                                            d="M12.2426407,8.75735931 L15.2426407,8.75735931 C15.7949254,8.75735931 16.2426407,8.30964406 16.2426407,7.75735931 C16.2426407,7.20507456 15.7949254,6.75735931 15.2426407,6.75735931 L12.2426407,6.75735931 L12.2426407,5.75735931 C12.2426407,4.65278981 13.1380712,3.75735931 14.2426407,3.75735931 L18.2426407,3.75735931 C19.3472102,3.75735931 20.2426407,4.65278981 20.2426407,5.75735931 L20.2426407,9.75735931 C20.2426407,10.8619288 19.3472102,11.7573593 18.2426407,11.7573593 L14.2426407,11.7573593 C13.1380712,11.7573593 12.2426407,10.8619288 12.2426407,9.75735931 L12.2426407,8.75735931 Z"--}}
            {{--                                            fill="#000000"--}}
            {{--                                            transform="translate(16.242641, 7.757359) rotate(-45.000000) translate(-16.242641, -7.757359) "/>--}}
            {{--                                    <path--}}
            {{--                                            d="M5.89339828,3.42893219 C6.44568303,3.42893219 6.89339828,3.87664744 6.89339828,4.42893219 L6.89339828,6.42893219 C6.89339828,6.98121694 6.44568303,7.42893219 5.89339828,7.42893219 C5.34111353,7.42893219 4.89339828,6.98121694 4.89339828,6.42893219 L4.89339828,4.42893219 C4.89339828,3.87664744 5.34111353,3.42893219 5.89339828,3.42893219 Z M11.4289322,5.13603897 C11.8194565,5.52656326 11.8194565,6.15972824 11.4289322,6.55025253 L10.0147186,7.96446609 C9.62419433,8.35499039 8.99102936,8.35499039 8.60050506,7.96446609 C8.20998077,7.5739418 8.20998077,6.94077682 8.60050506,6.55025253 L10.0147186,5.13603897 C10.4052429,4.74551468 11.0384079,4.74551468 11.4289322,5.13603897 Z M0.600505063,5.13603897 C0.991029355,4.74551468 1.62419433,4.74551468 2.01471863,5.13603897 L3.42893219,6.55025253 C3.81945648,6.94077682 3.81945648,7.5739418 3.42893219,7.96446609 C3.0384079,8.35499039 2.40524292,8.35499039 2.01471863,7.96446609 L0.600505063,6.55025253 C0.209980772,6.15972824 0.209980772,5.52656326 0.600505063,5.13603897 Z"--}}
            {{--                                            fill="#000000" opacity="0.3"--}}
            {{--                                            transform="translate(6.014719, 5.843146) rotate(-45.000000) translate(-6.014719, -5.843146) "/>--}}
            {{--                                    <path--}}
            {{--                                            d="M17.9142136,15.4497475 C18.4664983,15.4497475 18.9142136,15.8974627 18.9142136,16.4497475 L18.9142136,18.4497475 C18.9142136,19.0020322 18.4664983,19.4497475 17.9142136,19.4497475 C17.3619288,19.4497475 16.9142136,19.0020322 16.9142136,18.4497475 L16.9142136,16.4497475 C16.9142136,15.8974627 17.3619288,15.4497475 17.9142136,15.4497475 Z M23.4497475,17.1568542 C23.8402718,17.5473785 23.8402718,18.1805435 23.4497475,18.5710678 L22.0355339,19.9852814 C21.6450096,20.3758057 21.0118446,20.3758057 20.6213203,19.9852814 C20.2307961,19.5947571 20.2307961,18.9615921 20.6213203,18.5710678 L22.0355339,17.1568542 C22.4260582,16.76633 23.0592232,16.76633 23.4497475,17.1568542 Z M12.6213203,17.1568542 C13.0118446,16.76633 13.6450096,16.76633 14.0355339,17.1568542 L15.4497475,18.5710678 C15.8402718,18.9615921 15.8402718,19.5947571 15.4497475,19.9852814 C15.0592232,20.3758057 14.4260582,20.3758057 14.0355339,19.9852814 L12.6213203,18.5710678 C12.2307961,18.1805435 12.2307961,17.5473785 12.6213203,17.1568542 Z"--}}
            {{--                                            fill="#000000" opacity="0.3"--}}
            {{--                                            transform="translate(18.035534, 17.863961) scale(1, -1) rotate(45.000000) translate(-18.035534, -17.863961) "/>--}}
            {{--                                </g>--}}
            {{--                            </svg><!--end::Svg Icon-->--}}
            {{--                        </span>--}}
            {{--                    </span>--}}

            {{--                        <div class="d-flex flex-column flex-grow-1 mr-2">--}}
            {{--                            <a href="#" class="font-weight-normel  text-hover-primary font-size-lg mb-1">The best--}}
            {{--                                product</a>--}}
            {{--                            <span class="text-muted font-size-sm">Due in 2 Days</span>--}}
            {{--                        </div>--}}

            {{--                        <span class="font-weight-bolder text-info py-1 font-size-lg">+8%</span>--}}
            {{--                    </div>--}}
            {{--                    <!--end::Item-->--}}
            {{--                </div>--}}
            <!--end::Notifications-->
            </div>
            <!--end::Content-->
        </div>
        <!-- end::User Panel-->


        <!--begin::Chat Panel-->
        <div class="modal modal-sticky modal-sticky-bottom-right" id="Sb_chat_modal" role="dialog"
             data-backdrop="false">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <!--begin::Card-->
                    <div class="card card-custom">
                        <!--begin::Header-->
                        <div class="card-header align-items-center px-4 py-3">
                            <div class="text-left flex-grow-1">
                                <!--begin::Dropdown Menu-->
                                <div class="dropdown dropdown-inline">
                                    <button type="button" class="btn btn-clean btn-sm btn-icon btn-icon-md"
                                            data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                    <span class="svg-icon svg-icon-lg">
                                        <i class="fas fa-user-plus"></i>
                                    </span>
                                    </button>
                                    <div class="dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-md">
                                        <!--begin::Navigation-->
                                        <ul class="navi navi-hover py-5">
                                            <li class="navi-item">
                                                <a href="#" class="navi-link">
                                                    <span class="navi-icon"><i class="flaticon2-drop"></i></span>
                                                    <span class="navi-text">New Group</span>
                                                </a>
                                            </li>
                                            <li class="navi-item">
                                                <a href="#" class="navi-link">
                                                    <span class="navi-icon"><i class="flaticon2-list-3"></i></span>
                                                    <span class="navi-text">Contacts</span>
                                                </a>
                                            </li>
                                            <li class="navi-item">
                                                <a href="#" class="navi-link">
                                                    <span class="navi-icon"><i class="flaticon2-rocket-1"></i></span>
                                                    <span class="navi-text">Groups</span>
                                                    <span class="navi-link-badge">
                                                    <span
                                                            class="label label-light-primary label-inline font-weight-bold">new</span>
                                                </span>
                                                </a>
                                            </li>
                                            <li class="navi-item">
                                                <a href="#" class="navi-link">
                                                    <span class="navi-icon"><i class="flaticon2-bell-2"></i></span>
                                                    <span class="navi-text">Calls</span>
                                                </a>
                                            </li>
                                            <li class="navi-item">
                                                <a href="#" class="navi-link">
                                                    <span class="navi-icon"><i class="flaticon2-gear"></i></span>
                                                    <span class="navi-text">Settings</span>
                                                </a>
                                            </li>

                                            <li class="navi-separator my-3"></li>

                                            <li class="navi-item">
                                                <a href="#" class="navi-link">
                                                    <span class="navi-icon"><i
                                                                class="flaticon2-magnifier-tool"></i></span>
                                                    <span class="navi-text">Help</span>
                                                </a>
                                            </li>
                                            <li class="navi-item">
                                                <a href="#" class="navi-link">
                                                    <span class="navi-icon"><i class="flaticon2-bell-2"></i></span>
                                                    <span class="navi-text">Privacy</span>
                                                    <span class="navi-link-badge">
                                                    <span
                                                            class="label label-light-danger label-rounded font-weight-bold">5</span>
                                                </span>
                                                </a>
                                            </li>
                                        </ul>
                                        <!--end::Navigation-->
                                    </div>
                                </div>
                                <!--end::Dropdown Menu-->
                            </div>
                            <div class="text-center flex-grow-1">
                                <div class="font-weight-bold font-size-h5">SocioBoard <span
                                            class="text-mute">Team</span></div>
                                <div>
                                    <span class="label label-dot label-success"></span>
                                    <span class="font-weight-bold text-muted font-size-sm">Active</span>
                                </div>
                            </div>
                            <div class="text-right flex-grow-1">
                                <button type="button" class="btn btn-clean btn-sm btn-icon btn-icon-md"
                                        data-dismiss="modal">
                                    <i class="ki ki-close icon-1x"></i>
                                </button>
                            </div>
                        </div>
                        <!--end::Header-->

                        <!--begin::Body-->
                        <div class="card-body">
                            <!--begin::Scroll-->
                            <div class="scroll scroll-pull" data-height="375" data-mobile-height="300">
                                <!--begin::Messages-->
                                <div class="messages">
                                    <!--begin::Message In-->
                                    <div class="d-flex flex-column mb-5 align-items-start">
                                        <div class="d-flex align-items-center">
                                            <div class="symbol symbol-circle symbol-40 mr-3">
                                                <img alt="Pic" src="<?php echo SquareProfilePic(); ?>"
                                                     id="header_image_out"
                                                     class="symbol-label font-weight-bold" id="header_profile_picture">
                                            </div>
                                            <div>
                                                <a href="#" class="text-hover-primary font-weight-bold font-size-h6">Matt
                                                    Pears</a>
                                                <span class="text-muted font-size-sm">2 Hours</span>
                                            </div>
                                        </div>
                                        <div
                                                class="mt-2 rounded p-5 bg-light-success text-dark-50 font-weight-bold font-size-lg text-left max-w-400px">
                                            How likely are you to recommend our company
                                            to your friends and family?
                                        </div>
                                    </div>
                                    <!--end::Message In-->

                                    <!--begin::Message Out-->
                                    <div class="d-flex flex-column mb-5 align-items-end">
                                        <div class="d-flex align-items-center">
                                            <div>
                                                <span class="text-muted font-size-sm">3 minutes</span>
                                                <a href="#"
                                                   class="text-hover-primary font-weight-bold font-size-h6">You</a>
                                            </div>
                                            <div class="symbol symbol-circle symbol-40 ml-3">
                                                <img alt="Pic" src="{{asset('media/svg/avatars/012-girl-5.svg')}}"/>
                                            </div>
                                        </div>
                                        <div
                                                class="mt-2 rounded p-5 bg-light-primary text-dark-50 font-weight-bold font-size-lg text-right max-w-400px">
                                            Hey there, we’re just writing to let you know
                                            that you’ve been subscribed to a repository on GitHub.
                                        </div>
                                    </div>
                                    <!--end::Message Out-->

                                    <!--begin::Message In-->
                                    <div class="d-flex flex-column mb-5 align-items-start">
                                        <div class="d-flex align-items-center">
                                            <div class="symbol symbol-circle symbol-40 mr-3">
                                                <img alt="Pic" src="{{asset('media/svg/avatars/014-girl-7.svg')}}"/>
                                            </div>
                                            <div>
                                                <a href="#" class="text-hover-primary font-weight-bold font-size-h6">Matt
                                                    Pears</a>
                                                <span class="text-muted font-size-sm">40 seconds</span>
                                            </div>
                                        </div>
                                        <div
                                                class="mt-2 rounded p-5 bg-light-success text-dark-50 font-weight-bold font-size-lg text-left max-w-400px">
                                            Ok, Understood!
                                        </div>
                                    </div>
                                    <!--end::Message In-->

                                    <!--begin::Message Out-->
                                    <div class="d-flex flex-column mb-5 align-items-end">
                                        <div class="d-flex align-items-center">
                                            <div>
                                                <span class="text-muted font-size-sm">Just now</span>
                                                <a href="#" class=" text-hover-primary font-weight-bold font-size-h6">You</a>
                                            </div>
                                            <div class="symbol symbol-circle symbol-40 ml-3">
                                                <img alt="Pic" src="{{asset('media/svg/avatars/011-boy-5.svg')}}"/>
                                            </div>
                                        </div>
                                        <div
                                                class="mt-2 rounded p-5 bg-light-primary text-dark-50 font-weight-bold font-size-lg text-right max-w-400px">
                                            You’ll receive notifications for all issues, pull requests!
                                        </div>
                                    </div>
                                    <!--end::Message Out-->

                                    <!--begin::Message In-->
                                    <div class="d-flex flex-column mb-5 align-items-start">
                                        <div class="d-flex align-items-center">
                                            <div class="symbol symbol-circle symbol-40 mr-3">
                                                <img alt="Pic" src="{{asset('media/svg/avatars/011-boy-5.svg')}}"/>
                                            </div>
                                            <div>
                                                <a href="#" class=" text-hover-primary font-weight-bold font-size-h6">Matt
                                                    Pears</a>
                                                <span class="text-muted font-size-sm">40 seconds</span>
                                            </div>
                                        </div>
                                        <div
                                                class="mt-2 rounded p-5 bg-light-success text-dark-50 font-weight-bold font-size-lg text-left max-w-400px">
                                            You can unwatch this repository immediately by clicking here: <a href="#">https://github.com</a>
                                        </div>
                                    </div>
                                    <!--end::Message In-->

                                    <!--begin::Message Out-->
                                    <div class="d-flex flex-column mb-5 align-items-end">
                                        <div class="d-flex align-items-center">
                                            <div>
                                                <span class="text-muted font-size-sm">Just now</span>
                                                <a href="#" class=" text-hover-primary font-weight-bold font-size-h6">You</a>
                                            </div>
                                            <div class="symbol symbol-circle symbol-40 ml-3">
                                                <img alt="Pic" src="{{asset('media/svg/avatars/013-girl-6.svg')}}"/>
                                            </div>
                                        </div>
                                        <div
                                                class="mt-2 rounded p-5 bg-light-primary text-dark-50 font-weight-bold font-size-lg text-right max-w-400px">
                                            Discover what students who viewed Learn Figma - UI/UX Design. Essential
                                            Training also viewed
                                        </div>
                                    </div>
                                    <!--end::Message Out-->

                                    <!--begin::Message In-->
                                    <div class="d-flex flex-column mb-5 align-items-start">
                                        <div class="d-flex align-items-center">
                                            <div class="symbol symbol-circle symbol-40 mr-3">
                                                <img alt="Pic" src="{{asset('media/svg/avatars/012-girl-5.svg')}}"/>
                                            </div>
                                            <div>
                                                <a href="#" class=" text-hover-primary font-weight-bold font-size-h6">Matt
                                                    Pears</a>
                                                <span class="text-muted font-size-sm">40 seconds</span>
                                            </div>
                                        </div>
                                        <div
                                                class="mt-2 rounded p-5 bg-light-success text-dark-50 font-weight-bold font-size-lg text-left max-w-400px">
                                            Most purchased Business courses during this sale!
                                        </div>
                                    </div>
                                    <!--end::Message In-->

                                    <!--begin::Message Out-->
                                    <div class="d-flex flex-column mb-5 align-items-end">
                                        <div class="d-flex align-items-center">
                                            <div>
                                                <span class="text-muted font-size-sm">Just now</span>
                                                <a href="#" class=" text-hover-primary font-weight-bold font-size-h6">You</a>
                                            </div>
                                            <div class="symbol symbol-circle symbol-40 ml-3">
                                                <img alt="Pic" src="{{asset('media/svg/avatars/013-girl-6.svg')}}"/>
                                            </div>
                                        </div>
                                        <div
                                                class="mt-2 rounded p-5 bg-light-primary text-dark-50 font-weight-bold font-size-lg text-right max-w-400px">
                                            Company BBQ to celebrate the last quater achievements and goals. Food and
                                            drinks provided
                                        </div>
                                    </div>
                                    <!--end::Message Out-->
                                </div>
                                <!--end::Messages-->
                            </div>
                            <!--end::Scroll-->
                        </div>
                        <!--end::Body-->

                        <!--begin::Footer-->
                        <div class="card-footer align-items-center">
                            <!--begin::Compose-->
                            <textarea class="form-control border-0 p-0" rows="2"
                                      placeholder="Type a message"></textarea>
                            <div class="d-flex align-items-center justify-content-between mt-5">
                                <div class="mr-3">
                                    <a href="#" class="btn btn-clean btn-icon btn-md mr-1"><i
                                                class="flaticon2-photograph icon-lg"></i></a>
                                    <a href="#" class="btn btn-clean btn-icon btn-md"><i
                                                class="flaticon2-photo-camera  icon-lg"></i></a>
                                </div>
                                <div>
                                    <button type="button"
                                            class="btn btn-primary btn-md text-uppercase font-weight-bold chat-send py-2 px-6">
                                        Send
                                    </button>
                                </div>
                            </div>
                            <!--begin::Compose-->
                        </div>
                        <!--end::Footer-->
                    </div>
                    <!--end::Card-->
                </div>
            </div>
        </div>
        <!--end::Chat Panel-->
        <!--   --><?php
    function SquareProfilePic()
    {
        if (file_exists(public_path(session()->get('user')['userDetails']['profile_picture']))) {
            return env('APP_URL') . session()->get('user')['userDetails']['profile_picture'];
        } else {
            if (filter_var(session()->get('user')['userDetails']['profile_picture'], FILTER_VALIDATE_URL) === FALSE) {
                return env('APP_URL') . "media/svg/avatars/001-boy.svg";
            } else {
                return session()->get('user')['userDetails']['profile_picture'];
            }
        }
    }

    /// ?>

    <!-- Global site tag (gtag.js) - Google Ads: 323729849 -->
        <script async src="https://www.googletagmanager.com/gtag/js?id=AW-323729849"></script>
        <script>
            let custom_report = '<?php echo(session()->get('user')['userDetails']['userPlanDetails']['custom_report']);?>';
            window.dataLayer = window.dataLayer || [];

            function gtag() {
                dataLayer.push(arguments);
            }

            gtag('js', new Date());
            gtag('config', 'AW-323729849');
        </script>
        <!--begin::Global Theme Bundle(used by all pages)-->
        <script src="{{asset('plugins/global/plugins.bundle.js')}}"></script>
        <script src="{{asset('plugins/custom/prismjs/prismjs.bundle.js')}}"></script>
        <script src="{{asset('js/main.js')}}"></script>
        <script src="{{asset('js/custom.js')}}"></script>
        <script src="{{asset('js/custom-js/html2canvas.js')}}"></script>
        <script src="{{asset('js/custom-js/ss-template.js')}}"></script>
        <script src="../plugins/daterangepicker/moment.min.js"></script>
        <script src="../plugins/daterangepicker/moment-timezone-with-data.js"></script>
        <script>
            toastr.options = {
                "closeButton": true,
                "debug": false,
                "newestOnTop": false,
                "progressBar": false,
                "positionClass": "toast-top-right",
                "preventDuplicates": false,
                "onclick": null,
                "showDuration": "300",
                "hideDuration": "1000",
                "timeOut": "5000",
                "extendedTimeOut": "1000",
                "showEasing": "swing",
                "hideEasing": "linear",
                "showMethod": "fadeIn",
                "hideMethod": "fadeOut"
            };
            let invitations = [];
            let publishOrFeeds =0;
            $(document).ready(function () {
                getReportsCount();
                getNotifications(1);
                getNotificationsUser(1);
                const currentTheme = localStorage.getItem('theme');
                if (currentTheme === "dark") {
                    $("#checkbox").prop("checked", true);
                }
            })

            function getReportsCount() {
                $.ajax({
                    type: 'get',
                    url: '/get-reports-Images-onload',
                    beforeSend: function () {
                        $('#reportsCount').empty();
                    },
                    success: function (response) {
                        if (response.code === 200) {
                            if (response.data === 'No Data found') {
                                $('#reportsCount').append(0);
                            } else {
                                $('#reportsCount').append(response.data.length);
                            }
                        }
                    }
                });
            }

            function acceptInvitation(id) {
                $.ajax({
                    url: '/accept-invitations',
                    type: 'get',
                    data: {
                        id: id
                    },
                    success: function (response) {
                        if (response.code === 200) {
                            toastr.success(response.message);
                            window.location.href = "/team/" + id;
                        } else if (response.code === 400) {
                            toastr.error(response.message);
                        } else if (response.code === 401) {
                            toastr.error(response.message);
                        } else {
                            toastr.error(response.code, 'error')
                        }
                    },
                    error: function (error) {
                        toastr.error(error);
                    }
                })
            }

            function teamCount() {
                $.ajax({
                    url: '/get-teamcount',
                    type: 'get',
                    success: function (response) {
                        let member;
                        let member1;
                        let teamcount;
                        if (response.teams.length >= 2) {
                            if (response.teams[0]['members'] === 1) {
                                member = " Member"
                            } else {
                                member = " Members"
                            }
                            if (response.teams[1]['members'] === 1) {
                                member1 = " Member"
                            } else {
                                member1 = " Members"
                            }
                            if (response.count === 1) {
                                teamcount = " Team"
                            } else {
                                teamcount = " Teams"
                            }
                            $("#team_count").html("");
                            $("#team_count").append('<div class="col-12">\n' +
                                '<a href="#" class="d-block py-3 px-5 text-center bg-hover-light border-bottom">' +
                                '<span class="d-block font-weight-bold font-size-h6 mt-2 mb-1">' + response.teams[0]['teamName'] + '</span>\n' +
                                '<span class="d-block font-size-lg">' + response.teams[0]['members'] + member + ' </span>' +
                                '</a>' +
                                '</div>' +
                                '<div class="col-12">' +
                                '<a href="#" class="d-block py-3 px-5 text-center bg-hover-light border-bottom">' +
                                '<span\n' +
                                'class="d-block font-weight-bold font-size-h6 mt-2 mb-1">' + response.teams[1]['teamName'] + '</span>' +
                                '<span class="d-block font-size-lg">' + response.teams[1]['members'] + member1 + ' </span>' +
                                '</a>' +
                                '</div>' +
                                '<div class="col-6">' +
                                '<a href="/view-teams" class="d-block py-10 px-5 text-center bg-hover-light border-right">' +
                                '<span class="svg-icon svg-icon-3x">' +
                                '<i class="fas fa-users"></i>' +
                                '</span>' +
                                '<span class="d-block font-weight-bold font-size-h6 mt-2 mb-1">View Teams</span>' +
                                '<span class="d-block font-size-lg">' + response.count + teamcount + '</span>' +
                                '</a>' +
                                '</div>' +
                                '<div class="col-6">' +
                                '<a href="/create-team"' +
                                'class="d-block py-10 px-5 text-center bg-hover-light">' +
                                '<span class="svg-icon svg-icon-3x">' +
                                '<i class="fas fa-user-plus"></i>' +
                                '</span>' +
                                '<span class="d-block font-weight-bold font-size-h6 mt-2 mb-1">Create Team</span>' +
                                '<span class="d-block font-size-lg">Add New Team</span>' +
                                '</a>' +
                                '</div>')
                        } else {
                            $("#team_count").html("");
                            $("#team_count").append(
                                '<div class="col-6">' +
                                '<a href="/view-teams" class="d-block py-10 px-5 text-center bg-hover-light border-right">' +
                                '<span class="svg-icon svg-icon-3x">' +
                                '<i class="fas fa-users"></i>' +
                                '</span>' +
                                '<span class="d-block font-weight-bold font-size-h6 mt-2 mb-1">View Teams</span>' +
                                '<span class="d-block font-size-lg">' + response.count + ' Team</span>' +
                                '</a>' +
                                '</div>' +
                                '<div class="col-6">' +
                                '<a href="/create-team"' +
                                'class="d-block py-10 px-5 text-center bg-hover-light">' +
                                '<span class="svg-icon svg-icon-3x">' +
                                '<i class="fas fa-user-plus"></i>' +
                                '</span>' +
                                '<span class="d-block font-weight-bold font-size-h6 mt-2 mb-1">Create Team</span>' +
                                '<span class="d-block font-size-lg">Add New Team</span>' +
                                '</a>' +
                                '</div>');
                        }
                    },
                    error: function (error) {
                        toastr.error(error.error);
                    }
                })
            }

            function rejectInvitation(id) {
                $.ajax({
                    url: '/reject-invitations',
                    type: 'get',
                    data: {
                        id: id
                    },
                    success: function (response) {
                        if (response.code === 200) {
                            toastr.success(response.message);
                        } else if (response.code === 400) {
                            toastr.error(response.message);
                        } else if (response.code === 401) {
                            toastr.error(response.message);
                        } else {
                            toastr.error('something went wrong')
                        }
                    },
                    error: function (error) {
                        toastr.error(error.error);
                    }
                })
            }

            function clickFunction() {
                $.ajax({
                    url: '/get-recent-activity',
                    type: 'get',
                    success: function (response) {
                        if (response.code === 200) {
                            $("#recent_activities").html("");
                            response.data.map(element => {
                                let appendData = '';
                                let icon = '<div class="d-flex align-items-center pt-5 pl-5 ">' +
                                    '<span class="symbol symbol-40 mr-5">' +
                                    '<span class="font-size-h5 font-weight-bold">';
                                switch (element.category) {
                                    case "boards" :
                                        icon += '<i class="fas fa-chalkboard"></i></span></span>';
                                        break;

                                    case "trends" :
                                        icon += '<i class="fas fa-hashtag"></i></span></span>';
                                        break;

                                    case "feeds" :
                                        icon += '<i class="far fa-images"></i></span></span>';
                                        break;

                                    case "user" :
                                        icon += '<i class="fas fa-user"></i></span></span>';
                                        break;

                                    case "team" :
                                        icon += '<i class="fas fa-users"></i></span></span>';
                                        break;

                                    case "upload" :
                                        icon += '<i class="fas fa-image"></i></span></span>';
                                        break;

                                    case "publish" :
                                        icon += '<i class="fas fa-rss"></i></span></span>';
                                        break;

                                    case "report" :
                                        icon += '<i class="fas fa-chart-bar"></i></span></span>';
                                        break;
                                    case "networkinsight" :
                                        icon += '<i class="fas fa-chart-bar"></i></span></span>';
                                        break;
                                    case "schedule" :
                                        icon += '<i class="fas fa-chart-bar"></i></span></span>';
                                        break;
                                }
                                appendData += icon + '<div class="d-flex flex-column font-weight-bold">' +
                                    '<a href="/' + element.phproute + '" class="mb-1 font-size-lg">' + element.category.toUpperCase() + '</a>' +
                                    '<span class="">' + element.subcategory + '</span>' +
                                    '</div>' +
                                    '</div>';
                                $('#recent_activities').append(appendData);
                            });
                        } else if (response.code === 400) {
                            toastr.error(response.message);
                        } else if (response.code === 401) {
                            toastr.error(response.message);
                        } else {
                            toastr.error('something went wrong')
                        }
                    },
                    error: function (error) {
                        toastr.error('here')
                    }
                })
            }

            $('#conted_feeds_id, #shereathon_queue, #trending_now, #most_shared, #automated_rss_feeds, #posted_rss_feeds, #group_chat, #twitter_analyutics, #twitter_inbox, #my_task, #youtube_inbox, #discovery_id, #smart_search_id, #facebook_group_post, #linkedin_group_post, #archiveReports, #primitiveReports, #calendarView , #facebookReports, #ShareathonButton, #Shareathon #youtubereports, #linkedinFeeds, #instagramFeeds, #twitterReports ,#chats').tooltip();
            $('#my_messages_id, #my_activities_id, #my_task_id, #reportsCart ,#reports_Settings ,#publishMessage,#nofifications').tooltip();
        </script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/3.1.0/socket.io.js"></script>
        <script>
            let teamIds;
            let userID;


            /**
             * TODO we've to get all notificationsof the teams onload.
             * @param {string) pageid for getting the first 12 nortifications passing in controller.
             * @return {object} Returns getNotifications from  in JSON object format.
             */
            function getNotifications(pageid) {
                $.ajax({
                    type: 'get',
                    url: '/get-all-notifications-teams',
                    data: {
                        pageid: pageid
                    },
                    beforeSend: function () {
                        $("#invitation").html("");
                    },
                    success: function (response) {
                        let appendData = '';
                        let appendData2 = '';
                        let publishNotificationCounts = 0;
                        let teamNotificationCounts = 0;
                        let num = 1;
                        if (response.code === 200) {
                            if (response.data.length > 0) {
                                response.data.map(element => {
                                    if (element.notifyType === 'publish_publishPosts') {
                                        appendData2 += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a id="publishMessage" href="' + getStringUrl(element.notificationMessage) + '" class="mb-1 font-size-lg" target="_blank"  title="' + element.notificationMessage + '"  onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                        publishNotificationCounts++;
                                    } else if (element.notifyType === 'team_leave') {
                                        appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-users"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}view-teams" target="_blank" class="mb-1 font-size-lg" target="_blank" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                        teamNotificationCounts++;
                                    } else if (element.notifyType === 'publish_addProfile') {
                                        appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-users"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}view-teams" target="_blank" class="mb-1 font-size-lg" target="_blank" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                        teamNotificationCounts++;
                                    } else if (element.notifyType === 'team_addProfile') {
                                        teamNotificationCounts++;
                                        appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-users"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}view-teams" target="_blank" class="mb-1 font-size-lg" target="_blank" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                    } else if (element.notifyType === 'team_deleteTeamSocialProfile') {
                                        appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-users"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}view-teams" target="_blank" class="mb-1 font-size-lg" target="_blank" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                    } else if (element.notifyType === 'team_leave') {
                                        teamNotificationCounts++;
                                        appendData += '<div id="notificationNum' + num + '"  class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-users"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}view-teams" target="_blank" class="mb-1 font-size-lg" target="_blank" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                    }
                                    num++;
                                });
                                if (publishNotificationCounts === 0) {
                                    $('#publishNotiFications').append('<div class="tab-pane" id="topbar_publishing" role="tabpanel">' +
                                        '<div class="d-flex flex-center text-center min-h-200px" id="noNotify">All caught up!<br/>' +
                                        'No new notifications.' +
                                        '</div>' +
                                        '</div>');
                                } else {
                                    $('#publishNotiFications').append(appendData2);
                                }
                                if (teamNotificationCounts === 0) {
                                    $('#invitation').append('<div class="tab-pane" id="topbar_notifications_teams" role="tabpanel">' +
                                        '<div class="d-flex flex-center text-center min-h-200px" id="noNotify">All caught up!<br/>' +
                                        'No new notifications.' +
                                        '</div>' +
                                        '</div>');
                                } else {
                                    $('#invitation').append(appendData);
                                }

                            } else {
                                $('#readAllTeam').remove();
                                $('#readAllPublish').remove();
                                $('#publishNotiFications').append('<div class="tab-pane" id="topbar_publishing" role="tabpanel">' +
                                    '<div class="d-flex flex-center text-center min-h-200px" id="noNotify">All caught up!<br/>' +
                                    'No new notifications.' +
                                    '</div>' +
                                    '</div>');
                                $('#invitation').append('<div class="tab-pane" id="topbar_notifications_teams" role="tabpanel">' +
                                    '<div class="d-flex flex-center text-center min-h-200px" id="noNotify">All caught up!<br/>' +
                                    'No new notifications.' +
                                    '</div>' +
                                    '</div>');
                            }
                        } else if (response.code === 400) {
                            $('#invitation').append('<div class="tab-pane" id="topbar_notifications_teams" role="tabpanel">' +
                                '<div class="d-flex flex-center text-center min-h-200px" id="noNotify">' + response.error + '<br/>' +
                                'can not get notifications' +
                                '</div>' +
                                '</div>');
                            $('#publishNotiFications').append('<div class="tab-pane" id="topbar_publishing" role="tabpanel">' +
                                '<div class="d-flex flex-center text-center min-h-200px" id="noNotify">' + response.error + '<br/>' +
                                'No new notifications.' +
                                '</div>' +
                                '</div>');
                            $('#readAllTeam').remove();
                            $('#readAllPublish').remove();

                        } else {
                            $('#invitation').append('<div class="tab-pane" id="topbar_notifications_teams" role="tabpanel">' +
                                '<div class="d-flex flex-center text-center min-h-200px" id="noNotify"><br/>' +
                                'Some error occured , can not get notifications' +
                                '</div>' +
                                '</div>');
                            $('#publishNotiFications').append('<div class="tab-pane" id="topbar_publishing" role="tabpanel">' +
                                '<div class="d-flex flex-center text-center min-h-200px" id="noNotify">' + 'Some error occured , can not get notifications' + '<br/>' +
                                '</div>' +
                                '</div>');
                            $('#readAllTeam').remove();
                            $('#readAllPublish').remove();
                        }
                    }
                });
            }

            /**
             * TODO we've to get all team id and user id of the User to use in socket connections.
             * This function is used for getting all team id and user id  of particular user to get socket connections.
             * by hitting API from controller.
             */
            $.ajax({
                type: 'get',
                url: '/get-user-data',
                success: function (response) {
                    if (response.code === 200) {
                        teamIds = response.teamIds;
                        userID = response.userId;
                        let num = 0;
                        let socket = io.connect('https://notifyv5.socioboard.com');
                        socket.on('connect', function () {
                            let details = {
                                userId: userID,
                                teamIds: teamIds
                            };
                            socket.emit('subscribe', details);
                        });
                        socket.on('notification', function (message) {
                            num++;
                            let appendData = '';
                            let appendData2 = '';
                            $("#notification-user").addClass("symbol-badge bg-danger");
                            if (message.notifyType === 'publish_publishPosts') {
                                appendData2 = '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a id="notificationNum' + num + '" href="' + getStringUrl(message.notificationMessage) + '" class="mb-1 font-size-lg" target="_blank" onclick="changeColorOnRead('+num+')">' + message.notificationMessage + ' </a></div></div>';
                                $('#publishNotiFications').prepend(appendData2);
                            } else if (message.notifyType === 'team_invite') {
                                $.ajax({
                                    url: '/get-invitations',
                                    type: 'get',
                                    success: function (response) {
                                        let appendInvite = '';
                                        if (response.code === 200) {
                                            let data = response.data;
                                            if (data.length > 0) {
                                                data.map(element => {
                                                    appendInvite += '<div class="d-flex align-items-center mb-6"> ' +
                                                        '<span class="symbol symbol-40 mr-5"><span class="symbol-label font-size-h6 font-weight-bold">' +
                                                        '<img src="' + '/media/logos/sb-icon.svg' + '" height="40px" width="40px"></span></span>' +
                                                        '<div class="d-flex flex-column font-weight-bold">' +
                                                        '<a href="javascript:;" class="mb-1 font-size-lg">' + element.team_name + '</a>' +
                                                        '<div class="form-group d-flex flex-wrap flex-center pb-lg-0 pb-3">' +
                                                        '<a class="btn btn-sm text-warning mr-5" onclick="acceptInvitation(' + element.team_id + ')">Accept</a>' +
                                                        '<a class="btn btn-sm text-danger" onclick="rejectInvitation(' + element.team_id + ')">Reject</a>' +
                                                        '</div></div></div>';
                                                });
                                            }
                                        }
                                        $('#userNotiFications').append(appendInvite);
                                    }
                                });
                            } else if (message.notifyType === 'team_accept') {
                                appendData = '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a  href="{{env('APP_URL')}}/view-teams" id="notificationNum' + num + '" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')" target="_blank">' + message.notificationMessage + '</a></div></div>';
                                $('#userNotiFications').prepend(appendData);
                            } else if (message.notifyType === 'team_decline') {
                                appendData = '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" id="notificationNum' + num + '" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')" target="_blank">' + message.notificationMessage + '</a></div></div>';
                                $('#userNotiFications').prepend(appendData);
                            } else if (message.notifyType === 'team_removeTeamMember') {
                                appendData = '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" id="notificationNum' + num + '" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')" target="_blank">' + message.notificationMessage + '</a></div></div>';
                                $('#userNotiFications').prepend(appendData);
                            } else if (message.notifyType === 'team_editMemberPermission') {
                                appendData = '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" id="notificationNum' + num + '" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')" target="_blank">' + message.notificationMessage + '</a></div></div>';
                                $('#userNotiFications').prepend(appendData);
                            } else if (message.notifyType === 'team_leave') {
                                appendData = '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" id="notificationNum' + num + '"  class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')" target="_blank">' + message.notificationMessage + '</a></div></div>';
                                $('#invitation').prepend(appendData);
                            } else if (message.notifyType === 'publish_addProfile') {
                                appendData = '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" id="notificationNum' + num + '" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')" target="_blank">' + message.notificationMessage + '</a></div></div>';
                                $('#invitation').prepend(appendData);
                            } else if (message.notifyType === 'team_addProfile') {
                                appendData = '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" id="notificationNum' + num + '" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')" target="_blank">' + message.notificationMessage + '</a></div></div>';
                                $('#invitation').prepend(appendData);
                            } else if (message.notifyType === 'team_deleteTeamSocialProfile') {
                                appendData = '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" id="notificationNum' + num + '"  class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')" target="_blank">' + message.notificationMessage + '</a></div></div>';
                                $('#invitation').prepend(appendData);
                            } else if (message.notifyType === 'team_leave') {
                                appendData = '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" id="notificationNum' + num + '" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')" target="_blank">' + message.notificationMessage + '</a></div></div>';
                                $('#invitation').prepend(appendData);
                            } else {
                                appendData = '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5 "><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" id="notificationNum' + num + '" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')" target="_blank">' + message.notificationMessage + '</a></div></div>';
                                $('#invitation').prepend(appendData);
                            }
                        });
                    } else {
                    }
                }
            });
            let pageid = 1;
            let pageid2 = 1;
            let pageid3 = 1;


            /**
             * TODO we've to get all notificationsof the teams on scrolling down of the scroller.
             * @param {string) pageid for getting the next 12 nortifications passing in controller.
             * @return {object} Returns getNotifications from  in JSON object format.
             */
            function getNotificationsNext(pageValue) {
                $.ajax({
                    type: 'get',
                    url: '/get-all-notifications-teams',
                    data: {
                        pageid: pageValue
                    },
                    beforeSend: function () {
                    },
                    success: function (response) {
                        let appendData = '';
                        let num=1;
                        if (response.code === 200) {
                            response.data.map(element => {
                                if (element.notifyType === 'team_leave') {
                                    appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-users"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')" >' + element.notificationMessage + '</a></div></div>';
                                } else if (element.notifyType === 'publish_addProfile') {
                                    appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-users"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                } else if (element.notifyType === 'team_addProfile') {
                                    appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-users"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                } else if (element.notifyType === 'team_deleteTeamSocialProfile') {
                                    appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-users"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}view-teams" target="_blank"  class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                } else if (element.notifyType === 'team_leave') {
                                    appendData += '<div  id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-users"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                } else {
                                    appendData += '<div class="d-flex align-items-center py-3 px-5 "><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-users"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}view-teams" class="mb-1 font-size-lg" target="_blank" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                }
                                num++;
                            });
                            $('#invitation').append(appendData);
                        }
                    }
                });
            }

            /**
             * TODO we've to get all notificationsof the User on load of the page.
             * @param {string) pageid for getting the first 12 nortifications passing in controller.
             * @return {object} Returns getNotifications from  in JSON object format.
             */
            function getNotificationsUser(pageValue) {
                $.ajax({
                    type: 'get',
                    url: '/get-all-notifications-users',
                    data: {
                        pageid: pageValue
                    },
                    beforeSend: function () {
                        $("#userNotiFications").html("");
                    },
                    success: function (response) {
                        let appendData2 = '';
                        let num = 1;
                        if (response.code === 200) {
                            if (response.data.length > 0) {
                                response.data.map(element => {
                                    if (element.notifyType === 'team_invite') {
                                        $.ajax({
                                            url: '/get-invitations',
                                            type: 'get',
                                            success: function (response) {
                                                let appendInvite = '';
                                                if (response.code === 200) {
                                                    let data = response.data;
                                                    if (data.length > 0) {
                                                        data.map(element => {
                                                            appendInvite += '<div class="d-flex align-items-center mb-6"> ' +
                                                                '<span class="symbol symbol-40 mr-5"><span class="symbol-label font-size-h6 font-weight-bold">' +
                                                                '<img src="' + '/media/logos/sb-icon.svg' + '" height="40px" width="40px"></span></span>' +
                                                                '<div class="d-flex flex-column font-weight-bold">' +
                                                                '<a href="javascript:;" class="mb-1 font-size-lg">' + element.team_name + '</a>' +
                                                                '<div class="form-group d-flex flex-wrap flex-center pb-lg-0 pb-3">' +
                                                                '<a class="btn btn-sm text-warning mr-5" onclick="acceptInvitation(' + element.team_id + ')">Accept</a>' +
                                                                '<a class="btn btn-sm text-danger" onclick="rejectInvitation(' + element.team_id + ')">Reject</a>' +
                                                                '</div></div></div>';
                                                        });
                                                    }
                                                }
                                                $('#userNotiFications').append(appendInvite);
                                            }
                                        });


                                    } else if (element.notifyType === 'team_accept') {
                                        appendData2 += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                    } else if (element.notifyType === 'team_decline') {
                                        appendData2 += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                    } else if (element.notifyType === 'team_removeTeamMember') {
                                        appendData2 += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                    } else if (element.notifyType === 'team_editMemberPermission') {
                                        appendData2 += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                    } else {
                                        appendData2 += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5 "><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                    }
                                    num++;
                                });
                                $('#userNotiFications').append(appendData2);
                            } else {
                                $('#userNotiFications').append('<div class="tab-pane" id="topbar_notifications_teams" role="tabpanel">' +
                                    '<div class="d-flex flex-center text-center min-h-200px" id="noNotify">All caught up!<br/>' +
                                    'No new notifications.' +
                                    '</div>' +
                                    '</div>');
                                $('#readAllUser').remove();
                            }
                        } else if (response.code === 400) {
                            $('#userNotiFications').append('<div class="tab-pane" id="topbar_notifications_teams" role="tabpanel">' +
                                '<div class="d-flex flex-center text-center min-h-200px" id="noNotify">' + response.error + '<br/>' +
                                'can not get notifications' +
                                '</div>' +
                                '</div>');
                            $('#readAllUser').remove();
                        } else {
                            $('#userNotiFications').append('<div class="tab-pane" id="topbar_notifications_teams" role="tabpanel">' +
                                '<div class="d-flex flex-center text-center min-h-200px" id="noNotify"><br/>' +
                                'Some error occured , can not get notifications' +
                                '</div>' +
                                '</div>');
                            $('#readAllUser').remove();
                        }
                    }
                });
            }

            /**
             * TODO we've to get all notificationsof the User on load of the page.
             * @param {string) pageid for getting the first 12 nortifications passing in controller.
             * @return {object} Returns getNotifications from  in JSON object format.
             */
            function getNotificationsPublishingNext(pageValue) {
                $.ajax({
                    type: 'get',
                    url: '/get-all-notifications-teams',
                    data: {
                        pageid: pageValue
                    },
                    beforeSend: function () {
                    },
                    success: function (response) {
                        let appendData = '';
                        if (response.code === 200) {
                            response.data.map(element => {
                                if (element.notifyType === 'publish_publishPosts') {
                                    appendData += '<div class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-rss"></i></span></span><div class="d-flex flex-column font-weight-bold"><a  href="' + getStringUrl(element.notificationMessage) + '" class="mb-1 font-size-lg" target="_blank" >' + element.notificationMessage + '</a></div></div>';
                                }
                            });
                            $('#publishNotiFications').append(appendData);
                        }
                    }
                });
            }

            /**
             * TODO we've to get all notificationsof the Publishing on load of the page.
             * @param {string) pageid for getting the first 12 nortifications passing in controller.
             * @return {object} Returns getNotifications from  in JSON object format.
             */
            function getNotificationsUserNext(pageValue) {
                $.ajax({
                    type: 'get',
                    url: '/get-all-notifications-users',
                    data: {
                        pageid: pageValue
                    },
                    beforeSend: function () {
                    },
                    success: function (response) {
                        let appendData = '';
                        let num = 1;
                        if (response.code === 200) {
                            response.data.map(element => {
                                if (element.notifyType === 'team_invite') {
                                    appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                } else if (element.notifyType === 'team_accept') {
                                    appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                } else if (element.notifyType === 'team_decline') {
                                    appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                } else if (element.notifyType === 'team_removeTeamMember') {
                                    appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                } else if (element.notifyType === 'team_editMemberPermission') {
                                    appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5"><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                } else {
                                    appendData += '<div id="notificationNum' + num + '" class="d-flex align-items-center py-3 px-5 "><span class="symbol symbol-40 mr-5"><span class="font-size-h5 font-weight-bold"><i class="fas fa-user"></i></span></span><div class="d-flex flex-column font-weight-bold"><a href="{{env('APP_URL')}}/view-teams" target="_blank" class="mb-1 font-size-lg" onclick="changeColorOnRead('+num+')">' + element.notificationMessage + '</a></div></div>';
                                }
                                num++;
                            });
                            $('#userNotiFications').append(appendData);
                        }
                    }
                });
            }

            /**
             * TODO we've to make read all user notifications on check box click.
             * This function makes read all user notificaations on checked of checkboxes.
             * @return {object} Returns getNotifications from  in JSON object format.
             */
            $("#checkboxes2").click(function () {
                if ($('#checkboxes2').is(':checked')) {
                    $.ajax({
                        type: 'put',
                        url: '/mark-all-notifications-user-read',
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        beforeSend: function () {
                        },
                        success: function (response) {
                            if (response.code === 200) {
                                toastr.success('Have read all user notifications');
                                $("#notification-user").removeClass("symbol-badge bg-danger");
                            } else if (response.code === 400) {
                                toastr.error(response.error);
                            } else {
                                toastr.error('Some error occured');
                            }
                        }
                    });
                }
            });

            /**
             * TODO we've to make read all team notifications on check box click.
             * This function makes read all team notificaations on checked of checkboxes.
             * @return {object} Returns getNotifications from  in JSON object format.
             */
            $("#checkboxes1").click(function () {
                if ($('#checkboxes1').is(':checked')) {
                    $.ajax({
                        type: 'put',
                        url: '/mark-all-notifications-team-read',
                        headers: {
                            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                        },
                        beforeSend: function () {
                        },
                        success: function (response) {
                            if (response.code === 200) {
                                toastr.success('Have read all user team notifications');
                                $("#notification-user").removeClass("symbol-badge bg-danger");
                            } else if (response.code === 400) {
                                toastr.error(response.error);
                            } else {
                                toastr.error('Some error occured');
                            }
                        }
                    });
                }
            });

            function planCheck(url) {
                let expire_date = '<?php echo(session()->get('expired'));?>';
                if (expire_date === 'true') {
                    toastr.error('Please upgrade your plan first');
                } else {
                    window.location.href = url
                }
            }

            function getStringUrl(text) {
                let urlRegex = /(https?:\/\/[^ ]*)/;
                let input = text
                let url = input.match(urlRegex)[1];
                return url;
            }

            function checkPlanExpiryNotifications() {
                $('#teams_tab').trigger('click');
                let expire_date = '<?php echo(session()->get('expired'));?>';
                if (expire_date === 'true') {
                    $('.notificationsIcon').removeAttr('data-toggle');
                    toastr.error('Please upgrade your plan first');
                }
            }

            function changeColorOnRead(data)
            {
                $('div#notificationNum' + data).addClass( 'read');
            }

            /**
             * TODO we've to get the next notifications on scrollers actions.
             * This function detect the when scrollers are going down.
             * @return {object} Returns getNotifications from  in JSON object format.
             */
            jQuery(function ($) {
                $('#invitation').on('scroll', function () {
                    if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                        pageid++;
                        getNotificationsNext(pageid);
                    }
                });
                $('#userNotiFications').on('scroll', function () {
                    if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                        pageid2++;
                        getNotificationsUserNext(pageid2);
                    }
                });
                $('#publishNotiFications').on('scroll', function () {
                    if ($(this).scrollTop() + $(this).innerHeight() >= $(this)[0].scrollHeight) {
                        pageid3++;
                        getNotificationsPublishingNext(pageid3);
                    }
                });
            });
        </script>
{{-- scripts that are used in blades --}}
@yield('scripts')
@yield('page-scripts')
</body>
</html>


