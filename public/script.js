// ============================================
// GREENCREDITS - COMPLETE FIXED FRONTEND
// All bugs fixed, production-ready
// ============================================

let currentUser = null;
let currentLocation = null; // Object: { lat, lng, address }

// Initialize app on page load
document.addEventListener('DOMContentLoaded', function () {
  console.log('🌍 GreenCredits initialized');

  // Verify and styling file inputs
  const photoInput = document.getElementById('photoInput');
  if (photoInput) {
    styleFileInput(photoInput);
  }

  checkSession();

  // ✅ FIX: Mobile Menu (Hamburger)
  const mobileToggle = document.getElementById('mobileMenuToggle');
  const mainNav = document.querySelector('.main-nav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      mainNav.classList.toggle('active');
      mobileToggle.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('active');
        mobileToggle.classList.remove('active');
      });
    });

    document.addEventListener('click', (e) => {
      if (!mainNav.contains(e.target) && !mobileToggle.contains(e.target)) {
        mainNav.classList.remove('active');
        mobileToggle.classList.remove('active');
      }
    });
  }

  initializeEventListeners();
  loadPublicData();

  // ✅ FIX: Footer Links & Download Buttons
  document.querySelectorAll('.footer-links a').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');

      if (href && (href.startsWith('#features') || href.startsWith('#journey') ||
        href.startsWith('#impact') || href.startsWith('#leaderboard'))) {
        e.preventDefault();
        const targetId = href.replace('#', '');
        const section = document.getElementById(targetId);
        if (section) {
          section.scrollIntoView({ behavior: 'smooth' });
        }
      } else if (!href || href === '#') {
        e.preventDefault();
        showNotification('This feature is coming soon! 🚀', 'info');
      }
    });
  });

  document.querySelectorAll('.app-btn, .app-buttons a').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      showNotification('📱 Mobile app coming soon! Stay tuned for updates.', 'info');
    });
  });

  const logo = document.querySelector('.logo');
  if (logo) {
    logo.style.cursor = 'pointer';
    logo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});

// ============================================
// SESSION MANAGEMENT
// ============================================

async function checkSession() {
  try {
    const response = await fetch('/api/check-session', {
      credentials: 'include'
    });
    const data = await response.json();

    if (data.loggedIn && data.user) {
      currentUser = data.user;
      showLoggedInState();
      await loadUserCredits();
      console.log('✅ User logged in:', currentUser.name);
    } else {
      showLoggedOutState();
      console.log('ℹ️ User not logged in');
    }
  } catch (error) {
    console.error('Session check failed:', error);
    showLoggedOutState();
  }
}

function showLoggedInState() {
  document.getElementById('authButtons')?.classList.add('hidden');

  const userWelcome = document.getElementById('userWelcome');
  if (userWelcome) {
    userWelcome.classList.remove('hidden');
    userWelcome.innerHTML = `
      <span class="welcome-text">Welcome, <strong>${currentUser.name}</strong></span>
      <div id="userCreditsDisplay" class="credits-display">
        <span class="credits-icon">💰</span>
        <span id="creditsAmount">Loading...</span> Credits
      </div>
      <button onclick="logout()" class="btn-logout">Logout</button>
    `;
  }

  document.querySelectorAll('.logged-in-only').forEach(el => {
    el.style.display = 'block';
  });
}

function showLoggedOutState() {
  currentUser = null;
  document.getElementById('authButtons')?.classList.remove('hidden');

  const userWelcome = document.getElementById('userWelcome');
  if (userWelcome) {
    userWelcome.classList.add('hidden');
    userWelcome.innerHTML = '';
  }

  document.querySelectorAll('.logged-in-only').forEach(el => {
    el.style.display = 'none';
  });
}

// ============================================
// EVENT LISTENERS
// ============================================

function initializeEventListeners() {
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.addEventListener('click', () => openModal('loginModal'));
  }

  const signupBtn = document.getElementById('signupBtn');
  if (signupBtn) {
    signupBtn.addEventListener('click', () => openModal('signupModal'));
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  const reportForm = document.getElementById('reportForm');
  if (reportForm) {
    reportForm.addEventListener('submit', handleReportSubmit);
  }

  const useLocationBtn = document.getElementById('useLocationBtn');
  if (useLocationBtn) {
    useLocationBtn.addEventListener('click', getUserLocation);
  }

  const photoInput = document.getElementById('photoInput');
  if (photoInput) {
    styleFileInput(photoInput);
  }

  initializeNavTabs();

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      closeModal(e.target.id);
    }
  });
}

// ============================================
// AUTHENTICATION
// ============================================

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;

  if (!email || !password) {
    showNotification('Please fill all fields', 'error');
    return;
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      showNotification(`Welcome back, ${data.user.name}! 🎉`, 'success');
      closeModal('loginModal');
      document.getElementById('loginForm').reset();
      showLoggedInState();
      await loadUserCredits();
    } else {
      showNotification(data.error || 'Login failed', 'error');
    }
  } catch (error) {
    console.error('Login error:', error);
    showNotification('Login failed. Please try again.', 'error');
  }
}

async function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById('signupName').value;
  const email = document.getElementById('signupEmail').value;
  const password = document.getElementById('signupPassword').value;

  if (!name || !email || !password) {
    showNotification('Please fill all fields', 'error');
    return;
  }

  if (password.length < 6) {
    showNotification('Password must be at least 6 characters', 'error');
    return;
  }

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, password })
    });

    const data = await response.json();

    if (data.success) {
      currentUser = data.user;
      showNotification(`Welcome to GreenCredits, ${name}! You earned 50 welcome credits! 🎉`, 'success');
      closeModal('signupModal');
      document.getElementById('signupForm').reset();
      showLoggedInState();
      await loadUserCredits();
    } else {
      showNotification(data.error || 'Registration failed', 'error');
    }
  } catch (error) {
    console.error('Signup error:', error);
    showNotification('Registration failed. Please try again.', 'error');
  }
}

async function logout() {
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      credentials: 'include'
    });

    if (response.ok) {
      showNotification('Logged out successfully', 'success');

      document.querySelectorAll('form').forEach(form => form.reset());
      document.querySelectorAll('input[type="file"]').forEach(input => {
        input.value = '';
        const label = input.nextElementSibling;
        if (label) label.textContent = 'Choose File';
      });

      const mapPreview = document.getElementById('mapPreview');
      if (mapPreview) mapPreview.remove();

      showLoggedOutState();
    }
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// ============================================
// CREDITS SYSTEM
// ============================================

async function loadUserCredits() {
  if (!currentUser) return;

  try {
    const response = await fetch('/api/credits', {
      credentials: 'include'
    });
    const data = await response.json();

    if (data.success) {
      updateCreditsDisplay(data.credits, data.badges, data.nextBadges);
    }
  } catch (error) {
    console.error('Load credits error:', error);
  }
}

function updateCreditsDisplay(credits, badges, nextBadges) {
  const creditsAmount = document.getElementById('creditsAmount');
  if (creditsAmount) {
    creditsAmount.textContent = credits.available;
  }

  const creditsPage = document.getElementById('creditsSection');
  if (creditsPage) {
    creditsPage.innerHTML = `
      <div class="credits-dashboard">
        <h2>Your Green Credits 💰</h2>
        
        <div class="credits-top-card">
            <div class="balance-section">
                <span class="balance-label">Available Balance</span>
                <div class="balance-amount">${credits.available || 0} <small>Credits</small></div>
            </div>
            <div class="lifetime-section">
                <span class="lifetime-label">Lifetime Earned</span>
                <span class="lifetime-amount">✨ ${credits.total || 0}</span>
            </div>
        </div>
        
        <div class="history-section">
            <h3>📜 Credit Statement</h3>
            <div id="transactionHistory" class="transaction-list">
                <div class="loader">Loading history...</div>
            </div>
        </div>
      </div>
    `;

    // Load history after rendering container
    loadCreditHistory();
  }
}

