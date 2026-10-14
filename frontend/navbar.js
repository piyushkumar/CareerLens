
/*
 * CareerLens Shared Navbar
 *
 * Responsibilities:
 * 1. Verify the user's JWT with the FastAPI backend.
 * 2. Show Login to guests.
 * 3. Show the avatar and username to logged-in users.
 * 4. Open and close the account dropdown.
 * 5. Log out the user safely.
 */

// FastAPI endpoint used to verify the current user.
const NAVBAR_AUTH_API = 'http://127.0.0.1:8000/api/auth/me';

// Update the navbar after checking authentication.
async function updateNavbarAuth() {
  // Find the desktop navbar elements.
  const loginLink = document.getElementById('login-nav');
  const accountContainer = document.getElementById('authenticated-nav');
  const accountTrigger = document.getElementById('account-trigger');
  const accountMenu = document.getElementById('account-menu');
  const userName = document.getElementById('nav-user-name');
  const avatar = document.getElementById('nav-avatar');

  // Stop if the required navbar HTML is missing.
  if (!loginLink || !accountContainer || !userName || !avatar) {
    console.warn('CareerLens navbar elements are missing.');
    return;
  }

  // Hide both options while authentication is checked.
  loginLink.hidden = true;
  accountContainer.hidden = true;

  // Read the token saved by login.js in this browser tab.
  const token = sessionStorage.getItem('access_token');

  // If no token exists, show Login.
  if (!token) {
    loginLink.hidden = false;
    return;
  }

  try {
    // Ask the backend to verify the saved token.
    const response = await fetch(NAVBAR_AUTH_API, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // If the token is invalid or expired, clear the session.
    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('current_user');

      loginLink.hidden = false;
      return;
    }

    // Treat other unsuccessful responses as errors.
    if (!response.ok) {
      throw new Error(`Authentication failed: HTTP ${response.status}`);
    }

    // Read the verified user's profile.
    const user = await response.json();

    // Check that the backend returned the necessary user details.
    if (!user || !user.id || !user.email) {
      throw new Error('User details are missing from the API response.');
    }

    // Use the user's name, or a fallback if it is empty.
    const name = (user.full_name || 'My Profile').trim();

    // Display the user's name and first initial.
    userName.textContent = name;
    avatar.textContent = name.charAt(0).toUpperCase();

    // Show the authenticated account controls.
    loginLink.hidden = true;
    accountContainer.hidden = false;

    // Keep the dropdown closed initially.
    if (accountMenu) accountMenu.hidden = true;

    if (accountTrigger) {
      accountTrigger.setAttribute('aria-expanded', 'false');
    }

    // Save public profile information for other frontend features.
    sessionStorage.setItem(
      'current_user',
      JSON.stringify({
        id: user.id,
        full_name: user.full_name,
        email: user.email
      })
    );

  } catch (error) {
    // Do not treat a backend connection failure as successful login.
    console.error('Could not verify CareerLens authentication:', error);

    // Keep the Login option available so the user can try again.
    loginLink.hidden = false;
    accountContainer.hidden = true;
  }
}

// Set up dropdown and logout interactions.
function setupNavbarEvents() {
  const accountTrigger = document.getElementById('account-trigger');
  const accountMenu = document.getElementById('account-menu');
  const logoutButton = document.getElementById('nav-logout');

  // Open or close the dropdown when the account button is clicked.
  if (accountTrigger && accountMenu) {
    accountTrigger.addEventListener('click', () => {
      const isOpen =
        accountTrigger.getAttribute('aria-expanded') === 'true';

      accountTrigger.setAttribute('aria-expanded', String(!isOpen));
      accountMenu.hidden = isOpen;
    });

    // Close the dropdown when clicking outside it.
    document.addEventListener('click', event => {
      if (!event.target.closest('#authenticated-nav')) {
        accountMenu.hidden = true;
        accountTrigger.setAttribute('aria-expanded', 'false');
      }
    });

    // Close the dropdown when Escape is pressed.
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        accountMenu.hidden = true;
        accountTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Clear the local login session and return to the dashboard.
  function logout() {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('current_user');

    window.location.href = 'home.html';
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', logout);
  }
}

// Start the shared navbar after the HTML has loaded.
document.addEventListener('DOMContentLoaded', () => {
  setupNavbarEvents();
  updateNavbarAuth();
});
