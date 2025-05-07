// Base URL for API calls
const BASE_URL = 'http://localhost:3000';

// LocalStorage Keys
const STORAGE_KEYS = {
  USERS: 'readingLog_users',
  LOGS: 'readingLog_logs',
  CURRENT_USER: 'readingLog_currentUser'
};

// Check if user is logged in and redirect if needed
function checkAuth() {
  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  const currentPath = window.location.pathname;
  
  // Pages that require authentication
  const authRequired = ['index.html', 'dashboard.html', 'profile.html', 'reading-log.html'];
  // Pages accessible only when logged out
  const noAuthRequired = ['login.html', 'register.html', 'verify.html'];
  
  if (!currentUser && authRequired.some(page => currentPath.endsWith(page))) {
    window.location.href = 'login.html';
    return false;
  }
  
  if (currentUser && noAuthRequired.some(page => currentPath.endsWith(page))) {
    window.location.href = 'dashboard.html';
    return false;
  }
  
  return true;
}

// Initialize local storage with default data if empty
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers = [
      { 
        id: 1, 
        username: 'admin', 
        email: 'admin@example.com', 
        password: 'admin123', 
        isAdmin: true, 
        isVerified: true, 
        locked: false,
        avatar: null,
        verificationToken: null
      },
      { 
        id: 1, 
        username: 'admin2', 
        email: 'admin2@example.com', 
        password: 'admin123', 
        isAdmin: true, 
        isVerified: true, 
        locked: false,
        avatar: null,
        verificationToken: null
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }
  
  if (!localStorage.getItem(STORAGE_KEYS.LOGS)) {
    const defaultLogs = [
      { 
        id: 1, 
        userId: 1, 
        title: "Learning JavaScript", 
        author: "Jane Doe", 
        date: "2025-04-25", 
        timeSpent: 60, 
        notes: "Great introductory chapter on variables and data types.",
        flagged: false 
      }
    ];
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(defaultLogs));
  }
}

// Fetch system stats
function fetchStats() {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
  
  const stats = {
    totalLogs: logs.length,
    lockedUsers: users.filter(user => user.locked).length,
    flaggedLogs: logs.filter(log => log.flagged).length,
    activeUsers: users.filter(user => !user.locked && user.isVerified).length,
    totalUsers: users.length
  };
  
  // Update UI with stats
  if (document.getElementById('logCount')) {
    document.getElementById('logCount').textContent = stats.totalLogs;
    document.getElementById('lockedCount').textContent = stats.lockedUsers;
    document.getElementById('flaggedCount').textContent = stats.flaggedLogs;
    document.getElementById('userCount').textContent = stats.totalUsers;
    
    // Update progress bar
    const userActivityBar = document.getElementById('userActivityBar');
    if (userActivityBar && stats.totalUsers > 0) {
      const activePercentage = (stats.activeUsers / stats.totalUsers) * 100;
      userActivityBar.querySelector('.progress-bar-fill').style.width = `${activePercentage}%`;
    }
  }
  
  return stats;
}

// Fetch all logs or a specific user's logs
function fetchLogs(userId = null) {
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  
  // Filter logs if userId provided
  const filteredLogs = userId ? logs.filter(log => log.userId === userId) : logs;
  
  // Add username to each log
  const logsWithUsernames = filteredLogs.map(log => {
    const user = users.find(u => u.id === log.userId);
    return {
      ...log,
      username: user ? user.username : 'Unknown User'
    };
  });
  
  return logsWithUsernames;
}

