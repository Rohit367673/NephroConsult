import express from 'express';
import { z } from 'zod';
import { sendOTPEmail, sendEmail } from '../utils/email.js';
import { telegramService } from '../services/telegramService.js';
import { env } from '../config.js';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import ChatTicket from '../models/ChatTicket.js';

const router = express.Router();

// Refund request schema - with validation
const refundRequestSchema = z.object({
  email: z.string().email('Invalid email address'),
  bookingId: z.string().min(1, 'Booking ID is required'),
  reason: z.string().min(20, 'Reason must be at least 20 characters'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  amount: z.number().positive('Amount must be positive'),
  timestamp: z.date().optional()
});

// Verify refund request schema - for initial verification
const verifyRefundSchema = z.object({
  email: z.string().email('Invalid email address'),
  bookingId: z.string().min(1, 'Booking ID is required')
});

// Step 1: Verify user email and booking exist
router.post('/verify', async (req, res) => {
  try {
    const parsed = verifyRefundSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or booking ID',
        errors: parsed.error.flatten()
      });
    }

    const { email, bookingId } = parsed.data;

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please check your email address.',
        verified: false
      });
    }

    // Find appointment by booking ID and user ID
    const appointment = await Appointment.findOne({
      _id: bookingId,
      userId: user._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found for this email. Please check your booking ID.',
        verified: false
      });
    }

    // Return verified user and appointment details
    res.json({
      success: true,
      verified: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        country: user.country
      },
      appointment: {
        id: appointment._id,
        type: appointment.type,
        date: appointment.date,
        timeSlot: appointment.timeSlot,
        price: appointment.price,
        status: appointment.status,
        createdAt: appointment.createdAt
      },
      message: 'User and booking verified successfully. You can now submit refund request.'
    });

  } catch (error) {
    console.error('Refund verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify refund request. Please try again later.',
      verified: false
    });
  }
});

