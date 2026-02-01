# 🚀 Deployment Guide - SkillSwap with Clerk Authentication

This guide will help you deploy your SkillSwap application with Clerk authentication to production.

## 📋 Pre-Deployment Checklist

- [x] Clerk authentication integrated
- [x] API keys configured in `.env`
- [x] Frontend Clerk SDK configured
- [ ] Production Clerk keys obtained
- [ ] Deployment platform chosen
- [ ] Production database ready
- [ ] Environment variables configured on hosting platform

## 🎯 Deployment Options

### Option 1: Render (Recommended for Full-Stack Apps)
### Option 2: Vercel (Great for Frontend + Serverless)
### Option 3: Heroku
### Option 4: Railway
### Option 5: DigitalOcean/AWS/GCP

---

## 🔧 Option 1: Deploy to Render (Recommended)

Render is great for Node.js applications and offers free tier hosting.

### Step 1: Prepare Your Application

1. **Create a `.gitignore` file** (if not exists):
```
node_modules/
.env
.DS_Store
*.log
```

2. **Commit your code to Git**:
```bash
git init
git add .
git commit -m "Initial commit with Clerk authentication"
```

3. **Push to GitHub**:
```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/Skills-Swap.git
git branch -M main
git push -u origin main
```

### Step 2: Set Up Production Clerk Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **API Keys**
4. Switch to **Production** keys (or create a new production instance)
5. Copy your production keys:
   - `pk_live_...` (Publishable Key)
   - `sk_live_...` (Secret Key)

### Step 3: Deploy to Render

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `skillswap` (or your preferred name)
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for better performance)

### Step 4: Configure Environment Variables on Render

In the Render dashboard, add these environment variables:

```
MONGODB_URI=your_production_mongodb_uri
PORT=3000
NODE_ENV=production
JWT_SECRET=skillswap_8b7f2de1_secret_9942_key
JWT_KEY=skillswap_8b7f2de1_secret_9942_key
SESSION_SECRET=session_4f9d3a7e_secure_8812_token
CLERK_PUBLISHABLE_KEY=pk_live_YOUR_PRODUCTION_KEY
CLERK_SECRET_KEY=sk_live_YOUR_PRODUCTION_SECRET
```

### Step 5: Update Frontend Clerk Configuration

After deployment, you need to update your HTML files with production Clerk keys.

**Option A: Use Environment-Based Configuration (Recommended)**

Create a new file `client/js/config.js`:
```javascript
// Auto-detect environment
const isProduction = window.location.hostname !== 'localhost';

const config = {
    clerkPublishableKey: isProduction 
        ? 'pk_live_YOUR_PRODUCTION_KEY'
        : 'pk_test_dXByaWdodC1zaGluZXItMjYuY2xlcmsuYWNjb3VudHMuZGV2JA',
    apiUrl: isProduction
        ? 'https://your-app.onrender.com/api'
        : '/api'
};
```

**Option B: Manual Update**

Update `login-clerk.html` and `register-clerk.html`:
```html
<script async crossorigin="anonymous" 
    data-clerk-publishable-key="pk_live_YOUR_PRODUCTION_KEY"
    src="https://YOUR_PRODUCTION_FRONTEND_API.clerk.accounts.dev/npm/@clerk/clerk-js@latest/dist/clerk.browser.js">
</script>
```

### Step 6: Configure Clerk Allowed URLs

1. Go to Clerk Dashboard → Your App → **Paths** or **Settings**
2. Add your production URLs:
   - `https://your-app.onrender.com`
   - `https://your-app.onrender.com/profile.html`
   - `https://your-app.onrender.com/login-clerk.html`
   - `https://your-app.onrender.com/register-clerk.html`

### Step 7: Deploy!

1. Click **"Create Web Service"** on Render
2. Wait for the build to complete (5-10 minutes)
3. Your app will be live at: `https://your-app.onrender.com`

---

## 🔧 Option 2: Deploy to Vercel

