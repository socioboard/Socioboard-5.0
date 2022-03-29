@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Team Reports</title>
@endsection

@section('content')
    <!--begin::Content-->
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Report-->
                <div class="d-flex">
                    <!-- begin:Team list -->
                    <div class="form-group">
                        <script>
                            var teamid = '<?php echo $teams['data']->teamSocialAccountDetails[0][0]->team_id;?>';
                        </script>
                        <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 teamSelectDiv"
                                onchange="changeTeamResponse(this)">
                            @if($teams['code']===200)
                                <option disabled>Select Team</option>
                                @foreach($teams['data']->teamSocialAccountDetails as $data)
                                    <option value="{{$data[0]->team_id}}">{{$data[0]->team_name}}</option>
                                @endforeach
                            @elseif($teams['code']===400)
                                <option value="Team 2">Some error ocured ,no team data</option>
                            @else
                                <option value="Team 2">Some error ocured ,no team data</option>
                            @endif
                        </select>

                    </div>
                    <!-- end:Team list -->
                    <div class="ml-auto">
                        <!-- datepicker -->
                        <div class="form-group">
                            <div class="input-icon team_Date_Range" id='team-daterange' style="width: 300px">
                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                       type="text" name="datepicker" autocomplete="off" id="team-daterange-input"
                                       placeholder="Select Date Range"/>
                                <span><i class="far fa-calendar-alt"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
                <!--begin::Teams-->
                <div class="card card-custom gutter-b" id="ss-Div">
                    <div class="card-body">
                        <!--begin::Top-->
                        <div class="d-flex">
                            <!--begin::Pic-->
                            <div class="flex-shrink-0 mr-7">
                                <div class="symbol symbol-50 symbol-lg-120">
                                    @if($teams['data']->teamSocialAccountDetails[0][0]->team_logo === 'www.socioboard.com' || $teams['data']->teamSocialAccountDetails[0][0]->team_logo === "www.NA.com" )
                                        <img id="teamImageLink"
                                             src="/media/logos/sb-icon.svg" alt="SB"/>
                                    @else
                                        <img id="teamImageLink"
                                             src="{{$teams['data']->teamSocialAccountDetails[0][0]->team_logo}}"
                                             alt="SB"/>
                                    @endif
                                </div>
                            </div>
                            <!--end::Pic-->

                            <!--begin: Info-->
                            <div class="flex-grow-1">
                                <!--begin::Title-->
                                <div class="d-flex align-items-center justify-content-between flex-wrap mt-2 card-stretch">
                                    <!--begin::User-->
                                    <div class="mr-3">
                                        <!--begin::Name-->
                                        <a href="team/{{$teams['data']->teamSocialAccountDetails[0][0]->team_id}}"
                                           id="teamName"
                                           class="d-flex align-items-center text-hover-primary font-size-h5 font-weight-bold mr-3">
                                            {{$teams['data']->teamSocialAccountDetails[0][0]->team_name}}
                                        </a>
                                        <!--end::Name-->

                                        <!--begin::Contacts-->
                                        <div class="d-flex flex-wrap my-2">
                                                        <span class="text-muted font-weight-bold mr-lg-8 mr-5 mb-lg-0 mb-2">
                                                            <span class="svg-icon svg-icon-md svg-icon-gray-500 mr-1">
                                                                <i class="fas fa-user fa-fw"></i>
                                                            </span>
                                                            TEAM
                                                        </span>
                                        </div>
                                        <!--end::Contacts-->
                                    </div>
                                    <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                         title="Add to custom Reports"><i class="fa fa-plus fa-md"
                                                                          aria-hidden="true"></i>
                                        <span node-id="ss-Div_d-flex" class="ss addtcartclose"></span>
                                    </div>
                                    <span class="spinner spinner-primary spinner-center" id="ss-Div_d-flex" style="
    display: none;"></span>
                                    <!--begin::User-->

                                    <!--begin::Teams Actions Dropdown-->
                                    <div class="card-toolbar">
                                        <a href="team/{{$teams['data']->teamSocialAccountDetails[0][0]->team_id}}"
                                           id="viewTeam"
                                           class="btn btn-sm">
                                            View This Team
                                        </a>
                                    </div>
                                    <!--end::Teams Actions Dropdown-->
                                </div>
                                <!--end::Title-->

                                <!--begin::Content-->
                                <div class="d-flex align-items-center flex-wrap justify-content-between">
                                {{--                                    <!--begin::Description-->--}}
                                {{--                                    <div class="flex-grow-1 font-weight-bold py-2 py-lg-2 mr-5">--}}
                                {{--                                        <i class="fas fa-bell fa-fw"></i> 23 pending messages--}}
                                {{--                                    </div>--}}
                                <!--end::Description-->
                                </div>
                                <!--end::Content-->
                            </div>
                            <!--end::Info-->
                        </div>
                        <!--end::Top-->

                        <!--begin::Separator-->
                        <div class="separator separator-solid my-7"></div>
                        <!--end::Separator-->

                        <!--begin::Bottom-->
                        <div class="d-flex align-items-center flex-wrap team-members_Info_div">
                            <!--begin: Item-->
                            <div class="d-flex align-items-center flex-lg-fill mr-5 my-1 ">
                                            <span class="mr-4">
                                                <i class="fas fa-user fa-2x text-info font-weight-bold"></i>
                                            </span>
                                <div class="d-flex flex-column teamMembersCounts">
                                    <span class="font-weight-bolder font-size-sm ">Team Members List</span>
                                    @if($memberDetails['code']=== 200)
                                        <span class="font-weight-bolder font-size-h5"
                                              id="invitedList">{{$memberDetails['data']->TeamMemberStats->teamMembersCount}}</span>
                                    @else
                                        <span class="font-weight-bolder font-size-h5">N/A</span>
                                    @endif
                                </div>
                            </div>
                            <!--end: Item-->

                            <!--begin: Item-->
                            <div class="d-flex align-items-center flex-lg-fill mr-5 my-1">
                                            <span class="mr-4">
                                                <i class="fas fa-envelope fa-2x text-danger font-weight-bold"></i>
                                            </span>
                                <div class="d-flex flex-column invitePendingCounts">
                                    <span class="font-weight-bolder font-size-sm "
                                    >Invite Pending</span>
                                    @if($memberDetails['code']=== 200)
                                        <script>
                                            let socialProfileCount = <?php if (isset($members)) {
                                                echo count($members->data->teamSocialAccountDetails[0]->SocialAccount);
                                            } ?>
                                        </script>
                                        <span class="font-weight-bolder font-size-h5"
                                              id="invitePending">{{$memberDetails['data']->TeamMemberStats->invitedList}}</span>
                                    @else
                                        <span class="font-weight-bolder font-size-h5">N/A</span>
                                    @endif


                                </div>
                            </div>
                            <!--end: Item-->

                            <!--begin: Item-->
                            <div class="d-flex align-items-center flex-lg-fill mr-5 my-1">
                                            <span class="mr-4">
                                                <i class="fas fa-user fa-2x text-danger font-weight-bold"></i>
                                            </span>
                                <div class="d-flex flex-column leftFromTeamCounts">
                                    <span class="font-weight-bolder font-size-sm ">Left From Team</span>
                                    @if($memberDetails['code']=== 200)
                                        <span class="font-weight-bolder font-size-h5"
                                              id="invitees">{{$memberDetails['data']->TeamMemberStats->leftTeamMem}}</span>
                                    @else
                                        <span class="font-weight-bolder font-size-h5">N/A</span>
                                    @endif


                                </div>
                            </div>
                            <!--end: Item-->
                            <!--begin: Item-->
                            <div class="d-flex align-items-center flex-lg-fill my-1 teamMembersNamesDiv">
                                            <span class="mr-4">
                                                <i class="fas fa-user fa-2x text-info font-weight-bold"></i>
                                            </span>
                                <div class="symbol-group symbol-hover" id="memberProfileDetails">
                                    @if($members->code === 200)
                                        @if(count($members->data->memberProfileDetails)>0)
                                            @foreach($members->data->memberProfileDetails as $data)
                                                @if($data->invitation_accepted === 1 && $data->left_from_team === 0 )
                                                    <div class="symbol symbol-30 symbol-circle" onclick="return false"
                                                         id="members_name"
                                                         title="{{$data->first_name}} {{$data->last_name}}"
                                                    >
                                                        <img alt="Pic"
                                                             src="<?php echo teamProfilePic($data->profile_picture); ?>"
                                                             id="team_image_out">
                                                    </div>
                                                @endif
                                            @endforeach
                                        @endif
                                    @endif($members->code === 400)
                                </div>
                            </div>
                            <!--end: Item-->
                        </div>
                        <!--end::Bottom-->
                    </div>
                </div>
                <!--end::Teams-->
                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-8 schduledChartsDiv" id="ss-scheduled">
                        <div class="card card-custom gutter-b card-stretch">
                            <div class="card-header border-0 py-5 ml-auto">
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-scheduled_md8" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-scheduled_md8" style="
    display: none;"></span>
                            </div>

                            <div class="card-body d-flex flex-column pt-0 ">
                                <h3 class="card-title font-weight-bolder">Schedule Stats</h3>
                                <div class="flex-grow-1">
                                    <div id="line-adwords" class="card-rounded-bottom " style="height: 200px"></div>
                                </div>
                                <div class="mt-10 mb-5">
                                    <div class="row row-paddingless mb-10">
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <div class="symbol symbol-45 symbol-light-primary mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-primary">
                                                                            <i class="far fa-clock fa-2x text-primary"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="scheduled"></div>


                                                    <div class="font-size-sm font-weight-bold mt-1">Scheduled</div>
                                                </div>
                                            </div>
                                        </div>
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
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="published"></div>


                                                    <div class="font-size-sm font-weight-bold mt-1">Published</div>
                                                </div>
                                            </div>
                                        </div>
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
                                                    <div class="font-size-h4 font-weight-bolder" id="failed"></div>


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
                    <div class="col-xl-4 published_DIv" id="ss-published">
                        <div class="card card-custom card-stretch gutter-b ">
                            <div class="card-header border-0 pt-5">
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-published_md4" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-published_md4" style="
    display: none;"></span>
                            </div>

                            <div class="card-body d-flex flex-column pt-0">
                                <h3 class="card-title font-weight-bolder">Publish Report</h3>
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

                                                <!--end::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-success mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
 <span class="svg-icon svg-icon-lg svg-icon-success">
 <i class="fas fa-user-plus text-success fa-2x"></i>
 </span>
                                                    </div>
                                                </div>
                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder"
                                                         id="socialProfileCount"> {{count($members->data->teamSocialAccountDetails[0]->SocialAccount)}} </div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Social Profile Count
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
                                                         id="scheduledPublished"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Schedule Publish
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
                                                    <div class="font-size-h4 font-weight-bolder" id="totalpostFailed">
                                                    </div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Total Post Failed
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
                                                    <div class="font-size-sm font-weight-bold mt-1">Total Post Count
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
                </div>
                <!--end::Row-->
                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-6" id="ss-twitter">
                        <!--begin::Mixed Widget 2-->
                        <div class="card card-custom gutter-b card-stretch rounded ribbon ribbon-clip ribbon-left">
                            <div class="ribbon-target bg-twitter" style="top: 15px; height: 45px;">
                                <span class="ribbon-inner"></span><i class="fab fa-twitter"></i>
                            </div>
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <!-- <h3 class="card-title font-weight-bolder">Twitter Stats</h3> -->
                                <!-- begin:Account list -->
                                <script>
                                    var twtvalue = false;
                                </script>
                                <div class="form-group" id="twitterReportsDiv">
                                    @if(count($teams['data']->teamSocialAccountDetails[0][0]->SocialAccount)>0)
                                        @foreach($teams['data']->teamSocialAccountDetails[0][0]->SocialAccount as $data)
                                            @if($data->account_type === 4)
                                                <script>
                                                    let twitterid = <?php echo $data->account_id ?>;
                                                </script>
                                                @break
                                            @endif
                                        @endforeach
                                        <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 twitterAccountsData"
                                                onchange="changeTwitterData(this)" id="selectDropdownTwitter">
                                            <option disabled id="selectDropdown2">Select Account</option>

                                            @foreach($teams['data']->teamSocialAccountDetails[0][0]->SocialAccount as $data)
                                                @if($data->account_type === 4)
                                                    <option
                                                            value="{{$data->account_id }}">{{$data->first_name }}</option>
                                                    <script>
                                                        var twtvalue = true;
                                                    </script>
                                                @endif
                                            @endforeach
                                        </select>
                                    @endif
                                </div>
                                <!-- end:Account list -->
                                <div class="card-toolbar">
                                </div>
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-twitter_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-twitter_md6" style="
    display: none;"></span>
                            </div>
                            <div class="card-body p-0 position-relative overflow-hidden twt_stats_chart">
                                <div id="twt_stats_chart" class="card-rounded-bottom " style="height: 200px"></div>
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Mixed Widget 2-->
                    </div>
                    <div class="col-xl-6" id="ss-facebook">
                        <!--begin::Mixed Widget 16-->
                        <div class="card card-custom card-stretch gutter-b rounded ribbon ribbon-clip ribbon-left">
                            <div class="ribbon-target bg-facebook" style="top: 15px; height: 45px;">
                                <span class="ribbon-inner"></span><i class="fab fa-facebook"></i>
                            </div>
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5">
                                <script>
                                    var fbvalue = false;
                                </script>
                                <div class="form-group" id="facebookReportsDiv">
                                    @foreach($teams['data']->teamSocialAccountDetails[0][0]->SocialAccount as $data)
                                        @if($data->account_type === 2)
                                            <script>
                                                var accid = <?php echo $data->account_id ?>;
                                            </script>
                                            @break
                                        @endif
                                    @endforeach
                                    @if(count($teams['data']->teamSocialAccountDetails[0][0]->SocialAccount)>0)
                                        <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 faceBookAccountsData"
                                                onchange="changeFacebookData(this)"
                                                id="selectDropdownFacebook">
                                            <option disabled id="selectDropdown">Select Account</option>
                                            @foreach($teams['data']->teamSocialAccountDetails[0][0]->SocialAccount as $data)
                                                @if($data->account_type === 2)
                                                    <option
                                                            value="{{$data->account_id }}">{{$data->first_name }}</option>
                                                    <script>
                                                        var fbvalue = true;
                                                    </script>
                                                @endif
                                            @endforeach
                                        </select>
                                    @endif
                                </div>
                                <div class="card-toolbar">
                                </div>
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-facebook_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-facebook_md6" style="
    display: none;"></span>
                            </div>
                            <!--end::Header-->

                            <!--begin::Body-->
                            <div class="card-body p-0 position-relative overflow-hidden fb_stats_chart">
                                <div id="fb_stats_chart" class="card-rounded-bottom" style="height: 200px"></div>
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Mixed Widget 16-->
                    </div>
                </div>
                <!--end::Row-->
                <!--end::Report-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
    <!--end::Content-->
