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
      
        $scope.schedulemsg = function (datess) {
          
            $scope.repeat = false;
            var profiles = $('#scheduleprofiles').val();
            var message = $('#ScheduleMsg').val();

            var timeRepeat = $('#timesRepeat').val();
            var y = parseInt(timeRepeat);

           
 
            if (/\S/.test(message))
            {}
            else  {
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
            var t1 = ("0"+new Date().getHours()).substr(-2) + ":" + ("0" + new Date().getMinutes()).substr(-2) + " " + ampm;
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
                        if ($scope.check == true) {
                            var formData = new FormData();
                            formData.append('files', $("#input-file-now").get(0).files[0]);
                            formData.append('messageText', message);
                            $scope.dispbtn = false;
                            $http({
                                method: 'POST',
                                url: apiDomain + '/api/SocialMessages/ScheduleMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + 'none' + '&scheduledatetime=' + newdate1 + '&localscheduletime=' + scheduletime + '&imagePath=' + encodeURIComponent($('#imageUrl').val()),
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
                                    else if (num < x) {
                                        $scope.weekloopsch();
                                    }
                                    else {
                                        $('#ScheduleMsg').val('');
                                        $('#ScheduleTime').val('');
                                        $('#input_0').val('');
                                        $('#input_1').val('');
                                        $scope.dispbtn = true;
                                       
                                        $scope.rep = true;
                                        $rootScope.draftDelete = "true";
                                        swal("Message scheduled successfully");
                                    }    
                                }
                                else {
                                    swal(response.data);
                                }
                                
                            }, function (reason) {
                               
                            });

                        
                        }

                        else if ($scope.check == false) {
                          
                            var formData = new FormData();
                            formData.append('messageText', message);
                            $scope.dispbtn = false;
                            debugger;
                            $http({
                                method: 'POST',
                                url: apiDomain + '/api/SocialMessages/ScheduleMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + 'none' + '&scheduledatetime=' + newdate1 + '&localscheduletime=' + scheduletime + '&imagePath=' + encodeURIComponent($('#imageUrl').val()),
                                data: formData,
                                headers: {
                                    'Content-Type': undefined
                                },
                                transformRequest: angular.identity,
                            }).then(function (response) {

                                if (num < y) {                                    
                                    $scope.chekRepat();
                                }
                                else if (num < x) {
                                    $scope.weekloopsch();
                                }
                                else {
                                    $('#ScheduleMsg').val('');
                                    $('#ScheduleTime').val('');
                                    $scope.dispbtn = true;
                                     $rootScope.draftDelete = "true";
                                    swal("Message scheduled successfully");

                                }                               
                            }, function (reason) {
                               
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

        $scope.justChek = function (isCheked) {
            $scope.st = isCheked;
        }

        var num = 0;
        $scope.chekRepat = function () {
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

        
        var arr = new Array();
        var arr1 = new Array();
        var numarr = new Array();
        var dval = [];
        var j = 0;
        var l = 0;
        var x=0;
        $scope.SwitchedOn = function (abcd, dayss,num) {
            debugger;            
            arr.push(abcd);
            arr1.push(dayss);
            numarr.push(num);
            
            

            for (var i = j; i < 7; i++)
            {
                if(num == j)
                {
                    dval[j] = dayss;
                }
                else
                {
                    if (dval[j] != null) {
                        var v = abcd;
                    }
                    else {
                        dval[j] = null;
                    }
                     
                }
                j++;
                var k = j;
                
            }
            j = k - 7;

            
           
            console.log("dval");
            console.log(dval);
            $scope.dayfindFunc();
        }

        $scope.weekdayChek = function (isCheked) {
            $scope.endisval = isCheked;
        }
        $scope.disableswith = function () {
          
                debugger;
                var currentdate = new Date();
                var weekday = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
                   "Friday", "Saturday");
                var n = currentdate.getDay() - 1;
                var dayValue = weekday[currentdate.getDay()];
                $scope.dayscompare = dayValue;
                $scope.numday = n;


        }

        $scope.disableswith();

        var arrdate = [];
        $scope.dayfindFunc = function () {
            debugger;
            var weekday = new Array("Sunday", "Monday", "Tuesday", "Wednesday", "Thursday",
               "Friday", "Saturday");
            var exactDate;
            var currentdate = ($('.md-input')[0]).value;
            var datevalue = currentdate.split("/");
            
            exactDate = datevalue[1] + "/" + datevalue[0] + "/" + datevalue[2];
            var d = new Date(exactDate);
            var numday = d.getDay();//for day number
            var dayValue = weekday[d.getDay()];//for weekday
            
            var a = dayValue;
            var dat = [];
            dat[0] = parseInt(datevalue[0]);                  
            var exactvalue = dat[0];           
            
            

            for (var i = 0 ; i < 7; i++)
            {
               
                    if (dval[i] == "Monday" )
                    {
                        
                        //a = dayValue;
                        //if (dval[i] == a)
                        //{
                        //    var b = 0;
                        //}
                        if (i > (numday-1))
                        {
                            //exactvalue++;
                            arrdate[i] = exactvalue + "/" + datevalue[1] + "/" + datevalue[2];
                        }
                    }
                    else if (dval[i] == "Tuesday")
                    {
                        
                        a = dayValue;
                        if (dval[i] == a) {
                            var b = 1;
                        }
                        if (i > (numday - 1))
                        {
                            //exactvalue++;
                            arrdate[i] = exactvalue + "/" + datevalue[1] + "/" + datevalue[2];

                        }
                    }
                    else if (dval[i] == "Wednesday")
                    {
                        
                        a = dayValue;
                        if (dval[i] == a) {
                            var b = 2;
                        }
                        if (i > (numday - 1))
                        {
                            //exactvalue++;
                            arrdate[i] = exactvalue + "/" + datevalue[1] + "/" + datevalue[2];
                        }
                    }
                    else if (dval[i] == "Thursday")
                    {

                        a = dayValue;
                        if (dval[i] == a) {
                            var b = 3;
                        }
                        if (i > (numday - 1))
                        {
                            //exactvalue++;
                            arrdate[i] = exactvalue + "/" + datevalue[1] + "/" + datevalue[2];
                        }
                    }
                    else if (dval[i] == "Friday" )
                    {
                        a = dayValue;
                        if (dval[i] == a) {
                            var b = 4;
                        }
                        if (i > (numday - 1))
                        {
                            //exactvalue++;
                            arrdate[i] = exactvalue + "/" + datevalue[1] + "/" + datevalue[2];
                        }
                    }
                    else if (dval[i] == "Saturday")
                    {
                        a = dayValue;
                        if (dval[i] == a) {
                            var b = 5;
                        }
                        if (i > (numday - 1))
                        {
                            //exactvalue++;
                            arrdate[i] = exactvalue + "/" + datevalue[1] + "/" + datevalue[2];
                        }
                    }
                    else if (dval[i] == "Sunday")
                    {
                        a = dayValue;
                        if (dval[i] == a) {
                            var b = 6;
                        }
                        if (i > (numday - 1))
                        {
                            //exactvalue++;
                            arrdate[i] = exactvalue + "/" + datevalue[1] + "/" + datevalue[2];
                        }
                    }
                    if (i >= (numday - 1))
                    {   
                        exactvalue++;
                    }
                    if (dval[i] != null) {
                        x++;
                    }
                   
            }

           
        }

        $scope.weekloopsch = function () {

            for (var i = 0 ; i < arrdate.length; i++) {
                num++;
                if (arrdate[i] != null) {
                   
                    $scope.schedulemsg(arrdate[i]);
                    $scope.running = true;
                }
                
            }
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
            var testmessage = message;
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
          
            if (/\S/.test(testmessage)) {
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