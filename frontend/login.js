
document.addEventListener('DOMContentLoaded', () => {
  // Login form fields.
  const form = document.getElementById('login-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const message = document.getElementById('form-message');

  // FastAPI login endpoint.
  const LOGIN_API_URL = 'http://127.0.0.1:8000/api/auth/login';

  // Allowed destinations after login.
  const ALLOWED_FEATURE_PAGES = new Set([
  'career-recommendations.html',
  'resume-analysis.html',
  'skill-gap-analysis.html',
  'learning-roadmap.html',
  'profile-review.html'
]);

  /*
   * Read the returnTo query parameter.
   * Redirect only to an approved local feature page.
   */
  function getPostLoginDestination() {
    const requestedDestination =
      new URLSearchParams(window.location.search).get('returnTo');

    if (
      requestedDestination &&
      ALLOWED_FEATURE_PAGES.has(requestedDestination)
    ) {
      return requestedDestination;
    }

    // Default destination when no valid feature was requested.
    return 'home.html';
  }

  /*
   * Show or hide the password.
   */
  const togglePassword = document.getElementById('toggle-password');

  if (togglePassword) {
    togglePassword.addEventListener('click', event => {
      const button = event.currentTarget;
      const showing = password.type === 'password';

      password.type = showing ? 'text' : 'password';
      button.textContent = showing ? 'Hide' : 'Show';

      button.setAttribute(
        'aria-label',
        showing ? 'Hide password' : 'Show password'
      );
    });
  }

  /*
   * Handle Forgot Password.
   * Password reset has not been implemented in the backend yet.
   */
  const forgotLink = document.getElementById('forgot-link');

  if (forgotLink) {
    forgotLink.addEventListener('click', event => {
      event.preventDefault();

      message.textContent =
        'Password reset is not available yet. Please contact support if needed.';
    });
  }

  /*
   * Submit the login form.
   */
  form.addEventListener('submit', async event => {
    event.preventDefault();

    // Clear previous errors.
    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';

    email.removeAttribute('aria-invalid');
    password.removeAttribute('aria-invalid');
    message.textContent = '';

    let valid = true;

    // Validate email format.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      document.getElementById('email-error').textContent =
        'Enter a valid email address.';

      email.setAttribute('aria-invalid', 'true');
      valid = false;
    }

    // Validate password length.
    if (password.value.length < 8 || password.value.length > 128) {
      document.getElementById('password-error').textContent =
        'Password must be between 8 and 128 characters.';

      password.setAttribute('aria-invalid', 'true');
      valid = false;
    }

    if (!valid) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    message.textContent = 'Signing in...';

    // Prevent repeated submissions while login is processing.
    const submitButton = form.querySelector(
      'button[type="submit"], input[type="submit"]'
    );

    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      // Send credentials to FastAPI.
      const response = await fetch(LOGIN_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.value.trim(),
          password: password.value
        })
      });

      const data = await response.json();

      // Show errors returned by the backend.
      if (!response.ok) {
        message.textContent =
          typeof data.detail === 'string'
            ? data.detail
            : 'Login failed. Please check your credentials.';

        return;
      }

      // Make sure the backend returned a JWT.
      if (!data.access_token) {
        message.textContent =
          'Login succeeded, but no access token was returned.';

        return;
      }

      // Save the JWT for authenticated API requests.
      sessionStorage.setItem('access_token', data.access_token);

      // Save public user information for the dashboard.
      sessionStorage.setItem(
        'current_user',
        JSON.stringify({
          id: data.id,
          full_name: data.full_name,
          email: data.email
        })
      );

      // Return to the requested feature or the dashboard.
      window.location.replace(getPostLoginDestination());

    } catch (error) {
      console.error('Login request failed:', error);

      message.textContent =
        'Could not connect to CareerLens. Check that the backend is running.';

    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
});