@endsection

@section('scripts')
    <script src="https://unpkg.com/intro.js/minified/intro.min.js"></script>
    <script>

        // fb page list div open
        $(".fb_page_div").css({
            display: "none"
        });
        $(".fb_page_btn").click(function () {
            $(".fb_page_div").css({
                display: "block"
            });
        });


        // linkedin page list div open
        $(".linkedin_page_div").css({
            display: "none"
        });
        $(".linkedin_page_btn").click(function () {
            $(".linkedin_page_div").css({
                display: "block"
            });
        });
    </script>

    <script>
        // team date ranges
        var start = moment().subtract(6, 'days');
        var end = moment();
        let DefaultRange = `${moment().subtract(6, 'days').format('MMM DD, YYYY')} -> ${moment().format('MMM DD, YYYY')}`;

        $("li[data-range-key='Last 30 Days']").removeAttr('class');
        $("li[data-range-key='Last 7 Days']").attr("class", "active");
        $('#team-daterange').daterangepicker({
                buttonClasses: ' btn',
                applyClass: 'btn-primary',
                cancelClass: 'btn-secondary',
                startDate: start,
                endDate: end,
                maxDate: new Date(),
                ranges: {
                    'Today': [moment(), moment()],
                    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                    'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
                }
            },
            function (start, end, label) {
                changeTeamResponseCalendar(start, end);
                $('#team-daterange .form-control').val(start.format('MMM DD, YYYY') + ' -> ' + end.format('MMM DD, YYYY'));
            });

        $('#team-daterange-input').attr('value', DefaultRange);
        // delete account
        $('#account-delete').click(function (event) {
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

            toastr.error("Your account has been deleted!", "Deleted");

        });

    </script>

    <!-- charts -->

    <script>
        <?php
        function teamProfilePic($data)
        {
            if (file_exists(public_path($data))) {
                return env('APP_URL') . $data;
            } else {
                if (filter_var($data, FILTER_VALIDATE_URL) === FALSE) {
                    return env('APP_URL') . "media/svg/avatars/001-boy.svg";
                } else {
                    return $data;
                }
            }
        }
        ?>
        function changeTeamResponse(data) {
            teamid = data.value;
            $.ajax({
                type: 'post',
                url: '/get-reports-change-team',
                data: {
                    teamid: teamid
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                },
                success: function (response) {
                    let profile_picture;
                    let socialProfileCount = 0;
                    if (response.teamsData.code === 200) {
                        $("#viewTeam").attr("href", 'team/' + teamid + '');
                        document.getElementById('teamImageLink').src = response.teamsData.data.teamSocialAccountDetails[0].team_logo;
                        $('#teamName, #memberProfileDetails').empty();
                        $('#teamName').append(response.teamsData.data.teamSocialAccountDetails[0].team_name);
                        if (response.teamsData.data.memberProfileDetails.length > 0) {
                            response.teamsData.data.memberProfileDetails.map(element => {
                                profile_picture = element.profile_picture;
                                if (isValidURL(element.profile_picture) === true) {
                                    profile_picture = element.profile_picture;
                                } else {
                                    profile_picture = (profile_picture === "defaultPic.jpg" ? "/media/svg/avatars/001-boy.svg" : '../' + element.profile_picture);
                                }
                                if (element.invitation_accepted === 1 && element.left_from_team === 0) {
                                    $('#memberProfileDetails').append('<div class="symbol symbol-30 symbol-circle"\n' +
                                        'title="' + element.first_name + " " + element.last_name + '" onclick="return false"\n' +
                                        'id="members_name">\n' +
                                        '<img alt="Pic" src="' + profile_picture + '"/>\n' +
                                        '</div>');
                                    $("#members_name").tooltip();

                                }

                            });
                            socialProfileCount = response.teamsData.data.teamSocialAccountDetails[0].SocialAccount.length;
                            setTimeout(function () {
                                getScheduleReports(teamid, 3,0,0,socialProfileCount);
                            }, 2000);
                        }
                        if (response.teamsData.data.teamSocialAccountDetails[0].SocialAccount.length > 0) {
                            if (response.twitterAccs.length > 0) {
                                var twitterId = response.twitterAccs[0].account_id;
                                $('#twitterReportsDiv').empty();
                                $("#selectDropdownTwitter").empty();
                                $('#twitterReportsDiv').append(' <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"\n' +
                                    'onchange="changeTwitterData(this)" id="selectDropdownTwitter">\n' +
                                    '<option disabled id="selectDropdown2">Select Account</option>');
                                response.twitterAccs.map(element => {
                                    $('#selectDropdownTwitter').append(' <option\n' +
                                        '                                                        value="' + element.account_id + '">' + element.first_name + '</option>');
                                });
                                $('#twitterReportsDiv').append('</select>');
                                getTwitterReports(teamid, twitterId, 3, 0, 0);
                            } else {
                                $('#twitterReportsDiv').empty();
                                $('#twt_stats_chart').empty();
                                $('#twt_stats_chart').append('<div class="text-center">\n' +
                                    '<div class="symbol symbol-150">\n' +
                                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '</div>\n' +
                                    '<h6>Currently no twitter accounts added for this team</h6>' +
                                    '</div>');
                            }
                            if (response.fbaccs.length > 0) {
                                var facebookid = response.fbaccs[0].account_id;
                                $('#facebookReportsDiv').empty();
                                $("#selectDropdownFacebook").empty();
                                $('#facebookReportsDiv').append(' <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6"\n' +
                                    '                                             onchange="changeFacebookData(this)"   id="selectDropdownFacebook">\n' +
                                    '                                            <option disabled id="selectDropdown">Select Account</option>');
                                response.fbaccs.map(element => {
                                    $('#selectDropdownFacebook').append(' <option\n' +
                                        '                                                        value="' + element.account_id + '">' + element.first_name + '</option>');
                                });
                                $('#facebookReportsDiv').append('</select>');
                                getFacebookReports(teamid, facebookid, 3);
                            } else {
                                $('#facebookReportsDiv').empty();
                                $('#fb_stats_chart').empty();
                                $('#fb_stats_chart').append('<div class="text-center">\n' +
                                    '                                                                                    <div class="symbol symbol-150">\n' +
                                    '                                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                    '                                                                                    </div>\n' +
                                    ' <h6>Currently no facebook accounts added for this team</h6>' +
                                    '                                                                               </div>');
                            }
                        } else {
                            $('#twitterReportsDiv').empty();
                            $('#twt_stats_chart').empty();
                            $('#twt_stats_chart').append('<div class="text-center">\n' +
                                '<div class="symbol symbol-150">\n' +
                                '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                '</div>\n' +
                                ' <h6>Currently no twitter accounts added for this team</h6>' +
                                '</div>');
                            $('#facebookReportsDiv').empty();
                            $('#fb_stats_chart').empty();
                            $('#fb_stats_chart').append('<div class="text-center">\n' +
                                '                                                                                    <div class="symbol symbol-150">\n' +
                                '                                                                                        <img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                '                                                                                    </div>\n' +
                                ' <h6>Currently no facebook accounts added for this team</h6>' +
                                '                                                                               </div>');
                        }

                    }
                    if (response.teamInsight.code === 200) {
                        $('#invitePending, #invitees, #invitePending, #invitedList').empty();
                        $('#invitePending').append(response.teamInsight.data.TeamMemberStats.invitedList);
                        $('#invitees').append(response.teamInsight.data.TeamMemberStats.leftTeamMem);
                        $('#invitedList').append(response.teamInsight.data.TeamMemberStats.teamMembersCount);
                    }
                }
            });
        }


        function getScheduleReports(teamid, filterPeriod, startDate, endDate,socialProfileCount) {
            $.ajax({
                type: 'post',
                url: '/get-schedule-reports',
                data: {
                    teamid, filterPeriod, startDate, endDate
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#line-adwords, #team-report, #scheduled, #published, #failed, #scheduledPublished, #totalPostCount, #totalpostFailed, #socialProfileCount').empty();
                    $('#team-report').append('<div class="d-flex justify-content-center" >\n' +
                        '<div class="spinner-border" role="status" style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div>\n' +
                        '</div>');
                    $('#line-adwords').append('<div class="d-flex justify-content-center" >\n' +
                        '<div class="spinner-border" role="status" style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div>\n' +
                        '\n' +
                        '</div>');
                    $(".spinner-border").css("display", "block");
                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    let date = [];
                    let published = [];
                    let postFailed = [];
                    let schedulePosts = [];
                    if (response.code === 200) {
                        response.data.daywisesData.map(element => {
                            date.push(element.date);
                            published.push(element.postCount);
                            postFailed.push(element.postFailed);
                            schedulePosts.push(element.schedulePosts);
                        });
                        $('#scheduled').append(response.data.totalschedulePosts);
                        $('#published').append(response.data.totalPost);
                        $('#failed').append(response.data.totalpostFailed);
                        $('#scheduledPublished').append(response.data.totalschedulePosts);
                        $('#totalPostCount').append(response.data.totalPost);
                        $('#totalpostFailed').append(response.data.totalpostFailed);
                        $('#socialProfileCount').append(socialProfileCount);
                        var optionsLine = {
                            chart: {
                                height: 328,
                                type: 'line',
                                // zoom: {
                                //     enabled: false
                                // },
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
                            //colors: ["#3F51B5", '#2196F3'],
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
                                        fontSize: '10px'
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
                        // Teams report
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
                            series: [response.data.totalPost, socialProfileCount, response.data.totalschedulePosts, response.data.totalpostFailed],
                            labels: ["Total Post Count", "Social Profile Count", "Schedule Publish", "Total Post Failed"]
                        };

                        var chart = new ApexCharts(document.querySelector("#team-report"), options);

                        chart.render();

                    } else if (response.code === 400) {
                        $('#scheduled').append(0);
                        $('#published').append(0);
                        $('#failed').append(0);
                        $('#scheduledPublished').append(0);
                        $('#totalPostCount').append(0);
                        $('#totalpostFailed').append(0);
                        $('#socialProfileCount').append(0);
                        $("#team-report").append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6> ' + response.error + ' </h6>\n' +
                            '</div>');
                        $("#line-adwords").append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6> ' + response.error + ' </h6>\n' +
                            '</div>');
                    } else {
                        $("#team-report").append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6> Some error occured , can not get Team reports data  data for tea</h6>\n' +
                            '</div>');
                        $("#line-adwords").append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6> ' + "Some error occured , can not get Publish reports data for team" + ' </h6>\n' +
                            '</div>');
                    }
                }
            });
        }


        function getTwitterReports(teamid, accid, filterPeriod, startDate, endDate) {
            $.ajax({
                type: 'post',
                url: '/get-twitter-reports',
                data: {
                    teamid, accid, filterPeriod, startDate, endDate,
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#twt_stats_chart').empty();
                    $('.loader-class').remove();
                    $('#twt_stats_chart').append('<div class="d-flex justify-content-center loader-class" >\n' +
                        '<div class="spinner-border" role="status" style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div>\n' +
                        '\n' +
                        '</div>');
                    $(".spinner-border").css("display", "block");
                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    if (response.code === 200) {
                        let date = [];
                        let followersCount = [];
                        let followingCount = [];
                        let likecount = [];
                        let postsCount = [];
                        response.data.data.map(element => {
                            date.push(element.date);
                            followersCount.push(element.followerCount);
                            followingCount.push(element.followingCount);
                            likecount.push(element.favouritesCount);
                            postsCount.push(element.postsCount);
                        });

                        let options = {
                            series: [
                                {
                                    name: "Followers",
                                    data: followersCount
                                },
                                {
                                    name: "Following",
                                    data: followingCount
                                },
                                {
                                    name: "Likes",
                                    data: likecount
                                },
                                {
                                    name: "Posts",
                                    data: postsCount
                                }
                            ],
                            chart: {
                                type: "bar",
                                height: 350,
                                zoom: {
                                    enabled: true,
                                    type: 'x',
                                    autoScaleYaxis: false,
                                    zoomedArea: {
                                        fill: {
                                            color: '#90CAF9',
                                            opacity: 0.4
                                        },
                                        stroke: {
                                            color: '#0D47A1',
                                            opacity: 0.4,
                                            width: 1
                                        }
                                    }
                                }
                            },
                            plotOptions: {
                                bar: {
                                    horizontal: false,
                                    columnWidth: "55%",
                                    endingShape: "rounded"
                                }
                            },
                            dataLabels: {
                                enabled: false
                            },
                            stroke: {
                                show: true,
                                width: 2,
                                colors: ["transparent"]
                            },
                            xaxis: {

                                labels: {
                                    rotate: -45,
                                    style: {
                                        fontSize: "11px",
                                        cssClass: ".apexcharts-margin"
                                    },
                                },
                                categories: date,

                                tickPlacement: 'on'
                            },
                            yaxis: {
                                title: {
                                    text: "counts"
                                }
                            },
                            fill: {
                                opacity: 1
                            },
                            tooltip: {
                                theme: 'dark',
                                y: {
                                    formatter: function (val) {
                                        return val;
                                    }
                                }
                            }
                        };

                        var chart = new ApexCharts(document.querySelector("#twt_stats_chart"), options);
                        chart.render();
                    } else if (response.code === 400) {
                        $("#twt_stats_chart").append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6> ' + response.error + ' </h6>\n' +
                            '</div>');
                    } else {
                        $("#twt_stats_chart").append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6> Some error occured , can not get Twitter reports data </h6>\n' +
                            '</div>');
                    }
                }
            });
        }

        function getFacebookReports(teamid, accid, filterPeriod, startDate, endDate) {
            $.ajax({
                type: 'post',
                url: '/get-facebook-reports',
                data: {
                    teamid, accid, filterPeriod, startDate, endDate
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#fb_stats_chart').empty();
                    $('.loader-class').remove();
                    $('#fb_stats_chart').append('<div class="d-flex justify-content-center loader-class" >\n' +
                        '<div class="spinner-border" role="status" style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div>\n' +
                        '\n' +
                        '</div>');
                    $(".spinner-border").css("display", "block");
                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    let likes = [];
                    let dates = [];
                    let impressions = [];
                    let dailytotalreach = [];
                    if (response.code === 200) {
                        response.data.data.map(element => {
                            if (element.title === 'Daily New Likes') {
                                element.values.map(element => {
                                    likes.push(element.value);
                                    dates.push(element.end_time.substring(0, 10));
                                });
                            } else if (element.title === 'Daily Total Impressions') {
                                element.values.map(element => {
                                    impressions.push(element.value);
                                });
                            } else if (element.title === 'Daily Total Reach') {
                                element.values.map(element => {
                                    dailytotalreach.push(element.value);
                                });
                            }
                        });
                        var options = {
                            series: [
                                {
                                    name: "Likes",
                                    data: likes
                                },
                                {
                                    name: "Impressions",
                                    data: impressions
                                },
                                {
                                    name: "Daily total reach",
                                    data: dailytotalreach
                                }
                            ],
                            chart: {
                                type: "bar",
                                height: 350,
                                zoom: {
                                    enabled: true,
                                    type: 'x',
                                    autoScaleYaxis: false,
                                    zoomedArea: {
                                        fill: {
                                            color: '#90CAF9',
                                            opacity: 0.4
                                        },
                                        stroke: {
                                            color: '#0D47A1',
                                            opacity: 0.4,
                                            width: 1
                                        }
                                    }
                                }
                            },
                            plotOptions: {
                                bar: {
                                    horizontal: false,
                                    columnWidth: "55%",
                                    endingShape: "rounded"
                                }
                            },
                            dataLabels: {
                                enabled: false
                            },
                            stroke: {
                                show: true,
                                width: 2,
                                colors: ["transparent"]
                            },
                            xaxis: {

                                labels: {
                                    rotate: -45,
                                    style: {
                                        fontSize: "11px",
                                        cssClass: ".apexcharts-margin"
                                    },
                                },
                                categories: dates,

                                tickPlacement: 'on'
                            },
                            yaxis: {
                                title: {
                                    text: "counts"
                                }
                            },
                            fill: {
                                opacity: 1
                            },
                            tooltip: {
                                theme: 'dark',
                                y: {
                                    formatter: function (val) {
                                        return val;
                                    }
                                }
                            }
                        };
                        var chart = new ApexCharts(document.querySelector("#fb_stats_chart"), options);
                        chart.render();
                    } else if (response.code === 400) {
                        $("#fb_stats_chart").append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6> ' + response.error + ' </h6>\n' +
                            '</div>');
                    } else if (response.code === 500) {
                        $("#fb_stats_chart").append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6> Some error occured,Can not get facebook Reports  </h6>\n' +
                            '</div>');
                    }
                }
            });
        }

        function changeTwitterData(data) {
            accountID = data.value;
            if (startDate === undefined) {
                getTwitterReports(teamid, accountID, 3, 0, 0);
            } else {
                getTwitterReports(teamid, accountID, 7, startDate, endDate);

            }

        }

        function changeFacebookData(data) {
            accountID = data.value;
            if (startDate === undefined) {
                getFacebookReports(teamid, accountID, 3, 0, 0);

            } else {
                getFacebookReports(teamid, accountID, 7, startDate, endDate);

            }
        }

        function formatDate(date) {
            let d = new Date(date),
                month = '' + (d.getMonth() + 1),
                day = '' + d.getDate(),
                year = d.getFullYear();

            if (month.length < 2)
                month = '0' + month;
            if (day.length < 2)
                day = '0' + day;

            return [year, month, day].join('-');
        }

        let startDate=0;
        let endDate=0;

        function changeTeamResponseCalendar(a, b) {
            startDate = formatDate(a);
            endDate = formatDate(b);
            setTimeout(function () {
                getFacebookReports(teamid, accid, 7, startDate, endDate);
            }, 4000);
            setTimeout(function () {
                getTwitterReports(teamid, twitterid, 7, startDate, endDate);
            }, 2000);
            setTimeout(function () {
                getScheduleReports(teamid, 7, startDate, endDate,socialProfileCount);
            }, 1000);
        }

        $(document).ready(function () {
            $('#quick_actions').tooltip();
            $("li[data-range-key='Last 30 Days']").removeAttr('class');
            $("li[data-range-key='Last 7 Days']").attr("class", "active");
            $("#reportsButton").trigger("click");
            if (fbvalue === false) {
                $("#selectDropdown").remove();
                $('#facebookReportsDiv').empty();
                $('#fb_stats_chart').empty();
                $("#fb_stats_chart").append(' <div class="text-center">\n' +
                    '<div class="symbol symbol-150 noFacebookAccountsAddedDiv">\n' +
                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                    '</div>\n' +
                    '<h6>Currently, no facebook pages added to this team.</h6>\n' +
                    '</div>');
            } else {
                setTimeout(function () {
                    getFacebookReports(teamid, accid, 3, 0, 0);
                }, 4000);
            }
            if (twtvalue === false) {
                $("#selectDropdown2").remove();
                $('#twitterReportsDiv').empty();
                $('#twt_stats_chart').empty();
                $("#twt_stats_chart").append(' <div class="text-center">\n' +
                    '<div class="symbol symbol-150 noTwitterAccountsAddedDiv">\n' +
                    '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                    '</div>\n' +
                    '<h6>Currently, no Twitter account added to this team.</h6>\n' +
                    '</div>');

            } else {
                setTimeout(function () {
                    getTwitterReports(teamid, twitterid, 3, 0, 0);
                }, 2000);
            }
            setTimeout(function () {
                getScheduleReports(teamid, 3, 0, 0,socialProfileCount);
            }, 1000);

            $('#members_name').tooltip();
        });


        function isValidURL(str) {
            var regex = /(http|https):\/\/(\w+:{0,1}\w*)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%!\-\/]))?/;
            if (!regex.test(str)) {
                return false;
            } else {
                return true;
            }
        }

    </script>

@endsection
<!--end::Head-->