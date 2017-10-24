'use strict';

SocioboardApp.controller('GooglePlusFeedsController', function ($rootScope, $scope, $http, $timeout,$stateParams, apiDomain,domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
        $scope.disbtncom = true;
        $scope.buildbtn = true;
        googleplusfeeds();
        var start = 0; // where to start data
        var preloadmorefeeds = false;// disable starter loader after loading feeds
        var nofeeds = false;
        var ending = start + 10; // how much data need to add on each function call
        var reachLast = false; // to check the page ends last or not
        $scope.loadmore = "Loading More data..";
        $scope.getHttpsURL = function (obj) {
           
            return obj.replace("http:", "https:")
        };

        //select all
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
        //end
        $scope.lstGpFeeds = [];
        $scope.LoadTopFeeds = function () {
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Google/GetGplusFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=10')
                          .then(function (response) {
                              if (response.data != "") {
                                  $scope.date(response.data);
                                  //$scope.reloadFeeds();
                                  $scope.preloadmorefeeds = true;
                                  $scope.dropCalled = true;
                                  setTimeout(function () {
                                      $scope.callDropmenu();
                                  }, 1000);
                              } else {
                                  $scope.preloadmorefeeds = true;
                                  $scope.nofeeds = true;
                                  $scope.dropCalled = true;
                                  setTimeout(function () {
                                      $scope.callDropmenu();
                                  }, 1000);
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load  recent Feeds
        }
        $scope.LoadTopFeeds();
        $scope.ReLoadingTopFeeds = function () {
            $scope.filters = false;
            $scope.preloadmorefeeds = false;
            $scope.lstGpFeeds = null;
            $scope.LoadTopFeeds();
        }
        $scope.reloadFeeds = function () {
            setTimeout(function () { $scope.LoadTopFeeds(); }, 10000);
        }
        $scope.date = function (parm) {
            for (var i = 0; i < parm.length; i++) {
                var date = moment(parm[i].PublishedDate);
                var newdate = date.toString();
                var splitdate = newdate.split(" ");
                date = splitdate[0] + " " + splitdate[1] + " " + splitdate[2] + " " + splitdate[3];
                parm[i].PublishedDate = date;
            }
            $scope.lstGpFeeds = parm;
        }

        $scope.callDropmenu = function () {
            $('.dropdown-button').dropdown({
                inDuration: 300,
                outDuration: 225,
                constrain_width: false, // Does not change width of dropdown to that of the activator
                hover: true, // Activate on hover
                gutter: 0, // Spacing from edge
                belowOrigin: false, // Displays dropdown below the button
                alignment: 'right' // Displays dropdown with edge aligned to the left of button
            });
        }

        $scope.filterSearch = function (postType) {
            $scope.filters = true;
            $scope.preloadmorefeeds = false;
            $scope.lstGpFeeds = null;
            //codes to load  recent Feeds
            $http.get(apiDomain + '/api/Google/GetGplusFilterFeeds?profileId=' + $stateParams.profileId + '&userId=' + $rootScope.user.Id + '&skip=0&count=30' + '&postType=' + postType)
                          .then(function (response) {
                              // $scope.lstProfiles = response.data;
                              //$scope.lstinsFeeds = response.data;
                              if (response.data == null) {
                                  reachLast = true;
                              }
                              $scope.date(response.data);
                              $scope.preloadmorefeeds = true;


                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load  recent Feeds
        }

        $scope.ReconnectGplus = function (xyz) {


            $http.get(domain + '/socioboard/ReconnGoacc?option=' + xyz)
                              .then(function (response) {
                                  window.location.href = response.data;

                              }, function (reason) {
                                  $scope.error = reason.data;
                              });

        };
        
        //repost

        $scope.openComposeMessage = function (contentFeed) {
        
            jQuery('input:checkbox').removeAttr('checked');
            if (contentFeed != null) {
                var message = {
                    "title": contentFeed.title,
                    "image": contentFeed.attachment,
                };

                $rootScope.contentMessage = message;

            }

            $('#ComposePostModal').openModal();
            var composeImagedropify = $('#composeImage').parents('.dropify-wrapper');
            $(composeImagedropify).find('.dropify-render').html('<img src="' + contentFeed.attachment + '">');
            $(composeImagedropify).find('.dropify-preview').attr('style', 'display: block;');
            $('select').material_select();
        }
        //end



        // start compose
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
            //if (image == "N/A") {
            //    image = image.replace("N/A", "");
            //}
            var updatedmessage = "";
            message = encodeURIComponent(message);
            //var postdata = message.split("\n");
            //for (var i = 0; i < postdata.length; i++) {
            //    updatedmessage = updatedmessage + "<br>" + postdata[i];
            //}
            //updatedmessage = updatedmessage.replace(/#+/g, 'hhh');
            if (profiles.length > 0 && message != '') {
                $scope.checkfile();
                if ($scope.check == true) {
                    var formData = new FormData();
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
                            $scope.disbtncom = true;
                            // $('#composeMessage').val('');
                            //$('#composeMessage').val('');
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
                    swal('Please enter some text to compose this message');
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
        //end


    });
});