'use strict';

SocioboardApp.controller('FacebookTwitterFeedsShareController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {
        $scope.dispbtn = true;
        $scope.queryBy = '$';
        createpageshareathon();

        $scope.facebookfeedshare = function () {
            var profiles = new Array();
            $("#checkboxdata .subcheckbox").each(function () {

                var attrId = $(this).attr("id");
                if (document.getElementById(attrId).checked == false) {
                    var index = profiles.indexOf(attrId);
                    if (index > -1) {
                        profiles.splice(index, 1);
                    }
                } else {
                    profiles.push(attrId);
                }
            });



            var otherprofiles = new Array();
            $("#checkboxdataA .subcheckbox").each(function () {

                var attrId = $(this).attr("id");
                if (document.getElementById(attrId).checked == false) {
                    var index = otherprofiles.indexOf(attrId);
                    if (index > -1) {
                        otherprofiles.splice(index, 1);
                    }
                } else {
                    otherprofiles.push(attrId);
                }
            });
       
            var pageId = $('#facebookpageId').val();
        
            if (profiles == "")
            {   
                swal("please select facebook page");
                return false;
            }
            if (otherprofiles != null) {
              
                $scope.dispbtn = false;
                var formData = new FormData();
                formData.append('FacebookPageId', profiles);
                
                formData.append('OtherSocialProfile', otherprofiles);
                
                //codes to add  page shreathon
                //  $http.post(apiDomain + '/api/Shareathon/AddPageShareathon?userId=' + $rootScope.user.Id + '&FacebookPageId=' + pageId + '&Facebookaccountid=' + accountId + '&Timeintervalminutes=' + timeInterval)
                $http({
                    method: 'POST',
                    url: apiDomain + '/api/Shareathon/FacebookFeedShare?userId=' + $rootScope.user.Id ,
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity,
                })
                .then(function (response) {
                    swal(response.data);
                    $scope.dispbtn = true;
                    $('#facebookpageId').val('');
                    closeModel();
                   // window.location.href = "#/page_shareathon.html";
                }, function (reason) {
                    $scope.error = reason.data;
                });
                // end codes to add page shreathon
            }
            else {
                $scope.dispbtn = true;
                swal('Please select social ');
            }
        }

        //$scope.EditPageShareathon = function (PageShareathodId) {
        //    var accountId = $('#shraeathonfacebookaccount').val();
        //    var pageId = $('#shraeathonfacebookpage').val();
        //    var FacebookUrl = $('#postpage_url').val();
        //    var timeInterval = $('#shraeathontimeinterval').val();
            
        //    if (accountId != null && timeInterval != null) {
        //        if (FacebookUrl != "") {
        //            if (FacebookUrl.indexOf("facebook") == -1 || FacebookUrl.indexOf("https") == -1 || FacebookUrl.indexOf("http") == -1) {
                       
        //                return false;
        //            }
        //        }
        //        $scope.dispbtn = false;
        //        var formData = new FormData();
        //        formData.append('FacebookPageId', pageId);
        //        if (FacebookUrl != "") {
        //            formData.append('FacebookUrl', FacebookUrl);
        //        }
        //        //codes to edit  page shreathon

        //        $http({
        //            method: 'POST',
        //            url: apiDomain + '/api/Shareathon/EditPageShareathon?userId=' + $rootScope.user.Id + '&Facebookaccountid=' + accountId + '&Timeintervalminutes=' + timeInterval + '&PageShareathodId=' + PageShareathodId,
        //            data: formData,
        //            headers: {
        //                'Content-Type': undefined
        //            },
        //            transformRequest: angular.identity,
        //        }).then(function (response) {
        //            swal(response.data);
        //            window.location.href = "#/page_shareathon.html";
        //        }, function (reason) {
        //            $scope.error = reason.data;
        //        });
        //        // end codes to edit page shreathon
        //    }
        //    else {
        //        $scope.dispbtn = true;
        //        swal('Please fill in all the details');
        //    }
        //}




    });

});