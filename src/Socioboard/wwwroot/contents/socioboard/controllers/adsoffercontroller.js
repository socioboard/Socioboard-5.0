'use strict';

SocioboardApp.controller('AdsOfferController', function ($rootScope, $scope, $http, $timeout, apiDomain, domain) {
    //alert('helo');
    $scope.$on('$viewContentLoaded', function() {   

        ads_offer();

        var clipboard = new Clipboard('.btn_copy_ads');

        clipboard.on('success', function (e) {
            console.info('Action:', e.action);
            console.info('Text:', e.text);
            console.info('Trigger:', e.trigger);

            e.clearSelection();
            $('#ads_text_copy_1').trigger('autoresize');
        });

        clipboard.on('error', function (e) {
            console.error('Action:', e.action);
            console.error('Trigger:', e.trigger);
            $('#ads_text_copy_1').trigger('autoresize');
        });


   	$('#textarea1').val('<form style="border:1px solid #ccc;padding:3px;text-align:center;" ><a href="https://www.socioboard.com" target="_blank"><img src="https://s-media-cache-ak0.pinimg.com/236x/29/e4/62/29e46244a4e361f225eca086d451f28e.jpg" height="100" width="100" style="border:0" alt="" /></a></form>');
    $('#textarea1').trigger('autoresize');
    
    $scope.message = function (abcd) {
        $scope.abcd = "You have already verified your website for free account ";
        swal(abcd);
    };

        //add ads url
   $scope.addAdsUrl = function () {
        var url = $('#url').val();
       $http.get(apiDomain + '/api/AdsOffers/AddAdsUrl?userId=' + $rootScope.user.Id +'&url=' + url)
       .then(function (response) {
           swal(response.data);
           window.location.reload();
           //window.location.reload();
           //document.querySelector("#mail_div").style.display = "block";
           //document.querySelector("#change_email_btn").style.display = "none";
       }, function (reason) {

           alertify.set({ delay: 5000 });
           alertify.error(reason.data);


       });
   }
   $scope.findAdsUrl = function () {
       $http.get(apiDomain + '/api/AdsOffers/FindUrl?userid=' + $rootScope.user.Id)
      .then(function (response) {
          $scope.urldetails = response.data;
      }, function (reason) {
          $scope.error = reason.data;
      });
   }
   $scope.getOnPageLoadReports = function () {
       $scope.findAdsUrl();
        }

   $scope.getOnPageLoadReports();
    });
});