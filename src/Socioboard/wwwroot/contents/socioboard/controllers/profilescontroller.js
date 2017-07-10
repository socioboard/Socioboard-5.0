'use strict';

SocioboardApp.controller('ProfilesController', function ($rootScope, $scope, $http, $modal, $timeout, $state, apiDomain, domain) {
    //alert('helo');

    $scope.$on('$viewContentLoaded', function () {
        $scope.dispbtn = true;
        $scope.check = false;
        $scope.draftbtn = true;
        $scope.query = {};
        $scope.queryBy = '$';
        $scope.message = function (msg) {
            $scope.msg = "If You want to use this feature upgrade to higher business plan ";
            swal(msg);
        };
        //$scope.fetchalllProfiles();
                //codes fetch all profiles start
        $scope.fetchalllProfiles = function () {
            debugger;
               $http.get(apiDomain + '/api/GroupProfiles/GetAllGroupProfilesDeatails?groupId=' + $rootScope.groupId)
                              .then(function (response) {
                                  if (response.data != "") {
                                      $scope.lstAccountProfiles = response.data;
                                     
                                      
                                          $scope.loaderclass = 'hide';
                                      
                                  }
                                  else {
                                      $scope.noLinkedpro = true;
                                      setTimeout(function () {
                                          $scope.loaderclass = 'hide';
                                      }, 3000);
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            }
        // end codes fetch all profiles

        //codes to load  TotalIncommingMessages
        $scope.GetIncommingMessage = function () {
            debugger;
            $http.get(apiDomain + '/api/Twitter/GetIncommingMessage?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.TotaltIncommingMessage = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

        }
        // end codes to TotalIncommingMessages

        //codes to load  TwitterFollowerCount
        $scope.TwitterFollowerCount = function () {

            $http.get(apiDomain + '/api/Twitter/TwitterFollowerCount?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.TwitterFollowerCount = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

        }
        // end codes to TwitterFollowerCount

        //codes to load  FacebookfanPageCount
        $scope.FacebookfanPageCount = function () {

            $http.get(apiDomain + '/api/Facebook/FacebookfanPageCount?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.FacebookfanPageCount = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

        }
        // end codes to FacebookfanPageCount

        //codes to load  TotalSetMessages
        $scope.TotalSetMessages = function () {

            $http.get(apiDomain + '/api/SocialMessages/GetAllSentMessagesCount?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.TotalSetMessages = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

        }
        //end codes to TotalSetMessages

        $scope.fetchalllProfiles();
        $scope.TotalSetMessages();
        $scope.GetIncommingMessage();
        $scope.TwitterFollowerCount();
        $scope.FacebookfanPageCount();

       
      
    });
});

