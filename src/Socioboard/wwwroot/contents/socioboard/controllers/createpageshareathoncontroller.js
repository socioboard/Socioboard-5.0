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
            //codes to add  page shreathon
            $http.post(apiDomain + '/api/Shareathon/AddPageShareathon?userId=' + $rootScope.user.Id + '&FacebookPageId=' + pageId + '&Facebookaccountid=' + accountId + '&Timeintervalminutes=' + timeInterval)
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
            //codes to edit  page shreathon
            $http.post(apiDomain + '/api/Shareathon/EditPageShareathon?userId=' + $rootScope.user.Id + '&FacebookPageId=' + pageId + '&Facebookaccountid=' + accountId + '&Timeintervalminutes=' + timeInterval + '&PageShareathodId=' + PageShareathodId)
                          .then(function (response) {
                              swal(response.data);
                              window.location.href = "#/page_shareathon.html";
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to edit page shreathon
        }


       

  });

});