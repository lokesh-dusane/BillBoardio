// Admin dashboard functionality

document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user || user.role !== 'admin') {
      window.location.href = 'login.html';
      return;
    }
  
    // Set user name
    document.getElementById('userName').textContent = user.name;
  
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
  
    // Navigation
    setupNavigation();
  
    // Load initial data
    loadStatistics();
    loadUsers();
    loadBillboards();
    loadBookings();
  });
  
  // Setup navigation
  function setupNavigation() {
    const navLinks = document.querySelectorAll('.sidebar a');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const sectionName = link.dataset.section;
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
  
        // Show section
        document.querySelectorAll('.section').forEach(section => {
          section.classList.add('hidden');
        });
        document.getElementById(sectionName).classList.remove('hidden');
      });
    });
  }
  
  // Load statistics
  async function loadStatistics() {
    try {
      const stats = await apiCall('/admin/statistics');
      
      document.getElementById('totalUsers').textContent = stats.totalUsers;
      document.getElementById('totalOwners').textContent = stats.totalOwners;
      document.getElementById('totalAdvertisers').textContent = stats.totalAdvertisers;
      document.getElementById('totalBillboards').textContent = stats.totalBillboards;
      document.getElementById('approvedBillboards').textContent = stats.approvedBillboards;
      document.getElementById('totalBookings').textContent = stats.totalBookings;
    } catch (error) {
      showAlert('Error loading statistics', 'error');
    }
  }
  
  // Load users
  async function loadUsers() {
    try {
      const users = await apiCall('/admin/users');
      const tbody = document.getElementById('usersTableBody');
      tbody.innerHTML = '';
  
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.name}</td>
          <td>${user.email}</td>
          <td><span class="badge badge-${user.role}">${user.role}</span></td>
          <td>${user.company || 'N/A'}</td>
          <td>${formatDate(user.createdAt)}</td>
          <td>
            ${user.role !== 'admin' ? `
              <button class="btn btn-small btn-danger" onclick="deleteUser('${user._id}')">Delete</button>
            ` : '-'}
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      showAlert('Error loading users', 'error');
    }
  }
  
  // Delete user
  async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user?')) return;
  
    try {
      await apiCall(`/admin/users/${userId}`, 'DELETE');
      showAlert('User deleted successfully', 'success');
      loadUsers();
      loadStatistics();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }
  
  // Load billboards
  async function loadBillboards() {
    try {
      const billboards = await apiCall('/admin/billboards');
      const tbody = document.getElementById('billboardsTableBody');
      tbody.innerHTML = '';
  
      billboards.forEach(billboard => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${billboard.title}</td>
          <td>📍 ${billboard.location}</td>
          <td>${billboard.ownerId.name}<br><small>${billboard.ownerId.email}</small></td>
          <td>$${billboard.price}/day</td>
          <td><span class="badge badge-${billboard.availability}">${billboard.availability}</span></td>
          <td>
            ${billboard.approved ? 
              '<span class="badge badge-approved">Approved</span>' : 
              '<span class="badge badge-pending">Pending</span>'}
          </td>
          <td>
            ${!billboard.approved ? `
              <button class="btn btn-small btn-success" onclick="approveBillboard('${billboard._id}', true)">Approve</button>
              <button class="btn btn-small btn-danger" onclick="approveBillboard('${billboard._id}', false)">Reject</button>
            ` : `
              <button class="btn btn-small btn-danger" onclick="approveBillboard('${billboard._id}', false)">Unapprove</button>
            `}
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      showAlert('Error loading billboards', 'error');
    }
  }
  
  // Approve/reject billboard
  async function approveBillboard(billboardId, approved) {
    try {
      await apiCall(`/admin/billboards/${billboardId}/approve`, 'PUT', { approved });
      showAlert(`Billboard ${approved ? 'approved' : 'rejected'} successfully`, 'success');
      loadBillboards();
      loadStatistics();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }
  
  // Load bookings
  async function loadBookings() {
    try {
      const bookings = await apiCall('/admin/bookings');
      const tbody = document.getElementById('bookingsTableBody');
      tbody.innerHTML = '';
  
      if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No bookings yet</td></tr>';
        return;
      }
  
      bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${booking.billboardId.title}</td>
          <td>${booking.advertiserId.name}<br><small>${booking.advertiserId.email}</small></td>
          <td>${booking.ownerId.name}<br><small>${booking.ownerId.email}</small></td>
          <td>${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</td>
          <td>$${booking.totalPrice}</td>
          <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      showAlert('Error loading bookings', 'error');
    }
  }