// Display logs in the UI
function displayLogs(userId = null, container = 'logList', includeActions = false, filters = {}) {
  const logContainer = document.getElementById(container);
  if (!logContainer) return;
  
  let logs = fetchLogs(userId);
  
  // Apply filters
  if (filters.title) {
    logs = logs.filter(log => log.title.toLowerCase().includes(filters.title.toLowerCase()));
  }
  
  if (filters.author) {
    logs = logs.filter(log => log.author.toLowerCase().includes(filters.author.toLowerCase()));
  }
  
  if (filters.date) {
    logs = logs.filter(log => log.date === filters.date);
  }
  
  if (filters.minTime !== undefined) {
    logs = logs.filter(log => log.timeSpent >= filters.minTime);
  }
  
  if (filters.maxTime !== undefined) {
    logs = logs.filter(log => log.timeSpent <= filters.maxTime);
  }
  
  // Clear container
  logContainer.innerHTML = '';
  
  if (logs.length === 0) {
    logContainer.innerHTML = '<li class="no-results">No reading logs found.</li>';
    return;
  }
  
  // Sort logs by date (newest first)
  logs.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  logs.forEach(log => {
    const li = document.createElement('li');
    li.className = log.flagged ? 'flagged' : '';
    li.setAttribute('data-log-id', log.id);
    
    let logContent = `
      <div class="log-header">
        <h3>${log.title}</h3>
        <span class="log-author">by ${log.author}</span>
      </div>
      <div class="log-details">
        <span class="log-date">${new Date(log.date).toLocaleDateString()}</span>
        <span class="log-time">${log.timeSpent} minutes</span>
      </div>
      <div class="log-user">Logged by: ${log.username}</div>
    `;
    
    if (log.notes) {
      logContent += `<div class="log-notes">${log.notes}</div>`;
    }
    
    if (log.flagged) {
      logContent += `<div class="log-flagged">⚠️ Flagged</div>`;
    }
    
    if (includeActions) {
      const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
      
      // Only show edit/delete to the log owner or admins
      if (currentUser && (currentUser.isAdmin || currentUser.id === log.userId)) {
        logContent += `
          <div class="log-actions">
            <button class="edit-log" data-id="${log.id}">Edit</button>
            <button class="delete-log" data-id="${log.id}">Delete</button>
        `;
        
        // Only admins can flag/unflag
        if (currentUser.isAdmin) {
          logContent += `
            <button class="${log.flagged ? 'unflag-log' : 'flag-log'}" data-id="${log.id}">
              ${log.flagged ? 'Unflag' : 'Flag'}
            </button>
          `;
        }
        
        logContent += `</div>`;
      }
    }
    
    li.innerHTML = logContent;
    logContainer.appendChild(li);
  });
  
  // Add event listeners for actions
  if (includeActions) {
    document.querySelectorAll('.edit-log').forEach(button => {
      button.addEventListener('click', () => editLog(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.delete-log').forEach(button => {
      button.addEventListener('click', () => deleteLog(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.flag-log, .unflag-log').forEach(button => {
      button.addEventListener('click', () => toggleFlagLog(button.getAttribute('data-id')));
    });
  }
}

// Edit a log
function editLog(logId) {
  logId = parseInt(logId);
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
  const log = logs.find(l => l.id === logId);
  
  if (!log) return;
  
  // Populate the edit form
  document.getElementById('logId').value = log.id;
  document.getElementById('bookTitle').value = log.title;
  document.getElementById('bookAuthor').value = log.author;
  document.getElementById('readingDate').value = log.date;
  document.getElementById('timeSpent').value = log.timeSpent;
  document.getElementById('notes').value = log.notes || '';
  
  // Show the form
  document.getElementById('logForm').classList.remove('hidden');
  document.getElementById('formTitle').textContent = 'Edit Reading Log';
  document.getElementById('submitLog').textContent = 'Update Log';
  
  // Scroll to form
  document.getElementById('logForm').scrollIntoView({ behavior: 'smooth' });
}

// Delete a log
function deleteLog(logId) {
  if (!confirm('Are you sure you want to delete this reading log?')) return;
  
  logId = parseInt(logId);
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
  const updatedLogs = logs.filter(l => l.id !== logId);
  
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
  
  // Refresh the logs display
  const userId = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER))?.id;
  const isAdmin = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER))?.isAdmin;
  
  displayLogs(isAdmin ? null : userId, 'logList', true);
  fetchStats();
  
  showToast('Reading log deleted successfully');
}

// Toggle flag status of a log
function toggleFlagLog(logId) {
  logId = parseInt(logId);
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
  const logIndex = logs.findIndex(l => l.id === logId);
  
  if (logIndex === -1) return;
  
  logs[logIndex].flagged = !logs[logIndex].flagged;
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
  
  // Refresh logs display
  displayLogs(null, 'logList', true);
  fetchStats();
  
  showToast(`Reading log ${logs[logIndex].flagged ? 'flagged' : 'unflagged'} successfully`);
}