async function loadCreditHistory() {
  const container = document.getElementById('transactionHistory');
  if (!container) return;

  try {
    const response = await fetch('/api/transactions');
    const data = await response.json();

    if (data.success && data.transactions.length > 0) {
      container.innerHTML = data.transactions.map(t => `
            <div class="transaction-item ${t.type}">
                <div class="t-icon">${t.type === 'earn' ? '⬇️' : '⬆️'}</div>
                <div class="t-details">
                    <div class="t-desc">${t.description}</div>
                    <div class="t-date">${new Date(t.date).toLocaleDateString()} • ${new Date(t.date).toLocaleTimeString()}</div>
                </div>
                <div class="t-amount ${t.type === 'earn' ? 'positive' : 'negative'}">
                    ${t.type === 'earn' ? '+' : '-'}${t.amount}
                </div>
            </div>
          `).join('');
    } else {
      container.innerHTML = '<div class="empty-state"><p>No transactions yet.</p></div>';
    }
  } catch (e) {
    console.error("Failed to load history", e);
    container.innerHTML = '<div class="error-state">Failed to load history.</div>';
  }
}

// ============================================
// REPORT SUBMISSION
// ============================================

async function handleReportSubmit(e) {
  e.preventDefault();

  const submitBtn = reportForm.querySelector('button[type="submit"]');
  const btnText = submitBtn.innerHTML;

  try {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner"></span> Submitting...';

    const formData = new FormData(reportForm);


    // 🌍 IMPROVED LOCATION LOGIC
    const manualLat = document.getElementById('manualLat')?.value;
    const manualLng = document.getElementById('manualLng')?.value;

    // Use .set() to ensure we don't send duplicate keys or 'undefined' string

    // 0. Priority: Manual Debug Coords
    if (manualLat && manualLng && manualLat.trim() !== '' && manualLng.trim() !== '') {
      formData.set('lat', manualLat);
      formData.set('lng', manualLng);
      console.log('✅ Using Manual GPS:', manualLat, manualLng);
    }
    // 1. If we have GPS coordinates, use them
    else if (currentLocation && typeof currentLocation.lat === 'number') {
      formData.set('lat', currentLocation.lat.toString()); // Ensure string
      formData.set('lng', currentLocation.lng.toString());

      // Explicitly handle address
      const locationInput = document.getElementById('locationInput');
      if (locationInput && locationInput.value && locationInput.value.trim() !== '') {
        formData.set('address', locationInput.value);
      } else {
        // Fallback address if user didn't type anything but used GPS
        // This prevents "Address missing" errors on server if any exist
        if (currentLocation.address) {
          formData.set('address', currentLocation.address);
        } else {
          formData.set('address', `GPS: ${currentLocation.lat.toFixed(5)}, ${currentLocation.lng.toFixed(5)}`);
        }
      }
    }
    // 2. If no GPS, but user typed an address, try to Geocode it first
    else {
      const locationInput = document.getElementById('locationInput');
      const userAddress = locationInput ? locationInput.value : '';

      if (userAddress && userAddress.trim().length > 3) {
        showNotification('📍 converting address to coordinates...', 'info');
        try {
          const coords = await geocodeAddress(userAddress);
          if (coords) {
            formData.set('lat', coords.lat.toString());
            formData.set('lng', coords.lng.toString());
            formData.set('address', userAddress);
            console.log('✅ Geocoded address:', coords);
          } else {
            formData.set('lat', '0');
            formData.set('lng', '0');
          }
        } catch (e) {
          console.error("Geocode failed", e);
          formData.set('lat', '0');
          formData.set('lng', '0');
        }
      } else {
        formData.set('lat', '0');
        formData.set('lng', '0');
      }
    }


    const response = await fetch('/api/report', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      // ✅ SHOW POPUP - This is the key line!
      showSuccessPopup(data);

      // Clear form
      reportForm.reset();
      photoInput.value = '';
      photoPreview.style.display = 'none';
      photoPreview.src = '';

      // Reset location
      currentLocation = null;

    } else {
      alert('❌ ' + (data.error || 'Failed to submit report'));
    }

  } catch (error) {
    console.error('Submit error:', error);
    alert('❌ Failed to submit report. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = btnText;
  }
}


// ============================================
// LOCATION SERVICES (FIXED - Preserves User Input + Shows Map)
// ============================================

function getUserLocation() {
  if (!navigator.geolocation) {
    showNotification('Geolocation is not supported by your browser', 'error');
    return;
  }

  const locationInput = document.getElementById('locationInput');
  const userEnteredAddress = locationInput?.value || '';

  showNotification('Getting your location...', 'info');

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      currentLocation = { lat, lng };

      try {
        // Try to reverse geocode, but distinct from raw GPS
        const address = await reverseGeocode(lat, lng);
        currentLocation.address = address;

        // Only update text input if empty, otherwise trust user's typing
        if (!userEnteredAddress || userEnteredAddress.trim() === '') {
          locationInput.value = address;
        }

        // Always show the "GPS Locked" badge
        updateLocationStatus(lat, lng, true);
        showNotification('Location captured successfully! 📍', 'success');
        showMapPreview(lat, lng);

      } catch (error) {
        console.error('Reverse geocoding error:', error);

        // If geocode fails, show coords in input if empty
        if (!userEnteredAddress || userEnteredAddress.trim() === '') {
          locationInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        }

        updateLocationStatus(lat, lng, true);
        showNotification('Location captured (Address lookup failed)!', 'warning');
        showMapPreview(lat, lng);
      }
    },
    (error) => {
      let errorMessage = 'Could not get your location.';
      if (error.code === error.PERMISSION_DENIED) {
        errorMessage = 'Please enable location access. (Check browser settings)';
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        errorMessage = 'Location unavailable.';
      } else if (error.code === error.TIMEOUT) {
        errorMessage = 'Location request timed out.';
      }
      showNotification(errorMessage, 'error');
      updateLocationStatus(null, null, false);
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    }
  );
}

// Helper to show coords
function updateLocationStatus(lat, lng, success) {
  let statusEl = document.getElementById('locationStatus');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'locationStatus';
    statusEl.style.fontSize = '0.85rem';
    statusEl.style.marginTop = '5px';
    const inputGroup = document.getElementById('locationInput').closest('.form-group');
    inputGroup.appendChild(statusEl);
  }

  if (success) {
    statusEl.innerHTML = `<span style="color: #10b981; font-weight: 600;">✅ GPS Locked: ${lat.toFixed(5)}, ${lng.toFixed(5)}</span>`;
    statusEl.style.display = 'block';
  } else {
    statusEl.style.display = 'none';
    currentLocation = null;
  }
}


// ✅ NEW FUNCTION: Show Google Maps Preview
function showMapPreview(lat, lng) {
  const reportForm = document.getElementById('reportForm');
  if (!reportForm) return;

  const existingMap = document.getElementById('mapPreview');
  if (existingMap) existingMap.remove();

  const mapContainer = document.createElement('div');
  mapContainer.id = 'mapPreview';
  mapContainer.className = 'map-preview';
  mapContainer.innerHTML = `
    <div class="map-preview-header">
      <span>📍 Location Preview</span>
      <button type="button" onclick="document.getElementById('mapPreview').remove()" class="close-map">✕</button>
    </div>
    <iframe
      width="100%"
      height="300"
      frameborder="0"
      style="border:0; border-radius: 8px;"
      src="https://www.google.com/maps?q=${lat},${lng}&output=embed&z=15"
      allowfullscreen>
    </iframe>
    <p class="map-coords">📍 ${lat.toFixed(6)}, ${lng.toFixed(6)}</p>
  `;

  const locationGroup = document.getElementById('locationInput').closest('.form-group');
  locationGroup.after(mapContainer);
}

