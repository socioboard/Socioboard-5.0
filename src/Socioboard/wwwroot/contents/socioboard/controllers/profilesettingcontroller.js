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
                
                $rootScope.user.FirstName = response.data.firstName;
                $rootScope.user.LastName = response.data.lastName;
                $rootScope.user.UserName = response.data.userName;
                $rootScope.user.PhoneNumber = response.data.phoneNumber;
                $rootScope.user.dateOfBirth = response.data.dateOfBirth;
                if (response.data.aboutMe != 'null') {
                    

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

        $scope.mailSettings.scheduleFailureUpdates = $rootScope.user.scheduleFailureUpdates;
        $scope.mailSettings.scheduleSuccessUpdates = $rootScope.user.scheduleSuccessUpdates;
        //end codes to intilize mail settings

        $scope.UpdateUser = function (updateUser) {
            var $input = $('.datepicker').pickadate();
            var picker = $input.pickadate('picker');
            var dt = new Date(picker.get());
            if (dt > new Date()) {
                swal("Date Of Birth should not be future date");
                return false;
            }
            else {
                var formData = new FormData();
                formData.append('files', $("#profileImage").get(0).files[0]);
                formData.append('phoneNumber', updateUser.phoneNumber);
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/User/UpdateUser?firstName=' + updateUser.firstName + '&lastName=' + updateUser.lastName + '&userName=' + updateUser.userName + '&dob=' + picker.get() + '&aboutMe=' + updateUser.aboutMe + '&userId=' + $rootScope.user.Id,
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
                    
                });
            }
        }


        $scope.checkfile = function () {
          
            var filesinput = $('#profileImage').get(0).files[0];
           
            var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'JPEG', 'JPG', 'PNG', 'GIF', 'BMP'];
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
            var cookies = document.cookie.split(";");
            for (var i = 0; i < cookies.length; i++) {
                var cookie = cookies[i];
                var eqPos = cookie.indexOf("=");
                var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                if (name.indexOf("socioboardpluginemailId") > -1) {
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }
                if (name.indexOf("socioboardpluginToken") > -1) {
                    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }
            }
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
                
            });
        }


        $scope.UpgradeAccount = function (packagename) {
            $http({
                method: 'GET',
                url: domain + '/Index/UpgradeAccount?packagename=' + packagename,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).then(function (response) {
                if (response.data != "") {
                    window.top.location = response.data;
                } else {
                    window.top.location = "../Home/Index";
                }

            }, function (reason) {

            });
        }

        //Disable User Account
        $scope.deleteAcc = function (profileId) {
            swal({
                title: "Are you sure?",
                text: "You will not be able to send any message via this account!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
            function () {
                var feedback = $('#feedback').val();
                $http.get(apiDomain + '/api/User/DisableUserAccount?Id=' + $rootScope.user.Id + '&feedbackmsg=' + feedback)
                       .then(function (response) {
                           $scope.status = response.data;
                           if ($scope.status == "Disabled")
                           {
                               $scope.logout();
                           }
                          }, function (reason) {
                           $scope.error = reason.data;
                       });
                });
        }
        //Disable User Account End

        //Logout after disable account start
        $scope.logout = function () {
          
            //alert('hello');
            $rootScope.groupId = '';
            //$rootScope.user.Id = '';
            //codes to logout from all session
            $http.get(domain + '/Home/Logout')
                          .then(function (response) {

                              var cookies = document.cookie.split(";");
                              for (var i = 0; i < cookies.length; i++) {
                                  var cookie = cookies[i];
                                  var eqPos = cookie.indexOf("=");
                                  var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                                  if (name.indexOf("socioboardpluginemailId") > -1) {
                                      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                  }
                                  if (name.indexOf("socioboardpluginToken") > -1) {
                                      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                  }
                                  if (name.indexOf("socioboardToken") > -1) {
                                      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                  }
                                  if (name.indexOf("socioboardemailId") > -1) {
                                      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                                  }
                              }


                              localStorage.removeItem("user");
                              window.location.href = '../Index/Index';
                              window.location.reload();
                          }, function (reason) {
                              $scope.error = reason.data;
                          });

            // end codes to logout from all session
        }
        //Logout after disable account End

        //Get User detail start
        $scope.GetUserdetail = function () {
            
            $http.get(apiDomain + '/api/User/GetUser?Id=' + $rootScope.user.Id)
                          .then(function (response) {
                              $scope.userdetails = response.data;
                              $scope.accountType = $scope.userdetails.accountType;
                            
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
        }
        //Get User detail End


        //$scope.UpdatePassword = function (updateMailSettings) {
        //    $http({
        //        method: 'POST',
        //        url: apiDomain + '/api/User/ChangePassword?currentPassword=' + updatePassword.currentPassword + '&newPassword=' + updatePassword.newPassword + '&conformPassword=' + updatePassword.conformPassword + '&userId=' + $rootScope.user.Id,
        //        crossDomain: true,
        //        data: ,
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


        //$scope.UpdateMailSettings = function (mailSettings) {
        //    $http({
        //        method: 'POST',
        //        url: apiDomain + '/api/User/UpdateMailSettings?dailyGrpReportsSummery=' + mailSettings.dailyGrpReportsSummery + '&weeklyGrpReportsSummery=' + mailSettings.weeklyGrpReportsSummery + '&days15GrpReportsSummery=' + mailSettings.days15GrpReportsSummery + '&monthlyGrpReportsSummery=' + mailSettings.monthlyGrpReportsSummery + '&days60GrpReportsSummery=' + mailSettings.days60GrpReportsSummery + '&days90GrpReportsSummery=' + mailSettings.days90GrpReportsSummery + '&otherNewsLetters=' + mailSettings.otherNewsLetters + '&userId=' + $rootScope.user.Id + '&scheduleFailureUpdates=' + mailSettings.scheduleFailureUpdates + '&scheduleSuccessUpdates=' + mailSettings.scheduleSuccessUpdates,
        //        crossDomain: true,
        //        data: ,
        //        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        //    }).then(function (response) {
        //        alertify.set({ delay: 5000 });
        //        alertify.success("Email settings updated successfully");
              

        //    }, function (reason) {
        //        alertify.set({ delay: 5000 });
        //        alertify.error(reason.data);
              
        //    });
        //}


        profilesetting();
        personalsettingload();

         $scope.getOnPageLoadReports = function () {
            $scope.GetUserdetail();
        }

        $scope.getOnPageLoadReports();
    });
});