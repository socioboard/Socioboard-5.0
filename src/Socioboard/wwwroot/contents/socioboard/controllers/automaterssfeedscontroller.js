'use strict';

SocioboardApp.controller('AutoMateRssFeedsController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    
    $scope.$on('$viewContentLoaded', function() {   
    
        autorssfeeds();
        $scope.dispbtn = true;
        $scope.AddRssUrl = function () {
            var profiles = $('#schedulerssprofiles').val();
            var rssfeedurl = $('#rssfeedurl').val();
          
            if (profiles.length > 0 && rssfeedurl != '') {
                $scope.dispbtn = false;
                //codes to add  rss Feeds url
                $http.post(apiDomain + '/api/RssFeed/AddRssUrl?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId + '&rssUrl=' + rssfeedurl)
                              .then(function (response) {
                                  $('#schedulerssprofiles').val('');
                                  $('#rssfeedurl').val('');
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to add  rss Feeds url
            }
            else {
                $scope.dispbtn = true;
                swal('please select profile and rss feed url for rss post');
            }
        }

  });

});