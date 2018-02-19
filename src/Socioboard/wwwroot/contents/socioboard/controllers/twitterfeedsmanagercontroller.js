'use strict';

SocioboardApp.controller('TwitterFeedsManagerController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        twitterfeedsmanager();
        $('.collapsible').collapsible({
	      accordion : false 
        });

        $scope.openModels=function()
        {
            $('#chatComment').openModal();
            $('#closeDiv').closeModal();
        }
        //$scope.loadProfileDetails();


          //Find profile data
        $scope.loadProfileDetails = function () {
            debugger;
            $http.get(apiDomain + '/api/Twitter/GettwitterSingle?profileId=' + $stateParams.profileId)
                         .then(function (response) {
                             debugger;
                             $scope.profileData = response.data;
                         }, function (reason) {
                             $scope.error = reason.data;
                         });
        }
        $scope.loadProfileDetails();

        $scope.loadfeedsSavedData = function () {
            $http.get(apiDomain + '/api/SavedFeedsManagement/GetSavedFeeds?profileId=' + $stateParams.profileId + '&groupId=' + $rootScope.groupId)
                         .then(function (response) {
                             debugger;
                             $scope.feedsSavedData = response.data;
                         }, function (reason) {
                             $scope.error = reason.data;
                         });
        }
        $scope.loadfeedsSavedData();





        $scope.ComposeMessage = function () {
            debugger;
            var message = $('#compose').val();
            var updatedmessage = "";
            var testmsg = message;
            message = encodeURIComponent(message);

            $scope.findExtension();
            if (/\S/.test(testmsg)) {
                $scope.checkfile();
                if ($scope.check == true) {
                    var formData = new FormData();
                    formData.append('files', $("#input_file").get(0).files[0]);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SavedFeedsManagement/SavePost?socialProfileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId + '&profileType=2' + '&shareMessage=' + message + '&picUrl=' + $scope.profileData.profileImageUrl + '&mediaType=' + $scope.fileExtensionName + '&SocialProfileName=' + $scope.profileData.twitterScreenName + '&sbuserName=' + $rootScope.user.FirstName + ' ' + $rootScope.user.LastName + '&sbuserPic=' + $rootScope.user.ProfilePicUrl,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        if (response.data == "Posted") {
                            $('#ComposePostModal').closeModal();
                            swal('Message composed successfully');
                            $(".dropify-clear").click();
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
                swal('Please enter some text to compose this message');
            }
        }
        //code for compose message end


        //code for checking the file format start
        $scope.checkfile = function () {
            var filesinput = $('#input_file');//composeImage
            var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'mov', 'mp4', 'mpeg', 'wmv', 'avi', 'flv', '3gp'];
            if (filesinput != undefined && filesinput[0].files[0] != null) {
                if ($scope.hasExtension('#input_file', fileExtension)) {
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
            var fileName = $('#input_file').val();
            return (new RegExp('(' + exts.join('|').replace(/\./g, '\\.') + ')$')).test(fileName);
        }
        //code for checking the file format end
        $scope.findExtension = function () {
            var fileName = $('#input_file');
            var fileExtensionImage = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
            var fileExtensionVideo = ['mov', 'mp4', 'mpeg', 'wmv', 'avi', 'flv', '3gp'];
            if ($scope.hasExtension('#input_file', fileExtensionImage)) {
                $scope.fileExtensionName = 1;
            }
            else if ($scope.hasExtension('#input_file', fileExtensionVideo)) {
                $scope.fileExtensionName = 2;
            }
            else {
                $scope.fileExtensionName = 0;
            }
        }

      








            
    });
});