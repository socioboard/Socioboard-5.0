'use strict';

SocioboardApp.controller('PostedRssFeedsController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        PostedRssFeeds();

        $scope.skip = 0;
        $scope.count = 10;
        $scope.processCompleted = false;
        $scope.initialLoad = false;
        var onScrollLoad = true;


        $scope.loadpostedrssfeed = function (skip, count) {

           
            if (skip === 0) {
                $scope.initialLoad = true;
            }

            onScrollLoad = false;

            //codes to load posted  rss Feeds
            $http.get(apiDomain + '/api/RssFeed/GetPostedRssDataByUserPagination?userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId + '&skip=' + skip + '&count=' + count)
                          .then(function (response) {

                              if (response.data != "") {
                                  $scope.PostedRssFeeds = response.data;
                                  $scope.fetchdatacomplete = true;
                                  $scope.headlines = true;
                              }
                              else {
                                  $scope.nofeeds = true;
                                  $scope.fetchdatacomplete = true;
                                  $scope.processCompleted = true;
                              }
                              onScrollLoad = true;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });


        }




        $(window).scroll(function () {
            if (($(window).scrollTop() >= ($(document).height() - $(window).height()) * 0.9)) {

                if ($scope.processCompleted) {
                    return;
                }

                if (onScrollLoad) {
                    if (!$scope.initialLoad) {
                        $scope.initialLoad = true;
                        $scope.skip = 0;
                        $scope.loadpostedrssfeed($scope.skip, $scope.count);
                    } else {
                        $scope.skip += $scope.count;
                        $scope.loadpostedrssfeed($scope.skip, $scope.count);
                    }

                }

            }
        });

        $scope.loadpostedrssfeed(0, $scope.count);


    });

});