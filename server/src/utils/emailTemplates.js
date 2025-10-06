export function getOTPEmailTemplate(otp, userName = 'User') {
  return {
    subject: 'Your NephroConsult Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - NephroConsult</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #006f6f, #004f4f);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .title {
            color: #006f6f;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
          }
          .subtitle {
            color: #666;
            font-size: 16px;
            margin: 8px 0 0 0;
          }
          .otp-container {
            background: #f8f9fa;
            border: 2px dashed #006f6f;
            border-radius: 8px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          .otp-code {
            font-size: 36px;
            font-weight: bold;
            color: #006f6f;
            letter-spacing: 8px;
            margin: 0;
            font-family: 'Courier New', monospace;
          }
          .otp-label {
            color: #666;
            font-size: 14px;
            margin-top: 10px;
          }
          .message {
            font-size: 16px;
            line-height: 1.6;
            margin: 20px 0;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
          .footer a {
            color: #006f6f;
            text-decoration: none;
          }
          @media (max-width: 600px) {
            body {
              padding: 10px;
            }
            .container {
              padding: 20px;
            }
            .otp-code {
              font-size: 28px;
              letter-spacing: 4px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">N</div>
            <h1 class="title">Email Verification</h1>
            <p class="subtitle">NephroConsult - International Kidney Care</p>
          </div>
          
          <div class="message">
            <p>Hello ${userName},</p>
            <p>Thank you for signing up with NephroConsult! To complete your registration, please verify your email address using the code below:</p>
          </div>
          
          <div class="otp-container">
            <p class="otp-code">${otp}</p>
            <p class="otp-label">Verification Code</p>
          </div>
          
          <div class="message">
            <p>Enter this code in the verification screen to activate your account and start accessing our world-class nephrology consultation services.</p>
          </div>
          
          <div class="warning">
            <strong>Important:</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>This code will expire in <strong>5 minutes</strong></li>
              <li>Don't share this code with anyone</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Need help? Contact our support team at <a href="mailto:support@nephroconsult.com">support@nephroconsult.com</a></p>
            <p>© 2024 NephroConsult. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      NephroConsult - Email Verification
      
      Hello ${userName},
      
      Thank you for signing up with NephroConsult! To complete your registration, please verify your email address using the verification code below:
      
      Verification Code: ${otp}
      
      Enter this code in the verification screen to activate your account and start accessing our world-class nephrology consultation services.
      
      Important:
      - This code will expire in 5 minutes
      - Don't share this code with anyone
      - If you didn't request this, please ignore this email
      
      Need help? Contact our support team at support@nephroconsult.com
      
      © 2024 NephroConsult. All rights reserved.
    `
  };
}

export function getPrescriptionEmailTemplate(patientName, doctorName, prescription, consultationDate) {
  return {
    subject: 'Your Prescription from NephroConsult',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Prescription - NephroConsult</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #006f6f, #004f4f);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .title {
            color: #006f6f;
            font-size: 24px;
            font-weight: 600;
            margin: 0;
          }
          .prescription-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .medicine-item {
            background: white;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 10px 0;
          }
          .medicine-name {
            font-weight: 600;
            color: #006f6f;
            font-size: 16px;
          }
          .dosage {
            color: #666;
            margin-top: 5px;
          }
          .instructions {
            background: #e3f2fd;
            border: 1px solid #bbdefb;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">N</div>
            <h1 class="title">Digital Prescription</h1>
            <p style="color: #666; margin: 8px 0 0 0;">NephroConsult - International Kidney Care</p>
          </div>
          
          <div style="margin: 20px 0;">
            <p><strong>Patient:</strong> ${patientName}</p>
            <p><strong>Doctor:</strong> ${doctorName} (Sr. Nephrologist)</p>
            <p><strong>Qualifications:</strong> MD, DNB (Nephrology), MRCP (UK)</p>
            <p><strong>Experience:</strong> 15+ Years Experience</p>
            <p><strong>Consultation Date:</strong> ${consultationDate}</p>
          </div>
          
          <div class="prescription-box">
            <h3 style="color: #006f6f; margin-top: 0;">Prescribed Medications:</h3>
            ${prescription.medicines.map(med => `
              <div class="medicine-item">
                <div class="medicine-name">${med.name}</div>
                <div class="dosage">Dosage: ${med.dosage}</div>
                <div class="dosage">Frequency: ${med.frequency}</div>
                <div class="dosage">Duration: ${med.duration}</div>
              </div>
            `).join('')}
          </div>
          
          ${prescription.instructions ? `
            <div class="instructions">
              <h4 style="margin-top: 0; color: #1976d2;">Special Instructions:</h4>
              <p>${prescription.instructions}</p>
            </div>
          ` : ''}
          
          ${prescription.nextVisit ? `
            <div style="background: #fff3e0; border: 1px solid #ffcc02; border-radius: 6px; padding: 15px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #f57c00;">Next Appointment:</h4>
              <p>${prescription.nextVisit}</p>
            </div>
          ` : ''}
          
          <div class="footer">
            <p><strong>Important:</strong> Take medications as prescribed. Contact us if you experience any side effects.</p>
            <p>© 2024 NephroConsult. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}

export function getConsultationReminderTemplate(patientName, doctorName, appointmentDate, appointmentTime, isDoctor = false) {
  const recipient = isDoctor ? doctorName : patientName;
  const otherParty = isDoctor ? patientName : `${doctorName} (Sr. Nephrologist)`;
  
  return {
    subject: `Consultation Reminder - ${appointmentDate} at ${appointmentTime}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Consultation Reminder - NephroConsult</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
          }
          .logo {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #006f6f, #004f4f);
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
          }
          .reminder-box {
            background: linear-gradient(135deg, #006f6f, #004f4f);
            color: white;
            border-radius: 8px;
            padding: 25px;
            text-align: center;
            margin: 25px 0;
          }
          .appointment-time {
            font-size: 24px;
            font-weight: bold;
            margin: 10px 0;
          }
          .appointment-date {
            font-size: 18px;
            opacity: 0.9;
          }
          .info-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
          }
          .cta-button {
            display: inline-block;
            background: #006f6f;
            color: white;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">N</div>
            <h1 style="color: #006f6f; font-size: 24px; margin: 0;">Consultation Reminder</h1>
            <p style="color: #666; margin: 8px 0 0 0;">NephroConsult - International Kidney Care</p>
          </div>
          
          <div>
            <p>Hello ${recipient},</p>
            <p>This is a friendly reminder about your upcoming consultation:</p>
          </div>
          
          <div class="reminder-box">
            <div class="appointment-date">${appointmentDate}</div>
            <div class="appointment-time">${appointmentTime}</div>
            <p style="margin: 15px 0 5px 0; opacity: 0.9;">
              ${isDoctor ? `with Patient: ${otherParty}` : `with ${otherParty}`}
            </p>
          </div>
          
          <div class="info-box">
            <h4 style="margin-top: 0; color: #006f6f;">What to ${isDoctor ? 'Prepare' : 'Bring'}:</h4>
            ${isDoctor ? `
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Review patient's medical history</li>
                <li>Prepare consultation notes</li>
                <li>Have prescription templates ready</li>
                <li>Ensure stable internet connection</li>
              </ul>
            ` : `
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>List of current medications</li>
                <li>Recent test reports and medical documents</li>
                <li>List of symptoms or concerns</li>
                <li>Ensure stable internet connection</li>
              </ul>
            `}
          </div>
          
          <div style="text-align: center;">
            <a href="http://localhost:3001/video-consultation" class="cta-button">
              Join Consultation
            </a>
          </div>
          
          <div style="background: #fff3e0; border: 1px solid #ffcc02; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Need to reschedule?</strong> Please contact us at least 2 hours before your appointment.</p>
          </div>
          
          <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px;">
            <p>Need help? Contact us at support@nephroconsult.com</p>
            <p>© 2024 NephroConsult. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
}
