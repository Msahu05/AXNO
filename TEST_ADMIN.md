# Test Admin Access - Quick Guide

## Step 1: Verify Field in MongoDB

1. Open MongoDB Compass
2. Go to **Documents** tab (NOT Aggregations)
3. Find your user document
4. **Make sure `isAdmin: true` is visible in the document**
5. If it's not there, click the document, click "UPDATE", add the field, and save

## Step 2: Test API Response

Open browser console (F12) and run:

```javascript
const token = localStorage.getItem('authToken');
fetch('http://localhost:3001/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('=== API Response ===');
  console.log('isAdmin:', data.isAdmin);
  console.log('Full data:', JSON.stringify(data, null, 2));
});
```

**Expected output:**
```json
{
  "id": "...",
  "name": "mohit,",
  "email": "mohitop0005@gmail.com",
  "isAdmin": true,  // ← Should be true
  ...
}
```

## Step 3: Clear and Re-login

1. **Clear everything:**
   ```javascript
   localStorage.clear();
   location.reload();
   ```

2. **Log in again** with your email

3. **Check user data:**
   ```javascript
   // After logging in, check:
   const token = localStorage.getItem('authToken');
   fetch('http://localhost:3001/api/auth/me', {
     headers: { 'Authorization': `Bearer ${token}` }
   })
   .then(r => r.json())
   .then(data => console.log('isAdmin:', data.isAdmin));
   ```

4. **Go to `/admin`**

## Step 4: If Still Not Working

The field might not be saved correctly. Try this MongoDB update:

In MongoDB Compass, go to your user document and make sure:
- Field name is exactly: `isAdmin` (case-sensitive)
- Type is: `Boolean` (not String)
- Value is: `true` (not "true" as a string)

Then click UPDATE and save.

