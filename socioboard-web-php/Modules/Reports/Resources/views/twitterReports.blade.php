@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Twitter Reports</title>
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
                    <script>
                        var twtvalue = false;
                    </script>
                    <?php $twtvalue = false ?>
                    <div class="form-group" id="twitterReportsDiv">
                        <script>
                            var teamid = <?php echo session()->get('team')['teamid']?>
                        </script>
                        @if(count($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount)>0)
                            @foreach($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount as $data)
                                @if($data->account_type === 4)
                                    <script>
                                        var twitterid = <?php echo $data->account_id ?>;
                                        var twtvalue = true;
                                        <?php $twtvalue = true ?>
                                    </script>
                                    <?php $twitterid = $data->account_id?>
                                    @break
                                @endif
                            @endforeach
                        @if($twtvalue ===  true)
                                    <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 twitterAccountsData"
                                            onchange="changeTwitterData(this)">
                                        <option disabled id="selectDropdown2">Select Account</option>
                                        @foreach($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount as $data)
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
                        @else
                            <div class="text-center noTwitterAccountsDiv">
                                <div class="symbol symbol-150">
                                    <img src="/media/svg/illustrations/no-accounts.svg"/>
                                </div>
                                <h6>Currently, no Twitter account added to this team.</h6>
                            </div>
                        @endif
                    </div>
                    <!-- end:Team list -->
                    <div class="ml-auto">
                        <!-- datepicker -->
                        <div class="form-group">
                            <div class="input-icon team_Date_Range" id='twt-daterange' style="width: 300px">
                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                       type="text" name="datepicker" autocomplete="off" id="twt-daterange_id"
                                       placeholder="Select Date Range"/>
                                <span><i class="far fa-calendar-alt"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-8 twitterChartsDiv" id="ss-twitter">
                        <div class="card card-custom gutter-b card-stretch">
                            <div class="card-header border-0 py-5 ml-auto">
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-twitter_md8" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-twitter_md8" style="
    display: none;"></span>
                            </div>
                            <div class="card-body d-flex flex-column pt-0">
                                <h3 class="card-title font-weight-bolder">Twitter Follow Stats</h3>
                                <!--begin::Chart-->
                                <div class="flex-grow-1">
                                    <div id="follow_count_chart" class="card-rounded-bottom "
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
                                                                            <i class="fas fa-users fa-2x text-primary"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder"> Followers</div>
                                                    <div class="font-size-sm font-weight-bold mt-1"
                                                         id="follower_count">
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
                                                <div class="symbol symbol-45 symbol-light-success mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                        <span class="svg-icon svg-icon-lg svg-icon-success">
                                <i class="fas fa-user-friends fa-2x text-success "></i>
                        </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder">Following</div>
                                                    <div class="font-size-sm font-weight-bold mt-1"
                                                         id="following_count">
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
                    <div class="col-xl-4 twitterOverViewStats" id="ss-twitterPublish">
                        <!--begin::Mixed Widget 16-->
                        <div class="card card-custom card-stretch gutter-b">
                            <!--begin::Header-->
                            <div class="card-header border-0 pt-5 ml-auto">

                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-twitterPublish_md4" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-twitterPublish_md4" style="
    display: none;"></span>
                            </div>
                            <!--end::Header-->

                            <!--begin::Body-->
                            <div class="card-body d-flex flex-column pt-0">
                                <h3 class="card-title font-weight-bolder">Stats</h3>
{{--                                <div class="card-title">--}}
{{--                                    <div class="card-label">--}}
{{--                                        <div class="font-weight-bolder">Stats</div>--}}
{{--                                    </div>--}}
{{--                                </div>--}}
                                <!--begin::Chart-->
                                <div class="flex-grow-1">
                                    <div id="stats-chart" style="height: 200px"></div>
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
                                <i class="far fa-heart text-danger fa-2x"></i>
                            </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="favCount"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Favourites</div>
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
                            <i class="fas fa-user-tag fa-2x text-warning"></i>
                        </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder"
                                                         id="mentionsCount"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">User Mentions</div>
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
                            <i class="far fa-id-card fa-2x text-success"></i>
                        </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="postCount"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Post</div>
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
                            <i class="fas fa-retweet fa-2x text-primary"></i>
                        </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="reTweet"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Retweet</div>
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

        $(document).ready(function () {
            setTimeout(function () {
                getTwitterReports(teamid, twitterid, 3, 0, 0);
            }, 1000);
            setTimeout(function () {
                getCommulativeTwitterReports(teamid, twitterid, 3, 0, 0);
            }, 2000);
        });
        // team date ranges
        var start = moment().subtract(6, 'days');
        var end = moment();
        $("li[data-range-key='Last 30 Days']").removeAttr('class');
        $("li[data-range-key='Last 7 Days']").attr("class", "active");
        let DefaultRange = `${moment().subtract(6, 'days').format('MMM DD, YYYY')} -> ${moment().format('MMM DD, YYYY')}`;
        $('#twt-daterange').daterangepicker({
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
        }, function (start, end, label) {
            changeTeamResponseCalendar(start, end);
            $('#twt-daterange .form-control').val(start.format('MMM DD, YYYY') + ' -> ' + end.format('MMM DD, YYYY'));
        });

        $('#twt-daterange_id').attr('value', DefaultRange);
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
    <script>


        function getTwitterReports(teamid, accid, filterPeriod, startDate, endDate) {
            $.ajax({
                type: 'post',
                url: '/get-twitter-reports',
                data: {
                    teamid, accid, filterPeriod, startDate, endDate
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#follow_count_chart,#following_count,#follower_count').empty();
                    $('#follow_count_chart').append('<div class="d-flex justify-content-center" >\n' +
                        '<div class="spinner-border" role="status" style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div>\n' +
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
                        $('#following_count').append(response.data.stats[0].totalFollowingCount);
                        $('#follower_count').append(response.data.stats[0].totalFollowerCount);
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
                            //colors: ["#3F51B5", '#2196F3'],
                            series: [{
                                name: "Followers",
                                data: followersCount
                            },
                                {
                                    name: "Following",
                                    data: followingCount
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

                        var chartLine = new ApexCharts(document.querySelector('#follow_count_chart'), optionsLine);
                        chartLine.render();
                    }
                    else if(response.code === 400){
                        $('#follow_count_chart').append('<div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' +"Can not get Reports data as : "+ response.error + '</h6>\n' +
                            '</div>');
                    }
                }
            });
        }

        function getCommulativeTwitterReports(teamid, accid, filterPeriod, startDate, endDate) {
            $.ajax({
                type: 'post',
                url: '/get-twitter-commulative-reports',
                data: {
                    teamid, accid, filterPeriod, startDate, endDate
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#stats-chart').empty();
                    $('#favCount, #mentionsCount, #postCount,#reTweet').empty();
                    $('#stats-chart').append('<div class="d-flex justify-content-center" >\n' +
                        '<div class="spinner-border" role="status" style="display: none;">\n' +
                        '<span class="sr-only">Loading...</span>\n' +
                        '</div>\n' +
                        '</div>');
                    $(".spinner-border").css("display", "block");
                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    if (response.code === 200) {
                        $('#favCount, #mentionsCount, #postCount,#reTweet').empty();
                        $('#favCount').append(response.data[0].totalFavouritesCount);
                        $('#mentionsCount').append(response.data[0].totalUserMentions);
                        $('#postCount').append(response.data[0].totalPostsCount);
                        $('#reTweet').append(response.data[0].totalRetweetCount);
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
                            series: [response.data[0].totalRetweetCount, response.data[0].totalPostsCount, response.data[0].totalUserMentions, response.data[0].totalFavouritesCount],
                            labels: ["Retweet", "Post", "User Mentions", "Favourites"]
                        };

                        var chart = new ApexCharts(document.querySelector("#stats-chart"), options);

                        chart.render();

                        var chartAreaBounds = chart.w.globals.dom.baseEl.querySelector('.apexcharts-inner').getBoundingClientRect();

                        chart.addText({
                            x: chartAreaBounds.width / 2,
                            y: 10,
                            text: "0",
                            fontSize: 16,
                            textAnchor: "middle"
                        });

                        chart.addText({
                            x: chartAreaBounds.width - 5,
                            y: chartAreaBounds.height / 2 + 10,
                            text: "90",
                            fontSize: 16,
                            textAnchor: "start"
                        });

                        chart.addText({
                            x: chartAreaBounds.width / 2,
                            y: chartAreaBounds.height + 30,
                            text: "180",
                            fontSize: 16,
                            textAnchor: "middle"
                        });

                        chart.addText({
                            x: 5,
                            y: chartAreaBounds.height / 2 + 10,
                            text: "270",
                            fontSize: 16,
                            textAnchor: "end"
                        });
                    }
                    else if(response.code === 400){
                        $('#stats-chart').append('<div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' +"Can not get Reports data as : "+ response.error + '</h6>\n' +
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

        function changeTeamResponseCalendar(a, b) {
            let startDate = formatDate(a);
            let endDate = formatDate(b);
            setTimeout(function () {
                getTwitterReports(teamid, twitterid, 7, startDate, endDate);
            }, 4000);
            setTimeout(function () {
                getCommulativeTwitterReports(teamid, twitterid, 7, startDate, endDate);
            }, 2000);
        }

        function changeTwitterData(data) {
            let accid = data.value;
            twitterid = data.value;
            setTimeout(function () {
                getTwitterReports(teamid, accid, 3, 7, 0, 0);
            }, 2000);
            setTimeout(function () {
                getCommulativeTwitterReports(teamid, accid, 3, 7, 0, 0);
            }, 2000);

        }

        let noTwitter = ' <div class="text-center noTwitterAccountsDiv">\n' +
            '<div class="symbol symbol-150">\n' +
            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
            '</div>\n' +
            '<h6>Currently, no Twitter account added to this team.</h6>\n' +
            '</div>';

        $(document).ready(function () {
            $("#reportsButton").trigger("click");
            if (twtvalue === false) {
                $("#selectDropdown2").remove();
                $('#twitterReportsDiv,#follow_count_chart,#stats-chart').empty();
                $('#favCount').append(0);
                $('#mentionsCount').append(0);
                $('#postCount').append(0);
                $('#reTweet').append(0);
                $('#follow_count_chart').append(noTwitter);
                $('#stats-chart').append(noTwitter);
            }
        });

    </script>
@endsection

