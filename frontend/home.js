/* CareerLens shared dashboard — guest-mode prototype.
   Authentication must be verified by the FastAPI backend before features unlock. */
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

function getSessionUser() {
  // This reads a placeholder only. Do not use localStorage as real authentication.
  // It will be replaced with a validated FastAPI session/token check.
  return null;
}

function renderAccessState() {
  const user = getSessionUser();
  const loggedIn = Boolean(user);
  document.body.dataset.authState = loggedIn ? 'authenticated' : 'guest';
  if (guestActions) guestActions.hidden = loggedIn;
  if (authenticatedActions) authenticatedActions.hidden = !loggedIn;
  if (welcomeHeading) welcomeHeading.innerHTML = loggedIn
    ? `Welcome, ${escapeHtml(user.name || '')}<span class="welcome-name">.</span>`
    : 'Welcome to CareerLens<span class="welcome-name">.</span>';
  if (welcomeCopy) welcomeCopy.textContent = loggedIn
    ? 'Your career profile, recommendations, and learning plan — all in one place.'
    : 'Understand your skills, discover suitable career paths, and plan what to learn next.';
  if (profileLabel && loggedIn) profileLabel.textContent = user.name || 'My Profile';
  if (avatar && loggedIn) avatar.textContent = (user.name || 'U').charAt(0).toUpperCase();
  document.querySelectorAll('.guest-mobile-login').forEach(el => { el.hidden = loggedIn; });
  document.querySelectorAll('.authenticated-mobile-profile, #mobile-logout-button').forEach(el => { el.hidden = !loggedIn; });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
}

if (menuToggle && mobileNav) {
  menuToggle.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!open));
    menuToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
    mobileNav.hidden = open;
  });
  mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
    mobileNav.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
  }));
}

if (profileButton && profileMenu) {
  profileButton.addEventListener('click', () => {
    const open = profileButton.getAttribute('aria-expanded') === 'true';
    profileButton.setAttribute('aria-expanded', String(!open));
    profileMenu.hidden = open;
  });
  document.addEventListener('click', event => {
    if (!profileButton.contains(event.target) && !profileMenu.contains(event.target)) {
      profileMenu.hidden = true;
      profileButton.setAttribute('aria-expanded', 'false');
    }
  });
}

// All protected actions route to login and preserve the requested destination.
document.querySelectorAll('.gated-link').forEach(link => {
  link.addEventListener('click', event => {
    const user = getSessionUser();
    if (user) return; // Backend/session integration will determine this state later.
    event.preventDefault();
    const destination = link.getAttribute('href') || 'login.html';
    window.location.href = destination;
  });
});

function logoutPreview() {
  // Real session revocation will be implemented with backend authentication.
  window.location.href = 'index.html';
}
if (logoutButton) logoutButton.addEventListener('click', logoutPreview);
if (mobileLogoutButton) mobileLogoutButton.addEventListener('click', logoutPreview);
renderAccessState();
