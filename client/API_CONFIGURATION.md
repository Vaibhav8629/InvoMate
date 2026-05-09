# API Configuration Guide

## Overview

The InvoMate frontend uses a centralized backend API base URL configuration through Vite environment variables. This ensures easy deployment and environment management.

## Environment Variable

All backend API calls use the `VITE_API_URL` environment variable defined in the `.env` file.

### Configuration Files

- **`.env`** - Active environment configuration (not committed to git)
- **`.env.example`** - Template for environment variables (committed to git)

### Setting Up

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `VITE_API_URL` based on your environment:
   - **Local Development**: `http://localhost:5000`
   - **Production**: Your deployed backend URL (e.g., `https://invomate-2.onrender.com`)

## Usage in Code

### Direct Usage

```javascript
// Fetch API
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

// Socket.io
import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_API_URL);
```

### Using Centralized Config

The project includes a centralized API configuration file at `src/config/api.js`:

```javascript
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

// Use predefined endpoints
const response = await fetch(API_ENDPOINTS.AUTH + '/login', {
  credentials: 'include',
  // ...
});

// Or build custom URLs
const response = await fetch(`${API_BASE_URL}/api/custom/endpoint`, {
  credentials: 'include',
  // ...
});
```

## Updated Files

All backend API calls have been updated to use `import.meta.env.VITE_API_URL`:

### Authentication
- `src/store/auth.jsx` - User authentication state management
- `src/pages/Login.jsx` - Login page
- `src/pages/Register.jsx` - Registration page

### Profile & Settings
- `src/pages/Profile.jsx` - User profile management
- `src/pages/Home.jsx` - Dashboard with user data

### Invoice Management
- `src/pages/InvoicePage.jsx` - Invoice creation
- `src/pages/InvoiceView.jsx` - Invoice viewing
- `src/pages/InvoiceList.jsx` - Invoice listing

### Product Management
- `src/pages/ItemsCrud.jsx` - Product CRUD operations

### Components
- `src/components/SignatureUpload.jsx` - Signature upload functionality
- `src/components/DownloadReportButton.jsx` - Report generation
- `src/components/NotificationBell.jsx` - Notifications (if applicable)

### Services
- `src/services/socket.js` - WebSocket connection
- `src/services/notificationApi.js` - Notification API calls

### Configuration
- `src/config/api.js` - Centralized API configuration

## Deployment

### Render Deployment

When deploying to Render:

1. Set the environment variable in Render dashboard:
   - Key: `VITE_API_URL`
   - Value: Your backend URL (e.g., `https://your-backend.onrender.com`)

2. Render will automatically use this value during the build process.

### Other Platforms

For other platforms (Vercel, Netlify, etc.):

1. Add `VITE_API_URL` to your platform's environment variables
2. Set the value to your backend URL
3. Rebuild and redeploy

## Important Notes

1. **No Hardcoded URLs**: All `localhost:5000` and `localhost:3000` references have been removed
2. **Credentials**: All API calls include `credentials: 'include'` for cookie-based authentication
3. **CORS**: Ensure your backend allows requests from your frontend domain
4. **Environment Variables**: Vite environment variables must start with `VITE_` to be exposed to the client
5. **Rebuild Required**: Changes to `.env` require restarting the dev server or rebuilding for production

## Troubleshooting

### API calls failing in production

1. Verify `VITE_API_URL` is set correctly in your deployment platform
2. Check browser console for CORS errors
3. Ensure backend CORS configuration includes your frontend domain
4. Verify the backend is running and accessible

### Environment variable not updating

1. Restart the Vite dev server: `npm run dev`
2. Clear browser cache
3. Check that the variable name starts with `VITE_`

### Socket.io connection issues

1. Verify `VITE_API_URL` doesn't have a trailing slash
2. Check that the backend Socket.io server is running
3. Verify CORS configuration on the backend Socket.io server

## Development Workflow

```bash
# Local development
VITE_API_URL=http://localhost:5000 npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview
```

## Security

- Never commit `.env` file to version control
- Use different API URLs for development, staging, and production
- Keep `.env.example` updated with all required variables (without sensitive values)
