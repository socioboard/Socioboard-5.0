'use strict';

SocioboardApp.controller('LinkedinPageFeedsManagerController', function ($rootScope, $scope, $http, $timeout, $stateParams, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        linkedinpagefeedsmanager();
        

        //Ui
        $('.collapsible').collapsible({
	      accordion : false 
        });
        //END UI
            
        //Compose post
        $scope.ComposeMessage = function () {
            var message = $('#compose').val();
            var updatedmessage = "";
            var testmsg = message;message = encodeURIComponent(message);

            $scope.findExtension();
            if (/\S/.test(testmsg)) {
                $scope.checkfile();
                if ($scope.check == true) {
                    var formData = new FormData();
                    formData.append('files', $("#input_file").get(0).files[0]);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SavedFeedsManagement/SavePost?socialProfileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId + '&profileType=4' + '&shareMessage=' + message + '&picUrl=' + $scope.profileData.logoUrl + '&mediaType=' + $scope.fileExtensionName + '&SocialProfileName=' + $scope.profileData.linkedinPageName + '&sbuserName=' + $rootScope.user.FirstName + ' ' + $rootScope.user.LastName + '&sbuserPic=' + $rootScope.user.ProfilePicUrl,
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        if (response.data == true) {
                            $scope.loadfeedsSavedData();
                            $('#ComposePostModal').closeModal();
                            swal('message saved successfully');
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
        //END COMPOSE POST

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

        //Extension Type
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
        //END EXTENSION TYPE

        //Find profile data
        $scope.loadProfileDetails = function () {
            $http.get(apiDomain + '/api/LinkedIn/GetLinkedinPageSingle?pageId=' + $stateParams.profileId)
                         .then(function (response) {
                             debugger;
                             $scope.profileData = response.data;
                             console.log($scope.profileData);
                         }, function (reason) {
                             $scope.error = reason.data;
                         });
        }
        $scope.loadProfileDetails();
        //END FIND PROFILE DATA

        //Get Onload saved Feeds
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
        //END GET ONLOAD SAVED FEEDS

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
                                  $scope.loadfeedsSavedData();
                                  swal("Deleted");
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            });
        }
        //END DELETE POST

        //open schedule modal
        $scope.openSchedule = function (feeds) {
            debugger;
            $('#scheduleModal').openModal();
            $scope.selectedFeedsch = feeds;
            $rootScope.feedval = feeds;
            console.log("noroot", $scope.selectedFeedsch);
            console.log("withroot", $rootScope.feedval);
            var dateval = $('#datepickerval').val();
            var timeval = $scope.hourval + ":" + $scope.minval + '' + $scope.ampmvalu;
            console.log(datetime);
            //$http.get(apiDomain + '/api/SavedFeedsManagement/ScheduleMsg?postId=' + selectedFeedData.strId + '&groupId=' + $rootScope.groupId + '&schtime=')
            //             .then(function (response) {
            //                 $scope.allcomment = response.data;
            //             }, function (reason) {
            //                 $scope.error = reason.data;
            //             });

        }

        //schedule post
        $scope.schdule = function (schdata) {
            debugger;
            //  $('#scheduleModal').openModal();
            //  $scope.selectedFeedsch = selectedFeedData;
            // $rootScope.feedval = selectedFeedData;
            var $input = $('.datepicker').pickadate();
            var picker = $input.pickadate('picker', 'dateformat');
            var dt = new Date(picker.get());
            var hr = $('#hourSelect').val();
            var min = $('#minSelect').val();
            var ampm = $('#AmPmSelect').val();
            var timeval = hr + ':' + min + ampm;
            //$('#datepicker').datepicker({ dateFormat: 'dd-mm-yy' }).val();


            console.log(dt);
            var datetime = $scope.hourval + ":" + $scope.minval + '' + $scope.ampmvalu;

            $http.get(apiDomain + '/api/SavedFeedsManagement/ScheduleMsg?postId=' + schdata.postId + '&groupId=' + $rootScope.groupId + '&schtime=' + picker.get() + '&timeval=' + timeval)
                         .then(function (response) {
                             $scope.allcomment = response.data;
                             if (response.data == true) {
                                 $('#scheduleModal').closeModal();
                                 swal("successfully scheduled")
                                 $scope.loadfeedsSavedData();
                             }
                             else {
                                 swal("error while scheduling")
                             }
                         }, function (reason) {
                             $scope.error = reason.data;
                         });

        }

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
                           title: 'Your post has approved',
                           showConfirmButton: false,
                           timer: 5000
                       })
                       $scope.loadfeedsSavedData();
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
               $scope.loadfeedsSavedData();

           })
            }


        }
        //End 


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
//Filter Video
.filter('Url', function ($sce) {
    return function (Url) {
        return $sce.trustAsResourceUrl(Url);
    };
});
//END FILTER VIDEO