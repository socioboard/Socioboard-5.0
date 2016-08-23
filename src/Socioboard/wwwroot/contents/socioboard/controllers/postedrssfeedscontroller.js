'use strict';

SocioboardApp.controller('PostedRssFeedsController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        PostedRssFeeds();

        $scope.loadpostedrssfeed=function()
        {
            //codes to load posted  rss Feeds
            $http.get(apiDomain + '/api/RssFeed/GetPostedRssDataByUser?userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId)
                          .then(function (response) {
                            $scope.PostedRssFeeds=  response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load posted  rss Feeds
        }

        $scope.loadpostedrssfeed();

  });

});