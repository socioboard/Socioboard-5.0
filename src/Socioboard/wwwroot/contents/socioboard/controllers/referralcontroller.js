'use strict';

SocioboardApp.controller('ReferralController', function ($rootScope, $scope, $http, $timeout, $modal, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        referral();
        $scope.dispbtn = true;
        $scope.query = {};
        $scope.queryBy = '$';
        $scope.refrralcode = $rootScope.user.RefrralCode;
        $scope.opencomposemodel = function () {
            $('#ComposePostModal').openModal();
         }
        //Compose Message
        var getAllSelected = function () {
            var selectedItems = $rootScope.lstProfiles.filter(function (profile) {
                return profile.Selected;
            });

            return selectedItems.length === $rootScope.lstProfiles.length;
        }
        var setAllSelected = function (value) {
            angular.forEach($rootScope.lstProfiles, function (profile) {
                profile.Selected = value;
            });
        }
        $scope.allSelected = function (value) {
            if (value !== undefined) {
                return setAllSelected(value);
            } else {
                return getAllSelected();
            }
        }
        //code for compose message start
        $scope.ComposeMessage = function () {

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

            $scope.dispbtn = false;
            // var profiles = $('#composeProfiles').val();
            var message = $('#composeMessage').val();
            var updatedmessage = "";
            var testmsg = message;
            message = encodeURIComponent(message);
            //var postdata = message.split("\n");
            //for (var i = 0; i < postdata.length; i++) {
            //    updatedmessage = updatedmessage + "<br>" + postdata[i];
            //}
            // updatedmessage = updatedmessage.replace(/#+/g, 'hhh');


            if (profiles.length != 0 && /\S/.test(testmsg)) {
                $scope.checkfile();
                if ($scope.check == true) {
                    var formData = new FormData();
                    formData.append('files', $("#composeImage").get(0).files[0]);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/ComposeMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&shortnerstatus=' + $rootScope.user.urlShortnerStatus,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        if (response.data == "Posted") {
                            $scope.dispbtn = true;
                            $('#ComposePostModal').closeModal();
                            swal('Message composed successfully');
                        }

                    }, function (reason) {

                    });
                }
                else {
                    alertify.set({ delay: 3000 });
                    alertify.error("File extension is not valid. Please upload an image file");
                    $('#input-file-now').val('');
                }
            }
            else {
                $scope.dispbtn = true;
                if (profiles.length == 0) {
                    swal('Please select a profile');
                }
                else {
                    swal('Please enter some text to compose this message');
                }
            }
        }
        //code for compose message end

        //code for checking the file format start
        $scope.checkfile = function () {
            var filesinput = $('#composeImage');//composeImage
            var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'mov', 'mp4', 'mpeg', 'wmv', 'avi', 'flv', '3gp'];
            if (filesinput != undefined && filesinput[0].files[0] != null) {
                if ($scope.hasExtension('#composeImage', fileExtension)) {
                    $scope.check = true;
                }
                else {
                    $scope.check = false;
                }
            }
            else {
                $scope.check = true;
            }
        }
        $scope.hasExtension = function (inputID, exts) {
            var fileName = $('#composeImage').val();
            return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
        }
        //code for checking the file format end
  });

});