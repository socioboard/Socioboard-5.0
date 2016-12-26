'use strict';

SocioboardApp.controller('TwitterreportsController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        $scope.lstProfiles = $rootScope.lstProfiles;
        groupreport();
        
        $scope.chartData = [];
        $scope.graphData = [];
        $scope.Fans = [];


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
                    "title": "mentions",
                    "valueField": "mentions",
                    "fillAlphas": 0
                }, {
                    "valueAxis": "v2",
                    "lineColor": "#FCD202",
                    "bullet": "square",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "retweets",
                    "valueField": "retweets",
                    "fillAlphas": 0
                }, {
                    "valueAxis": "v3",
                    "lineColor": "#B0DE09",
                    "bullet": "triangleUp",
                    "bulletBorderThickness": 1,
                    "hideBulletsCount": 30,
                    "title": "followers",
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
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load fb profiles
            $scope.loadTopFans(profileId, days);
            $scope.loadtwitterRecentDetails(profileId);
        }

        
      

        $scope.getOnPageLoadReports = function () {
            var canContinue = true;
            angular.forEach($rootScope.lstProfiles, function (value, key) {
                if (canContinue && value.profileType == 2) {
                    $scope.getReports(value.profileId, 90)
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