'use strict';

SocioboardApp.controller('TwittercustomreportsController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        $scope.lstProfiles = $rootScope.lstProfiles;
        groupreport();
        
        $scope.chartData = [];
        $scope.graphData = [];
        $scope.Fans = [];
        var fetchdatacomplete = false;
        

        $scope.loadTopFans = function (profileId, days) {
           
            //codes to load  fans data
            $http.get(apiDomain + '/api/TwitterReports/GetTopFiveFans?profileId=' + profileId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.Fans = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load fb profiles
        }

        $scope.loadtwitterRecentDetails = function (profileId) {

            //codes to load  fans data
            $http.get(apiDomain + '/api/TwitterReports/GetTwitterRecentDetails?profileId=' + profileId)
                          .then(function (response) {
                              $scope.RecentDetails = response.data;
                              
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load fb profiles
        }
        
       

        $scope.generateChartData = function (days) {
            $scope.chartData = [];
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.dailyReportsList, function (value, key) {
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


        $scope.getData = function (days) {
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            var endDate = Date.now() / 1000;
            var totalNewFollowers = 0;
            var totalNewFollowing = 0;
            var totalMentions = 0;
            var totalRetweets = 0;
            var toatlDirectMessagesReceived = 0;
            var totalDirectMessagesSent = 0;
            var totalMessagesReceived = 0;
            var totalMessagesSent = 0;
            $scope.graphData = [];
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.timeStamp > startDate) {
                    totalNewFollowers = totalNewFollowers + value.newFollowers;
                    totalNewFollowing = totalNewFollowing + value.newFollowing;
                    totalMentions = totalMentions + value.mentions;
                    totalRetweets = totalRetweets + value.retweets;
                    toatlDirectMessagesReceived = toatlDirectMessagesReceived + value.directMessagesReceived;
                    totalDirectMessagesSent = totalDirectMessagesSent + value.directMessagesSent;
                    totalMessagesReceived = totalMessagesReceived + value.messagesReceived;
                    totalMessagesSent = totalMessagesSent + value.messagesSent;
                    $scope.graphData = $scope.graphData.concat(value);
                }
            });

            $scope.totalNewFollowers = totalNewFollowers;
            $scope.totalNewFollowing = totalNewFollowing;
            $scope.totalMentions = totalMentions;
            $scope.totalRetweets = totalRetweets;
            $scope.toatlDirectMessagesReceived = toatlDirectMessagesReceived;
            $scope.totalDirectMessagesSent = totalDirectMessagesSent;
            $scope.totalMessagesReceived = totalMessagesReceived;
            $scope.totalMessagesSent = totalMessagesSent;
            $scope.fromDate = moment(new Date((startDate * 1000))).format('YYYY/MM/DD');
            $scope.toDate = moment(new Date((endDate * 1000))).format('YYYY/MM/DD');
            $scope.generateGraph(days);

        }

        $scope.getReports = function (profileId, days) {
            //codes to load  fb profiles start
            $http.get(apiDomain + '/api/TwitterReports/GetTwitterReports?profileId=' + profileId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.dailyReportsList = response.data;
                              $scope.getData(days);
                              $scope.fetchdatacomplete = true;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load fb profiles           
        }

        
      

        $scope.getOnPageLoadReports = function () {
            var canContinue = true;
            angular.forEach($rootScope.lstProfiles, function (value, key) {
                if (canContinue && value.profileType == 2) {
                    $scope.getReports(value.profileId, 90)
                    $scope.loadTopFans(profileId, days);
                    $scope.loadtwitterRecentDetails(profileId);
                    $scope.selectedProfile = value.profileId;
                    canContinue = false;
                }
            });
        }
        $scope.getOnPageLoadReports();
        
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