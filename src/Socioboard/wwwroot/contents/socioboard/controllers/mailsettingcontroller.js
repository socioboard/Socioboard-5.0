'use strict';

SocioboardApp.controller('MailSettingController', function ($rootScope, $scope, $http, $timeout, $mdpDatePicker, $mdpTimePicker, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        mailsetting();
        $scope.passwordss = $rootScope.user.Password;
        $scope.Sigin = $rootScope.user.EmailValidateToken
        $scope.mailSettings = {};
        //codes to intilize mail settings
        $scope.mailSettings.dailyGrpReportsSummery = $rootScope.user.dailyGrpReportsSummery;
        $scope.mailSettings.weeklyGrpReportsSummery = $rootScope.user.weeklyGrpReportsSummery;
        $scope.mailSettings.days15GrpReportsSummery = $rootScope.user.days15GrpReportsSummery;
        $scope.mailSettings.monthlyGrpReportsSummery = $rootScope.user.monthlyGrpReportsSummery;
        $scope.mailSettings.days60GrpReportsSummery = $rootScope.user.days60GrpReportsSummery;
        $scope.mailSettings.days90GrpReportsSummery = $rootScope.user.days90GrpReportsSummery;
        $scope.mailSettings.otherNewsLetters = $rootScope.user.otherNewsLetters;

        $scope.mailSettings.scheduleFailureUpdates = $rootScope.user.scheduleFailureUpdates;
        $scope.mailSettings.scheduleSuccessUpdates = $rootScope.user.scheduleSuccessUpdates;
        //end codes to intilize mail settings
        //verify password

        $scope.VerifyPassword = function (verifyPassword) {
            var pass = $('#password').val();
            if (/\S/.test(pass)) {
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/User/VerificationPassword?currentPassword=' + verifyPassword.currentPassword + '&userId=' + $rootScope.user.Id,
                    crossDomain: true,
                    //data: ,
                }).then(function (response) {

                    alertify.set({ delay: 5000 });
                    alertify.success(response.data);
                    $('#ChangeEmailModal').closeModal();
                    document.querySelector("#mail_div").style.display = "block";
                    document.querySelector("#change_email_btn").style.display = "none";
                }, function (reason) {

                    alertify.set({ delay: 5000 });
                    alertify.error(reason.data);
                    $('#ChangeEmailModal').closeModal();
                    window.location.reload();


                });
            }
            else {
                swal("Please enter your password");
            }
        }

        $scope.UpdateEmailID = function (updateEmailID) {
        
            var Email = $('#new').val();
            if (/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(Email)) {
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/User/ChangeEmailID?newEmailID=' + updateEmailID.newEmailID + '&confirmEmailID=' + updateEmailID.confirmEmailID + '&userId=' + $rootScope.user.Id,
                    crossDomain: true,

                }).then(function (response) {

                    alertify.set({ delay: 5000 });
                    alertify.success(response.data);
                    window.location.reload();
                }, function (reason) {

                    alertify.set({ delay: 5000 });
                    alertify.error(reason.data);

                });
            }
            else {
                swal("Please Valid email address");

            }   
        }

        $scope.UpdateMailSettings = function (mailSettings) {
            $http({
                method: 'POST',
                url: apiDomain + '/api/User/UpdateMailSettings?dailyGrpReportsSummery=' + mailSettings.dailyGrpReportsSummery + '&weeklyGrpReportsSummery=' + mailSettings.weeklyGrpReportsSummery + '&days15GrpReportsSummery=' + mailSettings.days15GrpReportsSummery + '&monthlyGrpReportsSummery=' + mailSettings.monthlyGrpReportsSummery + '&days60GrpReportsSummery=' + mailSettings.days60GrpReportsSummery + '&days90GrpReportsSummery=' + mailSettings.days90GrpReportsSummery + '&otherNewsLetters=' + mailSettings.otherNewsLetters + '&userId=' + $rootScope.user.Id + '&scheduleFailureUpdates=' + mailSettings.scheduleFailureUpdates + '&scheduleSuccessUpdates=' + mailSettings.scheduleSuccessUpdates,
                crossDomain: true,
                //data: ,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function (response) {
                $rootScope.user.dailyGrpReportsSummery = $scope.mailSettings.dailyGrpReportsSummery;
                $rootScope.user.weeklyGrpReportsSummery = $scope.mailSettings.weeklyGrpReportsSummery;
                $rootScope.user.days15GrpReportsSummery = $scope.mailSettings.days15GrpReportsSummery;
                $rootScope.user.monthlyGrpReportsSummery = $scope.mailSettings.monthlyGrpReportsSummery;
                $rootScope.user.days60GrpReportsSummery = $scope.mailSettings.days60GrpReportsSummery;
                $rootScope.user.days90GrpReportsSummery = $scope.mailSettings.days90GrpReportsSummery;
                $rootScope.user.otherNewsLetters = $scope.mailSettings.otherNewsLetters;

                $rootScope.user.scheduleFailureUpdates = $scope.mailSettings.scheduleFailureUpdates;
                $rootScope.user.scheduleSuccessUpdates = $scope.mailSettings.scheduleSuccessUpdates;

            }, function (reason) {
                alertify.set({ delay: 5000 });
                alertify.error(reason.data);

            });
        }

    });
});