async function reverseGeocode(lat, lng) {
  // Try multiple geocoding services for better accuracy

  // Method 1: OpenStreetMap Nominatim (most detailed)
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'GreenCredits App'
        }
      }
    );

    if (response.ok) {
      const data = await response.json();

      // Build a more detailed address
      const address = data.address || {};
      const parts = [];

      // Add specific location details
      if (address.village) parts.push(address.village);
      if (address.town) parts.push(address.town);
      if (address.city) parts.push(address.city);
      if (address.state_district) parts.push(address.state_district);
      if (address.state) parts.push(address.state);
      if (address.postcode) parts.push(address.postcode);

      if (parts.length > 0) {
        return parts.join(', ');
      }

      // Fallback to display_name
      if (data.display_name) {
        return data.display_name;
      }
    }
  } catch (error) {
    console.error('Nominatim geocoding failed:', error);
  }

  // Method 2: Try BigDataCloud (free, no API key needed)
  try {
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
    );

    if (response.ok) {
      const data = await response.json();
      const parts = [];

      if (data.locality) parts.push(data.locality);
      if (data.city) parts.push(data.city);
      if (data.principalSubdivision) parts.push(data.principalSubdivision);
      if (data.postcode) parts.push(data.postcode);

      if (parts.length > 0) {
        return parts.join(', ');
      }
    }
  } catch (error) {
    console.error('BigDataCloud geocoding failed:', error);
  }

  // Fallback: Return coordinates
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
}

// ✅ NEW FUNCTION: Forward Geocoding (Address -> Lat/Lng)
async function geocodeAddress(query) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    }
  } catch (error) {
    console.error('Forward geocoding error:', error);
  }
  return null;
}


// ============================================
// MY REPORTS
// ============================================

async function loadMyReports() {
  if (!currentUser) return;

  try {
    const response = await fetch('/api/reports', {
      credentials: 'include'
    });
    const data = await response.json();

    if (data.success) {
      displayMyReports(data.reports);
    }
  } catch (error) {
    console.error('Load reports error:', error);
  }
}

function displayMyReports(reports) {
  const reportsContainer = document.getElementById('myReportsContainer');
  if (!reportsContainer) return;

  if (!reports || reports.length === 0) {
    reportsContainer.innerHTML = `
      <div class="empty-state">
        <p>📋 No reports yet</p>
        <p>Submit your first waste report to get started!</p>
        <button onclick="switchTab('reportIssue')" class="btn-primary">Report Waste</button>
      </div>
    `;
    return;
  }

  reportsContainer.innerHTML = `
    <div class="reports-grid">
      ${reports.map(report => `
        <div class="report-card" id="report-${report.reportId}">
          <div class="report-photos" style="display: flex; gap: 10px; overflow-x: auto; margin-bottom: 15px;">
              <div class="photo-container" style="flex: 0 0 auto; max-width: 200px;">
                <span style="display: block; font-size: 0.8rem; font-weight: 600; color: #666; margin-bottom: 4px;">Before</span>
                ${report.photoUrl ? `<img src="${report.photoUrl}" alt="Report photo" class="report-photo" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px;">` : '<div class="no-photo" style="height: 150px; background: #eee; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #999;">No Photo</div>'}
              </div>
              
              ${report.completionPhotoUrl ? `
              <div class="photo-container" style="flex: 0 0 auto; max-width: 200px;">
                <span style="display: block; font-size: 0.8rem; font-weight: 600; color: #10b981; margin-bottom: 4px;">After (Resolved)</span>
                <img src="${report.completionPhotoUrl}" alt="Completion photo" class="report-photo" style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; border: 2px solid #10b981;">
              </div>` : ''}
          </div>

          <div class="report-content">
            <div class="report-title-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div class="report-id" style="font-weight: 700; color: #333;">Report #${report.reportId}</div>
                <div class="report-status"><span class="status-badge status-${report.status}">${report.status}</span></div>
            </div>
            
            <p class="report-description" style="color: #4b5563; margin-bottom: 12px;">${report.description}</p>
            
            ${report.workerNotes ? `<div class="worker-notes" style="background: #f0fdf4; padding: 10px; border-radius: 6px; font-size: 0.9rem; margin-bottom: 12px; border: 1px solid #bbf7d0; color: #166534;">
                <strong>👷 Worker Note:</strong> ${report.workerNotes}
            </div>` : ''}
            
            <div class="report-location-group" style="margin-bottom: 12px;">
                ${report.address ? `<p class="report-location" style="color: #6b7280; font-size: 0.9rem; margin-bottom: 5px;">📍 ${report.address}</p>` : ''}
                ${report.lat && report.lng ?
      `<a href="https://www.google.com/maps?q=${report.lat},${report.lng}" target="_blank" class="btn-map-view" style="display: inline-flex; align-items: center; gap: 5px; color: white; background-color: #2563eb; padding: 6px 12px; border-radius: 6px; text-decoration: none; font-size: 0.85rem; font-weight: 500; transition: background 0.2s;">
                        <span>🗺️</span> View on Map
                    </a>` : ''
    }
            </div>

            <div class="report-meta" style="font-size: 0.8rem; color: #9ca3af; border-top: 1px solid #f3f4f6; padding-top: 10px;">
              <span class="report-date">Submitted: ${new Date(report.createdAt).toLocaleDateString()}</span>
              ${report.resolvedAt ? `<span style="margin-left: 10px; color: #10b981;">• Resolved: ${new Date(report.resolvedAt).toLocaleDateString()}</span>` : ''}
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ============================================
// LEADERBOARD
// ============================================

async function loadPublicData() {
  await loadLeaderboard();
}

async function loadLeaderboard() {
  try {
    const response = await fetch('/api/leaderboard');
    const data = await response.json();

    if (data.success) {
      displayLeaderboard(data.leaderboard);
    }
  } catch (error) {
    console.error('Load leaderboard error:', error);
  }
}

function displayLeaderboard(leaderboard) {
  const leaderboardContainer = document.getElementById('leaderboardContainer');
  if (!leaderboardContainer) return;

  if (!leaderboard || leaderboard.length === 0) {
    leaderboardContainer.innerHTML = '<p class="empty-state">No data yet. Be the first to submit a report!</p>';
    return;
  }

  leaderboardContainer.innerHTML = `
    <div class="leaderboard-list">
      ${leaderboard.map((user, index) => `
        <div class="leaderboard-item ${index < 3 ? 'top-three' : ''}">
          <div class="rank">${getRankEmoji(user.rank)} #${user.rank}</div>
          <div class="user-info">
            <div class="user-name">${user.name}</div>
            <div class="user-stats">${user.reports} reports • ${user.badges} badges</div>
          </div>
          <div class="user-credits">${user.credits} pts</div>
        </div>
      `).join('')}
    </div>
  `;
}

function getRankEmoji(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return '🏅';
}

// ============================================
// NAVIGATION TABS
// ============================================

function initializeNavTabs() {
  const tabButtons = document.querySelectorAll('[data-tab]');
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      switchTab(button.dataset.tab);
    });
  });
}

function switchTab(tabName) {
  // Hide all sections
  document.querySelectorAll('.tab-content').forEach(section => {
    section.classList.add('hidden');
  });

  // Show selected section
  const targetSection = document.getElementById(tabName + 'Section') ||
    document.getElementById(tabName);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }

  // Update active tab button
  document.querySelectorAll('[data-tab]').forEach(button => {
    button.classList.remove('active');
  });
  document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');

  // Load data for specific tabs
  if (tabName === 'myReports') loadMyReports();
  if (tabName === 'credits') loadUserCredits();
  if (tabName === 'leaderboard') loadLeaderboard();
}

