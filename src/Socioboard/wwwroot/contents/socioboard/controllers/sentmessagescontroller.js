'use strict';

SocioboardApp.controller('SentMessagesController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        var count = 30; // where to start data
        $scope.messagesEnding = 0; // how much data need to add on each function call
        var lastreach = false;
        $scope.messagesReachLast = false; // to check the page ends last or not
        sentmessages();
       
    $scope.fetchsentmessages = function () {
        //codes to load  sent messages start
        $http.get(apiDomain + '/api/SocialMessages/GetAllSentMessages?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                      .then(function (response) {
                          if (response.data == null || (response.data != null && response.data.length == 0)) {
                              $scope.messagesReachLast = true;
                          }
                          else {
                              $scope.date(response.data);
                              $scope.lastreach = true;
                              $scope.messagesEnding = $scope.messagesEnding + response.data.length;

                          }
                          
                      }, function (reason) {
                          $scope.error = reason.data;
                      });
        // end codes to load sent messages
    }
    $scope.fetchsentmessages();

    $scope.LoadSentmsgByDay=function(day)
    {
        //codes to load  sent messages start
        $http.get(apiDomain + '/api/SocialMessages/getAllSentMessageDetailsforADay?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&day=' + day)
                      .then(function (response) {
                          if (response.data == null || (response.data != null && response.data.length == 0)) {
                              $scope.messagesReachLast = true;
                          }
                          else {
                              $scope.messagesEnding = $scope.messagesEnding + response.data.length;

                              $scope.date(response.data);

                             

                          }

                      }, function (reason) {
                          $scope.error = reason.data;
                      });
        // end codes to load sent messages
    }

    $scope.LoadSentmsgByDays = function (days) {
        //codes to load  sent messages start
        $http.get(apiDomain + '/api/SocialMessages/getAllSentMessageDetailsByDays?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&days=' + days)
                      .then(function (response) {
                          if (response.data == null || (response.data != null && response.data.length == 0)) {
                              $scope.messagesReachLast = true;
                          }
                          else {
                              $scope.date(response.data);

                              $scope.messagesEnding = $scope.messagesEnding + response.data.length;

                          }

                      }, function (reason) {
                          $scope.error = reason.data;
                      });
        // end codes to load sent messages
    }

    $scope.LoadSentmsgByMonth = function (month) {
        //codes to load  sent messages start
        $http.get(apiDomain + '/api/SocialMessages/getAllSentMessageDetailsByMonth?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id + '&month=' + month)
                      .then(function (response) {
                          if (response.data == null || (response.data != null && response.data.length == 0)) {
                              $scope.messagesReachLast = true;
                          }
                          else {
                              $scope.date(response.data);

                              $scope.messagesEnding = $scope.messagesEnding + response.data.length;

                          }

                      }, function (reason) {
                          $scope.error = reason.data;
                      });
        // end codes to load sent messages
    }

    $scope.date = function (parm) {

        for (var i = 0; i < parm.length; i++) {
            var date = moment(parm[i].scheduleTime);
            var newdate = date.toString();
            var splitdate = newdate.split(" ");
            date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3];
            parm[i].scheduleTime = date;
        }
        $scope.lstsentessage = parm;

    }

    $scope.getProperURL = function (obj) {
        console.log(obj);
        if (obj.includes("wwwroot\\")) {
            var img = obj.split("wwwroot\\upload\\")[1];
            return apiDomain + "/api/Media/Get?id=" + img;
        }
        else {
            return obj;
        }
    };

    });
});