'use strict';

SocioboardApp.controller('ImgLibraryController', function ($rootScope, $scope, $http, $modal, $timeout, $state, apiDomain, domain) {
   $scope.$on('$viewContentLoaded', function() {   
           
       ImgLibrary();
       $scope.dispbtn = true;
       $scope.query = {};
       $scope.queryBy = '$';
       $scope.reachetotallength = function () {
           $scope.reachedsize = "You can't upload more images as you already reached total library space";
           swal($scope.reachedsize);
       };
       //open compose model
       $scope.opencomposemodel = function (img) {
           $('#ImgDesModal').closeModal();
           jQuery('input:checkbox').removeAttr('checked');
           if (img != null) {
               var message = {
                   "image": img.imagePath,
               };
               $scope.composePostdata = message;
           }
           $('#ComposePostModal').openModal();
           var composeImagedropify = $('#composeImage').parents('.dropify-wrapper');
           $(composeImagedropify).find('.dropify-render').html('<img src="' + img.imagePath + '">');
           $(composeImagedropify).find('.dropify-preview').attr('style', 'display: block;');
           $('select').material_select();
       }

       //open image model
       $scope.openimgmodel = function (img) {
           $('#ImgDesModal').openModal();
           $scope.imagedetail = img;
           var imgsize = ($scope.imagedetail.imageSize)/1024;
           if (imgsize < 1024)
           {
               var size= Math.round(imgsize * 100) / 100;
               $scope.imglength = size + 'KB';
           }
           else
           {
               var size = Math.round(imgsize * 100) / 100;
               var tempsize = size / 1024;
               var temsize = Math.round(tempsize * 100) / 100;
               $scope.imglength = temsize + 'MB';
           }
           //.imagePath
       }
       //open upload model
       $scope.openuploadmodel = function (img) {
           $scope.uploadbtn = true;
           $('#ImgUploadModal').openModal();

       }

       //Save Image In Private
       $scope.SaveImageforPrivate = function () {
           $scope.uploadbtn = false;
           var imgName = $('#img_name').val();
           if (/\S/.test(imgName)) {
               //var imagelocalPath = $('#input-file-now').val();
               var formData = new FormData();
               formData.append('files', $("#input-file-now").get(0).files[0]);
               $http({
                   method: 'POST',
                   url: apiDomain + '/api/ImgLibrary/SaveImageforPrivate?userId=' + $rootScope.user.Id + '&imgName=' + imgName,
                   data: formData,
                   headers: {
                       'Content-Type': undefined
                   },
                   transformRequest: angular.identity,
               })
               .then(function (response) {
                   swal(response.data);
                   window.location.reload();
                   //window.location.reload();
               }, function (reason) {
                   alertify.set({ delay: 5000 });
                   alertify.error(reason.data);


               });
           }
           else {
               swal("Please enter image name");
               $scope.uploadbtn = true;
           }
        }

      //Load LoadImagesForPrivate
       $scope.LoadImagesForPrivate = function () {
            $http.get(apiDomain + '/api/ImgLibrary/LoadImagesForPrivate?userid=' + $rootScope.user.Id)
           .then(function (response) {
               $scope.imgdetails = response.data;
               //var tempsize = 0;
               //angular.forEach($scope.imgdetails, function (value, key) {
               //    tempsize = tempsize + value.imageSize;
               //});
               //var imgsize = tempsize;
               //if (imgsize < 1024) {
               //    var size = Math.round(imgsize * 100) / 100;
               //    $scope.imglength = size + 'KB';
               //}
               //else {
                   
               //    var tempsize = imgsize / 1024;
               //    var size = Math.round(tempsize * 100) / 100;
               //    $scope.imglength = size + 'MB';
               //}
           }, function (reason) {
               $scope.error = reason.data;
           });
       }

       //Count Size
       $scope.Totalimagesize = function () {
           
           $http.get(apiDomain + '/api/ImgLibrary/Totalimagesize?userid=' + $rootScope.user.Id)
           .then(function (response) {
               $scope.totalimagesize = response.data;

           }, function (reason) {
               $scope.error = reason.data;
           });
       }

       //Delete Images
        $scope.deleteImages = function (imgid) {
             swal({
                title: "Are you sure?",
                text: "You want to delete this image!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
           function () {
                   $http({
                   method: 'POST',
                   url: apiDomain + '/api/ImgLibrary/DeleteImage?userid=' + $rootScope.user.Id + '&imgid=' + imgid,
               }).then(function (response) {
                   if (response.data == "Deleted") {
                       swal("Deleted!", "Image is deleted", "success");
                   }
                   window.location.reload();
               });
            });
        }

        //open compose model
        $scope.ComposePostModal = function () {
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
            var message = $('#composeMessage').val();
            var updatedmessage = "";
            var testmsg = message;
            message = encodeURIComponent(message);
            if (profiles.length > 0 && /\S/.test(testmsg)) {
                $scope.checkfile();
                if ($scope.check == true) {
                    var formData = new FormData();
                    $scope.dispbtn = false;
                    formData.append('files', $("#composeImage").get(0).files[0]);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/ComposeMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&imagePath=' + encodeURIComponent($('#imageUrl').val()),
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
                    swal('please select profile');
                }
                else {
                    swal('Please enter text');
                }
            }
        }
        $scope.checkfile = function () {
            var filesinput = $('#composeImage');
            var fileExtension = ['jpeg', 'jpg', 'png', 'gif', 'bmp'];
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

        //On page Load
        $scope.getOnPageLoadReports = function () {
            $scope.LoadImagesForPrivate();
            $scope.Totalimagesize();
        }

        $scope.getOnPageLoadReports();
  });

});