/**
 * Clerk Authentication Helper
 * Provides utility functions for Clerk authentication across the app
 */

const ClerkAuth = {
    // Check if user is authenticated
    async isAuthenticated() {
        try {
            if (!window.Clerk) {
                console.warn('Clerk not loaded yet');
                return false;
            }

            await window.Clerk.load();
            return !!window.Clerk.user;
        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            if (!window.Clerk) {
                throw new Error('Clerk not loaded');
            }

            await window.Clerk.load();
            return window.Clerk.user;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    },

    // Get session token for API calls
    async getToken() {
        try {
            if (!window.Clerk) {
                throw new Error('Clerk not loaded');
            }

            await window.Clerk.load();
            const session = await window.Clerk.session;

            if (!session) {
                throw new Error('No active session');
            }

            return await session.getToken();
        } catch (error) {
            console.error('Error getting token:', error);
            return null;
        }
    },

    // Sign out user
    async signOut() {
        try {
            if (!window.Clerk) {
                throw new Error('Clerk not loaded');
            }

            await window.Clerk.load();
            await window.Clerk.signOut();

            // Clear localStorage
            localStorage.clear();

            // Redirect to login
            window.location.href = '/login-clerk.html';
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    },

    // Sync user with backend
    async syncUser() {
        try {
            const token = await this.getToken();

            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch('/api/clerk-auth/sync-user', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                // Store user info in localStorage
                localStorage.setItem('userId', result.data.userId);
                localStorage.setItem('userName', result.data.name);
                localStorage.setItem('userEmail', result.data.email);
                localStorage.setItem('userCoins', result.data.coins);

                if (result.data.profilePicture) {
                    localStorage.setItem('userProfilePicture', result.data.profilePicture);
                }

                return result.data;
            } else {
                throw new Error(result.message || 'Failed to sync user');
            }
        } catch (error) {
            console.error('Error syncing user:', error);
            throw error;
        }
    },

    // Make authenticated API call
    async apiCall(endpoint, options = {}) {
        try {
            const token = await this.getToken();

            if (!token) {
                throw new Error('No authentication token available');
            }

            const defaultOptions = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    ...options.headers
                }
            };

            const response = await fetch(endpoint, {
                ...options,
                ...defaultOptions
            });

            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    },

    // Protect page - redirect to login if not authenticated
    async protectPage() {
        try {
            const isAuth = await this.isAuthenticated();

            if (!isAuth) {
                // Store the current page to redirect back after login
                sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
                window.location.href = '/login-clerk.html';
                return false;
            }

            // Sync user data
            await this.syncUser();
            return true;
        } catch (error) {
            console.error('Error protecting page:', error);
            window.location.href = '/login-clerk.html';
            return false;
        }
    },

    // Initialize Clerk on page load
    async init() {
        try {
            if (!window.Clerk) {
                console.warn('Clerk SDK not loaded');
                return false;
            }

            await window.Clerk.load();

            // Check for redirect after login
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            if (redirectPath && window.Clerk.user) {
                sessionStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectPath;
            }

            return true;
        } catch (error) {
            console.error('Error initializing Clerk:', error);
            return false;
        }
    },

    // Get user profile from backend
    async getUserProfile() {
        try {
            const token = await this.getToken();

            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch('/api/clerk-auth/me', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (result.success) {
                return result.data;
            } else {
                throw new Error(result.message || 'Failed to get user profile');
            }
        } catch (error) {
            console.error('Error getting user profile:', error);
            throw error;
        }
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ClerkAuth;
}
