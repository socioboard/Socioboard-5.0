'use strict';

SocioboardApp.controller('InstagramreportController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        instagramreport();
        $scope.loaderss = true;
        $scope.tableloadss = true;
        $scope.getprofiledata = function (profileOwnerId) {
       
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/InstagramReports/GetInstagramProfilesData?groupId=' + profileOwnerId)
                          .then(function (response) {
                            
                              $scope.getprofiledatawithdate = [];
                              $scope.getprofilelist = response.data;
                             
                              angular.forEach($scope.getprofilelist, function (value, key) {
                                  $scope.getprofiledatawithdate.push({

                                      postcomment: value.postcomment,
                                      followcount: value.followcount,
                                      followingcount: value.followingcount,
                                      mediaCount: value.mediaCount,
                                      postlike: value.postlike,
                                      fullName: value.fullName,
                                      date: new Date((value.date * 1000))

                                  });
                              });
                              
                             // $scope.generateGraphs();
                              $scope.getData(90);
                              $scope.getfollowerfollowingCount(profileOwnerId);
                              $scope.getfeedsdata(profileOwnerId);
                              $scope.generateGraphs();
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }

       
        $scope.getprofilelist = [];

        
        $scope.GetInstafollowfollowingGraph = function (profileOwnerId) {
         
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/InstagramReports/GetInstafollowfollowingGraph?groupId=' + profileOwnerId)
                          .then(function (response) {
                            
                              $scope.GetInstafollowfollowingGraph = response.data;
                              $scope.generatefollowGraphs();
                              $scope.generatefollowingGraphs();
                              $scope.loaderss = false;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }

        $scope.getfollowerfollowingCount = function (profileOwnerId) {
           
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/Instagram/GetAllInstagramProfiles?groupId=' + profileOwnerId)
                          .then(function (response) {
                            
                              $scope.getfollowerfollowingCount = response.data;
                              $scope.tableloadss = false;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }
        $scope.getfeedsdata = function (profileOwnerId) {
          
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/InstagramReports/GetInstagramFeedsdata?groupId=' + profileOwnerId)
                          .then(function (response) {
                            
                              $scope.getfeedsdata = response.data;

                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }

        $scope.generatefollowGraphs = function () {

            //Start new following graph 
            var chart = AmCharts.makeChart("followingchart",
              {
                  "type": "serial",
                  "theme": "light",
                  "dataProvider": $scope.GetInstafollowfollowingGraph,
                  "valueAxes": [{
                      //"maximum": 80000,
                      //"minimum": 0,
                      "axisAlpha": 0,
                      "dashLength": 4,
                      "position": "left"
                  }],
                  "startDuration": 1,
                  "graphs": [{
                      "balloonText": "<span style='font-size:13px;'>[[category]]: <b>[[value]]</b></span>",
                      "bulletOffset": 10,
                      "bulletSize": 52,
                      "colorField": "colors",
                      "cornerRadiusTop": 8,
                      "customBulletField": "profilepic",
                      "fillAlphas": 0.8,
                      "lineAlpha": 0,
                      "type": "column",
                      "valueField": "InstaFollowingCounts"
                  }],
                  "marginTop": 0,
                  "marginRight": 0,
                  "marginLeft": 0,
                  "marginBottom": 0,
                  "autoMargins": false,
                  "categoryField": "instaName",
                  "categoryAxis": {
                      "axisAlpha": 0,
                      "gridAlpha": 0,
                      "inside": true,
                      "tickLength": 0
                  },
                  "export": {
                      "enabled": true
                  }
              });

            //end 
            //Start new follower graph 
            var chart = AmCharts.makeChart("followerchart",
              {
                  "type": "serial",
                  "theme": "light",
                  "dataProvider": $scope.GetInstafollowfollowingGraph,
                  "valueAxes": [{
                      //"maximum": 80000,
                      //"minimum": 0,
                      "axisAlpha": 0,
                      "dashLength": 4,
                      "position": "left"
                  }],
                  "startDuration": 1,
                  "graphs": [{
                      "balloonText": "<span style='font-size:13px;'>[[category]]: <b>[[value]]</b></span>",
                      "bulletOffset": 10,
                      "bulletSize": 52,
                      "colorField": "colors",
                      "cornerRadiusTop": 8,
                      "customBulletField": "profilepic",
                      "fillAlphas": 0.8,
                      "lineAlpha": 0,
                      "type": "column",
                      "valueField": "instaFollowerCounts"
                  }],
                  "marginTop": 0,
                  "marginRight": 0,
                  "marginLeft": 0,
                  "marginBottom": 0,
                  "autoMargins": false,
                  "categoryField": "instaName",
                  "categoryAxis": {
                      "axisAlpha": 0,
                      "gridAlpha": 0,
                      "inside": true,
                      "tickLength": 0
                  },
                  "export": {
                      "enabled": true
                  }
              });

            //end 
        }
        $scope.generatefollowingGraphs = function () {

            //Start new following graph 
            var chart = AmCharts.makeChart("followingchart1",
              {
                  "type": "serial",
                  "theme": "light",
                  "dataProvider": $scope.GetInstafollowfollowingGraph,
                  "valueAxes": [{
                      //"maximum": 80000,
                      //"minimum": 0,
                      "axisAlpha": 0,
                      "dashLength": 4,
                      "position": "left"
                  }],
                  "startDuration": 1,
                  "graphs": [{
                      "balloonText": "<span style='font-size:13px;'>[[category]]: <b>[[value]]</b></span>",
                      "bulletOffset": 10,
                      "bulletSize": 52,
                      "colorField": "colors",
                      "cornerRadiusTop": 8,
                      "customBulletField": "profilepic",
                      "fillAlphas": 0.8,
                      "lineAlpha": 0,
                      "type": "column",
                      "valueField": "instaFollowingCounts"
                  }],
                  "marginTop": 0,
                  "marginRight": 0,
                  "marginLeft": 0,
                  "marginBottom": 0,
                  "autoMargins": false,
                  "categoryField": "instaName",
                  "categoryAxis": {
                      "axisAlpha": 0,
                      "gridAlpha": 0,
                      "inside": true,
                      "tickLength": 0
                  },
                  "export": {
                      "enabled": true
                  }
              });

            //end 
           
        }

        $scope.generateGraphs = function () {


            //new test for postlikes
            var chart = AmCharts.makeChart("POSTCOMMENTSGraph", {
                "theme": "light",
                "color": "#cccc00",
                "type": "serial",
                "startDuration": 2,
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.getprofiledatawithdate,
                "valueAxes": [{
                    "inside": true,
                    "axisAlpha": 0,
                    "color": "#8533ff"
                }],
                "graphs": [{
                    "balloonText": "[[category]]: <b>[[value]]</b>",
                    "fillColorsField": "color",
                    "fillAlphas": 1,
                    "lineAlpha": 0.1,
                    "type": "column",
                    "valueField": "postcomment",
                    "color": "#FF9E01"
                }],
                "depth3D": 20,
                "angle": 30,
                "chartCursor": {
                    "categoryBalloonEnabled": false,
                    "cursorAlpha": 0,
                    "zoomable": true,
                    "color": "#FF9E01"
                },
                "categoryField": "date",
                "categoryAxis": {
                    "gridPosition": "start",
                    "labelRotation": 90,
                    "color": "#ff3377",
                    "parseDates": true,
                },
                "export": {
                    "enabled": true
                }

            });
            // new End Test for postcomments


            //new Test for postlikes
            var chart = AmCharts.makeChart("POSTLIKESGraph", {
                "theme": "light",
                "type": "serial",
                "startDuration": 2,
                "legend": {
                    "useGraphSettings": true
                },
                "dataProvider": $scope.getprofiledatawithdate,
                "valueAxes": [{
                    "inside": true,
                    "axisAlpha": 0
                }],
                "graphs": [{
                    "balloonText": "[[category]]: <b>[[value]]</b>",
                    "fillColorsField": "color",
                    "fillAlphas": 1,
                    "lineAlpha": 0.1,
                    "type": "column",
                    "valueField": "postlike"
                }],
                "depth3D": 20,
                "angle": 30,
                "chartCursor": {
                    "categoryBalloonEnabled": false,
                    "cursorAlpha": 0,
                    "zoomable": true
                },
                "categoryField": "date",
                "categoryAxis": {
                    "gridPosition": "start",
                    "labelRotation": 90,
                    "parseDates": true,
                },
                "export": {
                    "enabled": true
                }

            });
            // new End Test for postlikes

            //new test for media
            var chart = AmCharts.makeChart("MEDIAGraph", {
                "theme": "light",
                "type": "serial",
                "startDuration": 2,
                "dataProvider": $scope.getprofiledatawithdate,
                "valueAxes": [{
                    "inside": true,
                    "axisAlpha": 0
                }],
                "graphs": [{
                    "balloonText": "[[category]]: <b>[[value]]</b>",
                    "fillColorsField": "color",
                    "fillAlphas": 1,
                    "lineAlpha": 0.1,
                    "type": "column",
                    "valueField": "mediaCount"
                }],
                "depth3D": 20,
                "angle": 30,
                "chartCursor": {
                    "categoryBalloonEnabled": false,
                    "cursorAlpha": 0,
                    "zoomable": true
                },
                "categoryField": "date",
                "categoryAxis": {
                    "gridPosition": "start",
                    "labelRotation": 90,
                    "parseDates": true,
                },
                "export": {
                    "enabled": true
                }

            });
            //new end test for media

           
        }
    
     

        $scope.getData = function (days) {
          

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

            angular.forEach($scope.getprofilelist, function (value, key) {
                if (value.date > startDate) {
                    totalMedia = totalMedia + value.mediaCount;
                    totalFollower = totalFollower + value.followcount;
                    totalFollowing = totalFollowing + value.followingcount;
                    totalPOSTCOMMENTS = totalPOSTCOMMENTS + value.postcomment;
                    totalPOSTLIKES = totalPOSTLIKES + value.postlike;

                }
            });


            $scope.totalMedia = totalMedia;
            $scope.totalFollower = totalFollower;
            $scope.totalFollowing = totalFollowing;
            $scope.totalPOSTCOMMENTS = totalPOSTCOMMENTS;
            $scope.totalPOSTLIKES = totalPOSTLIKES;
            //$scope.generateGraphs();

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
            var count = 0;
            angular.forEach($rootScope.lstProfiles, function (value, key) {
             if (count == 0) {
                  $scope.GetInstafollowfollowingGraph(value.profileOwnerId);
                    $scope.getprofiledata(value.profileOwnerId)
                    
                    count = count + 1;
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