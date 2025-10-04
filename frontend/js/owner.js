// Owner dashboard functionality

document.addEventListener('DOMContentLoaded', () => {
    const user = checkAuth();
    if (!user || user.role !== 'owner') {
      window.location.href = 'login.html';
      return;
    }
  
    // Set user name
    document.getElementById('userName').textContent = user.name;
    document.getElementById('ownerName').textContent = user.name;
  
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);
  
    // Navigation
    setupNavigation();
  
    // Load initial data
    loadOverviewData();
    loadBillboards();
    loadBookings();
  
    // Add billboard form
    document.getElementById('addBillboardForm').addEventListener('submit', handleAddBillboard);
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
  
  // Load overview data
  async function loadOverviewData() {
    try {
      const billboards = await apiCall('/billboards/my');
      const bookings = await apiCall('/bookings/owner');
  
      document.getElementById('totalBillboards').textContent = billboards.length;
      document.getElementById('availableBillboards').textContent = 
        billboards.filter(b => b.availability === 'available').length;
      document.getElementById('pendingBookings').textContent = 
        bookings.filter(b => b.status === 'pending').length;
    } catch (error) {
      showAlert('Error loading overview data', 'error');
    }
  }
  
  // Load billboards
  async function loadBillboards() {
    try {
      const billboards = await apiCall('/billboards/my');
      const container = document.getElementById('billboardsList');
      container.innerHTML = '';
  
      if (billboards.length === 0) {
        container.innerHTML = '<p>You haven\'t added any billboards yet.</p>';
        return;
      }
  
      billboards.forEach(billboard => {
        const card = createBillboardCard(billboard);
        container.appendChild(card);
      });
    } catch (error) {
      showAlert('Error loading billboards', 'error');
    }
  }
  
  // Create billboard card
  function createBillboardCard(billboard) {
    const div = document.createElement('div');
    div.className = 'billboard-card';
    div.innerHTML = `
      <img src="/images/${billboard.image}" alt="${billboard.title}" onerror="this.src='https://via.placeholder.com/300x200?text=Billboard'">
      <div class="billboard-card-content">
        <h3>${billboard.title}</h3>
        <p class="location">📍 ${billboard.location}</p>
  <p class="price">₹${Number(billboard.price).toLocaleString('en-IN')}/day</p>
        <div class="details">
          <span>📏 ${billboard.size}</span>
          <span class="badge badge-${billboard.availability}">${billboard.availability}</span>
        </div>
        <p>${billboard.description.substring(0, 100)}...</p>
        <div style="margin-top: 1rem;">
          ${billboard.approved ? 
            '<span class="badge badge-approved">Approved</span>' : 
            '<span class="badge badge-pending">Pending Approval</span>'}
        </div>
        <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
          <button class="btn btn-small btn-danger" onclick="deleteBillboard('${billboard._id}')">Delete</button>
        </div>
      </div>
    `;
    return div;
  }
  
  // Handle add billboard
  async function handleAddBillboard(e) {
    e.preventDefault();
  
    const formData = new FormData();
    formData.append('title', document.getElementById('title').value);
    formData.append('location', document.getElementById('location').value);
    formData.append('address', document.getElementById('address').value);
    formData.append('size', document.getElementById('size').value);
  formData.append('price', document.getElementById('price').value); // price is now in INR
    formData.append('description', document.getElementById('description').value);
    formData.append('availability', document.getElementById('availability').value);
  
    const imageFile = document.getElementById('image').files[0];
    if (imageFile) {
      formData.append('image', imageFile);
    }
  
    try {
      await apiCall('/billboards', 'POST', formData, true);
      showAlert('Billboard added successfully! Waiting for admin approval.', 'success');
      document.getElementById('addBillboardForm').reset();
      loadBillboards();
      loadOverviewData();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }
  
  // Delete billboard
  async function deleteBillboard(id) {
    if (!confirm('Are you sure you want to delete this billboard?')) return;
  
    try {
      await apiCall(`/billboards/${id}`, 'DELETE');
      showAlert('Billboard deleted successfully', 'success');
      loadBillboards();
      loadOverviewData();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }
  
  // Load bookings
  async function loadBookings() {
    try {
      const bookings = await apiCall('/bookings/owner');
      const tbody = document.getElementById('bookingsTableBody');
      tbody.innerHTML = '';
  
      if (bookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No booking requests yet</td></tr>';
        return;
      }
  
      bookings.forEach(booking => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${booking.billboardId.title}</td>
          <td>${booking.advertiserId.name}<br><small>${booking.advertiserId.email}</small></td>
          <td>${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</td>
          <td>₹${Number(booking.totalPrice).toLocaleString('en-IN')}</td>
          <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
          <td>
            ${booking.status === 'pending' ? `
              <button class="btn btn-small btn-success" onclick="updateBookingStatus('${booking._id}', 'approved')">Approve</button>
              <button class="btn btn-small btn-danger" onclick="updateBookingStatus('${booking._id}', 'rejected')">Reject</button>
            ` : '-'}
          </td>
        `;
        tbody.appendChild(row);
      });
    } catch (error) {
      showAlert('Error loading bookings', 'error');
    }
  }
  
  // Update booking status
  async function updateBookingStatus(bookingId, status) {
    try {
      await apiCall(`/bookings/${bookingId}`, 'PUT', { status });
      showAlert(`Booking ${status} successfully`, 'success');
      loadBookings();
      loadOverviewData();
    } catch (error) {
      showAlert(error.message, 'error');
    }
  }