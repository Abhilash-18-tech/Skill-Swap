# 🔄 Migrating Existing Pages to Clerk Authentication

This guide shows you how to update your existing protected pages to use Clerk authentication instead of JWT tokens.

## 📋 Overview

Your app currently uses JWT tokens stored in localStorage. We'll migrate to Clerk while maintaining backward compatibility.

## 🎯 Quick Migration Steps

### For Any Protected Page (e.g., profile.html, search.html, etc.)

#### Step 1: Add Clerk SDK Script

Add this in the `<head>` section of your HTML file:

```html
<!-- Clerk Frontend SDK -->
<script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="YOUR_PUBLISHABLE_KEY_HERE"
    src="https://YOUR_FRONTEND_API.clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    type="text/javascript"
></script>
```

#### Step 2: Add Clerk Auth Helper

Add this before your closing `</body>` tag:

```html
<!-- Clerk Auth Helper -->
<script src="js/clerk-auth.js"></script>
```

#### Step 3: Update Page Protection

**Old JWT Method:**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load page content
    loadUserData();
});
```

**New Clerk Method:**
```javascript
window.addEventListener('load', async () => {
    // Protect the page - redirects to login if not authenticated
    const isAuthenticated = await ClerkAuth.protectPage();
    
    if (isAuthenticated) {
        // Load page content
        await loadUserData();
    }
});
```

#### Step 4: Update API Calls

**Old JWT Method:**
```javascript
async function loadUserData() {
    const token = localStorage.getItem('token');
    
    const response = await fetch('/api/users/profile', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const result = await response.json();
    // Handle result
}
```

**New Clerk Method:**
```javascript
async function loadUserData() {
    // ClerkAuth.apiCall automatically adds the auth token
    const result = await ClerkAuth.apiCall('/api/users/profile', {
        method: 'GET'
    });
    
    // Handle result
}
```

#### Step 5: Update Sign Out

**Old JWT Method:**
```javascript
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}
```

**New Clerk Method:**
```javascript
async function logout() {
    await ClerkAuth.signOut();
    // Automatically redirects to login-clerk.html
}
```

## 📄 Example: Migrating profile.html

### Before (JWT):

```html
<!DOCTYPE html>
<html>
<head>
    <title>Profile - SkillSwap</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <div id="profile-content"></div>
    
    <script src="js/main.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const token = localStorage.getItem('token');
            if (!token) {
                window.location.href = 'login.html';
                return;
            }
            
            loadProfile();
        });
        
        async function loadProfile() {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/clerk-auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const result = await response.json();
            // Display profile
        }
        
        function logout() {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    </script>
</body>
</html>
```

### After (Clerk):

```html
<!DOCTYPE html>
<html>
<head>
    <title>Profile - SkillSwap</title>
    <link rel="stylesheet" href="css/style.css">
    
    <!-- Add Clerk SDK -->
    <script
        async
        crossorigin="anonymous"
        data-clerk-publishable-key="pk_test_YOUR_KEY"
        src="https://YOUR_FRONTEND_API.clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    ></script>
</head>
<body>
    <div id="profile-content"></div>
    
    <script src="js/main.js"></script>
    <script src="js/clerk-auth.js"></script>
    <script>
        window.addEventListener('load', async () => {
            // Protect page and sync user
            const isAuth = await ClerkAuth.protectPage();
            
            if (isAuth) {
                await loadProfile();
            }
        });
        
        async function loadProfile() {
            // Automatically includes auth token
            const result = await ClerkAuth.getUserProfile();
            // Display profile
        }
        
        async function logout() {
            await ClerkAuth.signOut();
        }
    </script>
</body>
</html>
```

## 🔧 Updating Backend Routes

### Option 1: Use Clerk Middleware (Recommended)

Update your protected routes to use Clerk authentication:

```javascript
const { requireClerkAuth, extractClerkUser } = require('../middleware/clerkAuth');

// Old JWT route
router.get('/profile', authMiddleware, async (req, res) => {
    const user = await User.findById(req.userId);
    res.json({ success: true, data: user });
});

// New Clerk route
router.get('/profile', requireClerkAuth, extractClerkUser, async (req, res) => {
    const user = await User.findOne({ clerkId: req.clerkUserId });
    res.json({ success: true, data: user });
});
```

### Option 2: Support Both (Backward Compatible)

Create a dual authentication middleware:

```javascript
// server/middleware/dualAuth.js
const { authMiddleware } = require('./auth');
const { requireClerkAuth, extractClerkUser } = require('./clerkAuth');

const dualAuth = async (req, res, next) => {
    // Check for Clerk token first
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        
        // Try Clerk authentication
        try {
            await requireClerkAuth(req, res, () => {});
            await extractClerkUser(req, res, next);
            return;
        } catch (clerkError) {
            // Fall back to JWT
            try {
                await authMiddleware(req, res, next);
                return;
            } catch (jwtError) {
                return res.status(401).json({
                    success: false,
                    message: 'Authentication failed'
                });
            }
        }
    }
    
    return res.status(401).json({
        success: false,
        message: 'No authentication token provided'
    });
};

