# ngrok Setup for Windows - Razorpay Webhooks

## Problem: Console closes immediately

यदि `ngrok http 3001` चलाने पर console तुरंत बंद हो जाता है, तो यहाँ solutions हैं:

## Solution 1: ngrok Install करें (अगर installed नहीं है)

### Option A: Direct Download (Recommended)

1. **Download ngrok**:
   - Visit: https://ngrok.com/download
   - Download Windows version
   - Extract the ZIP file
   - Copy `ngrok.exe` to a folder (e.g., `C:\ngrok\`)

2. **Add to PATH** (Optional but Recommended):
   - Right-click "This PC" → Properties → Advanced System Settings
   - Click "Environment Variables"
   - Under "System Variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\ngrok` (or wherever you put ngrok.exe)
   - Click OK on all dialogs

3. **Verify Installation**:
   ```powershell
   ngrok version
   ```

### Option B: Using Chocolatey

```powershell
choco install ngrok
```

### Option C: Using Scoop

```powershell
scoop install ngrok
```

## Solution 2: PowerShell में Properly Run करें

1. **PowerShell को Administrator के रूप में खोलें**:
   - Start Menu में "PowerShell" search करें
   - Right-click → "Run as Administrator"

2. **ngrok run करें**:
   ```powershell
   ngrok http 3001
   ```

3. **अगर error आए**, तो full path use करें:
   ```powershell
   C:\ngrok\ngrok.exe http 3001
   ```

## Solution 3: Command Prompt (CMD) में Run करें

1. **CMD खोलें** (Win + R, type `cmd`, Enter)

2. **Navigate करें** जहाँ ngrok.exe है:
   ```cmd
   cd C:\ngrok
   ngrok http 3001
   ```

   या full path:
   ```cmd
   C:\ngrok\ngrok.exe http 3001
   ```

## Solution 4: ngrok को Sign Up करें (Free Account)

1. Visit: https://dashboard.ngrok.com/signup
2. Free account बनाएं
3. Get your authtoken from dashboard
4. Run:
   ```powershell
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```

## Solution 5: Alternative - localtunnel Use करें

अगर ngrok में problem है, तो **localtunnel** use करें:

### Install localtunnel:
```powershell
npm install -g localtunnel
```

### Run:
```powershell
lt --port 3001
```

यह आपको एक URL देगा जैसे: `https://random-name.loca.lt`

### Razorpay Webhook में Add करें:
```
https://random-name.loca.lt/api/payments/webhook
```

## Solution 6: Alternative - Cloudflare Tunnel

```powershell
# Download from: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/
cloudflared tunnel --url http://localhost:3001
```

## Troubleshooting

### Error: "ngrok is not recognized"
- ngrok PATH में नहीं है
- Solution: Full path use करें या PATH add करें

### Error: "authtoken required"
- ngrok account signup करें और authtoken add करें
- Solution: `ngrok config add-authtoken YOUR_TOKEN`

### Console immediately closes
- PowerShell/CMD को **manually** खोलें (not double-click)
- Command को **type करें** और Enter press करें
- Don't double-click ngrok.exe directly

### Port already in use
- Check if port 3001 is already in use
- Solution: Use different port or stop the service using port 3001

## Step-by-Step: Complete Setup

1. **ngrok Download करें**:
   ```
   https://ngrok.com/download
   ```

2. **Extract करें** और `ngrok.exe` को `C:\ngrok\` में copy करें

3. **PowerShell खोलें** (Administrator)

4. **ngrok को authenticate करें**:
   ```powershell
   cd C:\ngrok
   .\ngrok.exe config add-authtoken YOUR_TOKEN
   ```

5. **Server start करें** (अलग terminal में):
   ```powershell
   cd D:\AXNO\server
   npm run dev
   ```

6. **ngrok start करें** (नया terminal):
   ```powershell
   cd C:\ngrok
   .\ngrok.exe http 3001
   ```

7. **URL copy करें** (जैसे: `https://abc123.ngrok.io`)

8. **Razorpay Dashboard में add करें**:
   - Settings → Webhooks
   - URL: `https://abc123.ngrok.io/api/payments/webhook`

## Quick Test

ngrok चलने के बाद, browser में open करें:
```
http://localhost:4040
```

यह ngrok का web interface है जहाँ आप requests देख सकते हैं।

## Notes

- **Free ngrok**: URL हर restart पर change होगी
- **Paid ngrok**: Fixed domain मिलता है
- **localtunnel**: Free और easy alternative
- Webhooks optional हैं - payments बिना webhooks के भी काम करेंगे

