'use strict';

SocioboardApp.controller('PostedRssFeedsController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        PostedRssFeeds();

        $scope.loadpostedrssfeed=function()
        {
            debugger;
            //codes to load posted  rss Feeds
            $http.get(apiDomain + '/api/RssFeed/GetPostedRssDataByUser?userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId)
                          .then(function (response) {

                              if (response.data != "") {
                                  $scope.PostedRssFeeds = response.data;
                                  $scope.fetchdatacomplete = true;
                                  $scope.headlines = true;
                              }
                              else
                              {
                                  $scope.nofeeds = true;
                                  $scope.fetchdatacomplete = true;
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load posted  rss Feeds
        }

        $scope.loadpostedrssfeed();

  });

});