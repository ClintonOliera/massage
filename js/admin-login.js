const API_URL = 'http://127.0.0.1:8000/api';

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = Object.fromEntries(new FormData(e.target));

  const res = await fetch(`${API_URL}/token/`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(formData)
  });

  const data = await res.json();

  if (res.ok) {
    // Save tokens
    localStorage.setItem('access', data.access);
    localStorage.setItem('refresh', data.refresh);

    // Verify if user is admin
    const userRes = await fetch(`${API_URL}/user/`, {
      headers: {'Authorization': `Bearer ${data.access}`}
    });

    const userData = await userRes.json();

    if (userData.is_staff || userData.is_superuser) {
      alert('Welcome, Admin!');
      window.location.href = 'admin.html';
    } else {
      document.getElementById('loginError').innerText = 'Access denied. Admins only.';
      document.getElementById('loginError').classList.remove('hidden');
      localStorage.clear();
    }

  } else {
    document.getElementById('loginError').innerText = data.detail || 'Invalid credentials.';
    document.getElementById('loginError').classList.remove('hidden');
  }
});