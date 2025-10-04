// Advertiser dashboard functionality

let currentBillboardPrice = 0;

document.addEventListener('DOMContentLoaded', () => {
  const user = checkAuth();
  if (!user || user.role !== 'advertiser') {
    window.location.href = 'login.html';
    return;
  }

  // Set user name
  document.getElementById('userName').textContent = user.name;

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', logout);

  // Navigation
  setupNavigation();

  // Load billboards
  loadBillboards();

  // Apply filters
  document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);

  // Close modal
  document.getElementById('closeModalBtn').addEventListener('click', closeModal);

  // Booking form
  document.getElementById('bookingForm').addEventListener('submit', handleBooking);

  // Date change listeners for price calculation
  document.getElementById('startDate').addEventListener('change', calculatePrice);
  document.getElementById('endDate').addEventListener('change', calculatePrice);

  // Load bookings
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

// Load billboards with filters
async function loadBillboards(filters = {}) {
  try {
    let queryString = '';
    if (filters.location) queryString += `&location=${filters.location}`;
    if (filters.minPrice) queryString += `&minPrice=${filters.minPrice}`;
    if (filters.maxPrice) queryString += `&maxPrice=${filters.maxPrice}`;
    if (filters.size) queryString += `&size=${filters.size}`;
    queryString += '&availability=available';

    const billboards = await apiCall(`/billboards?${queryString}`);
    const container = document.getElementById('billboardsList');
    container.innerHTML = '';

    if (billboards.length === 0) {
      container.innerHTML = '<p>No billboards found matching your criteria.</p>';
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
      <p style="font-size: 0.9rem; color: #666;">${billboard.address}</p>
  <p class="price">₹${Number(billboard.price).toLocaleString('en-IN')}/day</p>
      <div class="details">
        <span>📏 ${billboard.size}</span>
        <span class="badge badge-${billboard.availability}">${billboard.availability}</span>
      </div>
      <p>${billboard.description}</p>
      <div style="margin-top: 1rem;">
        <p style="font-size: 0.9rem; color: #666;">
          <strong>Owner:</strong> ${billboard.ownerId.name}<br>
          <strong>Contact:</strong> ${billboard.ownerId.email}
        </p>
      </div>
      <button class="btn btn-primary" style="margin-top: 1rem; width: 100%;" 
              onclick="openBookingModal('${billboard._id}', '${billboard.ownerId._id}', ${billboard.price})">
        Request Booking
      </button>
    </div>
  `;
  return div;
}

// Apply filters
function applyFilters() {
  const filters = {
    location: document.getElementById('filterLocation').value,
    minPrice: document.getElementById('filterMinPrice').value,
    maxPrice: document.getElementById('filterMaxPrice').value,
    size: document.getElementById('filterSize').value
  };
  loadBillboards(filters);
}

// Open booking modal
function openBookingModal(billboardId, ownerId, price) {
  currentBillboardPrice = price;
  document.getElementById('billboardId').value = billboardId;
  document.getElementById('ownerId').value = ownerId;
  document.getElementById('estimatedPrice').textContent = '0';
  
  // Reset form
  document.getElementById('bookingForm').reset();
  
  // Set min date to today
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('startDate').setAttribute('min', today);
  document.getElementById('endDate').setAttribute('min', today);
  
  document.getElementById('bookingModal').classList.add('active');
}

// Close modal
function closeModal() {
  document.getElementById('bookingModal').classList.remove('active');
}

// Calculate price based on dates
function calculatePrice() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days > 0) {
      const totalPrice = currentBillboardPrice * days;
      document.getElementById('estimatedPrice').textContent = totalPrice.toFixed(2);
    } else {
      document.getElementById('estimatedPrice').textContent = '0';
    }
  }
}

// Handle booking
async function handleBooking(e) {
  e.preventDefault();

  const bookingData = {
    billboardId: document.getElementById('billboardId').value,
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value,
    message: document.getElementById('message').value,
    paymentMethod: document.getElementById('paymentMethod').value
  };

  try {
    await apiCall('/bookings', 'POST', bookingData);
    showAlert('Booking request sent successfully!', 'success');
    closeModal();
    loadBookings();
  } catch (error) {
    showAlert(error.message, 'error');
  }
}

// Load bookings
async function loadBookings() {
  try {
    const bookings = await apiCall('/bookings/advertiser');
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
        <td>📍 ${booking.billboardId.location}</td>
        <td>${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}</td>
  <td>₹${Number(booking.totalPrice).toLocaleString('en-IN')}</td>
        <td><span class="badge badge-${booking.status}">${booking.status}</span></td>
        <td>
          ${booking.ownerId.name}<br>
          <small>${booking.ownerId.email}</small><br>
          <small>${booking.ownerId.phone || 'N/A'}</small>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (error) {
    showAlert('Error loading bookings', 'error');
  }
}