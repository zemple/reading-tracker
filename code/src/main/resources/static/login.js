document.getElementById('loginForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    alert('Invalid username or password');
    return;
  }

  if (user.locked) {
    alert('Your account has been locked. Please contact an administrator.');
    return;
  }

  if (!user.isVerified) {
    alert('Your account is not verified. Please check your email for verification instructions.');
    window.location.href = 'verify.html?username=' + encodeURIComponent(username);
    return;
  }

  // Login successful - store current user
  localStorage.setItem('readingLog_currentUser', JSON.stringify(user));
  
  // Redirect to dashboard
  window.location.href = 'dashboard.html';
});