// Fetch users
function fetchUsers() {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  return users;
}

// Display users in the UI
function displayUsers(container = 'userList', includeActions = false) {
  const userContainer = document.getElementById(container);
  if (!userContainer) return;
  
  const users = fetchUsers();
  
  // Clear container
  userContainer.innerHTML = '';
  
  if (users.length === 0) {
    userContainer.innerHTML = '<li class="no-results">No users found.</li>';
    return;
  }
  
  users.forEach(user => {
    const li = document.createElement('li');
    li.className = user.locked ? 'locked' : '';
    li.setAttribute('data-user-id', user.id);
    
    let userContent = `
      <div class="user-header">
        <h3>${user.username}</h3>
        <span class="user-email">${user.email}</span>
      </div>
      <div class="user-status">
        ${user.isAdmin ? '<span class="admin-badge">Admin</span>' : ''}
        ${user.locked ? '<span class="locked-badge">Locked</span>' : ''}
        ${!user.isVerified ? '<span class="unverified-badge">Unverified</span>' : ''}
      </div>
    `;
    
    if (includeActions) {
      const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
      
      // Only admins can see these actions
      if (currentUser && currentUser.isAdmin) {
        userContent += `
          <div class="user-actions">
            <button class="${user.locked ? 'unlock-user' : 'lock-user'}" data-id="${user.id}">
              ${user.locked ? 'Unlock' : 'Lock'} User
            </button>
        `;
        
        if (!user.isVerified) {
          userContent += `<button class="verify-user" data-id="${user.id}">Verify User</button>`;
        }
        
        userContent += `</div>`;
      }
    }
    
    li.innerHTML = userContent;
    userContainer.appendChild(li);
  });
  
  // Add event listeners for actions
  if (includeActions) {
    document.querySelectorAll('.lock-user, .unlock-user').forEach(button => {
      button.addEventListener('click', () => toggleLockUser(button.getAttribute('data-id')));
    });
    
    document.querySelectorAll('.verify-user').forEach(button => {
      button.addEventListener('click', () => verifyUser(button.getAttribute('data-id')));
    });
  }
}

// Toggle lock status of a user
function toggleLockUser(userId) {
  userId = parseInt(userId);
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return;
  
  users[userIndex].locked = !users[userIndex].locked;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Refresh users display
  displayUsers('userList', true);
  fetchStats();
  
  showToast(`User ${users[userIndex].locked ? 'locked' : 'unlocked'} successfully`);
}

// Verify a user
function verifyUser(userId) {
  userId = parseInt(userId);
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  const userIndex = users.findIndex(u => u.id === userId);
  
  if (userIndex === -1) return;
  
  users[userIndex].isVerified = true;
  users[userIndex].verificationToken = null;
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  
  // Refresh users display
  displayUsers('userList', true);
  fetchStats();
  
  showToast(`User ${users[userIndex].username} verified successfully`);
}

// Setup search and filter functionality
function setupSearch(container, searchInput, filterForm = null) {
  const search = document.getElementById(searchInput);
  if (!search) return;
  
  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  
  search.addEventListener('input', () => {
    const filters = { title: search.value };
    
    // Add other filters if the filter form exists
    if (filterForm) {
      const form = document.getElementById(filterForm);
      if (form) {
        filters.author = form.querySelector('[name="author"]')?.value || '';
        filters.date = form.querySelector('[name="date"]')?.value || '';
        
        const minTime = form.querySelector('[name="minTime"]')?.value;
        if (minTime) filters.minTime = parseInt(minTime);
        
        const maxTime = form.querySelector('[name="maxTime"]')?.value;
        if (maxTime) filters.maxTime = parseInt(maxTime);
      }
    }
    
    displayLogs(currentUser?.isAdmin ? null : currentUser?.id, container, true, filters);
  });
  
  // Setup filter form if it exists
  if (filterForm) {
    const form = document.getElementById(filterForm);
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const filters = {
          title: search.value,
          author: form.querySelector('[name="author"]')?.value || '',
          date: form.querySelector('[name="date"]')?.value || ''
        };
        
        const minTime = form.querySelector('[name="minTime"]')?.value;
        if (minTime) filters.minTime = parseInt(minTime);
        
        const maxTime = form.querySelector('[name="maxTime"]')?.value;
        if (maxTime) filters.maxTime = parseInt(maxTime);
        
        displayLogs(currentUser?.isAdmin ? null : currentUser?.id, container, true, filters);
      });
      
      // Reset button
      const resetBtn = form.querySelector('[type="reset"]');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          search.value = '';
          displayLogs(currentUser?.isAdmin ? null : currentUser?.id, container, true);
        });
      }
    }
  }
}

