'use strict';

SocioboardApp.controller('TrendingContentController', function ($rootScope, $scope, $http, $timeout, $mdpDatePicker, $mdpTimePicker) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   
    

$scope.currentDate = new Date();
    $scope.showDatePicker = function(ev) {
      $mdpDatePicker($scope.currentDate, {
        targetEvent: ev
      }).then(function(selectedDate) {
        $scope.currentDate = selectedDate;
      });;
    };
    
    $scope.filterDate = function(date) {
      return moment(date).date() % 2 == 0;
    };
    
    $scope.showTimePicker = function(ev) {
      $mdpTimePicker($scope.currentTime, {
        targetEvent: ev
      }).then(function(selectedDate) {
        $scope.currentTime = selectedDate;
      });;
    } 

    
        TrendingContent();
        $scope.deleteProfile = function(profileId){
        	// console.log(profileId);
        	swal({   
	        title: "Are you sure?",   
	        text: "You will not be able to send message via this account!",   
	        type: "warning",   
	        showCancelButton: true,   
	        confirmButtonColor: "#DD6B55",   
	        confirmButtonText: "Yes, delete it!",   
	        closeOnConfirm: false }, 
	        function(){   
	            //todo: code to delete profile
	            swal("Deleted!", "Your profile has been deleted.", "success"); 
	            });
        }




 /*
    * Masonry container for eCommerce page
    */
    var $containerProducts = $("#products");
    $containerProducts.imagesLoaded(function() {
      $containerProducts.masonry({
        itemSelector: ".product",
        columnWidth: ".product-sizer",
      });
    });

  });

});