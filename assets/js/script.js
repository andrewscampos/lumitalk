/**
 *
 * Template Name : Landpagy HTML Landing Template
 * @author
 * @version 1.0.0
 * @package Landpagy
 *
 * */

(function ($) {
  ("use strict");

    $("#preloader").addClass("loading");
  
    $(window).on("load", function () {
      setTimeout(function () {
        $("#preloader").fadeOut(500, function () {
          $("#preloader").removeClass("loading");
        });
      }, 500);
    });

  //*=============menu sticky js =============*//
  window.addEventListener("scroll", function () {
    const stickyNav = document.querySelector(".sticky-nav");
    stickyNav.classList.toggle("navbar_fixed", window.scrollY > 0);
  });

  $(document).ready(function () {
    $(window).scroll(function () {
      if ($(document).scrollTop() > 500) {
        $("body").addClass("test");
      } else {
        $("body").removeClass("test");
      }
    });

    // counter
    if ($(".counter").length) {
      var counter = $(".counter");

      counter.counterUp({
        delay: 20,
        time: 1000,
      });
    }
  });

  // scrollToTop
  $(window).scroll(function () {
    if ($(this).scrollTop() > 100) {
      $(".scrollToTop").fadeIn();
    } else {
      $(".scrollToTop").fadeOut();
    }
  });
  //Click event to scroll to top
  $(".scrollToTop").click(function () {
    $("html, body").animate(
      {
        scrollTop: 0,
      },
      800
    );
    return false;
  });

  /*  Menu Click js  */
  function Menu_js() {
    if ($(".submenu").length) {
      $(".submenu > .dropdown-toggle").click(function () {
        var location = $(this).attr("href");
        window.location.href = location;
        return false;
      });
    }
  }
  Menu_js();

  /*--------------- mobile dropdown js--------*/
  function active_dropdown2() {
    $(".menu > li .mobile_dropdown_icon").on("click", function (e) {
      $(this).parent().find("ul").first().slideToggle(300);
      $(this).parent().siblings().find("ul").hide(300);
    });
  }

  active_dropdown2();

  if ($("#scroll-container").length) {
    // init controller
    var controller = new ScrollMagic.Controller();

    // define movement of panels
    var wipeAnimation = new TimelineMax().to("#scroll-container", 1, {
      x: "-55%",
    });

    // create scene to pin and link animation
    new ScrollMagic.Scene({
      triggerElement: "#fixedWrapper",
      triggerHook: "onLeave",
      duration: "350%",
    })
      .setPin("#fixedWrapper")
      .setTween(wipeAnimation)
      .addIndicators()
      .addTo(controller);

    var horizontal = new ScrollMagic.Scene({
      offset: 50,
      duration: 300,
      // reverse: false
    })

      // .addIndicators()
      .addTo(controller);
  }

    //*============= testimonial =============*//
    $(document).ready(function () {
      if ($("#billing-testimonial").length) {
          const slider = new Swiper("#billing-testimonial", {
            loop: true,
            pagination: {
              el: ".swiper-pagination",
              clickable: true,
            },
            autoplay: {
              delay: 2500,
              disableOnInteraction: false,
            },
            breakpoints: {
              0: {
                slidesPerView: 1,
                spaceBetween: 30,
              },
              768: {
                slidesPerView: "auto",
                centeredSlides: true,
                spaceBetween: 30,
              },
            },
          });
        }

        if ($("#testimonial-2").length) {
          const slider2 = new Swiper("#testimonial-2", {
            slidesPerView: 1,
            spaceBetween: 50,
            centeredSlides: true,
      
            breakpoints: {
              768: {
                slidesPerView: 2,
              },
            },
          });
        }

        if ($("#testimonial-3").length) {
          const slider3 = new Swiper("#testimonial-3", {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,
            breakpoints: {
              768: {
                navigation: {
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                },
              },
            },
          });
        }

        if ($("#user-slider").length) {
          const slider4 = new Swiper("#user-slider", {
            slidesPerView: 1,
            spaceBetween: 0,
            loop: true,
          });
        }   
        
        if ($("#testimonial-5").length) {
          const slider5 = new Swiper("#testimonial-5", {
            loop: true,
            pagination: {
              el: ".swiper-pagination",
              type: "fraction",
            },
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
            breakpoints: {
              0: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: "auto",
                centeredSlides: false,
                spaceBetween: 60,
              },
            },
          });
        } 

        if ($("#testimonial-7").length) {
          const slider7 = new Swiper("#testimonial-7", {
            loop: true,
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
            breakpoints: {
              0: {
                slidesPerView: 1,
                spaceBetween: 10,
              },
              768: {
                slidesPerView: "auto",
                centeredSlides: false,
                spaceBetween: 60,
              },
            },
          });
        }

        if ($("#testimonial-8").length) {
          const slider8 = new Swiper("#testimonial-8", {
            loop: true,
            navigation: {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            },
            breakpoints: {
              0: {
                slidesPerView: 1,
                spaceBetween: 100,
              },
              768: {
                slidesPerView: "auto",
                centeredSlides: false,
                spaceBetween: 0,
              },
            },
          });
        }
        
        if ($("#testimonial-9").length) {
          const slider8 = new Swiper("#testimonial-9", {
            loop: true,
            breakpoints: {
              0: {
                slidesPerView: 1,
                spaceBetween: 0,
              },
              768: {
                slidesPerView: "auto",
                centeredSlides: false,
                spaceBetween: -120,
              },
            },
          });
        }   

        if ($(".app-client-slider").length) {
          $(".app-client-slider").slick({
            dots: true,
            arrows: false,
            centerMode: true,
            centerPadding: '0px',
            slidesToShow: 3,
            autoplay: true,
            infinite: true,
            autoplaySpeed: 3000,
            slidesToScroll: 3,
            responsive: [
              {
                breakpoint: 1200,
                settings: {
                  slidesToShow: 3,
                  slidesToScroll: 3,
                },
              },
              {
                breakpoint: 991,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 3,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                },
              },
            ],
          });
        }

        if ($(".app-blog-slider").length) {
          $(".app-blog-slider").slick({
            dots: false,
            arrows: true,
            centerMode: false,
            slidesToShow: 3,
            autoplay: false,
            infinite: true,
            slidesToScroll: 3,
            prevArrow:
              '<button type="button" class="slick-prev"><i class="arrow_left"></i></button>',
            nextArrow:
              '<button type="button" class="slick-next"><i class="arrow_right"></i></button>',
            responsive: [
              {
                breakpoint: 1200,
                settings: {
                  slidesToShow: 2,
                  slidesToScroll: 2,
                },
              },
              {
                breakpoint: 768,
                settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                },
              },
            ],
          });
        }

        function Custom_Rotate_loop(i) {
          var timeCount = i + 1;
          $(".integreted-app .app").each(function (params) {
            var Trans = $(this).css("transform").split(",");
            var tranlateX = parseInt(Trans[4]);
            var tranlateY = parseInt(Trans[5]);
            $(this).css(
              "transform",
              `translateX(${tranlateX}px) translateY(${tranlateY}px)  rotate(-${
                45 * timeCount
              }deg)`
            );
          });
      
          $(".integreted-app").css("transform", `rotate(${45 * timeCount}deg)`);
          setTimeout(function () {
            Custom_Rotate_loop(timeCount);
          }, 4500);
        }
        Custom_Rotate_loop(0);
        
  });


  if ($(".history-wrapper").length) {

    var $carousel = $(".history-wrapper");
    var $slider;

    $carousel.slick({
      speed : 300,
      arrows: false,
      infinite: false,
      loop: false,
      slidesToShow: 3,
      responsive: [
        {
          breakpoint: 800,
          settings: {
            slidesToShow: 2,
            slidesToScroll: 1,
          }
        },
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          }
        }
    ],
    }).on('afterChange', (e, slick, slide) => {
      $slider.slider('value', slide);
    });
    
    $slider = $( ".history-scrollbar" ).slider({
      min : 0,
      max : 7,
      slide: function(event, ui) {
        var slick = $carousel.slick( "getSlick" );
        goTo = ui.value * (slick.slideCount-1) / 7;
        console.log( goTo );
        $carousel.slick( "goTo", goTo );
      }
    });

  }


  if ($(".testimonial-slider-six").length) {
    $(".testimonial-slider-six").slick({
      dots: false,
      arrows: true,
      slidesToShow: 1,
      centerMode: false,
      autoplay: false,
      infinite: true,
      autoplaySpeed: 7000,
      fade: true,
      slidesToScroll: 1,
      prevArrow:
        '<button type="button" class="slick-prev"><i class="arrow_left"></i></button>',
      nextArrow:
        '<button type="button" class="slick-next"><i class="arrow_right"></i></button>',
    });
  }

  if ($(".user-slider").length) {
    $(".user-slider").slick({
      dots: true,
      arrows: false,
      slidesToShow: 1,
      centerMode: false,
      autoplay: false,
      infinite: true,
      autoplaySpeed: 7000,
      slidesToScroll: 1,
    });
  }

  if ($(".slider-wrapper").length) {
    $(".slider-wrapper").slick({
      dots: false,
      arrows: true,
      slidesToShow: 2,
      centerMode: false,
      autoplay: false,
      infinite: true,
      autoplaySpeed: 7000,
      slidesToScroll: 1,
      responsive: [
        {
          breakpoint: 480,
          settings: {
            slidesToShow: 1,
            slidesToScroll: 1,
          }
        }
    ],
      nextArrow: '<i class="arrow_right"></i>',
      prevArrow: '<i class="arrow_left"></i>'
      
    });
  }

  if ($(".statistics-slider").length) {
    $(".statistics-slider").slick({
      dots: true,
      arrows: false,
      slidesToShow: 1,
      autoplay: true,
      infinite: true,
      autoplaySpeed: 3000,
      slidesToScroll: 1,
    });
  }

  $(".nice-select-common").niceSelect();

  new WOW().init();

  if ($("#banner_animation").length > 0) {
    $("#banner_animation").parallax({
      scalarX: 10.0,
      scalarY: 0,
    });
  }

  if ($("#faq-area-three").length > 0) {
    $("#faq-area-three").parallax({
      scalarX: 0.0,
      scalarY: 10.0,
    });
  }

  if ($("#feel-the-wave").length) {
    $("#feel-the-wave").wavify({
      height: 80,
      bones: 4,
      amplitude: 90,
      color: "rgba(235,235,182,0.2)",
      speed: 0.15,
    });
  }
  if ($("#feel-the-wave-two").length) {
    $("#feel-the-wave-two").wavify({
      height: 60,
      bones: 3,
      amplitude: 40,
      color: "rgba(220, 212, 188, .3)",
      speed: 0.25,
    });
  }

  //----------------------------
  if ($(".automated-tab").length) {
    var myTimeout;
    function loop_tab() {
      var elm = $(".automated-tab").find(".active").next();
      if (elm.length) {
        myTimeout = setTimeout(function () {
          new bootstrap.Tab(elm[0]).show();
          loop_tab();
        }, 5000);
      } else {
        myTimeout = setTimeout(function () {
          new bootstrap.Tab($(".automated-tab .nav-link").first()[0]).show();
          loop_tab();
        }, 5000);
      }
    }
    loop_tab();
    $(".automated-tab .nav-link").on("click", function () {
      clearTimeout(myTimeout);
      loop_tab();
    });
  }

  if ($(".automated-tab2 ").length) {
    var myTimeout;
    function loop_tab() {
      var elm = $(".automated-tab2").find(".active").next();
      if (elm.length) {
        myTimeout = setTimeout(function () {
          new bootstrap.Tab(elm[0]).show();
          loop_tab();
        }, 2500);
      } else {
        myTimeout = setTimeout(function () {
          new bootstrap.Tab($(".automated-tab2 .nav-link").first()[0]).show();
          loop_tab();
        }, 500);
      }
    }
    loop_tab();
    $(".automated-tab2 .nav-link").on("click", function () {
      clearTimeout(myTimeout);
      loop_tab();
    });
  }
  //----------------------------

  //Cloud Tab
  if ($(".cloud-team-tab").length) {
    var myTimeout;
    var mainElm = $(".cloud-team-tab .nav-link");
    function loop_tab(objInd) {
      if (objInd + 1 < mainElm.length) {
        myTimeout = setTimeout(function () {
          mainElm.removeClass("active");
          new bootstrap.Tab(mainElm[objInd + 1]).show();
          loop_tab(objInd + 1);
        }, 5000);
      } else {
        myTimeout = setTimeout(function () {
          mainElm.removeClass("active")
          new bootstrap.Tab(mainElm[0]).show();
          loop_tab(0);
        }, 5000);
      }
    }
    loop_tab(-1);
    mainElm.on("click", function (e) {
      mainElm.removeClass("active");
      clearTimeout(myTimeout);
      var currTar = e.currentTarget;
      function getKeyByValue() {
        return Object.keys(mainElm).find((key) => mainElm[key] === currTar) - 1;
      }
      loop_tab(getKeyByValue());
    });
  }


  //Tippy JS
  if ($(".marking-point").length) {
    const template = document.getElementById("map");

    tippy(".marking-point", {
      content: template.innerHTML,
      allowHTML: true,
      animation: "scale",
      theme: "tooltip",
      // placement: 'bottom',
    });
  }

  $(".object-element").paroller();

  //software isotope
  $(document).ready(function ($) {
    if ( $('.software-list').length ) {
      $('.software-list').isotope();
    }
  });