// Utility function to show toast messages
function showToast(message) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  // Create toast
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Utility function to generate verification token
function generateToken() {
  return Math.random().toString(36).substring(2, 15);
}

// Utility function to simulate email verification
function sendVerificationEmail(email, token) {
  console.log(`Verification email sent to ${email} with token: ${token}`);
  alert(`Verification link sent to ${email}. For this demo, use this token: ${token}`);
  // In a real app, you would send an actual email with a link
}

// Initialize storage on page load
document.addEventListener('DOMContentLoaded', () => {
  initializeStorage();
  
  // Check authentication status
  if (!checkAuth()) return;
  
  // Common setup for all pages
  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  
  // Update user menu if logged in
  if (currentUser) {
    const userMenu = document.getElementById('userMenu');
    if (userMenu) {
      userMenu.innerHTML = `
        <span>Welcome, ${currentUser.username}</span>
        <a href="profile.html">Profile</a>
        <a href="#" id="logoutBtn">Logout</a>
      `;
      
      // Add logout functionality
      document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        window.location.href = 'login.html';
      });
    }
    
    // Setup admin menu if admin
    if (currentUser.isAdmin) {
      const adminMenu = document.getElementById('adminMenu');
      if (adminMenu) {
        adminMenu.classList.remove('hidden');
      }
    }
  }
  
  // Page-specific initialization
  const currentPath = window.location.pathname;
  
  if (currentPath.endsWith('index.html') || currentPath.endsWith('/')) {
    fetchStats();
    displayLogs(null, 'logList', false);
    displayUsers('userList', false);
  }
  
  if (currentPath.endsWith('dashboard.html')) {
    fetchStats();
    
    const isAdmin = currentUser?.isAdmin;
    displayLogs(isAdmin ? null : currentUser?.id, 'logList', true);
    
    // Setup log form
    const logForm = document.getElementById('logForm');
    if (logForm) {
      logForm.addEventListener('submit', handleLogSubmit);
      
      // Add new log button
      const newLogBtn = document.getElementById('newLogBtn');
      if (newLogBtn) {
        newLogBtn.addEventListener('click', () => {
          // Reset form
          logForm.reset();
          document.getElementById('logId').value = '';
          document.getElementById('formTitle').textContent = 'Add Reading Log';
          document.getElementById('submitLog').textContent = 'Add Log';
          
          // Show form
          logForm.classList.remove('hidden');
          logForm.scrollIntoView({ behavior: 'smooth' });
        });
      }
      
      // Cancel button
      const cancelBtn = document.getElementById('cancelLog');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
          e.preventDefault();
          logForm.classList.add('hidden');
        });
      }
    }
    
    // Setup search and filters
    setupSearch('logList', 'searchInput', 'filterForm');
  }
  
  if (currentPath.endsWith('admin.html')) {
    // Only accessible by admins
    if (!currentUser?.isAdmin) {
      window.location.href = 'dashboard.html';
      return;
    }
    
    fetchStats();
    displayLogs(null, 'logList', true);
    displayUsers('userList', true);
    
    // Setup search
    setupSearch('logList', 'searchInput', 'filterForm');
  }
  
  if (currentPath.endsWith('profile.html')) {
    // Load user profile
    loadUserProfile();
    
    // Setup profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', handleProfileUpdate);
    }
    
    // Setup password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', handlePasswordUpdate);
    }
    
    // Setup avatar upload
    const avatarInput = document.getElementById('avatarUpload');
    if (avatarInput) {
      avatarInput.addEventListener('change', handleAvatarUpload);
    }
  }
});

