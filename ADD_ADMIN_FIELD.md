# How to Add isAdmin Field in MongoDB

## Quick Method - Using MongoDB Compass

1. **Open MongoDB Compass**
2. **Connect to your database** (usually `looklyn`)
3. **Go to `users` collection**
4. **Find your user document** (search by your email: `mohitop0005@gmail.com`)
5. **Click on the document to edit it**
6. **Click "ADD FIELD" button**
7. **Add this field:**
   - **Field Name**: `isAdmin`
   - **Field Type**: `Boolean`
   - **Value**: `true`
8. **Click "UPDATE" button**
9. **Done!** ✅

---

## Alternative: Using MongoDB Shell

If you prefer using command line:

```javascript
// Connect to your database
use looklyn

// Update your user to add isAdmin field
db.users.updateOne(
  { email: "mohitop0005@gmail.com" },
  { $set: { isAdmin: true } }
)
```

---

## After Adding the Field

1. **Log out** from your website
2. **Log back in** (this refreshes your user data)
3. **Go to** `/admin` - you should now have access!

---

## Verify it Worked

After adding the field, your user document should look like this:

```json
{
  "_id": ObjectId("..."),
  "name": "mohit,",
  "email": "mohitop0005@gmail.com",
  "password": "...",
  "phone": "",
  "addresses": [],
  "isAdmin": true,  // ← This field should be here
  "createdAt": ISODate("..."),
  "__v": 0
}
```