$('.software-titles li').on('click', function () {

    $('.software-titles li').removeClass("active");
    $(this).addClass("active");


    var selector = $(this).attr('data-filter');
    $(".software-list").isotope({
        filter: selector
    });
});


// svg path animation
function animateReady() {
  
  if ($(".solution-area").length) {

      var tops = $(".solution-area");
      var topOffset = tops.offset().top;
      var svgPath = $(".svg-fadein");
      var border = $(".solution-list li");

      $(window).on("scroll", function () {
        var scrolls = $(window).scrollTop();
        if (scrolls >= topOffset) {
          //svgPath.addClass("svg-fadein");
          border.addClass("active")
         } 
         else {
          //svgPath.removeClass("svg-fadein");
          border.removeClass("active");
        }
      });

  }
}

animateReady();

 //ediatable location select
 if ($("#locationSelect").length) {
  $("#locationSelect").editableSelect();
}

  //initilalize DropeZone
  if ($("#dropzone").length) {
    $("#dropzone").dropzone({
      paramName: "file",
      url: "upload-target",
    });
  }

    //initilalize Telephone Input Country
    if ($("#inputPhoneNumber").length) {
      $("#inputPhoneNumber").intlTelInput({
        separateDialCode: false,
        utilsScript: "assets/js/plugin/utils.js",
      });
    }