// ============================================
// UI UTILITIES
// ============================================

function styleFileInput(input) {
  const label = document.createElement('label');
  label.htmlFor = input.id;
  label.className = 'file-input-label';
  label.textContent = 'Choose File';

  input.style.display = 'none';
  input.parentNode.insertBefore(label, input.nextSibling);

  // 🧠 AI HOOK: Trigger analysis on file select
  input.addEventListener('change', async function (e) {
    if (this.files && this.files[0]) {
      const file = this.files[0];

      label.textContent = '📸 ' + file.name;
      label.style.borderColor = 'var(--primary)';
      label.style.color = 'var(--primary)';

      // Preview
      const reader = new FileReader();
      const preview = document.getElementById('photoPreview');

      if (preview) {
        reader.onload = async function (e) {
          preview.src = e.target.result;
          preview.style.display = 'block';

          // 🚀 RUN AI ANALYSIS
          await analyzeWasteImage(preview);
        };
        reader.readAsDataURL(file);
      }
    } else {
      label.textContent = 'Choose File';
      label.style.borderColor = 'var(--gray-300)';
      label.style.color = 'var(--gray-700)';
    }
  });
}

// ============================================
// 🧠 ARTIFICIAL INTELLIGENCE (TensorFlow.js)
// ============================================

let aiModel = null;

// Load Model on Startup
// Helper to load external script dynamically
function loadScript(src) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve(); // Already exists
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

async function loadAI() {
  try {
    console.log('🧠 Loading GreenCredits AI Brain...');

    // 1. Ensure TensorFlow is loaded
    if (typeof tf === 'undefined') {
      console.log('🔄 Loading TensorFlow.js dynamically...');
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.18.0/dist/tf.min.js');
    }

    // 2. Ensure MobileNet is loaded
    if (typeof mobilenet === 'undefined') {
      console.log('🔄 Loading MobileNet dynamically...');
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/mobilenet@2.1.0/dist/mobilenet.min.js');
    }

    // 3. Load the Model
    aiModel = await mobilenet.load();
    console.log('✅ AI Brain Ready!');
    warmupModel(); // 🚀 Pre-fire the engine
  } catch (error) {
    console.error('❌ Failed to load AI:', error);
    const statusEl = document.getElementById('aiStatus');
    if (statusEl) statusEl.innerHTML = '⚠️ AI Connection Failed. Please refresh or check internet.';
  }
}

// Perform a dummy classification to initialize WebGL shaders
async function warmupModel() {
  if (!aiModel) return;
  try {
    const zeros = tf.zeros([224, 224, 3]);
    await aiModel.classify(zeros);
    zeros.dispose();
    console.log('🚀 AI Engine Warmed Up');
  } catch (e) {
    console.log('⚠️ AI Warmup skipped', e);
  }
}

// Start loading after window load
window.addEventListener('load', function () {
  loadAI();
});

async function analyzeWasteImage(imgElement) {
  const statusEl = document.getElementById('aiStatus');
  const catInput = document.getElementById('wasteCategory'); // Target the visible dropdown
  const tagInput = document.getElementById('aiTags');
  const confInput = document.getElementById('aiConfidence');

  if (!statusEl) return;

  // Show analyzing state
  statusEl.style.display = 'block';
  statusEl.innerHTML = `
    <span class="spinner" style="display:inline-block; vertical-align:middle; width:16px; height:16px; border:2px solid #166534; border-top-color:transparent; border-radius:50%; animation:spin 1s linear infinite; margin-right:8px;"></span>
    <strong>AI Analyzing...</strong> Identifying waste type...
  `;

  if (!aiModel) {
    console.warn('⚠️ AI Model not ready. Attempting to load...');
    await loadAI();
    if (!aiModel) {
      statusEl.innerHTML = '⚠️ AI could not load. Please check your internet connection.';
      if (catInput) catInput.value = 'other';
      return;
    }
  }

  try {
    // 1. Get Predictions
    const predictions = await aiModel.classify(imgElement);
    console.log('🤖 AI Predictions:', predictions);

    // 2. Process Results
    if (predictions && predictions.length > 0) {
      const topResult = predictions[0];
      const allTags = predictions.map(p => p.className).join(', ');

      // Save raw tags for backend
      if (tagInput) tagInput.value = allTags;
      if (confInput) confInput.value = topResult.probability.toFixed(4);

      // 3. Map to Categories
      const detectedCategory = mapPredictionsToCategory(predictions);

      // 4. Update UI
      if (catInput) catInput.value = detectedCategory.category;

      statusEl.innerHTML = `
        <div style="margin-bottom: 4px;"><strong>✅ AI Analysis Complete</strong></div>
        <div>Detected: <strong style="color: #059669; text-transform: capitalize;">${detectedCategory.label || detectedCategory.category}</strong></div>
        <div style="font-size: 0.8rem; color: #666; margin-top: 2px;">Confidence: ${(topResult.probability * 100).toFixed(1)}%</div>
      `;

      // 5. GENUINENESS CHECK (Basic)
      const isPerson = predictions.some(p =>
        p.className.includes('person') ||
        p.className.includes('human') ||
        p.className.includes('selfie') ||
        p.className.includes('face')
      );

      if (isPerson) {
        statusEl.innerHTML += `
          <div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #bbf7d0; color: #b45309;">
            ⚠️ <strong>Warning:</strong> This looks like a person, not waste. <br>Please upload a clear photo of the trash.
          </div>
        `;
      }

    } else {
      statusEl.innerHTML = '❓ AI could not identify this image. Classified as "Other".';
      if (catInput) catInput.value = 'other';
    }

  } catch (error) {
    console.error('AI Analysis Error:', error);
    statusEl.innerHTML = '⚠️ AI Error. Please continue manual submission.';
    if (catInput) catInput.value = 'other';
  }
}

// Map MobileNet classes to GreenCredits Categories
function mapPredictionsToCategory(predictions) {
  const text = predictions.map(p => p.className.toLowerCase()).join(' ');

  if (text.match(/bottle|plastic|cup|container|tupperware|nylon|polyester/)) return { category: 'plastic', label: 'Plastic 🥤' };
  if (text.match(/paper|carton|cardboard|book|newspaper|tissue|envelope/)) return { category: 'paper', label: 'Paper 📄' };
  if (text.match(/can|tin|metal|aluminum|iron|steel|foil/)) return { category: 'metal', label: 'Metal 🥫' };
  if (text.match(/glass|jar|vase|mirror|window/)) return { category: 'glass', label: 'Glass 🍷' };
  if (text.match(/fruit|vegetable|food|bread|banana|apple|orange|organic|leaf|plant/)) return { category: 'organic', label: 'Organic 🍌' };
  if (text.match(/computer|phone|screen|monitor|keyboard|mouse|electronic|radio|tv/)) return { category: 'ewaste', label: 'E-Waste 🔋' };

  return { category: 'other', label: 'Unclassified Waste 🗑️' };
}

function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    modal.style.display = 'flex';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('active');
    setTimeout(() => {
      modal.style.display = 'none';
    }, 300);
  }
}

function showNotification(message, type = 'info') {
  // Remove existing notifications
  document.querySelectorAll('.notification').forEach(n => n.remove());

  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;

  const icon = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  }[type] || 'ℹ️';

  notification.innerHTML = `<span class="notification-icon">${icon}</span><span>${message}</span>`;

  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    max-width: 400px;
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 500;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// ============================================
// ANIMATIONS & STYLES
// ============================================