module.exports = { dualAuth };
```

## 📝 Pages to Migrate

Here's a checklist of pages that need migration:

- [ ] `profile.html`
- [ ] `search.html`
- [ ] `requests.html`
- [ ] `messages.html`
- [ ] `mentor.html`
- [ ] `experiences.html`
- [ ] `redeem.html`
- [ ] `community.html`
- [ ] `startups.html`

## 🎨 Updating Navigation Links

Update navigation links to point to Clerk auth pages:

**Old:**
```html
<a href="login.html">Login</a>
<a href="register.html">Register</a>
```

**New:**
```html
<a href="login-clerk.html">Login</a>
<a href="register-clerk.html">Register</a>
```

## 🔄 User Data Synchronization

Clerk users are automatically synced to your MongoDB database when they:
1. Sign up for the first time
2. Sign in
3. Visit a protected page

The sync happens via the `/api/clerk-auth/sync-user` endpoint.

## 🧪 Testing Your Migration

1. **Test New User Flow:**
   - Sign up at `/register-clerk.html`
   - Verify redirect to profile
   - Check MongoDB for new user with `clerkId`

2. **Test Existing User Flow:**
   - If you have JWT users, they can still use `/login.html`
   - New Clerk users use `/login-clerk.html`

3. **Test Protected Pages:**
   - Try accessing protected page without auth → should redirect
   - Sign in → should access page successfully

4. **Test API Calls:**
   - Verify all API calls work with Clerk tokens
   - Check that user data is correctly retrieved

5. **Test Sign Out:**
   - Sign out → should redirect to login
   - Try accessing protected page → should redirect to login

## 🚀 Gradual Migration Strategy

You can migrate gradually:

1. **Phase 1:** Set up Clerk (✅ Done)
2. **Phase 2:** Create new Clerk login/register pages (✅ Done)
3. **Phase 3:** Migrate one page at a time
4. **Phase 4:** Update all navigation links
5. **Phase 5:** Deprecate old JWT routes (optional)

## ⚠️ Important Notes

1. **Keep JWT Routes:** Don't delete old JWT routes until all users have migrated
2. **Update Links Gradually:** Update navigation links as you migrate pages
3. **Test Thoroughly:** Test each migrated page before moving to the next
4. **Monitor Errors:** Check console for any authentication errors

## 🆘 Common Issues

### Issue: "Clerk is not defined"
**Solution:** Make sure Clerk script loads before your code. Use `window.addEventListener('load', ...)`.

### Issue: "User not found in database"
**Solution:** The user needs to visit a page that calls `ClerkAuth.syncUser()` or `ClerkAuth.protectPage()`.

### Issue: "Infinite redirect loop"
**Solution:** Make sure login pages (`login-clerk.html`, `register-clerk.html`) don't call `ClerkAuth.protectPage()`.

### Issue: "API calls failing with 401"
**Solution:** Verify that:
- Clerk SDK is loaded
- User is authenticated
- Backend routes use Clerk middleware

## 📚 Helper Functions Reference

```javascript
// Check if authenticated
const isAuth = await ClerkAuth.isAuthenticated();

// Get current user from Clerk
const clerkUser = await ClerkAuth.getCurrentUser();

// Get auth token
const token = await ClerkAuth.getToken();

// Sync user with backend
const userData = await ClerkAuth.syncUser();

// Get user profile from backend
const profile = await ClerkAuth.getUserProfile();

// Make authenticated API call
const result = await ClerkAuth.apiCall('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify({ data: 'value' })
});

// Protect page (use in protected pages)
await ClerkAuth.protectPage();

// Sign out
await ClerkAuth.signOut();
```

---

**Ready to migrate?** Start with one page, test it thoroughly, then move to the next!
