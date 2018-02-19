'use strict';

SocioboardApp.controller('CalendarController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        calendar();
        $('#calendar').fullCalendar({
            eventLimit: 3,
            events: apiDomain + '/api/SocialMessages/GetAllScheduleMessageCalendar?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id
        });


        //$('#calendar').fullCalendar({
        //    eventLimit: 3,
        //    events: apiDomain + '/api/SocialMessages/GetDaywiseScheduleMessageCalendar?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id
        //});
    });

});