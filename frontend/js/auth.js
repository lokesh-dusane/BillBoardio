// Authentication logic for login and signup pages

document.addEventListener('DOMContentLoaded', () => {
    // Check if already logged in
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
  
    if (token && user.role) {
      redirectToDashboard(user.role);
      return;
    }
  
    // Handle signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', handleSignup);
    }
  
    // Handle login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', handleLogin);
    }
  });
  
  // Handle signup
  async function handleSignup(e) {
    e.preventDefault();
  
    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
      role: document.getElementById('role').value,
      phone: document.getElementById('phone').value,
      company: document.getElementById('company').value
    };
  
    try {
      const response = await apiCall('/auth/signup', 'POST', formData);
      
      // Save token and user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
  
      showAlert('Account created successfully!', 'success');
      
      // Redirect to appropriate dashboard
      setTimeout(() => {
        redirectToDashboard(response.user.role);
      }, 1000);
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }
  
  // Handle login
  async function handleLogin(e) {
    e.preventDefault();
  
    const formData = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };
  
    try {
      const response = await apiCall('/auth/login', 'POST', formData);
      
      // Save token and user info
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
  
      showAlert('Login successful!', 'success');
      
      // Redirect to appropriate dashboard
      setTimeout(() => {
        redirectToDashboard(response.user.role);
      }, 1000);
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }
  
  // Redirect to dashboard based on role
  function redirectToDashboard(role) {
    switch(role) {
      case 'owner':
        window.location.href = 'owner-dashboard.html';
        break;
      case 'advertiser':
        window.location.href = 'advertiser-dashboard.html';
        break;
      case 'admin':
        window.location.href = 'admin-dashboard.html';
        break;
      default:
        window.location.href = 'index.html';
    }
  }