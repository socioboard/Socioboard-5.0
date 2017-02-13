'use strict';

SocioboardApp.controller('TwitterFeedsController', function ($rootScope, $scope, $http,$modal, $timeout, $stateParams, apiDomain,grouptask) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
        // initialize core components
        var preloadmorefeeds = false;
        var preloadmoretweets = false;
        var endtwfeeds = false;
        var endtwtweets = false;
        twitterfeeds();
        var start = 0; // where to start data
        var ending = start + 30; // how much data need to add on each function call
        var reachLast = false; // to check the page ends last or not
        var TweetsreachLast = false; // to check the user tweets ends last or not
        $scope.loadmore_twt = "click here to load more";
        $scope.loadmore_feed = "click here to load more";
        $scope.lstTwtFeeds = [];
        $scope.lstUserTweets = [];
        $scope.LoadTopFeeds = function () {
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Twitter/GetFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=30')
                          .then(function (response) {
                              // $scope.lstProfiles = response.data;
                              $scope.lstTwtFeeds = response.data;
                              $scope.preloadmorefeeds = true;
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
              debugger;
              $http.get(apiDomain + '/api/Twitter/GetUserTweets?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=30')
                          .then(function (response) {
                              $scope.lstUserTweets = response.data;
                              $scope.preloadmoretweets = true;
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
        // Code for Loading button twts ..
        $scope.listData = function () {

              if (TweetsreachLast) {
                  return false;
              }
              $http.get(apiDomain + '/api/Twitter/GetUserTweets?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=' + ending + '&count=30')
                           .then(function (response) {
                               console.log(response.data);

                               if (response.data == null || response.data == "") {
                                   TweetsreachLast = true;
                                   $scope.loadmore_twt = "Reached at bottom";
                                   $scope.endtwtweets = true;
                                   $scope.loaderclasstwt = 'hide';
                               }
                               else {
                                   $scope.lstUserTweets = $scope.lstUserTweets.concat(response.data);
                                   ending = ending + 30;
                                   $scope.listData();
                               }
                           }, function (reason) {
                               $scope.error = reason.data;
                           });
        };
        // Code for Loading button feeds ..
        $scope.listData1 = function () {

              if (reachLast) {
                  return false;
              }
              $http.get(apiDomain + '/api/Twitter/GetFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=' + ending + '&count=30')
                           .then(function (response) {
                               console.log(response.data);

                               if (response.data == null || response.data == "") {
                                   reachLast = true;
                                   $scope.loadmore_feed = "Reached at bottom";
                                   $scope.endtwfeeds = true;
                                   $scope.loaderclassfeed = 'hide';
                               }
                               else {
                                   $scope.lstTwtFeeds = $scope.lstTwtFeeds.concat(response.data);
                                   ending = ending + 30;
                                   $scope.listData1();
                               }
                           }, function (reason) {
                               $scope.error = reason.data;
                           });
          };



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
                      confirmButtonText: "Yes, Favourite it!",
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
              //$scope.modalinstance = $modal.open({
              //    templateUrl: 'twitterModalContent.html',
              //    controller: 'twittermodalcontroller',
              //    scope: $scope
              //});
              $('#Tiwtter_Modal').openModal();
          }


        $scope.saveCommentReply = function () {
              debugger;
              var message = $('#comment_text').val();
              swal({
                  title: "Are you sure?",
                  text: "Reply this message to " + $rootScope.screenName,
                  type: "warning",
                  showCancelButton: true,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "Yes, Reply it!",
                  closeOnConfirm: false
              },
                    function () {
                        // $scope.modalinstance.dismiss('cancel');
                        //code for favorite Post
                        $http.post(apiDomain + '/api/Twitter/TwitterReplyUpdate?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&profileId=' + $rootScope.profileId + '&messageId=' + $rootScope.messageId + '&message=' + message + '&screenName='+$rootScope.screenName)
                                    .then(function (response) {
                                        $('#comment_text').val('');
                                        response.data;
                                        swal(response.data);
                                    }, function (reason) {
                                        $scope.error = reason.data;
                                    });
                        // end codes favorite Post

                    });
          }

          $rootScope.taskNotification = {};
          $rootScope.tasktweetNotification = {};
          $scope.tasktwtfeedModel = function (notification) {
              $rootScope.taskNotification = notification;
              $('#TasktwtfeedModal').openModal();
              Materialize.updateTextFields();
          }
          $scope.tasktwttweetModel = function (twtnotification) {
              $rootScope.tasktweetNotification = twtnotification;
              $('#TasktwttweetModal').openModal();

          }

          $scope.addtwtfeedTask = function (feedTableType) {

              var memberId = $('.task-user-member:checked');
              var taskComment = $('#tasktwtfeedComment').val();
              if (!memberId.val()) {
                  swal('Please select a member to assign the task');
              }
              else if (!taskComment) {
                  swal('Please write a comment to assign the task');
              }
              else {
                  var assignUserId = memberId.val();
                  grouptask.addtasks(assignUserId, feedTableType, taskComment, $rootScope.taskNotification.feed, $rootScope.taskNotification.messageId, $rootScope.taskNotification.mediaUrl);

              }
          }

          $scope.addtwttweetTask = function (feedTableType) {

              var memberId = $('.task-user-member:checked');
              var taskComment = $('#tasktwttweetComment').val();
              if (!memberId.val()) {
                  swal('Please select a member to assign the task')
              }
              else if (!taskComment) {
                  swal('Please write a comment to assign the task')
              }
              else {
                  var assignUserId = memberId.val();
                  grouptask.addtasks(assignUserId, feedTableType, taskComment, $rootScope.tasktweetNotification.twitterMsg, $rootScope.tasktweetNotification.messageId, '');

              }
          }
    });
});


SocioboardApp.controller('twittermodalcontroller', function ($rootScope, $scope, $http, apiDomain) {
    $scope.closeModal = function () {
        $scope.modalinstance.dismiss('cancel');
    }
});