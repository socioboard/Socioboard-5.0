'use strict';

SocioboardApp.controller('InstagramreportController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        instagramreport();
       
        $scope.getReports = function (profileId, days) {
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/InstagramReports/GetInstagramReportData?profileId=' + profileId + '&daysCount=' + days)
                          .then(function (response) {
                              $scope.dailyReportsList = response.data;
                              $scope.getData(profileId, days);
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles

        }
        $scope.getData = function (profileId, days) {
            $scope.getprofileData(profileId);
            var startDate = new Date((Date.now() - (days * 86400000))) / 1000;
            var endDate = Date.now() / 1000;
            var totalMedia = 0;
            var totalFollower = 0;
            var totalFollowing = 0;
            var FOLLOWER = 0;
            var FOLLOWING = 0;
            var totalPOSTCOMMENTS = 0;
            var totalPOSTLIKES = 0;
            var newfollwer = 0;
            var newfollowing = 0;
            angular.forEach($scope.dailyReportsList, function (value, key) {
                if (value.date > startDate) {
                    totalMedia = totalMedia + value.mediaCount;
                    totalFollower = totalFollower + value.followcount;
                    totalFollowing = totalFollowing + value.followingcount;
                    totalPOSTCOMMENTS = totalPOSTCOMMENTS + value.postcomment;
                    totalPOSTLIKES = totalPOSTLIKES + value.postlike;
                }
            });

            $scope.totalMedia = totalMedia;
            $scope.totalFollower = totalFollower;
            $scope.totalFollowing = totalFollowing;
            $scope.totalPOSTCOMMENTS = totalPOSTCOMMENTS;
            $scope.totalPOSTLIKES = totalPOSTLIKES;
        }

        $scope.getprofileData = function (profileId) {
            //codes to load  instgarm  profiles start
            $http.get(apiDomain + '/api/InstagramReports/GetInstagramData?profileId=' + profileId)
                          .then(function (response) {
                              $scope.instagramdata = response.data;
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load instgarm profiles
        }

        $scope.getOnPageLoadReports = function () {
            var canContinue = true;
            angular.forEach($rootScope.lstProfiles, function (value, key) {
                if (canContinue && value.profileType == 8) {
                    $scope.getReports(value.profileId, 90)
                    $scope.selectedProfile = value.profileId;
                    canContinue = false;
                }
            });
        }

        $scope.getOnPageLoadReports();


$scope.sparkGraph = [5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7, 5, 6, 7, 9, 9, 5, 3, 2, 2, 4, 6, 7];
         // Project Line chart ( Project Box )
	    $(".project-line-1").sparkline($scope.sparkGraph, {
	        type: 'line',
	        width: '100%',
	        height: '30',
	        lineWidth: 2,
	        lineColor: '#00bcd4',
	        fillColor: 'rgba(0, 188, 212, 0.5)',
	    });       




  });

});

SocioboardApp.directive('myRepeatTabDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                $('select').material_select();


            });
        }
    };
})