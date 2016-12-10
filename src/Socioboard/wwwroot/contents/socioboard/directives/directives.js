SocioboardApp.directive('myRepeatFacebookFeedTimeoutDirective', function ($timeout) {
    return function (scope, element, attrs) {
        if (scope.$last === true) {
            $timeout(function () {
                $('.collapsible').collapsible({});
            });
        }
    };
})


//SocioboardApp.directive('myRepeatusergroupDirective', function ($timeout) {
//    return function (scope, element, attrs) {
//        if (scope.$last === true) {
//            $timeout(function () {
//                $('.lean-overlay').remove();
//            });
//        }
//    };
//})