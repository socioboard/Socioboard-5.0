'use strict';

SocioboardApp.controller('GooglePlusFeedsController', function ($rootScope, $scope, $http, $timeout,$stateParams, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        googleplusfeeds();
        var start = 0; // where to start data
        var ending = start + 30; // how much data need to add on each function call
        var reachLast = false; // to check the page ends last or not
        $scope.loadmore = "Loading More data..";
        

        $scope.lstGpFeeds = [];
        $scope.LoadTopFeeds = function () {
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Google/GetGplusFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=30')
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.date(response.data);
                              } else {
                                  swal("No Post To Display");
                              }
                             // $scope.date(response.data);comment by sweta
                            //  $scope.lstGpFeeds = response.data;

                              //if (response.data == null) { by me
                              //    reachLast = true; by me
                              //}
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load  recent Feeds
        }
        $scope.LoadTopFeeds();


        $scope.date = function (parm) {

            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i].PublishedDate);
                var newdate = date.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3];
                parm[i].PublishedDate = date;
            }
            $scope.lstGpFeeds = parm;

        }
    });
});