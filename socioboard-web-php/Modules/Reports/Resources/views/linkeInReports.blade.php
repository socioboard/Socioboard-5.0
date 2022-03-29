@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | LinkedIn Reports</title>
@endsection
@section('content')
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class=" container-fluid ">
                <!--begin::Report-->
                <div class="d-flex">
                    <!-- begin:Team list -->
                    <!-- begin:Team list -->
                    <script>
                        var linkedINValue = false;
                    </script>
                    <?php $linkedINValue = false ?>
                    <div class="form-group" id="linkedInReportsDiv">
                        <script>
                            var teamid = <?php echo session()->get('team')['teamid']?>
                        </script>
                        @if(count($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount)>0)
                            @foreach($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount as $data)
                                @if($data->account_type === 7)
                                    <script>
                                        var linkedInID = <?php echo $data->account_id ?>;
                                    </script>
                                    <script>
                                        var linkedINValue = true;
                                    </script>
                                    <?php $linkedINValue = true ?>
                                    <?php $linkedInID = $data->account_id?>
                                    @break
                                @endif
                            @endforeach
                                @if($linkedINValue === true)
                                    <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 linkedInAccountsData"
                                            onchange="changeLinkedInData(this)">
                                        <option disabled id="selectDropdown2">Select Account</option>
                                        @foreach($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount as $data)
                                            @if($data->account_type === 7)
                                                <option
                                                        value="{{$data->account_id }}">{{$data->first_name }}</option>
                                                <script>
                                                    var twtvalue = true;
                                                </script>
                                            @endif
                                        @endforeach
                                    </select>
                                    @endif

                        @endif
                    </div>
                    <!-- end:Team list -->
                    <div class="ml-auto">
                        <!-- datepicker -->
                        <div class="form-group team_Date_Range">
                            <div class="input-icon" id='twt-daterange' style="width: 300px">
                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                       type="text" name="datepicker" autocomplete="off" id="twt-daterange_id"
                                       placeholder="Select date range"/>
                                <span><i class="far fa-calendar-alt"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-6 linkedInFollowerDiv" id="ss-linkedIn2">
                        <!--begin::Mixed Widget 2-->
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5 ml-auto">
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-linkedIn2_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-linkedIn2_md6" style="
    display: none;"></span>
                            </div>


                            <!--end::Header-->


                            <!--begin::Body-->
                            <div class="card-body d-flex flex-column pt-0">
                                <h3 class="card-title font-weight-bolder">LinkedIn Page Followers Stats</h3>
                                <!--begin::Chart-->
                                <div class="flex-grow-1">
                                    <div id="followers-stats" class="card-rounded-bottom " style="height: 200px"></div>
                                </div>
                                <!--end::Chart-->
                                <div>
                                    <p class="font-size-lg font-weight-normal pt-5 mb-2">Follower data will provide statistics from 12 months before the request date (UTC) till 2 days before the request date  (UTC), or later.</p>
                                </div>

                                <!--begin::Stats-->
                                <div class="mt-10 mb-5">
                                    <!--begin::Row-->
                                    <div class="row row-paddingless mb-10">
                                        <!--begin::Item-->
                                        <div class="col">

                                            <div class="d-flex align-items-center mr-2 paid_Followers_Div">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-primary mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                    <span class="svg-icon svg-icon-lg svg-icon-primary">
                                                        <i class="fas fa-user-plus fa-2x text-primary"></i>
                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div >
                                                    <div class="font-size-h4 font-weight-bolder "
                                                         id="paidFollower"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Paid Followers</div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2 total-followers_Div">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-success mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-success">
                                                                        <i class="fas fa-chart-line fa-2x text-success"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div >
                                                    <div class="font-size-h4 font-weight-bolder total-followers_Div"
                                                         id="totalFollower"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Total Followers
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2 organic_Followrs_Div">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-warning mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-warning">
                                                                        <i class="fas fa-user-friends fa-2x text-warning"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div >
                                                    <div class="font-size-h4 font-weight-bolder "
                                                         id="organicFollower"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Organic Followers
                                                    </div>
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
                    <div class="col-xl-6 linkedInPageStatsDiv" id="ss-linkedIn">
                        <!--begin::Mixed Widget 2-->
                        <div class="card card-custom gutter-b card-stretch">
                            <!--begin::Header-->
                            <div class="card-header border-0 py-5 ml-auto">
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-linkedIn_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-linkedIn_md6" style="
    display: none;"></span>
                            </div>


                            <!--end::Header-->


                            <!--begin::Body-->
                            <div class="card-body d-flex flex-column pt-0 linkedInPageStatsDiv">
                                <h3 class="card-title font-weight-bolder">LinkedIn Page Stats</h3>
                                <!--begin::Chart-->
                                <div class="flex-grow-1">
                                    <div id="post-report-stats" class="card-rounded-bottom "
                                         style="height: 200px"></div>
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
                                                                        <i class="fas fa-thumbs-up fa-2x text-primary"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div class="likesDIv">
                                                    <div class="font-size-h4 font-weight-bolder" id="likes"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Likes</div>
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
                                                                        <i class="fas fa-user-tie fa-2x text-success"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div class="uniqueImpressionsDiv">
                                                    <div class="font-size-h4 font-weight-bolder"
                                                         id="uniqueImpressions"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Unique Impressions
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-warning mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-warning">
                                                                        <i class="fas fa-chart-pie fa-2x text-warning"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div class="sharesDiv">
                                                    <div class="font-size-h4 font-weight-bolder" id="shares"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Shares</div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>


                                    </div>
                                    <div class="row row-paddingless mb-10">

                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-danger mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                    <span class="svg-icon svg-icon-lg svg-icon-danger">
                                                        <i class="fas fa-comments text-danger fa-2x"></i>
                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div class="commentsDiv">
                                                    <div class="font-size-h4 font-weight-bolder" id="comments"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Comments</div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-info mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-info">
                                                                        <i class="fas fa-user-tag fa-2x text-info "></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div class="impressionsDiv">
                                                    <div class="font-size-h4 font-weight-bolder" id="impressions"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Impressions</div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-primary mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-primary">
                                                                        <i class="far fa-hand-point-up fa-2x text-primary"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div class="clicksDivs">
                                                    <div class="font-size-h4 font-weight-bolder" id="clicks"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Clicks</div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                    </div>
                                    <!--end::Row-->
                                </div>
                                <!--end::Stats-->
                            </div>
                            <!--end::Body-->
                        </div>
                        <!--end::Mixed Widget 2-->
                    </div>
                </div>
                <!--end::Row-->
                <!--end::Report-->
            </div>
            <!--end::Container-->
        </div>
        <!--end::Entry-->
    </div>
