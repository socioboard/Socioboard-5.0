'use strict';

SocioboardApp.controller('AutoMateRssFeedsController', function ($rootScope, $scope, $http, $timeout, apiDomain) {

    $scope.$on('$viewContentLoaded', function () {

        autorssfeeds();
        $scope.dispbtn = true;

        $scope.AddRssUrl = function () {
            var profiles = $('#schedulerssprofiles').val();
            var rssfeedurl = $('#rssfeedurl').val();
          
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
                                          //$scope.postrssfeeds(profiles, rssfeedurl);
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


        $scope.AddXMLUrl = function () {
            var profilesxml = $('#schedulerssprofilesxml').val();
            var rssfeedurl = $('#xmlfeedurl').val();

            if (profilesxml == null) {
                swal('please select profile for xml url post');
                return;
            }
            if (profilesxml.length > 0) {
                if (rssfeedurl != '') {
                    $scope.dispbtn = false;
                    //codes to add  rss Feeds url
                    $http.post(apiDomain + '/api/RssFeed/AddXMlUrl?profileId=' + profilesxml + '&userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId + '&rssUrl=' + rssfeedurl )
                                  .then(function (response) {
                                      // $('#schedulerssprofiles').val('');
                                      $('#xmlfeedurl').val('');
                                      if (response.data == "This Url Does't  Conatin xml Feed") {
                                          swal("This URL does not contain xml Feed");
                                      } else {
                                          $scope.dispbtn = true;
                                          swal(response.data);
                                          //$scope.postrssfeeds(profiles, rssfeedurl);
                                      }
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                  });
                    // end codes to add  rss Feeds url
                }
                else {
                    $scope.dispbtn = true;
                    swal('Please enter xml feed URL for post');
                }
            }
            else {
                $scope.dispbtn = true;
                swal('Please select a profile for xml feeds post');
            }
        }



        //$scope.postrssfeeds = function (profiles, rssfeedurl) {
           
        //    $http.post(apiDomain + '/api/RssFeed/PostRssFeeds?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&rssUrl=' + rssfeedurl)
        //                         .then(function (response) {
        //                             if (response.data != null)
        //                                 $scope.postesData = response.data;
        //                             console.log("data");
        //                             console.log($scope.postesData);

        //                         }, function (reason) {
        //                             $scope.error = reason.data;
        //             });
        //     }

    });

});