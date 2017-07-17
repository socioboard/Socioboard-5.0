'use strict';

SocioboardApp.controller('InstagramFeedsController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain,grouptask) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        instagramfeeds();
        var start = 0;
        var preloadmorefeeds = false;
        var endfeeds = false;
        var ending = start + 30;
        var reachLast = false;
        var count = 30;
        $scope.dispbtn = true;
        $scope.loadmore = "Click to Load More..";
        $scope.lstFbComments = [];

        $scope.lstFbFeeds = [];

        $scope.LoadTopFeeds = function () {
            //codes to load  recent Feeds
            $scope.filters = false;
            $scope.preloadmorefeeds = false;
            $scope.lstinsFeeds = null;
            $http.get(apiDomain + '/api/Instagram/GetInstagramFeeds?instagramId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=30')
                          .then(function (response) {
                              // $scope.lstProfiles = response.data;
                              //$scope.lstinsFeeds = response.data;
                               if (response.data == null) {
                                  reachLast = true;
                              }
                               $scope.date(response.data);
                               $scope.preloadmorefeeds = true;
                               $scope.dropCalled = true;
                               setTimeout(function () {
                                   $scope.callDropmenu();
                               }, 1000);
                             
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
            $http.get(apiDomain + '/api/Instagram/GetInstagramFeeds?instagramId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=' + ending + '&count=90')
                         .then(function (response) {                          
                             // $scope.lstProfiles = response.data;
                             if (response.data == null || response.data == "") {
                                 reachLast = true;
                                 $scope.loadmore = "Reached at bottom";
                                 $scope.loadmorefeeds = 'hide';
                                 $scope.endfeeds = true;
                             }
                             else {
                                 $scope.lstFbFeeds = $scope.lstFbFeeds.concat(response.data);
                             
                                 ending = ending + 30;
                                 $scope.listData();
                             }
                         }, function (reason) {
                             $scope.error = reason.data;
                         });
        };


        $scope.filterSearch = function (postType) {
            $scope.filters = true;
            $scope.preloadmorefeeds = false;
            $scope.lstinsFeeds = null;
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Instagram/GetInstagramFilterFeeds?instagramId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=30' + '&postType=' + postType)
                          .then(function (response) {
                              // $scope.lstProfiles = response.data;
                              //$scope.lstinsFeeds = response.data;
                              if (response.data == null) {
                                  reachLast = true;
                              }
                              $scope.date(response.data);
                              $scope.preloadmorefeeds = true;


                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load  recent Feeds
        }

        $scope.sortSearch = function (sortType) {
            $scope.filters = true;
            $scope.preloadmorefeeds = false;
            $scope.lstinsFeeds = null;
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Instagram/GetInstagramSortFeeds?instagramId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=40' + '&sortType=' + sortType)
                          .then(function (response) {
                              // $scope.lstProfiles = response.data;
                              //$scope.lstinsFeeds = response.data;
                              if (response.data == null) {
                                  reachLast = true;
                              }
                              $scope.lstinsFeeds = response.data;
                              $scope.preloadmorefeeds = true;


                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load  recent Feeds
        }

        $scope.date = function (parm) {
          
            for (var i = 0; i < parm.length; i++) {
               
                var date = new Date(parm[i]._InstagramFeed.feedDate * 1000);
                var datevalues = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
                parm[i]._InstagramFeed.feedDate = datevalues;

                if (parm[i]._InstagramComment.length > 0) {
                    for (var j = 0; j < parm[i]._InstagramComment.length; j++) {
                        var date1 = new Date(parm[i]._InstagramComment[j].commentDate * 1000);
                        var newdate = date.toString();
                        var splitdate = newdate.split(" ");
                        date1 = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3];
                        parm[i]._InstagramComment[j].commentDate = date1;
                    }
                }
            }
            $scope.lstinsFeeds = parm;
        }

        $scope.InstagramLikeUnLike = function (LikeCount, IsLike, FeedId, InstagramId)
        {
            //codes to like Feeds
            $http.post(apiDomain + '/api/Instagram/InstagramLikeUnLike?LikeCount=' + LikeCount + '&IsLike=' + IsLike + '&FeedId=' + FeedId + '&InstagramId=' + InstagramId)
                          .then(function (response) {
                             
                              $scope.LoadTopFeeds();
                             
                             
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to like Feeds
        }

        $scope.AddInstagramComment = function (FeedId, InstagramId)
        {
           
            var text = $('#postcomment' + FeedId).val();
            var updatetitle = "";

            var postdata = text.split("\n");//newComment
            for (var i = 0; i < postdata.length; i++) {
                updatetitle = updatetitle + "<br>" + postdata[i];
            }
            updatetitle = updatetitle.replace(/#+/g, 'hhh');
            updatetitle = updatetitle.replace(/&+/g, 'nnn');
            updatetitle = updatetitle.replace("+", 'ppp');
            updatetitle = updatetitle.replace("-+", 'jjj');
            text = updatetitle;

            if (text != "" && text != null && text != undefined) {
                $scope.dispbtn =false;
                //codes to post comments
                $http.post(apiDomain + '/api/Instagram/AddInstagramComment?FeedId=' + FeedId + '&InstagramId=' + InstagramId +'&Text='+text)
                              .then(function (response) {
                                  $scope.dispbtn = true;
                                  $('#postcomment' + FeedId).val('');
                                  $scope.LoadTopFeeds();
                                 
                                  
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to post comments
            }
            else {
                swal('Please enter a comment');
            }
        }


        $scope.TaskModal = function (insfeednotification) {
            $rootScope.insfeednotification = insfeednotification;
            $('#TaskModal').openModal();

        }

        $scope.callDropmenu = function () {
            $('.dropdown-button').dropdown({
                inDuration: 300,
                outDuration: 225,
                constrain_width: false, // Does not change width of dropdown to that of the activator
                hover: true, // Activate on hover
                gutter: 0, // Spacing from edge
                belowOrigin: false, // Displays dropdown below the button
                alignment: 'right' // Displays dropdown with edge aligned to the left of button
            });
        }

        $scope.addTask = function (feedTableType) {

            var memberId = $('.task-user-member:checked');
            var taskComment = $('#InstagramFeedComment').val();
            if (!memberId.val()) {
                swal('Please select a member to assign the task')
            }
            else if (!taskComment) {
                swal('Please write a comment to assign the task')
            }
            else {
                var assignUserId = memberId.val();
                grouptask.addtasks(assignUserId, feedTableType, taskComment, $rootScope.insfeednotification.Feed, $rootScope.insfeednotification.FeedId, $rootScope.insfeednotification.FeedImageUrl);

            }
        }

    });
});