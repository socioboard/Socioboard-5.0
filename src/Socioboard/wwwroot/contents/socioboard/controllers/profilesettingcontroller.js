'use strict';

SocioboardApp.controller('ProfileSettingController', function ($rootScope, $scope, $http, $timeout, $mdpDatePicker, $mdpTimePicker, apiDomain, userservice, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

         $scope.currentDate = new Date();
        $scope.showDatePicker = function (ev) {
            $mdpDatePicker($scope.currentDate, {
                targetEvent: ev
            }).then(function (selectedDate) {
                $scope.currentDate = selectedDate;
            });;
        };

        $scope.filterDate = function (date) {
            return moment(date).date() % 2 == 0;
        };

        $scope.showTimePicker = function (ev) {
            $mdpTimePicker($scope.currentTime, {
                targetEvent: ev
            }).then(function (selectedDate) {
                $scope.currentTime = selectedDate;
            });;
        }

        // initialize core components
        $scope.updateUser = {};
        $scope.updatePassword = {};
        $scope.mailSettings = {};

        //$('.datepicker').pickadate({
            
        //    selectMonths: true, // Creates a dropdown to control month
        //    selectYears: 100 // Creates a dropdown of 15 years to control year
        //});

        $scope.phoneNumbr = /^\+?\d{2}[- ]?\d{3}[- ]?\d{5}$/;
        function personalsettingload() {
            $http({
                method: 'GET',
                url: apiDomain + '/api/User/GetUser?Id=' + $rootScope.user.Id,
                crossDomain: true,
                //data: ,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function (response) {
                debugger;
                $rootScope.user.FirstName = response.data.firstName;
                $rootScope.user.LastName = response.data.lastName;
                $rootScope.user.UserName = response.data.userName;
                $rootScope.user.PhoneNumber = response.data.phoneNumber;
                $rootScope.user.dateOfBirth = response.data.dateOfBirth;
                if (response.data.aboutMe != 'null') {
                    console.log(response.data.aboutMe)

                    $rootScope.user.aboutMe = response.data.aboutMe;
                }
                else {
                    $rootScope.user.aboutMe = '';
                }
                $('ul.tabs').tabs();
            }, function (reason) {

            });

            setTimeout(userdata, 5000);
        }



        //codes to fill update user details 

        function userdata() {

            if ($rootScope.UpdatedfirstName == '' || $rootScope.UpdatedfirstName == undefined) {
                $scope.updateUser.firstName = $rootScope.user.FirstName;
            }
            else {
                $scope.updateUser.firstName = $rootScope.UpdatedfirstName;
            }
            if ($rootScope.UpdatedlastName == '' || $rootScope.UpdatedlastName == undefined) {
                $scope.updateUser.lastName = $rootScope.user.LastName;
            }
            else {
                $scope.updateUser.lastName = $rootScope.UpdatedlastName;
            }
            if ($rootScope.UpdateduserName == '' || $rootScope.UpdateduserName == undefined) {
                $scope.updateUser.userName = $rootScope.user.UserName;
            } else {
                $scope.updateUser.userName = $rootScope.UpdateduserName;
            }
            if ($rootScope.UpdatedphoneNumber == '' || $rootScope.UpdatedphoneNumber == undefined) {
                $scope.updateUser.phoneNumber = $rootScope.user.PhoneNumber;
            } else {
                $scope.updateUser.phoneNumber = $rootScope.UpdatedphoneNumber;
            }
            if ($rootScope.UpdatedaboutMe == '' || $rootScope.UpdatedaboutMe == undefined) {
                $scope.updateUser.aboutMe = $rootScope.user.aboutMe;
            } else {
                $scope.updateUser.aboutMe = $rootScope.UpdatedaboutMe;
            }



            var $input = $('.datepicker').pickadate();
            var picker = $input.pickadate('picker');

            picker.set('select', $rootScope.user.dateOfBirth, { format: 'yyyy-mm-dd HH:MM:ss' });
           
        }
        //   $scope.updateUser.dob = $rootScope.user.dateOfBirth;

        Materialize.updateTextFields();
        // end codes to fill update user details

        //codes to intilize mail settings
        $scope.mailSettings.dailyGrpReportsSummery = $rootScope.user.dailyGrpReportsSummery;
        $scope.mailSettings.weeklyGrpReportsSummery = $rootScope.user.weeklyGrpReportsSummery;
        $scope.mailSettings.days15GrpReportsSummery = $rootScope.user.days15GrpReportsSummery;
        $scope.mailSettings.monthlyGrpReportsSummery = $rootScope.user.monthlyGrpReportsSummery;
        $scope.mailSettings.days60GrpReportsSummery = $rootScope.user.days60GrpReportsSummery;
        $scope.mailSettings.days90GrpReportsSummery = $rootScope.user.days90GrpReportsSummery;
        $scope.mailSettings.otherNewsLetters = $rootScope.user.otherNewsLetters;

        //end codes to intilize mail settings

        $scope.UpdateUser = function (updateUser) {


           
            //var date_value = ($('.md-input')[0]).value;
             var $input = $('.datepicker').pickadate();
             var picker = $input.pickadate('picker');
             var formData = new FormData();
            formData.append('files', $("#profileImage").get(0).files[0]);
            $http({
                method: 'POST',
                url: apiDomain + '/api/User/UpdateUser?firstName=' + updateUser.firstName + '&lastName=' + updateUser.lastName + '&userName=' + updateUser.userName + '&phoneNumber=' + updateUser.phoneNumber + '&dob=' + picker.get() + '&aboutMe=' + updateUser.aboutMe + '&userId=' + $rootScope.user.Id,
                data: formData,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity,
            }).then(function (response) {
                userservice.updateLocalUser();
                alertify.set({ delay: 5000 });
                alertify.success("Profile updated successfully");
                $rootScope.UpdatedfirstName = updateUser.firstName;
                $rootScope.UpdatedlastName = updateUser.lastName;
                $rootScope.UpdateduserName = updateUser.userName;
                $rootScope.UpdatedphoneNumber = updateUser.phoneNumber;
                $rootScope.dateOfBirth = updateUser.dateOfBirth;
                $rootScope.UpdatedaboutMe = updateUser.aboutMe;
            }, function (reason) {
                alertify.set({ delay: 5000 });
                alertify.error(reason.data);
                console.log(reason.data);
            });
        }


        $scope.checkfile = function () {
            debugger;
            var filesinput = $('#profileImage').get(0).files[0];
            console.log('sadfkjasdf');
            console.log(filesinput);
            var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
            if (filesinput != undefined && filesinput != null) {
                if ($scope.hasExtension('#profileImage', fileExtension)) {

                }
                else {

                    alertify.set({ delay: 3000 });
                    alertify.error("File extension is not valid. Please upload an image file");
                    $('#profileImage').val('');
                }
            }
        }


        $scope.hasExtension = function (inputID, exts) {
            var fileName = $('#profileImage').val();
            return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
        }


        $scope.UpdatePassword = function (updatePassword) {
            $http({
                method: 'POST',
                url: apiDomain + '/api/User/ChangePassword?currentPassword=' + updatePassword.currentPassword + '&newPassword=' + updatePassword.newPassword + '&conformPassword=' + updatePassword.conformPassword + '&userId=' + $rootScope.user.Id,
                crossDomain: true,
                //data: ,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function (response) {
                alertify.set({ delay: 5000 });
                alertify.success(response.data);
                updatePassword.currentPassword = '';
                updatePassword.newPassword = '';
                updatePassword.conformPassword = '';
            }, function (reason) {
                alertify.set({ delay: 5000 });
                alertify.error(reason.data);
                console.log(reason.data);
            });
        }


        $scope.UpgradeAccount = function (packagename) {
            $http({
                method: 'GET',
                url: domain + '/Index/UpgradeAccount?packagename=' + packagename,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function (response) {
                if(response.data!="")
                {
                    window.top.location = response.data;
                } else {
                    window.top.location = "../Home/Index";
                }
                
            }, function (reason) {

            });
        }



        //$scope.UpdatePassword = function (updateMailSettings) {
        //    $http({
        //        method: 'POST',
        //        url: apiDomain + '/api/User/ChangePassword?currentPassword=' + updatePassword.currentPassword + '&newPassword=' + updatePassword.newPassword + '&conformPassword=' + updatePassword.conformPassword + '&userId=' + $rootScope.user.Id,
        //        crossDomain: true,
        //        //data: ,
        //        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        //    }).then(function (response) {
        //        alertify.set({ delay: 5000 });
        //        alertify.success("Mail Settings Updated Successfully");
        //        console.log(response);
        //    }, function (reason) {
        //        alertify.set({ delay: 5000 });
        //        alertify.error(reason.data);
        //        console.log(reason.data);
        //    });
        //}


        $scope.UpdateMailSettings = function (mailSettings) {
            $http({
                method: 'POST',
                url: apiDomain + '/api/User/UpdateMailSettings?dailyGrpReportsSummery=' + mailSettings.dailyGrpReportsSummery + '&weeklyGrpReportsSummery=' + mailSettings.weeklyGrpReportsSummery + '&days15GrpReportsSummery=' + mailSettings.days15GrpReportsSummery + '&monthlyGrpReportsSummery=' + mailSettings.monthlyGrpReportsSummery + '&days60GrpReportsSummery=' + mailSettings.days60GrpReportsSummery + '&days90GrpReportsSummery=' + mailSettings.days90GrpReportsSummery + '&otherNewsLetters=' + mailSettings.otherNewsLetters + '&userId=' + $rootScope.user.Id,
                crossDomain: true,
                //data: ,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function (response) {
                alertify.set({ delay: 5000 });
                alertify.success("Email settings updated successfully");
                console.log(response);
            }, function (reason) {
                alertify.set({ delay: 5000 });
                alertify.error(reason.data);
                console.log(reason.data);
            });
        }


        profilesetting();
        personalsettingload();
    });
});