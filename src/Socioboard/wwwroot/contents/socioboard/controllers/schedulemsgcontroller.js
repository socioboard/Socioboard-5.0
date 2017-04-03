'use strict';
SocioboardApp.controller('ScheduleMessageController', function ($rootScope, $scope, $http, $modal, $timeout, $mdpDatePicker, $mdpTimePicker, $stateParams, apiDomain) {
    $scope.$on('$viewContentLoaded', function () {
       
        $scope.check = false;
        $scope.dispbtn = true;
        $scope.repeat = false;


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
                text: "You will not be able to send any message via this account!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
	        function () {
	            //todo: code to delete profile
	            swal("Deleted!", "Your profile has been deleted.", "Success");
	        });
        }
        var timeRepeat = $('#timesRepeat').val();
        var y = parseInt(timeRepeat);
        //datess
        debugger;
        $scope.schedulemsg = function (datess) {
            $scope.repeat = false;
            var profiles = $('#scheduleprofiles').val();
            var message = $('#ScheduleMsg').val();

            var timeRepeat = $('#timesRepeat').val();
            var y = parseInt(timeRepeat);

            console.log(profiles);
 
            if (message == "") {
                swal("Please enter a message");
                return false;
            }

        
           
            var updatedmessage = "";
            var postdata = message.split("\n");
            for (var i = 0; i < postdata.length; i++) {
                updatedmessage = updatedmessage + "<br>" + postdata[i];
            }
            updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
            updatedmessage = updatedmessage.replace(/&+/g, 'nnn');
            updatedmessage = updatedmessage.replace("+", 'ppp');
            updatedmessage = updatedmessage.replace("-+", 'jjj');
            message = updatedmessage;
            //updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
           // message = encodeURIComponent(message);

            

           // console.log(message);
           
            if (datess!=null) {
            
                date_value = datess;
            }
            else{
                var date_value = ($('.md-input')[0]).value;
            }
           

           //var date_value = ($('.md-input')[0]).value;
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
            var ampm = new Date().getHours() >= 12 ? 'PM' : 'AM';

            function addZero(i) {
                if (i < 10) {
                    i = "0" + i;
                }
                return i;
            }
            var t1 = new Date().getHours() + ":" + ("0" + new Date().getMinutes()).substr(-2) + " " + ampm;
            //var t1 = new Date().getHours() + ":" + new Date().getMinutes() + " " + ampm;

            var dt = new Date();
            var mm = new Date().getMonth() + 1;
            var d1 = ("0" + mm).substr(-2) + "/" + ("0" + dt.getDate()).substr(-2) + "/" + dt.getFullYear();
            if (date_value == d1)
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

                        console.log('FILE CHECK');
                        console.log(encodeURIComponent($('#imageUrl').val()));

                        if ($scope.check == true) {
                            var formData = new FormData();
                            formData.append('files', $("#input-file-now").get(0).files[0]);
                            $scope.dispbtn = false;
                            $http({
                                method: 'POST',
                                url: apiDomain + '/api/SocialMessages/ScheduleMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + newdate1 + '&imagePath=' +encodeURIComponent($('#imageUrl').val()),
                                data: formData,
                                headers: {
                                    'Content-Type': undefined
                                },
                                transformRequest: angular.identity,
                            }).then(function (response) {

                                if (response.data == "scheduled") {

                                    if (num < y) {
                                        $scope.chekRepat();
                                    }
                                    else {
                                        $('#ScheduleMsg').val('');
                                        $('#ScheduleTime').val('');
                                        $('#input_0').val('');
                                        $('#input_1').val('');
                                        $scope.dispbtn = true;
                                        console.log(newdate1);
                                        $scope.rep = true;
                                        swal("Message scheduled successfully");
                                    }    
                                }
                                else {
                                    swal(response.data);
                                }
                                
                            }, function (reason) {
                                console.log(reason);
                            });

                        
                        }

                        else if ($scope.check == false) {
                            var formData = new FormData();
                            $scope.dispbtn = false;
                            $http({
                                method: 'POST',
                                url: apiDomain + '/api/SocialMessages/ScheduleMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + newdate1 + '&imagePath=' + encodeURIComponent($('#imageUrl').val()),
                                data: formData,
                                headers: {
                                    'Content-Type': undefined
                                },
                                transformRequest: angular.identity,
                            }).then(function (response) {

                                if (num < y) {
                                    $scope.chekRepat();
                                }
                                else {
                                    $('#ScheduleMsg').val('');
                                    $('#ScheduleTime').val('');
                                    $scope.dispbtn = true;
                                    swal("Message scheduled successfully");

                                }                               
                            }, function (reason) {
                                console.log(reason);
                            });
                        }
                        else {
                            alertify.set({ delay: 3000 });
                            alertify.error("File extension is not valid. Please upload an image file");
                            $('#input-file-now').val('');
                        }

                        
                    }
                    else {
                        swal('Please enter the date and time to schedule a message');
                    }
                }
                else {
                    swal('Please select a profile to schedule the message');
                }
            } else {
                swal('Please enter some text to schedule the message');
            }
        }




        $scope.justChek = function (isCheked) {
            $scope.st = isCheked;
        }
        var num = 0;
        $scope.chekRepat = function () {
            debugger;
            if ($scope.st) {
                var intervalDay = $('#sche_day').val();
                var timeRepeat = $('#timesRepeat').val();
                var x = parseInt(intervalDay); //The parseInt() function parses a string and returns an integer
                var y = parseInt(timeRepeat);
                var arrdate = [];
                var dat = [];
                var curdate = ($('.md-input')[0]).value;
                var date = curdate.split("/");
                dat[0] = parseInt(date[0]);
                
                var datt = dat[0];
                var secDate = datt + x;
                arrdate[0] = secDate + "/" + date[1] + "/" + date[2];
                for (var i = 1; i < y; i++) {
                    var secDate = secDate + x;
                    arrdate[i] = secDate + "/" + date[1] + "/" + date[2];
                }
                for (var i = 0 ; i < y; i++) {
                    num++;
                    $scope.schedulemsg(arrdate[i]);
                    $scope.running = true;
                }
            }
        }

        //$scope.forlop = function () {
        //    debugger;
        //    for (var i = 0 ; i < y; i++) {
        //        num++;
        //        $scope.schedulemsg(arrdate[i]);
        //        $scope.running = true;
                
        //    }
        //}
       
       

        $scope.checkfile = function () {
            var filesinput = $('#input-file-now');
            console.log('sadfkjasdf');
            console.log(filesinput);
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


        $scope.repetition = function () {

                var intervalDay = $('#sche_day').val();
                var timeRepeat = $('#timesRepeat').val();
                var x = parseInt(intervalDay); //The parseInt() function parses a string and returns an integer
                var y = parseInt(timeRepeat);
                var arrdate = [];
                var dat = [];
                var curdate = ($('.md-input')[0]).value;

                var date = curdate.split("/");
                dat[0] = parseInt(date[0]);
                arrdate[0] = dat[0] + "/" + date[1] + "/" + date[2];
                var datt = dat[0];
                for (var i = 1; i < y; i++)
                {
                    var datt=datt+x;
                    arrdate[i] = datt + "/" + date[1] + "/" + date[2];
                }

                for (var i = 0 ; i < y; i++) {   
                        $scope.schedulemsg(arrdate[i]);
            }
         
        };
        


        $scope.draftmsg = function () {
            var message = $('#ScheduleMsg').val();
            var updatedmessage = "";
            var postdata = message.split("\n");
            for (var i = 0; i < postdata.length; i++) {
                updatedmessage = updatedmessage + "<br>" + postdata[i];
            }
            updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
            updatedmessage = updatedmessage.replace(/&+/g, 'nnn');
            updatedmessage = updatedmessage.replace("+", 'ppp');
            updatedmessage = updatedmessage.replace("-+", 'jjj');
            message = updatedmessage;
            //updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
           // message = encodeURIComponent(message);

            // var date_value = $('#input_0').val();
            var date_value = ($('.md-input')[0]).value;
            var date = date_value.split("/");
            date_value = date[1] + "/" + date[0] + "/" + date[2];
            //var time_value = $('#input_1').val();
            var time_value = ($('.md-input')[1]).value;
            var scheduletime = date_value + ' ' + time_value;
            var newdate1 = new Date(scheduletime.replace("AM", "").replace("PM", "")).toUTCString();
            var d = new Date(newdate1);
            var d4 = d.setHours(d.getHours() + 5);
            var date = moment(d4);
            var newdate = new Date(date).toUTCString();

            

            if (message != "" && message != undefined) {
                $scope.checkfile();//added on 19/10/2016
                if ($scope.check == true)
                {
                    var formData = new FormData();
                    formData.append('files', $("#input-file-now").get(0).files[0]);
                    $scope.dispbtn = false;
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + newdate + '&groupId=' + $rootScope.groupId,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        $('#ScheduleMsg').val('');
                        $('#ScheduleTime').val('');
                        $scope.dispbtn = true;
                        swal("Message has got saved in draft successfully");
                    }, function (reason) {
                        console.log(reason);
                    });
                }

                else if ($scope.check == false) 
                {
                    var formData = new FormData();
                    $scope.dispbtn = false;
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/DraftScheduleMessage?userId=' + $rootScope.user.Id + '&message=' + message + '&scheduledatetime=' + newdate + '&groupId=' + $rootScope.groupId,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        $('#ScheduleMsg').val('');
                        $('#ScheduleTime').val('');
                        $scope.dispbtn = true;
                        swal("Message has got saved in draft successfully");
                    }, function (reason) {
                        console.log(reason);
                    });
                }
                else {
                    alertify.set({ delay: 3000 });
                    alertify.error("File extension is not valid. Please upload an image file");
                    $('#input-file-now').val('');
                }
            }
            else {
                swal('Please type a message to save in draft');
            }
        }

       

 $('.dropify').dropify();
    });
});

SocioboardApp.directive('afterRender', function ($timeout) {
    return function (scope, element, attrs) {
            $timeout(function () {
                $('.dropify').dropify();
            });
    };
})