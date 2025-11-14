// ====== auth.js ======
const API_URL = 'https://lavylotus.onrender.com/api';

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



/* ===== Check Authentication ===== */
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
  localStorage.clear();
  alert('You have logged out.');
  window.location.href = 'index.html';
}

/* ===== Register User ===== */
document.getElementById('registerForm')?.addEventListener('submit', async e => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));
  const errorDiv = document.getElementById('signupError');
  errorDiv.textContent = '';
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
  } try { } catch (err) {
    errorDiv.textContent = 'Server connection failed. Please try again later.';
    console.error('Signup error:', err);
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

/* ===== Initialize ===== */
checkAuth();

/* ===== Booking Button Click Handler ===== */
function handleBookingClick(event) {
  const token = localStorage.getItem('access');
  const button = event.currentTarget; // the <a> element that was clicked

  if (!token) {
    event.preventDefault(); // stop navigation
    openModal('loginModal'); // show login popup
  } else {
    // allow user to proceed to booking page
    window.location.href = 'booking.html';
  }
}