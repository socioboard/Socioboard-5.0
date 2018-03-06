'use strict';

SocioboardApp.controller('InstagramFeedsManagerController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        instagramfeedsmanager();
        $('.collapsible').collapsible({
	      accordion : false 
        });

        //Find profile data
        $scope.loadProfileDetails = function () {
            $http.get(apiDomain + '/api/Instagram/GetInstaAccSingle?accId=' + $stateParams.profileId)
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
                        url: apiDomain + '/api/SavedFeedsManagement/SavePost?socialProfileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId + '&profileType=4' + '&shareMessage=' + message + '&picUrl=' + $scope.profileData.profileUrl + '&mediaType=' + $scope.fileExtensionName + '&SocialProfileName=' + $scope.profileData.insUserName + '&sbuserName=' + $rootScope.user.FirstName + ' ' + $rootScope.user.LastName + '&sbuserPic=' + $rootScope.user.ProfilePicUrl,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        if (response.data == true) {
                            swal('Post saved successfully');
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

        //Comments Management
        $scope.openComment = function (selectedFeedData) {
            $('#commentModal').openModal();
            $scope.selectedFeed = selectedFeedData;

            $http.get(apiDomain + '/api/SavedFeedsManagement/GetComments?postId=' + selectedFeedData.strId + '&groupId=' + $rootScope.groupId)
                         .then(function (response) {
                             $scope.allcomment = response.data;
                         }, function (reason) {
                             $scope.error = reason.data;
                         });

        }

        $scope.addComment = function (selectedFeedData, comment) {
            $http({
                method: 'POST',
                url: apiDomain + '/api/SavedFeedsManagement/SaveComment?postId=' + selectedFeedData.strId + '&profileId=' + selectedFeedData.socialProfileId + '&commentText=' + comment + '&userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId + '&userProfilePic=' + $rootScope.user.ProfilePicUrl + '&userName=' + $rootScope.user.FirstName + ' ' + $rootScope.user.LastName,
                headers: {
                    'Content-Type': undefined
                },
                transformRequest: angular.identity,
            }).then(function (response) {
                if (response.data == "Posted") {
                    swal("Comment Posted");
                }

            }, function (reason) {

            });
        }
        //END COMMENTS MANAGEMANT

        //aprove post 

        $scope.aprovepost = function (value) {
            debugger;
            if (value.review == false) {
                var d = value.strId
                $http.post(apiDomain + '/api/SavedFeedsManagement/aprove?strid=' + d + '&update=' + 'true')
                   .then(function (response) {
                       swal({
                           position: 'top-end',
                           type: 'success',
                           title: 'Your Post  is aprove',
                           showConfirmButton: false,
                           timer: 5000
                       })
                       window.location.reload()
                   })


            }
            else {
                var e = value.strId
                $http.post(apiDomain + '/api/SavedFeedsManagement/aprove?strid=' + e + '&update=' + 'false')
           .then(function (response) {
               swal({
                   position: 'top-end',
                   type: 'success',
                   title: 'sucessfully changes ',
                   showConfirmButton: false,
                   timer: 5000
               })
               window.location.reload()

           })
            }


        }
        //End 



        //Delete Post
        $scope.deletePost = function (tempPostId) {
            swal({
                title: "Delete task",
                text: "Post will be deleted",
                type: "info",
                showCancelButton: true,
                closeOnConfirm: false,
                showLoaderOnConfirm: true
            }, function () {
                $http.post(apiDomain + '/api/SavedFeedsManagement/DeletePost?postId=' + tempPostId)
                          .then(function (response) {
                              if (response.data == true) {
                                  swal("Deleted");
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            });
        }
        //END DELETE POST

        //Show AND hide Header
        $scope.hideheadernames = " Hide";
        var countheader = 0;
        $scope.hideHeader = function () {
            countheader++;
            if (countheader % 2 == 0) {
                $("#myHide").show();
                $scope.hideheadernames = " Hide";
            }
            else {
                $("#myHide").hide();
                $scope.hideheadernames = " Show";
            }
        }
        //END show AND hide Header
    });
})
.filter('Url', function ($sce) {
    return function (Url) {
        return $sce.trustAsResourceUrl(Url);
    };
});