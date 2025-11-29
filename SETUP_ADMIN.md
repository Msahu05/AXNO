# How to Set Yourself as Admin

## Step 1: Make Sure You Have a User Account

1. Go to your website and sign up/login with your email
2. Make sure you're logged in

## Step 2: Set Yourself as Admin

You have **2 options** to set yourself as admin:

### **Option 1: Using API Endpoint (Recommended)**

1. Open your browser's developer console (F12)
2. Go to the Console tab
3. Run this command (replace with your email):

```javascript
fetch('http://localhost:3001/api/admin/set-admin', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'YOUR_EMAIL@example.com',
    adminSecret: 'set-admin-secret-in-production'
  })
})
.then(res => res.json())
.then(data => console.log(data))
.catch(err => console.error(err));
```

**Note**: Replace `YOUR_EMAIL@example.com` with your actual email address.

### **Option 2: Using MongoDB Directly**

1. Open MongoDB Compass or your MongoDB client
2. Connect to your database (default: `looklyn`)
3. Go to the `users` collection
4. Find your user document by email
5. Add or update the field: `isAdmin: true`
6. Save the document

## Step 3: Verify Admin Access

1. Log out and log back in (to refresh your user data)
2. Go to `/admin` in your browser
3. You should now see the Admin Dashboard!

## Security Note

**IMPORTANT**: After setting yourself as admin, you should:

1. **Change the admin secret** in your `.env` file:
   ```
   ADMIN_SECRET=your-very-secure-secret-key-here
   ```

2. **Remove or protect the `/api/admin/set-admin` endpoint** in production, or add additional security checks.

3. **Only you should know your admin credentials** - never share your admin account details.

---

## Troubleshooting

- **Can't access `/admin`?** 
  - Make sure you logged out and logged back in after setting `isAdmin: true`
  - Check that `isAdmin: true` is saved in your user document in MongoDB

- **Getting "Admin access required" error?**
  - Your user account doesn't have `isAdmin: true` set
  - Follow Step 2 again to set yourself as admin

- **Want to remove admin access?**
  - Set `isAdmin: false` in your user document in MongoDB

