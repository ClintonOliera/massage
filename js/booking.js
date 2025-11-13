/* ===== API URL ===== */

/* ===== Modal Controls ===== */
function openModal(id) {
  document.getElementById(id).style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function switchModal(hideId, showId) {
  closeModal(hideId);
  openModal(showId);
}

window.onclick = function(e) {
  if (e.target.classList.contains('modal')) e.target.style.display = 'none';
}

/* ===== Auth Buttons Visibility ===== */
function checkAuth() {
  const token = localStorage.getItem('access');
  const authButtons = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');

  if (token) {
    const username = localStorage.getItem('username') || 'User';
    document.getElementById('usernameDisplay').textContent = username;
    document.querySelector('.user-avatar img').src = 
      `https://ui-avatars.com/api/?background=random&name=${username}`;
    authButtons.classList.add('hidden');
    userMenu.classList.remove('hidden');
  } else {
    authButtons.classList.remove('hidden');
    userMenu.classList.add('hidden');
  }
}

/* ===== Dropdown Toggle ===== */
function toggleDropdown() {
  document.getElementById('dropdownMenu').classList.toggle('hidden');
}

/* ===== Logout ===== */
function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  localStorage.removeItem('username');
  checkAuth();
  alert('You have logged out.');
  window.location.href = 'index.html';
}

/* ===== CSRF Helper ===== */
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

/* ===== Authenticated Fetch Wrapper ===== */
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('refresh');
  const res = await fetch(`${API_URL}/token/refresh/`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ refresh: refreshToken })
  });

  if (res.ok) {
    const data = await res.json();
    localStorage.setItem('access', data.access);
    return data.access;
  } else {
    localStorage.clear();
    window.location.href = 'index.html';
  }
}

async function authFetch(url, options = {}) {
  let token = localStorage.getItem('access');
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'X-CSRFToken': getCookie('csrftoken')
  };

  let response = await fetch(url, options);

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    options.headers.Authorization = `Bearer ${newToken}`;
    response = await fetch(url, options);
  }

  return response;
}

/* ===== Register User ===== */
document.getElementById('registerForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));

  if (formData.password.length < 6) {
    alert('Password must be at least 6 characters long.');
    return;
  }

  const res = await fetch(`${API_URL}/register/`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('username', formData.username);
    closeModal('registerModal');
    checkAuth();
    alert('Registration successful!');
  } else {
    alert(data.error || 'Registration failed.');
  }
});

/* ===== Login User ===== */
document.getElementById('loginForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));

  const res = await fetch(`${API_URL}/login/`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(formData)
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);
    localStorage.setItem('username', formData.username);
    closeModal('loginModal');
    checkAuth();
  } else {
    alert('Invalid username or password.');
  }
});

/* ===== Load Bookings ===== */
async function loadBookings() {
  const tableBody = document.getElementById('bookingsTableBody');
  const res = await authFetch(`${API_URL}/bookings/`);

  if (res.ok) {
    const data = await res.json();
    tableBody.innerHTML = data.map(b => {
      const date = b.booking_date
        ? new Date(b.booking_date).toLocaleString()
        : new Date(b.created_at).toLocaleString();
      return `
        <tr>
          <td>${b.service_type}</td>
          <td>${date}</td>
          <td>${b.message || ''}</td>
          <td>${b.status}</td>
        </tr>
      `;
    }).join('');
  } else if (res.status === 401) {
    window.location.href = 'index.html';
  } else {
    console.error('Error loading bookings:', await res.text());
  }
}

/* ===== Booking Form Submission ===== */
const bookingForm = document.getElementById('bookingForm');
bookingForm?.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(bookingForm));

  // Convert date to ISO string
  formData.booking_date = new Date(formData.booking_date).toISOString();

  const res = await authFetch(`${API_URL}/bookings/`, {
    method: 'POST',
    body: JSON.stringify(formData)
  });

  if (res.ok) {
    alert('Booking successful!');
    bookingForm.reset();
    loadBookings();
  } else {
    console.error('Booking failed:', await res.text());
    alert('Booking failed!');
  }
});

/* ===== Initialize ===== */
checkAuth();
loadBookings();