// Handle log submission
function handleLogSubmit(e) {
  e.preventDefault();
  
  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  if (!currentUser) return;
  
  const logId = document.getElementById('logId').value;
  const title = document.getElementById('bookTitle').value;
  const author = document.getElementById('bookAuthor').value;
  const date = document.getElementById('readingDate').value;
  const timeSpent = parseInt(document.getElementById('timeSpent').value);
  const notes = document.getElementById('notes').value;
  
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
  
  if (logId) {
    // Update existing log
    const logIndex = logs.findIndex(l => l.id === parseInt(logId));
    
    if (logIndex !== -1) {
      // Preserve flagged status and userId
      const flagged = logs[logIndex].flagged;
      const userId = logs[logIndex].userId;
      
      logs[logIndex] = {
        id: parseInt(logId),
        userId,
        title,
        author,
        date,
        timeSpent,
        notes,
        flagged
      };
      
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
      showToast('Reading log updated successfully');
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
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs));
    showToast('Reading log added successfully');
  }
  
  // Reset and hide form
  e.target.reset();
  document.getElementById('logId').value = '';
  document.getElementById('logForm').classList.add('hidden');
  
  // Refresh logs display
  displayLogs(currentUser.isAdmin ? null : currentUser.id, 'logList', true);
  fetchStats();
}

// Load user profile
function loadUserProfile() {
  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  if (!currentUser) return;
  
  document.getElementById('username').value = currentUser.username;
  document.getElementById('email').value = currentUser.email;
  
  // Display avatar if exists
  const avatar = document.getElementById('avatar');
  if (avatar && currentUser.avatar) {
    avatar.src = currentUser.avatar;
  }
  
  // Display reading stats
  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.LOGS)) || [];
  const userLogs = logs.filter(log => log.userId === currentUser.id);
  
  const totalLogs = userLogs.length;
  const totalTime = userLogs.reduce((sum, log) => sum + log.timeSpent, 0);
  const avgTime = totalLogs ? Math.round(totalTime / totalLogs) : 0;
  
  document.getElementById('totalLogs').textContent = totalLogs;
  document.getElementById('totalTime').textContent = totalTime;
  document.getElementById('avgTime').textContent = avgTime;
}

// Handle profile update
function handleProfileUpdate(e) {
  e.preventDefault();
  
  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  if (!currentUser) return;
  
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    // Update user in users array
    users[userIndex].username = username;
    users[userIndex].email = email;
    
    // Update current user
    currentUser.username = username;
    currentUser.email = email;
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    
    showToast('Profile updated successfully');
  }
}

// Handle password update
function handlePasswordUpdate(e) {
  e.preventDefault();
  
  const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
  if (!currentUser) return;
  
  const currentPassword = document.getElementById('currentPassword').value;
  const newPassword = document.getElementById('newPassword').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  
  // Verify current password
  if (currentPassword !== currentUser.password) {
    showToast('Current password is incorrect');
    return;
  }
  
  // Check passwords match
  if (newPassword !== confirmPassword) {
    showToast('New passwords do not match');
    return;
  }
  
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
  const userIndex = users.findIndex(u => u.id === currentUser.id);
  
  if (userIndex !== -1) {
    // Update password
    users[userIndex].password = newPassword;
    currentUser.password = newPassword;
    
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    
    // Reset form
    e.target.reset();
    showToast('Password updated successfully');
  }
}

// Handle avatar upload
function handleAvatarUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = function(event) {
    const avatarData = event.target.result;
    
    // Update avatar in localStorage
    const currentUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    if (!currentUser) return;
    
    currentUser.avatar = avatarData;
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    const userIndex = users.findIndex(u => u.id === currentUser.id);
    
    if (userIndex !== -1) {
      users[userIndex].avatar = avatarData;
      
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
      
      // Update avatar preview
      document.getElementById('avatar').src = avatarData;
      showToast('Avatar updated successfully');
    }
  };
  
  reader.readAsDataURL(file);
}