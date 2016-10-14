'use strict';

SocioboardApp.controller('BoardController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain) {
    $scope.$on('$viewContentLoaded', function () {

        $scope.lstBoardFeeds = [];
      //  $scope.lstBoardFeeds.length = 1;

        var starttwitter = 0; // where to start data
        var endingtwitter = starttwitter + 30; // how much data need to add on each function call
        var twitterReachLast = false; // to check the page ends last or not
        $scope.LoadTopTwitterFeeds = function () {
            if (!twitterReachLast) {
                //codes to load  recent Feeds
                $http.get(apiDomain + '/api/BoardMe/getTwitterFeeds?boardId=' + $stateParams.boardId + '&userId=' + $rootScope.user.Id + '&skip=' + starttwitter + '&count=30')
                              .then(function (response) {
                                  response.data.forEach(function (feed) {
                                      $scope.lstBoardFeeds.push(feed);
                                  });
                                  starttwitter = starttwitter + response.data.length;
                                  //$scope.lstBoardFeeds.push(response.data);
                                  console.log($scope.lstBoardFeeds);
                                  if (response.data == null) {
                                      twitterReachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load  recent Feeds
            }
        }

         

        var startGplus = 0; // where to start data
        var endingGplus = startGplus + 30; // how much data need to add on each function call
        var GplusReachLast = false; // to check the page ends last or not
        $scope.LoadTopGplusFeeds = function () {
            if (!GplusReachLast) {
                //codes to load  recent Feeds
                $http.get(apiDomain + '/api/BoardMe/getGplusfeeds?boardId=' + $stateParams.boardId + '&userId=' + $rootScope.user.Id + '&skip=' + startGplus + '&count=30')
                              .then(function (response) {
                                  //$scope.lstBoardFeeds = response.data;
                                  response.data.forEach(function (feed) {
                                      $scope.lstBoardFeeds.push(feed);
                                  });
                                  startGplus = startGplus + response.data.length;
                                  console.log($scope.lstBoardFeeds);
                                  if (response.data == null) {
                                      GplusReachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load  recent Feeds
            }
        }


        var startInstagram = 0; // where to start data
        var endingInstagram = startGplus + 30; // how much data need to add on each function call
        var InstagramReachLast = false; // to check the page ends last or not
        $scope.LoadTopInstagramFeeds = function () {
            if (!InstagramReachLast) {
                //codes to load  recent Feeds
                $http.get(apiDomain + '/api/BoardMe/getInstagramFeeds?boardId=' + $stateParams.boardId + '&userId=' + $rootScope.user.Id + '&skip=' + startInstagram + '&count=30')
                              .then(function (response) {
                                  response.data.forEach(function (feed) {
                                      $scope.lstBoardFeeds.push(feed);
                                  });
                                  startInstagram = startInstagram + response.data.length;
                                  ////$scope.lstBoardFeeds = response.data;
                                  //$scope.lstBoardFeeds.push(response.data[0]);
                                  //console.log($scope.lstBoardFeeds);
                                  if (response.data == null) {
                                      InstagramReachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load  recent Feeds
            }
        }
       

        $scope.loadMore = function () {
            console.log('loadMore....');
            $scope.LoadTopTwitterFeeds();
            $scope.LoadTopGplusFeeds();
            $scope.LoadTopInstagramFeeds();
        }
        $scope.loadMore();

        designfeeds();
        $scope.deleteProfile = function (profileId) {
            // console.log(profileId);
            swal({
                title: "Are you sure?",
                text: "You will not be able to send message via this account!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
	        function () {
	            //todo: code to delete profile
	            swal("Deleted!", "Your profile has been deleted.", "success");
	        });
        }



      

    });

});

SocioboardApp.directive('myRepeatFeedTimeoutDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                console.log("myRepeatFeedTimeoutDirective Called");
                var $containerProducts = $("#products");
                $containerProducts.imagesLoaded(function () {
                    $containerProducts.masonry({
                        itemSelector: ".product",
                        columnWidth: ".product-sizer",
                    });
                });


            });
        }
    };
})