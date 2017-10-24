'use strict';

SocioboardApp.controller('HistoryController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        //history();
        var count = 30; // where to start data
        $scope.messagesEnding = 0; // how much data need to add on each function call
        $scope.lastreach = false;
        $scope.messagesReachLast = false; // to check the page ends last or not
        $scope.atvFilter = false;
        $scope.filterVal = 1;
        $scope.filterName = "Filter";

        $scope.fetchsentmessages = function () {
            //codes to load  sent messages start
            $http.get(apiDomain + '/api/SocialMessages/GetAllSentMessages?groupId=' + $rootScope.groupId + '&userId=' + $rootScope.user.Id)
                          .then(function (response) {
                              if (response.data == null || (response.data != null && response.data.length == 0)) {
                                  $scope.lastreach = true;
                                  $scope.nomessages = true;
                              }
                              else {
                                  $scope.dataAll = response.data;
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

        $scope.LoadSentmsgByDay = function (day) {
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

        $scope.filterProfiles = function (no, nameoffilter) {
            $scope.filterName = nameoffilter;
            if (no != -1) {
                document.getElementById('filterDrop').style.color = 'darkgreen';
                var filtered = [];
                angular.forEach($scope.dataAll, function (item) {
                    if (item.profileType == no) {
                        filtered.push(item);
                    }
                })
                $scope.date(filtered);
            }
            else
            {
                document.getElementById('filterDrop').style.color = 'darkred';
                $scope.date($scope.dataAll);
            }
        }

        $scope.filterProfilesLink = function (nameoffilter) {
            document.getElementById('filterDrop').style.color = 'darkgreen';
            $scope.filterName = nameoffilter;
            var filtered = [];
            angular.forEach($scope.dataAll, function (item) {
                if (item.profileType == 3) {
                    filtered.push(item);
                }
            })
            $scope.date(filtered);
        }
        $scope.filterProfilesLinkPage = function (nameoffilter) {
            document.getElementById('filterDrop').style.color = 'darkgreen';
            $scope.filterName = nameoffilter;
            var filtered = [];
            angular.forEach($scope.dataAll, function (item) {
                if (item.profileType == 4) {
                    filtered.push(item);
                }
            })
            $scope.date(filtered);
        }

        $scope.getProperURL = function (obj) {

            if (obj.includes("wwwroot\\")) {
                var img = obj.split("wwwroot\\upload\\")[1];
                return apiDomain + "/api/Media/Get?id=" + img;
            }
            else {
                return obj;
            }
        };

        $('.smartinbox_slider').slimScroll({
            color: '#1976D2',
            size: '10px',
            height: '600px',
            alwaysVisible: true,
            allowPageScroll: true
        });

        $('.smartinbox_filter_slider').slimScroll({
            color: '#424242',
            size: '10px',
            height: '200px',
            alwaysVisible: true,
            allowPageScroll: true
        });

        $('.dropdown-button').dropdown({
            inDuration: 300,
            outDuration: 225,
            constrain_width: false, // Does not change width of dropdown to that of the activator
            hover: true, // Activate on hover
            gutter: 0, // Spacing from edge
            belowOrigin: false, // Displays dropdown below the button
            alignment: 'left' // Displays dropdown with edge aligned to the left of button
        }
 );


    });
})
.filter('Url', function ($sce) {
    return function (Url) {
        return $sce.trustAsResourceUrl(Url);
    };
});