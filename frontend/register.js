
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('register-form');
  const name = document.getElementById('full-name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirm = document.getElementById('confirm-password');
  const terms = document.getElementById('terms');
  const message = document.getElementById('form-message');

  // Show/hide password
  document.querySelectorAll('[data-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.toggle);
      const showing = input.type === 'password';

      input.type = showing ? 'text' : 'password';
      button.textContent = showing ? 'Hide' : 'Show';
      button.setAttribute(
        'aria-label',
        showing ? 'Hide password' : 'Show password'
      );
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();

    document.querySelectorAll('.error').forEach(el => {
      el.textContent = '';
    });

    form.querySelectorAll('input').forEach(input => {
      input.removeAttribute('aria-invalid');
    });

    message.textContent = '';
    let valid = true;

    function showError(input, errorId, text) {
      document.getElementById(errorId).textContent = text;
      input.setAttribute('aria-invalid', 'true');
      valid = false;
    }

    if (name.value.trim().length < 2) {
      showError(name, 'name-error', 'Enter your full name.');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError(email, 'email-error', 'Enter a valid email address.');
    }

    if (password.value.length < 8) {
      showError(
        password,
        'password-error',
        'Password must be at least 8 characters.'
      );
    }

    if (!confirm.value || confirm.value !== password.value) {
      showError(
        confirm,
        'confirm-password-error',
        'Passwords do not match.'
      );
    }

    if (!terms.checked) {
      document.getElementById('terms-error').textContent =
        'Please accept the Terms and Privacy Policy.';
      valid = false;
    }

    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      else terms.focus();
      return;
    }

    message.textContent =
      'All fields look good! Account creation will work after backend integration.';
  });
});
