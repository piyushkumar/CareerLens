
document.addEventListener('DOMContentLoaded', () => {
  // Get references to the registration form and its input fields.
  const form = document.getElementById('register-form');
  const name = document.getElementById('full-name');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const confirm = document.getElementById('confirm-password');
  const terms = document.getElementById('terms');
  const message = document.getElementById('form-message');

  // Address of the FastAPI registration endpoint.
  const REGISTER_API_URL = 'http://127.0.0.1:8000/api/auth/register';

  // Show or hide passwords when the user clicks a toggle button.
  document.querySelectorAll('[data-toggle]').forEach(button => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.toggle);
      const showing = input.type === 'password';

      // Change the input type to show or hide the password.
      input.type = showing ? 'text' : 'password';
      button.textContent = showing ? 'Hide' : 'Show';

      // Update the accessible label for screen readers.
      button.setAttribute(
        'aria-label',
        showing ? 'Hide password' : 'Show password'
      );
    });
  });

  // Handle registration when the form is submitted.
  form.addEventListener('submit', async event => {
    // Prevent the browser from reloading the page.
    event.preventDefault();

    // Clear errors left over from a previous submission.
    document.querySelectorAll('.error').forEach(el => {
      el.textContent = '';
    });

    // Remove previous invalid-field indicators.
    form.querySelectorAll('input').forEach(input => {
      input.removeAttribute('aria-invalid');
    });

    message.textContent = '';
    let valid = true;

    // Display an error beside a field and mark the form invalid.
    function showError(input, errorId, text) {
      document.getElementById(errorId).textContent = text;
      input.setAttribute('aria-invalid', 'true');
      valid = false;
    }

    // Validate the full name.
    if (name.value.trim().length < 2) {
      showError(name, 'name-error', 'Enter your full name.');
    }

    // Validate the email format.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError(email, 'email-error', 'Enter a valid email address.');
    }

    // The backend requires passwords between 8 and 128 characters.
    if (password.value.length < 8 || password.value.length > 128) {
      showError(
        password,
        'password-error',
        'Password must be between 8 and 128 characters.'
      );
    }

    // Ensure the confirmation matches the original password.
    if (!confirm.value || confirm.value !== password.value) {
      showError(
        confirm,
        'confirm-password-error',
        'Passwords do not match.'
      );
    }

    // Require acceptance of the terms before registration.
    if (!terms.checked) {
      document.getElementById('terms-error').textContent =
        'Please accept the Terms and Privacy Policy.';
      valid = false;
    }

    // Stop here if any frontend validation failed.
    if (!valid) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]');

      if (firstInvalid) {
        firstInvalid.focus();
      } else {
        terms.focus();
      }

      return;
    }

    // Show progress while the backend processes the request.
    message.textContent = 'Creating your account...';

    try {
      // Send the registration details to FastAPI as JSON.
      const response = await fetch(REGISTER_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // Send the field names expected by RegisterRequest.
          full_name: name.value.trim(),
          email: email.value.trim(),
          password: password.value
        })
      });

      // Read the backend's JSON response.
      const data = await response.json();

      // Handle errors such as an email that is already registered.
      if (!response.ok) {
        const errorMessage =
          typeof data.detail === 'string'
            ? data.detail
            : 'Registration failed. Please check your details.';

        message.textContent = errorMessage;
        return;
      }

      // Show success only after the backend confirms account creation.
      message.textContent =
        'Account created successfully! You can now log in.';

      // Clear the form after successful registration.
      form.reset();
    } catch (error) {
      // A network error or browser CORS block can reach this section.
      console.error('Registration request failed:', error);

      message.textContent =
        'Could not connect to CareerLens. Check that the backend is running.';
    }
  });
});
