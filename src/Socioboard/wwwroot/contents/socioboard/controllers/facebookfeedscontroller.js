'use strict';

SocioboardApp.controller('FacebookFeedsController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, grouptask) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        // initialize core components
        var preloadmore = false;
        var endfeeds = false;
        var start = 0; // where to start data
        var ending = start + 30; // how much data need to add on each function call
        var reachLast = false; // to check the page ends last or not
        var count = 30;
        $scope.loadmore = "Load More Feeds";
        $scope.lstFbComments = [];
        $scope.getHttpsURL = function (obj) {
          
            return obj.replace("http:", "https:")
        };
        $scope.lstFbFeeds = [];
        if ($rootScope.user.TrailStatus == 2) {
            count = 5
        }
        $scope.LoadTopFeeds = function () {
            $scope.filters = false;
            $scope.preloadmore = false;
            $scope.lstFbFeeds = null;
                //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Facebook/GetTopFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=' + count)
                              .then(function (response) {
                                  // $scope.lstProfiles = response.data;
                                  $scope.lstFbFeeds = response.data;
                                  $scope.preloadmore = true;
                                  setTimeout(function () { $('.collapsible').collapsible(); }, 1000);
                                 // $('.collapsible').collapsible();
                                  // $scope.feeddate(response.data);
                                  //$scope.loaderclass = 'hide';
                                  //console.log(response.data);
                                  if (response.data == null) {
                                      reachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load  recent Feeds
            
        }
        $scope.LoadTopFeeds();


        $scope.feeddate = function (parm) {

            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i]._facebookFeed.feedDate);
                var d = new Date(parm[i].feedDate);
                var d4 = d.setTime(d.getTime() + 37800000);;
                var date1 = moment(d4);
                var newdate = date1.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3] + " " + splitdate[4];
                parm[i]._facebookFeed.feedDate = date;
                if (parm[i]._facebookComment.length > 0) {
                    for (var j = 0; j < parm[i]._facebookComment.length; j++) {
                        var datecomment = moment(parm[i]._facebookComment[j].commentdate);
                        var dcomment = new Date(parm[i]._facebookComment[j].commentdate);
                        var d4comment = dcomment.setTime(d.getTime() + 37800000);
                        var date1comment = moment(d4comment);
                        var newdatecomment = date1comment.toString();
                        var splitdatecomment = newdatecomment.split(" ");
                        datecomment = splitdatecomment[0] + " " + splitdatecomment[1] + " " + splitdatecomment[2] + " " + splitdatecomment[3] + " " + splitdatecomment[4];
                        parm[i]._facebookComment[j].commentdate = datecomment;
                    }
                }

            }
            $scope.lstFbFeeds = parm;

        }


        $scope.listData = function () {

            if (reachLast) {
                return false;
            }
            $http.get(apiDomain + '/api/Facebook/GetTopFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=' + ending + '&count=30')
                         .then(function (response) {
                             //console.log(response.data);
                             // $scope.lstProfiles = response.data;
                             if (response.data == null || response.data == "") {
                                 reachLast = true;
                                 $scope.loadmore = "No more feeds to Load";
                                 $scope.loaderclass = 'hide';
                                 $scope.endfeeds = true;
                                 
                             }
                             else {
                                 $scope.lstFbFeeds = $scope.lstFbFeeds.concat(response.data);
                                 //console.log($scope.lstFbFeeds);
                                 ending = ending + 30;
                                 $scope.listData();
                             }
                         }, function (reason) {
                             $scope.error = reason.data;
                         });
        };


        facebookfeeds();

        $scope.filterSearch = function (typeFilter) {
            $scope.filters = true;
            $scope.preloadmore = false;
            $scope.lstFbFeeds = null;
            $http.get(apiDomain + '/api/Facebook/GetTopFilterFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=' + 30 + '&typeFilter=' + typeFilter)
                              .then(function (response) {
                                  // $scope.lstProfiles = response.data;
                                  $scope.lstFbFeeds = response.data;
                                  $scope.preloadmore = true;
                                  setTimeout(function () { $('.collapsible').collapsible(); }, 1000);
                                  // $('.collapsible').collapsible();
                                  // $scope.feeddate(response.data);
                                  //$scope.loaderclass = 'hide';
                                  //console.log(response.data);
                                  if (response.data == null) {
                                      reachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
        };


        $scope.renderComments = function (feedId, index) {
            $scope.LoadTopComments(feedId, index);
            $('.collapsible').collapsible({
                accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
            });
        }

        $scope.LoadTopComments = function (feedId, index) {
            //codes to load  recent Feed Commets
            $http.get(apiDomain + '/api/Facebook/GetFacebookPostComment?postId=' + feedId)
                          .then(function (response) {
                              // $scope.lstFbComments = response.data;
                              $scope.commentdate(response.data, index);
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load  Feed Commets
        }


        $scope.commentdate = function (parm, index) {

            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i].commentdate);
                var d = new Date(parm[i].commentdate);
                var d4 = d.setTime(d.getTime() + 37800000);
                var date1 = moment(d4);
                var newdate = date1.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3] + " " + splitdate[4];
                parm[i].commentdate = date;
            }
            $scope.lstFbComments[index] = parm;

        }


        $scope.PostFacebookComment = function (feedId, ProfileId) {
            var postcomment = $('#postcomment_' + feedId).val();

            if (/\S/.test(postcomment)) {
                $scope.sendingcomment = true;
                $scope.sendicon = true;
                $http.post(apiDomain + '/api/Facebook/PostFacebookComment?postId=' + feedId + '&profileId=' + ProfileId + '&message=' + encodeURIComponent(postcomment))
                                     .then(function (response) {
                                         $scope.sendingcomment = false;
                                         swal(response.data);
                                         $('#postcomment_' + feedId).val('');
                                         // $scope.LoadTopComments(feedId);
                                         $scope.LoadTopFeeds();
                                         setTimeout(function () {
                                             $scope.sendicon = false;
                                         }, 1000);
                                     }, function (reason) {
                                         $scope.error = reason.data;
                                     });
            }
            else {
                swal("Please type comment");
            }
        }

        $scope.taskfbfeedModel = function (notification) {
            $('#TaskfbfeedModal').openModal();
            $rootScope.taskNotification = notification;
            Materialize.updateTextFields();
        }
        $scope.addTask = function (feedTableType) {

            var memberId = $('.task-user-member:checked');
            var taskComment = $('#taskfbfeedComment').val();
            if (!memberId.val()) {
                swal('Please select a member to assign the task')
            }
            else if (!(/\S/.test(taskComment))) {
                swal('Please write a comment to assign the task')
            }
            else {
                var assignUserId = memberId.val();
                grouptask.addtasks(assignUserId, feedTableType, taskComment, $rootScope.taskNotification.feedDescription, $rootScope.taskNotification.feedId, $rootScope.taskNotification.picture);

            }
        }



    });
});

SocioboardApp.directive('myRepeatTabDirective', function ($timeout) {
   
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

//SocioboardApp.directive('myRepeatTimeoutfacebookpostsDirective', function ($timeout) {
//    return function (scope, element, attrs) {
//if (scope.$last === true) {
//            $timeout(function () {
//                $('.collapsible').collapsible({});

//            });
// }
//    };
//})