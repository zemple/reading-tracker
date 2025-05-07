document.getElementById('registerForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const username = document.getElementById('registerUsername').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  // Validate passwords match
  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];

  // Check if username or email already exists
  if (users.some(u => u.username === username)) {
    alert('Username already exists');
    return;
  }

  if (users.some(u => u.email === email)) {
    alert('Email already exists');
    return;
  }

  // Generate verification token
  const verificationToken = Math.random().toString(36).substring(2, 15);

  // Create new user
  const newUser = {
    id: Date.now(),
    username,
    email,
    password,
    isAdmin: false,
    isVerified: false,
    locked: false,
    avatar: null,
    verificationToken
  };

  // Add user to localStorage
  users.push(newUser);
  localStorage.setItem('readingLog_users', JSON.stringify(users));

  // Send verification email (simulated)
  alert(`Verification email sent to ${email}. For this demo, use this token: ${verificationToken}`);

  // Redirect to verification page
  window.location.href = 'verify.html?username=' + encodeURIComponent(username);
});