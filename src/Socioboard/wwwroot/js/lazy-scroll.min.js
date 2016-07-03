/*
** lazy-scroll v1.00
** (c) shabeeb
** mail@shabeebk.com
* shabeebk.com/blog/lazy-scroll-infinite-scrolling-angularjs
*
*/
angular.module("lazy-scroll",[]).directive("lazyScroll",["$rootScope","$window",function(l,o){return{link:function(l,r,n){var e,i,c=.9,e=!0;o=angular.element(o),null!=n.lazyNoScroll&&l.$watch(n.lazyNoScroll,function(l){e=1==l?!1:!0}),void 0!=n.lazyScrollTrigger&&n.lazyScrollTrigger>0&&n.lazyScrollTrigger<100&&(c=n.lazyScrollTrigger/100),i=function(){var o=window.pageYOffset,r=window.document.body.clientHeight,i=window.innerHeight,a=o/(r-i);return e&&a>=c?l.$apply(n.lazyScroll):void 0},o.on("scroll",i),l.$on("$destroy",function(){return o.off("scroll",i)})}}}]);