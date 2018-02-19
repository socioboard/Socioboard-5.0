'use strict';

SocioboardApp.controller('CreatePageShareathonController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        $scope.dispbtn = true;
        createpageshareathon();

        $scope.createpageshreathon = function () {
            var accountId = $('#shraeathonfacebookaccount').val();
            var FacebookUrl = $('#postpage_url').val();
            var pageId = $('#shraeathonfacebookpage').val();
            var timeInterval = $('#shraeathontimeinterval').val();
            if (pageId == "") {
                if (FacebookUrl == "") {
                    swal("please enter any facebook page url or select any facebook page");
                    return false;
                }
            }
            if (accountId != null && timeInterval != null) {
                if (FacebookUrl != "") {
                    if (FacebookUrl.indexOf("facebook") == -1 || FacebookUrl.indexOf("https") == -1 || FacebookUrl.indexOf("http") == -1) {
                        swal("please enter url like https://www.facebook.com/bollycrazy");
                        return false;
                    }
                }
                $scope.dispbtn = false;
                var formData = new FormData();
                formData.append('FacebookPageId', pageId);
                if (FacebookUrl != "") {
                    formData.append('FacebookUrl', FacebookUrl);
                }
                //codes to add  page shreathon
                //  $http.post(apiDomain + '/api/Shareathon/AddPageShareathon?userId=' + $rootScope.user.Id + '&FacebookPageId=' + pageId + '&Facebookaccountid=' + accountId + '&Timeintervalminutes=' + timeInterval)
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/Shareathon/AddPageShareathon?userId=' + $rootScope.user.Id + '&Facebookaccountid=' + accountId + '&Timeintervalminutes=' + timeInterval,
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
                swal('Please fill in all the details');
            }
        }

        $scope.EditPageShareathon = function (PageShareathodId) {
            var accountId = $('#shraeathonfacebookaccount').val();
            var pageId = $('#shraeathonfacebookpage').val();
            var FacebookUrl = $('#postpage_url').val();
            var timeInterval = $('#shraeathontimeinterval').val();
            if (accountId == null) {
                accountId = $rootScope.pageshareathondata.facebookaccountid
            }
            if (pageId == null || pageId.length == 0) {
                pageId = $rootScope.pageshareathondata.facebookpageid
            }
            if (FacebookUrl == null) {
                FacebookUrl = $rootScope.pageshareathondata.facebookPageUrl
            }
            if (timeInterval == null) {
                timeInterval = $rootScope.pageshareathondata.timeintervalminutes
            }
            if (accountId != null && timeInterval != null) {
                if (FacebookUrl != "") {
                    if (FacebookUrl.indexOf("facebook") == -1 || FacebookUrl.indexOf("https") == -1 || FacebookUrl.indexOf("http") == -1) {
                        swal("please enter url like https://www.facebook.com/bollycrazy");
                        return false;
                    }
                }
                $scope.dispbtn = false;
                var formData = new FormData();
                formData.append('FacebookPageId', pageId);
                if (FacebookUrl != "") {
                    formData.append('FacebookUrl', FacebookUrl);
                }
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
                swal('Please fill in all the details');
            }
        }




    });

});