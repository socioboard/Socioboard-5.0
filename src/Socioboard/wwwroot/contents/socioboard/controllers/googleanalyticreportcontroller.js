'use strict';

SocioboardApp.controller('GoogleAnalyticreportController', function ($rootScope, $scope, $http, $timeout,apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
       //alert('helo');
        
         googleanalyticreport();
         var fetchdatacomplete = false;
        $scope.deleteProfile = function (profileId) {
            // console.log(profileId);
            swal({
                title: "Are you sure?",
                text: "You will not be able to send any message via this account!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
	        function () {
	            //todo: code to delete profile
	            swal("Deleted!", "Your profile has been deleted.", "Success");
	        });
        }
      
        $scope.getReports = function (profileId, days) {
           // alert('hellogetReports');
            //codes to load profiles start
        
            $http.get(apiDomain + '/api/GoogleAnalyticsReport/GetGoogleAnalyticsReportData?profileId=' + profileId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.dailyReportsList = response.data;
                              $scope.fetchdatacomplete = true;
                              $scope.getData(profileId,days);
                          }, function (reason) {
                             
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
                             
                              $scope.error = reason.data;
                          });
            // end codes to load profiles
        }

        $scope.GetArticlesAndBlogsReports = function (profileId, days) {
            //codes to load profiles start
            $http.get(apiDomain + '/api/GoogleAnalyticsReport/GetArticlesAndBlogsReports?profileId=' + profileId + '&daysCount=' + days)
                          .then(function (response) {
                              // $scope.ArticlesAndBlogsReports = response.data;
                              $scope.date(response.data);
                          }, function (reason) {
                             
                              $scope.error = reason.data;
                          });
            // end codes to load profiles
        }

        $scope.date = function (parm) {

            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i].created_Time);
                var newdate = date.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3];
                parm[i].created_Time = date;
            }
            $scope.ArticlesAndBlogsReports = parm;

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
                if (value.date > startDate) {
                    views = views + parseInt(value.views) + parseInt(value.visits);
                    twitterMention = twitterMention + parseInt(value.twitterMention);
                    article_Blogs = article_Blogs + parseInt(value.article_Blogs);

                }
            });
            $scope.twitterMention = twitterMention;
            $scope.views = views;
            $scope.article_Blogs = article_Blogs;
           // $scope.graphData = $scope.graphData.concat(value);
            $scope.fromDate = moment(new Date((startDate * 1000))).format('YYYY/MM/DD');
            $scope.toDate = moment(new Date((endDate * 1000))).format('YYYY/MM/DD');
            $scope.generateChartData(days);
            $scope.generateGraph();
        }


        $scope.generateGraph = function () {
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
                    "title": "website traffic",
                    "valueField": "views",
                    "dashLengthField": "dashLengthLine"
                }, {
                    "id": "graph3",
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
                    "title": "mentions",
                    "valueField": "mentions",
                    "dashLengthField": "dashLengthLine"
                }, {
                    "id": "graph4",
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
                    "title": "article_blogs",
                    "valueField": "article_blogs",
                    "dashLengthField": "dashLengthLine"
                }],
                "categoryField": "date",
                "categoryAxis": {
                    "parseDates": true,
                    "axisColor": "#DADADA",
                    "minorGridEnabled": true
                },
                "export": {
                    "enabled": true
                }
            });
        }

      


        $scope.generateChartData = function (days) {
            $scope.chartData = [];
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
         
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.date > startDate) {
                    $scope.chartData.push({
                        date: new Date((value.date * 1000)),
                        views: parseInt(value.views) + parseInt(value.visits),
                        mentions: parseInt(value.twitterMention),
                        article_blogs: parseInt(value.article_Blogs),


                    });
                }
            });
          
        }


       
        $scope.getOnPageLoadReports = function () {
            //console.log('-----------------------');
           // alert('hellogetgetOnPageLoadReports');
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