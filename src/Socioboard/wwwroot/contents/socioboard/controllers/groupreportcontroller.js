'use strict';

SocioboardApp.controller('GroupreportController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        groupreport();

        $scope.chart1Data = [];
        var fetchdatacomplete = false;
        $scope.getReports = function (groupId, days) {
            //codes to load  fb page profiles start
            $http.get(apiDomain + '/api/GroupReport/getgroupReportData?groupId=' + $rootScope.groupId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.dailyReportsList = response.data;
                              $scope.getData(days);
                              $scope.fetchdatacomplete = true;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load fb page profiles

        }
        $scope.getOnPageLoadReports = function () {
            $scope.getReports($rootScope.groupId, 90);
           // $scope.getfacebookpageGroupReportData($rootScope.groupId, 90);
           // $scope.getTwitterGroupReportData($rootScope.groupId, 90);
        }

       
        


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
                    //twitterfollower = twitterfollower + value.twitterfollower;
                    twitterfollower =  value.twitterfollower;
                    // fbfan = fbfan + value.fbfan;
                    fbfan = value.fbfan;
                    interaction = interaction + value.interaction;
                    twtmentions = twtmentions + value.twtmentions;
                    twtretweets = twtretweets + value.twtretweets;
                    malecount = malecount + value.malecount;
                    femalecount = femalecount + value.femalecount;
                    uniqueusers = uniqueusers + value.uniqueusers;
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
            $scope.getfacebookpageGroupReportData($rootScope.groupId, days);
            $scope.getTwitterGroupReportData($rootScope.groupId, days);
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
            //$scope.GetFacebookPagePostData(profileId, days);
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
            try { $scope.generatePageLikeUnlikeGraph(days); } catch (err) { }
            try { $scope.generateIMPRESSIONS1Graph(days); } catch (err) { }
            try { $scope.generateIMPRESSIONS2Graph(days); } catch (err) { }
            try { $scope.generateIMPRESSIONSmalefemaleGraph(days); } catch (err) { }
            try { $scope.generateStoryGraph(days); } catch (err) { }
            try { $scope.generatesharetypeGraph(days); } catch (err) { }
            try { $scope.generatesharebygenderGraph(days); } catch (err) { }
            $scope.generatePAGEIMPRESSIONSGraph(days);
            
            //$scope.GetFacebookPagePostData(profileId, days);

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
            am4core.useTheme(am4themes_animated);
            var chart = am4core.create("DAILYENGAGEMENT", am4charts.XYChart);
            chart.colors.step = 2;
            chart.data = $scope.chartData;
            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.minGridDistance = 50;
            function createAxisAndSeries(field, name, opposite, bullet) {
                var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

                var series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.valueY = field;
                series.dataFields.dateX = "date";
                series.strokeWidth = 2;
                series.yAxis = valueAxis;
                series.name = name;
                series.tooltipText = "{name}: [bold]{valueY}[/]";
                series.tensionX = 0.8;

                var interfaceColors = new am4core.InterfaceColorSet();

                switch (bullet) {
                    case "triangle":
                        var bullet = series.bullets.push(new am4charts.Bullet());
                        bullet.width = 12;
                        bullet.height = 12;
                        bullet.horizontalCenter = "middle";
                        bullet.verticalCenter = "middle";

                        var triangle = bullet.createChild(am4core.Triangle);
                        triangle.stroke = interfaceColors.getFor("background");
                        triangle.strokeWidth = 2;
                        triangle.direction = "top";
                        triangle.width = 12;
                        triangle.height = 12;
                        break;
                    case "rectangle":
                        var bullet = series.bullets.push(new am4charts.Bullet());
                        bullet.width = 10;
                        bullet.height = 10;
                        bullet.horizontalCenter = "middle";
                        bullet.verticalCenter = "middle";

                        var rectangle = bullet.createChild(am4core.Rectangle);
                        rectangle.stroke = interfaceColors.getFor("background");
                        rectangle.strokeWidth = 2;
                        rectangle.width = 10;
                        rectangle.height = 10;
                        break;
                    default:
                        var bullet = series.bullets.push(new am4charts.CircleBullet());
                        bullet.circle.stroke = interfaceColors.getFor("background");
                        bullet.circle.strokeWidth = 2;
                        break;
                }

                valueAxis.renderer.line.strokeOpacity = 1;
                valueAxis.renderer.line.strokeWidth = 2;
                valueAxis.renderer.line.stroke = series.stroke;
                valueAxis.renderer.labels.template.fill = series.stroke;
                valueAxis.renderer.opposite = opposite;
                valueAxis.renderer.grid.template.disabled = true;
            }

            createAxisAndSeries("mentions", "mentions", false, "circle");
            createAxisAndSeries("retweets", "retweets", false, "circle");
            createAxisAndSeries("followers", "followers", false, "circle");
            chart.legend = new am4charts.Legend();
            chart.cursor = new am4charts.XYCursor();
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



        // IMPRESSIONS BREAKDOWN //

        $scope.generateIMPRESSIONS1Graph = function (days) {
            $scope.generateChart1Data(days);
        
            am4core.useTheme(am4themes_animated);
            var chart = am4core.create("BREAKDOWN_1", am4charts.XYChart);
            chart.colors.step = 2;
            chart.data = $scope.chart1Data;
            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.minGridDistance = 50;

            // Create series
            function createAxisAndSeries(field, name, opposite, bullet) {
                var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

                var series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.valueY = field;
                series.dataFields.dateX = "date";
                series.strokeWidth = 2;
                series.yAxis = valueAxis;
                series.name = name;
                series.tooltipText = "{name}: [bold]{valueY}[/]";
                series.tensionX = 0.8;

                var interfaceColors = new am4core.InterfaceColorSet();

                switch (bullet) {
                    case "triangle":
                        var bullet = series.bullets.push(new am4charts.Bullet());
                        bullet.width = 12;
                        bullet.height = 12;
                        bullet.horizontalCenter = "middle";
                        bullet.verticalCenter = "middle";

                        var triangle = bullet.createChild(am4core.Triangle);
                        triangle.stroke = interfaceColors.getFor("background");
                        triangle.strokeWidth = 2;
                        triangle.direction = "top";
                        triangle.width = 12;
                        triangle.height = 12;
                        break;
                    case "rectangle":
                        var bullet = series.bullets.push(new am4charts.Bullet());
                        bullet.width = 10;
                        bullet.height = 10;
                        bullet.horizontalCenter = "middle";
                        bullet.verticalCenter = "middle";

                        var rectangle = bullet.createChild(am4core.Rectangle);
                        rectangle.stroke = interfaceColors.getFor("background");
                        rectangle.strokeWidth = 2;
                        rectangle.width = 10;
                        rectangle.height = 10;
                        break;
                    default:
                        var bullet = series.bullets.push(new am4charts.CircleBullet());
                        bullet.circle.stroke = interfaceColors.getFor("background");
                        bullet.circle.strokeWidth = 2;
                        break;
                }

                valueAxis.renderer.line.strokeOpacity = 1;
                valueAxis.renderer.line.strokeWidth = 2;
                valueAxis.renderer.line.stroke = series.stroke;
                valueAxis.renderer.labels.template.fill = series.stroke;
                valueAxis.renderer.opposite = opposite;
                valueAxis.renderer.grid.template.disabled = true;
            }

            createAxisAndSeries("Event", "Event", false, "triangle");
            createAxisAndSeries("checkin", "checkin", false, "rectangle");
            createAxisAndSeries("fans", "fans", false, "triangle");
            createAxisAndSeries("mention", "mention", false, "rectangle");
            createAxisAndSeries("other", "other", false, "circle");
            createAxisAndSeries("pagePost", "pagePost", false, "triangle");
            createAxisAndSeries("question", "question", false, "rectangle");
            createAxisAndSeries("userPost", "userPost", false, "circle");

            chart.legend = new am4charts.Legend();
            chart.cursor = new am4charts.XYCursor();
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
            angular.forEach($scope.generatefacebookGraphData, function (value, key) {
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
                        //date: value.date
                        date: new Date((value.date * 1000))
                    });

                }
            });

         


        }

        $scope.generateIMPRESSIONS2Graph = function (days) {
            $scope.generateChart2Data(days);           
            am4core.useTheme(am4themes_animated);
            var chart = am4core.create("BREAKDOWN_2", am4charts.XYChart);
            chart.colors.step = 2;
            chart.data = $scope.chart2Data;
            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.minGridDistance = 50;

            // Create series
            function createAxisAndSeries(field, name, opposite, bullet) {
                var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

                var series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.valueY = field;
                series.dataFields.dateX = "date";
                series.strokeWidth = 2;
                series.yAxis = valueAxis;
                series.name = name;
                series.tooltipText = "{name}: [bold]{valueY}[/]";
                series.tensionX = 0.8;

                var interfaceColors = new am4core.InterfaceColorSet();

                switch (bullet) {
                    case "triangle":
                        var bullet = series.bullets.push(new am4charts.Bullet());
                        bullet.width = 12;
                        bullet.height = 12;
                        bullet.horizontalCenter = "middle";
                        bullet.verticalCenter = "middle";

                        var triangle = bullet.createChild(am4core.Triangle);
                        triangle.stroke = interfaceColors.getFor("background");
                        triangle.strokeWidth = 2;
                        triangle.direction = "top";
                        triangle.width = 12;
                        triangle.height = 12;
                        break;
                    case "rectangle":
                        var bullet = series.bullets.push(new am4charts.Bullet());
                        bullet.width = 10;
                        bullet.height = 10;
                        bullet.horizontalCenter = "middle";
                        bullet.verticalCenter = "middle";

                        var rectangle = bullet.createChild(am4core.Rectangle);
                        rectangle.stroke = interfaceColors.getFor("background");
                        rectangle.strokeWidth = 2;
                        rectangle.width = 10;
                        rectangle.height = 10;
                        break;
                    default:
                        var bullet = series.bullets.push(new am4charts.CircleBullet());
                        bullet.circle.stroke = interfaceColors.getFor("background");
                        bullet.circle.strokeWidth = 2;
                        break;
                }

                valueAxis.renderer.line.strokeOpacity = 1;
                valueAxis.renderer.line.strokeWidth = 2;
                valueAxis.renderer.line.stroke = series.stroke;
                valueAxis.renderer.labels.template.fill = series.stroke;
                valueAxis.renderer.opposite = opposite;
                valueAxis.renderer.grid.template.disabled = true;
            }

            createAxisAndSeries("organic", "organic", false, "circle");
            createAxisAndSeries("paid", "paid", false, "circle");
            createAxisAndSeries("viral", "viral", false, "circle");

            chart.legend = new am4charts.Legend();
            chart.cursor = new am4charts.XYCursor();
        }

        $scope.chart2Data = [];

        $scope.generateChart2Data = function (days) {
            $scope.chart2Data = [];
            var organic = 0;
            var viral = 0;
            var paid = 0;

            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.generatefacebookGraphData, function (value, key) {
                if (value.date > startDate) {
                    organic = organic + value.organic
                    viral = viral + value.viral;
                    paid = paid + value.paid;

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
            angular.forEach($scope.generatefacebookGraphData, function (value, key) {//dailyReportsList
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
            am4core.useTheme(am4themes_animated);
            var chart = am4core.create("PAGEIMPRESSIONS", am4charts.XYChart);
            chart.data = $scope.chartimpressionData;
            chart.exporting.menu = new am4core.ExportMenu();
            // Set input format for the dates
            chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";

            // Create axes
            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

            // Create series
            var series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = "impression";
            series.dataFields.dateX = "date";
            series.tooltipText = "{value}"
            series.strokeWidth = 2;
            series.minBulletDistance = 15;

            // Drop-shaped tooltips
            series.tooltip.background.cornerRadius = 20;
            series.tooltip.background.strokeOpacity = 0;
            series.tooltip.pointerOrientation = "vertical";
            series.tooltip.label.minWidth = 40;
            series.tooltip.label.minHeight = 40;
            series.tooltip.label.textAlign = "middle";
            series.tooltip.label.textValign = "middle";
            series.tooltipText = "{dateX}: [bold]{valueY}";

            // Make bullets grow on hover
            var bullet = series.bullets.push(new am4charts.CircleBullet());
            bullet.circle.strokeWidth = 2;
            bullet.circle.radius = 4;
            bullet.circle.fill = am4core.color("#fff");

            var bullethover = bullet.states.create("hover");
            bullethover.properties.scale = 1.3;
            chart.cursor = new am4charts.XYCursor();
            chart.cursor.behavior = "panXY";
            chart.cursor.xAxis = dateAxis;
            chart.cursor.snapToSeries = series;
            chart.scrollbarY = new am4core.Scrollbar();
            chart.scrollbarY.parent = chart.leftAxesContainer;
            chart.scrollbarY.toBack();
            chart.scrollbarX = new am4charts.XYChartScrollbar();
            chart.scrollbarX.series.push(series);
            chart.scrollbarX.parent = chart.bottomAxesContainer;

        }
        $scope.generatepageimressionChartData = function (days) {
            $scope.chartimpressionData = [];

            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.generatefacebookGraphData, function (value, key) {//dailyReportList
                $scope.chartimpressionData.push({
                    date: new Date((value.date * 1000)),
                    impression: value.perDayImpression
                });
            });
        }

        $scope.chartlikeunlikeData = [];
        $scope.generatePageLikeUnlikeGraph = function (days) {
            $scope.generatefacebookpageLikeUnlikeGraph(days);

            am4core.useTheme(am4themes_animated);
            var chart = am4core.create("MyFacebookPages", am4charts.XYChart);
            chart.colors.step = 2;
            chart.data = $scope.chartlikeunlikeData;
            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.minGridDistance = 50;
            function createAxisAndSeries(field, name, opposite, bullet) {
                var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

                var series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.valueY = field;
                series.dataFields.dateX = "date";
                series.strokeWidth = 2;
                series.yAxis = valueAxis;
                series.name = name;
                series.tooltipText = "{name}: [bold]{valueY}[/]";
                series.tensionX = 0.8;

                var interfaceColors = new am4core.InterfaceColorSet();

                switch (bullet) {
                    case "triangle":
                        var bullet = series.bullets.push(new am4charts.Bullet());
                        bullet.width = 12;
                        bullet.height = 12;
                        bullet.horizontalCenter = "middle";
                        bullet.verticalCenter = "middle";

                        var triangle = bullet.createChild(am4core.Triangle);
                        triangle.stroke = interfaceColors.getFor("background");
                        triangle.strokeWidth = 2;
                        triangle.direction = "top";
                        triangle.width = 12;
                        triangle.height = 12;
                        break;
                    case "rectangle":
                        var bullet = series.bullets.push(new am4charts.Bullet());
                        bullet.width = 10;
                        bullet.height = 10;
                        bullet.horizontalCenter = "middle";
                        bullet.verticalCenter = "middle";

                        var rectangle = bullet.createChild(am4core.Rectangle);
                        rectangle.stroke = interfaceColors.getFor("background");
                        rectangle.strokeWidth = 2;
                        rectangle.width = 10;
                        rectangle.height = 10;
                        break;
                    default:
                        var bullet = series.bullets.push(new am4charts.CircleBullet());
                        bullet.circle.stroke = interfaceColors.getFor("background");
                        bullet.circle.strokeWidth = 2;
                        break;
                }

                valueAxis.renderer.line.strokeOpacity = 1;
                valueAxis.renderer.line.strokeWidth = 2;
                valueAxis.renderer.line.stroke = series.stroke;
                valueAxis.renderer.labels.template.fill = series.stroke;
                valueAxis.renderer.opposite = opposite;
                valueAxis.renderer.grid.template.disabled = true;
            }

            createAxisAndSeries("like", "like", false, "circle");
            createAxisAndSeries("unlike", "unlike", false, "circle");

            chart.legend = new am4charts.Legend();
            chart.cursor = new am4charts.XYCursor();


        }
        $scope.generatefacebookpageLikeUnlikeGraph = function (days) {

            $scope.chartlikeunlikeData = [];
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.generatefacebookGraphData, function (value, key) {//dailyReportList
                $scope.chartlikeunlikeData.push({
                    date: new Date((value.date * 1000)),
                    like: value.perDayLikes,
                    unlike: value.perDayUnlikes
                });
            });

        }


       


        // stories graph
        $scope.generateStoryGraph = function (days) {
            $scope.generatestoryGraph(days);


            var chart = am4core.create("FacebookStories", am4charts.XYChart);

            // Add data
            chart.data = $scope.chartstoryData;
            chart.exporting.menu = new am4core.ExportMenu();
            // Set input format for the dates
            chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";

            // Create axes
            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

            // Create series
            var series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = "story";
            series.dataFields.dateX = "date";
            series.tooltipText = "{value}"
            series.strokeWidth = 2;
            series.minBulletDistance = 15;

            // Drop-shaped tooltips
            series.tooltip.background.cornerRadius = 20;
            series.tooltip.background.strokeOpacity = 0;
            series.tooltip.pointerOrientation = "vertical";
            series.tooltip.label.minWidth = 40;
            series.tooltip.label.minHeight = 40;
            series.tooltip.label.textAlign = "middle";
            series.tooltip.label.textValign = "middle";
            series.tooltipText = "{dateX}: [bold]{valueY}";

            // Make bullets grow on hover
            var bullet = series.bullets.push(new am4charts.CircleBullet());
            bullet.circle.strokeWidth = 2;
            bullet.circle.radius = 4;
            bullet.circle.fill = am4core.color("#fff");

            var bullethover = bullet.states.create("hover");
            bullethover.properties.scale = 1.3;

            // Make a panning cursor
            chart.cursor = new am4charts.XYCursor();
            chart.cursor.behavior = "panXY";
            chart.cursor.xAxis = dateAxis;
            chart.cursor.snapToSeries = series;
            chart.scrollbarY = new am4core.Scrollbar();
            chart.scrollbarY.parent = chart.leftAxesContainer;
            chart.scrollbarY.toBack();

            // Create a horizontal scrollbar with previe and place it underneath the date axis
            chart.scrollbarX = new am4charts.XYChartScrollbar();
            chart.scrollbarX.series.push(series);
            chart.scrollbarX.parent = chart.bottomAxesContainer;
        }
        $scope.generatestoryGraph = function (days) {
            $scope.chartstoryData = [];

            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.generatefacebookGraphData, function (value, key) {//DailyReportList
                $scope.chartstoryData.push({
                    date: new Date((value.date * 1000)),
                    story: value.storyShare
                });
            });


        }
        $scope.generatesharetypeGraph = function (days) {
            $scope.generatesharechart(days);         
            var chart = am4core.create("ShareType", am4charts.XYChart);
            chart.colors.step = 2;
            chart.data = $scope.chartshareData
            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            dateAxis.renderer.minGridDistance = 50;
            function createAxisAndSeries(field, name, opposite, bullet) {
                var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

                var series = chart.series.push(new am4charts.LineSeries());
                series.dataFields.valueY = field;
                series.dataFields.dateX = "date";
                series.strokeWidth = 2;
                series.yAxis = valueAxis;
                series.name = name;
                series.tooltipText = "{name}: [bold]{valueY}[/]";
                series.tensionX = 0.8;

                var interfaceColors = new am4core.InterfaceColorSet();

                switch (bullet) {
                    case "triangle":
                        var bullet = series.bullets.push(new am4charts.Bullet());
                        bullet.width = 12;
                        bullet.height = 12;
                        bullet.horizontalCenter = "middle";
                        bullet.verticalCenter = "middle";

                        var triangle = bullet.createChild(am4core.Triangle);
                        triangle.stroke = interfaceColors.getFor("background");
                        triangle.strokeWidth = 2;
                        triangle.direction = "top";
                        triangle.width = 12;
                        triangle.height = 12;
                        break;
                    case "rectangle":
                        var bullet = series.bullets.push(new am4charts.Bullet());
                        bullet.width = 10;
                        bullet.height = 10;
                        bullet.horizontalCenter = "middle";
                        bullet.verticalCenter = "middle";

                        var rectangle = bullet.createChild(am4core.Rectangle);
                        rectangle.stroke = interfaceColors.getFor("background");
                        rectangle.strokeWidth = 2;
                        rectangle.width = 10;
                        rectangle.height = 10;
                        break;
                    default:
                        var bullet = series.bullets.push(new am4charts.CircleBullet());
                        bullet.circle.stroke = interfaceColors.getFor("background");
                        bullet.circle.strokeWidth = 2;
                        break;
                }

                valueAxis.renderer.line.strokeOpacity = 1;
                valueAxis.renderer.line.strokeWidth = 2;
                valueAxis.renderer.line.stroke = series.stroke;
                valueAxis.renderer.labels.template.fill = series.stroke;
                valueAxis.renderer.opposite = opposite;
                valueAxis.renderer.grid.template.disabled = true;
            }

            createAxisAndSeries("sharefan", "fan", false, "circle");
            createAxisAndSeries("sharepagepost", "page post", false, "circle");
            createAxisAndSeries("shareuserpost", "user post", false, "circle");
            createAxisAndSeries("shareother", "other", false, "circle");
            createAxisAndSeries("sharementions", "mention", false, "circle");
            createAxisAndSeries("sharequestion", "question", false, "circle");
            createAxisAndSeries("sharecheckin", "checkin", false, "circle");

            chart.legend = new am4charts.Legend();
            chart.cursor = new am4charts.XYCursor();
        }
    

          $scope.reportaaa = function () {

            $http.get(apiDomain + '/api/Twitter/Notifications?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&skip=0&count=')
                          .then(function (response) {
                              $scope.mendata = response.data[0];
                              $scope.redata = response.data[1];
                              $scope.recivedm = response.data[2];
                              $scope.sentdm = response.data[3];
                              $scope.posttext = response.data[4];
                              $scope.mediapost = response.data[5];
                              $scope.linkpost = response.data[6];
                              $scope.fetchdatacomplete = true;
                          })

        }
        $scope.reportaaa();


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
            angular.forEach($scope.generatefacebookGraphData, function (value, key) {//dailyREportList
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
            angular.forEach($scope.generatefacebookGraphData, function (value, key) {//dailyReportList
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
                    sharing_f_65 = sharing_f_65 + value.sharing_f_65;


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

            //var maleShare = sharing_m_13_17 + sharing_m_18_24 + sharing_m_25_34 + sharing_m_35_44 + sharing_m_45_54 + sharing_m_55_64 + sharing_m_65;

            // var femaleShare = sharing_f_13_17 + sharing_f_18_24 + sharing_f_25_34 + sharing_f_35_44 + sharing_f_45_54 + sharing_f_55_64 + sharing_f_65;

            //$scope.sharingByAgeMaleFollower = (maleShare * 100) / (maleShare + femaleShare);
            //$scope.sharingByAgeFemaleFollower = (femaleShare * 100) / (maleShare + femaleShare);

           


        }


        $scope.getOnPageLoadReports();

  });

});

