# NephroConsult Admin Panel Guide

## Overview
The admin panel is a comprehensive dashboard designed exclusively for doctors to manage consultations, create prescriptions, and monitor patient interactions.

## Admin Access

### Authorized Users
Only the following Gmail accounts have admin access:
- `rohit367673@gmail.com`
- `suyambu54321@gmail.com`

### Access Method
1. **Google Login**: Login with one of the authorized Gmail accounts
2. **Automatic Redirect**: System automatically redirects to `/admin` route
3. **Direct Access**: Navigate to `https://yourdomain.com/admin` (protected route)

## Features

### 🏥 Dashboard Overview
- **Real-time Statistics**: Upcoming consultations, completed consultations, total patients
- **Quick Actions**: Access to all major functionalities from the main dashboard
- **Responsive Design**: Optimized for desktop and tablet use

### 📅 Consultation Management

#### Upcoming Consultations
- View all scheduled appointments
- Patient details and contact information
- Uploaded documents and lab reports
- Direct Google Meet integration
- Time zone display (local + IST)

#### Completed Consultations
- History of all finished consultations
- Prescription records
- Patient outcomes tracking

### 👥 Patient Details Panel
- **Patient Information**: Name, email, phone, country
- **Medical Query**: Patient's initial complaint/query
- **Documents**: View and download uploaded reports
- **Consultation Type**: Initial or Follow-up

### 🩺 Prescription System

#### Creating Prescriptions
1. Select a consultation from the list
2. Click "Create Prescription" button
3. Add medicines with:
   - Medicine name
   - Dosage instructions
   - Optional purchase URL (e.g., 1mg.com links)
4. Add general instructions
5. Set next visit date (optional)
6. Submit to automatically:
   - Mark consultation as completed
   - Send prescription to patient's email
   - Update patient's profile

#### Medicine Management
- **Add Multiple Medicines**: Dynamic form to add/remove medicines
- **External Links**: Direct links to online pharmacies
- **Dosage Instructions**: Detailed medication guidance

### 📧 Email Notifications
- **Automatic Prescription Emails**: Sent when prescription is created
- **Meeting Reminders**: Manual reminder system
- **Professional Format**: Branded email templates

### 🔒 Security Features
- **Hardcoded Authentication**: Only specific Gmail accounts allowed
- **Protected Routes**: `/admin` route blocked for unauthorized users
- **Session Management**: Secure login/logout functionality
- **Auto-redirect**: Unauthorized access redirected to homepage

## Usage Workflow

### Daily Routine
1. **Login**: Use authorized Gmail account
2. **Review Dashboard**: Check upcoming consultations
3. **Prepare for Consultations**: Review patient documents and queries
4. **Conduct Meetings**: Use "Join Meeting" buttons for video calls
5. **Create Prescriptions**: After consultations, create and send prescriptions
6. **Monitor Progress**: Track completed consultations and patient outcomes

### Consultation Process
1. **Pre-consultation**:
   - Review patient query and uploaded documents
   - Check patient's medical history
   - Prepare for video call

2. **During Consultation**:
   - Click "Join Meeting" to start Google Meet
   - Conduct video consultation
   - Take notes for prescription

3. **Post-consultation**:
   - Create prescription with medicines and instructions
   - Set follow-up date if needed
   - Submit prescription (auto-emails patient)

### Search and Filter
- **Search**: Find patients by name or email
- **Filter**: View by consultation status
- **Sort**: Toggle between upcoming and completed
- **Quick Access**: Click any consultation for detailed view

## Technical Implementation

### File Structure
```
src/
├── pages/admin/
│   └── AdminDashboard.tsx          # Main admin interface
├── components/
│   └── ProtectedAdminRoute.tsx     # Authentication guard
├── services/
│   └── adminService.ts             # Data management service
└── App.tsx                         # Admin route configuration
```

### Key Components
- **AdminDashboard**: Main admin interface with all features
- **ProtectedAdminRoute**: Security wrapper for admin routes
- **adminService**: Backend service for data management

### Data Management
- **Real-time Updates**: State management with React hooks
- **Mock Data**: Currently using local mock data (ready for API integration)
- **Email Integration**: Prepared for email service integration

## Security Notes

### Route Protection
- `/admin` route is completely separate from patient routes
- No cross-contamination with patient data
- Unauthorized access automatically redirected

### Authentication
- Gmail-based authentication only
- No role-based access (hardcoded emails)
- Secure logout functionality

### Data Integrity
- Patient data remains on patient routes
- Admin actions don't affect patient website
- Separate state management for admin features

## Future Enhancements

### Planned Features
- Real API integration
- Email service integration (SendGrid/AWS SES)
- Google Meet API integration
- Document management system
- Analytics and reporting
- Mobile admin app

### Integration Ready
The admin system is designed for easy integration with:
- Backend APIs
- Email services
- Cloud storage for documents
- Video conferencing APIs
- Analytics platforms

## Support

For technical issues or feature requests related to the admin panel, contact the development team. The system is designed to be intuitive for medical professionals while maintaining high security standards.

---

**Important**: This admin panel is exclusively for medical professionals. Patient data privacy and security are paramount in the system design.
