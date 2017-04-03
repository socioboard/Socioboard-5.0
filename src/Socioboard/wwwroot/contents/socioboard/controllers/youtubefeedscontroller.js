'use strict';

SocioboardApp.controller('YoutubeFeedsController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
        youtubefeeds();
        $('#tags').tagsInput();
            

        $scope.LoadVideos = function () {
            debugger;
            //codes to load videos
            $http.get(apiDomain + '/api/Google/GetYTVideos?ChannelId=' + $stateParams.profileId)
                              .then(function (response) {
                                  $scope.lstYtFeeds = response.data;
                                  $scope.preloadmorevideos = true;
                                  console.log(response.data);
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to load videos

        }
        $scope.LoadVideos();

        $scope.videomodal = function (videotle, vdoId) {
            debugger;
            $scope.lstYtComments = "";
            $scope.preloadmorecomments = false;
            $scope.fetchComments(vdoId);
            $scope.urlsss = vdoId;
            $scope.videotitle = videotle;
            $('#youtubefeeds_modal1').openModal();

        }

        $scope.fetchComments = function (vidoId) {
            debugger;
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


    });
})
.filter('youtubeEmbedUrl', function ($sce) {
        return function (videoId) {
            return $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + videoId);
        };
    });