# ✅ Deployment Checklist

Use this checklist to ensure everything is set up correctly before and after deployment.

## Pre-Deployment

### Database Setup
- [ ] MongoDB Atlas account created
- [ ] Free cluster created and running
- [ ] Database user created with strong password
- [ ] IP whitelist configured (0.0.0.0/0 for development)
- [ ] Connection string copied and tested locally
- [ ] Database name added to connection string (`/looklyn`)

### Code Preparation
- [ ] All code pushed to GitHub
- [ ] `.gitignore` includes `.env` files
- [ ] No sensitive data in code
- [ ] Tested locally with MongoDB Atlas connection
- [ ] Build tested locally: `npm run build`

### Environment Variables - Backend
- [ ] `MONGODB_URI` - MongoDB Atlas connection string
- [ ] `JWT_SECRET` - Random 32+ character string
- [ ] `NODE_ENV=production`
- [ ] `PORT` - Render sets this automatically (don't add it)
- [ ] `EMAIL_USER` - Your email (if using email features)
- [ ] `EMAIL_PASS` - Gmail app password (if using email)
- [ ] `ADMIN_SECRET` - Secret for admin operations
- [ ] `PAYMENT_MODE=test` or `production`

### Environment Variables - Frontend
- [ ] `VITE_API_URL` - Your Render backend URL (e.g., `https://your-app.onrender.com/api`)

---

## Backend Deployment (Render)

- [ ] Render account created
- [ ] Web Service created from GitHub repo
- [ ] Service configured:
  - Environment: Node
  - Root Directory: `server`
  - Build Command: `npm install`
  - Start Command: `npm start`
  - Plan: Free (or Starter for $7/month)
- [ ] All environment variables added
- [ ] Deployment successful (wait 5-10 minutes)
- [ ] Backend URL copied (e.g., `https://your-app.onrender.com`)
- [ ] Backend accessible (test in browser/Postman)
- [ ] API endpoints working (test `/api/products`)
- [ ] Note: First request may be slow (30-60 seconds) on free tier

---

## Frontend Deployment (Vercel)

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Build settings configured:
  - Framework: Vite
  - Build Command: `npm run build`
  - Output Directory: `dist`
- [ ] `VITE_API_URL` environment variable set
- [ ] Deployment successful
- [ ] Frontend URL copied
- [ ] Frontend accessible

---

## Post-Deployment Testing

### Basic Functionality
- [ ] Homepage loads correctly
- [ ] Products display correctly
- [ ] User can register new account
- [ ] User can login
- [ ] User can browse products
- [ ] User can view product details
- [ ] User can add to cart
- [ ] User can add to wishlist

### Advanced Features
- [ ] File uploads work (if applicable)
- [ ] Email sending works (if configured)
- [ ] WhatsApp integration works (if configured)
- [ ] Payment flow works (test mode)
- [ ] Admin panel accessible (if applicable)
- [ ] Search functionality works
- [ ] Filters work correctly

### Security Checks
- [ ] HTTPS enabled (automatic on Vercel/Render)
- [ ] CORS configured correctly
- [ ] Environment variables not exposed in frontend
- [ ] API endpoints require authentication where needed
- [ ] File uploads restricted to allowed types

---

## Production Optimizations

- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic)
- [ ] Error tracking set up (optional)
- [ ] Analytics configured (optional)
- [ ] Backup strategy for database
- [ ] Monitoring/alerts set up (optional)

---

## Quick Test URLs

After deployment, test these:

**Backend:**
- `https://your-backend.onrender.com/api/products` - Should return products
- `https://your-backend.onrender.com/api/health` - Health check (if exists)
- Note: First request may take 30-60 seconds on free tier

**Frontend:**
- `https://your-frontend.vercel.app` - Should load homepage
- `https://your-frontend.vercel.app/auth` - Should load auth page

---

## Troubleshooting Quick Reference

| Issue | Solution |
|-------|----------|
| Backend not connecting | Check MongoDB URI, IP whitelist, env vars |
| Frontend API errors | Verify `VITE_API_URL` is correct (Render URL) |
| Slow first request | Normal on Render free tier (cold start, 30-60 sec) |
| CORS errors | CORS already allows all origins, check Render logs |
| Build fails | Check Render build logs, verify dependencies |
| 404 errors | Check routing configuration |

---

## Next Steps After Deployment

1. **Monitor for 24-48 hours**
   - Check Render/Vercel logs
   - Monitor error rates
   - Test all features
   - Note: Free tier may have cold starts

2. **Set up custom domain** (optional)
   - Vercel: Settings → Domains
   - Render: Settings → Custom Domain
   - Update DNS records

3. **Configure production services**
   - Set up production payment gateway
   - Configure email service properly
   - Set up file storage (S3/Cloudinary)

4. **Security hardening**
   - Restrict MongoDB IP whitelist to Render IPs (or keep 0.0.0.0/0 for flexibility)
   - Use strong JWT_SECRET
   - Enable rate limiting (optional)
   - Set up proper backup strategy

---

**🎉 Once all items are checked, your app is live and ready!**

