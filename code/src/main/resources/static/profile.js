document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem('readingLog_currentUser'));
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Show admin menu if user is admin
  if (currentUser.isAdmin) {
    document.getElementById('adminMenu').classList.remove('hidden');
  }

  // Display user info
  document.getElementById('username').value = currentUser.username;
  document.getElementById('email').value = currentUser.email;

  // Display avatar if exists
  if (currentUser.avatar) {
    document.getElementById('avatarPreview').src = currentUser.avatar;
  }

  // Display reading stats
  displayReadingStats();

  // Set up profile form
  document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;

    // Validate inputs
    if (!username || !email) {
      alert('Please fill in all required fields');
      return;
    }

    // Check if username is already taken (by another user)
    const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];
    const existingUser = users.find(u => u.username === username && u.id !== currentUser.id);
    if (existingUser) {
      alert('Username is already taken');
      return;
    }

    // Update user in localStorage
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].username = username;
      users[userIndex].email = email;
      localStorage.setItem('readingLog_users', JSON.stringify(users));

      // Update current user
      currentUser.username = username;
      currentUser.email = email;
      localStorage.setItem('readingLog_currentUser', JSON.stringify(currentUser));

      alert('Profile updated successfully');
    }
  });

  // Set up password form
  document.getElementById('passwordForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields');
      return;
    }

    // Check if current password is correct
    if (currentPassword !== currentUser.password) {
      alert('Current password is incorrect');
      return;
    }

    // Check if new passwords match
    if (newPassword !== confirmPassword) {
      alert('New password and confirmation do not match');
      return;
    }

    // Update password in localStorage
    const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem('readingLog_users', JSON.stringify(users));

      // Update current user
      currentUser.password = newPassword;
      localStorage.setItem('readingLog_currentUser', JSON.stringify(currentUser));

      // Reset form
      document.getElementById('passwordForm').reset();
      alert('Password updated successfully');
    }
  });

  // Set up avatar upload
  document.getElementById('avatarUpload').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File is too large. Maximum size is 2MB.');
      return;
    }

    // Check file type
    if (!file.type.match('image.*')) {
      alert('Only image files are allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
      const avatarData = event.target.result;
      
      // Update avatar preview
      document.getElementById('avatarPreview').src = avatarData;
      
      // Update user in localStorage
      const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].avatar = avatarData;
        localStorage.setItem('readingLog_users', JSON.stringify(users));

        // Update current user
        currentUser.avatar = avatarData;
        localStorage.setItem('readingLog_currentUser', JSON.stringify(currentUser));

        alert('Avatar updated successfully');
      }
    };

    // Handle errors
    reader.onerror = function() {
      alert('Error reading file. Please try again.');
    };

    reader.readAsDataURL(file);
  });

  // Display reading stats
  function displayReadingStats() {
    const logs = JSON.parse(localStorage.getItem('readingLog_logs')) || [];
    const userLogs = logs.filter(log => log.userId === currentUser.id);
    
    const totalLogs = userLogs.length;
    const totalTime = userLogs.reduce((sum, log) => sum + parseInt(log.timeSpent || 0), 0);
    const totalAuthors = new Set(userLogs.map(log => log.author)).size;
    
    document.getElementById('totalLogs').textContent = totalLogs;
    document.getElementById('totalTime').textContent = totalTime;
    document.getElementById('totalAuthors').textContent = totalAuthors;
    
    // Display reading history chart (simplified)
    const readingHistory = document.getElementById('readingHistory');
    
    // Clear previous chart
    readingHistory.innerHTML = '';
    
    if (userLogs.length === 0) {
      readingHistory.innerHTML = '<p>No reading history available.</p>';
      return;
    }
    
    // Group logs by month
    const logsByMonth = {};
    userLogs.forEach(log => {
      const date = new Date(log.date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      
      if (!logsByMonth[monthKey]) {
        logsByMonth[monthKey] = {
          month: new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          totalTime: 0,
          count: 0
        };
      }
      
      logsByMonth[monthKey].totalTime += parseInt(log.timeSpent || 0);
      logsByMonth[monthKey].count += 1;
    });
    
    // Convert to array and sort by date
    const monthlyStats = Object.values(logsByMonth).sort((a, b) => 
      new Date(a.month) - new Date(b.month)
    );
    
    // Create simple chart
    const chart = document.createElement('div');
    chart.className = 'reading-chart';
    
    monthlyStats.forEach(stat => {
      const barContainer = document.createElement('div');
      barContainer.className = 'chart-bar-container';
      
      const bar = document.createElement('div');
      bar.className = 'chart-bar';
      bar.style.height = `${Math.min(100, stat.totalTime / 10)}px`;
      bar.title = `${stat.month}: ${stat.totalTime} minutes, ${stat.count} logs`;
      
      const label = document.createElement('div');
      label.className = 'chart-label';
      label.textContent = stat.month;
      
      barContainer.appendChild(bar);
      barContainer.appendChild(label);
      chart.appendChild(barContainer);
    });
    
    readingHistory.appendChild(chart);
  }
});