# 🚀 InvoMate Deployment Guide

## 📋 Prerequisites
- Backend deployed on Render
- MongoDB Atlas database
- Cloudinary account (for image uploads)

---

## 🔧 Backend Deployment (Render) - ✅ COMPLETED

### Your Backend URL:
```
https://your-app-name.onrender.com
```

### Environment Variables on Render:
Add these in your Render dashboard → Environment:

```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NODE_ENV=production

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Frontend URL (add after deploying frontend)
FRONTEND_URL=https://your-frontend-url.vercel.app
```

---

## 🎨 Frontend Deployment Options

### Option 1: Vercel (Recommended)

#### Steps:
1. **Install Vercel CLI** (optional):
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Select the `client` folder as root directory
   - Add environment variables:
     ```
     VITE_API_URL=https://your-backend-url.onrender.com
     ```
   - Click "Deploy"

3. **Deploy via CLI**:
   ```bash
   cd client
   vercel
   ```

#### Vercel Configuration:
Create `vercel.json` in the `client` folder:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### Option 2: Netlify

#### Steps:
1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect your GitHub repository
4. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
6. Click "Deploy"

#### Netlify Configuration:
Create `netlify.toml` in the `client` folder:
```toml
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: Render (Static Site)

#### Steps:
1. Go to your Render dashboard
2. Click "New" → "Static Site"
3. Connect your repository
4. Configure:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist`
5. Add environment variables:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
6. Click "Create Static Site"

---

## 🔄 After Frontend Deployment

### 1. Update Backend CORS
Go to Render dashboard → Your backend service → Environment:
- Add: `FRONTEND_URL=https://your-frontend-url.vercel.app`
- Redeploy the backend

### 2. Test Your Deployment
- Visit your frontend URL
- Try logging in
- Create an invoice
- Check if all features work

---

## 📝 Important Notes

### Cookie Configuration
Your backend is already configured for cookies with `credentials: true`. Make sure:
- Backend and frontend are on HTTPS in production
- CORS is properly configured with your frontend URL

### API URLs
All API calls in your frontend should use the environment variable:
```javascript
const API_URL = import.meta.env.VITE_API_URL;
```

### MongoDB Atlas
Ensure your MongoDB Atlas:
- Allows connections from anywhere (0.0.0.0/0) or add Render's IP
- Has the correct database user credentials

---

## 🐛 Troubleshooting

### CORS Errors
- Check `FRONTEND_URL` is set correctly on Render
- Ensure frontend URL matches exactly (no trailing slash)
- Redeploy backend after adding `FRONTEND_URL`

### Cookie Issues
- Ensure both frontend and backend are on HTTPS
- Check `credentials: 'include'` is in all fetch requests
- Verify `SameSite` cookie settings

### Build Errors
- Check all environment variables are set
- Ensure `node_modules` is in `.gitignore`
- Try `npm install` and `npm run build` locally first

---

## ✅ Deployment Checklist

### Backend (Render):
- [x] Deployed successfully
- [ ] Environment variables added
- [ ] MongoDB connection working
- [ ] Test endpoint accessible
- [ ] FRONTEND_URL added (after frontend deployment)

### Frontend (Vercel/Netlify/Render):
- [ ] Repository connected
- [ ] Build settings configured
- [ ] Environment variables added (`VITE_API_URL`)
- [ ] Deployment successful
- [ ] App accessible and working

### Post-Deployment:
- [ ] Update backend FRONTEND_URL
- [ ] Test login functionality
- [ ] Test invoice creation
- [ ] Test all features
- [ ] Check browser console for errors

---

## 🎉 You're Done!

Your InvoMate app should now be live and accessible to users!

**Backend**: `https://your-backend.onrender.com`  
**Frontend**: `https://your-frontend.vercel.app`

---

## 📞 Need Help?

If you encounter any issues:
1. Check browser console for errors
2. Check Render logs for backend errors
3. Verify all environment variables are set correctly
4. Ensure MongoDB Atlas allows connections
