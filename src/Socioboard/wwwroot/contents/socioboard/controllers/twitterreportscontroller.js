'use strict';

SocioboardApp.controller('TwitterreportsController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() { 
        $('#twt_report').DataTable({
            dom: 'Bfrtip',
            buttons: [
                'copy', 'csv', 'excel', 'pdf', 'print'
            ]
        });
        $scope.lstProfiles = $rootScope.lstProfiles;
        groupreport();
        
       
        var fetchdatacomplete = false;
        
        $scope.GettwtfollowfollowingGraph = function (profileOwnerId) {
            $http.get(apiDomain + '/api/TwitterReports/GettwtfollowfollowingGraph?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              $scope.GettwtfollowfollowingGraph = response.data;
                              $scope.generatefollowfollowingGraphs();
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

        }

        $scope.getprofiledata = function () {
            $http.get(apiDomain + '/api/TwitterReports/GetTwitterProfilesData?groupId=' + $rootScope.groupId)
                          .then(function (response) {                            
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
                              $scope.generatementionGraphs();
                              $scope.generateGraphs();
                             
                              $scope.getData(90);
                              //$scope.getfollowerfollowing(profileOwnerId);
                              
                              //$scope.getfeedsdata(profileOwnerId);
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }

        $scope.getfollowerfollowingcount = function () {
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/Twitter/GetAllTwitterProfiles?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              $scope.getfollowerfollowingcount = response.data;

                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }

        $scope.getfeedsdata = function () {
            $http.get(apiDomain + '/api/TwitterReports/GetTwitterFeedsdata?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              $scope.getfeedsdata = response.data;

                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }

        $scope.generatefollowfollowingGraphs = function () {
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("followerchart", am4charts.XYChart);

            // Add data
            chart.data = $scope.GettwtfollowfollowingGraph;
            // Create axes
            chart.exporting.menu = new am4core.ExportMenu();
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "twtName";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.minGridDistance = 30;

            categoryAxis.renderer.labels.template.adapter.add("dy", function (dy, target) {
                if (target.dataItem && target.dataItem.index & 2 == 2) {
                    return dy + 25;
                }
                return dy;
            });

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

            // Create series
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = "twtFollowerCounts";
            series.dataFields.categoryX = "twtName";
            series.name = "Visits";
            series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
            series.columns.template.fillOpacity = .8;

            var columnTemplate = series.columns.template;
            columnTemplate.strokeWidth = 2;
            columnTemplate.strokeOpacity = 1;



            //end follower graph

            //Start following graph 
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("followingchart1", am4charts.XYChart);

            // Add data
            chart.data = $scope.GettwtfollowfollowingGraph;
            // Create axes
            chart.exporting.menu = new am4core.ExportMenu();
            var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
            categoryAxis.dataFields.category = "twtName";
            categoryAxis.renderer.grid.template.location = 0;
            categoryAxis.renderer.minGridDistance = 30;

            categoryAxis.renderer.labels.template.adapter.add("dy", function (dy, target) {
                if (target.dataItem && target.dataItem.index & 2 == 2) {
                    return dy + 25;
                }
                return dy;
            });

            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

            // Create series
            var series = chart.series.push(new am4charts.ColumnSeries());
            series.dataFields.valueY = "twtFollowingCounts";
            series.dataFields.categoryX = "twtName";
            series.name = "Visits";
            series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
            series.columns.template.fillOpacity = .8;

            var columnTemplate = series.columns.template;
            columnTemplate.strokeWidth = 2;
            columnTemplate.strokeOpacity = 1;

            //end following graph


        }

        $scope.generateGraphs = function () {

            $scope.fetchdatacomplete = true;

            //Start Retweet
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("RetweetGraph", am4charts.XYChart);

            // Add data
            chart.data = $scope.getprofiledatawithdate;
            chart.exporting.menu = new am4core.ExportMenu();
            // Set input format for the dates
            chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";

            // Create axes
            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

            // Create series
            var series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = "retweets";
            series.dataFields.dateX = "timeStamp";
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

            // Create vertical scrollbar and place it before the value axis
            chart.scrollbarY = new am4core.Scrollbar();
            chart.scrollbarY.parent = chart.leftAxesContainer;
            chart.scrollbarY.toBack();

            // Create a horizontal scrollbar with previe and place it underneath the date axis
            chart.scrollbarX = new am4charts.XYChartScrollbar();
            chart.scrollbarX.series.push(series);
            chart.scrollbarX.parent = chart.bottomAxesContainer;
            // End Retweet
        }
        $scope.generatementionGraphs = function () {
            //  Start postlikes
            am4core.useTheme(am4themes_animated);
            // Themes end

            // Create chart instance
            var chart = am4core.create("MentionsGraph", am4charts.XYChart);

            // Add data
            chart.data = $scope.getprofiledatawithdate;
            chart.exporting.menu = new am4core.ExportMenu();
            // Set input format for the dates
            chart.dateFormatter.inputDateFormat = "yyyy-MM-dd";

            // Create axes
            var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
            var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());

            // Create series
            var series = chart.series.push(new am4charts.LineSeries());
            series.dataFields.valueY = "mentions";
            series.dataFields.dateX = "timeStamp";
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

            // Create vertical scrollbar and place it before the value axis
            chart.scrollbarY = new am4core.Scrollbar();
            chart.scrollbarY.parent = chart.leftAxesContainer;
            chart.scrollbarY.toBack();

            // Create a horizontal scrollbar with previe and place it underneath the date axis
            chart.scrollbarX = new am4charts.XYChartScrollbar();
            chart.scrollbarX.series.push(series);
            chart.scrollbarX.parent = chart.bottomAxesContainer;
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
            $scope.fromDate = new Date((startDate * 1000));
            $scope.toDate = new Date((endDate * 1000));
           // $scope.generateGraph(days);

        }

        $scope.getOnPageLoadReports = function () {
            var canContinue = true;
            var count = 0;
            $scope.GettwtfollowfollowingGraph();
            $scope.getprofiledata();
            $scope.getfollowerfollowingcount();
            $scope.getfeedsdata();
            //angular.forEach($rootScope.lstProfiles, function (value, key) {
            //   if (count == 0) {
            //        $scope.GettwtfollowfollowingGraph(value.profileOwnerId);
            //        $scope.getprofiledata(value.profileOwnerId)
            //        count = count + 1;
            //    }
            //});
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
               
                //$('#all_video_table').DataTable();
                $('#all_video_table').DataTable({
                    dom: 'Bfrtip',
                    buttons: [
                         'copy', 'csv', 'excel', 'pdf', 'print'
                    ]
                });
            });
        }
    };
})

SocioboardApp.directive('myRepeatVideoTabDirectives', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {

                //$('#all_video_table').DataTable();
                $('#Twtaccount').DataTable({
                    dom: 'Bfrtip',
                    buttons: [
                        'copy', 'csv', 'excel', 'pdf', 'print'
                    ]
                });
            });
        }
    };
})