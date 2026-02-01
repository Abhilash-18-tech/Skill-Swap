# 🔑 Clerk API Keys - Quick Reference

## What You Need to Provide

### 1. Clerk Publishable Key
- **Location:** Clerk Dashboard → API Keys
- **Format:** `pk_test_...` (development) or `pk_live_...` (production)
- **Used in:** 
  - `.env` file as `CLERK_PUBLISHABLE_KEY`
  - HTML files in the Clerk script tag `data-clerk-publishable-key` attribute

### 2. Clerk Secret Key
- **Location:** Clerk Dashboard → API Keys
- **Format:** `sk_test_...` (development) or `sk_live_...` (production)
- **Used in:** 
  - `.env` file as `CLERK_SECRET_KEY`
- **⚠️ IMPORTANT:** Never expose this key in frontend code!

### 3. Clerk Frontend API URL
- **Location:** Clerk Dashboard → API Keys
- **Format:** `clerk.your-app-name.1a2b3c.lcl.dev` or similar
- **Used in:** 
  - HTML files in the Clerk script `src` attribute

---

## 📝 How to Get Your Keys

1. **Go to Clerk Dashboard:** https://dashboard.clerk.com
2. **Select your application** (or create a new one)
3. **Navigate to:** "API Keys" in the sidebar
4. **Copy the keys:**
   - Publishable Key (safe to expose in frontend)
   - Secret Key (keep private!)
   - Frontend API URL

---

## ✏️ Where to Paste Your Keys

### In `.env` file:
```bash
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

### In `client/login-clerk.html` and `client/register-clerk.html`:

**Find this:**
```html
<script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key=""
    src="https://[your-clerk-frontend-api].clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    type="text/javascript"
></script>
```

**Replace with:**
```html
<script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="pk_test_YOUR_KEY_HERE"
    src="https://YOUR_FRONTEND_API_URL/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    type="text/javascript"
></script>
```

---

## 🎯 Example (with fake keys)

### .env
```bash
CLERK_PUBLISHABLE_KEY=pk_test_Y2xlcmsuZXhhbXBsZS5jb20k
CLERK_SECRET_KEY=sk_test_abcdef123456789
```

### HTML Script Tag
```html
<script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="pk_test_Y2xlcmsuZXhhbXBsZS5jb20k"
    src="https://clerk.example.1a2b3c.lcl.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js"
    type="text/javascript"
></script>
```

---

## ✅ Verification Checklist

After adding your keys, verify:

- [ ] `.env` file has both `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
- [ ] `login-clerk.html` has correct publishable key and Frontend API URL
- [ ] `register-clerk.html` has correct publishable key and Frontend API URL
- [ ] No spaces or quotes around the keys in `.env`
- [ ] Frontend API URL includes the full domain (no `https://` needed in script src)
- [ ] Server restarts after updating `.env` file

---

## 🚀 Next Steps

Once you've added your keys:

1. **Restart your server:** `npm run dev`
2. **Navigate to:** http://localhost:3000/login-clerk.html
3. **Test sign up** with a new email
4. **Verify** user appears in Clerk Dashboard
5. **Check** MongoDB for synced user data

---

## 🆘 Need Help?

If you're having trouble finding your keys:
1. Visit: https://dashboard.clerk.com
2. Click on your application
3. Look for "API Keys" in the left sidebar
4. Copy the keys from there

**Still stuck?** Check the full setup guide in `CLERK_SETUP_GUIDE.md`