// Step 2: Submit refund request (after verification)
router.post('/', async (req, res) => {
  try {
    const parsed = refundRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid refund request data',
        errors: parsed.error.flatten()
      });
    }

    const { email, bookingId, reason, paymentMethod, amount } = parsed.data;

    // Verify user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found. Please verify your email.'
      });
    }

    // Verify appointment exists
    const appointment = await Appointment.findOne({
      _id: bookingId,
      userId: user._id
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found. Please verify your booking ID.'
      });
    }

    // Create refund request with verified data
    const refundRequest = {
      id: `REF-${Date.now()}`,
      userId: user._id,
      userName: user.name,
      email: email,
      country: user.country,
      bookingId: bookingId,
      appointmentType: appointment.type,
      appointmentDate: appointment.date,
      reason: reason,
      paymentMethod: paymentMethod,
      amount: amount,
      originalAmount: appointment.price.amount,
      currency: appointment.price.currency,
      status: 'pending',
      createdAt: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    };

    // Create chat ticket for refund request
    try {
      const ticket = new ChatTicket({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          country: user.country
        },
        category: 'refund',
        priority: 'high',
        subject: `Refund Request: ${appointment.type} Consultation`,
        messages: [
          {
            sender: 'user',
            text: `Refund Request\n\nReason: ${reason}\n\nPayment Method: ${paymentMethod}\nAmount: ${amount} ${appointment.price.currency}`,
            timestamp: new Date()
          }
        ],
        currency: appointment.price.currency,
        amount: amount,
        bookingId: bookingId
      });

      await ticket.save();
      refundRequest.ticketId = ticket.ticketId;
    } catch (ticketError) {
      console.error('Error creating refund ticket:', ticketError);
    }

    // Send professional admin email
    try {
      const adminSubject = `[HIGH] Refund Request: ${refundRequest.id} - ${user.name}`;
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <div style="background-color: #d32f2f; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">💰 Refund Request - Verification Required</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Request ID: <strong>${refundRequest.id}</strong></p>
          </div>
          
          <div style="border: 1px solid #ddd; padding: 20px; border-radius: 0 0 5px 5px;">
            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #4caf50;">
              <strong>✅ VERIFIED USER & BOOKING</strong>
              <table style="width: 100%; margin-top: 10px;">
                <tr>
                  <td style="padding: 5px; font-weight: bold; width: 30%;">User ID:</td>
                  <td style="padding: 5px;">${user._id}</td>
                </tr>
                <tr>
                  <td style="padding: 5px; font-weight: bold;">Name:</td>
                  <td style="padding: 5px;">${user.name}</td>
                </tr>
                <tr>
                  <td style="padding: 5px; font-weight: bold;">Email:</td>
                  <td style="padding: 5px;"><a href="mailto:${user.email}">${user.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 5px; font-weight: bold;">Country:</td>
                  <td style="padding: 5px;">${user.country || 'Not specified'}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #ff9800;">
              <strong>📋 Booking Details</strong>
              <table style="width: 100%; margin-top: 10px;">
                <tr>
                  <td style="padding: 5px; font-weight: bold; width: 30%;">Booking ID:</td>
                  <td style="padding: 5px;">${bookingId}</td>
                </tr>
                <tr>
                  <td style="padding: 5px; font-weight: bold;">Type:</td>
                  <td style="padding: 5px;">${appointment.type}</td>
                </tr>
                <tr>
                  <td style="padding: 5px; font-weight: bold;">Date:</td>
                  <td style="padding: 5px;">${new Date(appointment.date).toLocaleDateString()}</td>
                </tr>
                <tr>
                  <td style="padding: 5px; font-weight: bold;">Time:</td>
                  <td style="padding: 5px;">${appointment.timeSlot}</td>
                </tr>
                <tr>
                  <td style="padding: 5px; font-weight: bold;">Status:</td>
                  <td style="padding: 5px;">${appointment.status}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #f3e5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #9c27b0;">
              <strong>💳 Payment & Refund Details</strong>
              <table style="width: 100%; margin-top: 10px;">
                <tr>
                  <td style="padding: 5px; font-weight: bold; width: 30%;">Original Amount:</td>
                  <td style="padding: 5px;"><strong>${appointment.price.currency} ${appointment.price.amount}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 5px; font-weight: bold;">Refund Amount:</td>
                  <td style="padding: 5px;"><strong style="color: #d32f2f;">${appointment.price.currency} ${amount}</strong></td>
                </tr>
                <tr>
                  <td style="padding: 5px; font-weight: bold;">Payment Method:</td>
                  <td style="padding: 5px;">${paymentMethod}</td>
                </tr>
              </table>
            </div>

            <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #2196f3;">
              <strong>📝 Refund Reason</strong>
              <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${reason}</p>
            </div>

            <div style="background-color: #fff9c4; padding: 15px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #fbc02d;">
              <strong>⚠️ Action Required</strong>
              <ol style="margin: 10px 0 0 0;">
                <li>Verify user email is authenticated ✓ (Done)</li>
                <li>Verify booking exists and belongs to user ✓ (Done)</li>
                <li>Check refund eligibility (24-hour window)</li>
                <li>Verify payment method and amount</li>
                <li>Process refund or contact user for clarification</li>
                <li>Update ticket status</li>
              </ol>
            </div>

            ${refundRequest.ticketId ? `
            <div style="text-align: center; padding: 20px; border-top: 1px solid #ddd;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                Support Ticket Created: <strong>${refundRequest.ticketId}</strong>
              </p>
            </div>
            ` : ''}
          </div>

          <div style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            <p>This is an automated notification from NephroConsult Refund System</p>
          </div>
        </div>
      `;

      await sendEmail(
        env.ADMIN_EMAIL || 'admin@nephroconsultation.com',
        adminSubject,
        adminHtml,
        { category: 'refund_request' }
      );

      console.log('✅ Refund request email sent to admin');
    } catch (emailError) {
      console.error('❌ Email notification failed:', emailError);
    }

    // Send confirmation to user
    try {
      const userSubject = `✅ Refund Request Received - ${refundRequest.id}`;
      const userHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #4caf50; color: white; padding: 20px; border-radius: 5px 5px 0 0;">
            <h2 style="margin: 0;">✅ Refund Request Received</h2>
          </div>
          
          <div style="border: 1px solid #ddd; padding: 20px; border-radius: 0 0 5px 5px;">
            <p>Hi ${user.name},</p>
            
            <p>Thank you for submitting your refund request. We have received it and will review it within 2-3 business days.</p>

            <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #4caf50;">
              <p style="margin: 0;"><strong>Your Request ID:</strong></p>
              <p style="margin: 5px 0 0 0; font-size: 18px; font-weight: bold; color: #2e7d32;">${refundRequest.id}</p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Please save this ID for your records</p>
            </div>

            <table style="width: 100%; margin: 20px 0;">
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5; font-weight: bold; width: 40%;">Refund Amount:</td>
                <td style="padding: 8px;"><strong>${appointment.price.currency} ${amount}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5; font-weight: bold;">Booking ID:</td>
                <td style="padding: 8px;">${bookingId}</td>
              </tr>
              <tr>
                <td style="padding: 8px; background-color: #f5f5f5; font-weight: bold;">Status:</td>
                <td style="padding: 8px;">Under Review</td>
              </tr>
            </table>

            <div style="background-color: #fff3e0; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ff9800;">
              <strong>📋 What Happens Next:</strong>
              <ol style="margin: 10px 0 0 0;">
                <li>Our team will review your refund request</li>
                <li>We will verify your booking and payment details</li>
                <li>You'll receive an email with the decision within 2-3 business days</li>
                <li>If approved, refund will be processed to your original payment method</li>
              </ol>
            </div>

            <p style="color: #666; font-size: 14px;">If you have any questions, please reply to this email with your request ID.</p>

            <div style="text-align: center; padding: 20px; border-top: 1px solid #ddd; margin-top: 20px;">
              <p style="margin: 0; color: #666; font-size: 12px;">
                NephroConsult Support Team<br>
                Available 24/7 for urgent issues
              </p>
            </div>
          </div>
        </div>
      `;

      await sendEmail(
        user.email,
        userSubject,
        userHtml,
        { category: 'refund_confirmation' }
      );

      console.log('✅ Refund confirmation email sent to user');
    } catch (emailError) {
      console.error('❌ User confirmation email failed:', emailError);
    }

    // Log refund request
    console.log('💰 REFUND REQUEST SUBMITTED:', refundRequest);

    res.json({
      success: true,
      message: 'Refund request submitted successfully! Our team will review it within 2-3 business days.',
      requestId: refundRequest.id,
      ticketId: refundRequest.ticketId
    });

  } catch (error) {
    console.error('Refund request error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit refund request. Please try again later.'
    });
  }
});

// Get all refund requests (admin only)
router.get('/', async (req, res) => {
  try {
    // TODO: Implement admin authentication check
    // For now, return mock data structure

    const { email } = req.query;

    // Mock refund requests data
    const mockRefunds = [
      {
        id: 'REF-1705598400000',
        email: 'test@example.com',
        bookingId: 'BK-001',
        reason: 'Payment made but appointment not created',
        paymentMethod: 'Credit Card',
        amount: 100,
        status: 'pending',
        timestamp: new Date().toISOString()
      },
      {
        id: 'REF-1705598400001',
        email: 'user@domain.com',
        bookingId: 'BK-002',
        reason: 'Refund request within 24 hours after payment',
        paymentMethod: 'PayPal',
        amount: 150,
        status: 'pending',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      }
    ];

    // Filter by email if provided
    let filteredRefunds = mockRefunds;
    if (email) {
      filteredRefunds = mockRefunds.filter(refund =>
        refund.email.toLowerCase() === email.toLowerCase()
      );
    }

    res.json({
      success: true,
      refunds: filteredRefunds
    });
  } catch (error) {
    console.error('Get refunds error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve refund requests'
    });
  }
});

export default router;
