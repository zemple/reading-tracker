document.addEventListener('DOMContentLoaded', function() {
  // Check if user is logged in
  const currentUser = JSON.parse(localStorage.getItem('readingLog_currentUser'));
  if (!currentUser) {
    window.location.href = 'login.html';
    return;
  }

  // Update welcome message
  document.getElementById('welcomeMessage').textContent = `Welcome, ${currentUser.username}!`;

  // Update stats
  updateDashboardStats();
  
  // Setup new log button
  document.getElementById('newLogBtn').addEventListener('click', function() {
    document.getElementById('logForm').classList.remove('hidden');
    document.getElementById('formTitle').textContent = 'Add Reading Log';
    document.getElementById('logId').value = '';
    document.getElementById('logForm').reset();
  });

  // Set up reading log form
  const logForm = document.getElementById('logForm');
  logForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const logId = document.getElementById('logId').value;
    const title = document.getElementById('bookTitle').value;
    const author = document.getElementById('bookAuthor').value;
    const date = document.getElementById('readingDate').value;
    const timeSpent = parseInt(document.getElementById('timeSpent').value);
    const notes = document.getElementById('notes').value;

    // Get logs from localStorage
    const logs = JSON.parse(localStorage.getItem('readingLog_logs')) || [];

    if (logId) {
      // Update existing log
      const logIndex = logs.findIndex(l => l.id === parseInt(logId));
      if (logIndex !== -1) {
        const oldLog = logs[logIndex];
        // Only allow editing if user is the owner or an admin
        if (oldLog.userId === currentUser.id || currentUser.isAdmin) {
          logs[logIndex] = {
            ...oldLog,
            title,
            author,
            date,
            timeSpent,
            notes
          };
          localStorage.setItem('readingLog_logs', JSON.stringify(logs));
          alert('Reading log updated successfully');
        } else {
          alert('You do not have permission to edit this log');
        }
      }
    } else {
      // Add new log
      const newLog = {
        id: Date.now(),
        userId: currentUser.id,
        title,
        author,
        date,
        timeSpent,
        notes,
        flagged: false
      };

      logs.push(newLog);
      localStorage.setItem('readingLog_logs', JSON.stringify(logs));
      alert('Reading log added successfully');
    }

    // Reset form and refresh logs
    logForm.reset();
    document.getElementById('logId').value = '';
    document.getElementById('formTitle').textContent = 'Add Reading Log';
    logForm.classList.add('hidden');
    displayLogs();
    updateDashboardStats();
  });

  // Cancel button
  document.getElementById('cancelLog').addEventListener('click', function() {
    logForm.reset();
    document.getElementById('logId').value = '';
    document.getElementById('formTitle').textContent = 'Add Reading Log';
    logForm.classList.add('hidden');
  });

  // Search functionality
  document.getElementById('searchInput').addEventListener('input', function() {
    displayLogs();
  });

  // Set up filter form
  const filterForm = document.getElementById('filterForm');
  filterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    displayLogs();
  });

  document.getElementById('resetFilter').addEventListener('click', function() {
    filterForm.reset();
    displayLogs();
  });

  // Initial display
  displayLogs();
  
  // Update dashboard stats
  function updateDashboardStats() {
    const logs = JSON.parse(localStorage.getItem('readingLog_logs')) || [];
    const users = JSON.parse(localStorage.getItem('readingLog_users')) || [];
    
    // Count logs
    let logCount = 0;
    let flaggedCount = 0;
    
    if (currentUser.isAdmin) {
      // Admin sees all logs
      logCount = logs.length;
      flaggedCount = logs.filter(log => log.flagged).length;
    } else {
      // Regular user only sees their logs
      const userLogs = logs.filter(log => log.userId === currentUser.id);
      logCount = userLogs.length;
      flaggedCount = userLogs.filter(log => log.flagged).length;
    }
    
    document.getElementById('logCount').textContent = logCount;
    document.getElementById('flaggedCount').textContent = flaggedCount;
    document.getElementById('userCount').textContent = users.length;
    
    // Show/hide admin menu
    if (currentUser.isAdmin) {
      document.getElementById('adminMenu').classList.remove('hidden');
    }
  }

  // Display logs with filtering
  function displayLogs() {
    const logsList = document.getElementById('logList');
    logsList.innerHTML = '';

    // Get filter values
    const searchText = document.getElementById('searchInput').value.toLowerCase();
    const authorFilter = document.getElementById('authorFilter').value.toLowerCase();
    const dateFilter = document.getElementById('dateFilter').value;
    const minTimeFilter = document.getElementById('minTimeFilter').value ? parseInt(document.getElementById('minTimeFilter').value) : 0;
    const maxTimeFilter = document.getElementById('maxTimeFilter').value ? parseInt(document.getElementById('maxTimeFilter').value) : Infinity;

    // Get logs from localStorage
    const logs = JSON.parse(localStorage.getItem('readingLog_logs')) || [];

    // Filter logs by user (if not admin) and other filters
    const filteredLogs = logs.filter(log => {
      // If not admin, only show user's logs
      if (!currentUser.isAdmin && log.userId !== currentUser.id) {
        return false;
      }

      // Apply other filters
      return (
        (searchText === '' || log.title.toLowerCase().includes(searchText)) &&
        (authorFilter === '' || log.author.toLowerCase().includes(authorFilter)) &&
        (dateFilter === '' || log.date === dateFilter) &&
        log.timeSpent >= minTimeFilter &&
        (maxTimeFilter === Infinity || log.timeSpent <= maxTimeFilter)
      );
    });

    if (filteredLogs.length === 0) {
      logsList.innerHTML = '<li class="no-logs">No reading logs found.</li>';
      return;
    }

    // Sort logs by date (newest first)
    filteredLogs.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Display logs
    filteredLogs.forEach(log => {
      const logItem = document.createElement('li');
      logItem.className = 'log-item' + (log.flagged ? ' flagged' : '');
      
      logItem.innerHTML = `
        <h3>${log.title}</h3>
        <div class="log-details">
          <p><strong>Author:</strong> ${log.author}</p>
          <p><strong>Date:</strong> ${new Date(log.date).toLocaleDateString()}</p>
          <p><strong>Time Spent:</strong> ${log.timeSpent} minutes</p>
          ${log.notes ? `<p><strong>Notes:</strong> ${log.notes}</p>` : ''}
          ${log.flagged ? '<p class="flag-notice">⚠️ This log has been flagged for review</p>' : ''}
        </div>
        <div class="log-actions">
          <button class="edit-btn" data-id="${log.id}">Edit</button>
          <button class="delete-btn" data-id="${log.id}">Delete</button>
          ${currentUser.isAdmin ? `<button class="${log.flagged ? 'unflag-btn' : 'flag-btn'}" data-id="${log.id}">${log.flagged ? 'Unflag' : 'Flag'}</button>` : ''}
        </div>
      `;

      logsList.appendChild(logItem);
    });

    // Add event listeners to buttons
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        editLog(this.getAttribute('data-id'));
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        deleteLog(this.getAttribute('data-id'));
      });
    });

    document.querySelectorAll('.flag-btn, .unflag-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        toggleFlagLog(this.getAttribute('data-id'));
      });
    });
  }

  // Edit log function
  function editLog(id) {
    const logs = JSON.parse(localStorage.getItem('readingLog_logs')) || [];
    const log = logs.find(l => l.id === parseInt(id));

    if (!log) return;

    // Only allow editing if user is the owner or an admin
    if (log.userId !== currentUser.id && !currentUser.isAdmin) {
      alert('You do not have permission to edit this log');
      return;
    }

    // Fill form with log data
    document.getElementById('logId').value = log.id;
    document.getElementById('bookTitle').value = log.title;
    document.getElementById('bookAuthor').value = log.author;
    document.getElementById('readingDate').value = log.date;
    document.getElementById('timeSpent').value = log.timeSpent;
    document.getElementById('notes').value = log.notes || '';

    // Update form title
    document.getElementById('formTitle').textContent = 'Edit Reading Log';
    
    // Show the form
    document.getElementById('logForm').classList.remove('hidden');
    
    // Scroll to form
    document.getElementById('logForm').scrollIntoView({ behavior: 'smooth' });
  }

  // Delete log function
  function deleteLog(id) {
    if (!confirm('Are you sure you want to delete this reading log?')) {
      return;
    }

    const logs = JSON.parse(localStorage.getItem('readingLog_logs')) || [];
    const logIndex = logs.findIndex(l => l.id === parseInt(id));

    if (logIndex === -1) return;

    // Only allow deletion if user is the owner or an admin
    if (logs[logIndex].userId !== currentUser.id && !currentUser.isAdmin) {
      alert('You do not have permission to delete this log');
      return;
    }

    logs.splice(logIndex, 1);
    localStorage.setItem('readingLog_logs', JSON.stringify(logs));
    alert('Reading log deleted successfully');
    displayLogs();
    updateDashboardStats();
  }

  // Toggle flag status function (admin only)
  function toggleFlagLog(id) {
    if (!currentUser.isAdmin) {
      alert('Only administrators can flag or unflag logs');
      return;
    }

    const logs = JSON.parse(localStorage.getItem('readingLog_logs')) || [];
    const logIndex = logs.findIndex(l => l.id === parseInt(id));

    if (logIndex === -1) return;

    logs[logIndex].flagged = !logs[logIndex].flagged;
    localStorage.setItem('readingLog_logs', JSON.stringify(logs));
    
    alert(`Log ${logs[logIndex].flagged ? 'flagged' : 'unflagged'} successfully`);
    displayLogs();
    updateDashboardStats();
  }

  // Add functionality for user menu
  const userMenu = document.getElementById('userMenu');
  userMenu.innerHTML = `
    <li><span>Hello, ${currentUser.username}</span></li>
    <li><a href="#" id="logoutBtn">Logout</a></li>
  `;
  
  document.getElementById('logoutBtn').addEventListener('click', function(e) {
    e.preventDefault();
    localStorage.removeItem('readingLog_currentUser');
    window.location.href = 'login.html';
  });
});