Vercel is excellent for frontend applications with serverless functions.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Create `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "client/**",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "client/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 3: Deploy

```bash
vercel
```

Follow the prompts and add environment variables when asked.

---

## 🔧 Option 3: Deploy to Railway

Railway offers easy deployment with automatic HTTPS.

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login and Deploy

```bash
railway login
railway init
railway up
```

### Step 3: Add Environment Variables

```bash
railway variables set MONGODB_URI="your_mongodb_uri"
railway variables set CLERK_PUBLISHABLE_KEY="pk_live_..."
railway variables set CLERK_SECRET_KEY="sk_live_..."
# Add other variables...
```

---

## 🗄️ Database Setup

### MongoDB Atlas (Recommended)

1. **Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)**
2. **Create a new cluster** (free tier available)
3. **Create a database user**:
   - Username: `skillswap_user`
   - Password: (generate a strong password)
4. **Whitelist IP addresses**:
   - Add `0.0.0.0/0` to allow all IPs (for cloud deployments)
   - Or add your specific deployment platform IPs
5. **Get connection string**:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password
   - Update `MONGODB_URI` in your environment variables

---

## 🔒 Security Checklist

Before deploying, ensure:

- [ ] `.env` file is in `.gitignore`
- [ ] Production Clerk keys are used (not test keys)
- [ ] MongoDB connection uses strong password
- [ ] MongoDB network access is configured
- [ ] CORS is properly configured for your domain
- [ ] HTTPS is enabled (most platforms do this automatically)
- [ ] Sensitive data is not logged in production
- [ ] Rate limiting is considered for API endpoints

---

## 🧪 Testing Your Deployment

After deployment, test these features:

1. **Authentication Flow**:
   - [ ] Visit your production URL
   - [ ] Sign up with a new account
   - [ ] Verify email (if enabled in Clerk)
   - [ ] Sign in with created account
   - [ ] Check that user is synced to MongoDB

2. **Protected Routes**:
   - [ ] Try accessing `/profile.html` without auth → should redirect
   - [ ] Sign in → should access profile successfully

3. **API Endpoints**:
   - [ ] Test `/api/health` endpoint
   - [ ] Test authenticated API calls
   - [ ] Verify data persistence in MongoDB

4. **Sign Out**:
   - [ ] Sign out → should redirect to login
   - [ ] Verify session is cleared

---

## 🐛 Common Deployment Issues

### Issue: "Cannot connect to MongoDB"
**Solutions:**
- Verify MongoDB connection string is correct
- Check that IP whitelist includes `0.0.0.0/0` or deployment platform IPs
- Ensure database user has correct permissions

### Issue: "Clerk authentication not working"
**Solutions:**
- Verify production Clerk keys are set
- Check that allowed URLs include your production domain
- Ensure Frontend API URL is correct in HTML files
- Check browser console for Clerk errors

### Issue: "502 Bad Gateway" or "Application Error"
**Solutions:**
- Check deployment logs for errors
- Verify all environment variables are set
- Ensure `PORT` is correctly configured
- Check that `npm start` command works locally

### Issue: "CORS errors"
**Solutions:**
- Update CORS configuration in `server/index.js`:
```javascript
app.use(cors({
    origin: ['https://your-production-domain.com', 'http://localhost:3000'],
    credentials: true
}));
```

---

## 📊 Monitoring and Maintenance

### Logging

Add logging to track issues:
```javascript
// In server/index.js
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
```

### Health Check

Your app already has a health endpoint at `/api/health`. Monitor it regularly.

### Database Backups

- MongoDB Atlas provides automatic backups
- Consider setting up additional backup strategies for critical data

---

## 🔄 Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Render

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Trigger Render Deploy
        run: curl -X POST ${{ secrets.RENDER_DEPLOY_HOOK }}
```

---

## 📝 Post-Deployment Tasks

1. **Update Clerk Settings**:
   - Configure email templates
   - Set up social login providers (Google, GitHub, etc.)
   - Customize authentication UI

2. **Domain Configuration** (Optional):
   - Purchase a custom domain
   - Configure DNS settings
   - Update Clerk allowed URLs with custom domain

3. **Analytics** (Optional):
   - Add Google Analytics
   - Set up error tracking (Sentry, LogRocket)
   - Monitor user behavior

4. **Performance Optimization**:
   - Enable caching
   - Optimize images
   - Minify CSS/JS (if not done automatically)

---

## 🎉 You're Live!

Congratulations! Your SkillSwap application with Clerk authentication is now deployed!

### Share Your App:
- Production URL: `https://your-app.onrender.com`
- Login: `https://your-app.onrender.com/login-clerk.html`
- Register: `https://your-app.onrender.com/register-clerk.html`

### Next Steps:
1. Share with users and gather feedback
2. Monitor error logs and fix issues
3. Add new features based on user requests
4. Scale your infrastructure as needed

---

## 🆘 Need Help?

- **Render Support**: https://render.com/docs
- **Clerk Support**: https://clerk.com/support
- **MongoDB Atlas Support**: https://www.mongodb.com/support

---

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Clerk Production Checklist](https://clerk.com/docs/deployments/production-checklist)
- [MongoDB Atlas Best Practices](https://www.mongodb.com/docs/atlas/best-practices/)
- [Node.js Production Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

Good luck with your deployment! 🚀
