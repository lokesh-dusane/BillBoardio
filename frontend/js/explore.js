// explore.js - Dynamically load billboards and handle booking popup

document.addEventListener('DOMContentLoaded', function() {
  loadExploreBillboards();
});

async function loadExploreBillboards() {
  const grid = document.querySelector('.explore-grid');
  if (!grid) return;
  try {
    // Fetch all approved billboards from the backend
    // const res = await fetch('/billboards?approved=true');
    const res = await fetch('/api/billboards?approved=true');
    let billboards = [];
    if (res.ok) {
      billboards = await res.json();
    } else {
      throw new Error('HTTP ' + res.status + ': ' + res.statusText);
    }
    grid.innerHTML = '';
    if (!billboards.length) {
      grid.innerHTML = '<p>No billboards available.</p>';
      return;
    }
    billboards.forEach(billboard => {
      grid.appendChild(createBillboardCard(billboard));
    });
  } catch (err) {
    // Use static demo data if fetch fails
    const billboards = [
      {
        image: 'h1.jpg',
        title: 'College Road Billboard',
        location: 'College Road, Nashik',
        price: 2000,
        size: '14x48 ft',
        description: 'Prime location near colleges and shopping centers. High student and commuter visibility.'
      },
      {
        image: 'h2.jpg',
        title: 'Dwarka Circle Billboard',
        location: 'Dwarka Circle, Nashik',
        price: 2500,
        size: '10x30 ft',
        description: 'Located at a major traffic junction. Excellent for maximum exposure and brand recall.'
      },
      {
        image: 'h3.jpg',
        title: 'Mumbai Naka Billboard',
        location: 'Mumbai Naka, Nashik',
        price: 2200,
        size: '20x60 ft',
        description: 'Strategic location for travelers entering Nashik. High vehicle and pedestrian traffic.'
      },
      {
        image: 'ad1.jpeg',
        title: 'Satpur MIDC Billboard',
        location: 'Satpur MIDC, Nashik',
        price: 1800,
        size: '12x24 ft',
        description: 'Industrial area billboard, perfect for B2B and industrial advertising. High visibility for workers and visitors.'
      },
      {
        image: 'ad2.jpg',
        title: 'Panchavati Billboard',
        location: 'Panchavati, Nashik',
        price: 2100,
        size: '14x48 ft',
        description: 'Located in a busy residential and temple area. Great for local and spiritual campaigns.'
      }
    ];
    grid.innerHTML = '';
    billboards.forEach(billboard => {
      grid.appendChild(createBillboardCard(billboard));
    });
    // Optionally, show a warning message
    const warn = document.createElement('div');
    warn.style.color = 'orange';
    warn.style.margin = '1rem 0';
    warn.textContent = 'Showing demo billboards (API not connected)';
    grid.parentNode.insertBefore(warn, grid);
    console.warn('Error loading billboards, using demo data:', err);
  }
}

function createBillboardCard(billboard) {
  const div = document.createElement('div');
  div.className = 'billboard-card';
  div.innerHTML = `
    <img src="../images/${billboard.image}" alt="${billboard.title}">
    <div class="billboard-card-content">
      <h3>${billboard.title}</h3>
      <p class="location">📍 ${billboard.location}</p>
      <p class="price">₹${billboard.price}/day</p>
      <div class="details">
        <span>📏 ${billboard.size}</span>
        <span class="badge badge-available">Approved</span>
      </div>
      <p>${billboard.description || ''}</p>
      <button class="btn book-btn">Book</button>
    </div>
  `;
  div.querySelector('.book-btn').addEventListener('click', function() {
    alert('Please sign in to book the billboard.');
    window.location.href = 'login.html';
  });
  return div;
}
