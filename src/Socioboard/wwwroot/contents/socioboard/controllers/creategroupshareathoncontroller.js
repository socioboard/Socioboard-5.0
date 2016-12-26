'use strict';

SocioboardApp.controller('CreateGroupShareathonController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        creategroupshareathon();
        $scope.dispbtn = true;


        $scope.getfacebookgroup = function (tested) {
            $('select').material_select();
            $scope.lstfacebookgroup = '123';
            var profileId = tested;
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

            if (FacebookUrl.indexOf("facebook") == -1 || FacebookUrl.indexOf("https") == -1 || FacebookUrl.indexOf("http") == -1)
            {
                swal("please enter url like https://www.facebook.com/bollycrazy");
                return false;
            }
          
                $scope.dispbtn = false;
                var formData = new FormData();
                formData.append('FacebookGroupId', FacebookGroupId);
                formData.append('FacebookUrl', FacebookUrl);
                //codes to add groupshareathon
               // $http.post(apiDomain + '/api/Shareathon/AddGroupShareathon?Facebookaccountid=' + Facebookaccountid + '&FacebookUrl=' + FacebookUrl + '&Timeintervalminutes=' + Timeintervalminutes + '&FacebookGroupId=' + FacebookGroupId + '&userId=' + $rootScope.user.Id)
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/Shareathon/AddGroupShareathon?Facebookaccountid=' + Facebookaccountid + '&Timeintervalminutes=' + Timeintervalminutes + '&userId=' + $rootScope.user.Id,
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity,
                })
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

            if (FacebookUrl.indexOf("facebook") == -1 || FacebookUrl.indexOf("https") == -1 || FacebookUrl.indexOf("http") == -1) {
                swal("please enter url like https://www.facebook.com/bollycrazy");
                return false;
            }
            if (Facebookaccountid != null && FacebookUrl != '' && FacebookGroupId != '' && Timeintervalminutes != null) {
                $scope.dispbtn = false;
            //codes to edit  page shreathon
           // $http.post(apiDomain + '/api/Shareathon/EditGroupShareathon?Facebookaccountid=' + Facebookaccountid + '&FacebookUrl=' + FacebookUrl + '&Timeintervalminutes=' + Timeintervalminutes + '&FacebookGroupId=' + FacebookGroupId + '&userId=' + $rootScope.user.Id + '&GroupShareathodId=' + GroupShareathodId)
                var formData = new FormData();
                formData.append('FacebookGroupId', FacebookGroupId);
                formData.append('FacebookUrl', FacebookUrl);
                //codes to add groupshareathon
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/Shareathon/EditGroupShareathon?Facebookaccountid=' + Facebookaccountid + '&Timeintervalminutes=' + Timeintervalminutes + '&userId=' + $rootScope.user.Id + '&GroupShareathodId=' + GroupShareathodId,
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity,
                })
                .then(function (response) {
                              swal(response.data);
                              window.location.href = "#/group_shareathon.html";
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
                // end codes to edit page shreathon
            }
            else {
                $scope.dispbtn = true;
                swal('please fill all the details');
            }
        }

  });

});