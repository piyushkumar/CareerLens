
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const message = document.getElementById('form-message');

  document.getElementById('toggle-password').addEventListener('click', (event) => {
    const button = event.currentTarget;
    const showing = password.type === 'password';

    password.type = showing ? 'text' : 'password';
    button.textContent = showing ? 'Hide' : 'Show';
    button.setAttribute('aria-label', showing ? 'Hide password' : 'Show password');
  });

  document.getElementById('forgot-link').addEventListener('click', (event) => {
    event.preventDefault();
    message.textContent =
      'Password reset will be available when authentication is connected.';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    document.getElementById('email-error').textContent = '';
    document.getElementById('password-error').textContent = '';
    email.removeAttribute('aria-invalid');
    password.removeAttribute('aria-invalid');
    message.textContent = '';

    let valid = true;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      document.getElementById('email-error').textContent =
        'Enter a valid email address.';
      email.setAttribute('aria-invalid', 'true');
      valid = false;
    }

    if (password.value.length < 8) {
      document.getElementById('password-error').textContent =
        'Password must be at least 8 characters.';
      password.setAttribute('aria-invalid', 'true');
      valid = false;
    }

    if (!valid) {
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }

    const requestedDestination = new URLSearchParams(window.location.search).get('returnTo');
    message.textContent = requestedDestination
      ? 'Your details look valid. Authentication is not connected yet, so this feature cannot open until the backend is ready.'
      : 'Your details look valid. Authentication is not connected to the backend yet.';
  });
});
