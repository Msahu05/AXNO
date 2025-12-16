# ngrok Authentication Setup

## Step 1: Sign Up for Free Account

1. Visit: https://dashboard.ngrok.com/signup
2. Sign up with your email (free account)
3. Verify your email

## Step 2: Get Your Authtoken

1. After signing up, go to: https://dashboard.ngrok.com/get-started/your-authtoken
2. Copy your authtoken (looks like: `2abc123def456ghi789jkl012mno345pq_6RSTUVWXYZ7abcdefghijklmn`)

## Step 3: Add Authtoken to ngrok

Run this command in PowerShell:

```powershell
ngrok config add-authtoken YOUR_AUTH_TOKEN_HERE
```

Replace `YOUR_AUTH_TOKEN_HERE` with the token you copied.

Example:
```powershell
ngrok config add-authtoken 2abc123def456ghi789jkl012mno345pq_6RSTUVWXYZ7abcdefghijklmn
```

## Step 4: Verify

Now run:
```powershell
ngrok http 3001
```

It should work now! ✅

## Alternative: Use localtunnel (No Signup Required)

If you don't want to sign up for ngrok, use localtunnel instead - it's free and doesn't require authentication.