const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .hidden {
    display: none !important;
  }
  
  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    color: var(--gray-600);
  }
  
  .empty-state p {
    margin-bottom: 1rem;
    font-size: 1.1rem;
  }
  
  .empty-state p:first-child {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .loader {
    text-align: center;
    padding: 2rem;
    color: var(--gray-500);
    font-style: italic;
  }
  
  .report-location {
    font-size: 0.9rem;
    color: var(--gray-600);
    margin-top: 0.5rem;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }
`;
document.head.appendChild(style);

console.log('✅ GreenCredits script loaded successfully');

// ============================================
// 🎉 ENHANCED FEATURES: STREAK + POPUP + IMPACT  
// ============================================

// ========== SUCCESS POPUP ==========
function showSuccessPopup(data) {
  const popup = document.createElement('div');
  popup.className = 'success-popup-overlay';
  popup.innerHTML = `
    <div class="success-popup animate-in">
      <div class="confetti">🎉</div>
      <h2>🎊 REPORT SUBMITTED!</h2>
      
      <div class="rewards-earned">
        <div class="reward-item">
          <span class="reward-icon">💰</span>
          <span class="reward-value">${data.creditsEarned || 0} Credits</span>
        </div>
        
        <div class="reward-item">
          <span class="reward-icon">🏆</span>
          <span class="reward-value">Report #${data.reportId || 'N/A'}</span>
        </div>
      </div>
      
      <div class="total-credits">
        <div class="total-label">Pending Verification</div>
        <div class="total-value">${data.creditsEarned || 0} Credits</div>
        <div class="total-rupees">(₹${((data.creditsEarned || 0) / 10).toFixed(1)} value)</div>
      </div>
      
      <div class="transaction-reciept" style="margin-top: 15px; font-size: 0.9rem; opacity: 0.8;">
        Credits will be added after worker verification.
      </div>

      <button onclick="closeSuccessPopup()" class="close-popup-btn">
        Continue ✨
      </button>
    </div>
  `;

  document.body.appendChild(popup);

  setTimeout(() => {
    if (document.querySelector('.success-popup-overlay')) {
      closeSuccessPopup();
    }
  }, 6000);
}

window.closeSuccessPopup = function () {
  const popup = document.querySelector('.success-popup-overlay');
  if (popup) {
    popup.querySelector('.success-popup').classList.add('animate-out');
    setTimeout(() => {
      popup.remove();
      loadUserCredits();
      loadMyReports();
    }, 300);
  }
};

// ========== HOOK INTO REPORT SUBMISSION ==========
// 🗑️ REMOVED REDUNDANT SUBMIT HANDLER
// The main handleReportSubmit() function at line 400 is the correct one.
// This block was overriding it with old, broken logic.
console.log('🚀 Main Submit Handler should run now.');




// Listen for successful submissions
document.addEventListener('reportSubmitted', (event) => {
  if (event.detail && event.detail.success) {
    showSuccessPopup(event.detail);
  }
});

// ========== ADD ENHANCED STYLES ==========
if (!document.getElementById('enhancedFeaturesStyles')) {
  const enhancedStyles = document.createElement('style');
  enhancedStyles.id = 'enhancedFeaturesStyles';
  enhancedStyles.textContent = `
/* Success Popup */
.success-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s;
}

.success-popup {
  background: white;
  border-radius: 20px;
  padding: 30px 25px;  /* Reduced padding */
  max-width: 420px;    /* Smaller width */
  width: 90%;
  text-align: center;
  box-shadow: 0 25px 75px rgba(0,0,0,0.5);
  max-height: 90vh;    /* Limit height */
  overflow-y: auto;    /* Scroll if needed */
}


.animate-in {
  animation: scaleIn 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.animate-out {
  animation: scaleOut 0.3s ease-in-out;
}

@keyframes scaleIn {
  from { transform: scale(0.3) rotate(-10deg); opacity: 0; }
  to { transform: scale(1) rotate(0deg); opacity: 1; }
}

@keyframes scaleOut {
  from { transform: scale(1); opacity: 1; }
  to { transform: scale(0.5); opacity: 0; }
}

.confetti {
  font-size: 3.5rem;
  animation: bounce 0.8s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-25px) rotate(-5deg); }
  75% { transform: translateY(-15px) rotate(5deg); }
}

.success-popup h2 {
  color: #10b981;
  margin: 15px 0;
  font-size: 1.8rem;
  font-weight: 900;
}

.rewards-earned {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin: 30px 0;
}

.reward-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 18px;
  background: #f9fafb;
  border-radius: 15px;
  transition: all 0.3s;
}

.reward-item:hover {
  transform: translateX(8px);
  background: #f3f4f6;
}



.reward-icon {
  font-size: 2.5rem;
}

.reward-value {
  font-size: 1.3rem;
  font-weight: 700;
}

.total-credits {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  padding: 25px;
  border-radius: 20px;
  margin: 20px 0;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
}

.total-label {
  font-size: 1rem;
  opacity: 0.95;
  margin-bottom: 8px;
  font-weight: 600;
}

.total-value {
  font-size: 2.5rem;
  font-weight: 900;
  margin: 10px 0;
  text-shadow: 0 2px 10px rgba(0,0,0,0.2);
}

.total-rupees {
  font-size: 1.2rem;
  opacity: 0.95;
}

.close-popup-btn {
  background: #10b981;
  color: white;
  border: none;
  padding: 18px 45px;
  border-radius: 15px;
  font-size: 1.2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 20px;
  box-shadow: 0 5px 15px rgba(16, 185, 129, 0.3);
}

.close-popup-btn:hover {
  background: #059669;
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(16, 185, 129, 0.4);
}

