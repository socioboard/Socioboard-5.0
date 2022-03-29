@extends('home::layouts.UserLayout')
@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Youtube Reports</title>
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
                        var youtubeValue = false;
                    </script>
                    <?php $youtubeValue = false ?>
                    <div class="form-group" id="youtubeReportsDiv">
                        <script>
                            var teamid = <?php echo session()->get('team')['teamid']?>
                        </script>
                        @if(count($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount)>0)
                            @foreach($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount as $data)
                                @if($data->account_type === 9)
                                    <script>
                                        var youtubeID = <?php echo $data->account_id ?>;
                                    </script>
                                    <script>
                                        var youtubeValue = true;
                                    </script>
                                    <?php $youtubeValue = true ?>
                                    <?php $youtubeID = $data->account_id?>
                                    @break
                                @endif
                            @endforeach
                        @if($youtubeValue === true)
                                    <select class="form-control form-control-solid form-control-lg h-auto py-4 rounded-lg font-size-h6 youtubeAccountsData"
                                            onchange="changeYoutubeData(this)">
                                        <option disabled id="selectDropdown2">Select Account</option>
                                        @foreach($teamsSocialAccounts->data->teamSocialAccountDetails[0]->SocialAccount as $data)
                                            @if($data->account_type === 9)
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
                            <div class="text-center noYoutubeDiv">
                                <div class="symbol symbol-150">
                                    <img src="/media/svg/illustrations/no-accounts.svg"/>
                                </div>
                                <h6>Currently, no Youtube account added to this team.</h6>
                            </div>
                        @endif
                    </div>
                    <!-- end:Team list -->
                    <div class="ml-auto">
                        <!-- datepicker -->
                        <div class="form-group">
                            <div class="input-icon team_Date_Range" id='twt-daterange' style="width: 300px">
                                <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6" id="twt-daterange_id"
                                       type="text" name="datepicker" autocomplete="off"
                                       placeholder="Select Date Range"/>
                                <span><i class="far fa-calendar-alt"></i></span>
                            </div>
                        </div>
                    </div>
                </div>
                <!--begin::Row-->
                <div class="row">
                    <div class="col-xl-8 youtubeChartsDiv" id="ss-youtube">
                        <div class="card card-custom gutter-b card-stretch">
                            <div class="card-header border-0 py-5 ml-auto">
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-youtube_md8" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-youtube_md8" style="
    display: none;"></span>
                            </div>
                            <div class="card-body d-flex flex-column pt-0">
                                <h3 class="card-title font-weight-bolder">Overview Stats</h3>
                                <!--begin::Chart-->
                                <div class="flex-grow-1">
                                    <div id="like_count_chart" class="card-rounded-bottom " style="height: 200px"></div>
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
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="likeCount"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Like</div>
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
                                                                            <i class="fas fa-comments fa-2x text-success"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder"
                                                         id="commentsCount"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Comments</div>
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
                                                                            <i class="fas fa-chart-pie fa-2x text-warning "></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="sharesCount"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Shares</div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex align-items-center mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-danger mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-danger">
                                                                            <i class="fas fa-thumbs-down fa-2x text-danger "></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder"
                                                         id="dislikeCount"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Dislike</div>
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
                    <div class="col-xl-4 youtubeOverViewStats" id="ss-youtubePublish">
                        <!--begin::Mixed Widget 16-->
                        <div class="card card-custom card-stretch gutter-b">
                            <!--begin::Header-->
                            <div class="card-header border-0 pt-5 ml-auto">
                                <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-youtubePublish_md4" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-youtubePublish_md4" style="
    display: none;"></span>
                            </div>
                            <div class="card-body d-flex flex-column pt-0">
                                <h3 class="card-title font-weight-bolder">Engagement Stats</h3>
{{--                                <div class="card-title">--}}
{{--                                    <div class="card-label">--}}
{{--                                        <div class="font-weight-bolder">Engagement Stats</div>--}}
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
                                            <div class="d-flex mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-danger mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                    <span class="svg-icon svg-icon-lg svg-icon-danger">
                                                        <i class="fas fa-user-minus text-danger fa-2x"></i>
                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="subsLost"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">
                                                        Subscribers Lost
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->
                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-warning mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                    <span class="svg-icon svg-icon-lg svg-icon-warning">
                                                        <i class="fas fa-clock fa-2x text-warning"></i>
                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="avgView"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">Average
                                                        View
                                                        Duration
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
                                            <div class="d-flex mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-success mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                    <span class="svg-icon svg-icon-lg svg-icon-success">
                                                        <i class="fas fa-user-plus fa-2x text-success"></i>
                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="subsGained"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">
                                                        Subscribers Gained
                                                    </div>
                                                </div>
                                                <!--end::Title-->
                                            </div>
                                        </div>
                                        <!--end::Item-->

                                        <!--begin::Item-->
                                        <div class="col">
                                            <div class="d-flex mr-2">
                                                <!--begin::Symbol-->
                                                <div class="symbol symbol-45 symbol-light-primary mr-4 flex-shrink-0">
                                                    <div class="symbol-label">
                                                                    <span class="svg-icon svg-icon-lg svg-icon-primary">
                                                                        <i class="far fa-eye fa-2x text-primary"></i>
                                                                    </span>
                                                    </div>
                                                </div>
                                                <!--end::Symbol-->

                                                <!--begin::Title-->
                                                <div>
                                                    <div class="font-size-h4 font-weight-bolder" id="viewsGained"></div>
                                                    <div class="font-size-sm font-weight-bold mt-1">
                                                        Views
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
        // team date ranges
        var start = moment().subtract(6, 'days');
        var end = moment();
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
            changeTeamResponseCalendar(start, end);//get data from onchange calendar.
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

        $(document).ready(function () {
            if (youtubeValue === false) {
                $("#selectDropdown2").remove();
            } else {
                setTimeout(function () {
                    getYouTubeReports(teamid, youtubeID, 3, 0, 0);
                }, 2000);
            }
        });

        /**
         * TODO We have get the reports of the youtube account added based on the date ranges values.
         * when we changes the date ranges values from calendar filter.
         */

        function changeTeamResponseCalendar(a, b) {
            let startDate = formatDate(a);
            let endDate = formatDate(b);
            setTimeout(function () {
                getYouTubeReports(teamid, youtubeID, 7, startDate, endDate);
            }, 4000);
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

        var loader = '<div class="d-flex justify-content-center" >\n' +
            '        <div class="spinner-border" role="status" style="display: none;">\n' +
            '            <span class="sr-only">Loading...</span>\n' +
            '        </div>\n' +
            '\n' +
            '        </div>';


        /**
         * TODO We have get the reports of the youtube account added.
         * This function is used getting reports of the youtube accounts added based on dates filter.
         * @param {integer} teamid- current teamid of the particular User.
         * @param {string} accid- link of image or video in the twitter post.
         * @param {string} filterPeriod- time value of range.
         * @param {string} startDate- Start date of the filter range.
         * @param {sourceUrl} endDate  end  date of the filter range.
         * ! Do not change this function without referring API format of getting the youtube reports.
         */

        function getYouTubeReports(teamid, accid, filterPeriod, startDate, endDate) {
            $.ajax({
                type: 'post',
                url: '/get-youtube-reports',
                data: {
                    teamid, accid, filterPeriod, startDate, endDate
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                dataType: 'json',
                beforeSend: function () {
                    $('#like_count_chart,#stats-chart').empty();
                    $('#like_count_chart, #stats-chart').append(loader);
                    $(".spinner-border").css("display", "block");
                },
                success: function (response) {
                    $(".spinner-border").css("display", "none");
                    if (response.code === 200) {
                        $('#sharesCount, #commentsCount, #likeCount, #dislikeCount,#subsLost,#avgView,#subsGained,#viewsGained').empty();
                        let dateData = [];
                        let likesCount = [];
                        let commentsCount = [];
                        let sharesCount = [];
                        let dislikeCount = [];
                        $('#likeCount').append(response.data.total.totalLikes);
                        $('#commentsCount').append(response.data.total.totalComments);
                        $('#sharesCount').append(response.data.total.totalShares);
                        $('#dislikeCount').append(response.data.total.totalDislikes);
                        response.data.daywises.map(element => {
                            dateData.push(element.day);
                            likesCount.push(element.likes);
                            commentsCount.push(element.comments);
                            sharesCount.push(element.shares);
                            dislikeCount.push(element.dislikes);
                        });

                        dateData.sort(function (a, b) {
                            return new Date(a) - new Date(b)
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
                            series: [{
                                name: "Like",
                                data: likesCount
                            },
                                {
                                    name: "Comments",
                                    data: commentsCount
                                },
                                {
                                    name: "Shares",
                                    data: sharesCount
                                },
                                {
                                    name: "Dislike",
                                    data: dislikeCount
                                }
                            ],
                            title: {
                                text: 'YouTube Stats',
                                align: 'left',
                                offsetY: 25,
                                offsetX: 20
                            },
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

                        var chartLine = new ApexCharts(document.querySelector('#like_count_chart'), optionsLine);
                        chartLine.render();
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
                            series: [response.data.total.totalViews, response.data.total.totalSubscribersGained, response.data.total.totalAverageViewDuration, response.data.total.totalSubscribersLost],
                            labels: ["Views", "Subscribers Gained", "Average View Duration", "Subscribers Lost"]
                        };

                        $('#subsLost').append(response.data.total.totalSubscribersLost);
                        $('#avgView').append(response.data.total.totalAverageViewDuration);
                        $('#subsGained').append(response.data.total.totalSubscribersGained);
                        $('#viewsGained').append(response.data.total.totalViews);
                        var chart = new ApexCharts(document.querySelector("#stats-chart"), options);
                        chart.render();
                    } else if (response.code === 400) {
                        $('#like_count_chart, #stats-chart').append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' + response.error + '</h6>\n' +
                            '</div>');
                    } else {
                        $('#like_count_chart, #stats-chart').append(' <div class="text-center">\n' +
                            '<div class="symbol symbol-150">\n' +
                            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
                            '</div>\n' +
                            '<h6>' + "Some error occured , can not get Data" + '</h6>\n' +
                            '</div>');
                    }
                }
            });
        }

        /**
         * TODO We have get the reports of the youtube account when we change the accounts from select dropdown .
         * when change the account id of the youtube accounts.
         */
        function changeYoutubeData(data) {
            let accid = data.value;
            youtubeID = data.value;
            getYouTubeReports(teamid, accid, 3, 0, 0);
        }


        let noYoutube = ' <div class="text-center noYoutubeDiv">\n' +
            '<div class="symbol symbol-150">\n' +
            '<img src="/media/svg/illustrations/no-accounts.svg"/>\n' +
            '</div>\n' +
            '<h6>Currently, no Youtube account added to this team.</h6>\n' +
            '</div>';

        $(document).ready(function () {
            $("#reportsButton").trigger("click");
            if (youtubeValue === false) {
                $("#selectDropdown2").remove();
                $('#youtubeReportsDiv').empty();
                $('#like_count_chart').empty();
                $('#stats-chart').empty();
                $('#sharesCount').append(0);
                $('#commentsCount').append(0);
                $('#likeCount').append(0);
                $('#dislikeCount').append(0);
                $('#subsLost').append(0);
                $('#avgView').append(0);
                $('#subsGained').append(0);
                $('#viewsGained').append(0);
                $('#like_count_chart').append(noYoutube);
                $('#stats-chart').append(noYoutube);
            }
        });

    </script>
@endsection

