'use strict';

SocioboardApp.controller('PinterestLikesController', function ($rootScope, $scope, $http, $timeout, $mdpDatePicker, $mdpTimePicker, apiDomain, $stateParams) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        pinterest();
        var start = 0; // where to start data
        var ending = start + 30; // how much data need to add on each function call
        var reachLast = false; // to check the page ends last or not
        var count = 30;
        if ($rootScope.user.TrailStatus == 2) {
            count = 5
        }
        $scope.LoadTopFeeds = function () {
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Pinterest/GetTopLikes?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&take=' + count)
                              .then(function (response) {
                                  $scope.lstlikes = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to load  recent Feeds

        }
        $scope.LoadTopFeeds();

        /*
           * Masonry container for eCommerce page
           */
        //var $containerProducts = $("#pins_board");
        //$containerProducts.imagesLoaded(function () {
        //    $containerProducts.masonry({
        //        itemSelector: ".product",
        //        columnWidth: ".product-sizer",
        //    });
        //});

    });

});
SocioboardApp.directive('myRepeatFeedTimeoutDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                console.log("myRepeatFeedTimeoutDirective Called");
                var $containerProducts = $("#pins_board");
                $containerProducts.masonry({
                    itemSelector: ".product",
                    columnWidth: ".product-sizer",
                });
            });


        };
    }
});