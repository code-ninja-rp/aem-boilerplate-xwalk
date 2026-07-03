import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Decorates the login block: renders a mock sign-in form. On submit, no
 * credentials are validated or stored — any non-empty username is treated
 * as a successful login purely to mimic the event for AEP tracking.
 * @param {Element} block The login block element
 */
export default function decorate(block) {
  const [headingRow, buttonRow, successRow] = block.children;
  const heading = headingRow?.textContent.trim() || 'Sign In';
  const buttonText = buttonRow?.textContent.trim() || 'Log In';
  const successMessage = successRow?.textContent.trim() || "You're logged in.";

  const form = document.createElement('form');
  form.className = 'login-form';

  const title = document.createElement('h3');
  title.textContent = heading;
  if (headingRow) moveInstrumentation(headingRow, title);

  const usernameLabel = document.createElement('label');
  usernameLabel.setAttribute('for', 'login-username');
  usernameLabel.textContent = 'Username';
  const usernameInput = document.createElement('input');
  usernameInput.type = 'text';
  usernameInput.id = 'login-username';
  usernameInput.name = 'username';
  usernameInput.autocomplete = 'username';
  usernameInput.required = true;

  const passwordLabel = document.createElement('label');
  passwordLabel.setAttribute('for', 'login-password');
  passwordLabel.textContent = 'Password';
  const passwordInput = document.createElement('input');
  passwordInput.type = 'password';
  passwordInput.id = 'login-password';
  passwordInput.name = 'password';
  passwordInput.autocomplete = 'current-password';
  passwordInput.required = true;

  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.textContent = buttonText;
  if (buttonRow) moveInstrumentation(buttonRow, submit);

  const status = document.createElement('p');
  status.className = 'login-status';
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  form.append(
    title,
    usernameLabel,
    usernameInput,
    passwordLabel,
    passwordInput,
    submit,
    status,
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!usernameInput.value.trim()) return;

    // Mock login only — the username/password values are never read beyond
    // this check, and nothing is validated, stored, or sent anywhere. This
    // pushes a structured event to the Adobe Client Data Layer so the AEP
    // Web SDK / Data Collection (Launch) property can react to it via an
    // "Adobe Client Data Layer" rule listening for event === 'login',
    // without needing real authentication wired up yet.
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'login',
      login: { method: 'mock', status: 'success' },
    });

    status.textContent = successMessage;
    form.reset();
  });

  block.replaceChildren(form);
}
