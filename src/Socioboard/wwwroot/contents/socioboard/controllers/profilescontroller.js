'use strict';

SocioboardApp.controller('ProfilesController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
      // initialize core components
        profiles();
        //end initilze core components

        //load profiles

         //codes to load  fb profiles start
            $http.get(apiDomain + '/api/Facebook/GetFacebookProfiles?groupId=' + $rootScope.groupId)
                          .then(function (response) {
                              $scope.lstFbProfiles = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load fb profiles


        //codes to load  twitter profiles start
        $http.get(apiDomain + '/api/Twitter/GetTwitterProfiles?groupId=' + $rootScope.groupId)
                      .then(function (response) {
                          console.log(response.data);
                          $scope.lstTwtProfiles = response.data;
                      }, function (reason) {
                          $scope.error = reason.data;
                      });
        // end codes to load twitter profiles
        //end load profiles

  });

});