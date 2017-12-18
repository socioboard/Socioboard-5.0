'use strict';

SocioboardApp.controller('DesignFeedsController', function ($rootScope, $scope, $http, $timeout, apiDomain, $state) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function () {

        $rootScope.fbComposeMessage = {};
        var start = 0; // where to start data
        var ending = 0; // how much data need to add on each function call
        var reachLast = false; // to check the page ends last or not
        $scope.query = {};
        $scope.queryBy = '$';
        $scope.dispbtn = false;
        $scope.disbtncom = true;
        //$scope.loadmore = "/contents/socioboard/images/loader.gif";
        //$rootScope.categories = '';
        //$scope.continue = true;
        designfeeds();

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


        $scope.deleteProfile = function (profileId) {
          
            swal({
                title: "Are you sure?",
                text: "You will not be able to send any message via this account!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
	        function () {
	            //todo: code to delete profile
	            swal("Deleted!", "Your profile has been deleted.", "Success");
	        });
        }

        $scope.getPostData = function (obj) {
            return obj.replace(/%20+/g, " ").replace(/%21+/g, "'").replace(/%27+/g, "'")
        };


       

   

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

      
        $scope.discovery = function (keyword) {
            var categories = $('#categories').val();
            if ($rootScope.user.TrailStatus==2) {
                swal("You cannot use paid features as your trial period has expired");
                return false;
            }
            if (categories == '') {
                categories = keyword;
            }
            if (categories != "" && categories != undefined) {
                $rootScope.categories = categories;
                //codes to load facebook discovery start
                $http.post(apiDomain + '/api/FacebookGroups/GetFacebookGroupFeeds?skip=' + ending + '&count=30' + '&keyword=' + categories)
                              .then(function (response) {
                                  debugger;
                               
                                  if (response.data != "") {
                                      $('#categories').val('');
                                      $('#searchcatagory').closeModal();
                                      if (response.data == null) {
                                          reachLast = true;
                                      } else {
                                          $scope.SearchFacebookdate(response.data);
                                          ending = ending + 30;

                                      }

                                  }
                                  else {
                                      $('#categories').val('');
                                      swal('no post found');
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load facebook discovery
            }
            else {
                swal('Please enter any keyword');
            }
        }

        $scope.GetCategories = function () {

            $http.get(apiDomain + '/api/FacebookGroups/GetCategories')
                              .then(function (response) {
                                  $scope.lstcategories = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });

        }


        $scope.discoveryList = function () {
            $scope.dispbtn = true;
            $scope.continue = false;
            var categories = $rootScope.categories;
            if (categories != "" && categories != undefined) {
                $rootScope.categories = categories;
                //codes to load facebook discovery start
                $http.post(apiDomain + '/api/FacebookGroups/GetFacebookGroupFeeds?skip=' + ending + '&count=30' + '&keyword=' + categories)
                              .then(function (response) {
                                  if (response.data != "") {
                                      if (response.data == null) {
                                          reachLast = true;
                                          $scope.continue = true;
                                          $scope.dispbtn = false;

                                      } else {
                                          $scope.SearchFacebookdate(response.data);
                                          $scope.dispbtn = true;
                                          $scope.continue = true;
                                          ending = ending + 30;
                                      }
                                  }
                                  else {
                                      reachLast = true;
                                      $scope.continue = false;
                                      $scope.dispbtn = false;
                                      // $scope.loadmore = 'reached at bottom';
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load facebook discovery
            }
            else {
                swal('Please enter any keyword');
            }
        }

        $scope.SearchFacebookdate = function (parm) {
            debugger;
            $rootScope.lstDiscoverySearchFacebook = parm;
            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i].DateTimeOfPost);
                var newdate = date.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3];
                parm[i].DateTimeOfPost = date;
            }
            debugger;
            //$rootScope.lstDiscoverySearchFacebook = parm;
            console.log($rootScope.lstDiscoverySearchFacebook);

        }

        $scope.openComposeMessage = function (schedulemessage) {
            jQuery('input:checkbox').removeAttr('checked');
            if (schedulemessage != null)
            {
                var message = {
                   // "shareMessage": schedulemessage.message,
                   // "picUrl": schedulemessage.postImgUrl,
                     "url": schedulemessage.postUrl,
              
                };
               
                $rootScope.fbComposeMessage = message;
            }
            
            $('#ComposePostModal').openModal();
            var composeImagedropify = $('#composeImage').parents('.dropify-wrapper');
            $(composeImagedropify).find('.dropify-render').html('<img src="' + schedulemessage.postImgUrl + '">');
            $(composeImagedropify).find('.dropify-preview').attr('style', 'display: block;');
            $('select').material_select();
        }

        $scope.cmpbtn = true;

        $scope.ComposeMessage = function () {
            
            $scope.disbtncom = false;
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
           // var profiles = $('#composeProfiles').val();
            var message = $('#composeMessage').val();
            var image = $('#imageUrl').val();
            if (image == "N/A")
            {
                image = image.replace("N/A","");
            }
            var updatedmessage = "";
            message = encodeURIComponent(message);
            //var postdata = message.split("\n");
            //for (var i = 0; i < postdata.length; i++) {
            //    updatedmessage = updatedmessage + "<br>" + postdata[i];
            //}
            // updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
            if (profiles.length > 0 && message != '') {
                $scope.checkfile();
                if ($scope.check == true) {
                    var formData = new FormData();
                    formData.append('files', $("#composeImage").get(0).files[0]);
                    $http({
                        method: 'POST',
                        url: apiDomain + '/api/SocialMessages/ComposeMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&imagePath=' + encodeURIComponent(image),
                        data: formData,
                        headers: {
                            'Content-Type': undefined
                        },
                        transformRequest: angular.identity,
                    }).then(function (response) {
                        if (response.data == "Posted") {
                            $scope.disbtncom = true;
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
                $scope.disbtncom = true;
                if (profiles.length == 0) {
                    swal('Please select a profile');
                }
                else {
                    swal('Please select atleast one profile');
                }
            }
        }



        $scope.schedulefbpost = function (schedulemessage) {
            $rootScope.schedulemessage = schedulemessage;
            var message = {
                "url": schedulemessage.postUrl,
            
            };
            //console.log(message);
            //console.log("google");
            $rootScope.schedulemessage = message;
            $rootScope.grppost = true;
            //window.location.href = "#/schedulemessage";
            $state.go('schedulemessage');
        }

        $scope.GetCategories();
        if ($rootScope.lstDiscoverySearchFacebook == undefined) {
            $('#searchcatagory').openModal();
        }
        $scope.discoveryPopUp = function () {
            $('#searchcatagory').openModal();
        }
        // vanilla JS
        // init with element
        var grid = document.querySelector('.grid');
        var msnry = new Masonry(grid, {
            // options...
            itemSelector: '.grid-item',
            columnWidth: 200
        });

        // init with selector
        var msnry = new Masonry('.grid', {
            // options...
        });

    });

});
SocioboardApp.directive("scroll", function ($window) {
    return function (scope, element, attrs) {
        angular.element($window).bind("scroll", function () {
            if (this.pageYOffset >= 1900) {
                scope.boolChangeClass = true;

                if (scope.continue) {
                    scope.discoveryList();
                }


            } else {
                scope.boolChangeClass = false;

            }
            scope.$apply();
        });
    };
});

//var $containerProducts = $("#products");
//$containerProducts.imagesLoaded(function() {
//    $containerProducts.masonry({
//        itemSelector: ".product",
//        columnWidth: ".product-sizer",
//    });
//});


//SocioboardApp.directive('myRepeatFeedTimeoutDirective', function ($timeout) {
//    return function (scope, element, attrs) {
//        if (scope.$last === true) {
//            $timeout(function () {
              
//                var $containerProducts = $("#products");
//                $containerProducts.imagesLoaded(function () {
//                    $containerProducts.masonry({
//                        itemSelector: ".product",
//                        columnWidth: ".product-sizer",
//                    });
//                });
//            });
//        }
//    };
//})




SocioboardApp.directive('afterRender', function ($timeout) {
    return function (scope, element, attrs) {
        $timeout(function () {
            $('.dropify').dropify();
        });
    };
})
 
 

