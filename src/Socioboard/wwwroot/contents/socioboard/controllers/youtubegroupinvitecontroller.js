'use strict';

SocioboardApp.controller('YoutubeGroupInviteController', function ($rootScope, $scope, $http, $timeout, $mdpDatePicker, apiDomain, $mdpTimePicker, $stateParams) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        $scope.inviteGroupMem = function () {
            var emailId = $('#g_invite').val();
            if ($scope.validateEmail(emailId)) {

                swal({
                    title: "Send email",
                    text: "An email will be sent to " +  emailId,
                    type: "info",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    $http.post(apiDomain + '/api/YoutubeGroup/InviteGroupMember?&userId=' + $rootScope.user.Id + '&emailId=' + emailId)
                                     .then(function (response) {
                                         swal('Success', 'Email sent successfully', 'success');
                                         $scope.loadYtGrpMembers();
                                         $('#g_invite').val('');
                                     }, function (reason) {
                                         swal('Sorry', 'Error in send email', 'error');
                                         $scope.error = reason.data;
                                     });
                });



            }
            else {
                swal('Enter valid email');
            }
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
<<<<<<< HEAD


        $scope.validateEmail = function (email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        }

        $scope.deleteMember = function (memberObj) {
            swal({
                title: "Remove member",
                text: memberObj.sbUserName + " no more able to access your youtube channels...",
                type: "info",
                showCancelButton: true,
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                $http.post(apiDomain + '/api/YoutubeGroup/DeleteMember?&id=' + memberObj.id)
                                 .then(function (response) {
                                     swal('Success', 'Member removed', 'success');
                                     $scope.loadYtGrpMembers();
                                 }, function (reason) {
                                     swal('Sorry', 'Error in remove member', 'error');
                                     $scope.error = reason.data;
                                 });
            });
        }

        $scope.acceptTeam = function (EmailValidationToken) {

                swal({
                    title: "Accept",
                    text: "You can access the channels of this owner",
                    type: "info",
                    showCancelButton: true,
                    closeOnConfirm: false,
                    showLoaderOnConfirm: true
                }, function () {
                    $http.post(apiDomain + '/api/YoutubeGroup/ValidateEmail?&Token=' + EmailValidationToken)
                                     .then(function (response) {
                                         swal('Success', 'Invitation accepted', 'success');
                                         $scope.loadYtGrpMembers();
                                         $scope.loadYtYourGroups();
                                         $scope.getYtGroupProfileSidebar();
                                     }, function (reason) {
                                         swal('Sorry', 'Error in accept invitation', 'error');
                                         $scope.error = reason.data;
                                     });
                });



        }

        $scope.getYtGroupProfileSidebar = function () {
            debugger;
            $http.get(apiDomain + '/api/YoutubeGroup/GetYtGroupChannel?userId=' + $rootScope.user.Id)
                                 .then(function (response) {
                                     $rootScope.lstYtGrpMembersSidebar = response.data;
                                 }, function (reason) {
                                     $scope.error = reason.data;
                                 });
        }

=======
>>>>>>> cf50914d88f0f1198bb66514f669b54901da952e
    });
});

       