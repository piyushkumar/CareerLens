
/*
 * CareerLens Authentication Guard
 *
 * Purpose:
 * 1. Check whether an access token exists.
 * 2. Verify the token with FastAPI.
 * 3. Redirect guests to login.
 * 4. Allow the page to load only after successful verification.
 */

const AUTH_ME_URL = 'http://127.0.0.1:8000/api/auth/me';

// Approved pages that this guard can return users to after login.
const PROTECTED_PAGES = new Set([
  'career-recommendations.html',
  'resume-analysis.html',
  'skill-gap-analysis.html',
  'learning-roadmap.html',
  'profile-review.html'
]);

// Get the current HTML filename.
const currentPage = window.location.pathname
  .split('/')
  .pop()
  .toLowerCase();

// Stop the page's main content from being displayed before verification.
document.documentElement.style.visibility = 'hidden';

/*
 * Redirect the visitor to login while preserving the requested page.
 */
function redirectToLogin() {
  sessionStorage.removeItem('current_user');

  const loginUrl = new URL('login.html', window.location.href);

  if (PROTECTED_PAGES.has(currentPage)) {
    loginUrl.searchParams.set('returnTo', currentPage);
  }

  window.location.replace(loginUrl.toString());
}

/*
 * Verify the JWT using the existing FastAPI endpoint.
 */
async function verifyPageAccess() {
  const token = sessionStorage.getItem('access_token');

  // No token means the visitor must log in.
  if (!token) {
    redirectToLogin();
    return;
  }

  try {
    const response = await fetch(AUTH_ME_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    // Print the authentication response status for debugging.
    console.log('Auth guard response status:', response.status);

    // The backend rejected the token.
    if (response.status === 401 || response.status === 403) {
      sessionStorage.removeItem('access_token');
      sessionStorage.removeItem('current_user');

      redirectToLogin();
      return;
    }

    // Other server errors should not silently grant access.
    if (!response.ok) {
      throw new Error(
        `Authentication service returned HTTP ${response.status}`
      );
    }

    // The JWT has been verified by FastAPI.
// Read the user's profile returned by the backend.
const user = await response.json();

// Display the response to help diagnose the redirect issue.
console.log('Verified user response:', user);

// Check that the expected user details are present.
if (!user || !user.id || !user.email) {
  throw new Error(
    'The authentication response is missing user details.'
  );
}
    // Cache public profile information for frontend use.
    sessionStorage.setItem(
      'current_user',
      JSON.stringify({
        id: user.id,
        full_name: user.full_name,
        email: user.email
      })
    );

    // Allow the protected page to become visible.
    document.documentElement.style.visibility = 'visible';

    // Notify other scripts that authentication has succeeded.
    document.dispatchEvent(
      new CustomEvent('careerlens:authenticated', {
        detail: { user }
      })
    );

  } catch (error) {
    // Fail closed: do not display the protected page if verification
    // cannot be completed because the backend is unavailable.
    console.error('CareerLens authentication check failed:', error);

    document.documentElement.style.visibility = 'visible';

    // Show an error rather than treating a network failure as a guest.
    document.body.innerHTML = `
      <main style="max-width:600px;margin:80px auto;padding:24px;font-family:Arial,sans-serif;">
        <h1>Unable to verify your session</h1>
        <p>CareerLens could not connect to the authentication server.</p>
        <p>Start the FastAPI backend and try again.</p>
        <button id="retry-auth">Try again</button>
        <button id="back-home">Return to dashboard</button>
      </main>
    `;

    document.getElementById('retry-auth').addEventListener('click', () => {
      window.location.reload();
    });

    document.getElementById('back-home').addEventListener('click', () => {
      window.location.href = 'home.html';
    });
  }
}

// Run the check after the document has been parsed.
verifyPageAccess();
