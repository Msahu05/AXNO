# Fix Admin Access Issue

## Problem
- `isAdmin: true` is in MongoDB (visible in aggregations)
- But not showing in documents view
- Still can't access admin page

## Solution Steps

### Step 1: Verify the Field is Actually Saved

In MongoDB Compass:
1. Go to **Documents** tab (not Aggregations)
2. Click on your user document
3. Click **"UPDATE"** button at the bottom
4. Manually add the field:
   - Click **"ADD FIELD"**
   - Field name: `isAdmin`
   - Type: `Boolean`
   - Value: `true`
5. Click **"UPDATE"** to save

### Step 2: Test the API Directly

Open browser console and run:

```javascript
// Get your auth token
const token = localStorage.getItem('authToken');

// Test the API
fetch('http://localhost:3001/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => {
  console.log('User data:', data);
  console.log('isAdmin:', data.isAdmin);
})
.catch(err => console.error('Error:', err));
```

This will show you if the API is returning `isAdmin: true`.

### Step 3: Clear Cache and Re-login

1. **Clear localStorage:**
   ```javascript
   localStorage.clear();
   ```

2. **Log out** from your website

3. **Log back in** with your email

4. **Go to `/admin`**

### Step 4: If Still Not Working

The issue might be that MongoDB Compass is showing the field in aggregations but it's not actually saved. Try this:

1. In MongoDB Compass, go to **Documents** tab
2. Click on your user document
3. Make sure you see all fields including `isAdmin: true`
4. If `isAdmin` is missing, add it manually and click UPDATE

---

## Quick Test Script

Run this in browser console after logging in:

```javascript
// Check current user data
const token = localStorage.getItem('authToken');
fetch('http://localhost:3001/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('=== USER DATA ===');
  console.log('isAdmin:', data.isAdmin);
  console.log('Full data:', data);
  
  if (data.isAdmin) {
    console.log('✅ You are admin! Try accessing /admin now');
  } else {
    console.log('❌ isAdmin is false or missing. Check MongoDB.');
  }
});
```

