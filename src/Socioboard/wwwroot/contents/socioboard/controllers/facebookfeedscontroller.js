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
            console.log(obj);
            return obj.replace("http:", "https:")
        };
        $scope.lstFbFeeds = [];
        if ($rootScope.user.TrailStatus == 2) {
            count = 5
        }
        $scope.LoadTopFeeds = function () {
            debugger;
                //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Facebook/GetTopFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=' + count)
                              .then(function (response) {
                                  // $scope.lstProfiles = response.data;
                                  $scope.lstFbFeeds = response.data;
                                  $scope.preloadmore = true;
                                  // $scope.feeddate(response.data);
                                  //$scope.loaderclass = 'hide';
                                  console.log(response.data);
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
                             console.log(response.data);
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

            if (postcomment != '' && postcomment != null) {
                $http.post(apiDomain + '/api/Facebook/PostFacebookComment?postId=' + feedId + '&profileId=' + ProfileId + '&message=' + postcomment)
                                     .then(function (response) {
                                         swal(response.data);
                                         $('#postcomment_' + feedId).val('');
                                         // $scope.LoadTopComments(feedId);
                                         $scope.LoadTopFeeds();
                                     }, function (reason) {
                                         $scope.error = reason.data;
                                     });
            }
            else {
                swal("please type comment");
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
                swal('please select any member for assign task')
            }
            else if (!taskComment) {
                swal('please write any comment for assign task')
            }
            else {
                var assignUserId = memberId.val();
                grouptask.addtasks(assignUserId, feedTableType, taskComment, $rootScope.taskNotification.feedDescription, $rootScope.taskNotification.feedId, $rootScope.taskNotification.picture);

            }
        }



    });
});

SocioboardApp.directive('myRepeatTabDirective', function ($timeout) {
    debugger;
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                console.log('collapse reached.');
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