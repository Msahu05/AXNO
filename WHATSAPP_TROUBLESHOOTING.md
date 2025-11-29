# WhatsApp Integration Troubleshooting Guide

## 🔍 Step-by-Step Debugging

### Step 1: Check Server Startup Logs

When you start your server, you should see:

```
📱 WhatsApp Configuration Check:
   ✅ WhatsApp is configured
   📞 Phone Number ID: Set
   🔑 Access Token: Set (XXX chars)
```

**If you see "⚠️ WhatsApp is NOT configured":**
- Check that `server/.env` file exists
- Verify both variables are set:
  ```env
  WHATSAPP_PHONE_NUMBER_ID=your_number_id
  WHATSAPP_ACCESS_TOKEN=your_token
  ```
- **Restart the server** after adding credentials

### Step 2: Test Configuration Endpoint

1. Login as admin
2. Make a GET request to: `http://localhost:3001/api/test/whatsapp/config`
3. Check the response - it should show:
   ```json
   {
     "configured": true,
     "hasPhoneNumberId": true,
     "hasAccessToken": true,
     "phoneNumberId": "Set (123456789012345)",
     "accessToken": "Set (XXX characters)"
   }
   ```

### Step 3: Test WhatsApp Message

1. Login as admin
2. Make a POST request to: `http://localhost:3001/api/test/whatsapp`
   ```json
   {
     "phone": "919876543210",
     "message": "Test message"
   }
   ```
3. Check server console for detailed logs
4. Check the response for error details

### Step 4: Check Server Console Logs

When you:
- **Request OTP**: Look for `📱 Attempting to send OTP via WhatsApp to:`
- **Place Order**: Look for `📱 Attempting to send order confirmation via WhatsApp to:`

**Common log messages:**
- ✅ `OTP sent via WhatsApp to: 919876543210` - Success!
- ❌ `Failed to send OTP via WhatsApp: [error]` - Check error details
- ⚠️ `WhatsApp not configured` - Credentials missing
- ⚠️ `No phone number found for user` - User doesn't have phone in profile

### Step 5: Verify Phone Number Format

**Correct formats:**
- `919876543210` ✅
- `+91 9876543210` ✅ (will be auto-formatted)
- `9876543210` ✅ (will add 91 automatically)

**Incorrect formats:**
- `9876543210` without country code (if not Indian number)
- Empty string
- Null/undefined

### Step 6: Check User Phone Number

**For OTP:**
- Phone number must be provided in the request
- Check if frontend is sending phone number

**For Order Confirmation:**
- User must have phone number in their profile
- Check database: `User.phone` field
- Phone number is required during signup

### Step 7: Common Errors and Solutions

#### Error: "WhatsApp not configured"
**Solution:**
1. Check `server/.env` file exists
2. Verify variables are set (no quotes needed):
   ```env
   WHATSAPP_PHONE_NUMBER_ID=123456789012345
   WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxx
   ```
3. Restart server

#### Error: "Invalid OAuth access token"
**Solution:**
1. Token might be expired
2. Go to Meta Developer Dashboard
3. WhatsApp > API Setup
4. Generate new token
5. Update `WHATSAPP_ACCESS_TOKEN` in `.env`
6. Restart server

#### Error: "Invalid phone number"
**Solution:**
1. Check phone number format
2. Must include country code (91 for India)
3. Remove +, spaces, dashes
4. Example: `919876543210`

#### Error: "Rate limit exceeded"
**Solution:**
1. Free tier: 1000 conversations/month
2. Wait for next month or upgrade plan
3. Check Meta Dashboard for usage

#### Error: "Message not received"
**Possible causes:**
1. Phone number not registered on WhatsApp
2. Access token expired
3. Phone number format incorrect
4. Check Meta Dashboard for error logs

#### Error: "User doesn't have phone number"
**Solution:**
1. User must add phone number during signup
2. For existing users, update profile with phone number
3. Check `User.phone` field in database

---

## 🧪 Testing Checklist

### Test 1: Configuration Check
- [ ] Server shows "WhatsApp is configured" on startup
- [ ] `/api/test/whatsapp/config` returns `configured: true`

### Test 2: Test Message
- [ ] `/api/test/whatsapp` sends message successfully
- [ ] Message received on WhatsApp
- [ ] Server logs show success

### Test 3: OTP via WhatsApp
- [ ] Request OTP with phone number
- [ ] Server logs show "Attempting to send OTP"
- [ ] OTP received on WhatsApp
- [ ] Can verify OTP successfully

### Test 4: Order Confirmation
- [ ] User has phone number in profile
- [ ] Place test order
- [ ] Server logs show "Attempting to send order confirmation"
- [ ] Order confirmation received on WhatsApp

---

## 📋 Quick Diagnostic Commands

### Check if credentials are loaded:
```bash
# In server directory
node -e "require('dotenv').config(); console.log('Phone ID:', process.env.WHATSAPP_PHONE_NUMBER_ID ? 'Set' : 'Missing'); console.log('Token:', process.env.WHATSAPP_ACCESS_TOKEN ? 'Set (' + process.env.WHATSAPP_ACCESS_TOKEN.length + ' chars)' : 'Missing');"
```

### Check server logs:
Look for these patterns in console:
- `📱 Attempting to send` - WhatsApp is being called
- `✅ WhatsApp message sent` - Success
- `❌ Failed to send` - Error occurred
- `⚠️ WhatsApp not configured` - Credentials missing

---

## 🔧 Manual Testing Steps

1. **Start server** and check startup logs
2. **Login as admin**
3. **Test configuration**: `GET /api/test/whatsapp/config`
4. **Test message**: `POST /api/test/whatsapp` with your phone
5. **Check WhatsApp** for test message
6. **Request OTP** with phone number
7. **Check server logs** for detailed error messages
8. **Place test order** and check logs

---

## 📞 Need More Help?

Check the server console logs - they now include detailed information about:
- Whether WhatsApp is configured
- Phone number formatting
- API request details
- Error messages from Meta API
- Success confirmations

All errors are logged with ❌ and include detailed error information from the WhatsApp API.

