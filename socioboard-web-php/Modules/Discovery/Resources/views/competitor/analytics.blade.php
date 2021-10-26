@extends('home::layouts.UserLayout')

@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Competitive analysis</title>
@endsection
@section('content')
    <style>
        .daterangepicker .drp-calendar td.in-range.available:not(.active):not(.off):not(.today) {
            background-color: #ff745a;
        }
    </style>
    <div class="content  d-flex flex-column flex-column-fluid" id="Sb_content">

        <!--begin::Entry-->
        <div class="d-flex flex-column-fluid">
            <!--begin::Container-->
            <div class="container-fluid ">
                <!--begin::Profile-->
                <!--begin::Row-->
                <div class="row competitor-container">
                    <div class="col leftside-competitor">


                    </div>
                    <div class="col leftside-competitor" id="competitorDiv">
                        {{--                            <div class="card card-custom gutter-b text-center p-3">--}}
                        {{--                                <div class="add-competitor-section">--}}
                        {{--                                    <h3>Competitors List</h3>--}}
                        {{--                                    Here you'll see all the Competitors list filtered by Category--}}
                        {{--                                </div>--}}
                        {{--                                <button type="submit" class="btn font-weight-bolder add-competitor" data-toggle="modal"--}}
                        {{--                                        data-target="#addCompetitorModal">Add Competitor--}}
                        {{--                                </button>--}}
                        {{--                            </div>--}}

                        <div class="card card-custom gutter-b sticky">
                            <div class="competitive-list">
                                        <span class="nav-text">
                                            <i class="fab fa-facebook fa-2x"></i>
                                        </span>
                                <div class="competitive-list-block" id="facebookCompetitor">
                                    <div class="d-flex">
                                        <p>Competitor List</p>
                                    </div>
                                    <div class="d-flex" id="fbLoading">
                                        <p>Loading ...</p>
                                    </div>
                                </div>
                            </div>

                            {{--            I'm commenting these becuase we don't want to show it in the Adding pannel                --}}
                            {{--                                                        <hr>--}}
                            {{--                                                        <div class="competitive-list">--}}
                            {{--                                                                    <span class="nav-text">--}}
                            {{--                                                                        <i class="fab fa-twitter fa-2x"></i>--}}
                            {{--                                                                    </span>--}}
                            {{--                                                            <div class="competitive-list-block" id="twitterCompetitor">--}}
                            {{--                                                                <div class="d-flex">--}}
                            {{--                                                                    <p> Coming soon</p>--}}
                            {{--                                                                </div>--}}
                            {{--                                                            </div>--}}
                            {{--                                                        </div>--}}
                            {{--                            <hr>--}}
                            {{--                            <div class="competitive-list">--}}
                            {{--                                        <span class="nav-text">--}}
                            {{--                                            <i class="fab fa-youtube fa-2x"></i>--}}
                            {{--                                        </span>--}}
                            {{--                                <div class="competitive-list-block" id="youtubeCompetitor">--}}
                            {{--                                    <div class="d-flex">--}}
                            {{--                                        <p> Coming soon</p>--}}
                            {{--                                    </div>--}}
                            {{--                                </div>--}}
                            {{--                            </div>--}}
                            <hr>
                            <div class="competitive-list">
                                                                    <span class="nav-text">
                                                                        <i class="fab fa-instagram fa-2x"></i>
                                                                    </span>
                                <div class="competitive-list-block" id="instagramCompetitor">
                                    <div class="d-flex">
                                        <p> Competitor List</p>
                                    </div>
                                </div>
                            </div>
                            {{--                            <hr>--}}
                            {{--                            <div class="competitive-list">--}}
                            {{--                                        <span class="nav-text">--}}
                            {{--                                            <i class="fab fa-linkedin fa-2x"></i>--}}
                            {{--                                        </span>--}}
                            {{--                                <div class="competitive-list-block" id="linkedinCompetitor">--}}
                            {{--                                    <div class="d-flex">--}}
                            {{--                                        <p> Coming soon</p>--}}
                            {{--                                    </div>--}}
                            {{--                                </div>--}}

                            {{--                            </div>--}}
                            <button type="submit" class="btn font-weight-bolder add-competitor" data-toggle="modal"
                                    data-target="#addCompetitorModal">Add Competitor
                            </button>
                        </div>
                    </div>
                    <div class="col">
                        <div class="card p-5 mb-8">
                            <form class="d-flex align-items-center">
                                <div class="inline-flex flex-wrap pr-5">
                                    <div class="competitor-overview">
                                        <button type="button" class="btn active" id="facebookTitle" title="Available"
                                                onclick="activateMe('#facebookTitle')">
                                            <span><i class="fab fa-facebook"></i></span>
                                            <span>facebook</span>
                                        </button>
                                    </div>
                                </div>

                                {{--            I'm commenting the down section as these are not yet Ready and don't want to show to users                    --}}
                                {{--                                <div class="inline-flex flex-wrap px-5">--}}
                                {{--                                    <div class="competitor-overview">--}}
                                {{--                                        <button type="button" class="btn" id="twitterTitle" title="Coming Soon">--}}
                                {{--                                            <span><i class="fab fa-twitter"></i></span>--}}
                                {{--                                            <span>Twitter</span>--}}
                                {{--                                        </button>--}}
                                {{--                                    </div>--}}
                                {{--                                </div>--}}
                                {{--                                <div class="inline-flex flex-wrap px-5">--}}
                                {{--                                    <div class="competitor-overview">--}}
                                {{--                                        <button type="button" class="btn" id="youTubeTitle" title="Coming Soon">--}}
                                {{--                                            <span><i class="fab fa-youtube"></i></span>--}}
                                {{--                                            <span>Youtube</span>--}}
                                {{--                                        </button>--}}
                                {{--                                    </div>--}}
                                {{--                                </div>--}}
                                <div class="inline-flex flex-wrap px-5">
                                    <div class="competitor-overview">
                                        <button type="button" class="btn" id="instagramTitle" title="Available"
                                                onclick="activateMe('#instagramTitle')">
                                            <span><i class="fab fa-instagram"></i></span>
                                            <span>Instagram</span>
                                        </button>
                                    </div>
                                </div>
                            {{--                                <div class="inline-flex flex-wrap px-5">--}}
                            {{--                                    <div class="competitor-overview">--}}
                            {{--                                        <button type="button" class="btn" id="linkedInTitle" title="Coming Soon">--}}
                            {{--                                            <span><i class="fab fa-linkedin"></i></span>--}}
                            {{--                                            <span>LinkedIn</span>--}}
                            {{--                                        </button>--}}
                            {{--                                    </div>--}}
                            {{--                                </div>--}}
                            <!-- datepicker -->
                                <div class="ml-auto">
                                    <div class="input-icon" id='analytics-date-range' style='width: 270px;'>
                                        <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6"
                                               type="text" id="analytics-date-range-input"
                                               name="datepicker" autocomplete="off" placeholder="Select date range"/>
                                        <span><i class="far fa-calendar-alt"></i></span>
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div class="card mb-5 p-5 competitor-filter-block" id="vsDiv">
                            <div class="text-bold text-center mb-5">Here You'll see only limited competitors whose data
                                is available to Make Analysis
                            </div>
                            <div id="competitorSelectors">
                                <button type="button" class="rounded-pills mr-3 competitor-filter-btn"
                                        id="competitorVsLoader">
                                    <span><img src="../media/icons/user.png" alt="user-image"></span>
                                    <span>Loading .... </span>
                                </button>
                            </div>
                        </div>

                    </div>
                    <!--end::Row-->
                    <!--end::Profile-->
                </div>
                <!--end::Container-->
            </div>
            <!--end::Entry-->
        </div>
        <!--end::Content-->

    </div>

    <!-- begin::Add competitor modal-->
    <div class="modal fade" id="addCompetitorModal" tabindex="-1" role="dialog"
         aria-labelledby="addCompetitorModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="addCompetitorModalLabel">Add Competitor</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <!--begin::Form group-->
                    <div class="form-group">
                        <div style="float: right; margin-bottom: 10px"> For Reference: <a
                                    href="http://prntscr.com/1seyz0b" target="_blank" style="color: blue">View Image</a>
                        </div>
                    </div>
                    <div class="form-group">
                        <div class="input-icon">
                            <input class="form-control form-control-solid h-auto pl-7 py-7 rounded-lg font-size-h6"
                                   type="text" id="competitorId"
                                   name="" autocomplete="off" placeholder="Competitor Page Name"/>
                            <!-- <span><i class="fas fa-chalkboard-teacher"></i></span> -->
                        </div>
                    </div>
                    <!--end::Form group-->
                    <!--begin::Form group-->
                    <div class="form-group">
                        <select class="form-control form-control-solid form-control-lg h-auto py-7 rounded-lg font-size-h6"
                                id="networkTypes">
                            <option disabled>Social media platform list</option>
                            <option value="facebook" selected>Facebook</option>
                            <option value="instagram">Instagram</option>
                            <option value="Coming soon" disabled>Sorry! as of now we've only One, Rest are Coming
                                soon...
                            </option>
                        </select>
                    </div>
                    <!--end::Form group-->
                    <div class="d-flex justify-content-center">
                        <a onclick="addCompetitor()" type="button"
                           class="btn text-primary font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                           data-dismiss="modal">Add</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- end::add competitor modal-->

    <!-- begin:: Delete addCompetitorModal -->
    <div class="modal fade" id="deleteCompetitorModal" tabindex="-1" role="dialog"
         aria-labelledby="deleteCompetitorModalLabel"
         aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="deleteCompetitorModalLabel">Delete Competitor</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <i aria-hidden="true" class="ki ki-close"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="text-center">
                        <span class="font-weight-bolder font-size-h4 ">Are you sure wanna delete this Competitor??</span>
                    </div>
                    <div class="d-flex justify-content-center">
                        <a onclick="deleteSelected()" type="button"
                           class="btn text-danger font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                           data-dismiss="modal"
                        >Delete it!!</a>
                        <a href="javascript:" type="button"
                           class="btn font-weight-bolder font-size-h6 px-4 py-4 mr-3 my-3"
                           data-dismiss="modal">No thanks.</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {{--    If Competitor Data is there  Then this div  --}}

    <!-- end::Delete account modal-->
@endsection

@section('scripts')
    <script !src="">
        let RECENT_PLATFORM = '';
        let RECENT_ID = '';
        let userId = '<?php use Illuminate\Support\Facades\Session;echo Session::get('socialUser')['userDetails']['user_id'] ?>';
        let PROFILES = [];
        let TOTAL_COMPETITORS = {};
        let SELECTED_PLATFORM = 'facebook';
    </script>
    <script src="{{asset('js/contentStudio/publishContent.js')}}"></script>
    <script>
        $('.competitor-filter-btn').on('click', function () {
            $(this).toggleClass('active');
            checkIsAnalysisOrEmpty();
        });
    </script>
@endsection

@section('page-scripts')
    <script>$("#discovery").removeClass('active').trigger('click');</script>
    <!-- charts -->
    <script>
        $('#facebookTitle, #linkedInTitle, #instagramTitle, #youTubeTitle, #twitterTitle').tooltip();
        $(document).ready(function () {
            getPlatforms();
            checkIsAnalysisOrEmpty();
        });

        function deleteCompetitor(name, platform) {
            RECENT_ID = name, RECENT_PLATFORM = platform;
        }
    </script>

    {{--    For Graphs  --}}
    <script>
        function fanCountChart(fanCountData = []) {
            // Stats
            let seriesData = [];
            let values = [], dates = [];
            fanCountData.map(page => {
                values = [];
                page?.fans_count.map(fans_count => {
                    dates.push(fans_count[0]);
                    values.push(fans_count[1]);
                });
                seriesData.push({name: page?.page_user_name, data: values});
            });

            let optionsLine = {
                chart: {
                    height: 328,
                    type: 'line',
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
                series: seriesData,
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
                labels: dates,
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
            };
            const chartLine = new ApexCharts(document.querySelector('#fan_count_chart'), optionsLine);
            chartLine.render();
        }

        function fanGrowthChart(fanGrowthData = []) {
            let values = [], dates = [], seriesData = [];
            fanGrowthData.map(page => {
                values = [];
                page?.fans_growth.map(fans_growth => {
                    dates.push(fans_growth[0]);
                    values.push(fans_growth[1]);
                });
                seriesData.push({name: page?.page_user_name, data: values});
            });

            let options = {
                series: seriesData,
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
            let chart = new ApexCharts(document.querySelector("#fan_growth_chart"), options);
            chart.render();
        }

        function userEngagementChart(engagementData = []) {
            let seriesData = [], competitors = [];
            let likes = [], comments = [], shares = [];
            engagementData.map(page => {
                competitors.push(page?.page_user_name ?? 'Competitor');
                likes.push(page?.like ?? 0);
                comments.push(page?.comment ?? 0);
                shares.push(page?.share ?? 0);
            });

            seriesData.push({name: "Comments", data: comments},
                {name: "Likes", data: likes},
                {name: "Shares", data: shares}
            );
            let options = {
                series: seriesData,
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
                    categories: competitors,
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
            let chart = new ApexCharts(document.querySelector("#user_engagement_chart"), options);
            chart.render();
        }

        function postTypeEngagementChart(engagementData = []) {
            let seriesData = [], competitors = [];
            let albums = [], nativeTemplates = [], photos = [], shares = [], videos = [];
            engagementData.map(page => {
                competitors.push(page?.page_user_name ?? 'Competitor');
                albums.push(page?.album ?? 0);
                nativeTemplates.push(page?.native_templates ?? 0);
                photos.push(page?.photo ?? 0);
                shares.push(page?.share ?? 0);
                videos.push(page?.video ?? 0);
            });
            seriesData.push(
                {name: "Albums", data: albums},
                {name: "Native Templates", data: nativeTemplates},
                {name: "Photos", data: photos},
                {name: "Shares", data: shares},
                {name: "Videos", data: videos},
            );

            let options = {
                series: seriesData,
                chart: {
                    type: 'bar',
                    height: 350,
                    stacked: true,
                    toolbar: {
                        show: true
                    },
                    zoom: {
                        enabled: true
                    }
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 0
                        }
                    }
                }],
                plotOptions: {
                    bar: {
                        horizontal: false,
                        borderRadius: 10
                    },
                },
                xaxis: {
                    labels: {
                        rotate: -45,
                        style: {
                            fontSize: "11px",
                            cssClass: ".apexcharts-margin"
                        },
                    },
                    categories: competitors,
                    tickPlacement: 'on'
                },
                legend: {
                    position: 'right',
                    offsetY: 40
                },
                fill: {
                    opacity: 1
                }
            };

            let chart = new ApexCharts(document.querySelector("#post_type_engagement_chart"), options);
            chart.render()
        }

        function postEngagementChart(postEngagementData = []) {
            // Stats
            let seriesData = [];
            let values = [], dates = [];
            postEngagementData.map(page => {
                values = [];
                page?.total_engagement.map(engagement => {
                    dates.push(engagement[0]);
                    values.push(engagement[1]);
                });
                seriesData.push({name: page?.page_user_name, data: values});
            });

            let optionsLine = {
                chart: {
                    height: 328,
                    type: 'line',
                    dropShadow: {
                        enabled: true,
                        top: 3,
                        left: 2,
                        blur: 4,
                        opacity: 1,
                    },
                    toolbar: {
                        show: true
                    },
                    zoom: {
                        enabled: true
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
                series: seriesData,
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
                labels: dates,
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
            };
            const chartLine = new ApexCharts(document.querySelector('#post_engagement_chart'), optionsLine);
            chartLine.render();
        }

        function avgPostEngagementChart(avgEngagementData = []) {
            // Stats
            let seriesData = [];
            let values = [], dates = [];
            avgEngagementData.map(page => {
                values = [];
                page?.avg_post_eng.map(engagement => {
                    dates.push(engagement[0]);
                    values.push(engagement[1].toFixed(2));
                });
                seriesData.push({name: page?.page_user_name, data: values});
            });

            let options = {
                series: seriesData,
                chart: {
                    type: 'bar',
                    height: 350,
                    stacked: true,
                    toolbar: {
                        show: true
                    },
                    zoom: {
                        enabled: true
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                    },
                },
                stroke: {
                    width: 1,
                    colors: ['#fff']
                },
                xaxis: {
                    categories: [...new Set(dates)],
                },
                yaxis: {
                    title: {
                        text: undefined
                    },
                },
                fill: {
                    opacity: 1
                },
                legend: {
                    position: 'top',
                    horizontalAlign: 'left',
                    offsetX: 40
                }
            };

            let chart = new ApexCharts(document.querySelector("#avg_post_engagement_chart"), options);
            chart.render();
        }

        function postTypeDistributionChart(distributionData = []) {
            let seriesData = [], competitors = [];
            let albums = [], nativeTemplates = [], photos = [], shares = [], videos = [];
            distributionData.map(page => {
                competitors.push(page?.page_user_name ?? 'Competitor');
                albums.push(page?.album ?? 0);
                nativeTemplates.push(page?.native_templates ?? 0);
                photos.push(page?.photo ?? 0);
                shares.push(page?.share ?? 0);
                videos.push(page?.video ?? 0);
            });
            seriesData.push(
                {name: "Albums", data: albums},
                {name: "Native Templates", data: nativeTemplates},
                {name: "Photos", data: photos},
                {name: "Shares", data: shares},
                {name: "Videos", data: videos},
            );

            let options = {
                series: seriesData,
                chart: {
                    type: 'bar',
                    height: 350,
                    stacked: true,
                    toolbar: {
                        show: true
                    },
                    zoom: {
                        enabled: true
                    }
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        legend: {
                            position: 'bottom',
                            offsetX: -10,
                            offsetY: 0
                        }
                    }
                }],
                plotOptions: {
                    bar: {
                        horizontal: false,
                        borderRadius: 10
                    },
                },
                xaxis: {
                    labels: {
                        rotate: -45,
                        style: {
                            fontSize: "11px",
                            cssClass: ".apexcharts-margin"
                        },
                    },
                    categories: competitors,
                    tickPlacement: 'on'
                },
                legend: {
                    position: 'right',
                    offsetY: 40
                },
                fill: {
                    opacity: 1
                }
            };

            let chart = new ApexCharts(document.querySelector("#post_distribution_chart"), options);
            chart.render()
        }

        /**
         * It Takes array of strings
         * It returns array of string with capitalize
         * It capitalize normal words ex: 'suresh' -> 'Suresh'
         * it capitalize snake_case words ex: 'suresh_babu' -> 'Suresh Babu'
         * */
        function toUpperCase(arrayOfWords = []) {
            let convertedKeys = [];
            arrayOfWords.map(name => {
                if (name.includes('_')) {
                    let splitValues = name.split('_'), fullName = '';
                    splitValues.map(value => {
                        fullName += value[0].toUpperCase() + value.substring(1) + ' ';
                    });
                    convertedKeys.push(fullName.trimRight());
                } else convertedKeys.push(name[0].toUpperCase() + name.substring(1));
            });
            return convertedKeys;
        }

        function totalPostsChart(postsData = []) {
            let keys = new Set();
            let graphValues = {};
            postsData.map(page => {
                let keysForLoop = Object.keys(page);
                keys = new Set([...keysForLoop, ...keys]);
                keysForLoop.map(key => {
                    graphValues[key] = (graphValues[key] ?? 0) + (page[key] ?? 0);
                });
            });

            let {page_user_name, ...requiredObject} = graphValues;

            let convertedKeys = toUpperCase(Object.keys(requiredObject));
            let options = {
                series: Object.values(requiredObject),
                chart: {
                    type: 'polarArea',
                    toolbar: {
                        show: true
                    }
                },
                stroke: {
                    colors: ['#fff']
                },
                fill: {
                    opacity: 1
                },
                yaxis: {
                    show: false
                },
                plotOptions: {
                    polarArea: {
                        rings: {
                            strokeWidth: 0
                        },
                        spokes: {
                            strokeWidth: 0
                        },
                    }
                },
                labels: convertedKeys,
                dataLabels: {
                    dropShadow: {
                        blur: 3,
                        opacity: 0.8
                    }
                },
                responsive: [{
                    breakpoint: 480,
                    options: {
                        chart: {
                            width: 200
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }]
            };
            let chart = new ApexCharts(document.querySelector("#mixed_post_data_chart"), options);
            chart.render();
        }
    </script>

    {{--    For Dates   --}}
    <script>
        // team date ranges
        let isSecondTime = false;
        let DefaultRange = `${moment('2021-07-01').format('MMM DD, YYYY')} -> ${moment().format('MMM DD, YYYY')}`;

        $('#analytics-date-range').daterangepicker({
            buttonClasses: ' btn',
            applyClass: 'btn-primary',
            cancelClass: 'btn-secondary',
            minDate: new Date('07-01-2021'),
            maxDate: moment().endOf('day').format('MM/DD/YYYY'),
            startDate: moment('2021-07-01').format('MMM DD, YYYY'),
            endDate: moment().startOf('day').format('MMM DD, YYYY'),
            ranges: {
                'Today': [moment(), moment()],
                'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
                'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
            }
        }, function (start, end) {
            $('#analytics-date-range .form-control').val(start.format('MMM DD, YYYY') + ' -> ' + end.format('MMM DD, YYYY'));
            checkIsAnalysisOrEmpty();
        });
        $('#analytics-date-range-input').attr('value', DefaultRange);
    </script>


    {{--    Custom Script   --}}
    <script>
        let isCompetitorExist = false,
            isFirstCompetitor = 0;

        /**
         * This function is for Onclick of Networks like Facebook, Instagram etc ..
         * This function will change the active button
         * This function even update the list of competitors based on the Network
         * */
        function activateMe(whichOne = '#facebookTitle') {
            let totalIdsSting = '#facebookTitle, #instagramTitle'; // Add rest 2 or more in future
            let platformOption = {'#facebookTitle': 'facebook', '#instagramTitle': 'instagram'};
            SELECTED_PLATFORM = platformOption[whichOne];
            totalIdsSting.replace(whichOne, '');
            $(totalIdsSting).removeClass('active');
            $(whichOne).addClass('active');

            //    Append the Competitors to Get Analytics
            appendCompetitorsBasedOnNetwork(TOTAL_COMPETITORS[SELECTED_PLATFORM])
        }

        function addCompetitor() {
            const networkTypesAvailable = ['facebook', 'instagram'];
            let competitorId = $('#competitorId').val().trim().replaceAll('@', '').replaceAll('/', '');
            let platform = $('#networkTypes').find(":selected").val();
            if (networkTypesAvailable.includes(platform) && competitorId.length > 0) {
                $.ajax({
                    url: '/discovery/add-competitor',
                    type: 'post',
                    data: {
                        "sb_userid": userId,
                        competitorId,
                        platform
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    before: function () {
                        e.preventDefault();
                    },
                    success: function (response) {
                        if (response?.code === 200 && response?.data?.status?.success) {
                            checkToRemoveItOrNot(`#${platform}Competitor`);
                            $(`#${platform}Competitor`).append(`<div class="d-flex" id="${competitorId}">
                                                    <p>${competitorId}</p>
                                                    <div class="ml-auto">
                                                        <a href="#" data-toggle="tooltip" data-placement="top" title=""
                                                           data-original-title="Just Added"><i
                                                                    class="fas fa-info-circle mx-5"></i></a>
                                                        <a href="#" data-toggle="modal"
                                                           onclick="deleteCompetitor('${competitorId}', '${platform}')"
                                                           data-target="#deleteCompetitorModal">
                                                            <i class="far fa-trash-alt"></i>
                                                        </a>
                                                    </div>
                                                </div>`);

                            // we need to store it in the array - for future use

                            // Append if same one is opened


                            // Not appending if it's invalid so, reload the page to get it added

                            // if (startIndex) $('#competitorSelectors').append('<span>vs</span>');
                            // startIndex = 1;
                            // if (startIndex === 0) $('#competitorSelectors').empty();
                            // $('#competitorSelectors').append(`<button type="button" class="rounded-pills ${startIndex ? 'mx-3' : 'mr-3'} competitor-filter-btn" id="${competitorId}-button">
                            //         <span><img src="../media/icons/user.png" alt="Logo" class="user-black-logo"></span>
                            //         <span>${competitorId}</span>
                            //     </button>`);
                            // $('.competitor-filter-btn').on('click', function () {
                            //     $(this).toggleClass('active');
                            //     checkIsAnalysisOrEmpty();
                            // });
                            toastr.success('successfully Added')
                        } else {
                            toastr.error(response?.data?.status?.message);
                        }
                    },
                    error: function (error) {
                        toastr.error(error.error);
                    }
                });
            } else {
                toastr.error('All inputs are Required and should be Proper');
            }
        }

        function checkToRemoveItOrNot(id) {
            if ($(id).html().includes('No Data Found')) $(id).empty();
            if ($(id).html().includes('Competitor List')) $(id).empty();
        }

        function deleteSelected() {
            if (RECENT_ID !== '' && RECENT_PLATFORM !== '') {
                $.ajax({
                    url: '/discovery/delete-competitor',
                    type: 'delete',
                    data: {
                        sb_userid: userId,
                        competitorId: RECENT_ID,
                        platform: RECENT_PLATFORM
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function (response) {
                        let parentId = $(`#${RECENT_ID}`).parent().attr('id');
                        $(`div[id='${RECENT_ID}']`).remove();
                        $(`#${RECENT_ID}-button`).prev('span').length ? $(`#${RECENT_ID}-button`).prev('span').remove() : $(`#${RECENT_ID}-button`).next('span').remove();
                        $(`#${RECENT_ID}-button`).remove();
                        if ($(`#${parentId}`).length <= 1) $(`#${parentId}`).append('<div class="d-flex"><p>Competitor List</p></div>');
                        if (response?.code === 200) {
                            toastr.success('successfully Deleted')
                        } else {
                            toastr.error(response?.error);
                        }
                    },
                    error: function (error) {
                        toastr.error(error.error);
                    }
                });
            } else {
                toastr.error('Something went wrong, please reload page');
            }
        }

        function isValidCompetitor(competitor) {
            if (competitor?.status === false) {
                if (competitor?.message.includes('Invalid')) return '<i class="fas fa-warning mx-5" data-toggle="tooltip" data-placement="top" title="This is invalid please delete it." data-html="true" style="color:red;"></i>';
                return '';
            }
            return '';
        }

        let startIndex = 0;
        let competitorAppended = 0;

        function getCompetitors(platform = 'facebook') {
            $.ajax({
                url: '/discovery/get-competitors',
                type: 'post',
                data: {
                    "sb_userid": userId,
                    // "sb_userid": 2188, // Testing purpose
                    platform
                },
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function ({data}) {
                    TOTAL_COMPETITORS[platform] = data;
                    if (data.length > 0) {
                        isCompetitorExist = true;
                        // Start for competitors
                        $(`#${platform}Competitor`).empty();
                        $('#competitorVsLoader').remove();
                        data.map(competitor => {
                            let customInfoInHTML = `<b>Followers:</b> ${intToString(competitor?.page_followers) ?? '--'} <br/> <b>Likes:</b> ${intToString(competitor?.page_likes) ?? '--'} <br/> <b>Posts:</b> ${intToString(competitor?.post_count) ?? '--'}`;
                            $(`#${platform}Competitor`).append(`<div class="d-flex" id="${competitor?.status || competitor?.page_user_name ? competitor?.page_user_name : competitor?.page_user_names}">
                                                    <p>${competitor?.status || competitor?.page_user_name ? competitor?.page_user_name : competitor?.page_user_names ?? 'Name'}${isValidCompetitor(competitor)}</p>
                                                    <div class="ml-auto">
                                                        <a href="#" data-toggle="tooltip" data-placement="top" title="" data-html="true"
                                                           data-original-title="${customInfoInHTML}"><i
                                                                    class="fas fa-info-circle mx-5"></i></a>
                                                        <a href="#" data-toggle="modal"
                                                           onclick="deleteCompetitor('${competitor?.status || competitor?.page_user_name ? competitor?.page_user_name : competitor?.page_user_names}', '${platform}')"
                                                           data-target="#deleteCompetitorModal">
                                                            <i class="far fa-trash-alt"></i>
                                                        </a>
                                                    </div>
                                                </div>`);
                            PROFILES[competitor?.status || competitor?.page_user_name ? competitor?.page_user_name : competitor?.page_user_names] = competitor?.status ? competitor?.page_logo : '../media/icons/user.png';
                        });

                        if (!competitorAppended) appendCompetitorsBasedOnNetwork(TOTAL_COMPETITORS[SELECTED_PLATFORM]) , competitorAppended = 1;
                    } else {
                        $('#fbLoading').html('<p>List not Found.</p>');
                        $('#competitorVsLoader').html('<span><img src="../media/icons/user.png" alt="user-image"></span>\n' +
                            '                                    <span>No Data Found. </span>')
                    }
                    // if (!isCompetitorExist) {
                    //     $('#competitorDiv').append('<div class="card card-custom gutter-b text-center p-3">\n' +
                    //         '                           <div class="add-competitor-section">\n' +
                    //         '                               <h3>Add your competitor</h3>\n' +
                    //         '                               Add your competitor social media profile user id for analysis\n' +
                    //         '                           </div>\n' +
                    //         '                           <button type="submit" class="btn font-weight-bolder add-competitor" data-toggle="modal"\n' +
                    //         '                                   data-target="#addCompetitorModal">Add Competitor\n' +
                    //         '                           </button>\n' +
                    //         '                       </div>');
                    // }
                },
                error: function (error) {
                    toastr.error(error.error);
                }
            });
        }

        function appendCompetitorsBasedOnNetwork(data) {
            $('#competitorSelectors').empty();
            startIndex = 0;
            data.map(competitor => {
                if (startIndex && competitor?.status) $('#competitorSelectors').append('<span>vs</span>');
                if (competitor?.status) startIndex = 1;
                if (competitor?.status) {
                    $('#competitorSelectors').append(`<button type="button" class="rounded-pills ${startIndex ? 'mx-3' : 'mr-3'} competitor-filter-btn" id="${competitor?.status || competitor?.page_user_name ? competitor?.page_user_name : competitor?.page_user_names}-button">
                                   ${SELECTED_PLATFORM !== 'instagram' ? `<span><img src="${competitor?.status ? competitor?.page_logo : '../media/icons/user.png'}" alt="Logo" class="user-black-logo normal-logo"></span>` :
                        `<span class="iframe-container"><iframe src="https://img5.imginn.org/?${competitor?.page_logo}"
                                                                                title="Logo" width="20" height="20" scrolling="no" frameborder="0"></iframe></span>`
                    }
                                    <span>${competitor?.status || competitor?.page_user_name ? competitor?.page_user_name : competitor?.page_user_names ?? 'Name'}</span>
                                </button>`);
                }
            });

            $(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
            $('.competitor-filter-btn').on('click', function () {
                $(this).toggleClass('active');
                checkIsAnalysisOrEmpty();
            });
        }

        function getPlatforms() {
            $.ajax({
                url: '/discovery/get-platforms',
                type: 'post',
                data: {},
                headers: {
                    'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                },
                success: function ({data: platforms}) {
                    let isPlatformsExist = false;
                    platforms.map(platform => {
                        if (platform?.status === "live") {
                            isPlatformsExist = true;
                            $(`#${platform?.platform}Title`).attr('data-original-title', 'Available');
                            getCompetitors(platform?.platform);
                        }
                    });
                }
            });
        }

        function checkIsAnalysisOrEmpty() {
            let competitorNames = [];
            $('.competitor-filter-btn.active').each(function () {
                competitorNames.push($(this).text().trim());
            });
            if (!competitorNames.length) {
                $('#vsDiv').nextAll('div').remove();
                $('#vsDiv').after('<div class="card my-8 px-5 pt-5" id="ifEmptyDiv">\n' +
                    '                            <h3 class="mb-4 text-center">Track your competitor by selecting competitor from the above section</h3>\n' +
                    '                            <div class="competitor-tracking">\n' +
                    '                                <img src="../media/svg/illustrations/sb_analysis_01.svg" class="img-fluid" alt="Analysis Band">\n' +
                    '                            </div>\n' +
                    '                        </div>');
            } else {
                return getAnalysis(competitorNames);
            }
        }

        function pageLikes(rankings = []) {
            let finalDivContent = ``;
            let index = 0;
            rankings.map(rank => {
                if (index) finalDivContent += `<hr>`;
                finalDivContent += `<div class="compare-box">
                                         <div class="compare-box-competitor">
                                          ${SELECTED_PLATFORM !== 'instagram' ?
                    `<img src="${PROFILES[rank?.page_user_name]}" class="compare-box-logo" alt="logo">` :
                    `<span class="iframe-container iframe-logo"><iframe src="https://img5.imginn.org/?${PROFILES[rank?.page_user_name]}" title="Logo" scrolling="no" frameborder="0"></iframe></span>`}
                                             <div class="compare-box-label">
                                                 <div>${rank?.page_user_name ?? 'Name'}</div>
                                             </div>
                                         </div>
                                         <div class="compare-box-value">
                                             <p class="mb-0 mr-5">${rank?.page_likes ?? rank?.page_followers ?? '--'}</p>
                                         </div>
                                     </div>`;
                index = 1;
            });
            return finalDivContent;
        }

        function totalPosts(rankings = []) {
            let finalDivContent = ``;
            let index = 0;
            rankings.map(rank => {
                if (index) finalDivContent += `<hr>`;
                finalDivContent += `<div class="compare-box">
                                         <div class="compare-box-competitor">
                                             ${SELECTED_PLATFORM !== 'instagram' ?
                    `<img src="${PROFILES[rank?.page_user_name]}" class="compare-box-logo" alt="logo">` :
                    `<span class="iframe-container iframe-logo"><iframe src="https://img5.imginn.org/?${PROFILES[rank?.page_user_name]}" title="Logo" scrolling="no" frameborder="0"></iframe></span>`}
                                             <div class="compare-box-label">
                                                 <div>${rank?.page_user_name ?? 'Name'}</div>
                                             </div>
                                         </div>
                                         <div class="compare-box-value">
                                             <p class="mb-0 mr-5">${rank?.post_count ?? '--'}</p>
                                         </div>
                                     </div>`;
                index = 1;
            });
            return finalDivContent;
        }

        function engagements(rankings = []) {
            let finalDivContent = ``;
            let index = 0;
            rankings.map(rank => {
                if (index) finalDivContent += `<hr>`;
                finalDivContent += `<div class="compare-box">
                                         <div class="compare-box-competitor">
                                            ${SELECTED_PLATFORM !== 'instagram' ?
                    `<img src="${PROFILES[rank?.page_user_name]}" class="compare-box-logo" alt="logo">` :
                    `<span class="iframe-container"><iframe src="https://img5.imginn.org/?${PROFILES[rank?.page_user_name]}" title="Logo" scrolling="no" frameborder="0"></iframe></span>`}
                                             <div class="compare-box-label">
                                                 <div>${rank?.page_user_name ?? 'Name'}</div>
                                             </div>
                                         </div>
                                         <div class="compare-box-value">
                                             <p class="mb-0 mr-5">${rank?.avg_engagement_rate.toFixed(2) ?? '--'}</p>
                                         </div>
                                     </div>`;
                index = 1;
            });
            return finalDivContent;
        }

        function comparativeColumns(comparatives = []) {
            comparatives.map(page => {
                $('#page_talks').after(`<td><span>${SELECTED_PLATFORM !== 'instagram' ? SELECTED_PLATFORM !== 'twitter' ? page?.founded_on ?? '--' : intToString(page?.page_talks) ?? 0 : page?.business_account}</span></td>`);
                $('#max_change_fans').after(`<td><span>${intToString(page?.max_change_fans) ?? 0}</span></td>`);
                $('#max_post_engagement').after(`<td><span>${intToString(page?.max_post_engagement) ?? 0}</span></td>`);
                $('#post_most_on').after(`<td><span>${moment(page?.post_most_on?.[0], 'YYYY-MM-DD').format('MMM DD, YYYY') ?? 'Date '} (${page?.post_most_on?.[1] ?? 'Count'}) </span></td>`);
            });
        }

        function comparativeData(comparatives = []) {
            // getHeaders
            let headerContent = '';
            let columnsContent = '';
            comparatives.map(page => {
                headerContent += `<th style="min-width: 150px">${page?.page_user_name ?? 'Competitor Name'}</th>`;
            });
            $('#rankingDiv').next().remove();
            $('#rankingDiv').after(`<div class="card my-8 p-5" id="comparativeDiv">
                                    <h5 class="mb-4">Comparative Table</h5>
                                    <div class="card-body p-0 pb-3">
                                    <div class="table-responsive">
                                    <table class="table table-head-custom table-head-bg table-borderless table-vertical-center">
                                    <thead>
                                    <tr class="text-uppercase">
                                    <th style="min-width: 250px" class="pl-7"><span class=""></span></th>
                                    ${headerContent}
                                    </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="" id="page_talks">
                                                <div class="d-flex align-items-center">
                                                <div class="">${SELECTED_PLATFORM !== 'instagram' ? SELECTED_PLATFORM !== 'twitter' ? `Founded At` : `Talking about page` : 'Business Account'}
                                                </div>
                                                    <a href="#" data-toggle="tooltip" data-placement="top" title="" data-original-title="You see the page talks in this column and you can compare">
                                                        <i class="fas fa-info-circle mx-5"></i>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="" id="max_change_fans">
                                                <div class="d-flex align-items-center">
                                                <div class="">Max Fan Change
                                                </div>
                                                    <a href="#" data-toggle="tooltip" data-placement="top" title="" data-original-title="You see the Max Fan changes in this row">
                                                        <i class="fas fa-info-circle mx-5"></i>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="" id="max_post_engagement">
                                                <div class="d-flex align-items-center">
                                                <div class="">Max Post Engagement
                                                </div>
                                                    <a href="#" data-toggle="tooltip" data-placement="top" title="" data-original-title="You see the Max Post Engagement in this row">
                                                        <i class="fas fa-info-circle mx-5"></i>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="" id="post_most_on">
                                                <div class="d-flex align-items-center">
                                                <div class="">Max Post On & Count
                                                </div>
                                                    <a href="#" data-toggle="tooltip" data-placement="top" title="" data-original-title="You see the Max Post On and Count in this row">
                                                        <i class="fas fa-info-circle mx-5"></i>
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                    </table>
                                </div>
                            </div></div>`);
            comparativeColumns(comparatives);
            $(function () {
                $('[data-toggle="tooltip"]').tooltip();
            });
        }

        function growthAndHistory(growth_and_history = []) {
            let chartContent = `<div class="card my-8 px-5 pt-5" id="growthAndHistoryDiv">
                                    <div class="d-flex align-items-center">
                                        <h5 class="mb-4">Growth and history charts</h5>
                                        <div class="ml-auto">
           <div class="form-group">
               </div></div></div>
               <div class="row" id="growthAndHistoryGraphsDiv">
                    <div class="col-xl-6">
                       <div class="card card-custom gutter-b card-stretch">
                       <div class="card-header border-0 py-5">
                       <h3 class="card-title font-weight-bolder">Fan Count</h3>
                       <div class="card-toolbar flex-nowrap">
                       <button class="btn btn-icon text-hover-info btn-sm  ml-5 px-5">
                       <span>
                       <i class="fas fa-info-circle" aria-hidden="true"></i>
                       </span>
                       </button>
                       </div>
                       </div>

                       <div class="card-body d-flex flex-column">
                           <div class="flex-grow-1">
                               <div id="fan_count_chart" class="card-rounded-bottom " style="height: 200px"></div>
                               </div>
                           </div>
                        </div>
                   </div>
                    <div class="col-xl-6">
                       <div class="card card-custom gutter-b card-stretch">
                           <div class="card-header border-0 py-5">
                               <h3 class="card-title font-weight-bolder">Fan Growth</h3>
                               <div class="card-toolbar flex-nowrap">
                                   <button class="btn btn-icon text-hover-info btn-sm  ml-5 px-5">
                                    <span><i class="fas fa-info-circle" aria-hidden="true"></i></span>
                                   </button>
                               </div>
                           </div>
                                   <div class="card-body d-flex flex-column">
                                       <div class="flex-grow-1">
                                            <div id="fan_growth_chart" class="card-rounded-bottom " style="height: 200px"></div>
                                       </div>
                                   </div>
                       </div>
                    </div>
               </div>
            </div>`;
            $('#comparativeDiv').next().remove();
            $('#comparativeDiv').after(chartContent);

            fanGrowthChart(growth_and_history);
            fanCountChart(growth_and_history);
        }

        function userEngagement(userEngagement = [], postTypeEngagement = []) {
            let chartContent = `<div class="row" id="userEngagementDiv">
                    <div class="col-xl-6">
                       <div class="card card-custom gutter-b card-stretch">
                       <div class="card-header border-0 py-5">
                       <h3 class="card-title font-weight-bolder">Engagement By Post Type</h3>
                       <div class="card-toolbar flex-nowrap">
                       <button class="btn btn-icon text-hover-info btn-sm  ml-5 px-5">
                       <span>
                       <i class="fas fa-info-circle" aria-hidden="true"></i>
                       </span>
                       </button>
                       </div>
                       </div>

                       <div class="card-body d-flex flex-column">
                           <div class="flex-grow-1">
                               <div id="post_type_engagement_chart" class="card-rounded-bottom " style="height: 200px"></div>
                               </div>
                           </div>
                        </div>
                   </div>
                    <div class="col-xl-6">
                       <div class="card card-custom gutter-b card-stretch">
                           <div class="card-header border-0 py-5">
                               <h3 class="card-title font-weight-bolder">Distribution of User Engagement</h3>
                               <div class="card-toolbar flex-nowrap">
                                   <button class="btn btn-icon text-hover-info btn-sm  ml-5 px-5">
                                    <span><i class="fas fa-info-circle" aria-hidden="true"></i></span>
                                   </button>
                               </div>
                           </div>
                                   <div class="card-body d-flex flex-column">
                                       <div class="flex-grow-1">
                                            <div id="user_engagement_chart" class="card-rounded-bottom " style="height: 200px"></div>
                                       </div>
                                   </div>
                       </div>
                    </div>
               </div>`;

            $('#growthAndHistoryGraphsDiv').next().remove();
            $('#growthAndHistoryGraphsDiv').after(chartContent);

            userEngagementChart(userEngagement);
            postTypeEngagementChart(postTypeEngagement);
        }

        function postEngagement(postEngagement = [], avgEngagement = []) {
            let chartContent = `<div class="row" id="postEngagementDiv">
                    <div class="col-xl-6">
                       <div class="card card-custom gutter-b card-stretch">
                       <div class="card-header border-0 py-5">
                       <h3 class="card-title font-weight-bolder">Post Engagement Per Day</h3>
                       <div class="card-toolbar flex-nowrap">
                       <button class="btn btn-icon text-hover-info btn-sm  ml-5 px-5">
                       <span>
                       <i class="fas fa-info-circle" aria-hidden="true"></i>
                       </span>
                       </button>
                       </div>
                       </div>

                       <div class="card-body d-flex flex-column">
                           <div class="flex-grow-1">
                               <div id="post_engagement_chart" class="card-rounded-bottom " style="height: 200px"></div>
                               </div>
                           </div>
                        </div>
                   </div>
                    <div class="col-xl-6">
                       <div class="card card-custom gutter-b card-stretch">
                           <div class="card-header border-0 py-5">
                               <h3 class="card-title font-weight-bolder">Average Post Engagement Per Day</h3>
                               <div class="card-toolbar flex-nowrap">
                                   <button class="btn btn-icon text-hover-info btn-sm  ml-5 px-5">
                                    <span><i class="fas fa-info-circle" aria-hidden="true"></i></span>
                                   </button>
                               </div>
                           </div>
                                   <div class="card-body d-flex flex-column">
                                       <div class="flex-grow-1">
                                            <div id="avg_post_engagement_chart" class="card-rounded-bottom " style="height: 200px"></div>
                                       </div>
                                   </div>
                       </div>
                    </div>
               </div>`;

            $('#userEngagementDiv').next().remove();
            $('#userEngagementDiv').after(chartContent);

            postEngagementChart(postEngagement);
            avgPostEngagementChart(avgEngagement);
        }

        function postDistribution(postDistribution = []) {
            let chartContent = `<div class="row" id="postDistributionDiv">
                    <div class="col-xl-6">
                       <div class="card card-custom gutter-b card-stretch">
                       <div class="card-header border-0 py-5">
                       <h3 class="card-title font-weight-bolder">Post Type Distribution</h3>
                       <div class="card-toolbar flex-nowrap">
                       <button class="btn btn-icon text-hover-info btn-sm  ml-5 px-5">
                       <span>
                       <i class="fas fa-info-circle" aria-hidden="true"></i>
                       </span>
                       </button>
                       </div>
                       </div>

                       <div class="card-body d-flex flex-column">
                           <div class="flex-grow-1">
                               <div id="post_distribution_chart" class="card-rounded-bottom " style="height: 200px"></div>
                               </div>
                           </div>
                        </div>
                   </div>
                    <div class="col-xl-6">
                       <div class="card card-custom gutter-b card-stretch">
                           <div class="card-header border-0 py-5">
                               <h3 class="card-title font-weight-bolder">Mixed posts data</h3>
                               <div class="card-toolbar flex-nowrap">
                                   <button class="btn btn-icon text-hover-info btn-sm  ml-5 px-5">
                                    <span><i class="fas fa-info-circle" aria-hidden="true"></i></span>
                                   </button>
                               </div>
                           </div>
                                   <div class="card-body d-flex flex-column">
                                       <div class="flex-grow-1">
                                            <div id="mixed_post_data_chart" class="card-rounded-bottom " style="height: 200px"></div>
                                       </div>
                                   </div>
                       </div>
                    </div>
               </div>`;

            $('#postEngagementDiv').next().remove();
            $('#postEngagementDiv').after(chartContent);

            postTypeDistributionChart(postDistribution);
            totalPostsChart(postDistribution);
        }

        function topPosts(top_posts = []) {
            $('#growthAndHistoryDiv').next().remove();
            $('#growthAndHistoryDiv').after(`<div class="card my-8 p-5">
                                    <h5 class="mb-4">Top Posts</h5>
                                    <div class="card-body p-0 top-posts">
                                        <div class="row">
                                        ${top_posts.map((post, index) => postsGridContent(post, index)).join('')}
                                        </div>
                                    </div>`);
        }

        function postsGridContent(post = {}, index = 1) {
            return `<div class="col-xl-4">
                <div class="card">
                    <div class="d-flex align-items-center p-4">
                        ${SELECTED_PLATFORM !== 'instagram' ? `<div class="symbol symbol-40 symbol-light-success mr-5">
                            <img src="${PROFILES[post?.page_user_name] ?? '../media/svg/avatars/018-girl-9.svg'}" class="h-75 align-self-end" alt=""></div>` :
                `<div class="iframe-container"><iframe src="https://img5.imginn.org/?${PROFILES[post?.page_user_name]}" title="Logo" scrolling="no" frameborder="0"></iframe></div>`}

                        <div class="d-flex flex-column flex-grow-1 ${SELECTED_PLATFORM === 'instagram' ? 'pl-5' : ''}">
                            <a href="javascript:;" class="text-hover-primary mb-1 font-size-lg font-weight-bolder">${post?.page_user_name ?? 'Name'}</a>
                            <span class="font-weight-bold">${post?.dateCreated ?? moment()}</span>
                        </div>
                    </div>
                    <div class="px-4 top-posts-cards mb-5">
                        <p>${post?.description ?? post?.caption ?? 'Description'}</p>
                        ${SELECTED_PLATFORM === 'instagram' ?
                `<span class="iframe-container top-posts-image"> <iframe  src="https://img5.imginn.org/?${post?.mediaUrl}" title="Logo" scrolling="no" frameborder="0"></iframe></span>` :
                `<img src="${post?.mediaURL?.[0] ?? `../media/grid-image${index + 1}.jpg`}" alt="Default Banner">`
            }
                    </div>
                    <div class="px-4 analytic-post-card mb-5">
                        <ul>
                            <li>
                            <span>Total Comments</span>
                            <span><b>${post?.commentCount ?? '--'}</b></span>
                            </li>
                            <li>
                            <span>Total Likes</span>
                            <span><b>${post?.likeCount ?? '--'}</b></span>
                            </li>
                            ${SELECTED_PLATFORM !== 'instagram' ? `<li><span>Total Shares</span>
                            <span><b>${post?.shareCount ?? '--'}</b></span>
                            </li>` : ``}
                        </ul>
                    </div>
                </div>
            </div>`;
        }

        function getAnalysis(competitorNames = []) {
            if (competitorNames && competitorNames.length) {
                let [from, to] = $('#analytics-date-range-input').val().split(' -> ');

                $.ajax({
                    url: '/discovery/get-analysis',
                    type: 'post',
                    data: {
                        sb_userid: userId,
                        filterPeriod: '7',
                        startDate: moment(from, 'MMM DD, YYYY').format('YYYY-MM-DD'),
                        endDate: moment(to, 'MMM DD, YYYY').format('YYYY-MM-DD'),
                        platform: SELECTED_PLATFORM,
                        competitorId: competitorNames
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: function (response) {
                        //    Add Ranking Div
                        if (response !== []) {
                            let {data} = response;
                            if (data?.rankings.length) {
                                $('#vsDiv').next().remove();
                                $('#vsDiv').after(`<div class="card my-8 px-5 pt-5" id="rankingDiv">
                                <h5 class="mb-4">Ranking</h5>
                                <div class="card-columns ranking-analytics">

                                    <div class="card">
                                        <div class="card-header d-flex">
                                            <div><i class="fa fa-user mr-3"></i>
                                           ${SELECTED_PLATFORM === 'instagram' ? 'Fans(Page Followers)' : 'Fans (Page Likes)'}</div>
                                            <div class="ml-auto">
                                                <a href="#" data-toggle="tooltip" data-placement="top" title="" data-original-title="Info">
                                                    <i class="fas fa-info-circle ml-5"></i>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="card-body p-2">
                                            <div class="compare-box-ranking">
                                                ${pageLikes(data?.rankings)}
                                            </div>
                                        </div>
                                    </div>

                                    <div class="card">
                                        <div class="card-header d-flex">
                                            <div><i class="fa fa-user mr-3"></i>
                                                Total Posts</div>
                                            <div class="ml-auto">
                                                <a href="#" data-toggle="tooltip" data-placement="top" title="" data-original-title="Info">
                                                    <i class="fas fa-info-circle ml-5"></i>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="card-body p-2">
                                            <div class="compare-box-ranking">
                                                ${totalPosts(data?.rankings)}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="card">
                                        <div class="card-header d-flex">
                                            <div><i class="fa fa-user mr-3"></i>
                                                Average Engagement rate</div>
                                            <div class="ml-auto">
                                                <a href="#" data-toggle="tooltip" data-placement="top" title="" data-original-title="Info">
                                                    <i class="fas fa-info-circle ml-5"></i>
                                                </a>
                                            </div>
                                        </div>
                                        <div class="card-body p-2">
                                            <div class="compare-box-ranking">
                                                ${engagements(data?.rankings)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                </div>`);

                                if (SELECTED_PLATFORM === 'instagram') $('.compare-box-label').css('padding-left', '60px');

                                // for Comparative Section
                                comparativeData(data?.comparative_data);
                                growthAndHistory(data?.growth_and_history);

                                userEngagement(data?.distribution_user_eng, data?.eng_by_post_type);
                                postEngagement(data?.post_eng_per_day, data?.avg_post_eng_per_day);

                                postDistribution(data?.post_type_dist);

                                // Final Top Posts
                                topPosts(data?.top_posts)
                            }
                        } else {
                            toastr.error('No Data found Please check with other dates or Reload page');
                        }
                    }
                });
            }
        }

        function intToString(value = 0) {
            if (value !== undefined) {
                const suffixes = ["", "K", "M", "B", "T"];
                const suffixNum = Math.floor(("" + value).length / 3);
                let shortValue = parseFloat((suffixNum !== 0 ? (value / Math.pow(1000, suffixNum)) : value).toPrecision(2));
                if (shortValue % 1 !== 0) {
                    shortValue = shortValue.toFixed(1);
                }
                return shortValue + suffixes[suffixNum];
            }
            return undefined;
        }

    </script>
@endsection