@media (max-width: 768px) {
  .success-popup {
    padding: 30px 20px;
    width: 95%;
  }
  
  .success-popup h2 {
    font-size: 1.8rem;
  }
  
  .total-value {
    font-size: 2.5rem;
  }
}
  `;
  document.head.appendChild(enhancedStyles);
}


// ============================================
// 🎁 REWARDS STORE SYSTEM
// ============================================

let REWARDS_CATALOG = [];

async function loadRewardsStore() {
  try {
    // 1. Fetch User Credits
    const creditRes = await fetch('/api/credits');
    const creditData = await creditRes.json();
    if (creditData.success) {
      document.getElementById('rewardsBalance').textContent = creditData.credits.available;
    }

    // 2. Fetch Rewards Catalog
    const rewardRes = await fetch('/api/rewards');
    const rewardData = await rewardRes.json();

    if (rewardData.success) {
      REWARDS_CATALOG = rewardData.rewards;
      renderRewards('all');
    } else {
      document.getElementById('rewardsGrid').innerHTML = '<p class="error-state">Failed to load rewards.</p>';
    }

  } catch (error) {
    console.error('Error loading rewards:', error);
  }

  // category buttons listener
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderRewards(this.dataset.category);
    });
  });
}

function renderRewards(category) {
  const grid = document.getElementById('rewardsGrid');
  const filtered = category === 'all' ? REWARDS_CATALOG : REWARDS_CATALOG.filter(r => r.category === category);

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="no-rewards">No rewards in this category yet.</p>';
    return;
  }

  grid.innerHTML = filtered.map(reward => `
    <div class="reward-card">
      <div class="reward-icon">${reward.icon}</div>
      <h3 class="reward-name">${reward.name}</h3>
      <p class="reward-desc">${reward.description}</p>
      <div class="reward-footer">
        <div class="reward-cost">
          <span class="cost-label">Cost:</span>
          <span class="cost-value">${reward.cost} credits</span>
        </div>
        <div class="reward-stock">${reward.stock}</div>
      </div>
      <button onclick="redeemReward('${reward.id}', ${reward.cost}, '${reward.name}')" class="btn-redeem">
        Redeem Now
      </button>
    </div>
  `).join('');
}

// ============================================
// 🎁 REDEEM REWARD WITH BEAUTIFUL MODAL
// ============================================

window.redeemReward = async function (rewardId, cost, name) {
  try {
    // Get fresh credits from server
    const response = await fetch('/api/credits', { credentials: 'include' });
    const data = await response.json();

    if (!data.success) {
      alert('Failed to check credits');
      return;
    }

    const available = data.credits.available;
    const total = data.credits.total;
    const redeemed = data.credits.redeemed || (total - available);

    // Check if enough credits
    if (available < cost) {
      showInsufficientCreditsModal(available, cost, name);
      return;
    }

    // Show beautiful confirmation modal
    const confirmed = await showConfirmationModal(name, cost, available, total, redeemed);

    if (!confirmed) return;

    // Redeem the reward
    const redeemResponse = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ rewardId }) // Server handles cost & name lookup
    });

    const result = await redeemResponse.json();

    if (result.success) {
      // Show success popup immediately
      showRedemptionSuccess(name, cost, result.newBalance);

      // Refresh ALL credit displays
      await loadUserCredits(); // Updates header & localStorage

      // Update rewards specific balance if visible
      const rewardsBalance = document.getElementById('rewardsBalance');
      if (rewardsBalance) {
        rewardsBalance.textContent = result.newBalance;
      }

      // Update Bank Statement if visible
      if (document.getElementById('transactionsList')) {
        loadTransactions();
      }

      setTimeout(() => {
        if (typeof loadRewardsStore === 'function') loadRewardsStore();
      }, 2000);
    } else {
      alert('❌ ' + (result.error || 'Redemption failed'));
    }
  } catch (error) {
    console.error('Redemption error:', error);
    alert('❌ Failed to redeem reward. Please try again.');
  }
};

// ============================================
// 🎨 BEAUTIFUL CONFIRMATION MODAL
// ============================================

function showConfirmationModal(rewardName, cost, available, total, redeemed) {
  return new Promise((resolve) => {
    const modal = document.createElement('div');
    modal.id = 'confirmRedeemModal';
    modal.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(5px);
      display: flex; align-items: center; justify-content: center;
      z-index: 99999; animation: fadeIn 0.2s;
    `;

    modal.innerHTML = `
      <style>
        @keyframes fadeIn { from {opacity:0} to {opacity:1} }
        @keyframes slideUp { from {transform:translateY(20px);opacity:0} to {transform:translateY(0);opacity:1} }
        
        .mini-modal {
          background: white;
          border-radius: 16px;
          max-width: 340px;
          width: 88%;
          animation: slideUp 0.25s ease;
          box-shadow: 0 15px 40px rgba(0,0,0,0.25);
          overflow: hidden;
        }
        
        .mini-header {
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 14px;
          text-align: center;
        }
        
        .mini-icon { font-size: 2.2rem; margin-bottom: 4px; }
        .mini-title { color: white; font-size: 1.1rem; font-weight: 800; margin: 0 0 2px 0; }
        .mini-subtitle { color: rgba(255,255,255,0.95); font-size: 0.8rem; font-weight: 600; margin: 0; }
        
        .mini-body { padding: 14px; }
        
        .mini-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-bottom: 10px;
          padding: 10px;
          background: #f9fafb;
          border-radius: 10px;
        }
        
        .mini-stat { text-align: center; }
        .mini-stat-label { font-size: 0.65rem; color: #6b7280; font-weight: 600; margin-bottom: 3px; text-transform: uppercase; }
        .mini-stat-value { font-size: 1.3rem; font-weight: 900; }
        .green { color: #10b981; }
        .orange { color: #f59e0b; }
        
        .mini-balance {
          background: linear-gradient(135deg, #dbeafe, #bfdbfe);
          border: 2px solid #3b82f6;
          border-radius: 10px;
          padding: 10px;
          text-align: center;
          margin-bottom: 10px;
        }
        .mini-balance-label { font-size: 0.65rem; color: #1e40af; font-weight: 700; margin-bottom: 4px; text-transform: uppercase; }
        .mini-balance-value { font-size: 1.8rem; font-weight: 900; color: #3b82f6; line-height: 1; }
        
        .mini-cost {
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 10px;
          padding: 10px;
          text-align: center;
          margin-bottom: 10px;
          box-shadow: 0 4px 15px rgba(16,185,129,0.25);
        }
        .mini-cost-label { font-size: 0.7rem; color: rgba(255,255,255,0.95); font-weight: 600; margin-bottom: 4px; }
        .mini-cost-value { font-size: 1.8rem; font-weight: 900; color: white; line-height: 1; }
        
        .mini-result {
          background: #fef3c7;
          border: 2px solid #fbbf24;
          border-radius: 10px;
          padding: 10px;
          text-align: center;
          margin-bottom: 12px;
        }
        .mini-result-label { font-size: 0.7rem; color: #92400e; font-weight: 700; margin-bottom: 4px; }
        .mini-result-value { font-size: 1.4rem; font-weight: 900; color: #92400e; line-height: 1; }
        
        .mini-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        
        .mini-btn {
          padding: 10px;
          border: none;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.15s;
        }
        
        .mini-btn-cancel {
          background: #f3f4f6;
          color: #374151;
          border: 2px solid #e5e7eb;
        }
        .mini-btn-cancel:hover { background: #e5e7eb; }
        
        .mini-btn-confirm {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          box-shadow: 0 2px 8px rgba(16,185,129,0.3);
        }
        .mini-btn-confirm:hover { box-shadow: 0 3px 12px rgba(16,185,129,0.4); }
      </style>
      
      <div class="mini-modal">
        <div class="mini-header">
          <div class="mini-icon">🎁</div>
          <h4 class="mini-title">Confirm Redemption</h4>
          <p class="mini-subtitle">${rewardName}</p>
        </div>
        
        <div class="mini-body">
          <div class="mini-stats">
            <div class="mini-stat">
              <div class="mini-stat-label">Total Earned</div>
              <div class="mini-stat-value green">${total}</div>
            </div>
            <div class="mini-stat">
              <div class="mini-stat-label">Already Redeemed</div>
              <div class="mini-stat-value orange">${redeemed}</div>
            </div>
          </div>
          
          <div class="mini-balance">
            <div class="mini-balance-label">Available Balance</div>
            <div class="mini-balance-value">${available}</div>
          </div>
          
          <div class="mini-cost">
            <div class="mini-cost-label">This Reward Costs</div>
            <div class="mini-cost-value">-${cost}</div>
          </div>
          
          <div class="mini-result">
            <div class="mini-result-label">Balance After Redemption</div>
            <div class="mini-result-value">${available - cost} Credits</div>
          </div>
          
          <div class="mini-buttons">
            <button class="mini-btn mini-btn-cancel" id="cancelBtn">Cancel</button>
            <button class="mini-btn mini-btn-confirm" id="confirmBtn">Confirm</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    document.getElementById('cancelBtn').onclick = () => {
      modal.remove();
      resolve(false);
    };

    document.getElementById('confirmBtn').onclick = () => {
      modal.remove();
      resolve(true);
    };

    modal.onclick = (e) => {
      if (e.target === modal) {
        modal.remove();
        resolve(false);
      }
    };
  });
}



// ============================================
// ❌ INSUFFICIENT CREDITS MODAL
// ============================================

function showInsufficientCreditsModal(available, cost, rewardName) {
  const modal = document.createElement('div');
  modal.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.85); display: flex; align-items: center;
    justify-content: center; z-index: 99999; animation: fadeIn 0.3s;
  `;

  modal.innerHTML = `
    <style>
      @keyframes fadeIn { from {opacity:0} to {opacity:1} }
      @keyframes slideUp { from {transform:translateY(30px);opacity:0} to {transform:translateY(0);opacity:1} }
    </style>
    <div style="background:white; border-radius:20px; padding:40px; max-width:450px; width:90%; text-align:center; animation:slideUp 0.5s; box-shadow:0 20px 60px rgba(0,0,0,0.5);">
      <div style="font-size:5rem; margin-bottom:20px;">😢</div>
      <h2 style="margin:0 0 15px 0; color:#ef4444; font-size:1.8rem;">Insufficient Credits</h2>
      <p style="color:#6b7280; font-size:1.1rem; margin-bottom:25px;">
        You don't have enough credits to redeem <strong>${rewardName}</strong>
      </p>
      
      <div style="background:#fef2f2; border:2px solid #fecaca; padding:20px; border-radius:15px; margin-bottom:25px;">
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; text-align:center;">
          <div>
            <div style="font-size:0.85rem; color:#991b1b; margin-bottom:5px;">You Have</div>
            <div style="font-size:2.5rem; font-weight:900; color:#dc2626;">${available}</div>
          </div>
          <div>
            <div style="font-size:0.85rem; color:#991b1b; margin-bottom:5px;">You Need</div>
            <div style="font-size:2.5rem; font-weight:900; color:#10b981;">${cost}</div>
          </div>
        </div>
        <div style="margin-top:15px; padding-top:15px; border-top:2px solid white;">
          <div style="font-size:0.9rem; color:#991b1b;">Need ${cost - available} more credits</div>
        </div>
      </div>
      
      <p style="color:#6b7280; font-size:0.95rem; margin-bottom:25px;">
        💡 Keep reporting environmental issues to earn more credits!
      </p>
      
      <button onclick="this.closest('div[style*=position]').remove()" style="
        background:linear-gradient(135deg,#10b981,#059669); color:white;
        border:none; padding:15px 40px; border-radius:10px; font-size:1.1rem;
        font-weight:600; cursor:pointer; transition:all 0.2s;
      " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
        OK, Got It!
      </button>
    </div>
  `;

  document.body.appendChild(modal);

  modal.onclick = (e) => {
    if (e.target === modal) modal.remove();
  };
}





