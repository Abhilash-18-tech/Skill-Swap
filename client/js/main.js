/**
 * SkillSwap - Main JavaScript
 * Shared utilities and helper functions
 */

// Show alert message
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-floating');
    existingAlerts.forEach(alert => alert.remove());

    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-floating`;
    alert.style.cssText = `
    position: fixed;
    top: 80px;
    right: 20px;
    z-index: 9999;
    min-width: 300px;
    max-width: 500px;
    animation: slideIn 0.3s ease;
  `;
    alert.textContent = message;

    document.body.appendChild(alert);

    // Auto remove after 5 seconds
    setTimeout(() => {
        alert.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format time ago
function timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
}

// Validate email
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Get current user ID
function getCurrentUserId() {
    return localStorage.getItem('userId');
}

// Set current user ID
function setCurrentUserId(userId) {
    localStorage.setItem('userId', userId);
}

// Clear current user
function clearCurrentUser() {
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Check if user is logged in
function isLoggedIn() {
    return !!localStorage.getItem('token');
}

// Logout function
function logout() {
    clearCurrentUser();
    window.location.href = 'login.html';
}

// Make authenticated API call
async function authenticatedFetch(url, options = {}) {
    const token = getAuthToken();

    if (!token) {
        throw new Error('No authentication token found');
    }

    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
    };

    return fetch(url, {
        ...options,
        headers
    });
}

// Route protection and navigation management
const handleAuthNavigation = () => {
    const isLoginPage = window.location.pathname.endsWith('login.html') || window.location.pathname.endsWith('register.html');
    const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
    const isPublicPage = isLoginPage || isHomePage || window.location.pathname.endsWith('community.html') || window.location.pathname.endsWith('experiences.html');

    // Redirect to login if accessing protected page while logged out
    if (!isLoggedIn() && !isPublicPage) {
        window.location.href = 'login.html';
        return;
    }

    // Redirect to profile if accessing login/register while logged in
    if (isLoggedIn() && isLoginPage) {
        window.location.href = 'profile.html';
        return;
    }

    updateNavbar();
};

// Update Navbar based on auth state
const updateNavbar = () => {
    const navbarNav = document.querySelector('.navbar-nav');
    if (!navbarNav) return;

    if (isLoggedIn()) {
        const userName = localStorage.getItem('userName') || 'User';
        // Add attractive user greeting
        const authLinks = `
            <li><a href="profile.html" class="nav-link user-greeting ${window.location.pathname.includes('profile.html') ? 'active' : ''}">✨ Hi, ${userName}</a></li>
        `;

        // Use a flag to avoid multiple appends
        if (!document.querySelector('.user-greeting')) {
            navbarNav.insertAdjacentHTML('beforeend', authLinks);
        }
    } else {
        // Add Login and Register if not present
        const guestLinks = `
            <li><a href="login.html" class="nav-link ${window.location.pathname.includes('login.html') ? 'active' : ''}">Login</a></li>
            <li><a href="register.html" class="nav-link ${window.location.pathname.includes('register.html') ? 'active' : ''}">Register</a></li>
        `;

        if (!navbarNav.innerHTML.includes('login.html')) {
            navbarNav.insertAdjacentHTML('beforeend', guestLinks);
        }
    }
}

// Theme Management
const initTheme = () => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    // Add toggle button to navbar automatically
    const navbar = document.querySelector('.navbar .container');
    if (navbar && !document.querySelector('.theme-toggle')) {
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'theme-toggle';
        toggleBtn.innerHTML = savedTheme === 'dark' ? '☀️' : '🌙';
        toggleBtn.title = 'Toggle Dark Mode';
        toggleBtn.onclick = () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            toggleBtn.innerHTML = newTheme === 'dark' ? '☀️' : '🌙';
        };

        // Append to the navbar (after the nav list)
        const navList = navbar.querySelector('.navbar-nav');
        if (navList) {
            const li = document.createElement('li');
            li.appendChild(toggleBtn);
            navList.appendChild(li);
        } else {
            navbar.appendChild(toggleBtn);
        }
    }
}

// Run init on load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    handleAuthNavigation();
});

// Add CSS animations and styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideOut {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100px); }
  }
  .navbar-nav { 
    display: flex; 
    align-items: center; 
    flex-wrap: nowrap;
    gap: 1.25rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .nav-link { 
    white-space: nowrap; 
    font-size: 0.95rem;
    font-weight: 500;
    transition: all 0.3s ease;
    padding: 0.5rem 0.25rem;
    opacity: 0.85;
  }
  .nav-link:hover {
    opacity: 1;
    transform: translateY(-1px);
    color: var(--primary) !important;
  }
  .nav-link.active {
    opacity: 1;
    font-weight: 700;
    color: var(--primary) !important;
  }
  .user-greeting {
    background: linear-gradient(135deg, #6366f1, #a855f7);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-weight: 700 !important;
    padding: 0.5rem 0.75rem !important;
    border-radius: 0.5rem;
    background-size: 200% auto;
    transition: 0.5s;
    opacity: 1 !important;
  }
  .user-greeting:hover {
    background-position: right center;
    transform: scale(1.05);
  }
  [data-theme='dark'] .user-greeting {
    background: linear-gradient(135deg, #818cf8, #c084fc);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  .theme-toggle { 
    background: var(--bg-subtle); 
    border: 1px solid var(--border-subtle); 
    font-size: 1.1rem; 
    cursor: pointer; 
    padding: 0.4rem; 
    border-radius: 0.5rem; 
    transition: all 0.3s; 
    margin-left: 0.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .theme-toggle:hover { 
    background: var(--primary-light); 
    transform: rotate(15deg);
  }
`;
document.head.appendChild(style);
