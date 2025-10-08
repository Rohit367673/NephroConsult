# Payment 405 Error Fix - Deployment Configuration

## 🚨 Issue Identified
The **405 Method Not Allowed** error occurs because your frontend (deployed on Vercel) is trying to connect to payment endpoints that don't exist on the Vercel deployment. Your backend server is likely deployed separately.

## ✅ Solution Applied
Updated the `razorpayUtils.ts` to use the `VITE_API_URL` environment variable to connect to your backend server.

## 🔧 Required Configuration Steps

### 1. **Update Frontend Environment Variables** (on Vercel)

In your Vercel dashboard → Project Settings → Environment Variables, add:

```bash
VITE_API_URL=https://your-backend-server-domain.com
```

Replace `your-backend-server-domain.com` with your actual backend server URL.

### 2. **Verify Backend Server Deployment**

Make sure your backend server (from `/server` folder) is deployed and running. Test these endpoints:

```bash
# Health check
GET https://your-backend-server-domain.com/api/health

# Payment config  
GET https://your-backend-server-domain.com/api/payments/config
```

### 3. **Backend Environment Variables**

Ensure your backend server has these variables configured:

```bash
NODE_ENV=production
RAZORPAY_KEY_ID=rzp_live_YOUR_LIVE_KEY_ID
RAZORPAY_KEY_SECRET=your_live_key_secret
CLIENT_URL=https://nephro-consult-cea9.vercel.app
```

### 4. **CORS Configuration**

Update your backend's `CLIENT_URL` environment variable to include your Vercel domain:

```bash
CLIENT_URL=https://nephro-consult-cea9.vercel.app,http://localhost:3000
```

### 5. **Deploy Backend Server**

If you haven't deployed your backend yet, deploy it to platforms like:
- **Railway** (recommended for Node.js)
- **Render** 
- **Heroku**
- **DigitalOcean App Platform**

### 6. **Test Payment Flow**

After configuration:
1. Clear browser cache
2. Test payment on live site
3. Check browser console for correct endpoint URLs
4. Verify 200 responses instead of 405

## 🔍 Debugging

Check browser console for:
```
Using payment endpoint: https://your-backend-server-domain.com/api/payments/create-order
```

If you see a relative URL like `/api/payments/create-order`, the environment variable isn't set correctly.

## 📋 Quick Checklist

- [ ] Backend server deployed and accessible
- [ ] `VITE_API_URL` set in Vercel environment variables
- [ ] Backend has correct Razorpay credentials
- [ ] CORS configured with frontend domain
- [ ] Frontend redeployed after env var changes
- [ ] Test payment flow end-to-end

## ❗ Important Notes

1. **Never commit `.env` files** with real credentials
2. **Use live Razorpay keys** for production (not test keys)
3. **Test payments** thoroughly before going live
4. **Monitor server logs** during payment processing

---

After following these steps, your payment system should work correctly on the live website!
