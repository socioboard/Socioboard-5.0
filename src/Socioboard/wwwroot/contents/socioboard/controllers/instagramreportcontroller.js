'use strict';

SocioboardApp.controller('InstagramreportController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        instagramreport();
        $scope.fetchdatacomplete = 'hide';
        $scope.getReports = function (profileId, days) {
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/InstagramReports/GetInstagramReportData?profileId=' + profileId + '&daysCount=' + days)
                          .then(function (response) {
                              debugger;
                              $scope.dailyReportsList = response.data;
                              $scope.getData(profileId, days);
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }


        $scope.instagramReportsData = [];


        $scope.generateGraphs = function () {
            console.log('generate graph');
            console.log($scope.instagramReportsData);

            var chart = AmCharts.makeChart("FollowersGraph", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.instagramReportsData,
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
                "dataProvider": $scope.instagramReportsData,
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

            //var chart = AmCharts.makeChart("POSTCOMMENTSGraph", {
            //    "type": "serial",
            //    "theme": "light",
            //    "legend": {
            //        "useGraphSettings": true
            //    },
            //    "dataProvider": $scope.instagramReportsData,
            //    "synchronizeGrid": true,
            //    "valueAxes": [{
            //        "id": "v1",
            //        "axisColor": "#FF6600",
            //        "axisThickness": 2,
            //        "axisAlpha": 1,
            //        "inside": true,
            //        "position": "left"
            //    }],
            //    "graphs": [{
            //        "id": "g1",
            //        "balloonText": "<div style='margin:5px; font-size:19px;'><span style='font-size:13px;'>[[category]]</span><br>[[value]]</div>",
            //        "bullet": "round",
            //        "bulletBorderAlpha": 1,
            //        "bulletBorderColor": "#FFFFFF",
            //        "hideBulletsCount": 50,
            //        "lineThickness": 2,
            //        "lineColor": "#fdd400",
            //        "negativeLineColor": "#67b7dc",
            //        "valueField": "postcomment"       
            //    }],
            //    "chartScrollbar": {},
            //    "chartCursor": {
            //       // "cursorPosition": "mouse"
            //    },
            //    "categoryField": "date",
            //    "categoryAxis": {
            //        "parseDates": true,
            //        "axisAlpha": 0,
            //        "minHorizontalGap": 55
            //    },
            //    "export": {
            //        "enabled": true,
            //        "position": "bottom-right"
            //    }
            //});


            var chart = AmCharts.makeChart("POSTCOMMENTSGraph", {
                "theme": "light",
                "type": "serial",
                "dataProvider": $scope.instagramReportsData,
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
                    "valueField": "postcomment"
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
              //  "listeners": [{
                 //   "event": "dataUpdated",
                    //"method": function () {
                    //    if (chart) {
                    //        if (chart.zoomToIndexes) {
                    //            chart.zoomToIndexes(130, chartData.length - 1);
                    //        }
                    //    }
                    //}
               // }]
            });

        


            var chart = AmCharts.makeChart("POSTLIKESGraph", {
                "type": "serial",
                "theme": "light",
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.instagramReportsData,
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
                "dataProvider": $scope.instagramReportsData,
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
            debugger;
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
                        postlike : value.postlike,
                        date : new Date((value.date * 1000))
                    });

                }
            });
            $scope.fromDate = moment(new Date((startDate * 1000))).format('YYYY/MM/DD');
            $scope.toDate = moment(new Date((endDate * 1000))).format('YYYY/MM/DD');
            console.log('asasfd');
            console.log($scope.instagramReportsData);

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