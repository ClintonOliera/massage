(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner(0);
    
    
    // Initiate the wowjs
    new WOW().init();


    // Fixed Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('shadow-sm').css('top', '-200px');
        }
    });
    
    
   // Back to top button
   $(window).scroll(function () {
    if ($(this).scrollTop() > 300) {
        $('.back-to-top').fadeIn('slow');
    } else {
        $('.back-to-top').fadeOut('slow');
    }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Pricing-carousel
    $(".pricing-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 2000,
        center: false,
        dots: true,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:2
            },
            768:{
                items:2
            },
            992:{
                items:3
            },
            1200:{
                items:4
            }
        }
    });

    // Testimonial-carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 2000,
        center: false,
        dots: true,
        loop: true,
        margin: 25,
        nav : true,
        navText : [
            '<i class="bi bi-arrow-left"></i>',
            '<i class="bi bi-arrow-right"></i>'
        ],
        responsiveClass: true,
        responsive: {
            0:{
                items:1
            },
            576:{
                items:1
            },
            768:{
                items:1
            },
            992:{
                items:2
            },
            1200:{
                items:2
            }
        }
    });



    // Modal Video
    $(document).ready(function () {
        var $videoSrc;
        $('.btn-play').click(function () {
            $videoSrc = $(this).data("src");
        });
        console.log($videoSrc);

        $('#videoModal').on('shown.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
        })

        $('#videoModal').on('hide.bs.modal', function (e) {
            $("#video").attr('src', $videoSrc);
        })
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 5,
        time: 2000
    });


})(jQuery);


// const token = localStorage.getItem('access'); // saved after login
// const refreshToken = localStorage.getItem('refresh');
// const bookingForm = document.getElementById('bookingForm');
// const bookingsTable = document.querySelector('#bookingsTable tbody');

//     // Redirect to login if no tokens found
// if (!token || !refreshToken) {
//   window.location.href = 'login.html';
// }

//     // Helper: refresh access token if expired
// async function refreshAccessToken() {
//   const res = await fetch(`${API_URL}/token/refresh/`, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ refresh: refreshToken }),
//   });
//   if (res.ok) {
//     const data = await res.json();
//     localStorage.setItem('access', data.access);
//     return data.access;
//   } else {
//     // Refresh failed — force re-login
//     localStorage.clear();
//     window.location.href = 'login.html';
//   }
// }

// // Wrapper: makes authenticated requests and handles token expiry automatically
// async function authFetch(url, options = {}) {
//   let token = localStorage.getItem('access');
//   options.headers = {
//     ...options.headers,
//     Authorization: `Bearer ${token}`,
//     'Content-Type': 'application/json',
//   };

//   let response = await fetch(url, options);

//   // If token expired, try refreshing and repeat the request
//   if (response.status === 401) {
//     const newToken = await refreshAccessToken();
//     options.headers.Authorization = `Bearer ${newToken}`;
//     response = await fetch(url, options);
//   }

//   return response;
// }

// // Load existing bookings

// async function loadBookings() {
//     const res = await authFetch('http://127.0.0.1:8000/api/bookings/');
//     const data = await res.json();
//       if (res.ok) {
//     const data = await res.json();
//     bookingsTable.innerHTML = data.map(b =>
//       `<tr><td>${b.service}</td><td>${b.date}</td><td>${b.time}</td><td>${b.message}</td><td>${b.status}</td></tr>`
//     ).join('');
//   } else if (res.status === 401) {
//     window.location.href = 'login.html';
//   }
// }

//     // Handle booking form submit
//     bookingForm.addEventListener('submit', async e => {
//       e.preventDefault();
//       const formData = Object.fromEntries(new FormData(bookingForm));
//       const res = await fetch('http://127.0.0.1:8000/api/bookings/', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           'Authorization': `Bearer ${token}`
//         },
//         body: JSON.stringify(formData)
//       });
//       if (res.ok) {
//         bookingForm.reset();
//         loadBookings();
//       } else {
//         alert('Booking failed');
//       }
//     });

//     loadBookings();
