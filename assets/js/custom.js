const $dropdown = $(".dropdown");
const $dropdownToggle = $(".dropdown-toggle");
const $dropdownMenu = $(".dropdown-menu");
const showClass = "show";

$(window).on("load resize", function () {
  if (this.matchMedia("(min-width: 991px)").matches) {
    $dropdown.hover(
      function () {
        $('>.dropdown-menu', this).stop(true, true).fadeIn("fast");
        $(this).addClass('show');
      },
      function () {
        $('>.dropdown-menu', this).stop(true, true).fadeOut("fast");
        $(this).removeClass('show');
      }
    );
  } else {
    $dropdown.off("mouseenter mouseleave");
  }
});

$(window).on("load resize", function () {
  if (this.matchMedia("(max-width: 991px)").matches) {
    $('.dropdown-menu a.dropdown-toggle').on('click', function (e) {
      if (!$(this).next().hasClass('show')) {
        $(this).parents('.dropdown-menu').first().find('.show').removeClass("show").removeAttr('style');
      }

      var $subMenu = $(this).next(".dropdown-menu");
      if ($subMenu.hasClass('show')) {
        $subMenu.removeAttr('style');
      }

      $subMenu.toggleClass('show');


      $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
        $('.dropdown-submenu .show').removeClass("show");
      });

      return false;
    });
  }

});

// owl carousel start //
// Client Carousel
$("#owl-carousel-client").owlCarousel({
  loop: true,
  margin: 30,
  nav: true,
  responsive: {
    0: { items: 1 },
    768: { items: 2, margin: 15 },
    1000: { items: 3 }
  }
});
// milestone carousel
$("#owl-carousel-milestone").owlCarousel({
  loop: true,
  margin: 30,
  nav: true,
  responsive: {
    0: { items: 1 },
    576: { items: 2, margin: 10 },
    768: { items: 3, margin: 15 },
    1000: { items: 4 }
  }
});
// History Carousel
$("#owl-carousel-history").owlCarousel({
  loop: true,
  margin: 30,
  nav: true,
  responsive: {
    0: { items: 1 },
    768: { items: 2, margin: 15 },
    1000: { items: 3 }
  }
});
var owlHistory = $("#owl-carousel-history");
owlHistory.owlCarousel();
$(".next-btn-history").click(function () {
  owlHistory.trigger("next.owl.carousel");
});
$(".prev-btn-history").click(function () {
  owlHistory.trigger("prev.owl.carousel");
});
$(".prev-btn-history").addClass("disabled");
$(owlHistory).on("translated.owl.carousel", function () {
  if ($(".owl-prev").hasClass("disabled")) {
    $(".prev-btn-history").addClass("disabled");
  } else {
    $(".prev-btn-history").removeClass("disabled");
  }
  if ($(".owl-next").hasClass("disabled")) {
    $(".next-btn-history").addClass("disabled");
  } else {
    $(".next-btn-history").removeClass("disabled");
  }
});
// bottom to top btn start //
var btn = $('#button');

$(window).scroll(function () {
  if ($(window).scrollTop() > 300) {
    btn.addClass('show');
  } else {
    btn.removeClass('show');
  }
});
btn.on('click', function (e) {
  e.preventDefault();
  $('html, body').animate({
    scrollTop: 0
  }, '300');
});
// bottom to top btn end //
// preloader start //
$(window).on('load', function () {
  // Preloader
  $('.loader').fadeOut();
  $('.loader-mask').delay(350).fadeOut('slow');
});
// preloader end //
new WOW().init();
//
// video script start //
window.document.onkeydown = function (e) {
  if (!e) {
    e = event;
  }
  if (e.keyCode == 27) {
    lightbox_close();
  }
}

function lightbox_open() {
  var lightBoxVideo = document.getElementById("VisaChipCardVideo");
  document.getElementById('light').style.display = 'block';
  document.getElementById('fade').style.display = 'block';
  lightBoxVideo.play();
}

function lightbox_close() {
  var lightBoxVideo = document.getElementById("VisaChipCardVideo");
  document.getElementById('light').style.display = 'none';
  document.getElementById('fade').style.display = 'none';
  lightBoxVideo.pause();
}
// video script end //
$(document).ready(function () {

  var counters = $(".count");
  var countersQuantity = counters.length;
  var counter = [];

  for (i = 0; i < countersQuantity; i++) {
    counter[i] = parseInt(counters[i].innerHTML);
  }

  var count = function (start, value, id) {
    var localStart = start;
    setInterval(function () {
      if (localStart < value) {
        localStart++;
        counters[id].innerHTML = localStart;
      }
    }, 40);
  }

  for (j = 0; j < countersQuantity; j++) {
    count(0, counter[j], j);
  }
});

$('.count').each(function () {
  $(this).prop('Counter', 0).animate({
    Counter: $(this).text()
  }, {
    duration: 3300,
    easing: 'swing',
    step: function (now) {
      $(this).text(Math.ceil(now));
    }
  });
});
// 
