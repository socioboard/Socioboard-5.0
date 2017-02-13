'use strict';

SocioboardApp.controller('AutoMateRssFeedsController', function ($rootScope, $scope, $http, $timeout, apiDomain) {

    $scope.$on('$viewContentLoaded', function () {

        autorssfeeds();
        $scope.dispbtn = true;
        $scope.AddRssUrl = function () {
            var profiles = $('#schedulerssprofiles').val();
            var rssfeedurl = $('#rssfeedurl').val();
            console.log(profiles);
            if (profiles == null)
            {
                swal('please select profile for rss post');
                return;
            }
            if (profiles.length > 0) {
                if (rssfeedurl != '') {
                    $scope.dispbtn = false;
                    //codes to add  rss Feeds url
                    $http.post(apiDomain + '/api/RssFeed/AddRssUrl?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId + '&rssUrl=' + rssfeedurl)
                                  .then(function (response) {
                                     // $('#schedulerssprofiles').val('');
                                      $('#rssfeedurl').val('');
                                      if (response.data == "This Url Does't  Conatin Rss Feed")
                                      {
                                          swal("This URL does not contain RSS Feed");
                                      } else {
                                          $scope.dispbtn = true;
                                          swal(response.data);
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                  });
                    // end codes to add  rss Feeds url
                }
                else {
                    $scope.dispbtn = true;
                    swal('Please enter feed URL for RSS post');
                }
            }
            else {
                $scope.dispbtn = true;
                swal('Please select a profile for RSS post');
            }
        }

    });

});