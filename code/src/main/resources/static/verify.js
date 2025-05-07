document.addEventListener('DOMContentLoaded', function() {
    // Get username from URL
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
  
    if (username) {
      document.getElementById('username').value = username;
    }
  
    document.getElementById('verifyForm').addEventListener('submit', function(e) {
      e.preventDefault();
  
      const username = document.getElementById('username').value;
      const token = document.getElementById('token').value;
  
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];
      const userIndex = users.findIndex(u => u.username === username && u.verificationToken === token);
  
      if (userIndex === -1) {
        alert('Invalid username or verification token');
        return;
      }
  
      // Verify user
      users[userIndex].isVerified = true;
      users[userIndex].verificationToken = null;
      localStorage.setItem('readingLog_users', JSON.stringify(users));
  
      alert('Account verified successfully. You can now login.');
      window.location.href = 'login.html';
    });
  });