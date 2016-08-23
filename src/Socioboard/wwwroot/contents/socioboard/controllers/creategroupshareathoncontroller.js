'use strict';

SocioboardApp.controller('CreateGroupShareathonController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        creategroupshareathon();
        $scope.dispbtn = true;


        $scope.getfacebookgroup = function () {
           var profileId = $('#groupshareathonfacebookaccount').val();
            //codes to get facebook group
            $http.get(apiDomain + '/api/Facebook/GetFacebookGroup?profileId=' + profileId)
                              .then(function (response) {
                                  if (response.data.length>0) {
                                      $scope.lstfacebookgroup = response.data;
                                  } else {
                                      $scope.lstfacebookgroup = '';
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to get facebook group
        }



        $scope.AddGroupShareathon=function()
        {
            var Facebookaccountid = $('#groupshareathonfacebookaccount').val();
            var FacebookUrl = $('#postpage_url').val();
            var FacebookGroupId = $('#facebookgroupid').val();
            var Timeintervalminutes = $('#grouptimerinterval').val();
          
            if (Facebookaccountid != null && FacebookUrl != '' && FacebookGroupId != '' && Timeintervalminutes != null) {
                $scope.dispbtn = false;
                //codes to add groupshareathon
                $http.post(apiDomain + '/api/Shareathon/AddGroupShareathon?Facebookaccountid=' + Facebookaccountid + '&FacebookUrl=' + FacebookUrl + '&Timeintervalminutes=' + Timeintervalminutes + '&FacebookGroupId=' + FacebookGroupId + '&userId=' + $rootScope.user.Id)
                                  .then(function (response) {
                                      swal(response.data);
                                      window.location.href = "#/group_shareathon.html";
                                  }, function (reason) {
                                      $scope.error = reason.data;
                                  });
                // end codes to add groupshareathon
            }
            else {
                $scope.dispbtn = true;
                swal('please fill all the details');
            }
        }


        $scope.EditGroupShareathon = function (GroupShareathodId) {
            var Facebookaccountid = $('#groupshareathonfacebookaccount').val();
            var FacebookUrl = $('#postpage_url').val();
            var FacebookGroupId = $('#facebookgroupid').val();
            var Timeintervalminutes = $('#grouptimerinterval').val();
            //codes to edit  page shreathon
            $http.post(apiDomain + '/api/Shareathon/EditGroupShareathon?Facebookaccountid=' + Facebookaccountid + '&FacebookUrl=' + FacebookUrl + '&Timeintervalminutes=' + Timeintervalminutes + '&FacebookGroupId=' + FacebookGroupId + '&userId=' + $rootScope.user.Id + '&GroupShareathodId=' + GroupShareathodId)
                          .then(function (response) {
                              swal(response.data);
                              window.location.href = "#/group_shareathon.html";
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to edit page shreathon
        }

  });

});