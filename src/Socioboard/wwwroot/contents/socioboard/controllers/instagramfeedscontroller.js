'use strict';

SocioboardApp.controller('InstagramFeedsController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain,grouptask) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        instagramfeeds();
        var start = 0;
        var preloadmorefeeds = false;
        var endfeeds = false;
        var ending = start + 10;
        var reachLast = false;
        var count = 10;
        $scope.filterrTxtt = 'All Posts';
        $scope.SorttTxtt = 'Popular';
        $scope.dispbtn = true;
        $scope.loadmore = "Click to Load More..";
        $scope.lstFbComments = [];
        $scope.lstinFeeds = null;

        $scope.lstFbFeeds = [];
          

        $scope.LoadTopFeeds = function () {
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Instagram/GetInstagramFeeds?instagramId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=12')
                          .then(function (response) {
                              // $scope.lstProfiles = response.data;
                              //$scope.lstinsFeeds = response.data;
                               if (response.data == null) {
                                  reachLast = true;
                               }
                               $scope.lstinsFeeds = response.data;
                               //$scope.date($scope.lstinFeeds);
                               //$scope.reloadFeeds();
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

        $scope.ReLoadingTopFeeds = function () {
            $scope.filters = false;
            $scope.preloadmorefeeds = false;
            $scope.lstinsFeeds = null;
            $scope.filterrTxtt = 'All Posts';
            $scope.SorttTxtt = 'Popular';
            $scope.LoadTopFeeds();
        }

          //$scope.reloadFeeds = function () {
          //    setTimeout(function () { $scope.LoadTopFeeds(); }, 10000);
          //}


        $scope.listData = function () {

            if (reachLast) {
                return false;
            }
            $http.get(apiDomain + '/api/Instagram/GetInstagramFeeds?instagramId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=' + ending + '&count=9')
                         .then(function (response) {                          
                             // $scope.lstProfiles = response.data;
                             if (response.data == null || response.data == "") {
                                 reachLast = true;
                                 $scope.loadmore = "Reached at bottom";
                                 $scope.loadmorefeeds = 'hide';
                                 $scope.endfeeds = true;
                             }
                             else {
                                 $scope.lstinsFeeds = $scope.lstinsFeeds.concat(response.data);
                                 //$scope.date($scope.lstinFeeds);
                                 ending = ending + 9;
                                 $scope.listData();
                             }
                         }, function (reason) {
                             $scope.error = reason.data;
                         });
        };


        $scope.filterSearch = function (postType, txtt) {
            $scope.filters = true;
            $scope.preloadmorefeeds = false;
            $scope.lstinsFeeds = null;
            $scope.filterrTxtt = txtt;
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Instagram/GetInstagramFilterFeeds?instagramId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=10' + '&postType=' + postType)
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

        $scope.sortSearch = function (sortType, txtt) {
            $scope.filters = true;
            $scope.preloadmorefeeds = false;
            $scope.lstinsFeeds = null;
            $scope.SorttTxtt = txtt;
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
               
                var date = new Date(parm[i].feedDate * 1000);
                var datevalues = ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear() + ' ' + date.getHours() + ':' + date.getMinutes();
                parm[i].feedDate = datevalues;

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
            debugger;
            var text = $('#postcomment').val();
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
                                  debugger;
                                  $scope.dispbtn = true;
                                  $('#postcomment' + FeedId).val('');
                                  $scope.LoadTopFeeds();
                                  swal('Posted');
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

        $scope.viewPostModal = function (tempo) {
            debugger;
            $scope.feeds = tempo;
            $scope.comment = tempo._InstagramComment
            $('#viewPostModal').openModal();
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

        $(document).ready(function () {
            $('#waterfall').NewWaterfall();
        });

        // waterfall
        function random(min, max) {
            return min + Math.floor(Math.random() * (max - min + 1))
        }
        var loading = false;
        var dist = 300;
        var num = 1;

        setInterval(function () {
            if ($(window).scrollTop() >= $(document).height() - $(window).height() - dist && !loading) {
                loading = true;
                $("#test").clone().appendTo('#waterfall');
                // $("#waterfall").append("<li><div style='height:" + random(50,500) +  "px'>" + num + "</div></li>");
                num++;

                loading = false;
            }
        }, 60);


    });
});