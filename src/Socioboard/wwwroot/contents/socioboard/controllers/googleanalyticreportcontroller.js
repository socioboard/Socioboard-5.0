'use strict';

SocioboardApp.controller('GoogleAnalyticreportController', function ($rootScope, $scope, $http, $timeout,apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        googleanalyticreport();
        $scope.deleteProfile = function (profileId) {
            // console.log(profileId);
            swal({
                title: "Are you sure?",
                text: "You will not be able to send message via this account!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
	        function () {
	            //todo: code to delete profile
	            swal("Deleted!", "Your profile has been deleted.", "success");
	        });
        }

        $scope.getReports = function (profileId, days) {
            //codes to load profiles start
            $http.get(apiDomain + '/api/GoogleAnalyticsReport/GetGoogleAnalyticsReportData?profileId=' + profileId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.dailyReportsList = response.data;
                          }, function (reason) {
                              console.log;
                              $scope.error = reason.data;
                          });
            // end codes to load profiles
        }

        $scope.GetTwitterMentionReports = function (profileId, days) {
            //codes to load profiles start
            $http.get(apiDomain + '/api/GoogleAnalyticsReport/GetTwitterMentionReports?profileId=' + profileId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.TwitterMentionReports = response.data;
                          }, function (reason) {
                              console.log;
                              $scope.error = reason.data;
                          });
            // end codes to load profiles
        }

        $scope.GetArticlesAndBlogsReports = function (profileId, days) {
            //codes to load profiles start
            $http.get(apiDomain + '/api/GoogleAnalyticsReport/GetArticlesAndBlogsReports?profileId=' + profileId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.ArticlesAndBlogsReports = response.data;
                          }, function (reason) {
                              console.log;
                              $scope.error = reason.data;
                          });
            // end codes to load profiles
        }

        $scope.getData = function (profileId, days) {
            $scope.GetTwitterMentionReports(profileId, days);
            $scope.GetArticlesAndBlogsReports(profileId, days);
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            var endDate = Date.now() / 1000;
            var views = 0;
            var twitterMention = 0;
            var article_Blogs = 0;
            $scope.graphData = [];
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.timeStamp > startDate) {
                    views = views + value.views + value.Visits;
                    twitterMention = twitterMention + value.mentions;
                    article_Blogs = article_Blogs + value.article_blogs;

                }
            });
            $scope.twitterMention = twitterMention;
            $scope.views = views;
            $scope.article_Blogs = article_Blogs;
            $scope.graphData = $scope.graphData.concat(value);
        }




        var chart = AmCharts.makeChart("googleanalyticgraph", {
            "type": "serial",
            "addClassNames": true,
            "theme": "light",
            "autoMargins": false,
            "marginLeft": 30,
            "marginRight": 8,
            "marginTop": 10,
            "marginBottom": 26,
            "balloon": {
                "adjustBorderColor": false,
                "horizontalPadding": 10,
                "verticalPadding": 8,
                "color": "#ffffff"
            },

            "dataProvider": $scope.chartData,
            "valueAxes": [{
                "axisAlpha": 0,
                "position": "left"
            }],
            "startDuration": 1,
            "graphs": [{
                "alphaField": "alpha",
                "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> [[additional]]</span>",
                "fillAlphas": 1,
                "title": "Income",
                "type": "column",
                "valueField": "income",
                "dashLengthField": "dashLengthColumn"
            }, {
                "id": "graph2",
                "balloonText": "<span style='font-size:12px;'>[[title]] in [[category]]:<br><span style='font-size:20px;'>[[value]]</span> [[additional]]</span>",
                "bullet": "round",
                "lineThickness": 3,
                "bulletSize": 7,
                "bulletBorderAlpha": 1,
                "bulletColor": "#FFFFFF",
                "useLineColorForBulletBorder": true,
                "bulletBorderThickness": 3,
                "fillAlphas": 0,
                "lineAlpha": 1,
                "title": "Expenses",
                "valueField": "expenses",
                "dashLengthField": "dashLengthLine"
            }],
            "categoryField": "year",
            "categoryAxis": {
                "gridPosition": "start",
                "axisAlpha": 0,
                "tickLength": 0
            },
            "export": {
                "enabled": true
            }
        });


        $scope.generateChartData = function (days) {
            $scope.chartData = [];
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.timeStamp > startDate) {
                    $scope.chartData.push({
                        date: new Date((value.timeStamp * 1000)),
                        views: value.views + value.Visits,
                        mentions: value.mentions,
                        article_blogs: value.article_blogs,


                    });
                }
            });
        }



        $scope.getOnPageLoadReports = function () {
            var canContinue = true;
            angular.forEach($rootScope.lstProfiles, function (value, key) {
                if (canContinue && value.profileType == 10) {
                    $scope.getReports(value.profileId, 90)
                    $scope.selectedProfile = value.profileId; //$rootScope.Isprofile (contain all the grp socialProfile)
                    canContinue = false;
                }
            });
        }
        $scope.getOnPageLoadReports();///this is called at the time of page loading
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