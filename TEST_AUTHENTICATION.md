# Authentication System Test Guide

## 🧪 **Complete Testing Checklist**

### **Prerequisites**
- ✅ Backend server running on http://localhost:4000
- ✅ Frontend server running on http://localhost:3000
- ✅ MongoDB connection established
- ✅ Session secret configured

### **Test 1: User Registration Flow**

1. **Open the application**
   ```
   http://localhost:3000
   ```

2. **Click "Sign Up" button**
   - Should open the signup modal
   - Form should be visible with all fields

3. **Fill registration form**
   ```
   Name: Test User
   Email: testuser@example.com
   Password: password123
   Confirm Password: password123
   Phone: +1234567890 (optional)
   ```

4. **Submit form**
   - Should show success message
   - Should redirect to login modal
   - User should be created in database

### **Test 2: User Login Flow**

1. **Click "Login" button**
   - Should open login modal

2. **Enter credentials**
   ```
   Email: testuser@example.com
   Password: password123
   ```

3. **Submit login**
   - Should show success message
   - Should redirect to patient dashboard
   - Session should be established

### **Test 3: Session Persistence**

1. **After successful login**
   - Refresh the page (F5)
   - Should remain logged in
   - Should stay on dashboard

2. **Navigate between pages**
   - Should maintain login state
   - Profile menu should show user info

### **Test 4: Logout Flow**

1. **Click logout button**
   - Should clear session
   - Should redirect to home page
   - Should show login/signup buttons again

### **Test 5: Error Handling**

1. **Invalid login credentials**
   ```
   Email: wrong@example.com
   Password: wrongpassword
   ```
   - Should show error message
   - Should not redirect

2. **Duplicate email registration**
   - Try registering with existing email
   - Should show "Email already registered" error

3. **Weak password**
   ```
   Password: 123
   ```
   - Should show "Password must be at least 6 characters" error

### **Test 6: Form Validation**

1. **Empty fields**
   - Try submitting empty forms
   - Should show validation errors

2. **Invalid email format**
   ```
   Email: notanemail
   ```
   - Should show "Invalid email" error

3. **Password mismatch**
   ```
   Password: password123
   Confirm: different123
   ```
   - Should show "Passwords do not match" error

## 🔍 **Backend API Testing**

### **Direct API Tests (Optional)**

```bash
# Test user registration
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test User",
    "email": "apitest@example.com", 
    "password": "password123"
  }'

# Test user login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "apitest@example.com",
    "password": "password123"
  }'

# Test session check
curl -X GET http://localhost:4000/api/auth/me \
  -H "Cookie: nephro.sid=SESSION_ID_HERE"
```

## 🎯 **Expected Results**

### **Successful Registration**
- ✅ User created in MongoDB
- ✅ Password hashed with bcrypt
- ✅ Success toast notification
- ✅ Redirect to login modal

### **Successful Login**
- ✅ Session cookie set
- ✅ User data returned
- ✅ Redirect to appropriate dashboard
- ✅ Navigation updated with user info

### **Session Management**
- ✅ Persistent login across page refreshes
- ✅ Automatic logout on session expiry
- ✅ Secure cookie handling

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"Network Error" or "Failed to fetch"**
   - Check if backend server is running on port 4000
   - Verify CORS configuration
   - Check browser console for errors

2. **"Session not found" errors**
   - Ensure SESSION_SECRET is set in backend .env
   - Check MongoDB connection
   - Verify session store configuration

3. **Login form not submitting**
   - Check browser console for JavaScript errors
   - Verify form validation logic
   - Ensure API URL is correct in frontend .env

4. **Redirects not working**
   - Check React Router configuration
   - Verify navigation logic in auth context
   - Ensure role-based routing is correct

### **Debug Steps**

1. **Check browser console** (F12 → Console)
   - Look for JavaScript errors
   - Check network requests in Network tab

2. **Check backend logs**
   - Server should show request logs
   - Look for error messages or stack traces

3. **Verify environment variables**
   - Frontend: VITE_API_URL should be http://localhost:4000
   - Backend: All required variables should be set

## 📊 **Performance Expectations**

- **Registration**: < 2 seconds
- **Login**: < 1 second  
- **Session check**: < 500ms
- **Page navigation**: Instant (client-side routing)

## ✅ **Success Criteria**

The authentication system is working correctly if:

1. ✅ Users can register new accounts
2. ✅ Users can login with correct credentials
3. ✅ Sessions persist across page refreshes
4. ✅ Users are redirected to appropriate dashboards
5. ✅ Logout clears sessions properly
6. ✅ Error messages are user-friendly
7. ✅ Form validation works correctly
8. ✅ Security measures are in place

## 🎉 **Ready for Production**

Once all tests pass, the authentication system is ready for:
- User registration and login
- Session management
- Role-based access control
- Secure password handling
- Production deployment

**Firebase Google Authentication can be added later by simply adding the credentials to environment variables.**
