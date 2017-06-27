'use strict';
 
SocioboardApp.controller('PinterestBoardsController', function ($rootScope, $scope, $http, $timeout, $mdpDatePicker, $mdpTimePicker, apiDomain, $stateParams) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
     
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
            $http.get(apiDomain + '/api/Pinterest/GetTopBoards?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&take=' + count)
                              .then(function (response) {
                                  $scope.lstpinboards = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to load  recent Feeds

        }
        $scope.LoadTopFeeds();

        $scope.CreateBoard = function (profileId) {
            var name = $('#Boardname').val();
            var description = $('#Boarddescription').val();
            $http.post(apiDomain + '/api/Pinterest/CreateBoard?name=' + name + '&profileid=' + profileId + '&description=' + encodeURIComponent(description) + '&userid=' + $rootScope.user.Id)
                                      .then(function (response) {
                                          swal(response.data);
                                          $('#CreateBoardModal').closeModal();
                                          $scope.LoadTopFeeds();
                                      }, function (reason) {
                                          $scope.error = reason.data;
                                      });
        }
 
  });
 
});