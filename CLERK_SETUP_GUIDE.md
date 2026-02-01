# Clerk Authentication Setup Guide

This guide will help you integrate Clerk authentication into your SkillSwap application.

## 📋 Prerequisites

- A Clerk account (sign up at https://clerk.com)
- Node.js and npm installed
- Your SkillSwap application

## 🚀 Step-by-Step Setup

### Step 1: Create a Clerk Application

1. Go to https://dashboard.clerk.com
2. Click "Add application" or create a new application
3. Name your application (e.g., "SkillSwap")
4. Choose your authentication methods:
   - ✅ Email/Password (recommended)
   - ✅ Google (optional)
   - ✅ GitHub (optional)
   - ✅ Other social providers as needed

### Step 2: Get Your API Keys

After creating your application, you'll see your API keys:

1. **Publishable Key** - Starts with `pk_test_` or `pk_live_`
2. **Secret Key** - Starts with `sk_test_` or `sk_live_`

**Important:** Keep your Secret Key private! Never commit it to version control.

### Step 3: Configure Environment Variables

1. Open your `.env` file in the root directory
2. Replace the placeholder values with your actual Clerk keys:

```bash
# Clerk Authentication
CLERK_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key_here
CLERK_SECRET_KEY=sk_test_your_actual_secret_key_here
```

### Step 4: Update Frontend Clerk Script

You need to update the Clerk script tags in your HTML files with your actual Clerk Frontend API URL.

#### Files to Update:
- `client/login-clerk.html`
- `client/register-clerk.html`

#### What to Change:

Find this line in both files:
```html
<script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key=""
    src="https://[your-clerk-frontend-api].clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    type="text/javascript"
></script>
```

Replace it with:
```html
<script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="YOUR_PUBLISHABLE_KEY_HERE"
    src="https://YOUR_FRONTEND_API.clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    type="text/javascript"
></script>
```

**How to find your Frontend API URL:**
1. Go to your Clerk Dashboard
2. Navigate to "API Keys"
3. Look for "Frontend API" - it will look like: `clerk.your-app-name.1a2b3c.lcl.dev`

**Example:**
```html
<script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="pk_test_abc123xyz..."
    src="https://clerk.skillswap.1a2b3c.lcl.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    type="text/javascript"
></script>
```

### Step 5: Configure Allowed Redirect URLs

In your Clerk Dashboard:

1. Go to "Paths" or "Settings"
2. Add your allowed redirect URLs:
   - `http://localhost:3000/profile.html`
   - `http://localhost:3000/login-clerk.html`
   - `http://localhost:3000/register-clerk.html`
   - Add your production URLs when deploying

### Step 6: Test the Integration

1. Start your server:
```bash
npm run dev
```

2. Navigate to: `http://localhost:3000/login-clerk.html`

3. Try signing up with a new account

4. Check that:
   - ✅ Sign up works
   - ✅ User is created in Clerk Dashboard
   - ✅ User is synced to your MongoDB database
   - ✅ Redirect to profile page works
   - ✅ User data appears in localStorage

## 🔒 Protecting Pages with Clerk

To protect any page and require authentication, add this to the page's JavaScript:

```html
<!-- Add Clerk SDK -->
<script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="YOUR_PUBLISHABLE_KEY"
    src="https://YOUR_FRONTEND_API.clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
></script>

<!-- Add Clerk Auth Helper -->
<script src="js/clerk-auth.js"></script>

<script>
    // Protect the page
    window.addEventListener('load', async () => {
        await ClerkAuth.protectPage();
        
        // Your page-specific code here
        // User is guaranteed to be authenticated at this point
    });
</script>
```

## 🔄 Making Authenticated API Calls

Use the `ClerkAuth` helper to make authenticated API calls:

```javascript
// Example: Get user profile
const profile = await ClerkAuth.getUserProfile();

// Example: Make custom API call
const result = await ClerkAuth.apiCall('/api/skills', {
    method: 'GET'
});

// Example: Create a new skill
const newSkill = await ClerkAuth.apiCall('/api/skills', {
    method: 'POST',
    body: JSON.stringify({
        name: 'JavaScript',
        category: 'Programming'
    })
});
```

## 🚪 Sign Out

To sign out a user:

```javascript
await ClerkAuth.signOut();
// User will be redirected to login page
```

## 📝 User Data Flow

1. **User Signs Up/In** → Clerk handles authentication
2. **Frontend Gets Token** → Clerk provides session token
3. **Sync with Backend** → POST to `/api/clerk-auth/sync-user`
4. **User Created/Updated** → MongoDB stores user data
5. **LocalStorage Updated** → User info cached for quick access

## 🎨 Customizing Clerk UI

You can customize the appearance of Clerk components in the HTML files:

```javascript
window.Clerk.mountSignIn(signInDiv, {
    appearance: {
        elements: {
            formButtonPrimary: {
                backgroundColor: '#6366f1',
                '&:hover': {
                    backgroundColor: '#4f46e5'
                }
            },
            card: {
                boxShadow: 'none',
                border: 'none'
            }
        }
    }
});
```

## 🔧 Backend Routes

### Clerk Auth Routes (`/api/clerk-auth`)

- **POST `/sync-user`** - Sync Clerk user with database
- **GET `/me`** - Get current user profile
- **GET `/session`** - Verify session

### Legacy JWT Routes (`/api/auth`)

These routes are still available for backward compatibility but will be deprecated:
- POST `/register`
- POST `/login`
- GET `/me`

## 🐛 Troubleshooting

### Issue: "Clerk is not defined"
**Solution:** Make sure the Clerk script is loaded before your custom scripts. Use `window.addEventListener('load', ...)` to wait for Clerk to load.

### Issue: "Invalid publishable key"
**Solution:** Double-check your publishable key in the `.env` file and HTML script tags.

### Issue: "User not synced to database"
**Solution:** Check that:
1. MongoDB is running and connected
2. The `/api/clerk-auth/sync-user` endpoint is accessible
3. The Clerk secret key is correct

### Issue: "Redirect not working"
**Solution:** Verify that your redirect URLs are added to Clerk Dashboard under allowed URLs.

## 🌐 Production Deployment

Before deploying to production:

1. **Update Environment Variables:**
   - Use production Clerk keys (`pk_live_...` and `sk_live_...`)
   - Update `MONGODB_URI` to production database

2. **Update Frontend API URLs:**
   - Replace all Clerk script URLs with production Frontend API

3. **Configure Allowed URLs:**
   - Add production domain to Clerk Dashboard

4. **Enable HTTPS:**
   - Clerk requires HTTPS in production

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk React SDK](https://clerk.com/docs/references/react/overview)
- [Clerk Node.js SDK](https://clerk.com/docs/references/nodejs/overview)
- [Clerk Dashboard](https://dashboard.clerk.com)

## ✅ Checklist

- [ ] Created Clerk application
- [ ] Added API keys to `.env`
- [ ] Updated Clerk script tags in HTML files
- [ ] Configured allowed redirect URLs
- [ ] Tested sign up flow
- [ ] Tested sign in flow
- [ ] Verified user sync to database
- [ ] Tested protected pages
- [ ] Tested sign out

---

**Need Help?** Check the Clerk documentation or reach out to Clerk support at https://clerk.com/support
