document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('signupEmail').value.trim();
  const pass = document.getElementById('signupPassword').value;
  const confirm = document.getElementById('confirmPassword').value;

  if (!email.endsWith('@klh.edu.in')) {
    alert('Use your KLH campus email.');
    return;
  }

  if (pass !== confirm) {
    alert('Passwords do not match.');
    return;
  }

  alert('Verification link sent to ' + email + ' (simulation).');

  setTimeout(() => {
    localStorage.setItem('user', email);
    alert('Email verified! You can now login.');
    window.location.href = 'index.html';
  }, 1400);
});