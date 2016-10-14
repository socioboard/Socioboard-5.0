'use strict';

SocioboardApp.controller('CreatePageShareathonController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
        $scope.dispbtn = true;
        createpageshareathon();

        $scope.createpageshreathon = function () {
            var accountId = $('#shraeathonfacebookaccount').val();
            var pageId = $('#shraeathonfacebookpage').val();
            var timeInterval = $('#shraeathontimeinterval').val();
            if (accountId != null && pageId != '' && timeInterval != null) {
                $scope.dispbtn = false;
                var formData = new FormData();
                formData.append('FacebookPageId', pageId);
            //codes to add  page shreathon
          //  $http.post(apiDomain + '/api/Shareathon/AddPageShareathon?userId=' + $rootScope.user.Id + '&FacebookPageId=' + pageId + '&Facebookaccountid=' + accountId + '&Timeintervalminutes=' + timeInterval)
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/Shareathon/AddPageShareathon?userId=' + $rootScope.user.Id +'&Facebookaccountid=' + accountId + '&Timeintervalminutes=' + timeInterval,
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity,
                })
                .then(function (response) {
                              swal(response.data);
                              window.location.href = "#/page_shareathon.html";
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to add page shreathon
            }
            else {
               $scope.dispbtn = true;
                swal('please fill all the details');
            }
        }

        $scope.EditPageShareathon = function (PageShareathodId) {
            var accountId = $('#shraeathonfacebookaccount').val();
            var pageId = $('#shraeathonfacebookpage').val();
            var timeInterval = $('#shraeathontimeinterval').val();
            console.log(accountId + ":" + pageId + ":" + timeInterval)
            if (accountId != null && pageId != '' && timeInterval != null) {
                $scope.dispbtn = false;
                var formData = new FormData();
                formData.append('FacebookPageId', pageId);
            //codes to edit  page shreathon
            
            $http({
                method: 'POST',
                url: apiDomain + '/api/Shareathon/EditPageShareathon?userId=' + $rootScope.user.Id + '&Facebookaccountid=' + accountId + '&Timeintervalminutes=' + timeInterval + '&PageShareathodId=' + PageShareathodId,
                data: formData,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity,
            }).then(function (response) {
                              swal(response.data);
                              window.location.href = "#/page_shareathon.html";
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