@endsection
@section('scripts')
    <script src="https://unpkg.com/intro.js/minified/intro.min.js"></script>
    <script>
        // team date ranges
        let start = moment().subtract(6, 'days');
        let end = moment();
        let DefaultRange = `${moment().subtract(6, 'days').format('MMM DD, YYYY')} -> ${moment().format('MMM DD, YYYY')}`;
        $('#twt-daterange').daterangepicker({
            buttonClasses: ' btn',
            applyClass: 'btn-primary',
            cancelClass: 'btn-secondary',
            startDate: start,
            endDate: end,
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }, function (start, end, label) {
            changeTeamResponseCalendar(start, end);
            $('#twt-daterange .form-control').val(start.format('MMM DD, YYYY') + ' -> ' + end.format('MMM DD, YYYY'));
        });

        $('#twt-daterange_id').attr('value', DefaultRange);
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


    </script>

    <script>


        function getFollowerStatsGraph(date, organicFollowers, paidFollowers, totalFollowers) {
            // Stats
            let optionsLine = {
                chart: {
                    height: 328,
                    type: 'line',
                    // zoom: {
                    // enabled: false
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
                    name: "Paid Followers",
                    data: paidFollowers
                },
                    {
                        name: "Total Followers",
                        data: totalFollowers
                    },
                    {
                        name: "Organic Followers",
                        data: organicFollowers
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
                    }
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    offsetY: -20
                }
            }

            let chartLine = new ApexCharts(document.querySelector('#followers-stats'), optionsLine);
            chartLine.render();
        }

        // Stats


        let loader = '<div class="d-flex justify-content-center" >\n' +
            '<div class="spinner-border" role="status" style="display: none;">\n' +
            '<span class="sr-only">Loading...</span>\n' +
            '</div>\n' +
            '</div>';

        function getLinkedInReports(teamid, accid, filterPeriod, startDate, endDate) {
            $.ajax({
                type: 'post',
                url: '/get-linked-reports-follower-stats',
                data: {
                    teamid, accid, filterPeriod, startDate, endDate
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#followers-stats').empty();
                    $('#followers-stats').append(loader);
                    $(".spinner-border").css("display", "block");
                },
                success: function (response) {
                    let organicFollowers = 0;
                    let paidFollowers = 0;
                    let totalFollowers = 0;
                    let dateData = [];
                    let organicFollower = [];
                    let paidFollower = [];
                    let totalFollower = [];
                    $(".spinner-border").css("display", "none");
                    if (response.code === 200) {
                        $('#totalFollower, #paidFollower, #organicFollower').empty();
                        if (response.data.length !== 0) {
                            response.data.map(element => {
                                dateData.push(element.date);
                                organicFollower.push(element.organicFollowerGain);
                                paidFollower.push(element.paidFollowerGain);
                                totalFollower.push(element.totalFollower);
                                organicFollowers += element.organicFollowerGain;
                                paidFollowers += element.paidFollowerGain;
                                totalFollowers += element.totalFollower;
                            });
                            $('#totalFollower').append(totalFollowers);
                            $('#organicFollower').append(organicFollowers);
                            $('#paidFollower').append(paidFollowers);
                            dateData.sort(function (a, b) {
                                return new Date(a) - new Date(b)
                            });
                            getFollowerStatsGraph(dateData, organicFollower, paidFollower, totalFollower);
                        } else {
                            $('#followers-stats').append(' <div class="text-center">\n' +
                                '<div class="symbol symbol-150">\n' +
                                '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                '</div>\n' +
                                '<h6>' + "No follower Stats Data present" + '</h6>\n' +
                                '</div>');
                        }

                    } else if (response.code === 400) {
                        $('#followers-stats').append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' + response.error + '</h6>\n' +
                            '</div>');
                    } else {
                        $('#followers-stats').append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' + "Some error occured , can not get Data" + '</h6>\n' +
                            '</div>');
                    }
                }
            });
        }

        function getPageStatsStatsGraph(dateData, uniqueImpressions, impressions, shares, clicks, comments, likes) {
            let optionsLine = {
                chart: {
                    height: 328,
                    type: 'line',
                    // zoom: {
                    // enabled: false
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
                    name: "Likes",
                    data: likes
                },
                    {
                        name: "Unique Impressions",
                        data: uniqueImpressions
                    },
                    {
                        name: "Shares",
                        data: shares
                    },
                    {
                        name: "Comments",
                        data: comments
                    },
                    {
                        name: "Impressions",
                        data: impressions
                    },
                    {
                        name: "Clicks",
                        data: clicks
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
                labels: dateData,
                xaxis: {
                    tooltip: {
                        enabled: false
                    }
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'right',
                    offsetY: -20
                }
            }

            let chartLine = new ApexCharts(document.querySelector('#post-report-stats'), optionsLine);
            chartLine.render();
        }

        function getLinkedInReportsPageStats(teamid, accid, filterPeriod, startDate, endDate) {
            $.ajax({
                type: 'post',
                url: '/get-linked-pages-stats',
                data: {
                    teamid, accid, filterPeriod, startDate, endDate
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#post-report-stats').empty();
                    $('#post-report-stats').append(loader);
                    $(".spinner-border").css("display", "block");
                },
                success: function (response) {
                    let uniqueImpressionsCount = 0;
                    let shareCount = 0;
                    let impressionCount = 0;
                    let clickCount = 0;
                    let commentCount = 0;
                    let likeCount = 0;
                    let uniqueImpressions = [];
                    let shares = [];
                    let impressions = [];
                    let clicks = [];
                    let comments = [];
                    let likes = [];
                    let dateData = [];
                    $(".spinner-border").css("display", "none");
                    if (response.code === 200) {
                        $('#uniqueImpressions, #clicks, #shares,#likes,#impressions,#comments').empty();
                        if (response.data.length !== 0) {
                            response.data.map(element => {
                                dateData.push(element.date);
                                uniqueImpressions.push(element.uniqueImpressionsCount);
                                impressions.push(element.impressionCount);
                                shares.push(element.shareCount);
                                clicks.push(element.clickCount);
                                comments.push(element.commentCount);
                                likes.push(element.likeCount);
                                uniqueImpressionsCount += element.uniqueImpressionsCount;
                                shareCount += element.shareCount;
                                impressionCount += element.impressionCount;
                                clickCount += element.clickCount;
                                commentCount += element.commentCount;
                                likeCount += element.likeCount;
                            });
                            $('#uniqueImpressions').append(uniqueImpressionsCount);
                            $('#clicks').append(clickCount);
                            $('#shares').append(shareCount);
                            $('#likes').append(likeCount);
                            $('#impressions').append(impressionCount);
                            $('#comments').append(commentCount);
                            dateData.sort(function (a, b) {
                                return new Date(a) - new Date(b)
                            });
                            getPageStatsStatsGraph(dateData, uniqueImpressions, impressions, shares, clicks, comments, likes);
                        } else {
                            $('#post-report-stats').append(' <div class="text-center">\n' +
                                '<div class="symbol symbol-150">\n' +
                                '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                                '</div>\n' +
                                '<h6>' + "No LinkedIn Page Stats  Data present" + '</h6>\n' +
                                '</div>');
                        }

                    } else if (response.code === 400) {
                        $('#post-report-stats').append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' + response.error + '</h6>\n' +
                            '</div>');
                    } else {
                        $('#post-report-stats').append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' + "Some error occured , can not get Data" + '</h6>\n' +
                            '</div>');
                    }
                }
            });
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

        function changeLinkedInData(data)
        {
            let accid = data.value;
            linkedInID = data.value;
            setTimeout(function () {
                getLinkedInReports(teamid, accid, 3, 0, 0);
            }, 2000);
            setTimeout(function () {
                getLinkedInReportsPageStats(teamid, accid, 3, 0, 0);
            }, 3000);
        }

        let nolinkedIN = ' <div class="text-center noLinkedInDivAdded">\n' +
            '<div class="symbol symbol-150">\n' +
            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
            '</div>\n' +
            '<h6>Currently, no LinkedIn pages account added to this team.</h6>\n' +
            '</div>';

        /**
         * TODO We have get the reports of the youtube account added based on the date ranges values.
         * when we changes the date ranges values from calendar filter.
         */

        function changeTeamResponseCalendar(a, b) {
            let startDate = formatDate(a);
            let endDate = formatDate(b);
            setTimeout(function () {
                getLinkedInReports(teamid, linkedInID, 7, startDate, endDate);
            }, 2000);
            setTimeout(function () {
                getLinkedInReportsPageStats(teamid, linkedInID, 7, startDate, endDate);
            }, 3000);
        }


        $(document).ready(function () {
            $('#reportsButton').click();
            if (linkedINValue === false) {
                    $("#selectDropdown2").remove();
                   $('#linkedInReportsDiv').empty();
                    $('#post-report-stats').empty();
                    $('#followers-stats').empty();
                    $('#post-report-stats').append(nolinkedIN);
                    $('#followers-stats').append(nolinkedIN);
            } else {
                setTimeout(function () {
                    getLinkedInReports(teamid, linkedInID, 3, 0, 0);
                }, 2000);
                setTimeout(function () {
                    getLinkedInReportsPageStats(teamid, linkedInID, 3, 0, 0);
                }, 3000);
            }
        });

    </script>
@endsection

