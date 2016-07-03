'use strict';

SocioboardApp.controller('TwitterFeedsController', function ($rootScope, $scope, $http,$modal, $timeout, $stateParams, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        twitterfeeds();
        var start = 0; // where to start data
        var ending = start + 30; // how much data need to add on each function call
        var reachLast = false; // to check the page ends last or not
        var TweetsreachLast = false; // to check the user tweets ends last or not
        $scope.loadmore = "Loading More data..";
        $scope.lstTwtFeeds = [];
        $scope.lstUserTweets = [];
        $scope.LoadTopFeeds = function () {
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Twitter/GetFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=30')
                          .then(function (response) {
                              // $scope.lstProfiles = response.data;
                              $scope.lstTwtFeeds = response.data;
                              if (response.data == null) {
                                  reachLast = true;
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load  recent Feeds
        }


          $scope.LoadTopTweets = function () {
            //codes to load  recent Tweets
              $http.get(apiDomain + '/api/Twitter/GetUserTweets?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=30')
                          .then(function (response) {
                              $scope.lstUserTweets = response.data;
                              if (response.data == null) {
                                  TweetsreachLast = true;
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
              // end codes to load  recent Tweets
        }
          $scope.LoadTopFeeds();
          $scope.LoadTopTweets();

          $scope.twitterretweet = function (screenName, profileId, messageId) {
              swal({
                  title: "Are you sure?",
                  text: "Retweet this message by " + screenName,
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "Yes, Retweet it!",
                  closeOnConfirm: false
              },
           function () {
               //code for Retweet Post
               $http.post(apiDomain + '/api/Twitter/TwitterRetweet_post?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&profileId=' + profileId + '&messageId='+messageId)
                           .then(function (response) {
                               response.data;
                               swal(response.data);
                           }, function (reason) {
                               $scope.error = reason.data;
                           });
               // end codes Retweet Post
              
           });
          }

          $scope.twitterfavorite=function(screenName, profileId, messageId)
          {
                  swal({
                      title: "Are you sure?",
                      text: "Favorite this message by " + screenName,
                      type: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#DD6B55",
                      confirmButtonText: "Yes, Retweet it!",
                      closeOnConfirm: false
                  },
               function () {
                   //code for favorite Post
                   $http.post(apiDomain + '/api/Twitter/TwitterFavorite_post?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&profileId=' + profileId + '&messageId='+messageId)
                               .then(function (response) {
                                   response.data;
                                   swal(response.data);
                               }, function (reason) {
                                   $scope.error = reason.data;
                               });
                   // end codes favorite Post
              
               });
          }

          $scope.twitterreply = function (screenName,profileId, messageId) {
              $rootScope.profileId = profileId;
              $rootScope.messageId = messageId;
              $rootScope.screenName = screenName;
              $scope.modalinstance = $modal.open({
                  templateUrl: 'twitterModalContent.html',
                  controller: 'twittermodalcontroller',
                  scope: $scope
              });
          }
    });
});


SocioboardApp.controller('twittermodalcontroller', function ($rootScope, $scope, $http, apiDomain) {
    $scope.closeModal = function () {
        $scope.modalinstance.dismiss('cancel');
    }
  
    $scope.saveCommentReply = function () {
        var message=$('#comment_text').val();
        swal({
            title: "Are you sure?",
            text: "Reply this message by " + $rootScope.screenName,
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#DD6B55",
            confirmButtonText: "Yes, Reply it!",
            closeOnConfirm: false
        },
              function () {
                  $scope.modalinstance.dismiss('cancel');
                  //code for favorite Post
                  $http.post(apiDomain + '/api/Twitter/TwitterReplyUpdate?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&profileId=' + $rootScope.profileId + '&messageId=' + $rootScope.messageId + '&message=' + message)
                              .then(function (response) {
                                  $('#comment_text').val('');
                                  swal(response.data);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                  // end codes favorite Post

              });
    }
});