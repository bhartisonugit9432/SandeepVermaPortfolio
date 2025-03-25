// Authentication script for admin panel
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    function checkAuth() {
        const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
        
        // If not logged in and not on login page, redirect to login page
        if (!isLoggedIn && !window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }
    
    // Run auth check
    if (!checkAuth()) {
        // If check fails, we'll be redirected
        return;
    }
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear admin session
            sessionStorage.removeItem('adminLoggedIn');
            // Redirect to home page
            window.location.href = '../index.html';
        });
    }
    
    // Session timeout (15 minutes)
    const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds
    let lastActivity = parseInt(sessionStorage.getItem('lastActivity') || Date.now().toString());
    
    // Update last activity timestamp
    function updateActivity() {
        lastActivity = Date.now();
        sessionStorage.setItem('lastActivity', lastActivity.toString());
    }
    
    // Check for session timeout
    function checkSessionTimeout() {
        const now = Date.now();
        if ((now - lastActivity) > SESSION_TIMEOUT) {
            // Session expired
            sessionStorage.removeItem('adminLoggedIn');
            alert('Your session has expired due to inactivity. Please log in again.');
            window.location.href = 'login.html';
            return true;
        }
        return false;
    }
    
    // Set up activity tracking
    ['click', 'keypress', 'scroll', 'mousemove'].forEach(eventType => {
        document.addEventListener(eventType, updateActivity);
    });
    
    // Initial activity update
    updateActivity();
    
    // Check session timeout every minute
    setInterval(checkSessionTimeout, 60000);
}); 