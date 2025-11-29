# ⚠️ IMPORTANT: Fix Field Name Case

## The Problem

In your MongoDB document, the field is named **`isadmin`** (all lowercase), but the code is looking for **`isAdmin`** (camelCase).

MongoDB is **case-sensitive** for field names, so `isadmin` ≠ `isAdmin`.

## The Fix

### Option 1: Update in MongoDB Compass (Recommended)

1. **Go to Documents tab** in MongoDB Compass
2. **Click on your user document**
3. **Click "UPDATE" button** at the bottom
4. **Delete the `isadmin` field** (click the X next to it)
5. **Add new field:**
   - Click **"ADD FIELD"**
   - Field name: **`isAdmin`** (capital A - exactly like this)
   - Type: **Boolean**
   - Value: **`true`**
6. **Click "UPDATE"** to save

### Option 2: Using MongoDB Shell

```javascript
// Connect to your database
use axno

// Update the field name from isadmin to isAdmin
db.users.updateOne(
  { email: "mohitop0005@gmail.com" },
  { 
    $rename: { "isadmin": "isAdmin" }
  }
)
```

## After Fixing

1. **Clear browser localStorage:**
   ```javascript
   localStorage.clear();
   ```

2. **Log out and log back in**

3. **Test the API:**
   ```javascript
   const token = localStorage.getItem('authToken');
   fetch('http://localhost:3001/api/auth/me', {
     headers: { 'Authorization': `Bearer ${token}` }
   })
   .then(r => r.json())
   .then(data => console.log('isAdmin:', data.isAdmin)); // Should be true
   ```

4. **Go to `/admin`** - it should work now!

---

**The field name MUST be exactly `isAdmin` (capital A) to match the code!**

