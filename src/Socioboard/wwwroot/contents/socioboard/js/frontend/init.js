jQuery(document).ready(function($){

    Waves.displayEffect();

    // Cashing variables

    var simple = $('.simple');
    /** Animating Unifi Section
     *********************************/
    $(window).scroll( function() {
        if ($(window).scrollTop() > 800) {
            simple.addClass('animated');
        } else {
            simple.removeClass('animated');
        }


    });
    });



(function($){
  $(function(){
    $(".dropdown-button").dropdown();
    $('.button-collapse').sideNav();
    $('.parallax').parallax();
    $('.slider').slider({full_width: true});
$('.carousel').carousel();

    // Next slide
$('.carousel').carousel('next');
$('.carousel').carousel('next', [3]); // Move next n times.
// Previous slide
$('.carousel').carousel('prev');
$('.carousel').carousel('prev', [4]); // Move prev n times.
}); // end of document ready
})(jQuery); // end of jQuery name space


$(document).ready(function(){
// the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
$('.modal-trigger').leanModal();
});
$(document).ready(function() {
  $('select').material_select();
});
