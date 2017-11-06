'use strict';

SocioboardApp.controller('StudioShareathonQueueController', function ($rootScope, $scope, $http, $timeout, apiDomain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
        $scope.query = {};
        $scope.queryBy = '$';
        var lastreach = false;
        studio_shareathon_que();



        $scope.deleteshareathon = function (profileId) {
            swal({
                title: "Are you sure?",
                text: "Do you want to delete this feed!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: "#DD6B55",
                confirmButtonText: "Yes, delete it!",
                closeOnConfirm: false
            },
	        function () {
	            //todo: code to delete profile
	            $http.post(apiDomain + '/api/ContentStudio/DeleteShareathon?PageShareathodId=' + profileId)
                            .then(function (response) {
                                if (response.data == "success") {
                                    swal("Deleted!", "success");
                                    $scope.loadpageshareathon();
                                }
                            }, function (reason) {
                                $scope.error = reason.data;
                            });
	        });
        }


        $scope.loadpageshareathon = function () {

            //codes to get  page shreathon
            $http.get(apiDomain + '/api/ContentStudio/UserpageShareathon?userId=' + $rootScope.user.Id)
                              .then(function (response) {
                                  $scope.shareathonData = response.data;
                              }, function (reason) {
                                  $scope.error = reason.data;
                              });
            // end codes to get page shreathon
        }
  


        //$scope.editpageshareathon = function (sharemessage, socioqueueId) {
        //    $rootScope.editscdmessage = sharemessage;
        //    $rootScope.socioqueueId = socioqueueId;
        //    $('#StudioModal').openModal();
        //}


      


        $scope.shareathonQueue = function () {
            $http.get(apiDomain + '/api/ContentStudio/ShareathonQueue?userId=' + $rootScope.user.Id)
                           .then(function (response) {
                               $scope.shareathonData = response.data;
                               if (response.data != "") {
                                   
                                   $scope.lastreach = true;
                               } else {
                                   $scope.lastreach = true;
                                   $scope.nomessages = true;

                                  // $('#socio_all').attr('disabled', true);
                                   //document.getElementById("deleteAll").disabled = true;
                               }                           
                               console.log($scope.shareathonData);
                           }, function (reason) {
                               $scope.error = reason.data;
                     });
        }


        //$scope.editscheulemessage = function (sharemessage, socioqueueId) {
        //    $rootScope.editscdmessage = sharemessage;
        //    $rootScope.socioqueueId = socioqueueId;
        //    $('#SocioqueueModal').openModal();           
        //}

        $scope.shareathonQueue();

        $scope.updatecontentDb = function () {
            $http.get(apiDomain + '/api/ContentStudio/updatecontentDb?userId=' + $rootScope.user.Id)
                           .then(function (response) {
                             //  $scope.shareathonData = response.data;

                            //   console.log($scope.shareathonData);


                           }, function (reason) {
                               $scope.error = reason.data;
                           });
        }

        $scope.updatecontentDb();


  });

});