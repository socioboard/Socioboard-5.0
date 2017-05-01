'use strict';

SocioboardApp.controller('YoutubeFeedsController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
        youtubefeeds();
        $('#tags').tagsInput();
        $scope.preloadmore = true;
            
        $scope.boxload = function () {
            //console.log('Raj');
            $('.collapsible').collapsible();
        }

        var currentVideoId = "";
        $scope.LoadVideos = function () {
            debugger;
            //codes to load videos
            $http.get(apiDomain + '/api/Google/GetYTVideos?ChannelId=' + $stateParams.profileId)
                              .then(function (response) {
                                  $scope.lstYtFeeds = response.data;
                                  $scope.preloadmorevideos = true;
                                  console.log(response.data);
                                  setTimeout(function () {
                                      onYouTubeIframeAPIReady();
                                  }, 15000);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to load videos

        }
        $scope.LoadVideos();

        $scope.videomodal = function (vdoId) {
            debugger;
            $scope.lstYtComments = "";
            $scope.preloadmorecomments = false;
            $scope.fetchComments(vdoId);
            //$scope.urlsss = vdoId;
            //$scope.videotitle = videotle;
            //$('#youtubefeeds_modal1').openModal();

        }

        $scope.fetchComments = function (vidoId) {
            debugger;
            $scope.commentsending = 'hide';
            $scope.sendicon = 'show';
            //codes to load Comments
            $http.get(apiDomain + '/api/Google/GetYtVdoComments?VideoId=' + vidoId)
                              .then(function (response) {
                                  $scope.lstYtComments = response.data;
                                  $scope.preloadmorecomments = true;
                                  console.log(response.data);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to load Comments

        }


        $scope.postComments = function (videoid) {
            debugger;
            //codes to post Comments
            //var commentText = "Raj is a good Software Developer";
            var commentText = $('#compose_' + videoid).val();
            var commentencoded = encodeURIComponent(commentText);
            if (/\S/.test(commentText)) {
                $scope.sendicon = 'hide';
                $scope.commentsending = 'show';
                $http.post(apiDomain + '/api/Google/PostCommentsYoutube?channelId=' + $stateParams.profileId + '&videoId=' + videoid + '&commentText=' + commentencoded)
                                  .then(function (response) {
                                      console.log(response.data);
                                      $scope.commentsending = 'hide';
                                      $scope.sendicon = 'show';
                                      //$scope.fetchComments(videoid);
                                      swal("Posted","Comment posted successfully","success");
                                      $('#compose_' + videoid).val('');
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                  });

            }
            else
            {
                swal("Please enter text to post comment");
            }
            // end codes to post Comments

        }
        $scope.uploadvideo = function () {
            debugger;
            var formData = new FormData();
            var title = $('#youyube_title').val();
            var descrip = $('#youyube_desc').val();
            var category = $('#categry_vdo').val();
            var status = $('#stats_vdo').val();
            $scope.preloadmore = false;
            formData.append('files', $("#input-file-now").get(0).files[0]);
            $http({
                method: 'POST',
                url: apiDomain + '/api/Google/uploadyoutube?channelid=' + $stateParams.profileId + '&title=' + title + '&descrip=' + descrip + '&category=' + category + '&status=' + status,
                data: formData,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity,
            }).then(function (response) {
                if (response.data == "Posted") {
                    $('#ComposePostModal').closeModal();
                    swal("Completed!", "Video posted successfully", "success");
                    window.location.reload();
                }
                else
                {
                    swal("Error!", "Issue while uploading video", "error");
                }

            }, function (reason) {
                console.log(reason);
            });

        }

    });
})
.filter('youtubeEmbedUrl', function ($sce) {
        return function (videoId) {
            return $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + videoId + '?rel=0&wmode=Opaque&enablejsapi=1;showinfo=0;controls=1');
        };
});