// Initialize on page load
document.addEventListener('DOMContentLoaded', function () {
  const rewardsTab = document.querySelector('[data-tab="rewards"]');
  if (rewardsTab) {
    rewardsTab.addEventListener('click', loadRewardsStore);
  }
});

console.log('✅ Rewards system loaded');
console.log('✅ Enhanced features loaded: Success Popup');

console.log('✅ Streak widget auto-injector loaded');

// ============================================
// 🎉 BEAUTIFUL REDEMPTION SUCCESS POPUP
// ============================================

// ============================================
// 🎉 BEAUTIFUL REDEMPTION SUCCESS POPUP
// ============================================

function showRedemptionSuccess(rewardName, cost, newBalance) {
  // Remove existing popup if any
  const existing = document.getElementById('redemptionSuccessPopup');
  if (existing) existing.remove();

  // Create popup overlay
  const overlay = document.createElement('div');
  overlay.id = 'redemptionSuccessPopup';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    animation: fadeIn 0.3s ease;
  `;

  // Create popup card
  const popup = document.createElement('div');
  popup.style.cssText = `
    background: white;
    border-radius: 20px;
    padding: 40px;
    max-width: 500px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    animation: slideUp 0.5s ease;
    position: relative;
  `;

  popup.innerHTML = `
    <style>
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      @keyframes slideUp {
        from { transform: translateY(50px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      @keyframes confetti {
        0% { transform: translateY(0) rotate(0deg); opacity: 1; }
        100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
      }
      .confetti {
        position: absolute;
        width: 10px;
        height: 10px;
        background: #10b981;
        animation: confetti 3s ease-out forwards;
      }
    </style>
    
    <!-- Confetti elements -->
    ${[...Array(20)].map((_, i) => `
      <div class="confetti" style="
        left: ${Math.random() * 100}%;
        top: -20px;
        background: ${['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)]};
        animation-delay: ${Math.random() * 0.5}s;
      "></div>
    `).join('')}
    
    <div style="font-size: 5rem; margin-bottom: 20px;">✅</div>
    
    <h2 style="color: #10b981; margin: 0 0 10px 0; font-size: 2rem;">
      Redeemed Successfully!
    </h2>
    
    <p style="font-size: 1.2rem; color: #374151; margin: 10px 0;">
      <strong>${rewardName}</strong>
    </p>
    
    <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 15px; margin: 20px 0;">
      <p style="margin: 0; font-size: 0.9rem; opacity: 0.9;">Credits Used</p>
      <p style="margin: 5px 0; font-size: 2.5rem; font-weight: 900;">-${cost}</p>
    </div>
    
    <div style="background: #f3f4f6; padding: 15px; border-radius: 10px; margin: 20px 0;">
      <p style="margin: 0; font-size: 0.9rem; color: #6b7280;">New Balance</p>
      <p style="margin: 5px 0; font-size: 2rem; font-weight: 700; color: #10b981;">${newBalance} Credits</p>
    </div>
    
    <p style="color: #374151; font-size: 1.3rem; font-weight: 700; margin: 20px 0;">
      🎁 Your reward will be delivered via email within 24 hours!
    </p>
    
    <button 
      onclick="document.getElementById('redemptionSuccessPopup').remove()"
      style="
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        border: none;
        padding: 15px 40px;
        border-radius: 10px;
        font-size: 1.1rem;
        font-weight: 600;
        cursor: pointer;
        margin-top: 10px;
        transition: transform 0.2s;
      "
      onmouseover="this.style.transform='scale(1.05)'"
      onmouseout="this.style.transform='scale(1)'"
    >
      OK
    </button>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Auto-close after 5 seconds
  setTimeout(() => {
    if (overlay.parentNode) {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 300);
    }
  }, 5000);
}




// ============================================
// ⚡ REAL-TIME UPDATES (Socket.io)
// ============================================

const socket = io();

// Join specific room if needed (optional implementation)
// socket.emit('joinUserRoom', currentUser._id); 

socket.on('connect', () => {
  console.log('⚡ Connected to real-time server');
});

socket.on('reportUpdated', (data) => {
  console.log('⚡ Report Updated:', data);

  // 1. Find the report card
  const reportCard = document.getElementById(`report-${data.reportId}`);

  if (reportCard) {
    // 2. Update Status Badge
    const statusBadgeContainer = reportCard.querySelector('.report-status');
    if (statusBadgeContainer) {
      statusBadgeContainer.innerHTML = `<span class="status-badge status-${data.status}">${data.status}</span>`;

      // Add animation to show update
      statusBadgeContainer.style.transition = 'transform 0.3s';
      statusBadgeContainer.style.transform = 'scale(1.2)';
      setTimeout(() => statusBadgeContainer.style.transform = 'scale(1)', 300);
    }

    // 3. If resolved, show completion details if available
    if (data.status === 'resolved') {
      // We could fetch the fresh report details here, or just show a notification
      showNotification(`Report #${data.reportId} has been resolved! You earned credits! 🎉`, 'success');

      // Refresh credits
      loadUserCredits();

      // Refresh report list to show photos/notes if proper re-render is needed
      if (typeof loadMyReports === 'function') {
        loadMyReports();
      }
    } else {
      showNotification(`Report #${data.reportId} is now ${data.status}`, 'info');
    }
  }
});

// ============================================
// 👁️ PASSWORD TOGGLE
// ============================================

window.togglePasswordVisibility = function (inputId, icon) {
  const input = document.getElementById(inputId);
  if (input.type === 'password') {
    input.type = 'text';
    icon.textContent = '🙈'; // Monkey covering eyes (hidden state implication, or just open eye slashed?) 
    // actually open eye is usually 'text' mode, closed is 'password'. 
    // But the emoji 👁️ implies "Show". 
    // Let's use:
    icon.textContent = '🔒'; // Unlock? Or 🐵? 
    // Let's stick to text or standard.
    icon.textContent = '🙈';
  } else {
    input.type = 'password';
    icon.textContent = '👁️';
  }
};

// ============================================
// 📷 LIVE CAMERA SYSTEM
// ============================================

let currentStream = null;
let useFrontCamera = false;

function initCameraSystem() {
  const startBtn = document.getElementById('startCameraBtn');
  const captureBtn = document.getElementById('captureBtn');
  const switchBtn = document.getElementById('switchCameraBtn');

  if (startBtn) startBtn.addEventListener('click', () => openCameraModal());
  if (captureBtn) captureBtn.addEventListener('click', capturePhoto);
  if (switchBtn) switchBtn.addEventListener('click', switchCamera);

  // Check if multiple cameras exist to show switch button
  navigator.mediaDevices.enumerateDevices().then(devices => {
    const videoInputs = devices.filter(device => device.kind === 'videoinput');
    if (videoInputs.length > 1 && switchBtn) {
      switchBtn.style.display = 'block';
    }
  });
}

// Hook into initialization
document.addEventListener('DOMContentLoaded', initCameraSystem);


async function openCameraModal() {
  const modal = document.getElementById('cameraModal');
  modal.style.display = 'block';
  await startCamera();

  // Handle close button specifically to stop stream
  const closeBtn = modal.querySelector('.close-btn');
  closeBtn.onclick = () => {
    closeModal('cameraModal');
    stopCamera();
  }
}

async function startCamera() {
  const video = document.getElementById('cameraFeed');
  const constraints = {
    video: {
      facingMode: useFrontCamera ? 'user' : 'environment',
      width: { ideal: 1280 },
      height: { ideal: 720 }
    }
  };

  try {
    if (currentStream) {
      stopCamera();
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    currentStream = stream;
    video.srcObject = stream;
    video.play();
  } catch (err) {
    console.error("Camera Error:", err);
    alert("Unable to access camera. Please allow permissions.");
    closeModal('cameraModal');
  }
}

function stopCamera() {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
    currentStream = null;
  }
}

function switchCamera() {
  useFrontCamera = !useFrontCamera;
  startCamera();
}

function capturePhoto() {
  const video = document.getElementById('cameraFeed');
  const canvas = document.getElementById('cameraCanvas');
  const photoInput = document.getElementById('photoInput');
  const preview = document.getElementById('photoPreview');

  if (!video || !canvas) return;

  // Set canvas dimensions to match video
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw frame
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert to Blob/File
  canvas.toBlob((blob) => {
    // Create a file from the blob
    const file = new File([blob], `camera_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });

    // Use DataTransfer to simulate file input selection
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    photoInput.files = dataTransfer.files;

    // Trigger generic file handling (preview + AI)
    // We create a synthetic 'change' event
    const event = new Event('change', { bubbles: true });
    photoInput.dispatchEvent(event);

    // Close modal
    closeModal('cameraModal');
    stopCamera();

    // Force scroll to preview
    document.getElementById('imagePreviewContainer').scrollIntoView({ behavior: 'smooth' });

  }, 'image/jpeg', 0.9);
}

// ==========================================
// 🌍 PUBLIC HEATMAP INITIALIZATION
// ==========================================
async function initHeatmap() {
  const mapContainer = document.getElementById('impactMap');
  if (!mapContainer) return;

  console.log('🌍 Initializing Impact Heatmap...');

  // Default Center: Gonda City
  const map = L.map('impactMap').setView([27.1324, 81.9669], 13);

  // 🗺️ BASE LAYERS
  const streetMap = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '© Google Maps'
  });

  const satelliteMap = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '© Google Maps Satellite'
  });

  // Start with Street Map
  streetMap.addTo(map);

  // Add Layer Control
  L.control.layers({
    "Street Map": streetMap,
    "Satellite View": satelliteMap
  }).addTo(map);

  try {
    const response = await fetch('/api/stats/heatmap');
    const json = await response.json();

    if (json.success && json.data.length > 0) {
      console.log(`🌍 Loaded ${json.data.length} data points for heatmap`);

      // 1. Add Heat Gradient Layer (Subtle Background)
      const heatPoints = json.data.map(p => [p.lat, p.lng, 0.5]); // Fixed intensity to 0.5 constant
      L.heatLayer(heatPoints, {
        radius: 30,
        blur: 20,
        maxZoom: 12,
        gradient: { 0.4: 'blue', 0.6: 'cyan', 0.7: 'lime', 0.8: 'yellow', 1.0: 'red' }
      }).addTo(map);

      // 2. 🟢 CUSTOM CLUSTER LOGIC
      const markers = L.markerClusterGroup({
        showCoverageOnHover: false,
        maxClusterRadius: 40,
        iconCreateFunction: function (cluster) {
          const count = cluster.getChildCount();
          let c = ' custom-cluster-small';
          if (count > 10) c = ' custom-cluster-medium';
          if (count > 20) c = ' custom-cluster-large';

          return L.divIcon({
            html: `<span>${count}</span>`, // Explicit string with span
            className: 'custom-cluster' + c,
            iconSize: [40, 40], // Slightly larger for visibility
            iconAnchor: [20, 20] // Center anchor
          });
        }
      });

      json.data.forEach(point => {
        let color = '#ef4444'; // Red
        if (point.status === 'resolved') color = '#f59e0b'; // Orange
        if (point.status === 'verified') color = '#10b981'; // Green

        // Create a custom colored marker for individual points
        const marker = L.circleMarker([point.lat, point.lng], {
          radius: 8,
          fillColor: color,
          color: "#fff",
          weight: 2,
          opacity: 1,
          fillOpacity: 1
        }).bindPopup(`
            <div style="text-align:center; color:#333; font-family: sans-serif; min-width: 120px;">
                <strong style="color:${color}; font-size: 1.1em;">${point.status.toUpperCase()}</strong><br>
                <div style="margin: 5px 0; font-size: 0.9em; color: #555;">
                   ${point.wasteType || 'General Waste'}
                </div>
                <div style="font-size: 0.8em; color: #888;">
                    📅 ${point.date ? new Date(point.date).toLocaleDateString() : 'Just now'}
                </div>
            </div>
        `);

        markers.addLayer(marker);
      });

      // Add the cluster group to the map
      map.addLayer(markers);

      // 3. 🗺️ ADD LEGEND CONTROL
      const legend = L.control({ position: 'bottomright' });

      legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.innerHTML = `
              <strong>Report Status</strong><br>
              <i style="background: #ef4444"></i> Pending<br>
              <i style="background: #f59e0b"></i> Resolved<br>
              <i style="background: #22c55e"></i> Verified<br>
              <hr style="margin:5px 0; border:0; border-top:1px solid #eee;">
              <small>Click circles to see details</small>
          `;
        return div;
      };

      legend.addTo(map);
    }
  } catch (error) {
    console.error('Failed to load heatmap:', error);
  }
}

// Start Heatmap when page loads
// Start Heatmap when page AND resources are fully loaded
window.addEventListener('load', () => {
  console.log("🚀 Window Loaded - Starting Heatmap Init");
  setTimeout(initHeatmap, 500); // Small delay to ensure layout is settled
});
