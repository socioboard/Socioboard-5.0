'use strict';

SocioboardApp.controller('BoardController', function ($rootScope, $scope, $http, $timeout, $stateParams, $state, apiDomain) {
    $scope.$on('$viewContentLoaded', function () {
        $rootScope.boardComposeMessage = {};
        $scope.lstBoardFeeds = [];
      //  $scope.lstBoardFeeds.length = 1;
        $scope.boardName = $stateParams.boardName;
        var starttwitter = 0; // where to start data
        var lastreach = false;
        var endingtwitter = starttwitter + 30; // how much data need to add on each function call
        var twitterReachLast = false; // to check the page ends last or not
        $scope.LoadTopTwitterFeeds = function () {
            if (!twitterReachLast) {
                //codes to load  recent Feeds
                $http.get(apiDomain + '/api/BoardMe/getTwitterFeeds?boardId=' + $stateParams.boardId + '&userId=' + $rootScope.user.Id + '&skip=' + starttwitter + '&count=30')
                              .then(function (response) {
                                  response.data.forEach(function (feed) {
                                      $scope.lstBoardFeeds.push(feed);
                                  });
                                  starttwitter = starttwitter + response.data.length;
                                  $scope.lastreach = true;
                                  //$scope.lstBoardFeeds.push(response.data);
                                  console.log($scope.lstBoardFeeds);
                                  if (response.data == null) {
                                      twitterReachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load  recent Feeds
            }
        }

         

        var startGplus = 0; // where to start data
        var endingGplus = startGplus + 30; // how much data need to add on each function call
        var GplusReachLast = false; // to check the page ends last or not
        $scope.LoadTopGplusFeeds = function () {
            if (!GplusReachLast) {
                //codes to load  recent Feeds
                $http.get(apiDomain + '/api/BoardMe/getGplusfeeds?boardId=' + $stateParams.boardId + '&userId=' + $rootScope.user.Id + '&skip=' + startGplus + '&count=30')
                              .then(function (response) {
                                  //$scope.lstBoardFeeds = response.data;
                                  response.data.forEach(function (feed) {
                                      $scope.lstBoardFeeds.push(feed);
                                  });
                                  startGplus = startGplus + response.data.length;
                                  $scope.lastreach = true;
                                  console.log($scope.lstBoardFeeds);
                                  if (response.data == null) {
                                      GplusReachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load  recent Feeds
            }
        }


        var startInstagram = 0; // where to start data
        var endingInstagram = startInstagram + 30; // how much data need to add on each function call
        var InstagramReachLast = false; // to check the page ends last or not
        $scope.LoadTopInstagramFeeds = function () {
            if (!InstagramReachLast) {
                //codes to load  recent Feeds
                $http.get(apiDomain + '/api/BoardMe/getInstagramFeeds?boardId=' + $stateParams.boardId + '&userId=' + $rootScope.user.Id + '&skip=' + startInstagram + '&count=30')
                              .then(function (response) {
                                  response.data.forEach(function (feed) {
                                      $scope.lstBoardFeeds.push(feed);
                                  });
                                  startInstagram = startInstagram + response.data.length;
                                  $scope.lastreach = true;
                                  ////$scope.lstBoardFeeds = response.data;
                                  //$scope.lstBoardFeeds.push(response.data[0]);
                                  //console.log($scope.lstBoardFeeds);
                                  if (response.data == null) {
                                      InstagramReachLast = true;
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to load  recent Feeds
            }
        }
       

        $scope.loadMore = function () {
            console.log('loadMore....');
            $scope.LoadTopTwitterFeeds();
            $scope.LoadTopGplusFeeds();
            $scope.LoadTopInstagramFeeds();
        }
        $scope.loadMore();

        boardme();
        $scope.deleteProfile = function (profileId) {
            // console.log(profileId);
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
	            swal("Deleted!", "Your board has been deleted.", "Success");
	        });
        }


        $scope.scheduledraft = function (schedulemessage) {
           
             if (schedulemessage.gplusboardaccprofileid != null) {
                var message = {
                    "shareMessage": schedulemessage.title,
                    "picUrl": schedulemessage.imageurl
                };
                console.log(message);
                console.log("google");
                $rootScope.schedulemessage = message;
            }
            else if (schedulemessage.twitterprofileid != null) {
                var message = {
                    "shareMessage": schedulemessage.text,
                    "picUrl": schedulemessage.imageurl
                };
                console.log(message);
                console.log("twitter");
                $rootScope.schedulemessage = message;
            }
            else if (schedulemessage.feedid != null) {
                var message = {
                    "shareMessage": schedulemessage.tags ,
                    "picUrl": schedulemessage.imageurl.split('?')[0]
                };
                console.log(message);
                console.log("instagram");
                $rootScope.schedulemessage = message;
            }



            $rootScope.grppost = false;
            $state.go('schedulemessage');
        }
      
        $scope.cmpbtn = true;

        $scope.openComposeMessage = function (schedulemessage) {

            if (schedulemessage.gplusboardaccprofileid != null) {
                var message = {
                    "shareMessage": schedulemessage.title,
                    "picUrl": schedulemessage.imageurl
                };
                console.log(message);
                console.log("google");
                $rootScope.boardComposeMessage = message;
            }
            else if (schedulemessage.twitterprofileid != null) {
                var message = {
                    "shareMessage": schedulemessage.text,
                    "picUrl": schedulemessage.imageurl
                };
                console.log(message);
                console.log("twitter");
                $rootScope.boardComposeMessage = message;
            }
            else if (schedulemessage.feedid != null) {
                var message = {
                    "shareMessage": schedulemessage.tags,
                    "picUrl": schedulemessage.imageurl
                };
                console.log(message);
                console.log("instagram");
                $rootScope.boardComposeMessage = message;

            }


            $('#ComposePostModal').openModal();
            var composeImagedropify = $('#composeImage').parents('.dropify-wrapper');
            $(composeImagedropify).find('.dropify-render').html('<img src="' + schedulemessage.imageurl + '">');
            $(composeImagedropify).find('.dropify-preview').attr('style', 'display: block;');
            $('select').material_select();

           // $('.dropify').dropify();

        }

        $scope.ComposeMessage = function () {
            $scope.dispbtn = false;
            var profiles = $('#composeProfiles').val();
            var message = $('#composeMessage').val();
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
                        url: apiDomain + '/api/SocialMessages/ComposeMessage?profileId=' + profiles + '&userId=' + $rootScope.user.Id + '&message=' + message + '&imagePath=' +encodeURIComponent($('#imageUrl').val()),
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
                        console.log(reason);
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
                if (profiles.length < 0) {
                    swal('please select profile');
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

    });

});

SocioboardApp.directive('myRepeatFeedTimeoutDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                console.log("myRepeatFeedTimeoutDirective Called");
                var $containerProducts = $("#products");
                $containerProducts.imagesLoaded(function () {
                    $containerProducts.masonry({
                        itemSelector: ".product",
                        columnWidth: ".product-sizer",
                    });
                });


            });
        }
    };
})


SocioboardApp.directive('afterRender', function ($timeout) {
    return function (scope, element, attrs) {
        $timeout(function () {
            $('.dropify').dropify();
        });
    };
})