document.getElementById('loginForm').addEventListener('submit', (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();

  if (!email.endsWith('@klh.edu.in')) {
    alert('Please sign in with your campus email (rollno@klh.edu.in)');
    return;
  }

  const stored = localStorage.getItem('user');

  if (!stored || stored !== email) {
    alert('User not found. Please sign up first.');
    window.location.href = 'signup.html';
    return;
  }

  window.location.href = 'main.html';
});