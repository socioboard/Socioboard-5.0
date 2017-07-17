'use strict';

SocioboardApp.controller('RssQueueController', function ($rootScope, $scope, $http, $timeout, $modal,apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    
        rssqueue();
        $scope.deleteRss = function (RssId) {
        	swal({   
	        title: "Are you sure?",   
	        text: "You will not be able to send RSS Feeds!",
	        type: "warning",   
	        showCancelButton: true,   
	        confirmButtonColor: "#DD6B55",   
	        confirmButtonText: "Yes, delete it!",   
	        closeOnConfirm: false }, 
	        function(){   
	            //todo: code to delete profile

	            $http({
	                method: 'POST',
	                url: apiDomain + '/api/RssFeed/DeleteFeedUrl?RssId=' + RssId,
	            }).then(function (response) {
	                if (response.data == "Deleted") {
	                    swal("Deleted!", "Your RSS Feed has been deleted.", "Success");
	                    window.location.reload();
	                    $scope.rssqueue();
	                }
	                else {
	                    swal("Deleted!", response.data, "success");
	                    $scope.rssqueue();
	                }

	            }, function (reason) {
	                swal("Deleted!", reason, "success");
	            });

	            //todo: code to delete profile
	            });
        }

        $scope.rssqueue=function()
        {
            //codes to load  rss queue
            $http.get(apiDomain + '/api/RssFeed/GetRssDataByUser?userId=' + $rootScope.user.Id + '&groupId=' + $rootScope.groupId)
                          .then(function (response) {

                              if (response.data != "") {

                                  $scope.lstrssqueue = response.data;
                                  $scope.fetchdatacomplete = true;
                                  $scope.headlines = true;
                              }
                              else
                              {
                                  $scope.lstrssqueue = null;
                                  $scope.nofeeds = true;
                                  $scope.fetchdatacomplete = true;
                              }
                          }, function (reason) {
                              $scope.error = reason.data;
                          });
            // end codes to load rss queue
        }
        $scope.rssqueue();



        $scope.editrssurl = function (oldurl, rssId) {
            $rootScope.oldurl = oldurl;
            $rootScope.rssId = rssId;
            $('#EditModal').openModal();
           // alert($rootScope.oldurl);
            //$scope.modalinstance = $modal.open({
            //    templateUrl: 'editsrssfeedModalContent.html',
            //    controller: 'RssQueueController',
            //    scope: $scope
            //});
        }
        $scope.closeModal = function () {
            $scope.modalinstance.dismiss('cancel');
        }

        $scope.editrssUrl = function () {
            var rssQueue = $('#rssQueue').val().trim();
            if(rssQueue==$rootScope.oldurl)
            {
                swal('Please modify the URL to edit');
            }
            else if(rssQueue==''){
                swal('Please enter the new URL to update');
                return;
            }
            else {
                //codes to edit  rss url
                $http.post
                    (apiDomain + '/api/RssFeed/EditFeedUrl?NewFeedUrl=' + rssQueue + '&OldFeedUrl=' + $rootScope.oldurl + '&RssId=' + $rootScope.rssId)
                              .then(function (response) {
                                 // alert(response.data);
                                  if (response.data == "Success") {
                                      swal(response.data);
                                      $scope.rssqueue();
                                  }
                                  else if (response.data == "This Url Does't  Conatin Rss Feed") {
                                      swal("This URL does not contain RSS feed. Try with another one");
                                  }
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
                // end codes to edit rss url
            }
        }
  });

});