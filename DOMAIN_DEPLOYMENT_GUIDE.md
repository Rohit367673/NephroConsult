# 🚀 Domain Deployment Guide: www.nephroconultation.com

## ✅ **Completed - Code Changes**:
All code has been updated for your new domain. Here's what needs to be configured on your hosting platforms:

## 🔧 **Next Steps for You**:

### **1. Frontend Deployment (Vercel/Netlify)**

#### **Environment Variables to Add**:
```bash
VITE_API_URL=https://your-backend-domain.com
```

#### **Custom Domain Setup**:
1. Go to your Vercel/Netlify dashboard
2. Navigate to your project → Settings → Domains
3. Add custom domain: `www.nephroconultation.com`
4. Add redirect: `nephroconultation.com` → `www.nephroconultation.com`
5. Enable HTTPS (usually automatic)

### **2. Backend Deployment (Railway/Render/etc)**

#### **Environment Variables to Add**:
```bash
CLIENT_URL=https://www.nephroconultation.com,https://nephroconultation.com
NODE_ENV=production
```

### **3. DNS Configuration**

#### **At Your Domain Registrar (GoDaddy/Namecheap/etc)**:
```dns
Type: CNAME
Name: www
Value: your-vercel-domain.vercel.app (or your hosting platform)

Type: A or CNAME  
Name: @ (root domain)
Value: [redirect to www or same target]
```

### **4. SSL/HTTPS Setup**
- ✅ Most hosting platforms auto-configure SSL
- ✅ Force HTTPS redirect (usually enabled by default)
- ✅ HSTS headers already configured in _headers file

### **5. Testing Checklist**:

#### **After Domain is Live**:
- [ ] Test: https://www.nephroconultation.com
- [ ] Test: https://nephroconultation.com (should redirect to www)
- [ ] Test: CORS by trying to book an appointment
- [ ] Test: Social sharing (Facebook/Twitter link preview)
- [ ] Test: Google Search Console sitemap: `/sitemap.xml`

### **6. SEO Setup**:

#### **Google Search Console**:
1. Add property: `https://www.nephroconultation.com`
2. Verify ownership (HTML file upload method)
3. Submit sitemap: `https://www.nephroconultation.com/sitemap.xml`

#### **Social Media Updates**:
- Update Facebook page URL
- Update Twitter/X profile URL  
- Update LinkedIn company page URL

### **🔍 Common Issue Solutions**:

#### **CORS Errors**:
- Ensure backend `CLIENT_URL` includes both www and non-www versions
- Check browser network tab for actual origin being sent

#### **Mixed Content Warnings**:
- Ensure all resources use HTTPS
- Check browser console for http:// references

#### **404 Errors on Refresh**:
- Configure hosting platform for SPA routing
- Ensure all routes redirect to index.html

## 📞 **Support**:
If you encounter issues:
1. Check browser developer console for errors
2. Verify environment variables are set correctly
3. Test CORS with curl or browser network tab

Your domain integration is now **code-complete** and ready for deployment! 🎉
