# 🚀 Production Deployment Checklist

## ✅ Pre-Deployment Security Checks

### Environment Variables
- [ ] **.env files added to .gitignore** ✅ DONE
- [ ] **No sensitive data in repository** ✅ DONE
- [ ] **.env.example files updated** ✅ DONE
- [ ] **All required environment variables documented** ✅ DONE

### Security Configurations
- [ ] **Production security headers enabled** ✅ DONE
- [ ] **CORS properly configured** ✅ DONE
- [ ] **Rate limiting implemented** ✅ DONE
- [ ] **Test endpoints disabled in production** ✅ DONE
- [ ] **Input validation with Zod schemas** ✅ DONE

## 🔧 Infrastructure Setup

### Database (MongoDB Atlas)
- [ ] **Create production MongoDB Atlas cluster**
- [ ] **Configure database user with appropriate permissions**
- [ ] **Set up IP whitelist or allow all (0.0.0.0/0) for production**
- [ ] **Copy connection string to MONGO_URI**
- [ ] **Test database connectivity**

### Domain & SSL
- [ ] **Purchase and configure domain name**
- [ ] **Set up SSL/TLS certificate (Let's Encrypt or CloudFlare)**
- [ ] **Configure DNS records pointing to your server**
- [ ] **Verify HTTPS is working**

### Email Service (Gmail SMTP)
- [ ] **Enable 2-factor authentication on Gmail account**
- [ ] **Generate app-specific password**
- [ ] **Test email sending functionality**
- [ ] **Configure SMTP_FROM with your domain**

## 💰 Payment Setup (Razorpay)

### Account Setup
- [ ] **Complete Razorpay account verification (KYC)**
- [ ] **Activate live mode in Razorpay dashboard**
- [ ] **Obtain live API keys (rzp_live_...)**
- [ ] **Configure settlement account for payments**

### Integration
- [ ] **Update RAZORPAY_KEY_ID with live key**
- [ ] **Update RAZORPAY_KEY_SECRET with live secret**
- [ ] **Update client REACT_APP_RAZORPAY_KEY_ID**
- [ ] **Configure webhook URL: https://your-domain.com/api/payments/webhook**
- [ ] **Test payment flow with small amounts**

### Webhook Configuration
- [ ] **Go to Razorpay Dashboard → Settings → Webhooks**
- [ ] **Add webhook URL with your production domain**
- [ ] **Select events: payment.captured, payment.failed, order.paid**
- [ ] **Add webhook secret (optional but recommended)**
- [ ] **Test webhook notifications**

## 🔥 Firebase Setup

### Project Configuration
- [ ] **Create Firebase project or use existing**
- [ ] **Enable Authentication methods (Google, Email/Password)**
- [ ] **Add production domain to authorized domains**
- [ ] **Generate service account key**
- [ ] **Configure environment variables**

### Security Rules
- [ ] **Configure Firestore security rules**
- [ ] **Set up proper authentication flows**
- [ ] **Test authentication in production**

## 🖥️ Server Deployment

### Hosting Provider Setup (Railway/Heroku/DigitalOcean)
- [ ] **Choose hosting provider**
- [ ] **Create new application/droplet**
- [ ] **Configure environment variables**
- [ ] **Set NODE_ENV=production**
- [ ] **Deploy server code**

### Environment Variables (Production)
```bash
NODE_ENV=production
PORT=4000
CLIENT_URL=https://your-domain.com
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/nephroconsult
SESSION_SECRET=super-secure-session-secret-for-production
OWNER_EMAIL=admin@yourdomain.com
RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your-live-secret-key
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="NephroConsult <no-reply@yourdomain.com>"
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### Deployment Commands
```bash
cd server
npm install
npm run start:prod
```

## 🌐 Frontend Deployment

### Build Configuration
- [ ] **Update VITE_API_URL to production API URL**
- [ ] **Update REACT_APP_RAZORPAY_KEY_ID to live key**
- [ ] **Configure Firebase credentials for production**
- [ ] **Build production bundle**

### Deployment (Vercel/Netlify)
```bash
cd "International Nephrology Consultation Platform"
npm install
npm run build
# Deploy dist/ folder
```

### Environment Variables (Client)
```bash
REACT_APP_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXX
VITE_API_URL=https://your-api-domain.com
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## 🧪 Production Testing

### Functionality Tests
- [ ] **User registration and login**
- [ ] **OTP email verification**
- [ ] **Appointment booking flow**
- [ ] **Payment processing with real money (small amounts)**
- [ ] **Email notifications (confirmations, reminders)**
- [ ] **Doctor login and consultation management**
- [ ] **Prescription creation and email delivery**

### Payment Testing
- [ ] **Test with ₹10 payment (India)**
- [ ] **Test with $1 payment (International)**
- [ ] **Verify payment confirmation emails**
- [ ] **Check Razorpay dashboard for transaction logs**
- [ ] **Test failed payment scenarios**

### Performance Testing
- [ ] **Load testing with multiple users**
- [ ] **Payment gateway response times**
- [ ] **Email delivery performance**
- [ ] **Database query optimization**

## 📊 Monitoring Setup

### Health Checks
- [ ] **Set up uptime monitoring (UptimeRobot, Pingdom)**
- [ ] **Configure health check endpoint monitoring**
- [ ] **Set up error alerting (email/Slack)**

### Analytics
- [ ] **Set up payment analytics dashboard**
- [ ] **Configure user behavior tracking**
- [ ] **Monitor consultation booking rates**
- [ ] **Track email delivery success rates**

### Logging
- [ ] **Configure production logging levels**
- [ ] **Set up error logging and alerting**
- [ ] **Monitor payment transaction logs**
- [ ] **Track system performance metrics**

## 🔐 Security Final Checks

### SSL/HTTPS
- [ ] **Verify SSL certificate is working**
- [ ] **Test HTTPS redirect from HTTP**
- [ ] **Check SSL rating (A+ grade recommended)**

### API Security
- [ ] **Verify CORS configuration**
- [ ] **Test rate limiting**
- [ ] **Check input validation on all endpoints**
- [ ] **Verify authentication on protected routes**

### Payment Security
- [ ] **Confirm webhook signature verification**
- [ ] **Test payment signature validation**
- [ ] **Verify no sensitive payment data is logged**
- [ ] **Check PCI compliance measures**

## 📱 Mobile Testing

### Responsive Design
- [ ] **Test on iOS Safari**
- [ ] **Test on Android Chrome**
- [ ] **Verify payment flow on mobile**
- [ ] **Check video consultation interface**

## 🎯 Go-Live Checklist

### Final Preparations
- [ ] **All team members notified of go-live date**
- [ ] **Customer support documentation ready**
- [ ] **Backup and recovery procedures tested**
- [ ] **Rollback plan prepared**

### Launch Day
- [ ] **Deploy production code**
- [ ] **Verify all systems operational**
- [ ] **Test critical user flows**
- [ ] **Monitor error rates and performance**
- [ ] **Announce launch to stakeholders**

### Post-Launch
- [ ] **Monitor for 24 hours continuously**
- [ ] **Check payment success rates**
- [ ] **Verify email delivery**
- [ ] **Gather user feedback**
- [ ] **Document any issues and resolutions**

## 🚨 Emergency Contacts

### Technical Issues
- **Server Issues**: Check hosting provider status
- **Payment Issues**: Razorpay support dashboard
- **Email Issues**: Gmail/SMTP provider support
- **Domain Issues**: DNS provider support

### Rollback Procedure
1. **Identify the issue**
2. **Revert to previous working version**
3. **Notify users of temporary maintenance**
4. **Fix issue in development**
5. **Re-test and redeploy**

---

## ✅ Sign-off

- [ ] **Technical Lead Approval**: ________________
- [ ] **Security Review Complete**: ________________
- [ ] **Payment Testing Verified**: ________________
- [ ] **Ready for Production**: ________________

**Deployment Date**: ________________  
**Deployed By**: ________________  
**Production URL**: ________________

---

**🎉 Congratulations! Your NephroConsult platform is now live!**
