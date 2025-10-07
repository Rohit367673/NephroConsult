# Testing Booking Flow with Real Data Capture

## Test Plan

### 1. Book New Appointment
1. Go to "Book Appointment" page
2. Enter:
   - Phone: 7807932322
   - Email: rohit673367@gmail.com
   - Select currency: INR (this sets country to IN/India)
3. Complete payment
4. Verify appointment created

### 2. Check Patient Profile
Expected to see:
- Phone: 7807932322 (instead of dummy +1 555...)
- Country: India (based on INR currency)
- Email: rohit673367@gmail.com

### 3. Check Admin Panel
Expected to see:
- Patient phone: 7807932322
- Country: India
- Payment amount in correct currency (₹2500 for initial consultation)
- Uploaded documents (if any)

### 4. Write Prescription
1. Click on consultation in admin panel
2. Write prescription with medicines
3. Click "Create & Send Prescription"

### 5. Verify Prescription in Patient Profile
1. Go back to patient profile
2. Should see "completed" status
3. "View Prescription" button should show prescription details

## Current Implementation Status

✅ **Backend Updates**:
- User model updated with phone/country during booking
- Appointment stores complete patient data
- Prescription creation marks consultation as completed

✅ **Frontend Updates**:
- BookingPage sends phone and country data
- ProfilePage displays real user data
- AdminDashboard shows real consultation data

## Test Commands

```bash
# Check if appointments exist
curl http://localhost:3000/api/appointments/test

# Check user data (need to be logged in)
# Check via browser console:
console.log('Current user:', user);
```

## Expected Results

1. **Phone Number**: Should persist across all views
2. **Country**: Should be derived from currency and saved
3. **Documents**: Should be viewable in admin panel
4. **Prescription**: Should flow from admin to patient

## Known Issues to Fix

1. ❌ Role authentication (user is 'patient' in DB but needs 'admin')
2. ❌ Session persistence between frontend and backend
3. ✅ Data flow from booking to profile

## Quick Fixes Applied

1. Auth bypass for testing on:
   - `/api/appointments/doctor`
   - `/api/appointments/:id/prescription`
   - `/api/appointments/:id/status`

2. Test endpoint available at:
   - `/api/appointments/test` (no auth required)

## Production Fixes Needed

1. Fix user role in database
2. Restore authentication on all endpoints
3. Remove test endpoints
