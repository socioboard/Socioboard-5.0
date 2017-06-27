'use strict';

SocioboardApp.controller('TwitterreportsController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        $scope.lstProfiles = $rootScope.lstProfiles;
        groupreport();
        
       
        var fetchdatacomplete = false;
        
        $scope.GettwtfollowfollowingGraph = function (profileOwnerId) {
            //codes to load  instgarm  profiles start
              $http.get(apiDomain + '/api/TwitterReports/GettwtfollowfollowingGraph?groupId=' + profileOwnerId)
                          .then(function (response) {
                            $scope.GettwtfollowfollowingGraph = response.data;
                              $scope.generatefollowfollowingGraphs();
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }

        $scope.getprofiledata = function (profileOwnerId) {
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/TwitterReports/GetTwitterProfilesData?groupId=' + profileOwnerId)
                          .then(function (response) {
                              $scope.getfollowerfollowingcount(profileOwnerId);
                              $scope.getfeedsdata(profileOwnerId);
                              $scope.getprofiledatawithdate = [];
                              $scope.getprofilelist = response.data;
                              angular.forEach($scope.getprofilelist, function (value, key) {
                                  $scope.getprofiledatawithdate.push({

                                      directMessagesReceived: value.directMessagesReceived,
                                      directMessagesSent: value.directMessagesSent,
                                      mentions: value.mentions,
                                      messagesReceived: value.messagesReceived,
                                      messagesSent: value.messagesSent,
                                      newFollowers: value.newFollowers,
                                      newFollowing: value.newFollowing,
                                      retweets: value.retweets,
                                      timeStamp: new Date((value.timeStamp * 1000))

                                  });
                              });
                             
                              $scope.getData(90);
                              //$scope.getfollowerfollowing(profileOwnerId);
                              
                              //$scope.getfeedsdata(profileOwnerId);
                              $scope.generateGraphs();
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }

        $scope.getfollowerfollowingcount = function (profileOwnerId) {
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/Twitter/GetAllTwitterProfiles?groupId=' + profileOwnerId)
                          .then(function (response) {
                              $scope.getfollowerfollowingcount = response.data;

                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }

        $scope.getfeedsdata = function (profileOwnerId) {
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/TwitterReports/GetTwitterFeedsdata?groupId=' + profileOwnerId)
                          .then(function (response) {
                              $scope.getfeedsdata = response.data;

                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }

        $scope.generatefollowfollowingGraphs = function () {

           //Start follower graph 
            var chart = AmCharts.makeChart("followerchart",
              {
                  "type": "serial",
                  "theme": "light",
                  "dataProvider": $scope.GettwtfollowfollowingGraph,
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
                      "valueField": "twtFollowerCounts"
                  }],
                  "marginTop": 0,
                  "marginRight": 0,
                  "marginLeft": 0,
                  "marginBottom": 0,
                  "autoMargins": false,
                  "categoryField": "twtName",
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

            //end follower graph

            //Start following graph 
            var chart = AmCharts.makeChart("followingchart1",
              {
                  "type": "serial",
                  "theme": "light",
                  "dataProvider": $scope.GettwtfollowfollowingGraph,
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
                      "valueField": "twtFollowingCounts"
                  }],
                  "marginTop": 0,
                  "marginRight": 0,
                  "marginLeft": 0,
                  "marginBottom": 0,
                  "autoMargins": false,
                  "categoryField": "twtName",
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

            //end following graph


        }

        $scope.generateGraphs = function () {

            $scope.fetchdatacomplete = true;

           //Start Retweet
            var chart = AmCharts.makeChart("RetweetGraph", {
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
                    "valueField": "retweets",
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
                "categoryField": "timeStamp",
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
            // End Retweet


            //  Start postlikes
            var chart = AmCharts.makeChart("MentionsGraph", {
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
                    "valueField": "mentions"
                }],
                "depth3D": 20,
                "angle": 30,
                "chartCursor": {
                    "categoryBalloonEnabled": false,
                    "cursorAlpha": 0,
                    "zoomable": true
                },
                "categoryField": "timeStamp",
                "categoryAxis": {
                    "gridPosition": "start",
                    "labelRotation": 90,
                    "parseDates": true,
                },
                "export": {
                    "enabled": true
                }

            });
            //  End postlikes

            ////Start follower graph 
            //var chart = AmCharts.makeChart("followerchart",
            //  {
            //      "type": "serial",
            //      "theme": "light",
            //      "dataProvider": $scope.GettwtfollowfollowingGraph,
            //      "valueAxes": [{
            //          //"maximum": 80000,
            //          //"minimum": 0,
            //          "axisAlpha": 0,
            //          "dashLength": 4,
            //          "position": "left"
            //      }],
            //      "startDuration": 1,
            //      "graphs": [{
            //          "balloonText": "<span style='font-size:13px;'>[[category]]: <b>[[value]]</b></span>",
            //          "bulletOffset": 10,
            //          "bulletSize": 52,
            //          "colorField": "colors",
            //          "cornerRadiusTop": 8,
            //          //"customBulletField": "profilepic",
            //          "fillAlphas": 0.8,
            //          "lineAlpha": 0,
            //          "type": "column",
            //          "valueField": "twtFollowerCounts"
            //      }],
            //      "marginTop": 0,
            //      "marginRight": 0,
            //      "marginLeft": 0,
            //      "marginBottom": 0,
            //      "autoMargins": false,
            //      "categoryField": "twtName",
            //      "categoryAxis": {
            //          "axisAlpha": 0,
            //          "gridAlpha": 0,
            //          "inside": true,
            //          "tickLength": 0
            //      },
            //      "export": {
            //          "enabled": true
            //      }
            //  });

            ////end follower graph

            ////Start following graph 
            //var chart = AmCharts.makeChart("followingchart",
            //  {
            //      "type": "serial",
            //      "theme": "light",
            //      "dataProvider": $scope.GettwtfollowfollowingGraph,
            //      "valueAxes": [{
            //          //"maximum": 80000,
            //          //"minimum": 0,
            //          "axisAlpha": 0,
            //          "dashLength": 4,
            //          "position": "left"
            //      }],
            //      "startDuration": 1,
            //      "graphs": [{
            //          "balloonText": "<span style='font-size:13px;'>[[category]]: <b>[[value]]</b></span>",
            //          "bulletOffset": 10,
            //          "bulletSize": 52,
            //          "colorField": "colors",
            //          "cornerRadiusTop": 8,
            //          //"customBulletField": "profilepic",
            //          "fillAlphas": 0.8,
            //          "lineAlpha": 0,
            //          "type": "column",
            //          "valueField": "twtFollowingCounts"
            //      }],
            //      "marginTop": 0,
            //      "marginRight": 0,
            //      "marginLeft": 0,
            //      "marginBottom": 0,
            //      "autoMargins": false,
            //      "categoryField": "twtName",
            //      "categoryAxis": {
            //          "axisAlpha": 0,
            //          "gridAlpha": 0,
            //          "inside": true,
            //          "tickLength": 0
            //      },
            //      "export": {
            //          "enabled": true
            //      }
            //  });

            ////end following graph
           

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
           // $scope.graphData = [];
            angular.forEach($scope.getprofilelist, function (value, key) {
                if (value.timeStamp > startDate) {
                    totalNewFollowers = totalNewFollowers + value.newFollowers;
                    totalNewFollowing = totalNewFollowing + value.newFollowing;
                    totalMentions = totalMentions + value.mentions;
                    totalRetweets = totalRetweets + value.retweets;
                    toatlDirectMessagesReceived = toatlDirectMessagesReceived + value.directMessagesReceived;
                    totalDirectMessagesSent = totalDirectMessagesSent + value.directMessagesSent;
                    totalMessagesReceived = totalMessagesReceived + value.messagesReceived;
                    totalMessagesSent = totalMessagesSent + value.messagesSent;
                   // $scope.graphData = $scope.graphData.concat(value);
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
            //$scope.fromDate = moment(new Date((startDate * 1000))).format('YYYY/MM/DD');
            //$scope.toDate = moment(new Date((endDate * 1000))).format('YYYY/MM/DD');
           // $scope.generateGraph(days);

        }

        $scope.getOnPageLoadReports = function () {
            var canContinue = true;
            var count = 0;
            angular.forEach($rootScope.lstProfiles, function (value, key) {
               if (count == 0) {
                    $scope.GettwtfollowfollowingGraph(value.profileOwnerId);
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



SocioboardApp.directive('myRepeatVideoTabDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
               
                $('#all_video_table').DataTable();
            });
        }
    };
})