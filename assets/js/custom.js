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

// Enhanced Language Switch Functionality with Dynamic Content
$(document).ready(function() {
    console.log('Language switch script loaded');
    
    // Define functions first
    function applyLanguage(lang) {
        if (lang === 'ar') {
            $('html').attr('dir', 'rtl').attr('lang', 'ar');
            $('body').addClass('rtl-mode');
        } else {
            $('html').attr('dir', 'ltr').attr('lang', 'en');
            $('body').removeClass('rtl-mode');
        }
    }
    
    function updateContactButtonText(lang) {
        const $contactBtn = $('#contact-btn');
        if ($contactBtn.length) {
            if (lang === 'ar') {
                $contactBtn.text('اتصل بنا');
            } else {
                $contactBtn.text('Contact');
            }
        }
        
        // Update Get Started button text
        const $getStartedBtn = $('#banner-get-started-btn');
        if ($getStartedBtn.length) {
            if (lang === 'ar') {
                $getStartedBtn.text('ابدأ الآن');
            } else {
                $getStartedBtn.text('Get Started');
            }
        }
        
        // Update Order Now (Start) buttons text
        const $orderBtns = $('.order-now-btn');
        $orderBtns.each(function() {
            if (lang === 'ar') {
                $(this).text('ابدأ بارضك');
            } else {
                $(this).text('Start Now');
            }
        });
        
        // Update Read More buttons text
        const $readMoreBtns = $('.read-more-btn');
        $readMoreBtns.each(function() {
            const $btn = $(this);
            const $icon = $btn.find('i');
            const iconHTML = $icon.length ? $icon[0].outerHTML : '';
            if (lang === 'ar') {
                $btn.html('ابدأ الآن ' + iconHTML);
            } else {
                $btn.html('Start Now ' + iconHTML);
            }
        });
    }
    
    function updateCurrencySymbol(lang) {
        const currencySymbol = lang === 'ar' ? 'ج.م' : 'EGP';
        $('.dollar').text(currencySymbol);
    }
    
    function updateDropdownDisplay(lang) {
        const $toggle = $('#language-dropdown-toggle');
        const $flag = $toggle.find('.flag-icon');
        const $text = $toggle.find('.language-text');
        
      
        if (lang === 'ar') {
            $flag.removeClass('flag-en').addClass('flag-ar');
            $text.text('العربية');
        } else {
            $flag.removeClass('flag-ar').addClass('flag-en');
            $text.text('EN');
        }
        
        // Update Contact button text
        updateContactButtonText(lang);
        // Update currency symbol
        updateCurrencySymbol(lang);
    }
    
    const savedLanguage = localStorage.getItem('selectedLanguage') || 'en';
    
    applyLanguage(savedLanguage);
    updateDropdownDisplay(savedLanguage);
    
    if (typeof contentManager !== 'undefined') {
        contentManager.init().then(() => {
            console.log('Content manager initialized');
        }).catch(error => {
            console.error('Error initializing content manager:', error);
        });
    }
    
    $(document).on('click', '#language-dropdown-toggle', function(e) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Dropdown toggle clicked');
        
        $('.custom-dropdown').toggleClass('open');
        console.log('Dropdown classes:', $('.custom-dropdown').attr('class'));
    });
    
    // Handle language selection
    $(document).on('click', '.custom-dropdown .dropdown-item', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const selectedLanguage = $(this).data('lang');
        console.log('Language selected:', selectedLanguage);
        
        // Update language and content
        changeLanguage(selectedLanguage);
        $('.custom-dropdown').removeClass('open');
        
        console.log('Language changed to:', selectedLanguage);
    });
    
    // Close dropdown when clicking outside
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.custom-dropdown').length) {
            $('.custom-dropdown').removeClass('open');
        }
    });
    
    async function changeLanguage(lang) {
        // Update language settings
        localStorage.setItem('selectedLanguage', lang);
        applyLanguage(lang);
        updateDropdownDisplay(lang);
        
        // Update content if content manager is available
        if (typeof contentManager !== 'undefined') {
            try {
                await contentManager.changeLanguage(lang);
                console.log('Content updated for language:', lang);
                
                // Update button text after content is rebuilt
                updateContactButtonText(lang);
                // Update currency symbol after content is rebuilt
                updateCurrencySymbol(lang);
            } catch (error) {
                console.error('Error updating content for language:', error);
            }
        }
    }
    
    // Debug: Check if elements exist
    console.log('Language toggle exists:', $('#language-dropdown-toggle').length);
    console.log('Custom dropdown exists:', $('.custom-dropdown').length);
    console.log('Dropdown menu exists:', $('.custom-dropdown .dropdown-menu').length);
});

