'use strict';

SocioboardApp.controller('GroupreportController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        groupreport();

        $scope.getReports = function (groupId, days) {
            //codes to load  fb page profiles start
            $http.get(apiDomain + '/api/GroupReport/getgroupReportData?groupId=' + $rootScope.groupId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.dailyReportsList = response.data;
                              $scope.getData(days);
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load fb page profiles

        }
        $scope.getOnPageLoadReports = function () {
                $scope.getReports($rootScope.groupId, 90)
        }

        $scope.getOnPageLoadReports();


        $scope.getData = function (days) {
            var inbox = 0;
            var sent = 0;
            var twitterfollower = 0;
            var fbfan = 0;
            var interaction = 0;
            var twtmentions = 0;
            var twtretweets = 0;
            var malecount = 0;
            var femalecount = 0;
            var uniqueusers = 0;
            var twitter_account_count = 0;
            var male = 0;
            var female = 0;
            var linkstoPages=    0;
            var   photoLinks =   0;
            var plainText = 0;
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            var endDate = Date.now() / 1000;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.date > startDate) {
                    inbox =inbox+ value.inbox;
                    sent = sent + value.sent;
                    twitterfollower = twitterfollower + value.twitterfollower;
                    fbfan = fbfan + value.fbfan;
                    interaction = interaction + value.interaction;
                    twtmentions = twtmentions + value.twtmentions;
                    twtretweets = twtretweets + value.twtretweets;
                    malecount = malecount + value.malecount;
                    femalecount = femalecount + value.femalecount;
                    uniqueusers = uniqueusers + valu.uniqueusers;
                    twitter_account_count = twitter_account_count + value.twitter_account_count;
                    linkstoPages = linkstoPages + value.linkstoPages;
                    photoLinks = photoLinks + value.photoLinks;
                    plainText = plainText + value.plainText;
                }
            });
            male = ((malecount * 100) / (malecount + femalecount))
            if (femalecount != 0) {

                female = (100 - male);

            }
            else {
                female = 0;
            }
             $scope.fromDate = moment(new Date((startDate * 1000))).format('YYYY/MM/DD');
            $scope.toDate = moment(new Date((endDate * 1000))).format('YYYY/MM/DD');
            $scope.inbox = inbox;
            $scope.sent = sent;
            $scope.twitterfollower = twitterfollower;
            $scope.fbfan = fbfan;
            $scope.interaction = interaction;
            $scope.twtmentions = twtmentions;
            $scope.twtretweets = twtretweets;
            $scope.malecount = malecount;
            $scope.femalecount = femalecount;
            $scope.uniqueusers = uniqueusers;
            $scope.twitter_account_count = twitter_account_count;
            $scope.linkstoPages = linkstoPages;
            $scope.photoLinks = photoLinks;
            $scope.plainText = plainText;
            $scope.getfacebookpageGroupReportData(days);
            $scope.getTwitterGroupReportData(days);
        }


        //facebook group report data
        $scope.getfacebookpageGroupReportData = function (groupId, days) {
            //codes to load  fb page profiles start
            $http.get(apiDomain + '/api/GroupReport/getfacebookpageGroupReportData?groupId=' + $rootScope.groupId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.generatefacebookGraphData = response.data;
                              $scope.generatefacebookGraph(days);
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load fb page profiles
        }

        $scope.generatefacebookGraph = function (days) {
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
            angular.forEach($scope.generatefacebookGraphData, function (value, key) {
                if (value.date > startDate) {
                    totalLikes = totalLikes + value.totalLikes;
                    talkingAbout = talkingAbout + value.talkingAbout;
                    newFans = newFans + value.likes;
                    unliked = unliked + value.unlikes;
                    impressions = impressions + value.impression;
                    usersBy = usersBy + value.uniqueUser;
                    impressionsMaleper = impressionsMaleper + value.m_13_17 + value.m_18_24 + value.m_25_34 + value.m_35_44 + value.m_45_54 + value.m_55_64 + value.m_65;
                    impressionsFemaleper = impressionsFemaleper + value.f_13_17 + value.f_18_24 + value.f_25_34 + value.f_35_44 + value.f_45_54 + value.f_55_64 + value.f_65;
                    storiesCreated = storiesCreated + value.storyShare;
                    sharingMaleper = sharingMaleper + value.sharing_M_13_17 + value.sharing_M_18_24 + value.sharing_M_25_34 + value.sharing_M_35_44 + value.sharing_M_45_54 + value.sharing_M_55_64 + value.sharing_M_65;
                    sharingperFemaleper = sharingperFemaleper + value.sharing_F_13_17 + value.sharing_F_18_24 + value.sharing_F_25_34 + value.sharing_F_35_44 + value.sharing_F_45_54 + value.sharing_F_55_64 + value.sharing_F_65;
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

        }
        //end facebook group report data



        //twitter group report data
        $scope.getTwitterGroupReportData = function (groupId, days) {
            //codes to load  fb page profiles start
            $http.get(apiDomain + '/api/GroupReport/getTwitterGroupReportData?groupId=' + $rootScope.groupId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.generatetwitterGraph = response.data;
                              $scope.generateGraph(days);
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load fb page profiles
        }

        $scope.generateGraph = function (days) {
            $scope.generateChartData(days);
            var chart = AmCharts.makeChart("DAILYENGAGEMENT", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.chartData,
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
                }, {
                    "id": "v3",
                    "axisColor": "#B0DE09",
                    "axisThickness": 2,
                    "gridAlpha": 0,
                    "offset": 50,
                    "axisAlpha": 1,
                    "position": "left"
                }],
                "graphs": [{
                    "valueAxis": "v1",
                    "lineColor": "#FF6600",
                    "bullet": "round",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "red line",
                    "valueField": "mentions",
                    "fillAlphas": 0
                }, {
                    "valueAxis": "v2",
                    "lineColor": "#FCD202",
                    "bullet": "square",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "yellow line",
                    "valueField": "retweets",
                    "fillAlphas": 0
                }, {
                    "valueAxis": "v3",
                    "lineColor": "#B0DE09",
                    "bullet": "triangleUp",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "green line",
                    "valueField": "followers",
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

        $scope.generateChartData = function (days) {
            $scope.chartData = [];
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.generatetwitterGraph, function (value, key) {
                if (value.timeStamp > startDate) {
                    $scope.chartData.push({
                        date: new Date((value.timeStamp * 1000)),
                        mentions: value.mentions,
                        retweets: value.retweets,
                        followers: value.newFollowers
                    });
                }
            });


        }
        //end twitter group report data





        $scope.sparkGraph = [5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7];
        // Project Line chart ( Project Box )
        $(".project-line-1").sparkline($scope.sparkGraph, {
            type: 'line',
            width: '100%',
            height: '30',
            lineWidth: 2,
            lineColor: '#00bcd4',
            fillColor: 'rgba(0, 188, 212, 0.5)',
        });

        // IMPRESSIONS BREAKDOWN //

        $scope.generateIMPRESSIONS1Graph = function (days) {
            $scope.generateChart1Data(days);
            var chart = AmCharts.makeChart("BREAKDOWN_1", {
                "type": "pie",
                "theme": "light",
                "path": "http://www.amcharts.com/lib/3/",
                "legend": {
                    "markerType": "circle",
                    "position": "right",
                    "marginRight": 80,
                    "autoMargins": false
                },
                "dataProvider": $scope.chart1Data,
                "valueField": "litres",
                "titleField": "country",
                "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
                "export": {
                    "enabled": true
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
                }
            });

            $scope.chart1Data.push({
                fans: impressionFans,
                pagePost: impressionPagePost,
                userPost: impressionuserPost,
                other: impressionOther,
                mention: impressionMention,
                checkin: impressionCheckin,
                question: impressionQuestion,
                Event: impressionEvent
            });


        }

        $scope.generateIMPRESSIONS2Graph = function (days) {
            $scope.generateChart2Data(days);
            var chart = AmCharts.makeChart("BREAKDOWN_2", {
                "type": "pie",
                "theme": "light",
                "path": "http://www.amcharts.com/lib/3/",
                "legend": {
                    "markerType": "circle",
                    "position": "right",
                    "marginRight": 80,
                    "autoMargins": false
                },
                "dataProvider": $scope.chart2Data,
                "valueField": "litres",
                "titleField": "country",
                "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]]</b> ([[percents]]%)</span>",
                "export": {
                    "enabled": true
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
                    organic = organic + value.organic
                    viral = viral + value.viral;
                    paid = paid + value.paid;
                }
            });

            $scope.chart2Data.push({
                organic: organic,
                viral: viral,
                paid: paid
            });


        }

        // male & female
        $scope.generateIMPRESSIONSmalefemaleGraph = function (days) {
            $scope.generateimpressionmalefemaleChartData(days);
            var chart = AmCharts.makeChart("male_female", {
                "type": "serial",
                "theme": "light",
                "path": "http://www.amcharts.com/lib/3/",
                "legend": {
                    "horizontalGap": 10,
                    "maxColumns": 1,
                    "position": "right",
                    "useGraphSettings": true,
                    "markerSize": 10
                },
                "dataProvider": [{
                    "age": 13 - 17,
                    "Male": $scope.m_13_17,
                    "Female": $scope.f_13_17,
                }, {
                    "age": 18 - 24,
                    "Male": $scope.m_18_24,
                    "Female": $scope.f_18_24,
                }, {
                    "age": 25 - 34,
                    "Male": $scope.m_25_34,
                    "Female": $scope.m_25_34,
                }, {
                    "age": 35 - 44,
                    "Male": $scope.m_35_44,
                    "Female": $scope.f_35_44,
                }, {
                    "year": 45 - 54,
                    "Male": $scope.m_45_54,
                    "Female": $scope.f_45_54,
                }, {
                    "age": 55 - 64,
                    "Male": $scope.m_55_64,
                    "Female": $scope.f_55_64,
                }, {
                    "age": 65,
                    "Male": $scope.m_65,
                    "Female": $scope.f_65,
                }],
                "valueAxes": [{
                    "stackType": "regular",
                    "axisAlpha": 0.5,
                    "gridAlpha": 0
                }],
                "graphs": [{
                    "balloonText": "<b>[[title]]</b><br><span style='font-size:24px'>[[category]]: <b>[[value]]</b></span>",
                    "fillAlphas": 0.8,
                    "labelText": "[[value]]",
                    "lineAlpha": 0.3,
                    "title": "Male (100)",
                    "type": "column",
                    "color": "#000000",
                    "valueField": "Male"
                }, {
                    "balloonText": "<b>[[title]]</b><br><span style='font-size:24px'>[[category]]: <b>[[value]]</b></span>",
                    "fillAlphas": 0.8,
                    "labelText": "[[value]]",
                    "lineAlpha": 0.3,
                    "title": "Female (99)",
                    "type": "column",
                    "color": "#000000",
                    "valueField": "Female"
                }],
                "rotate": true,
                "categoryField": "age",
                "categoryAxis": {
                    "gridPosition": "start",
                    "axisAlpha": 0,
                    "gridAlpha": 0,
                    "position": "left"
                },
                "export": {
                    "enabled": true
                }
            });
        }
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


        // world 

        var chart = AmCharts.makeChart("world", {
            "theme": "light",
            "type": "serial",
            "path": "http://www.amcharts.com/lib/3/",
            "dataProvider": [{
                "year": 2005,
                "income": 23.5
            }, {
                "year": 2006,
                "income": 26.2
            }, {
                "year": 2007,
                "income": 30.1
            }, {
                "year": 2008,
                "income": 29.5
            }, {
                "year": 2009,
                "income": 24.6
            }],
            "valueAxes": [{
                "title": "Income in millions, USD"
            }],
            "graphs": [{
                "balloonText": "Income in [[category]]:[[value]]",
                "fillAlphas": 1,
                "lineAlpha": 0.2,
                "title": "Income",
                "type": "column",
                "valueField": "income"
            }],
            "depth3D": 20,
            "angle": 30,
            "rotate": true,
            "categoryField": "year",
            "categoryAxis": {
                "gridPosition": "start",
                "fillAlpha": 0.05,
                "position": "left"
            },
            "export": {
                "enabled": true
            }
        });
        jQuery('.chart-input').off().on('input change', function () {
            var property = jQuery(this).data('property');
            var target = chart;
            chart.startDuration = 0;

            if (property == 'topRadius') {
                target = chart.graphs[0];
                if (this.value == 0) {
                    this.value = undefined;
                }
            }

            target[property] = this.value;
            chart.validateNow();
        });


        var chart = AmCharts.makeChart("DAILYENGAGEMENT", {
            "type": "serial",
            "theme": "light",
            "marginRight": 80,
            "autoMarginOffset": 20,
            "dataDateFormat": "YYYY-MM-DD",
            "valueAxes": [{
                "id": "v1",
                "axisAlpha": 0,
                "position": "left"
            }],
            "balloon": {
                "borderThickness": 1,
                "shadowAlpha": 0
            },
            "graphs": [{
                "id": "g1",
                "bullet": "round",
                "bulletBorderAlpha": 1,
                "bulletColor": "#FFFFFF",
                "bulletSize": 5,
                "hideBulletsCount": 50,
                "lineThickness": 2,
                "title": "red line",
                "useLineColorForBulletBorder": true,
                "valueField": "value",
                "balloonText": "<div style='margin:5px; font-size:19px;'><span style='font-size:13px;'>[[category]]</span><br>[[value]]</div>"
            }],
            "chartScrollbar": {
                "graph": "g1",
                "oppositeAxis": false,
                "offset": 30,
                "scrollbarHeight": 80,
                "backgroundAlpha": 0,
                "selectedBackgroundAlpha": 0.1,
                "selectedBackgroundColor": "#888888",
                "graphFillAlpha": 0,
                "graphLineAlpha": 0.5,
                "selectedGraphFillAlpha": 0,
                "selectedGraphLineAlpha": 1,
                "autoGridCount": true,
                "color": "#AAAAAA"
            },
            "chartCursor": {
                "pan": true,
                "valueLineEnabled": true,
                "valueLineBalloonEnabled": true,
                "cursorAlpha": 0,
                "valueLineAlpha": 0.2
            },
            "categoryField": "date",
            "categoryAxis": {
                "parseDates": true,
                "dashLength": 1,
                "minorGridEnabled": true
            },
            "export": {
                "enabled": true
            },
            "dataProvider": [{
                "date": "2012-07-27",
                "value": 13
            }, {
                "date": "2012-07-28",
                "value": 11
            }, {
                "date": "2012-07-29",
                "value": 15
            }, {
                "date": "2012-07-30",
                "value": 16
            }, {
                "date": "2012-07-31",
                "value": 18
            }, {
                "date": "2012-08-01",
                "value": 13
            }, {
                "date": "2012-08-02",
                "value": 22
            }, {
                "date": "2012-08-03",
                "value": 23
            }, {
                "date": "2012-08-04",
                "value": 20
            }, {
                "date": "2012-08-05",
                "value": 17
            }, {
                "date": "2012-08-06",
                "value": 16
            }, {
                "date": "2012-08-07",
                "value": 18
            }, {
                "date": "2012-08-08",
                "value": 21
            }, {
                "date": "2012-08-09",
                "value": 26
            }, {
                "date": "2012-08-10",
                "value": 24
            }, {
                "date": "2012-08-11",
                "value": 29
            }, {
                "date": "2012-08-12",
                "value": 32
            }, {
                "date": "2012-08-13",
                "value": 18
            }, {
                "date": "2012-08-14",
                "value": 24
            }, {
                "date": "2012-08-15",
                "value": 22
            }, {
                "date": "2012-08-16",
                "value": 18
            }, {
                "date": "2012-08-17",
                "value": 19
            }, {
                "date": "2012-08-18",
                "value": 14
            }, {
                "date": "2012-08-19",
                "value": 15
            }, {
                "date": "2012-08-20",
                "value": 12
            }, {
                "date": "2012-08-21",
                "value": 8
            }, {
                "date": "2012-08-22",
                "value": 9
            }, {
                "date": "2012-08-23",
                "value": 8
            }, {
                "date": "2012-08-24",
                "value": 7
            }, {
                "date": "2012-08-25",
                "value": 5
            }, {
                "date": "2012-08-26",
                "value": 11
            }, {
                "date": "2012-08-27",
                "value": 13
            }, {
                "date": "2012-08-28",
                "value": 18
            }, {
                "date": "2012-08-29",
                "value": 20
            }, {
                "date": "2012-08-30",
                "value": 29
            }, {
                "date": "2012-08-31",
                "value": 33
            }, {
                "date": "2012-09-01",
                "value": 42
            }, {
                "date": "2012-09-02",
                "value": 35
            }, {
                "date": "2012-09-03",
                "value": 31
            }, {
                "date": "2012-09-04",
                "value": 47
            }, {
                "date": "2012-09-05",
                "value": 52
            }, {
                "date": "2012-09-06",
                "value": 46
            }, {
                "date": "2012-09-07",
                "value": 41
            }, {
                "date": "2012-09-08",
                "value": 43
            }, {
                "date": "2012-09-09",
                "value": 40
            }, {
                "date": "2012-09-10",
                "value": 39
            }, {
                "date": "2012-09-11",
                "value": 34
            }, {
                "date": "2012-09-12",
                "value": 29
            }, {
                "date": "2012-09-13",
                "value": 34
            }, {
                "date": "2012-09-14",
                "value": 37
            }, {
                "date": "2012-09-15",
                "value": 42
            }, {
                "date": "2012-09-16",
                "value": 49
            }, {
                "date": "2012-09-17",
                "value": 46
            }, {
                "date": "2012-09-18",
                "value": 47
            }, {
                "date": "2012-09-19",
                "value": 55
            }, {
                "date": "2012-09-20",
                "value": 59
            }, {
                "date": "2012-09-21",
                "value": 58
            }, {
                "date": "2012-09-22",
                "value": 57
            }, {
                "date": "2012-09-23",
                "value": 61
            }, {
                "date": "2012-09-24",
                "value": 59
            }, {
                "date": "2012-09-25",
                "value": 67
            }, {
                "date": "2012-09-26",
                "value": 65
            }, {
                "date": "2012-09-27",
                "value": 61
            }, {
                "date": "2012-09-28",
                "value": 66
            }, {
                "date": "2012-09-29",
                "value": 69
            }, {
                "date": "2012-09-30",
                "value": 71
            }, {
                "date": "2012-10-01",
                "value": 67
            }, {
                "date": "2012-10-02",
                "value": 63
            }, {
                "date": "2012-10-03",
                "value": 46
            }, {
                "date": "2012-10-04",
                "value": 32
            }, {
                "date": "2012-10-05",
                "value": 21
            }, {
                "date": "2012-10-06",
                "value": 18
            }, {
                "date": "2012-10-07",
                "value": 21
            }, {
                "date": "2012-10-08",
                "value": 28
            }, {
                "date": "2012-10-09",
                "value": 27
            }, {
                "date": "2012-10-10",
                "value": 36
            }, {
                "date": "2012-10-11",
                "value": 33
            }, {
                "date": "2012-10-12",
                "value": 31
            }, {
                "date": "2012-10-13",
                "value": 30
            }, {
                "date": "2012-10-14",
                "value": 34
            }, {
                "date": "2012-10-15",
                "value": 38
            }, {
                "date": "2012-10-16",
                "value": 37
            }, {
                "date": "2012-10-17",
                "value": 44
            }, {
                "date": "2012-10-18",
                "value": 49
            }, {
                "date": "2012-10-19",
                "value": 53
            }, {
                "date": "2012-10-20",
                "value": 57
            }, {
                "date": "2012-10-21",
                "value": 60
            }, {
                "date": "2012-10-22",
                "value": 61
            }, {
                "date": "2012-10-23",
                "value": 69
            }, {
                "date": "2012-10-24",
                "value": 67
            }, {
                "date": "2012-10-25",
                "value": 72
            }, {
                "date": "2012-10-26",
                "value": 77
            }, {
                "date": "2012-10-27",
                "value": 75
            }, {
                "date": "2012-10-28",
                "value": 70
            }, {
                "date": "2012-10-29",
                "value": 72
            }, {
                "date": "2012-10-30",
                "value": 70
            }, {
                "date": "2012-10-31",
                "value": 72
            }, {
                "date": "2012-11-01",
                "value": 73
            }, {
                "date": "2012-11-02",
                "value": 67
            }, {
                "date": "2012-11-03",
                "value": 68
            }, {
                "date": "2012-11-04",
                "value": 65
            }, {
                "date": "2012-11-05",
                "value": 71
            }, {
                "date": "2012-11-06",
                "value": 75
            }, {
                "date": "2012-11-07",
                "value": 74
            }, {
                "date": "2012-11-08",
                "value": 71
            }, {
                "date": "2012-11-09",
                "value": 76
            }, {
                "date": "2012-11-10",
                "value": 77
            }, {
                "date": "2012-11-11",
                "value": 81
            }, {
                "date": "2012-11-12",
                "value": 83
            }, {
                "date": "2012-11-13",
                "value": 80
            }, {
                "date": "2012-11-14",
                "value": 81
            }, {
                "date": "2012-11-15",
                "value": 87
            }, {
                "date": "2012-11-16",
                "value": 82
            }, {
                "date": "2012-11-17",
                "value": 86
            }, {
                "date": "2012-11-18",
                "value": 80
            }, {
                "date": "2012-11-19",
                "value": 87
            }, {
                "date": "2012-11-20",
                "value": 83
            }, {
                "date": "2012-11-21",
                "value": 85
            }, {
                "date": "2012-11-22",
                "value": 84
            }, {
                "date": "2012-11-23",
                "value": 82
            }, {
                "date": "2012-11-24",
                "value": 73
            }, {
                "date": "2012-11-25",
                "value": 71
            }, {
                "date": "2012-11-26",
                "value": 75
            }, {
                "date": "2012-11-27",
                "value": 79
            }, {
                "date": "2012-11-28",
                "value": 70
            }, {
                "date": "2012-11-29",
                "value": 73
            }, {
                "date": "2012-11-30",
                "value": 61
            }, {
                "date": "2012-12-01",
                "value": 62
            }, {
                "date": "2012-12-02",
                "value": 66
            }, {
                "date": "2012-12-03",
                "value": 65
            }, {
                "date": "2012-12-04",
                "value": 73
            }, {
                "date": "2012-12-05",
                "value": 79
            }, {
                "date": "2012-12-06",
                "value": 78
            }, {
                "date": "2012-12-07",
                "value": 78
            }, {
                "date": "2012-12-08",
                "value": 78
            }, {
                "date": "2012-12-09",
                "value": 74
            }, {
                "date": "2012-12-10",
                "value": 73
            }, {
                "date": "2012-12-11",
                "value": 75
            }, {
                "date": "2012-12-12",
                "value": 70
            }, {
                "date": "2012-12-13",
                "value": 77
            }, {
                "date": "2012-12-14",
                "value": 67
            }, {
                "date": "2012-12-15",
                "value": 62
            }, {
                "date": "2012-12-16",
                "value": 64
            }, {
                "date": "2012-12-17",
                "value": 61
            }, {
                "date": "2012-12-18",
                "value": 59
            }, {
                "date": "2012-12-19",
                "value": 53
            }, {
                "date": "2012-12-20",
                "value": 54
            }, {
                "date": "2012-12-21",
                "value": 56
            }, {
                "date": "2012-12-22",
                "value": 59
            }, {
                "date": "2012-12-23",
                "value": 58
            }, {
                "date": "2012-12-24",
                "value": 55
            }, {
                "date": "2012-12-25",
                "value": 52
            }, {
                "date": "2012-12-26",
                "value": 54
            }, {
                "date": "2012-12-27",
                "value": 50
            }, {
                "date": "2012-12-28",
                "value": 50
            }, {
                "date": "2012-12-29",
                "value": 51
            }, {
                "date": "2012-12-30",
                "value": 52
            }, {
                "date": "2012-12-31",
                "value": 58
            }, {
                "date": "2013-01-01",
                "value": 60
            }, {
                "date": "2013-01-02",
                "value": 67
            }, {
                "date": "2013-01-03",
                "value": 64
            }, {
                "date": "2013-01-04",
                "value": 66
            }, {
                "date": "2013-01-05",
                "value": 60
            }, {
                "date": "2013-01-06",
                "value": 63
            }, {
                "date": "2013-01-07",
                "value": 61
            }, {
                "date": "2013-01-08",
                "value": 60
            }, {
                "date": "2013-01-09",
                "value": 65
            }, {
                "date": "2013-01-10",
                "value": 75
            }, {
                "date": "2013-01-11",
                "value": 77
            }, {
                "date": "2013-01-12",
                "value": 78
            }, {
                "date": "2013-01-13",
                "value": 70
            }, {
                "date": "2013-01-14",
                "value": 70
            }, {
                "date": "2013-01-15",
                "value": 73
            }, {
                "date": "2013-01-16",
                "value": 71
            }, {
                "date": "2013-01-17",
                "value": 74
            }, {
                "date": "2013-01-18",
                "value": 78
            }, {
                "date": "2013-01-19",
                "value": 85
            }, {
                "date": "2013-01-20",
                "value": 82
            }, {
                "date": "2013-01-21",
                "value": 83
            }, {
                "date": "2013-01-22",
                "value": 88
            }, {
                "date": "2013-01-23",
                "value": 85
            }, {
                "date": "2013-01-24",
                "value": 85
            }, {
                "date": "2013-01-25",
                "value": 80
            }, {
                "date": "2013-01-26",
                "value": 87
            }, {
                "date": "2013-01-27",
                "value": 84
            }, {
                "date": "2013-01-28",
                "value": 83
            }, {
                "date": "2013-01-29",
                "value": 84
            }, {
                "date": "2013-01-30",
                "value": 81
            }]
        });

        $scope.generatePAGEIMPRESSIONSGraph = function (days) {
            $scope.generatepageimressionChartData(days);
            var charts = function () {
                var chart = AmCharts.makeChart("PAGEIMPRESSIONS", {
                    "type": "serial",
                    "theme": "light",
                    "pathToImages": Metronic.getGlobalPluginsPath() + "amcharts/amcharts/images/",
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
                        "title": "Income",
                        "type": "column",
                        "valueField": "income"
                    }, {
                        "balloonText": "<span style='font-size:13px;'>[[title]] in [[category]]:<b>[[value]]</b> [[additional]]</span>",
                        "bullet": "round",
                        "dashLengthField": "dashLengthLine",
                        "lineThickness": 3,
                        "bulletSize": 7,
                        "bulletBorderAlpha": 1,
                        "bulletColor": "#FFFFFF",
                        "useLineColorForBulletBorder": true,
                        "bulletBorderThickness": 3,
                        "fillAlphas": 0,
                        "lineAlpha": 1,
                        "title": "Expenses",
                        "valueField": "expenses"
                    }],
                    "categoryField": "year",
                    "categoryAxis": {
                        "gridPosition": "start",
                        "axisAlpha": 0,
                        "tickLength": 0
                    }
                });
            }
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


        $scope.generatePageLikeUnlikeGraph = function (days) {
            $scope.generatefacebookpageLikeUnlikeGraph(days);
            var charts = function () {
                var chart = AmCharts.makeChart("MyFacebookPages", {
                    "type": "serial",
                    "theme": "light",

                    "fontFamily": 'Open Sans',
                    "color": '#888888',

                    "legend": {
                        "equalWidths": false,
                        "useGraphSettings": true,
                        "valueAlign": "left",
                        "valueWidth": 120
                    },
                    "dataProvider": $scope.chartlikeunlikeData,
                    "valueAxes": [{
                        "id": "distanceAxis",
                        "axisAlpha": 0,
                        "gridAlpha": 0,
                        "position": "left",
                        "title": "distance"
                    }, {
                        "id": "latitudeAxis",
                        "axisAlpha": 0,
                        "gridAlpha": 0,
                        "labelsEnabled": false,
                        "position": "right"
                    }, {
                        "id": "durationAxis",
                        "duration": "mm",
                        "durationUnits": {
                            "hh": "h ",
                            "mm": "min"
                        },
                        "axisAlpha": 0,
                        "gridAlpha": 0,
                        "inside": true,
                        "position": "right",
                        "title": "duration"
                    }],
                    "graphs": [{
                        "alphaField": "alpha",
                        "balloonText": "[[value]] miles",
                        "dashLengthField": "dashLength",
                        "fillAlphas": 0.7,
                        "legendPeriodValueText": "total: [[value.sum]] mi",
                        "legendValueText": "[[value]] mi",
                        "title": "distance",
                        "type": "column",
                        "valueField": "distance",
                        "valueAxis": "distanceAxis"
                    }, {
                        "balloonText": "latitude:[[value]]",
                        "bullet": "round",
                        "bulletBorderAlpha": 1,
                        "useLineColorForBulletBorder": true,
                        "bulletColor": "#FFFFFF",
                        "bulletSizeField": "townSize",
                        "dashLengthField": "dashLength",
                        "descriptionField": "townName",
                        "labelPosition": "right",
                        "labelText": "[[townName2]]",
                        "legendValueText": "[[description]]/[[value]]",
                        "title": "latitude/city",
                        "fillAlphas": 0,
                        "valueField": "latitude",
                        "valueAxis": "latitudeAxis"
                    }, {
                        "bullet": "square",
                        "bulletBorderAlpha": 1,
                        "bulletBorderThickness": 1,
                        "dashLengthField": "dashLength",
                        "legendValueText": "[[value]]",
                        "title": "duration",
                        "fillAlphas": 0,
                        "valueField": "duration",
                        "valueAxis": "durationAxis"
                    }],
                    "chartCursor": {
                        "categoryBalloonDateFormat": "DD",
                        "cursorAlpha": 0.1,
                        "cursorColor": "#000000",
                        "fullWidth": true,
                        "valueBalloonsEnabled": false,
                        "zoomable": false
                    },
                    "dataDateFormat": "YYYY-MM-DD",
                    "categoryField": "date",
                    "categoryAxis": {
                        "dateFormats": [{
                            "period": "DD",
                            "format": "DD"
                        }, {
                            "period": "WW",
                            "format": "MMM DD"
                        }, {
                            "period": "MM",
                            "format": "MMM"
                        }, {
                            "period": "YYYY",
                            "format": "YYYY"
                        }],
                        "parseDates": true,
                        "autoGridCount": false,
                        "axisColor": "#555555",
                        "gridAlpha": 0.1,
                        "gridColor": "#FFFFFF",
                        "gridCount": 50
                    },
                    "exportConfig": {
                        "menuBottom": "20px",
                        "menuRight": "22px",
                        "menuItems": [{
                            "icon": Metronic.getGlobalPluginsPath() + "amcharts/amcharts/images/export.png",
                            "format": 'png'
                        }]
                    }
                });

                $('#MyFacebookPages').closest('.portlet').find('.fullscreen').click(function () {
                    chart.invalidateSize();
                });
            }
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

        $('#PAGEIMPRESSIONS').closest('.portlet').find('.fullscreen').click(function () {
            chart.invalidateSize();
        });



        // stories graph
        $scope.generateStoryGraph = function (days) {
            $scope.generatestoryGraph(days);
            var chart = AmCharts.makeChart("FacebookStories", {
                "type": "serial",
                "theme": "light",
                "dataProvider": $scope.chartstoryData,
                "gridAboveGraphs": true,
                "startDuration": 1,
                "graphs": [{
                    "balloonText": "[[category]]: <b>[[value]]</b>",
                    "fillAlphas": 0.8,
                    "lineAlpha": 0.2,
                    "type": "column",
                    "valueField": "share"
                }],
                "chartCursor": {
                    "categoryBalloonEnabled": false,
                    "cursorAlpha": 0,
                    "zoomable": false
                },
                "categoryField": "date",
                "categoryAxis": {
                    "gridPosition": "start",
                    "gridAlpha": 0,
                    "tickPosition": "start",
                    "tickLength": 20
                },
                "export": {
                    "enabled": true
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
            var chart = AmCharts.makeChart("ShareType", {
                "type": "pie",
                "startDuration": 0,
                "theme": "light",
                "addClassNames": true,
                "legend": {
                    "position": "right",
                    "marginRight": 100,
                    "autoMargins": false
                },
                "innerRadius": "30%",
                "defs": {
                    "filter": [{
                        "id": "shadow",
                        "width": "200%",
                        "height": "200%",
                        "feOffset": {
                            "result": "offOut",
                            "in": "SourceAlpha",
                            "dx": 0,
                            "dy": 0
                        },
                        "feGaussianBlur": {
                            "result": "blurOut",
                            "in": "offOut",
                            "stdDeviation": 5
                        },
                        "feBlend": {
                            "in": "SourceGraphic",
                            "in2": "blurOut",
                            "mode": "normal"
                        }
                    }]
                },
                "dataProvider": $scope.chartshareData,
                "valueField": "litres",
                "titleField": "country",
                "export": {
                    "enabled": true
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
                }
            });

            $scope.chartshareData.push({
                sharefan: story_Fans,
                sharepagepost: story_PagePost,
                shareuserpost: story_UserPost,
                shareother: story_Other,
                sharementions: story_Mention,
                shareevent: story_Event,
                sharequestion: story_Question,
                sharecheckin: story_Checkin
            });
        }
        chart.addListener("init", handleInit);

        chart.addListener("rollOverSlice", function (e) {
            handleRollOver(e);
        });

        function handleInit() {
            chart.legend.addListener("rollOverItem", handleRollOver);
        }

        function handleRollOver(e) {
            var wedge = e.dataItem.wedge.node;
            wedge.parentNode.appendChild(wedge);
        }


        // sharing by age and gender
        $scope.generatesharebygenderGraph = function (days) {
            $scope.generatesharebygendermalefemaleGraph(days);
            var chart = AmCharts.makeChart("share_male_female", {
                "type": "serial",
                "theme": "light",
                "path": "http://www.amcharts.com/lib/3/",
                "legend": {
                    "horizontalGap": 10,
                    "maxColumns": 1,
                    "position": "right",
                    "useGraphSettings": true,
                    "markerSize": 10
                },
                "dataProvider": [{
                    "age": 13 - 17,
                    "Male": $scope.sharing_m_13_17,
                    "Female": $scope.sharing_f_13_17,
                }, {
                    "age": 18 - 24,
                    "Male": $scope.sharing_m_18_24,
                    "Female": $scope.sharing_f_18_24,
                }, {
                    "age": 25 - 34,
                    "Male": $scope.sharing_m_25_34,
                    "Female": $scope.sharing_f_25_34,
                }, {
                    "age": 35 - 44,
                    "Male": $scope.sharing_m_35_44,
                    "Female": $scope.sharing_f_35_44,
                }, {
                    "year": 45 - 54,
                    "Male": $scope.sharing_m_45_54,
                    "Female": $scope.sharing_f_45_54,
                }, {
                    "age": 55 - 64,
                    "Male": $scope.sharing_m_55_64,
                    "Female": $scope.sharing_f_55_64,
                }, {
                    "age": 65,
                    "Male": $scope.sharing_m_65,
                    "Female": $scope.sharing_f_65,
                }],
                "valueAxes": [{
                    "stackType": "regular",
                    "axisAlpha": 0.5,
                    "gridAlpha": 0
                }],
                "graphs": [{
                    "balloonText": "<b>[[title]]</b><br><span style='font-size:24px'>[[category]]: <b>[[value]]</b></span>",
                    "fillAlphas": 0.8,
                    "labelText": "[[value]]",
                    "lineAlpha": 0.3,
                    "title": "Male (100)",
                    "type": "column",
                    "color": "#000000",
                    "valueField": "Male"
                }, {
                    "balloonText": "<b>[[title]]</b><br><span style='font-size:24px'>[[category]]: <b>[[value]]</b></span>",
                    "fillAlphas": 0.8,
                    "labelText": "[[value]]",
                    "lineAlpha": 0.3,
                    "title": "Female (99)",
                    "type": "column",
                    "color": "#000000",
                    "valueField": "Female"
                }],
                "rotate": true,
                "categoryField": "year",
                "categoryAxis": {
                    "gridPosition": "start",
                    "axisAlpha": 0,
                    "gridAlpha": 0,
                    "position": "left"
                },
                "export": {
                    "enabled": true
                }
            });

        }
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
                    sharing_m_13_17 = sharing_m_13_17 + value.sharing_m_13_17
                    sharing_m_18_24 = sharing_m_18_24 + value.sharing_m_18_24;
                    sharing_m_25_34 = sharing_m_25_34 + value.sharing_m_25_34;
                    sharing_m_35_44 = sharing_m_35_44 + value.sharing_m_35_44
                    sharing_m_45_54 = sharing_m_45_54 + value.sharing_m_45_54;
                    sharing_m_55_64 = sharing_m_55_64 + value.sharing_m_55_64;
                    sharing_m_65 = sharing_m_65 + value.sharing_m_65
                    sharing_f_13_17 = sharing_f_13_17 + value.sharing_f_13_17;
                    sharing_f_18_24 = sharing_f_18_24 + value.sharing_f_18_24;
                    sharing_f_25_34 = sharing_f_25_34 + value.sharing_f_25_34
                    sharing_f_35_44 = sharing_f_35_44 + value.sharing_f_35_44;
                    sharing_f_45_54 = sharing_f_45_54 + value.sharing_f_45_54;
                    sharing_f_55_64 = sharing_f_55_64 + value.sharing_f_55_64;
                    sharing_f_65 = sharing_f_65 + value.sharing_f_65;
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
        }

  });

});