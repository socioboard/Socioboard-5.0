jQuery(document).ready(function($){

    Waves.displayEffect();

    // Cashing variables

    var simple = $('.simple');
    var account = $('.account');
    var commish = $('.commish');
    /** Animating Unifi Section
     *********************************/
    $(window).scroll( function() {
        if ($(window).scrollTop() > 550) {
            simple.addClass('animated');
        } else {
            simple.removeClass('animated');
        }

        if ($(window).scrollTop() > 1050) {
            commish.addClass('animated');
        } else {
            commish.removeClass('animated');
        }

        if ($(window).scrollTop() > 1550) {
            account.addClass('animated');
        } else {
            account.removeClass('animated');
        }

    });



  // function scrollWin() {
  //   window.scrollTo(0, 600);
  // }

  $('a[href*=#]:not([href=#])').on('click',  function(event) {
    event.preventDefault();

    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') || location.hostname == this.hostname) {
      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 600);
        return false;
      }
    }
  });

  // open interest point description
  $('.cd-single-point').children('a').on('click', function(event){
    event.preventDefault();
    var selectedPoint = $(this).parent('li');
    if( selectedPoint.hasClass('is-open') ) {
      selectedPoint.removeClass('is-open').addClass('visited');
    } else {
      selectedPoint.addClass('is-open').siblings('.cd-single-point.is-open').removeClass('is-open').addClass('visited');
    }
  });
  // close interest point description
  $('.cd-close-info').on('click', function(event){
    event.preventDefault();
    $(this).parents('.cd-single-point').eq(0).removeClass('is-open').addClass('visited');
  });

  //on desktop, switch from product intro div to product mockup div
  $('.js-cd-start').on('click', function (event) {
    event.preventDefault();

    var $this = $(this);
    var parent = $this.parents('.cd-product');

    //detect the CSS media query using .cd-product-intro::before content value
    var mq = window.getComputedStyle(document.querySelector('.cd-product-intro'), '::before').getPropertyValue('content');

    if(mq == 'mobile') {
      $('body,html').animate({'scrollTop': $($this.attr('href')).offset().top }, 200);
    } else {
      //

      parent.addClass('is-product-tour').one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function(){
        $(this).find('.cd-close-product-tour').addClass('is-visible');
        $(this).find('.cd-points-container').addClass('points-enlarged').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function(){
          $(this).addClass('points-pulsing');
        });
      });
      //
    }
    // console.log($this);
    // console.log(parent);
  });

  //on desktop, switch from product mockup div to product intro div
  //$('.cd-close-product-tour').on('click', function(event){
  //  event.preventDefault();
  //
  //  $('.cd-product').removeClass('is-product-tour');
  //  $('.cd-close-product-tour').removeClass('is-visible');
  //  $('.cd-points-container').removeClass('points-enlarged points-pulsing');
  //});

  // ==========================
  // $('.your-class').slick({
    // setting-name: setting-value
  // });

  $('.software-menu').on('click', 'a', function (event) {
    event.preventDefault();

    var $this = $(this);
    var $items = $this.parents('.software-menu').find('li');
    var index = $items.index($this.parent());

    $('.js-slider').slickGoTo(index);

    // $items.find('a').removeClass('is-active');
    // $this.addClass('is-active');
  });

  $('.js-slider').slick({
    dots: false,
    arrows: false,
    fade: true,
    adaptiveHeight: true,
    onBeforeChange: function (el, ci, ti) {
      var $items = $('.software-menu').find('li');
      var itemActive = $items.find('a')[ti];

      $items.find('a').removeClass('is-active');

      $(itemActive).addClass('is-active');
    }
  });

    $('.hardware-menu').on('click', 'a', function (event) {
        event.preventDefault();

        var $this = $(this);
        var $items = $this.parents('.hardware-menu').find('li');
        var index = $items.index($this.parent());

        $('.js-slider-two').slickGoTo(index);

        // $items.find('a').removeClass('is-active');
        // $this.addClass('is-active');
    });


  //
  $('.js-slider-two').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
    asNavFor: '.js-slider-two-nav'
  });

  $('.js-slider-two-nav').slick({
    slidesToShow: 1,
    slidesToScroll: 1,
    asNavFor: '.js-slider-two',
    arrows: false,
    fade: true,
    centerMode: false,
    focusOnSelect: true,
      onBeforeChange: function (el, ci, ti) {
          var $items = $('.hardware-menu').find('li');
          var itemActive = $items.find('a')[ti];

          $items.find('a').removeClass('is-active');

          $(itemActive).addClass('is-active');
      }
  });

  // ==========================
  //

  $('.js-slick').each(function () {
    // console.log(this);
    $(this).slick({
      // setting-name: setting-value
    });
  });

  $('.js-slick-typed').each(function () {
    var $this = $(this);

    $this.slick({
      // setting-name: setting-value
      dots: true,
      onInit: function (el) {
        // body...
        var $currentSlide = $(el.$slides[0]);
        $currentSlide.find('.js-typed-onchange').each(function (i, elem) {
          // body...
          // console.log(this);
          var $elem = $(elem);
          var animString = $elem.data('text') ;

          $elem.typed({
            strings: animString ,
            // loop: false,
            typeSpeed: 30,
            startDelay: 300,
            callback: function() {
              // console.log('done typing!');
              setTimeout(function () {
                $this.slickNext();
              }, 600);
            },
          });

        });
      },
      onAfterChange: function (el, i) {
        // body...
        var $currentSlide = $(el.$slides[i]);

        $currentSlide.find('.js-typed-onchange').each(function (i, elem) {
          // body...
          // console.log(this);
          var $elem = $(elem);
          var animString = $elem.data('text') ;

          $elem.typed({
            strings: animString ,
            // loop: false,
            typeSpeed: 30,
            startDelay: 300,
            callback: function() {
              // console.log('done typing!');
              setTimeout(function () {
                $this.slickNext();
              }, 1000);
            },
          });

        });

      }
    });
  });

  // ==========================

  $('#header').headroom({
    offset : 80
  });

  // =============================

  $('.menu-mobile-trigger').on('click', function (e) {
    // body...
    e.preventDefault();

    $(this).find('#nav-icon2').toggleClass('open');
    $('.menu-mobile').toggleClass('is-active');
    $('.nav-wrap').toggleClass('is-active');
    $('body').toggleClass('no-scroll-y');
    $('html').toggleClass('no-scroll-html');

    // console.log('trigguh');

  });

  // =============================
  // var mastheadText = function (argument) {
  //   // body...
  //   var animString = $('.js-typed').data('text');
  //
  //   $(".js-typed").typed({
  //     strings: animString ,
  //     typeSpeed: 0
  //   });
  //
  // };
  // mastheadText();

  $(".js-typed").each(function () {
    // body...
    var $this = $(this);
    var animString = $this.data('text') ;

    $this.typed({
      strings: animString ,
      typeSpeed: 0
    });

  });

  window.viewportUnitsBuggyfill.init();
});
