'use strict';

SocioboardApp.controller('FacebookFeedsController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components

        var start = 0; // where to start data
        var ending = start + 30; // how much data need to add on each function call
        var reachLast = false; // to check the page ends last or not
        $scope.loadmore = "Loading More data..";

        $scope.lstFbFeeds = [];
        $scope.LoadTopFeeds = function () {
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Facebook/GetFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=30')
                          .then(function (response) {
                              // $scope.lstProfiles = response.data;
                              $scope.lstFbFeeds = response.data;
                             
                              if (response.data == null) {
                                  reachLast = true;
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load  recent Feeds
        }
        $scope.LoadTopFeeds();



        $scope.listData = function () {
           
            if (reachLast) {
                return false;
            }
            $http.get(apiDomain + '/api/Facebook/GetFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=' + ending + '&count=30')
                         .then(function (response) {
                             console.log(response.data);
                             // $scope.lstProfiles = response.data;
                             if (response.data == null || response.data == "") {
                                 reachLast = true;
                                 $scope.loadmore = "Reached at bottom";
                             }
                             else {
                                 $scope.lstFbFeeds = $scope.lstFbFeeds.concat(response.data);
                                 //console.log($scope.lstFbFeeds);
                                 ending = ending + 30;
                             }
                         }, function (reason) {
                             $scope.error = reason.data;
                         });
        };


        facebookfeeds();

        $scope.renderComments = function (feedId) {
            $scope.LoadTopComments(feedId);
            $('.collapsible').collapsible({
                accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
            });
        }

        $scope.LoadTopComments = function (feedId) {
            //codes to load  recent Feed Commets
            $http.get(apiDomain + '/api/Facebook/GetFacebookPostComment?postId=' + feedId)
                          .then(function (response) {
                              $scope.lstFbComments = response.data;
                             
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load  Feed Commets
        }


        $scope.PostFacebookComment = function (feedId, ProfileId)
        {
            var postcomment = $('#postcomment_' + feedId).val();
           
            if (postcomment!='' && postcomment!=null) {
                $http.post(apiDomain + '/api/Facebook/PostFacebookComment?postId=' + feedId + '&profileId=' + ProfileId + '&message=' + postcomment)
                                     .then(function (response) {
                                         $('#postcomment_' + feedId).val('');
                                         $scope.LoadTopComments(feedId);

                                     }, function (reason) {
                                         $scope.error = reason.data;
                                     });
            }
            else {
                swal("please type comment");
            }
        }

    });
});

SocioboardApp.directive('myRepeatTabDirective', function ($timeout) {
    debugger;
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
               
                $('.collapsible').collapsible({
                    accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
                });
            });
        }
    };
})