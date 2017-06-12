'use strict';

SocioboardApp.controller('MailSettingController', function ($rootScope, $scope, $http, $timeout, $mdpDatePicker, $mdpTimePicker, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        mailsetting();


        //verify password

        $scope.VerifyPassword = function (verifyPassword) {
            //debugger;
            $http({
                method: 'POST',
                url: apiDomain + '/api/User/VerificationPassword?currentPassword=' + verifyPassword.currentPassword + '&userId=' + $rootScope.user.Id,
                crossDomain: true,
                //data: ,
            }).then(function (response) {
                debugger;
                alertify.set({ delay: 5000 });
                alertify.success(response.data);
                document.querySelector("#mail_div").style.display = "block";
                document.querySelector("#change_email_btn").style.display = "none";
            }, function (reason) {
                debugger
                alertify.set({ delay: 5000 });
                alertify.error(reason.data);
                console.log(reason.data);

            });
        }

        $scope.UpdateEmailID = function (updateEmailID) {
            debugger;
            $http({
                method: 'POST',
                url: apiDomain + '/api/User/ChangeEmailID?newEmailID=' + updateEmailID.newEmailID + '&confirmEmailID=' + updateEmailID.confirmEmailID + '&userId=' + $rootScope.user.Id,
                crossDomain: true,

            }).then(function (response) {
                debugger;
                alertify.set({ delay: 5000 });
                alertify.success(response.data);
                window.location.reload();
            }, function (reason) {
                debugger
                alertify.set({ delay: 5000 });
                alertify.error(reason.data);
                console.log(reason.data);
            });
        }

    });
});