// Blog Grid hover
$( ".shadow-sm" ).hover(
  function() {
    $(this).addClass('shadow-lg');
  }, function() {
    $(this).removeClass('shadow-lg');
})

  // Pricing Two Switcher
  $('.pricing-switcher-2 .nav-link').on('click', function() {
    if ( $("#monthly-tab").hasClass("active") ) {
      $(".switcher-bg").removeClass("right");
    } else {
      $(".switcher-bg").addClass("right");
    }
  })

  //=========================================================
  if($("#how_it_works_desktop").length) {
    window.addEventListener("scroll", function () {
      var how_it_works_desktop = document.getElementById("how_it_works_desktop");
      var how_it_works_desktop_box_each = how_it_works_desktop.offsetHeight / 4

      if ((window.scrollY + window.innerHeight) > how_it_works_desktop.offsetTop) {
          how_it_works_desktop.classList.add('animate_active')
          how_it_works_desktop.classList.add('box1')
          how_it_works_desktop.classList.remove('box2')
      }
      if ((window.scrollY + window.innerHeight) > (how_it_works_desktop.offsetTop + how_it_works_desktop.offsetHeight) || (window.scrollY + window.innerHeight) < how_it_works_desktop.offsetTop) {
          how_it_works_desktop.classList.remove('animate_active')
      }

      if ((window.scrollY + window.innerHeight) > (how_it_works_desktop.offsetTop + (how_it_works_desktop_box_each * 2))) {
          how_it_works_desktop.classList.add('box2')
          how_it_works_desktop.classList.remove('box1')
          how_it_works_desktop.classList.remove('box3')

      }

      if ((window.scrollY + window.innerHeight) > (how_it_works_desktop.offsetTop + (how_it_works_desktop_box_each * 3))) {
          how_it_works_desktop.classList.add('box3')
          how_it_works_desktop.classList.remove('box2')

      }
    });
  }

})(jQuery);
