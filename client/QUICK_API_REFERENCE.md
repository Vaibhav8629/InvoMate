# Quick API Reference

## Environment Variable

```env
VITE_API_URL=https://invomate-2.onrender.com
```

## Usage Patterns

### 1. Direct Fetch (Most Common)

```javascript
const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
  method: 'POST',
  credentials: 'include',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});
```

### 2. Using Centralized Config

```javascript
import { API_BASE_URL, API_ENDPOINTS } from '@/config/api';

// Predefined endpoints
const response = await fetch(`${API_ENDPOINTS.AUTH}/login`, {
  credentials: 'include',
  // ...
});

// Custom endpoint
const response = await fetch(`${API_BASE_URL}/api/custom/endpoint`, {
  credentials: 'include',
  // ...
});
```

### 3. Using Utility Functions

```javascript
import { apiPost, apiGet, apiPut, apiDelete } from '@/utils/api';

// Automatically includes credentials and headers
const response = await apiPost(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
  email,
  password
});
```

### 4. Socket.io Connection

```javascript
import socketService from '@/services/socket';

// Connect (automatically uses VITE_API_URL)
socketService.connect(userId);

// Listen for events
socketService.on('notification', (data) => {
  console.log('New notification:', data);
});

// Emit events
socketService.emit('message', { text: 'Hello' });
```

## Important Rules

1. **Always use** `import.meta.env.VITE_API_URL` - Never hardcode URLs
2. **Always include** `credentials: 'include'` - Required for cookie-based auth
3. **Always use** template literals - `${import.meta.env.VITE_API_URL}/api/...`
4. **Never commit** `.env` file - Only commit `.env.example`

## Common Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/auth/login` | POST | User login |
| `/api/auth/register` | POST | User registration |
| `/api/auth/logout` | POST | User logout |
| `/api/auth/user` | GET | Get current user |
| `/api/auth/findprofile` | GET | Get user profile |
| `/api/auth/createprofile` | POST | Create profile |
| `/api/auth/updateprofile` | PUT | Update profile |
| `/api/auth/getproducts` | GET | Get all products |
| `/api/auth/addproducts` | POST | Add product |
| `/api/auth/updateproduct` | PUT | Update product |
| `/api/auth/deleteproduct/:id` | DELETE | Delete product |
| `/api/auth/product/barcode/:code` | GET | Get product by barcode |
| `/api/auth/saveinvoice` | POST | Save invoice |
| `/api/auth/getinvoices` | GET | Get all invoices |
| `/api/auth/invoice/:id` | GET | Get invoice by ID |
| `/api/signature` | GET | Get signature |
| `/api/signature/upload` | POST | Upload signature |
| `/api/signature` | DELETE | Delete signature |
| `/api/reports/daily` | GET | Get daily report |
| `/api/notifications/*` | * | Notification endpoints |

## Environment Setup

### Development
```bash
# .env
VITE_API_URL=http://localhost:5000
```

### Production
```bash
# .env
VITE_API_URL=https://invomate-2.onrender.com
```

### Switching Environments
```bash
# Just update .env and restart dev server
npm run dev
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| API calls fail | Check `VITE_API_URL` in `.env` |
| CORS errors | Verify backend CORS config |
| 401 Unauthorized | Check cookie settings and credentials |
| Socket not connecting | Verify `VITE_API_URL` has no trailing slash |
| Changes not applying | Restart dev server: `npm run dev` |

## Quick Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Check environment variable
echo $VITE_API_URL  # Linux/Mac
echo %VITE_API_URL%  # Windows CMD
```

## Need More Help?

See `API_CONFIGURATION.md` for detailed documentation.
