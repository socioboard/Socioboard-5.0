'use strict';

SocioboardApp.controller('FacebookreportController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        $scope.lstProfiles = $rootScope.lstProfiles;
        facebookreport();
        $scope.fetchdatacomplete = 'hide';
        $scope.chart1Data = [];
        $scope.chart2Data = [];
        $scope.graphData = [];


        $scope.GetFacebookPagePostData = function (profileId, days) {
            debugger;
            //codes to load  fb page post data
            $http.get(apiDomain + '/api/FacaebookPageReports/GetFacebookPagePostData?profileId=' + profileId + '&daysCount=' + days)
                        .then(function (response) {
                            $scope.FacebookPagePost = response.data;
                            console.log('facebook page post data');
                            $scope.fetchdatacomplete = 'show';
                            console.log($scope.FacebookPagePost);
                        }, function (reason) {
                            $scope.error = reason.data;
                        });
            // end codes to load fb page post profiles
        }


        $scope.getReports = function (profileId, days) {
            debugger;
            //codes to load  fb page profiles start
            $http.get(apiDomain + '/api/FacaebookPageReports/GetFacebookPageReportData?profileId=' + profileId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.dailyReportsList = response.data;
                              console.log("daily report data");
                              console.log($scope.dailyReportsList);
                              $scope.getTotalFans(days);
                              $scope.getData(profileId, days);
                              
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load fb page profiles

        }

        // addaed by me start for total fans
        $scope.getTotalFans = function (days) {

            $http.get(apiDomain + '/api/FacaebookPageReports/GetFbTotalFanpage?userId=' + $rootScope.user.Id + '&days=' + days)
            .then(function (response) {
                debugger;
                $scope.rep = response.data;
                $scope.totalfbLikes(days);
                $scope.totalfans(days);
                console.log("facebook account details");
                console.log(response.data);
            }, function (reason) {
                debugger;
                $scope.error = reason.data;
            });
        }
        //addaed by me end for total fans


        $scope.getData = function (profileId, days) {
            $scope.GetFacebookPagePostData(profileId, days);
           // $scope.totalfans(days);
            debugger;   
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            var endDate = Date.now() / 1000;
            var totalLikes = 0;
            var talkingAbout = 0;
            var newFans = 0;
            var unliked = 0;
            var impressions = 0;
            var usersBy = 0;
            var impressionsByAgeMaleFollower = 0;
            var impressionsByAgeFemaleFollower = 0;
            var storyByAgeMaleFollower = 0;
            var storyByAgeFemaleFollower = 0;
            var storiesCreated = 0;
            var sharingByAgeMaleFollower = 0;
            var sharingByAgeFemaleFollower = 0;
            var impressionsMaleper = 0;
            var impressionsFemaleper = 0;
            var sharingMaleper = 0;
            var sharingperFemaleper = 0;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.date > startDate) {
                    totalLikes = totalLikes + parseInt(value.totalLikes);
                    talkingAbout = talkingAbout + parseInt(value.talkingAbout);
                    newFans = newFans + parseInt(value.likes);
                    unliked = unliked + parseInt(value.unlikes);
                    impressions = impressions + parseInt(value.impression);
                    usersBy = usersBy + parseInt(value.uniqueUser);
                    impressionsMaleper = impressionsMaleper + parseInt(value.m_13_17) + parseInt(value.m_18_24) + parseInt(value.m_25_34) + parseInt(value.m_35_44) + parseInt(value.m_45_54) + parseInt(value.m_55_64) + parseInt(value.m_65);
                    impressionsFemaleper = impressionsFemaleper + parseInt(value.f_13_17) + parseInt(value.f_18_24) + parseInt(value.f_25_34) + parseInt(value.f_35_44) + parseInt(value.f_45_54) + parseInt(value.f_55_64) + parseInt(value.f_65);
                    storiesCreated = storiesCreated + parseInt(value.storyShare);
                    sharingMaleper = sharingMaleper + parseInt(value.sharing_M_13_17) + parseInt(value.sharing_M_18_24) + parseInt(value.sharing_M_25_34) + parseInt(value.sharing_M_35_44) + parseInt(value.sharing_M_45_54) + parseInt(value.sharing_M_55_64) + parseInt(value.sharing_M_65);
                    sharingperFemaleper = sharingperFemaleper + parseInt(value.sharing_F_13_17) + parseInt(value.sharing_F_18_24) + parseInt(value.sharing_F_25_34) + parseInt(value.sharing_F_35_44) + parseInt(value.sharing_F_45_54) + parseInt(value.sharing_F_55_64) + parseInt(value.sharing_F_65);
                }
            });
            impressionsByAgeMaleFollower = ((impressionsMaleper * 100) / (impressionsMaleper + impressionsFemaleper))
            if (impressionsFemaleper != 0) {

                impressionsByAgeFemaleFollower = (100 - impressionsByAgeMaleFollower);

            }
            else {
                impressionsByAgeFemaleFollower = 0;
            }
            sharingByAgeMaleFollower = ((sharingMaleper * 100) / (sharingMaleper + sharingperFemaleper))
            if (sharingperFemaleper != 0) {

                sharingByAgeFemaleFollower = (100 - sharingByAgeMaleFollower);

            }
            else {
                sharingByAgeFemaleFollower = 0;
            }
            $scope.fromDate = moment(new Date((startDate * 1000))).format('YYYY/MM/DD');
            $scope.toDate = moment(new Date((endDate * 1000))).format('YYYY/MM/DD');
            $scope.totalLikes = totalLikes;
            $scope.talkingAbout = talkingAbout;
            $scope.newFans = newFans;
            $scope.unliked = unliked;
            $scope.impressions = impressions;
            $scope.usersBy = usersBy;
            $scope.storiesCreated = storiesCreated;
            $scope.impressionsByAgeMaleFollower = impressionsByAgeMaleFollower;
            $scope.impressionsByAgeFemaleFollower = impressionsByAgeFemaleFollower;
            $scope.sharingByAgeMaleFollower = sharingByAgeMaleFollower;
            $scope.sharingByAgeFemaleFollower = sharingByAgeFemaleFollower;
            $scope.generateIMPRESSIONS1Graph(days);
            $scope.generateIMPRESSIONS2Graph(days);
            $scope.generateIMPRESSIONSmalefemaleGraph(days);
            $scope.generateStoryGraph(days);
            $scope.generatesharetypeGraph(days);
            $scope.generatesharebygenderGraph(days);
            $scope.generatePAGEIMPRESSIONSGraph(days);
            $scope.generatePageLikeUnlikeGraph(days);
            $scope.GetFacebookPagePostData(profileId, days);
            $scope.engagement(days);
            $scope.totalfbLikes(days);
            $scope.totalfans(days);

        }

        $scope.getOnPageLoadReports = function () {
            debugger;
            var canContinue = true;
            angular.forEach($rootScope.lstProfiles, function (value, key) {
                if (canContinue && value.profileType == 1) {
                    $scope.getReports(value.profileId, 90)
                    $scope.selectedProfile = value.profileId;
                    canContinue = false;
                }
            });
        }

        $scope.getOnPageLoadReports();

        $scope.generateIMPRESSIONS1Graph = function (days) {
            $scope.generateChart1Data(days);
            var chart = AmCharts.makeChart("BREAKDOWN_1", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.chart1Data,
                "valueAxes": [{
                    "integersOnly": true,
                    "maximum": 6,
                    "minimum": 1,
                    "reversed": false,
                    "axisAlpha": 0,
                    "dashLength": 5,
                    "gridCount": 10,
                    "position": "left"
                }],
                "startDuration": 0.5,
                "graphs": [{
                    "balloonText": "Events : [[value]]",
                    "bullet": "round",
                    "hidden": true,
                    "title": "Event",
                    "valueField": "Event",
                    "fillAlphas": 0
                }, {
                    "balloonText": "checkins : [[value]]",
                    "bullet": "round",
                    "title": "checkin",
                    "valueField": "checkin",
                    "fillAlphas": 0
                }, {
                    "balloonText": "fans : [[value]]",
                    "bullet": "round",
                    "title": "fans",
                    "valueField": "fans",
                    "fillAlphas": 0
                }, {
                    "balloonText": "mention : [[value]]",
                    "bullet": "round",
                    "title": "mention",
                    "valueField": "mention",
                    "fillAlphas": 0
                }, {
                    "balloonText": "other : [[value]]",
                    "bullet": "round",
                    "title": "other",
                    "valueField": "other",
                    "fillAlphas": 0
                }, {
                    "balloonText": "pagePost : [[value]]",
                    "bullet": "round",
                    "title": "pagePost",
                    "valueField": "pagePost",
                    "fillAlphas": 0
                }, {
                    "balloonText": "question : [[value]]",
                    "bullet": "round",
                    "title": "question",
                    "valueField": "question",
                    "fillAlphas": 0
                }, {
                    "balloonText": "userPost : [[value]]",
                    "bullet": "round",
                    "title": "userPost",
                    "valueField": "userPost",
                    "fillAlphas": 0
                }
                ],
                "chartCursor": {
                    "cursorAlpha": 0,
                    "zoomable": false
                },
                "categoryField": "date",
                "categoryAxis": {
                    "gridPosition": "start",
                    "axisAlpha": 0,
                    "fillAlpha": 0.05,
                    "fillColor": "#000000",
                    "gridAlpha": 0,
                    "position": "bottom",
                    "parseDates": true,
                },
                "export": {
                    "enabled": true,
                    "position": "bottom-right"
                }
            });
        }
        $scope.generateChart1Data = function (days) {
            $scope.chart1Data = [];
            var impressionFans = 0;
            var impressionPagePost = 0;
            var impressionuserPost = 0;
            var impressionOther = 0;
            var impressionMention = 0;
            var impressionCheckin = 0;
            var impressionQuestion = 0;
            var impressionEvent = 0;
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.date > startDate) {
                    impressionFans = impressionFans + value.impressionFans
                    impressionPagePost = impressionPagePost + value.impressionPagePost;
                    impressionuserPost = impressionuserPost + value.impressionuserPost;
                    impressionOther = impressionOther + value.impressionOther;
                    impressionMention = impressionMention + value.impressionMention;
                    impressionCheckin = impressionCheckin + value.impressionCheckin;
                    impressionQuestion = impressionQuestion + value.impressionQuestion;
                    impressionEvent = impressionEvent + value.impressionEvent;


                    $scope.chart1Data.push({
                        fans: value.impressionFans,
                        pagePost: value.impressionPagePost,
                        userPost: value.impressionuserPost,
                        other: value.impressionOther,
                        mention: value.impressionMention,
                        checkin: value.impressionCheckin,
                        question: value.impressionQuestion,
                        Event: value.impressionEvent,
                        date: new Date((value.date * 1000)),
                    });

                }
            });

            console.log('chart1Data');
            console.log($scope.chart1Data);


        }

        $scope.generateIMPRESSIONS2Graph = function (days) {
            $scope.generate2ChartData(days);

            console.log('chart2 data');
            console.log($scope.chart2Data);

            var chart = AmCharts.makeChart("BREAKDOWN_2", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.chart2Data,
                "valueAxes": [{
                    "integersOnly": true,
                    "maximum": 6,
                    "minimum": 1,
                    "reversed": false,
                    "axisAlpha": 0,
                    "dashLength": 5,
                    "gridCount": 10,
                    "position": "left"
                }],
                "startDuration": 0.5,
                "graphs": [{
                    "balloonText": "organic : [[value]]",
                    "bullet": "round",
                    "hidden": true,
                    "title": "organic",
                    "valueField": "organic",
                    "fillAlphas": 0
                }, {
                    "balloonText": "paid : [[value]]",
                    "bullet": "round",
                    "title": "paid",
                    "valueField": "paid",
                    "fillAlphas": 0
                }, {
                    "balloonText": "viral : [[value]]",
                    "bullet": "round",
                    "title": "viral",
                    "valueField": "viral",
                    "fillAlphas": 0
                }],
                "chartCursor": {
                    "cursorAlpha": 0,
                    "zoomable": false
                },
                "categoryField": "date",
                "categoryAxis": {
                    "gridPosition": "start",
                    "axisAlpha": 0,
                    "fillAlpha": 0.05,
                    "fillColor": "#000000",
                    "gridAlpha": 0,
                    "position": "bottom",
                    "parseDates": true,
                },
                "export": {
                    "enabled": true,
                    "position": "bottom-right"
                }
            });
        }

        $scope.generate2ChartData = function (days) {
            $scope.chart2Data = [];
            var organic = 0;
            var viral = 0;
            var paid = 0;

            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.date > startDate) {
                    organic = organic + parseInt(value.organic);
                    viral = viral + parseInt(value.viral);
                    paid = paid + parseInt(value.paid);


                    $scope.chart2Data.push({
                        organic: organic,
                        viral: viral,
                        paid: paid,
                        date: new Date((value.date * 1000))
                    });

                }
            });
        }

        // male & female
        $scope.generateIMPRESSIONSmalefemaleGraph = function (days) {
            $scope.generateimpressionmalefemaleChartData(days);

            var chart = AmCharts.makeChart("male_female", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.chartImpressionMaleFemaleGraphData,
                "synchronizeGrid": true,
                "valueAxes": [{
                    "id": "v1",
                    "axisColor": "#FF6600",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "left"
                }, {
                    "id": "v2",
                    "axisColor": "#FCD202",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "right"
                }],
                "graphs": [{
                    "valueAxis": "v1",
                    "lineColor": "#FF6600",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "male",
                    "valueField": "male",
                    "fillAlphas": 0
                }, {
                    "valueAxis": "v2",
                    "lineColor": "#FCD202",
                    "bullet": "square",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "female",
                    "valueField": "female",
                    "fillAlphas": 0
                }],
                "chartScrollbar": {},
                "chartCursor": {
                    "cursorPosition": "mouse"
                },
                "categoryField": "date",
                "categoryAxis": {
                    "parseDates": true,
                    "axisColor": "#DADADA",
                    "minorGridEnabled": true
                },
                "export": {
                    "enabled": true,
                    "position": "bottom-right"
                }
            });
        }

        $scope.chartImpressionMaleFemaleGraphData = [];
        $scope.generateimpressionmalefemaleChartData = function (days) {
            var m_13_17 = 0;
            var m_18_24 = 0;
            var m_25_34 = 0;
            var m_35_44 = 0;
            var m_45_54 = 0;
            var m_55_64 = 0;
            var m_65 = 0;
            var f_13_17 = 0;
            var f_18_24 = 0;
            var f_25_34 = 0;
            var f_35_44 = 0;
            var f_45_54 = 0;
            var f_55_64 = 0;
            var f_65 = 0;
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.date > startDate) {
                    m_13_17 = m_13_17 + value.m_13_17
                    m_18_24 = m_18_24 + value.m_18_24;
                    m_25_34 = m_25_34 + value.m_25_34;
                    m_35_44 = m_35_44 + value.m_35_44
                    m_45_54 = m_45_54 + value.m_45_54;
                    m_55_64 = m_55_64 + value.m_55_64;
                    m_65 = m_65 + value.m_65
                    f_13_17 = f_13_17 + value.f_13_17;
                    f_18_24 = f_18_24 + value.f_18_24;
                    f_25_34 = f_25_34 + value.f_25_34
                    f_35_44 = f_35_44 + value.f_35_44;
                    f_45_54 = f_45_54 + value.f_45_54;
                    f_55_64 = f_55_64 + value.f_55_64;
                    f_65 = f_65 + value.f_65;


                    $scope.chartImpressionMaleFemaleGraphData.push({
                        female: parseInt(value.f_13_17) + parseInt(value.f_18_24) + parseInt(value.f_25_34) + parseInt(value.f_35_44) + parseInt(value.f_45_54) + parseInt(value.f_55_64) + parseInt(value.f_65),
                        male: parseInt(value.m_13_17) + parseInt(value.m_18_24) + parseInt(value.m_25_34) + parseInt(value.m_35_44) + parseInt(value.m_45_54) + parseInt(value.m_55_64) + parseInt(value.m_65),
                        date: new Date((value.date * 1000))
                    });

                }
            });

            $scope.m_13_17 = m_13_17;
            $scope.m_18_24 = m_18_24;
            $scope.m_25_34 = m_25_34;
            $scope.m_35_44 = m_35_44;
            $scope.m_45_54 = m_45_54;
            $scope.m_55_64 = m_55_64;
            $scope.m_65 = m_65;
            $scope.f_13_17 = f_13_17;
            $scope.f_18_24 = f_18_24;
            $scope.f_25_34 = f_25_34;
            $scope.f_35_44 = f_35_44;
            $scope.f_45_54 = f_45_54;
            $scope.f_55_64 = f_55_64;
            $scope.f_65 = f_65;
        }




        $scope.generatePAGEIMPRESSIONSGraph = function (days) {
            $scope.generatepageimressionChartData(days);
            var chart = AmCharts.makeChart("PAGEIMPRESSIONS", {
                "type": "serial",
                "theme": "light",
                // "pathToImages": Metronic.getGlobalPluginsPath() + "amcharts/amcharts/images/",
                "autoMargins": false,
                "marginLeft": 30,
                "marginRight": 8,
                "marginTop": 10,
                "marginBottom": 26,

                "fontFamily": 'Open Sans',
                "color": '#888',

                "dataProvider": $scope.chartimpressionData,
                "valueAxes": [{
                    "axisAlpha": 0,
                    "position": "left"
                }],
                "startDuration": 1,
                "graphs": [{
                    "alphaField": "alpha",
                    "balloonText": "<span style='font-size:13px;'>[[title]] in [[category]]:<b>[[value]]</b> [[additional]]</span>",
                    "dashLengthField": "dashLengthColumn",
                    "fillAlphas": 1,
                    "title": "impression",
                    "type": "column",
                    "valueField": "impression"
                }],
                "categoryField": "date",
                "categoryAxis": {
                    "parseDates": true,
                    "gridPosition": "start",
                    "axisAlpha": 0,
                    "tickLength": 0
                }
            });

        }
        $scope.generatepageimressionChartData = function (days) {
            $scope.chartimpressionData = [];

            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                $scope.chartimpressionData.push({
                    date: new Date((value.date * 1000)),
                    impression: value.perDayImpression
                });
            });
        }

        $scope.chartlikeunlikeData = [];
        $scope.generatePageLikeUnlikeGraph = function (days) {
            $scope.generatefacebookpageLikeUnlikeGraph(days);

            var chart = AmCharts.makeChart("MyFacebookPages", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.chartlikeunlikeData,
                "synchronizeGrid": true,
                "valueAxes": [{
                    "id": "v1",
                    "axisColor": "#FF6600",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "left"
                }, {
                    "id": "v2",
                    "axisColor": "#FCD202",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "right"
                }],
                "graphs": [{
                    "valueAxis": "v1",
                    "lineColor": "#FF6600",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "like",
                    "valueField": "like",
                    "fillAlphas": 0
                }, {
                    "valueAxis": "v2",
                    "lineColor": "#FCD202",
                    "bullet": "square",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "unlike",
                    "valueField": "unlike",
                    "fillAlphas": 0
                }],
                "chartScrollbar": {},
                "chartCursor": {
                    "cursorPosition": "mouse"
                },
                "categoryField": "date",
                "categoryAxis": {
                    "parseDates": true,
                    "axisColor": "#DADADA",
                    "minorGridEnabled": true
                },
                "export": {
                    "enabled": true,
                    "position": "bottom-right"
                }
            });


        }
        $scope.generatefacebookpageLikeUnlikeGraph = function (days) {

            $scope.chartlikeunlikeData = [];
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                $scope.chartlikeunlikeData.push({
                    date: new Date((value.date * 1000)),
                    like: value.perDayLikes,
                    unlike: value.perDayUnlikes
                });
            });

        }


        //engagement start
        var chartData = generatechartData();

        function generatechartData() {
            var chartData = [];
            var firstDate = new Date();
            firstDate.setDate(firstDate.getDate() - 150);

            for (var i = 0; i < 150; i++) {
                // we create date objects here. In your data, you can have date strings
                // and then set format of your dates using chart.dataDateFormat property,
                // however when possible, use date objects, as this will speed up chart rendering.
                var newDate = new Date(firstDate);
                newDate.setDate(newDate.getDate() + i);

                var visits = Math.round(Math.random() * 90 - 45);

                chartData.push({
                    date: newDate,
                    visits: visits
                });
            }
            return chartData;
        }

        // added for page info: start
       // $scope.chartlikes = [];
        $scope.totalfbLikes = function (days) {
            debugger;
            $scope.generateChartforlikes(days);
            console.log("likes data start");
            console.log($scope.chartlikes);
        var chart = AmCharts.makeChart("rate_activity", {
            "theme": "light",
            "type": "serial",
            "dataProvider": $scope.chartlikes,
            "valueAxes": [{
                "inside": true,
                "axisAlpha": 0
            }],
            "graphs": [{
                "id": "g1",
                "balloonText": "<div style='margin:5px; font-size:19px;'><span style='font-size:13px;'>[[category]]</span><br>[[value]]</div>",
                "bullet": "round",
                "bulletBorderAlpha": 1,
                "bulletBorderColor": "#FFFFFF",
                "hideBulletsCount": 50,
                "lineThickness": 2,
                "lineColor": "#fdd400",
                "negativeLineColor": "#67b7dc",
                "valueField": "totalLikes"
            }],
            "chartScrollbar": {

            },
            "chartCursor": {},
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "axisAlpha": 0,
                "minHorizontalGap": 55
            },
            "listeners": [{
                "event": "dataUpdated",
                "method": function () {
                    if (chart) {
                        if (chart.zoomToIndexes) {
                            chart.zoomToIndexes(130, chartData.length - 1);
                        }
                    }
                }
            }]
        });
     }

        $scope.generateChartforlikes = function (days) {
            debugger;
            $scope.chartlikes = [];
            var totalLikes = 0;
            var talkingAbout = 0;
            //var paid = 0;

            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.rep, function (value, key) {
                if (value.date > startDate) {
                    totalLikes = totalLikes + parseInt(value.totalLikes);
                    talkingAbout = talkingAbout + parseInt(value.talkingAbout);
                    $scope.chartlikes.push({
                        date: new Date((value.date * 1000)),
                        totalLikes: value.totalLikes
                    });

                }
            });
            console.log("fanpage likes");
            console.log($scope.chartlikes);
        }

        //engagement end

        //total no of fans start:
        $scope.chartFBfanpage = [];

        $scope.totalfans = function (days) {
            debugger;
            $scope.generateChartTotalFan(days);
            // 3d graph  start
            var chart = AmCharts.makeChart("FBTotalFans", {
                "theme": "light",
                "type": "serial",
                "startDuration": 2,
                "dataProvider": $scope.chartFBfanpage,
                //"dataProvider": [{
                //    "country": "USA",
                //    "visits": 4025,
                //    "color": "#FF0F00"
                //}, {
                //    "country": "China",
                //    "visits": 1882,
                //    "color": "#FF6600"
                //}, {
                //    "country": "Japan",
                //    "visits": 1809,
                //    "color": "#FF9E01"
                //}, {
                //    "country": "Germany",
                //    "visits": 1322,
                //    "color": "#FCD202"
                //}, {
                //    "country": "UK",
                //    "visits": 1122,
                //    "color": "#F8FF01"
                //}, {
                //    "country": "France",
                //    "visits": 1114,
                //    "color": "#B0DE09"
                //}, {
                //    "country": "India",
                //    "visits": 984,
                //    "color": "#04D215"
                //}, {
                //    "country": "Spain",
                //    "visits": 711,
                //    "color": "#0D8ECF"
                //}, {
                //    "country": "Netherlands",
                //    "visits": 665,
                //    "color": "#0D52D1"
                //}, {
                //    "country": "Russia",
                //    "visits": 580,
                //    "color": "#2A0CD0"
                //}, {
                //    "country": "South Korea",
                //    "visits": 443,
                //    "color": "#8A0CCF"
                //}, {
                //    "country": "Canada",
                //    "visits": 441,
                //    "color": "#CD0D74"
                //}, {
                //    "country": "Brazil",
                //    "visits": 395,
                //    "color": "#754DEB"
                //}, {
                //    "country": "Italy",
                //    "visits": 386,
                //    "color": "#DDDDDD"
                //}, {
                //    "country": "Taiwan",
                //    "visits": 338,
                //    "color": "#333333"
                //}],//$scope.chartFBfanpage,     
                "valueAxes": [{
                    "position": "left",
                    "axisAlpha": 0,
                    "gridAlpha": 0
                }],
                "graphs": [{
                    "balloonText": "[[category]]: <b>[[value]]</b>",
                    "colorField": "color",
                    "fillAlphas": 0.85,
                    "lineAlpha": 0.1,
                    "type": "column",
                    "topRadius": 1,
                    "valueField": "totalLikes"
                }],
                "depth3D": 40,
                "angle": 30,
                "chartCursor": {
                    "categoryBalloonEnabled": false,
                    "cursorAlpha": 0,
                    "zoomable": false
                },
                "categoryField": "date",
                "categoryAxis": {                  
                   "gridPosition": "start",
                    "axisAlpha": 0,
                    "gridAlpha": 0,
                    "parseDates": true
                },
                "export": {
                    "enabled": true,
                  //  "position": "bottom-right"
                }

            }, 0);
            //3d graph end
        }

        $scope.generateChartTotalFan = function (days) {
            debugger;
            $scope.chartFBfanpage = [];
            var totalLikes = 0;
            //var viral = 0;
            //var paid = 0;
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.rep, function (value, key) {
                if (value.date > startDate) {
                    //totalLikes = totalLikes + parseInt(value.totalLikes);
                    totalLikes = value.totalLikes;
                    //viral = viral + parseInt(value.FbUserName);
                    //Date : paid + parseInt(value.paid);
                    $scope.chartFBfanpage.push({
                        date: new Date((value.date * 1000)),
                        totalLikes: value.totalLikes
                    });

                }
            });
        }
        //total no of fans end:

        
      
        


        // stories graph
        $scope.generateStoryGraph = function (days) {
            $scope.generatestoryGraph(days);


            var chart = AmCharts.makeChart("FacebookStories", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.chartstoryData,
                "synchronizeGrid": true,
                "valueAxes": [{
                    "id": "v1",
                    "axisColor": "#FF6600",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "left"
                }],
                "graphs": [{
                    "valueAxis": "v1",
                    "lineColor": "#FF6600",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "story",
                    "valueField": "story",
                    "fillAlphas": 0
                }],
                "chartScrollbar": {},
                "chartCursor": {
                    "cursorPosition": "mouse"
                },
                "categoryField": "date",
                "categoryAxis": {
                    "parseDates": true,
                    "axisColor": "#DADADA",
                    "minorGridEnabled": true
                },
                "export": {
                    "enabled": true,
                    "position": "bottom-right"
                }
            });

        }
        $scope.generatestoryGraph = function (days) {
            $scope.chartstoryData = [];

            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                $scope.chartstoryData.push({
                    date: new Date((value.date * 1000)),
                    story: value.storyShare
                });
            });


        }
        // SHARE TYPE
        $scope.generatesharetypeGraph = function (days) {
            $scope.generatesharechart(days);

            console.log('ShareType');
            console.log($scope.chartshareData);

            var chart = AmCharts.makeChart("ShareType", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.chartshareData,
                "valueAxes": [{
                    "integersOnly": true,
                    "maximum": 6,
                    "minimum": 1,
                    "reversed": false,
                    "axisAlpha": 0,
                    "dashLength": 5,
                    "gridCount": 10,
                    "position": "left"
                }],
                "startDuration": 0.5,
                "graphs": [{
                    "balloonText": "checkin : [[value]]",
                    "bullet": "round",
                    "hidden": true,
                    "title": "checkin",
                    "valueField": "sharecheckin",
                    "fillAlphas": 0
                }, {
                    "balloonText": "event : [[value]]",
                    "bullet": "round",
                    "title": "event",
                    "valueField": "shareevent",
                    "fillAlphas": 0
                }, {
                    "balloonText": "fans : [[value]]",
                    "bullet": "round",
                    "title": "fans",
                    "valueField": "sharefan",
                    "fillAlphas": 0
                }, {
                    "balloonText": "mention : [[value]]",
                    "bullet": "round",
                    "title": "mention",
                    "valueField": "sharementions",
                    "fillAlphas": 0
                }, {
                    "balloonText": "other : [[value]]",
                    "bullet": "round",
                    "title": "other",
                    "valueField": "shareother",
                    "fillAlphas": 0
                }, {
                    "balloonText": "pagePost : [[value]]",
                    "bullet": "round",
                    "title": "page post",
                    "valueField": "sharepagePost",
                    "fillAlphas": 0
                }, {
                    "balloonText": "question : [[value]]",
                    "bullet": "round",
                    "title": "question",
                    "valueField": "sharequestion",
                    "fillAlphas": 0
                }, {
                    "balloonText": "user post : [[value]]",
                    "bullet": "round",
                    "title": "user post",
                    "valueField": "shareuserPost",
                    "fillAlphas": 0
                }
                ],
                "chartCursor": {
                    "cursorAlpha": 0,
                    "zoomable": false
                },
                "categoryField": "date",
                "categoryAxis": {
                    "gridPosition": "start",
                    "axisAlpha": 0,
                    "fillAlpha": 0.05,
                    "fillColor": "#000000",
                    "gridAlpha": 0,
                    "position": "bottom",
                    "parseDates": true,
                },
                "export": {
                    "enabled": true,
                    "position": "bottom-right"
                }
            });
        }

        $scope.generatesharechart = function (days) {
            $scope.chartshareData = [];
            var story_Fans = 0;
            var story_PagePost = 0;
            var story_UserPost = 0;
            var story_Coupon = 0;
            var story_Other = 0;
            var story_Mention = 0;
            var story_Checkin = 0;
            var story_Question = 0;
            var story_Event = 0;

            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.date > startDate) {
                    story_Fans = story_Fans + value.story_Fans
                    story_PagePost = story_PagePost + value.story_PagePost;
                    story_UserPost = story_UserPost + value.story_UserPost;
                    story_Coupon = story_Coupon + value.story_Coupon
                    story_Other = story_Other + value.story_Other;
                    story_Mention = story_Mention + value.story_Mention;
                    story_Event = story_Event + value.story_Event
                    story_Question = story_Question + value.story_Question;
                    story_Checkin = story_Checkin + value.story_Checkin;




                    $scope.chartshareData.push({
                        sharefan: value.story_Fans,
                        sharepagepost: value.story_PagePost,
                        shareuserpost: value.story_UserPost,
                        shareother: value.story_Other,
                        sharementions: value.story_Mention,
                        shareevent: value.story_Event,
                        sharequestion: value.story_Question,
                        sharecheckin: value.story_Checkin,
                        date: new Date((value.date * 1000))
                    });
                }
            });


        }



        // sharing by age and gender
        $scope.generatesharebygenderGraph = function (days) {
            $scope.generatesharebygendermalefemaleGraph(days);

            var chart = AmCharts.makeChart("share_male_female", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.chartMaleFemaleGraphData,
                "synchronizeGrid": true,
                "valueAxes": [{
                    "id": "v1",
                    "axisColor": "#FF6600",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "left"
                }, {
                    "id": "v2",
                    "axisColor": "#FCD202",
                    "axisThickness": 2,
                    "axisAlpha": 1,
                    "position": "right"
                }],
                "graphs": [{
                    "valueAxis": "v1",
                    "lineColor": "#FF6600",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "male",
                    "valueField": "male",
                    "fillAlphas": 0
                }, {
                    "valueAxis": "v2",
                    "lineColor": "#FCD202",
                    "bullet": "square",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "female",
                    "valueField": "female",
                    "fillAlphas": 0
                }],
                "chartScrollbar": {},
                "chartCursor": {
                    "cursorPosition": "mouse"
                },
                "categoryField": "date",
                "categoryAxis": {
                    "parseDates": true,
                    "axisColor": "#DADADA",
                    "minorGridEnabled": true
                },
                "export": {
                    "enabled": true,
                    "position": "bottom-right"
                }
            });
       }

      

         $scope.chartMaleGraphData = [];
        $scope.chartFemaleGraphData = [];
        $scope.chartMaleFemaleGraphData = [];
        $scope.generatesharebygendermalefemaleGraph = function (days) {
         
            var sharing_m_13_17 = 0;
            var sharing_m_18_24 = 0;
            var sharing_m_25_34 = 0;
            var sharing_m_35_44 = 0;
            var sharing_m_45_54 = 0;
            var sharing_m_55_64 = 0;
            var sharing_m_65 = 0;
            var sharing_f_13_17 = 0;
            var sharing_f_18_24 = 0;
            var sharing_f_25_34 = 0;
            var sharing_f_35_44 = 0;
            var sharing_f_45_54 = 0;
            var sharing_f_55_64 = 0;
            var sharing_f_65 = 0;
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.date > startDate) {
                    sharing_m_13_17 = sharing_m_13_17 + value.sharing_M_13_17
                    sharing_m_18_24 = sharing_m_18_24 + value.sharing_M_18_24;
                    sharing_m_25_34 = sharing_m_25_34 + value.sharing_M_25_34;
                    sharing_m_35_44 = sharing_m_35_44 + value.sharing_M_35_44;
                    sharing_m_45_54 = sharing_m_45_54 + value.sharing_M_45_54;
                    sharing_m_55_64 = sharing_m_55_64 + value.sharing_M_55_64;
                    sharing_m_65 = sharing_m_65 + value.sharing_M_65


                    $scope.chartMaleGraphData.push({
                        sharing_m_13_17: value.sharing_M_13_17,
                        sharing_m_18_24: value.sharing_M_18_24,
                        sharing_m_25_34: value.sharing_M_25_34,
                        sharing_m_35_44: value.sharing_M_35_44,
                        sharing_m_45_54: value.sharing_M_45_54,
                        sharing_m_55_64: value.sharing_M_55_64,
                        sharing_m_65: value.sharing_M_65,
                        date: new Date((value.date * 1000))
                    });





                    sharing_f_13_17 = sharing_f_13_17 + value.sharing_F_13_17;
                    sharing_f_18_24 = sharing_f_18_24 + value.sharing_F_18_24;
                    sharing_f_25_34 = sharing_f_25_34 + value.sharing_F_25_34
                    sharing_f_35_44 = sharing_f_35_44 + value.sharing_F_35_44;
                    sharing_f_45_54 = sharing_f_45_54 + value.sharing_F_45_54;
                    sharing_f_55_64 = sharing_f_55_64 + value.sharing_F_55_64;
                    sharing_f_65 = sharing_f_65 + value.sharing_F_65;


                    $scope.chartFemaleGraphData.push({
                        sharing_f_13_17: value.sharing_F_13_17,
                        sharing_f_18_24: value.sharing_F_18_24,
                        sharing_f_25_34: value.sharing_F_25_34,
                        sharing_f_35_44: value.sharing_F_35_44,
                        sharing_f_45_54: value.sharing_F_45_54,
                        sharing_f_55_64: value.sharing_F_55_64,
                        sharing_f_65: value.sharing_F_65,
                        date: new Date((value.date * 1000))
                    });


                    $scope.chartMaleFemaleGraphData.push({
                        female: parseInt(value.sharing_F_13_17) + parseInt(value.sharing_F_18_24) + parseInt(value.sharing_F_25_34) + parseInt(value.sharing_F_35_44) + parseInt(value.sharing_F_45_54) + parseInt(value.sharing_F_55_64) + parseInt(value.sharing_F_65),
                        male: parseInt(value.sharing_M_13_17) + parseInt(value.sharing_M_18_24) + parseInt(value.sharing_M_25_34) + parseInt(value.sharing_M_35_44) + parseInt(value.sharing_M_45_54) + parseInt(value.sharing_M_55_64) + parseInt(value.sharing_M_65),
                        date: new Date((value.date * 1000))
                    });

                }
            });
            $scope.sharing_m_13_17 = sharing_m_13_17;
            $scope.sharing_m_18_24 = sharing_m_18_24;
            $scope.sharing_m_25_34 = sharing_m_25_34;
            $scope.sharing_m_35_44 = sharing_m_35_44;
            $scope.sharing_m_45_54 = sharing_m_45_54;
            $scope.sharing_m_55_64 = sharing_m_55_64;
            $scope.sharing_m_65 = sharing_m_65;
            $scope.sharing_f_13_17 = sharing_f_13_17;
            $scope.sharing_f_18_24 = sharing_f_18_24;
            $scope.sharing_f_25_34 = sharing_f_25_34;
            $scope.sharing_f_35_44 = sharing_f_35_44;
            $scope.sharing_f_45_54 = sharing_f_45_54;
            $scope.sharing_f_55_64 = sharing_f_55_64;
            $scope.sharing_f_65 = sharing_f_65;

            var maleShare = sharing_m_13_17 + sharing_m_18_24 + sharing_m_25_34 + sharing_m_35_44 + sharing_m_45_54 + sharing_m_55_64 + sharing_m_65;

            var femaleShare = sharing_f_13_17 + sharing_f_18_24 + sharing_f_25_34 + sharing_f_35_44 + sharing_f_45_54 + sharing_f_55_64 + sharing_f_65;
          
            //$scope.sharingByAgeMaleFollower = (maleShare * 100) / (maleShare + femaleShare);
            //$scope.sharingByAgeFemaleFollower = (femaleShare * 100) / (maleShare + femaleShare);




        }
    });

});

SocioboardApp.directive('myRepeatTabDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                $('select').material_select();


            });
        }
    };
})
