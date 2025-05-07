document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in and is an admin
  const currentUser = JSON.parse(localStorage.getItem('readingLog_currentUser'));
  if (!currentUser || !currentUser.isAdmin) {
    window.location.href = 'login.html';
    return;
  }

  // Initialize counter values
  updateSystemOverview();
  
  // Display users and logs
  displayUsers();
  displayLogs();

  // Set up filter forms
  document.getElementById('userFilterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    displayUsers();
  });

  document.getElementById('filterForm').addEventListener('submit', function(e) {
    e.preventDefault();
    displayLogs();
  });
  
  // Update system overview stats
  function updateSystemOverview() {
    const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];
    const logs = JSON.parse(localStorage.getItem('readingLog_logs')) || [];
    
    const lockedCount = users.filter(u => u.locked).length;
    const flaggedCount = logs.filter(l => l.flagged).length;
    
    document.getElementById('logCount').textContent = logs.length;
    document.getElementById('lockedCount').textContent = lockedCount;
    document.getElementById('flaggedCount').textContent = flaggedCount;
    document.getElementById('userCount').textContent = users.length;
    
    // Calculate user activity percentage (simple metric: active users last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsers = new Set();
    logs.forEach(log => {
      if (new Date(log.date) >= thirtyDaysAgo) {
        activeUsers.add(log.userId);
      }
    });
    
    const activityPercentage = users.length > 0 ? (activeUsers.size / users.length) * 100 : 0;
    document.getElementById('userActivityBar').querySelector('.progress-bar-fill').style.width = activityPercentage + '%';
  }

  // Display users with filtering
  function displayUsers() {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';

    // Get filter values
    const usernameFilter = document.getElementById('filterUsername').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;

    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];

    // Apply filters
    const filteredUsers = users.filter(user => {
      if (usernameFilter && !user.username.toLowerCase().includes(usernameFilter)) {
        return false;
      }

      if (statusFilter === 'locked' && !user.locked) {
        return false;
      }

      if (statusFilter === 'unlocked' && user.locked) {
        return false;
      }

      if (statusFilter === 'verified' && !user.isVerified) {
        return false;
      }

      if (statusFilter === 'unverified' && user.isVerified) {
        return false;
      }

      return true;
    });

    if (filteredUsers.length === 0) {
      userList.innerHTML = '<li class="empty-list">No users found.</li>';
      return;
    }

    // Display users
    filteredUsers.forEach(user => {
      const userItem = document.createElement('li');
      userItem.className = 'user-item' + (user.locked ? ' locked' : '');
      
      userItem.innerHTML = `
        <h3>${user.username}</h3>
        <div class="user-details">
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Status:</strong> 
            ${user.locked ? '<span class="status locked">Locked</span>' : '<span class="status active">Active</span>'}
            ${user.isVerified ? '<span class="status verified">Verified</span>' : '<span class="status unverified">Unverified</span>'}
            ${user.isAdmin ? '<span class="status admin">Admin</span>' : ''}
          </p>
        </div>
        <div class="user-actions">
          <button class="${user.locked ? 'unlock-btn' : 'lock-btn'} btn small" data-id="${user.id}">
            ${user.locked ? 'Unlock' : 'Lock'} User
          </button>
          ${!user.isVerified ? `<button class="verify-btn btn small" data-id="${user.id}">Verify User</button>` : ''}
        </div>
      `;

      userList.appendChild(userItem);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.lock-btn, .unlock-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        toggleLockUser(this.getAttribute('data-id'));
      });
    });

    document.querySelectorAll('.verify-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        verifyUser(this.getAttribute('data-id'));
      });
    });
  }

  // Display logs with filtering
  function displayLogs() {
    const logList = document.getElementById('logList');
    logList.innerHTML = '';

    // Get filter values
    const titleFilter = document.getElementById('searchInput').value.toLowerCase();
    const authorFilter = document.getElementById('filterLogAuthor').value.toLowerCase();
    const dateFilter = document.getElementById('filterLogDate').value;
    const flaggedOnly = document.getElementById('filterFlagged').checked;

    // Get logs from localStorage
    const logs = JSON.parse(localStorage.getItem('readingLog_logs')) || [];
    const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];

    // Apply filters
    const filteredLogs = logs.filter(log => {
      if (titleFilter && !log.title.toLowerCase().includes(titleFilter)) {
        return false;
      }

      if (authorFilter && !log.author.toLowerCase().includes(authorFilter)) {
        return false;
      }

      if (dateFilter && log.date !== dateFilter) {
        return false;
      }

      if (flaggedOnly && !log.flagged) {
        return false;
      }

      return true;
    });

    if (filteredLogs.length === 0) {
      logList.innerHTML = '<li class="empty-list">No logs found.</li>';
      return;
    }

    // Sort logs by date (newest first)
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display logs
    filteredLogs.forEach(log => {
      // Find username for this log
      const user = users.find(u => u.id === log.userId);
      const username = user ? user.username : 'Unknown User';
      
      const logItem = document.createElement('li');
      logItem.className = 'log-item' + (log.flagged ? ' flagged' : '');
      
      logItem.innerHTML = `
        <h3>${log.title}</h3>
        <div class="log-details">
          <p><strong>Author:</strong> ${log.author}</p>
          <p><strong>User:</strong> ${username}</p>
          <p><strong>Date:</strong> ${new Date(log.date).toLocaleDateString()}</p>
          <p><strong>Time Spent:</strong> ${log.timeSpent} minutes</p>
          ${log.notes ? `<p><strong>Notes:</strong> ${log.notes}</p>` : ''}
          ${log.flagged ? '<p class="flag-notice">⚠️ This log has been flagged for review</p>' : ''}
        </div>
        <div class="log-actions">
          <button class="${log.flagged ? 'unflag-btn' : 'flag-btn'} btn small" data-id="${log.id}">
            ${log.flagged ? 'Unflag' : 'Flag'} Log
          </button>
          <button class="delete-btn btn small" data-id="${log.id}">Delete Log</button>
        </div>
      `;

      logList.appendChild(logItem);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.flag-btn, .unflag-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        toggleFlagLog(this.getAttribute('data-id'));
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        deleteLog(this.getAttribute('data-id'));
      });
    });
  }

  // Toggle lock status of user
  function toggleLockUser(id) {
    const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];
    const userIndex = users.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) return;

    // Toggle lock status
    users[userIndex].locked = !users[userIndex].locked;
    localStorage.setItem('readingLog_users', JSON.stringify(users));
    
    alert(`User ${users[userIndex].username} has been ${users[userIndex].locked ? 'locked' : 'unlocked'}`);
    displayUsers();
    updateSystemOverview();
  }

  // Verify a user
  function verifyUser(id) {
    const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];
    const userIndex = users.findIndex(u => u.id === parseInt(id));

    if (userIndex === -1) return;

    // Verify user
    users[userIndex].isVerified = true;
    users[userIndex].verificationToken = null;
    localStorage.setItem('readingLog_users', JSON.stringify(users));
    
    alert(`User ${users[userIndex].username} has been verified`);
    displayUsers();
  }

  // Toggle flag status of log
  function toggleFlagLog(id) {
    const logs = JSON.parse(localStorage.getItem('readingLog_logs')) || [];
    const logIndex = logs.findIndex(l => l.id === parseInt(id));

    if (logIndex === -1) return;

    // Toggle flag status
    logs[logIndex].flagged = !logs[logIndex].flagged;
    localStorage.setItem('readingLog_logs', JSON.stringify(logs));
    
    alert(`Log has been ${logs[logIndex].flagged ? 'flagged' : 'unflagged'}`);
    displayLogs();
    updateSystemOverview();
  }

  // Delete log
  function deleteLog(id) {
    if (!confirm('Are you sure you want to delete this log?')) {
      return;
    }

    const logs = JSON.parse(localStorage.getItem('readingLog_logs')) || [];
    const logIndex = logs.findIndex(l => l.id === parseInt(id));

    if (logIndex === -1) return;

    // Delete log
    logs.splice(logIndex, 1);
    localStorage.setItem('readingLog_logs', JSON.stringify(logs));
    
    alert('Log deleted successfully');
    displayLogs();
    updateSystemOverview();
  }
});