// Contact Modal Functionality
$(document).ready(function() {
    const $modal = $('#contact-modal');
    const $contactBtn = $('#contact-btn');
    const $getStartedBtn = $('#banner-get-started-btn');
    const $closeBtn = $('#contact-modal-close');
    const $form = $('#contact-modal-form');
    
    // Function to open modal
    function openContactModal() {
        $modal.addClass('active');
        $('body').css('overflow', 'hidden');
        // Focus on first input
        setTimeout(function() {
            $('#contact-name').focus();
        }, 300);
    }
    
    // Open modal from contact button
    $contactBtn.on('click', function(e) {
        e.preventDefault();
        openContactModal();
    });
    
    // Open modal from get started button (using event delegation for dynamically added buttons)
    $(document).on('click', '#banner-get-started-btn', function(e) {
        e.preventDefault();
        openContactModal();
    });
    
    // Open modal from order now (Start) buttons (using event delegation for dynamically added buttons)
    $(document).on('click', '.order-now-btn', function(e) {
        e.preventDefault();
        openContactModal();
    });
    
    // Open modal from read more buttons (using event delegation for dynamically added buttons)
    $(document).on('click', '.read-more-btn', function(e) {
        e.preventDefault();
        openContactModal();
    });
    
    // Close modal
    function closeModal() {
        $modal.removeClass('active');
        $('body').css('overflow', '');
        $form[0].reset();
        $('#form_result').empty();
        $('.error').text('');
    }
    
    $closeBtn.on('click', closeModal);
    
    // Close on overlay click
    $modal.on('click', function(e) {
        if ($(e.target).is($modal)) {
            closeModal();
        }
    });
    
    // Close on ESC key
    $(document).on('keydown', function(e) {
        if (e.key === 'Escape' && $modal.hasClass('active')) {
            closeModal();
        }
    });
    
    // Form validation and submission
    $form.on('submit', function(e) {
        e.preventDefault();
        
        // Clear previous errors
        $('.error').text('');
        $('#form_result').empty();
        
        // Basic validation
        let isValid = true;
        const name = $('#contact-name').val().trim();
        const email = $('#contact-email').val().trim();
        const phone = $('#contact-phone').val().trim();
        const subject = $('#contact-subject').val().trim();
        const message = $('#contact-message').val().trim();
        
        if (!name) {
            $('#contact-name').next('.error').text('Name is required');
            isValid = false;
        }
        
        if (!email) {
            $('#contact-email').next('.error').text('Email is required');
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            $('#contact-email').next('.error').text('Please enter a valid email');
            isValid = false;
        }
        
        if (!phone) {
            $('#contact-phone').next('.error').text('Phone is required');
            isValid = false;
        } else if (!/^[\d\s\-\+\(\)]+$/.test(phone)) {
            $('#contact-phone').next('.error').text('Please enter a valid phone number');
            isValid = false;
        }
        
        if (!subject) {
            $('#contact-subject').next('.error').text('Subject is required');
            isValid = false;
        }
        
        if (!message) {
            $('#contact-message').next('.error').text('Message is required');
            isValid = false;
        }
        
        if (!isValid) {
            return false;
        }
        
        // Disable submit button
        const $submitBtn = $('#contact-submit-btn');
        const originalText = $submitBtn.html();
        $submitBtn.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Sending...');
        
        // Prepare form data according to backend requirements
        const formData = {
            name: name,
            email: email,
            phone: phone,
            subject: subject,
            message: message
        };
        
        // Submit form to backend API
        const apiEndpoint = 'https://api-admin.optisystemhub.net/api/v1/contact/store';
        
        $.ajax({
            url: apiEndpoint,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(formData),
            dataType: 'json',
            success: function(response) {
                // Handle successful response
                $('#form_result').html('<span class="form-success">Thank you! Your message has been sent successfully. We will get back to you soon.</span>');
                $form[0].reset();
                $submitBtn.prop('disabled', false).html(originalText);
                
                // Auto close after 3 seconds
                setTimeout(function() {
                    closeModal();
                }, 3000);
            },
            error: function(xhr, status, error) {
                console.error('Form submission error:', error);
                console.error('Response:', xhr.responseJSON);
                
                // Handle error response
                let errorMessage = 'An error occurred. Please try again.';
                if (xhr.responseJSON && xhr.responseJSON.message) {
                    errorMessage = xhr.responseJSON.message;
                } else if (xhr.responseJSON && xhr.responseJSON.error) {
                    errorMessage = xhr.responseJSON.error;
                }
                
                $('#form_result').html('<span class="form-error">' + errorMessage + '</span>');
                $submitBtn.prop('disabled', false).html(originalText);
            }
        });
        
        return false;
    });
});

// Sticky Header on Scroll
$(document).ready(function() {
    const $header = $('.header-main-con');
    
    $(window).on('scroll', function() {
        const scrollTop = $(window).scrollTop();
        
        if (scrollTop > 50) {
            $header.addClass('scrolled');
        } else {
            $header.removeClass('scrolled');
        }
    });
    
    // Check on page load
    if ($(window).scrollTop() > 50) {
        $header.addClass('scrolled');
    }
});
// 
