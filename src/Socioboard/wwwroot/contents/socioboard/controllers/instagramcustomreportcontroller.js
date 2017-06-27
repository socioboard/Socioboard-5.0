'use strict';

SocioboardApp.controller('InstagramcustomreportController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        instagramreport();
        $scope.fetchdatacomplete = 'hide';
        $scope.getReports = function (profileId, days) {
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/InstagramReports/GetInstagramReportData?profileId=' + profileId + '&daysCount=' + days)
                          .then(function (response) {
                               $scope.getprofiledatawithdate = [];
                              $scope.dailyReportsList = response.data;
                              angular.forEach($scope.dailyReportsList, function (value, key) {
                                  $scope.getprofiledatawithdate.push({

                                      postcomment: value.postcomment,
                                      followcount: value.followcount,
                                      followingcount: value.followingcount,
                                      mediaCount: value.mediaCount,
                                      postlike: value.postlike,
                                      fullName: value.instaName,
                                      date: new Date((value.date * 1000))

                                  });
                              })
                              $scope.getData(profileId, days);
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }


        $scope.instagramReportsData = [];


        $scope.generateGraphs = function () {
           

            var chart = AmCharts.makeChart("FollowersGraph", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.getprofiledatawithdate,
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
                    "title": "followcount",
                    "valueField": "followcount",
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

            var chart = AmCharts.makeChart("FOLLOWINGGraph", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.getprofiledatawithdate,
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
                    "title": "followingcount",
                    "valueField": "followingcount",
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



            var chart = AmCharts.makeChart("POSTCOMMENTSGraph", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.getprofiledatawithdate,
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
                    "title": "postcomment",
                    "valueField": "postcomment",
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
            var chart = AmCharts.makeChart("POSTLIKESGraph", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.getprofiledatawithdate,
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
                    "title": "postlike",
                    "valueField": "postlike",
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
            var chart = AmCharts.makeChart("MEDIAGraph", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.getprofiledatawithdate,
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
                    "title": "mediaCount",
                    "valueField": "mediaCount",
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
        $scope.getData = function (profileId, days) {
            $scope.getprofileData(profileId);
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            var endDate = Date.now() / 1000;
            var totalMedia = 0;
            var totalFollower = 0;
            var totalFollowing = 0;
            var FOLLOWER = 0;
            var FOLLOWING = 0;
            var totalPOSTCOMMENTS = 0;
            var totalPOSTLIKES = 0;
            var newfollwer = 0;
            var newfollowing = 0;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.date > startDate) {
                    totalMedia = totalMedia + value.mediaCount;
                    totalFollower = totalFollower + value.followcount;
                    totalFollowing = totalFollowing + value.followingcount;
                    totalPOSTCOMMENTS = totalPOSTCOMMENTS + value.postcomment;
                    totalPOSTLIKES = totalPOSTLIKES + value.postlike;

                    $scope.instagramReportsData.push({
                        mediaCount: value.mediaCount,
                        followcount: value.followcount,
                        followingcount: value.followingcount,
                        postcomment: value.postcomment,
                        postlike: value.postlike,
                        date: new Date((value.date * 1000))
                    });

                }
            });
            var datevaluefrom  = new Date((startDate * 1000));
            var datevalueto  = new Date((endDate * 1000));
            $scope.fromDate = (datevaluefrom.getFullYear() + '/' + (('0' + (datevaluefrom.getMonth() + 1)).slice(-2)) + '/' + (('0' + datevaluefrom.getDate()).slice(-2)));
            $scope.toDate = (datevalueto.getFullYear() + '/' + (('0' + (datevalueto.getMonth() + 1)).slice(-2)) + '/' + (('0' + datevalueto.getDate()).slice(-2)));


           

            $scope.totalMedia = totalMedia;
            $scope.totalFollower = totalFollower;
            $scope.totalFollowing = totalFollowing;
            $scope.totalPOSTCOMMENTS = totalPOSTCOMMENTS;
            $scope.totalPOSTLIKES = totalPOSTLIKES;
            $scope.generateGraphs();

        }

        $scope.getprofileData = function (profileId) {
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/InstagramReports/GetInstagramData?profileId=' + profileId)
                          .then(function (response) {
                              $scope.instagramdata = response.data;
                              $scope.fetchdatacomplete = 'show';
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles
        }

        $scope.getOnPageLoadReports = function () {
            var canContinue = true;
            angular.forEach($rootScope.lstProfiles, function (value, key) {
                if (canContinue && value.profileType == 8) {
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