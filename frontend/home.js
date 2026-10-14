
/*
 * CareerLens dashboard authentication and navigation.
 * FastAPI verifies the JWT before a user is treated as logged in.
 */

const CURRENT_USER_API_URL = 'http://127.0.0.1:8000/api/auth/me';

// Only these feature pages can be opened through protected links.
const ALLOWED_FEATURE_PAGES = new Set([
  'career-recommendations.html',
  'resume-analysis.html',
  'skill-gap-analysis.html',
  'learning-roadmap.html',
  'profile-review.html'
]);

// Dashboard elements.
const menuToggle = document.querySelector('#menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
const profileButton = document.querySelector('#profile-button');
const profileMenu = document.querySelector('#profile-menu');
const logoutButton = document.querySelector('#logout-button');
const mobileLogoutButton = document.querySelector('#mobile-logout-button');
const guestActions = document.querySelector('#guest-actions');
const authenticatedActions = document.querySelector('#authenticated-actions');
const welcomeHeading = document.querySelector('#welcome-heading');
const welcomeCopy = document.querySelector('#welcome-copy');
const profileLabel = document.querySelector('#profile-label');
const avatar = document.querySelector('#avatar');

// Current verified user.
let sessionUser = null;

// Tracks whether the first authentication check has completed.
let dashboardReady = false;
let dashboardInitPromise = null;

/*
 * Verify the JWT with FastAPI.
 * Never rely only on the cached current_user value.
 */
async function getSessionUser() {
  const token = sessionStorage.getItem('access_token');

  if (!token) {
    sessionStorage.removeItem('current_user');
    return null;
  }

  try {
    const response = await fetch(CURRENT_USER_API_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // The token is invalid or expired.
    if (!response.ok) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('current_user');
      return null;
    }

    const user = await response.json();

    // Store only public user information.
    const verifiedUser = {
      id: user.id,
      name: user.full_name,
      email: user.email
    };

    sessionStorage.setItem(
      'current_user',
      JSON.stringify(verifiedUser)
    );

    return verifiedUser;

  } catch (error) {
    // A network failure does not necessarily mean the token is invalid.
    console.error('Could not verify CareerLens session:', error);
    return null;
  }
}

/*
 * Escape user-provided text before inserting it into HTML.
 */
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

/*
 * Update the dashboard according to authentication status.
 */
function renderAccessState(user) {
  const loggedIn = Boolean(user);

  document.body.dataset.authState = loggedIn
    ? 'authenticated'
    : 'guest';

  if (guestActions) {
    guestActions.hidden = loggedIn;
  }

  if (authenticatedActions) {
    authenticatedActions.hidden = !loggedIn;
  }

  if (welcomeHeading) {
    welcomeHeading.innerHTML = loggedIn
      ? `Welcome, ${escapeHtml(user.name || 'there')}<span class="welcome-name">.</span>`
      : 'Welcome to CareerLens<span class="welcome-name">.</span>';
  }

  if (welcomeCopy) {
    welcomeCopy.textContent = loggedIn
      ? 'Your career profile, recommendations, and learning plan — all in one place.'
      : 'Understand your skills, discover suitable career paths, and plan what to learn next.';
  }

  if (profileLabel) {
    profileLabel.textContent = loggedIn
      ? (user.name || 'My Profile')
      : 'My Profile';
  }

  if (avatar) {
    avatar.textContent = loggedIn
      ? (user.name || 'U').charAt(0).toUpperCase()
      : 'U';
  }

  // Show or hide mobile login and profile actions.
  document.querySelectorAll('.guest-mobile-login').forEach(element => {
    element.hidden = loggedIn;
  });

  document.querySelectorAll(
    '.authenticated-mobile-profile, #mobile-logout-button'
  ).forEach(element => {
    element.hidden = !loggedIn;
  });

  // Update the dashboard's feature status labels.
  document.querySelectorAll('.summary-card .status-pill').forEach(pill => {
    pill.textContent = loggedIn ? 'Available' : 'Login required';
  });
}

/*
 * Perform the first authentication check.
 */
async function initializeDashboard() {
  try {
    sessionUser = await getSessionUser();
    renderAccessState(sessionUser);
  } finally {
    dashboardReady = true;
  }
}

/*
 * Wait until the first authentication check finishes.
 */
async function waitForDashboardReady() {
  if (!dashboardReady) {
    if (!dashboardInitPromise) {
      dashboardInitPromise = initializeDashboard();
    }

    await dashboardInitPromise;
  }
}

/*
 * Get an approved feature destination from a link.
 */
function getSafeFeatureDestination(link) {
  const destination = link.dataset.destination;

  if (!destination || !ALLOWED_FEATURE_PAGES.has(destination)) {
    return null;
  }

  return destination;
}

/*
 * Protect all feature links.
 *
 * Guest:
 *   Click feature -> login.html?returnTo=feature.html
 *
 * Logged-in user:
 *   Click feature -> feature.html
 */
document.querySelectorAll('.gated-link').forEach(link => {
  link.addEventListener('click', async event => {
    event.preventDefault();

    const destination = getSafeFeatureDestination(link);

    if (!destination) {
      console.error('Invalid feature destination:', link);
      return;
    }

    await waitForDashboardReady();

    // Recheck the token when the feature is clicked.
    sessionUser = await getSessionUser();
    renderAccessState(sessionUser);

    if (sessionUser) {
      window.location.href = destination;
      return;
    }

    // Send the guest to login and preserve their requested feature.
    const loginUrl = new URL('login.html', window.location.href);
    loginUrl.searchParams.set('returnTo', destination);

    window.location.href = loginUrl.toString();
  });
});

/*
 * Mobile navigation toggle.
 */
if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const isOpen =
      menuToggle.getAttribute('aria-expanded') === 'true';

    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute(
      'aria-label',
      isOpen ? 'Open navigation' : 'Close navigation'
    );

    mobileNav.hidden = isOpen;
  });

  // Close the mobile menu after a link is clicked.
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.hidden = true;
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    });
  });
}

/*
 * Profile dropdown toggle.
 */
if (profileButton && profileMenu) {
  profileButton.addEventListener('click', () => {
    const isOpen =
      profileButton.getAttribute('aria-expanded') === 'true';

    profileButton.setAttribute('aria-expanded', String(!isOpen));
    profileMenu.hidden = isOpen;
  });

  // Close the dropdown when clicking outside.
  document.addEventListener('click', event => {
    if (
      !profileButton.contains(event.target) &&
      !profileMenu.contains(event.target)
    ) {
      profileMenu.hidden = true;
      profileButton.setAttribute('aria-expanded', 'false');
    }
  });
}

/*
 * Log out of the current browser-tab session.
 */
function logout() {
  sessionStorage.removeItem('access_token');
  sessionStorage.removeItem('current_user');

  window.location.href = 'index.html';
}

if (logoutButton) {
  logoutButton.addEventListener('click', logout);
}

if (mobileLogoutButton) {
  mobileLogoutButton.addEventListener('click', logout);
}

// Verify authentication as soon as the dashboard loads.
dashboardInitPromise = initializeDashboard();
