'use strict';
SocioboardApp.controller('ScheduleMessageController', function ($rootScope, $scope, $http, $modal, $timeout, $mdpDatePicker, $mdpTimePicker, $stateParams, apiDomain) {
    $scope.$on('$viewContentLoaded', function () {

        $scope.check = false;
        $scope.dispbtn = true;



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



        schedulemsg();
        $scope.deleteMsg = function (profileId) {
            // console.log(profileId);
            swal({
                title: "Are you sure?",
                text: "You will not be able to send message via this account!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
	        function () {
	            //todo: code to delete profile
	            swal("Deleted!", "Your profile has been deleted.", "success");
	        });
        }

        $scope.schedulemsg = function () {
            var profiles = $('#scheduleprofiles').val();
            var message = $('#ScheduleMsg').val();
 
            if (message == "") {
                swal("please enter the message");
                return false;
            }
           
            var updatedmessage = "";
            var postdata = message.split("\n");
            for (var i = 0; i < postdata.length; i++) {
                updatedmessage = updatedmessage + "<br>" + postdata[i];
            }
            updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
            message = updatedmessage;
            //var scheduletime = $('#ScheduleTime').val();
            var date_value = ($('.md-input')[0]).value;
            var date = date_value.split("/");
            date_value = date[1] + "/" + date[0] + "/" + date[2];
            var time_value = ($('.md-input')[1]).value;
            var scheduletime = date_value + ' ' + time_value;
            var newdate1 = new Date(scheduletime.replace("AM", "").replace("PM", "")).toUTCString();
            var d = new Date(newdate1);
            var d4 = d.setHours(d.getHours() + 5);
            var date = moment(d4);
            var newdate = new Date(date).toUTCString();
            // var _utc = moment.utc(newdate);
            //var _utc = new Date(scheduletime.getUTCFullYear(), scheduletime.getUTCMonth(), scheduletime.getUTCDate(), scheduletime.getUTCHours(), scheduletime.getUTCMinutes(), scheduletime.getUTCSeconds());
            //alert(_utc);
           
            //showing error message for enetring past date and time .. Start (date:10/10/2016)
            if (d <= new Date()) {
                swal("Date value must be current or future");
                return false;
            }
            var ampm = new Date().getHours >= 12 ? 'PM' : 'AM';
            var t1 = new Date().getHours() + ":" + new Date().getMinutes() + " " + ampm;

            var dt = new Date();
            var mm = new Date().getMonth() + 1;
            var d1 = mm + "/" + dt.getDate() + "/" + dt.getFullYear();
            if (date_value <= d1)
            {
                if (time_value < t1)
                {
                    swal("Time value must be current or future");
                    return false;
                }
            }
            //showing error message for enetring past date and time ... End (date:10/10/2016)


            if (message != "") {
                if (profiles.length > 0) {
                    if (scheduletime != "") {
                        // if (date_value != "") {
                        $scope.checkfile();
                        if ($scope.check == true) {
                            var formData = new FormData();
                            formData.append('files', $("#input-file-now").get(0).files[0]);
                            $scope.dispbtn = false;
                            $http({
                                method: 'POST',
                                url: apiDomain + '/api/SocialMessages/ScheduleMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + newdate,
                                data: formData,
                                headers: {
                                    'Content-Type': undefined
                                },
                                transformRequest: angular.identity,
                            }).then(function (response) {
                                $('#ScheduleMsg').val('');
                                $('#ScheduleTime').val('');
                                $('#input_0').val('');
                                $('#input_1').val('');
                                $scope.dispbtn = true;
                                swal("message scheduled successfully");
                            }, function (reason) {
                                console.log(reason);
                            });
                        }

                        else if ($scope.check == false) {
                            var formData = new FormData();
                            $scope.dispbtn = false;
                            $http({
                                method: 'POST',
                                url: apiDomain + '/api/SocialMessages/ScheduleMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + newdate,
                                data: formData,
                                headers: {
                                    'Content-Type': undefined
                                },
                                transformRequest: angular.identity,
                            }).then(function (response) {
                                $('#ScheduleMsg').val('');
                                $('#ScheduleTime').val('');
                                $scope.dispbtn = true;
                                swal("message scheduled successfully");
                            }, function (reason) {
                                console.log(reason);
                            });

                        }
                        else {
                            alertify.set({ delay: 3000 });
                            alertify.error("File Extention is not valid. Please upload any image file");
                            $('#input-file-now').val('');
                        }
                    }
                    else {
                        swal('please enter date time to schedule message');
                    }
                }
                else {
                    swal('please select profile for schedule message');
                }
            } else {
                swal('please select messgae for schedule');
            }

        }


        $scope.checkfile = function () {
            var filesinput = $('#input-file-now');
            var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
            if (filesinput != undefined && filesinput[0].files[0] != null) {
                if ($scope.hasExtension('#input-file-now', fileExtension)) {
                    $scope.check = true;
                }
                else {

                    $scope.check = false;
                }
            }
        }


        $scope.hasExtension = function (inputID, exts) {
            var fileName = $('#input-file-now').val();
            return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
        }


        $scope.draftmsg = function () {
            var message = $('#ScheduleMsg').val();
            var date_value = $('#input_0').val();
            var date = date_value.split("/");
            date_value = date[1] + "/" + date[0] + "/" + date[2];
            var time_value = $('#input_1').val();
            var scheduletime = date_value + ' ' + time_value;
            if (message != "" && message != undefined) {
                var formData = new FormData();
                formData.append('files', $("#input-file-now").get(0).files[0]);
                $scope.dispbtn = false;
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + scheduletime + '&groupId=' + $rootScope.groupId,
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity,
                }).then(function (response) {
                    $('#ScheduleMsg').val('');
                    $('#ScheduleTime').val('');
                    $scope.dispbtn = true;
                    swal("message saved in draft successfully");
                }, function (reason) {
                    console.log(reason);
                });
            }
            else {
                swal('please type any message for save in draft');
            }
        }
    });
});