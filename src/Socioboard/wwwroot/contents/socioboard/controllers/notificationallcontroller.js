'use strict';

SocioboardApp.controller('NotificationAllController', function ($rootScope, $scope, $http, $timeout, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        notification_all();
        //All notification
        var startNotify = 0;
        $scope.notifycount = startNotify;
        $scope.LoadAllNotifications = function () {

            $http.get(apiDomain + '/api/Notifications/FindAllNotifications?userId=' + $rootScope.user.Id + '&skip=' + startNotify + '&count=' + 10)
                              .then(function (response) {
                                  debugger;
                                  $scope.lstnotifications = response.data;
                                  $scope.notifycount = $scope.notifycount + 10;
                                  $http.get(apiDomain + '/api/Notifications/UpdateNotifications?userId=' + $rootScope.user.Id)
                                    .then(function (response) {
                                        $scope.updated = response.data;
                                    })
                                    .catch((error) => {
                                        debugger;
                                    });
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to load  recent Feeds


            $http.get(apiDomain + '/api/Notifications/FindAllInvitationNotifications?userId=' + $rootScope.user.Id + '&skip=' + startNotify + '&count=' + 10)
                .then(function (response) {
                    $scope.lstinvitationnotifications = response.data;
                    debugger;
                }, function (reason) {
                    $scope.error = reason.data;
                });
        }


        $scope.acceptInviations = function (email, memberCode, notifyId) {
            $http.post(apiDomain + '/api/GroupMember/ActivateGroupMember?code=' + memberCode + '&email=' + email)
                .then(function (response) {
                    debugger;
                    if (response.data === "updated") {
                        $scope.lstinvitationnotifications = $scope.lstinvitationnotifications.filter(element => {
                            return element.memberCode !== memberCode && element.email !== email;
                        });                      
                    }
                }, function (reason) {
                    $scope.error = reason.data;
                })
                .then(() => {
                   return $http.get(apiDomain + '/api/Notifications/DeleteNotifications?notifyId=' + notifyId);
                })
                .then(function (response) {
                    debugger;
                    if (response.data === "deleted") {                       
                    }
                }, function (reason) {
                    $scope.error = reason.data;
                })
                .catch((error) => {
                    debugger;
                });
            debugger;
        }

        $scope.declineInviations = function (email, memberCode, notifyId) {          
            $http.post(apiDomain + '/api/GroupMember/DeclineGroupMember?code=' + memberCode + '&email=' + email)
                .then(function (response) {
                    debugger;
                    if (response.data === "deleted") {
                        $scope.lstinvitationnotifications = $scope.lstinvitationnotifications.filter(element => {
                            return element.memberCode !== memberCode && element.email !== email;
                        });
                    }
                }, function (reason) {
                    $scope.error = reason.data;
                })
                .then(() => {
                    return $http.get(apiDomain + '/api/Notifications/DeleteNotifications?notifyId=' + notifyId);
                })
                .then(function (response) {
                    debugger;
                    if (response.data === "deleted") {
                    }
                }, function (reason) {
                    $scope.error = reason.data;
                })
                .catch((error) => {
                    debugger;
                });
        }

        $scope.LoadAllNotifications();

        $scope.changepass = function () {

            $http.get(apiDomain + '/api/Notifications/ChangePasswordDetail?userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.lstChangePass = response.data;
                                  var abc = $scope.lstChangePass;
                                  $scope.lstsinglepass = [];
                                  angular.forEach($scope.lstChangePass, function (value, key) {
                                      $scope.lstsinglepass.push(value.profileName);
                                  });
                                  console.log($scope.lstsinglepass);
                                  if (response.data != "No Data") {
                                      $scope.notifycount = $scope.lstsinglepass.length;
                                  }
                                  else {
                                      $scope.notifycount = 0;
                                  }

                                  console.log("data", $scope.notifycount);

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to load  recent Feeds
        }
        $scope.changepass();








        $scope.getfbprofileId = function () {

            $http.get(apiDomain + '/api/Notifications/getfbchangeprofile?userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.lstfbprofile = response.data;
                                  // console.log($scope.lstfbprofile);
                                  //var abc = $scope.lstfbprofile;

                                  //$scope.notifycount = $scope.notifycount + 10;

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to load  recent Feeds
        }
        $scope.getfbprofileId();

        $scope.reconnect = function () {
            var facebookid = $scope.lstfbprofile;
            console.log($scope.lstfbprofile);
            //  console.log("abcd", $scope.lstfbprofile.userPrimaryEmail);
            $http.get(domain + '/socioboard/recfbcont?id=' + facebookid + '&fbprofileType=' + 0)
                              .then(function (response) {
                                  window.location.href = response.data;

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });

        };


        // start codes to load  recent Feeds
        $scope.loadmore = function () {
            $("#load_more_toggle").addClass("hide");
            $http.get(apiDomain + '/api/Notifications/FindAllNotifications?userId=' + $rootScope.user.Id + '&skip=' + $scope.notifycount + '&count=' + 10)
                              .then(function (response) {
                                  $scope.loadlstnotifications = response.data;
                                  $scope.notifycount = $scope.notifycount + 10;
                                  $("#load_more_toggle").removeClass("hide");
                                  $http.get(apiDomain + '/api/Notifications/UpdateNotifications?userId=' + $rootScope.user.Id)
                                  .then(function (response) {
                                      $scope.updated = response.data;
                                  })
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
        }
        // end codes to load  recent Feeds
    });
});