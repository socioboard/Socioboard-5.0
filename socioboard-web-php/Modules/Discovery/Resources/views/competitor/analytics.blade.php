@extends('home::layouts.UserLayout')

@section('title')
    <title>{{env('WEBSITE_TITLE')}} | Competitive Analysis</title>
@endsection
@section('content')
    <style>

        #more0, #more1, #more2 {
            display: none;
        }

        .buttonToA {
            border: none;
            color: blue;
            border-radius: 10%;
        }

        .buttonToA:hover {
            color: black;
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
                                            <i class="fab fa-facebook fa-2x mt-2"></i>
                                        </span>
                                <div class="competitive-list-block" id="facebookCompetitor">
                                    <div>
                                        <p>Competitor List</p>
                                    </div>
                                    <div class="d-flex" id="facebookLoading">
                                        <p>Loading ...</p>
                                    </div>
                                </div>
                            </div>

                            {{--            I'm commenting these becuase we don't want to show it in the Adding pannel                --}}
                            <hr>
                            <div class="competitive-list">
                                <span class="nav-text">
                                    <i class="fab fa-twitter fa-2x"></i>
                                </span>
                                <div class="competitive-list-block" id="twitterCompetitor">
                                    <div class="d-flex">
                                        <p>Competitor List</p>
                                    </div>
                                    <div class="d-flex" id="twitterLoading">
                                        <p>Loading ...</p>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="competitive-list">
                                        <span class="nav-text">
                                            <i class="fab fa-youtube fa-2x"></i>
                                        </span>
                                <div class="competitive-list-block" id="youtubeCompetitor">
                                    <div class="d-flex">
                                        <p> Competitor List</p>
                                    </div>
                                    <div class="d-flex" id="youtubeLoading">
                                        <p>Loading ...</p>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="competitive-list">
                                <span class="nav-text">
                                    <i class="fab fa-instagram fa-2x"></i>
                                </span>
                                <div class="competitive-list-block" id="instagramCompetitor">
                                    <div class="d-flex">
                                        <p> Competitor List</p>
                                    </div>
                                    <div class="d-flex" id="instagramLoading">
                                        <p>Loading ...</p>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="competitive-list">
                                        <span class="nav-text">
                                            <i class="fab fa-linkedin fa-2x"></i>
                                        </span>
                                <div class="competitive-list-block" id="linkedinCompetitor">
                                    <div class="d-flex">
                                        <p> Competitor List</p>
                                    </div>
                                    <div class="d-flex" id="linkedinLoading">
                                        <p>Loading ...</p>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="competitive-list">
                                        <span class="nav-text">
                                            <i class="fab fa-reddit fa-2x"></i>
                                        </span>
                                <div class="competitive-list-block" id="redditCompetitor">
                                    <div class="d-flex">
                                        <p> Competitor List</p>
                                    </div>
                                    <div class="d-flex" id="redditLoading">
                                        <p>Loading ...</p>
                                    </div>
                                </div>
                            </div>
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
                                        <button type="button" class="btn active fbButtonDIv" id="facebookTitle"
                                                onclick="activateMe('#facebookTitle')">
                                            <span><i class="fab fa-facebook"></i></span>
                                            <span>facebook</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="inline-flex flex-wrap px-5">
                                    <div class="competitor-overview">
                                        <button type="button" class="btn" id="twitterTitle"
                                                onclick="activateMe('#twitterTitle')">
                                            <span><i class="fab fa-twitter"></i></span>
                                            <span>Twitter</span>
                                        </button>
                                    </div>
                                </div>

                                <div class="inline-flex flex-wrap px-5">
                                    <div class="competitor-overview">
                                        <button type="button" class="btn" id="youTubeTitle"
                                                onclick="activateMe('#youTubeTitle')">
                                            <span><i class="fab fa-youtube"></i></span>
                                            <span>YouTube</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="inline-flex flex-wrap px-5">
                                    <div class="competitor-overview">
                                        <button type="button" class="btn" id="instagramTitle"
                                                onclick="activateMe('#instagramTitle')">
                                            <span><i class="fab fa-instagram"></i></span>
                                            <span>Instagram</span>
                                        </button>
                                    </div>
                                </div>

                                <div class="inline-flex flex-wrap px-5">
                                    <div class="competitor-overview">
                                        <button type="button" class="btn" id="linkedinTitle"
                                                onclick="activateMe('#linkedinTitle')">
                                            <span><i class="fab fa-linkedin"></i></span>
                                            <span>LinkedIn</span>
                                        </button>
                                    </div>
                                </div>
                                <div class="inline-flex flex-wrap px-5">
                                    <div class="competitor-overview">
                                        <button type="button" class="btn" id="redditTitle"
                                                onclick="activateMe('#redditTitle')">
                                            <span><i class="fab fa-reddit"></i></span>
                                            <span>Reddit</span>
                                        </button>
                                    </div>
                                </div>
                                <!-- datepicker -->
                                <div class="ml-auto">
                                    <div class="input-icon analytics-date-range-input" id='analytics-date-range' style='width: 270px;'>
                                        <input class="form-control form-control-solid h-auto py-4 rounded-lg font-size-h6 "
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
                            <div class="text-bold text-center mb-5" id="updatingId" style="display: none"><h4>Updating
                                    content please wait ...</h4>
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
                        <span>For Proper reference please change the platform and see the reference</span>
                        <div style="float: right; margin-bottom: 10px"><a id="referenceId"
                                                                          href="http://prntscr.com/1seyz0b"
                                                                          target="_blank" style="color: blue">Click For
                                Reference</a>
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
                            <option value="twitter">Twitter</option>
                            <option value="youtube">YouTube</option>
                            <option value="linkedin">LinkedIn Public Account</option>
                            <option value="reddit">Reddit</option>
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

        $('#networkTypes').on('change', () => {
            switch ($('#networkTypes').find(":selected").val() ?? 'facebook') {
                case 'facebook':
                    $('#referenceId').attr('href', 'http://prntscr.com/1seyz0b');
                    break;
                case 'instagram':
                    $('#referenceId').attr('href', 'https://screencast-o-matic.com/watch/crlvXdVofH7');
                    break;
                case 'twitter':
                    $('#referenceId').attr('href', 'https://screencast-o-matic.com/watch/crlvi0VofTI');
                    break;
                case 'youtube':
                    $('#referenceId').attr('href', 'https://screencast-o-matic.com/watch/c3V1IvVoFT0');
                    break;
                case 'linkedin':
                    $('#referenceId').attr('href', 'https://screencast-o-matic.com/watch/c3V1IdVoFuX');
                    break;
                case 'reddit':
                    $('#referenceId').attr('href', 'https://screencast-o-matic.com/watch/c3V1ImVoFtm');
                    break;
            }
        });
    </script>
@endsection

@section('page-scripts')
    <script>$("#discovery").removeClass('active').trigger('click');</script>
    <!-- charts -->
    <script>
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
                seriesData.push({
                    name: SELECTED_PLATFORM === 'youtube' ? page?.page_display_name : page?.page_user_name,
                    data: values
                });
            });

            let optionsLine = {
                chart: {
                    height: 328,
                    type: 'line',
                    dropShadow: {
                        enabled: true,
                        top: 2,
                        left: 1,
                        blur: 2,
                        opacity: .5,
                    }
                },
                tooltip: {
                    theme: 'dark'
                },
                stroke: {
                    curve: 'smooth',
                    width: 2
                },
                colors: ["#2BB527", '#000000', '#cc00ff', '#0033cc', '#ffff00', '#66ccff'],
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
                seriesData.push({
                    name: SELECTED_PLATFORM === 'youtube' ? page?.page_display_name : page?.page_user_name,
                    data: values
                });
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
                                color: '#C6A043',
                                opacity: 0.4,
                                width: 1
                            }
                        }
                    }
                },
                colors: ["#5b52e5", '#00ff00', '#0066ff', '#ff0066', '#ffff00', '#6699ff'],
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
            let keys = new Set();
            let graphValues = {};
            engagementData.map(page => {
                competitors.push(SELECTED_PLATFORM === 'youtube' ? page?.page_display_name : page?.page_user_name ?? 'Competitor');
                let keysForLoop = Object.keys(page);
                keys = new Set([...keysForLoop, ...keys]);
                keysForLoop.map(key => {
                    graphValues[key] = graphValues.hasOwnProperty(key) ? [...graphValues[key] ?? 0, page[key] ?? 0] : [page[key] ?? 0];
                });
            });

            let {page_user_name, page_display_name, ...requiredObject} = graphValues;

            let convertedKeys = toUpperCase(Object.keys(requiredObject));
            let values = Object.values(requiredObject);
            for (let i = 0; i < convertedKeys.length; i++) {
                seriesData.push({
                    name: convertedKeys[i], data: values[i]
                });
            }

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
                                color: '#C17E1B',
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
            let keys = new Set();
            let graphValues = {};
            engagementData.map(page => {
                competitors.push(SELECTED_PLATFORM === 'youtube' ? page?.page_display_name : page?.page_user_name ?? 'Competitor');
                let keysForLoop = Object.keys(page);
                keys = new Set([...keysForLoop, ...keys]);
                keysForLoop.map(key => {
                    graphValues[key] = graphValues.hasOwnProperty(key) ? [...graphValues[key] ?? 0, page[key] ?? 0] : [page[key] ?? 0];
                });
            });

            let {page_user_name, page_display_name, ...requiredObject} = graphValues;

            let convertedKeys = toUpperCase(Object.keys(requiredObject));
            let values = Object.values(requiredObject);
            for (let i = 0; i < convertedKeys.length; i++) {
                seriesData.push({
                    name: convertedKeys[i], data: values[i]
                });
            }

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
                seriesData.push({
                    name: SELECTED_PLATFORM === 'youtube' ? page?.page_display_name : page?.page_user_name,
                    data: values
                });
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
                series: seriesData,
                markers: {
                    size: 6,
                    strokeWidth: 0,
                    hover: {
                        size: 9
                    }
                },
                colors: ["#C1180A", '#38C116', '#9933ff', '#ffff00', '#33cccc', '#ff6600'],
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
                seriesData.push({
                    name: SELECTED_PLATFORM === 'youtube' ? page?.page_display_name : page?.page_user_name,
                    data: values
                });
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
                                color: '#1AA151',
                                opacity: 0.4,
                                width: 1
                            }
                        }
                    }
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    show: true,
                    width: 1,
                    colors: ["transparent"]
                },
                colors: ["#e8d129", '#a117c1', '#000000', '#33cc33', '#3333ff', '#ff66ff'],
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

            let chart = new ApexCharts(document.querySelector("#avg_post_engagement_chart"), options);
            chart.render();
        }

        function postTypeDistributionChart(distributionData = []) {
            let seriesData = [], competitors = [];
            let keys = new Set();
            let graphValues = {};
            distributionData.map(page => {
                competitors.push(SELECTED_PLATFORM === 'youtube' ? page?.page_display_name : page?.page_user_name ?? 'Competitor');
                let keysForLoop = Object.keys(page);
                keys = new Set([...keysForLoop, ...keys]);
                keysForLoop.map(key => {
                    graphValues[key] = graphValues.hasOwnProperty(key) ? [...graphValues[key] ?? 0, page[key] ?? 0] : [page[key] ?? 0];
                });
            });

            let {page_user_name, page_display_name, ...requiredObject} = graphValues;

            let convertedKeys = toUpperCase(Object.keys(requiredObject));
            let values = Object.values(requiredObject);
            for (let i = 0; i < convertedKeys.length; i++) {
                seriesData.push({
                    name: convertedKeys[i], data: values[i]
                });
            }

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

            let {page_user_name, page_display_name, ...requiredObject} = graphValues;

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
        let DefaultRange = `${moment().subtract(6, 'days').format('MMM DD, YYYY')} -> ${moment().format('MMM DD, YYYY')}`;
        let start = moment().subtract(6, 'days'), end = moment();

        $('#analytics-date-range').daterangepicker({
            buttonClasses: ' btn',
            applyClass: 'btn-primary',
            cancelClass: 'btn-secondary',
            minDate: new Date('07-01-2021'),
            maxDate: moment().endOf('day').format('MM/DD/YYYY'),
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
            let totalIdsSting = '#facebookTitle, #instagramTitle, #twitterTitle, #youTubeTitle, #linkedinTitle, #redditTitle'; // Add rest 2 or more in future
            let platformOption = {
                '#facebookTitle': 'facebook',
                '#instagramTitle': 'instagram',
                '#youTubeTitle': 'youtube',
                '#twitterTitle': 'twitter',
                '#linkedinTitle': 'linkedin',
                '#redditTitle': 'reddit',
            };
            SELECTED_PLATFORM = platformOption[whichOne];
            totalIdsSting.replace(whichOne, '');
            $(totalIdsSting).removeClass('active');
            $(whichOne).addClass('active');

            //    Append the Competitors to Get Analytics
            appendCompetitorsBasedOnNetwork(TOTAL_COMPETITORS[SELECTED_PLATFORM]);
            makeEmpty();
        }

        function addCompetitor() {
            const networkTypesAvailable = ['facebook', 'twitter', 'youtube', 'instagram', 'linkedin', 'reddit'];
            let platform = $('#networkTypes').find(":selected").val();
            let competitorId = ['reddit', 'youtube'].includes(platform) ? $('#competitorId').val() : $('#competitorId').val().trim().replaceAll('@', '').replaceAll('/', '');
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
                    before: () => {
                        e.preventDefault();
                    },
                    success: (response) => {
                        if (response?.code === 200 && response?.data?.status?.success) {
                            checkToRemoveItOrNot(`#${platform}Competitor`);
                            if (platform === 'reddit') competitorId = competitorId?.replace('https://www.reddit.com/', '');
                            if (platform === 'youtube') competitorId = competitorId?.replace('https://www.youtube.com/', '');
                            $(`#${platform}Competitor`)
                                .append(`<div class="d-flex" id="${competitorId.replaceAll('/', '-')}">
                                            <p>${competitorId}</p>
                                            <div class="ml-auto d-flex">
                                                <a href="#" data-toggle="tooltip" data-placement="top" title=""
                                                   data-original-title="Just Added"><i
                                                            class="fas fa-info-circle mx-5"></i></a>
                                                <a href="#" data-toggle="modal"
                                                   onclick="deleteCompetitor('${competitorId.replaceAll('/', '-')}', '${platform}')"
                                                   data-target="#deleteCompetitorModal">
                                                    <i class="far fa-trash-alt"></i>
                                                </a>
                                            </div>
                                        </div>`);
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
                        competitorId: RECENT_PLATFORM === 'linkedin' ? RECENT_ID : RECENT_ID?.replaceAll('-', '/'),
                        platform: RECENT_PLATFORM
                    },
                    headers: {
                        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
                    },
                    success: (response) => {
                        let parentId = $(`#${RECENT_ID}`).parent().attr('id');
                        $(`div[id='${RECENT_ID}']`).remove();
                        $(`#${RECENT_ID}-button`).prev('span').length ? $(`#${RECENT_ID}-button`).prev('span').remove() : $(`#${RECENT_ID}-button`).next('span').remove();
                        $(`#${RECENT_ID}-button`).remove();
                        if ($(`#${parentId}`).children('div').length < 1) $(`#${parentId}`).append('<div class="d-flex"><p>Competitor List</p></div>');
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
                    let loaderIds = '#facebookLoading, #youtubeLoading, #instagramLoading, #redditLoading, #linkedinLoading, #twitterLoading';
                    if (data.length > 0) {
                        loaderIds.replace(`${platform}Loading`, '');
                        isCompetitorExist = true;
                        // Start for competitors
                        $(`#${platform}Competitor`).empty();
                        $('#competitorVsLoader').remove();
                        data.map(competitor => {
                            let customInfoInHTML = `<b>Followers:</b> ${intToString(competitor?.page_followers) ?? '--'} <br/> <b>Likes:</b> ${intToString(competitor?.page_likes) ?? '--'} <br/> <b>Posts:</b> ${intToString(competitor?.post_count) ?? '--'}`;
                            $(`#${platform}Competitor`).append(`<div class="d-flex competator-list-container" id="${competitor?.status || competitor?.page_user_name ? competitor?.page_user_name?.replaceAll('/', '-') : competitor?.page_user_names.replaceAll('/', '-')}">
                                                    <p>${competitor?.status || competitor?.page_user_name ? platform === 'youtube' ? competitor?.page_display_name : competitor?.page_user_name : competitor?.page_user_names ?? 'Name'}${isValidCompetitor(competitor)}</p>
                                                    <div class="ml-auto d-flex">
                                                        <a href="#" data-toggle="tooltip" data-placement="top" title="" data-html="true"
                                                           data-original-title="${customInfoInHTML}"><i
                                                                    class="fas fa-info-circle mx-5 infoButtonClass"></i></a>
                                                        <a href="#" data-toggle="modal"
                                                           onclick="deleteCompetitor('${competitor?.status || competitor?.page_user_name ? competitor?.page_user_name?.replaceAll('/', '-') : competitor?.page_user_names.replaceAll('/', '-')}', '${platform}')"
                                                           data-target="#deleteCompetitorModal">
                                                            <i class="far fa-trash-alt deleteComptetitor"></i>
                                                        </a>
                                                    </div>
                                                </div>`);
                            PROFILES[competitor?.status || competitor?.page_user_name ? competitor?.page_user_name : competitor?.page_user_names] = competitor?.status ? competitor?.page_logo : '../media/icons/user.png';
                        });
                        $(loaderIds).html('<p>List not Found.</p>');
                        if (!competitorAppended) appendCompetitorsBasedOnNetwork(TOTAL_COMPETITORS[SELECTED_PLATFORM]) , competitorAppended = 1;
                    } else {
                        $(loaderIds).html('<p>List not Found.</p>');
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
                                   ${SELECTED_PLATFORM !== 'instagram' ? `<span><img src="${competitor?.status ? competitor?.page_logo : '../media/icons/user.png'}" alt="Logo" class="user-black-logo normal-logo" onerror="this.onerror=null;this.src='../media/icons/user.png';"></span>` :
                        `<span class="iframe-container"><iframe src="https://img5.imginn.org/?${competitor?.page_logo}"
                                                                                title="Logo" width="20" height="20" scrolling="no" frameborder="0"></iframe></span>`
                    }
                                    <span value="${competitor?.status || competitor?.page_user_name ? competitor?.page_user_name : competitor?.page_user_names ?? 'Name'}">${competitor?.status || competitor?.page_user_name ? SELECTED_PLATFORM === 'youtube' ? competitor?.page_display_name : competitor?.page_user_name : competitor?.page_user_names ?? 'Name'}</span>
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

        function makeEmpty() {
            $('#vsDiv').nextAll('div').remove();
            $('#vsDiv').after('<div class="card my-8 px-5 pt-5" id="ifEmptyDiv">\n' +
                '                            <h3 class="mb-4 text-center">Track your competitor by selecting competitor from the above section</h3>\n' +
                '                            <div class="competitor-tracking">\n' +
                '                                <img src="../media/svg/illustrations/sb_analysis_01.svg" class="img-fluid" alt="Analysis Band">\n' +
                '                            </div>\n' +
                '                        </div>');
        }

        function checkIsAnalysisOrEmpty() {
            let competitorNames = [];
            $('.competitor-filter-btn.active').each(function () {
                competitorNames.push($(this).children('span').eq(1).attr('value').trim());
            });
            if (!competitorNames.length) {
                makeEmpty();
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
                    `<img src="${PROFILES[rank?.page_user_name]}" class="compare-box-logo" alt="logo" onerror="this.onerror=null;this.src='../media/icons/user.png';">` :
                    `<span class="iframe-container iframe-logo"><iframe src="https://img5.imginn.org/?${PROFILES[rank?.page_user_name]}" title="Logo" scrolling="no" frameborder="0"></iframe></span>`}
                                             <div class="compare-box-label">
                                                 <div>${SELECTED_PLATFORM === 'youtube' ? rank?.page_display_name : rank?.page_user_name ?? 'Name'}</div>
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
                    `<img src="${PROFILES[rank?.page_user_name]}" class="compare-box-logo" alt="logo" onerror="this.onerror=null;this.src='../media/icons/user.png';">` :
                    `<span class="iframe-container iframe-logo"><iframe src="https://img5.imginn.org/?${PROFILES[rank?.page_user_name]}" title="Logo" scrolling="no" frameborder="0"></iframe></span>`}
                                             <div class="compare-box-label">
                                                 <div>${SELECTED_PLATFORM === 'youtube' ? rank?.page_display_name : rank?.page_user_name ?? 'Name'}</div>
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
                    `<img src="${PROFILES[rank?.page_user_name]}" class="compare-box-logo" alt="logo" onerror="this.onerror=null;this.src='../media/icons/user.png';">` :
                    `<span class="iframe-container"><iframe src="https://img5.imginn.org/?${PROFILES[rank?.page_user_name]}" title="Logo" scrolling="no" frameborder="0"></iframe></span>`}
                                             <div class="compare-box-label">
                                                 <div>${SELECTED_PLATFORM === 'youtube' ? rank?.page_display_name : rank?.page_user_name ?? 'Name'}</div>
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
                $('#page_talks').after(`<td><span>${SELECTED_PLATFORM !== 'instagram' ? SELECTED_PLATFORM === 'twitter' ? page?.founded_on ?? '--' : SELECTED_PLATFORM === 'youtube' ? intToString(page?.total_views) ?? 0 : intToString(page?.page_talks) ?? 0 : page?.business_account}</span></td>`);
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
                headerContent += `<th style="min-width: 150px">${SELECTED_PLATFORM === 'youtube' ? page?.page_display_name : page?.page_user_name ?? 'Competitor Name'}</th>`;
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
                                                <div class="">${SELECTED_PLATFORM !== 'instagram' ? SELECTED_PLATFORM === 'twitter' ? `Founded At` : SELECTED_PLATFORM === 'youtube' ? 'Total Views' : `Talking about page` : 'Business Account'}
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
                    <div class="col-xl-12" id="ss-fanCount">
                       <div class="card card-custom gutter-b card-stretch">
                       <div class="card-header border-0 py-5">
                       <h3 class="card-title font-weight-bolder">Fan Count</h3>
                       <div class="card-toolbar flex-nowrap">
                       <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-fanCount_md12" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-fanCount_md12" style="
    display: none;"></span>
                       </div>
                       </div>

                       <div class="card-body d-flex flex-column">
                           <div class="flex-grow-1">
                               <div id="fan_count_chart" class="card-rounded-bottom " style="height: 200px"></div>
                               </div>
                           </div>
                        </div>
                   </div>
                    <div class="col-xl-12" id="ss-fanGrowth">
                       <div class="card card-custom gutter-b card-stretch">
                           <div class="card-header border-0 py-5">
                               <h3 class="card-title font-weight-bolder">Fan Growth</h3>
                               <div class="card-toolbar flex-nowrap">
                                   <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-fanGrowth_md12" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-fanGrowth_md12" style="
    display: none;"></span>
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
            let chartContent = `<div class="row" id="ss-userEngagementDiv">
                    <div class="col-xl-12" id="ss-userEngagementDiv2">
                       <div class="card card-custom gutter-b card-stretch">
                       <div class="card-header border-0 py-5">
                       <h3 class="card-title font-weight-bolder">Engagement By Post Type</h3>
                       <div class="card-toolbar flex-nowrap">
                       <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-userEngagementDiv2_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-userEngagementDiv2_md6" style="
    display: none;"></span>
                       </div>
                       </div>

                       <div class="card-body d-flex flex-column">
                           <div class="flex-grow-1">
                               <div id="post_type_engagement_chart" class="card-rounded-bottom " style="height: 200px"></div>
                               </div>
                           </div>
                        </div>
                   </div>
                    <div class="col-xl-12" id="ss-distEngagementDiv">
                       <div class="card card-custom gutter-b card-stretch" >
                           <div class="card-header border-0 py-5">
                               <h3 class="card-title font-weight-bolder">Distribution of User Engagement</h3>
                               <div class="card-toolbar flex-nowrap">
                                   <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-distEngagementDiv_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-distEngagementDiv_md6" style="
    display: none;"></span>
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
                    <div class="col-xl-12" id="ss-postEngagementDiv">
                       <div class="card card-custom gutter-b card-stretch">
                       <div class="card-header border-0 py-5">
                       <h3 class="card-title font-weight-bolder">Post Engagement Per Day</h3>
                       <div class="card-toolbar flex-nowrap">
                                   <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-postEngagementDiv_md12" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-postEngagementDiv_md12" style="
    display: none;"></span>
                               </div>
                       </div>

                       <div class="card-body d-flex flex-column">
                           <div class="flex-grow-1">
                               <div id="post_engagement_chart" class="card-rounded-bottom " style="height: 200px"></div>
                               </div>
                           </div>
                        </div>
                   </div>
                    <div class="col-xl-12" id="ss-AverageDiv">
                       <div class="card card-custom gutter-b card-stretch">
                           <div class="card-header border-0 py-5">
                               <h3 class="card-title font-weight-bolder">Average Post Engagement Per Day</h3>
                               <div class="card-toolbar flex-nowrap">
                                   <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-AverageDiv_md12" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-AverageDiv_md12" style="
    display: none;"></span>
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

            $('#ss-userEngagementDiv').next().remove();
            $('#ss-userEngagementDiv').after(chartContent);

            postEngagementChart(postEngagement);
            avgPostEngagementChart(avgEngagement);
        }

        function postDistribution(postDistribution = []) {
            let chartContent = `<div class="row" id="postDistributionDiv">
                    <div class="col-xl-6" id="ss-PostDistributionDiv">
                       <div class="card card-custom gutter-b card-stretch">
                       <div class="card-header border-0 py-5">
                       <h3 class="card-title font-weight-bolder">Post Type Distribution</h3>
                       <div class="card-toolbar flex-nowrap">
                                   <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-PostDistributionDiv_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-PostDistributionDiv_md6" style="
    display: none;"></span>
                               </div>
                       </div>

                       <div class="card-body d-flex flex-column">
                           <div class="flex-grow-1">
                               <div id="post_distribution_chart" class="card-rounded-bottom " style="height: 200px"></div>
                               </div>
                           </div>
                        </div>
                   </div>
                    <div class="col-xl-6" id="ss-mixedPostsDiv">
                       <div class="card card-custom gutter-b card-stretch">
                           <div class="card-header border-0 py-5">
                               <h3 class="card-title font-weight-bolder">Mixed posts data</h3>
                               <div class="card-toolbar flex-nowrap">
                                   <div class="card-toolbar flex-nowrap">
                                   <div id="addToCart" class="btn btn-icon text-hover-info btn-sm  ml-5 px-5"
                                     title="Add to custom Reports"><i class="fa fa-plus fa-md" aria-hidden="true"></i>
                                    <span node-id="ss-mixedPostsDiv_md6" class="ss addtcartclose"></span>
                                </div>
                                <span class="spinner spinner-primary spinner-center" id="ss-mixedPostsDiv_md6" style="
    display: none;"></span>
                               </div>
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
            if(SELECTED_PLATFORM === 'instagram') $('span.iframe-container.top-posts-image').css('height', '380px');
        }

        function postBreakDown(content = '', indexValue = 0) {
            if (content.length < 90) return content;

            // break for 90 chars.. and show more
            if (content.length > 90) {
                return `${content.slice(0, 90)}
                         <span id="dots${indexValue}">...</span>
                         <span id="more${indexValue}">${content.slice(91)}</span>
                        <button class="buttonToA btn-xs" onclick="toggleContent(${indexValue})" id="myButton${indexValue}">Read more</button>`
            }
        }

        // for More and Less Switch
        function toggleContent(indexValue) {
            let dots = document.getElementById(`dots${indexValue}`);
            let moreText = document.getElementById(`more${indexValue}`);
            let btnText = document.getElementById(`myButton${indexValue}`);

            if (dots.style.display === "none") {
                dots.style.display = "inline";
                btnText.innerHTML = "Read more";
                moreText.style.display = "none";
            } else {
                dots.style.display = "none";
                btnText.innerHTML = "Read less";
                moreText.style.display = "inline";
            }
        }


        function postDetailsList(post) {
            let defaultKeys = `<li>
                                <span>Total Comments</span>
                                <span><b>${post?.commentCount ?? '--'}</b></span>
                            </li>
                            <li>
                                <span>Total Likes</span>
                                <span><b>${post?.likeCount ?? '--'}</b></span>
                            </li>`;
            switch (SELECTED_PLATFORM) {
                case 'twitter' :
                    return `<li>
                                <span>Favourite Count</span>
                                <span><b>${post?.favoriteCount ?? '--'}</b></span>
                            </li>
                            <li>
                                <span>Quote Count</span>
                                <span><b>${post?.quoteCount ?? '--'}</b></span>
                            </li>
                            <li>
                                <span>Reply Count</span>
                                <span><b>${post?.replyCount ?? '--'}</b></span>
                            </li>
                                <li><span>Re-Tweet Count</span>
                                <span><b>${post?.retweetCount ?? '--'}</b></span>
                            </li>`;
                case 'instagram' :
                case 'linkedin' :
                    return defaultKeys;
                case 'facebook' :
                    return `${defaultKeys}
                            <li>
                                <span>Total Shares</span>
                                <span><b>${post?.shareCount ?? '--'}</b></span>
                            </li>`;
                case 'youtube' :
                    return `${defaultKeys}
                            <li>
                                <span>Total Dis Likes</span>
                                <span><b>${post?.dislikeCount ?? '0'}</b></span>
                            </li>
                            <li>
                                <span>Total Views</span>
                                <span><b>${post?.viewsCount ?? '0'}</b></span>
                            </li>`;
                case 'reddit' :
                    return `<li>
                                <span>Author</span>
                                <span><b>${post?.author ?? 'Author'}</b></span>
                            </li>
                            <li>
                                <span>Total Comments</span>
                                <span><b>${post?.commentCount ?? 0}</b></span>
                            </li>
                            <li>
                                <span>Score</span>
                                <span><b>${post?.score ?? 0}</b></span>
                            </li>
                            <li>
                                <span>Views Count</span>
                                <span><b>${post?.viewsCount ?? 0}</b></span>
                            </li>
                            <li>
                                <span>Up Vote Ratio</span>
                                <span><b>${post?.upvoteRatio ?? 0}</b></span>
                            </li>`;
            }
        }

        function postsGridContent(post = {}, index = 1) {
            return `<div class="col-xl-4">
                <div class="card">
                    <div class="d-flex align-items-center p-4">
                        ${SELECTED_PLATFORM !== 'instagram' ? `<div class="symbol symbol-40 symbol-light-success mr-5">
                            <img src="${PROFILES[post?.page_user_name] ?? '../media/svg/avatars/018-girl-9.svg'}" class="h-75 align-self-end" alt="" onerror="this.onerror=null;this.src='../media/icons/user.png';"></div>` :
                `<div class="iframe-container"><iframe src="https://img5.imginn.org/?${PROFILES[post?.page_user_name]}" title="Logo" scrolling="no" frameborder="0"></iframe></div>`}

                        <div class="d-flex flex-column flex-grow-1 ${SELECTED_PLATFORM === 'instagram' ? 'pl-5' : ''}">
                            <a href="javascript:;" class="text-hover-primary mb-1 font-size-lg font-weight-bolder">${SELECTED_PLATFORM === 'youtube' ? post?.page_display_name ?? 'Name' : post?.page_user_name ?? 'Name'}</a>
                            <span class="font-weight-bold">${post?.dateCreated ?? moment()}</span>
                        </div>
                    </div>
                    <div class="px-4 top-posts-cards mb-5">
                        <p style="min-height: 40px">${postBreakDown(post?.description ?? post?.caption ?? post?.title ?? 'Description', index)}</p>
                        ${SELECTED_PLATFORM === 'instagram' ?
                `<span class="iframe-container top-posts-image"> <iframe  src="https://img5.imginn.org/?${post?.mediaUrl}" title="Logo" scrolling="no" frameborder="0"></iframe></span>` :
                `<img src="${['twitter', 'youtube'].includes(SELECTED_PLATFORM) ? post?.mediaUrl ?? `../media/grid-image${index + 1}.jpg` : post?.mediaURL?.[0] ?? `../media/grid-image${index + 1}.jpg`}" alt="Default Banner" onerror="this.onerror=null;this.src='../media/grid-image${index + 1}.jpg';">`
            }
                    </div>
                    <div class="px-4 analytic-post-card mb-5">
                        <ul>
                            ${postDetailsList(post)}
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
                    beforeSend: () => {
                        $('#updatingId').css('display', 'block');
                    },
                    success: (response) => {
                        //    Add Ranking Div
                        $('#updatingId').css('display', 'none'); // Hide the Updating conent Text.
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
