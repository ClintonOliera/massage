const API_URL = 'https://lavylotus.onrender.com/api';

/* ===== Auth Fetch Wrapper ===== */
let redirecting = false; // flag to avoid multiple alerts

async function authFetch(url, options = {}) {
  const token = localStorage.getItem('access');
  options.headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const res = await fetch(url, options);

  if ((res.status === 401 || res.status === 403) && !redirecting) {
    redirecting = true; // set the flag
    alert('Unauthorized! You do not have access to this page.');
    window.location.href = 'login.html';
  }

  return res;
}


/* ===== Sidebar Section Switch ===== */
function showSection(sectionId) {
  document.querySelectorAll('.admin-section').forEach(sec => sec.classList.add('hidden'));
  const section = document.getElementById(sectionId);
  if (section) section.classList.remove('hidden');

  // Load data dynamically when section is shown
  if (sectionId === 'bookings') loadAdminBookings();
  if (sectionId === 'messages') loadMessages();
  if (sectionId === 'analysis') loadBookingStats();
}

/* ===== Logout ===== */
function logout() {
  localStorage.removeItem('access');
  localStorage.removeItem('refresh');
  window.location.href = 'login.html';
}

/* ===== Load Admin Bookings ===== */
async function loadAdminBookings() {
  const tbody = document.getElementById('bookingsTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4">Loading...</td></tr>`;

  const res = await authFetch(`${API_URL}/admin/bookings/`);
  if (res.ok) {
    const data = await res.json();
    tbody.innerHTML = data.map(b => `
      <tr class="hover:bg-gray-50 transition">
        <td>${b.username || 'Anonymous'}</td>
        <td>${b.service_type}</td>
        <td>${new Date(b.booking_date).toLocaleString()}</td>
        <td>${b.message || ''}</td>
        <td>
          <span class="${b.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                         b.status === 'Confirmed' ? 'bg-green-100 text-green-700' :
                         'bg-red-100 text-red-700'} px-3 py-1 rounded-full font-medium">
            ${b.status}
          </span>
        </td>
        <td>
          <button onclick="updateBookingStatus(${b.id}, 'Confirmed')" class="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700">Approve</button>
          <button onclick="updateBookingStatus(${b.id}, 'Cancelled')" class="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700">Cancel</button>
        </td>
      </tr>
    `).join('');
  } else {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-red-600">Failed to load bookings.</td></tr>`;
  }
}

/* ===== Update Booking Status ===== */
async function updateBookingStatus(id, status) {
  try {
    const res = await authFetch(`${API_URL}/admin/bookings/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      alert(`Booking status updated to "${data.status}"`);
      loadAdminBookings();
    } else {
      alert(data.error || 'Failed to update booking.');
      console.error('Error updating booking:', data);
    }
  } catch (err) {
    alert('An unexpected error occurred.');
    console.error(err);
  }
}

/* ===== Load Contact Messages ===== */
async function loadMessages() {
  const tbody = document.getElementById('messagesTableBody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4">Loading...</td></tr>`;
  const res = await authFetch(`${API_URL}/admin/messages/`);
  if (res.ok) {
    const data = await res.json();
    tbody.innerHTML = data.map(m => `
      <tr>
        <td>${m.name}</td>
        <td>${m.email}</td>
        <td>${m.phone}</td>
        <td>${m.subject}</td>
        <td>${m.message}</td>
        <td>${new Date(m.created_at).toLocaleString()}</td>
      </tr>
    `).join('');
  } else {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-red-600">Failed to load messages.</td></tr>`;
  }
}

/* ===== Load Analysis / Stats ===== */
async function loadBookingStats() {
  const totalEl = document.getElementById('analysisTotalBookings');
  const approvedEl = document.getElementById('analysisApprovedBookings');
  const pendingEl = document.getElementById('analysisPendingBookings');
  const cancelledEl = document.getElementById('analysisCancelledBookings');
  const servicesBody = document.getElementById('servicesTableBody');

  if (!totalEl) return; // Analysis section not visible yet

  const res = await authFetch(`${API_URL}/booking-stats/`);
  if (!res.ok) return;

  const data = await res.json();

  totalEl.textContent = data.total_bookings;
  approvedEl.textContent = data.approved;
  pendingEl.textContent = data.pending;
  cancelledEl.textContent = data.cancelled;

  servicesBody.innerHTML = data.services_summary.map(s => `
    <tr><td>${s.service_type}</td><td>${s.total}</td></tr>
  `).join('');
}

/* ===== Initialize Sidebar to Show Bookings on Load ===== */
document.addEventListener('DOMContentLoaded', () => {
  showSection('bookings'); // default visible section
});

function checkAdminAccess() {
  const token = localStorage.getItem('access');
  if (!token) {
    alert('Please log in first.');
    window.location.href = 'login.html';
    return;
  }

  try {
    // Decode token safely
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    console.log('Decoded JWT payload:', payload);

    const isAdmin = payload.is_staff || payload.is_superuser;
    const username = payload.username || 'Admin';

    const accessDeniedEl = document.getElementById('accessDenied');
    const dashboardContentEl = document.getElementById('dashboardContent');
    const welcomeMsgEl = document.getElementById('welcomeMsg');

    if (!accessDeniedEl || !dashboardContentEl || !welcomeMsgEl) {
      console.warn('Dashboard elements not yet loaded, delaying check...');
      setTimeout(checkAdminAccess, 500); // retry after DOM loads
      return;
    }

    if (isAdmin) {
      accessDeniedEl.classList.add('hidden');
      dashboardContentEl.classList.remove('hidden');
      welcomeMsgEl.textContent = `Welcome Admin, ${username}!`;
    } else {
      accessDeniedEl.classList.remove('hidden');
      dashboardContentEl.classList.add('hidden');
    }

  } catch (err) {
    console.error('JWT decode failed:', err);
    alert('Invalid session. Please log in again.');
    localStorage.clear();
    window.location.href = 'login.html';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkAdminAccess(); // verify admin
  loadBookingStats(); // update stats
  initDashboard(); // initialize dashboard
});

function getAdminName() {
  const token = localStorage.getItem('access');
  if (!token) return '';
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username;
  } catch {
    return '';
  }
}

function initDashboard() {
  const name = getAdminName();
  document.getElementById('adminName').textContent = name || 'Admin';
  document.getElementById('todayDate').textContent = new Date().toDateString();

  loadDashboardStats();
}

async function loadDashboardStats() {
  try {
    const bookingsRes = await authFetch(`${API_URL}/admin/bookings/`);
    const messagesRes = await authFetch(`${API_URL}/admin/messages/`);

    if (!bookingsRes.ok || !messagesRes.ok) throw new Error('Failed to fetch data');

    const bookings = await bookingsRes.json();
    const messages = await messagesRes.json();

    // Stats
    document.getElementById('totalBookings').textContent = bookings.length;
    document.getElementById('pendingBookings').textContent = bookings.filter(b => b.status === 'Pending').length;
    document.getElementById('totalMessages').textContent = messages.length;

    // Recent bookings
    const bookingRows = bookings.slice(0, 5).map(b => `
      <tr class="border-b">
        <td class="py-2">${b.username || 'N/A'}</td>
        <td class="py-2">${b.service_type}</td>
        <td class="py-2">${new Date(b.booking_date).toLocaleDateString()}</td>
        <td class="py-2">
          <span class="px-3 py-1 rounded-full text-sm ${b.status === 'Approved' ? 'bg-green-100 text-green-700' : b.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}">
            ${b.status}
          </span>
        </td>
      </tr>
    `).join('');
    document.getElementById('recentBookings').innerHTML = bookingRows;

    // Recent messages
    const messageItems = messages.slice(0, 5).map(m => `
      <li class="border-b pb-2">
        <p class="font-semibold">${m.name} <span class="text-gray-500 text-sm">(${m.email})</span></p>
        <p class="text-gray-700 text-sm">${m.message}</p>
      </li>
    `).join('');
    document.getElementById('recentMessages').innerHTML = messageItems;

  } catch (err) {
    console.error('Dashboard load failed:', err);
  }
}

async function loadAnalytics() {
  try {
    const res = await authFetch(`${API_URL}/analytics-summary/`);
    if (!res.ok) {
      console.error('Failed to load analytics', await res.text());
      return;
    }
    const data = await res.json();

    document.getElementById('totalVisitors').textContent = data.total_visits ?? 0;
    document.getElementById('uniqueVisitors').textContent = data.unique_visitors ?? 0;

    // Top pages
    const pagesBody = document.getElementById('topPagesBody');
    if (pagesBody) {
      pagesBody.innerHTML = data.top_pages.map(p => 
        `<tr><td>${p.path || '(empty)'}</td><td>${p.count}</td></tr>`
      ).join('');
    }

    // Top countries
    const countriesBody = document.getElementById('topCountriesBody');
    if (countriesBody) {
      countriesBody.innerHTML = data.top_countries.map(c =>
        `<tr><td>${c.country || 'Unknown'}</td><td>${c.count}</td></tr>`
      ).join('');
    }

    // Recent visits
    const recentBody = document.getElementById('recentVisitsBody');
    if (recentBody) {
      recentBody.innerHTML = data.recent.map(r =>
        `<tr>
          <td>${r.ip_address}</td>
          <td>${r.path}</td>
          <td>${r.country || ''}${r.city ? ' / ' + r.city : ''}</td>
          <td>${r.browser || ''} / ${r.os || ''}</td>
          <td>${new Date(r.created_at).toLocaleString()}</td>
        </tr>`
      ).join('');
    }

  } catch (err) {
    console.error('Analytics load error', err);
  }
}
document.addEventListener('DOMContentLoaded', () => {
  loadAnalytics();
});