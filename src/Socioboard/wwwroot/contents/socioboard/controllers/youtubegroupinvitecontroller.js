'use strict';

SocioboardApp.controller('YoutubeGroupInviteController', function ($rootScope, $scope, $http, $timeout, $mdpDatePicker, apiDomain, $mdpTimePicker, $stateParams) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        $scope.inviteGroupMem = function () {
            var emailId = $('#g_invite').val();

            $http.post(apiDomain + '/api/YoutubeGroup/InviteGroupMember?&userId=' + $rootScope.user.Id + '&emailId=' + emailId)
                                 .then(function (response) {
                                     swal('Success');
                                     $scope.loadYtGrpMembers();
                                 }, function (reason) {
                                     $scope.error = reason.data;
                                 });
        }

        $scope.loadYtGrpMembers = function () {
            $http.get(apiDomain + '/api/YoutubeGroup/GetGroupMember?userId=' + $rootScope.user.Id)
                                 .then(function (response) {
                                     $rootScope.lstYtGrpMem = response.data;
                                 }, function (reason) {
                                     $scope.error = reason.data;
                                 });
        }
        $scope.loadYtGrpMembers();
        $scope.loadYtYourGroups = function () {
            $http.get(apiDomain + '/api/YoutubeGroup/GetYtYourGroups?userId=' + $rootScope.user.Id)
                                 .then(function (response) {
                                     $scope.YtYourGroups = response.data;
                                 }, function (reason) {
                                     $scope.error = reason.data;
                                 });
        }
        $scope.loadYtYourGroups();
    });
});

       