import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Decorates the login block: renders a mock sign-in form. On submit, no
 * credentials are validated or stored — any non-empty username is treated
 * as a successful login purely to mimic the event for AEP tracking.
 * @param {Element} block The login block element
 */
export default function decorate(block) {
  const [headingRow, buttonRow] = block.children;
  const heading = headingRow?.textContent.trim() || 'Sign In';
  const buttonText = buttonRow?.textContent.trim() || 'Log In';

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

  form.append(
    title,
    usernameLabel,
    usernameInput,
    passwordLabel,
    passwordInput,
    submit,
  );

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = usernameInput.value.trim();
    if (!username) return;

    // Mock login only — the password value is never read at all, and the
    // username is never validated against anything; it's only kept to
    // mimic a logged-in session in the header. This pushes a structured
    // event to the Adobe Client Data Layer so the AEP Web SDK / Data
    // Collection (Launch) property can react to it via an "Adobe Client
    // Data Layer" rule listening for event === 'login', without needing
    // real authentication wired up yet.
    window.adobeDataLayer = window.adobeDataLayer || [];
    window.adobeDataLayer.push({
      event: 'login',
      login: { method: 'mock', status: 'success' },
    });

    // Persist only the display name locally so the header can reflect a
    // logged-in state across pages. Still no credential storage.
    try {
      localStorage.setItem('login-username', username);
    } catch { /* storage unavailable, e.g. private browsing */ }

    window.location.href = '/';
  });

  block.replaceChildren(form);
}
