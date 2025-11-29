# Debug Admin Access Issue

## Step 1: Restart Your Server

**IMPORTANT**: After changing the MongoDB field, you need to restart your Node.js server!

1. Stop your server (Ctrl+C in the terminal where it's running)
2. Start it again: `npm run dev` (or `node server/index.js`)

## Step 2: Check Server Logs

After restarting, when you try to access `/admin` or call the API, check your server terminal. You should see debug logs like:

```
=== GET /api/auth/me ===
User email: mohitop0005@gmail.com
User isAdmin (raw): true
User isAdmin (type): boolean
...
```

## Step 3: Test API Directly

Open browser console and run:

```javascript
// Clear everything first
localStorage.clear();

// Then log in again through your website
// After logging in, test:
const token = localStorage.getItem('authToken');
console.log('Token:', token);

fetch('http://localhost:3001/api/auth/me', {
  headers: { 'Authorization': `Bearer ${token}` }
})
.then(r => r.json())
.then(data => {
  console.log('=== API RESPONSE ===');
  console.log('isAdmin:', data.isAdmin);
  console.log('Full response:', JSON.stringify(data, null, 2));
  
  if (data.isAdmin) {
    console.log('✅ SUCCESS! You are admin. Try /admin now.');
  } else {
    console.log('❌ Still false. Check server logs for debug info.');
  }
});
```

## Step 4: Verify MongoDB Field

In MongoDB Compass:
1. Go to **Documents** tab
2. Find your user document
3. Make sure you see: `isAdmin: true` (exactly like this, capital A)
4. The field type should be **Boolean**, not String

## Step 5: If Still Not Working

Check your server terminal logs when you call the API. The debug logs will show exactly what value MongoDB is returning.

If the server logs show `isAdmin: true` but the API returns `false`, there's a code issue.
If the server logs show `isAdmin: false` or `undefined`, the MongoDB field isn't saved correctly.

