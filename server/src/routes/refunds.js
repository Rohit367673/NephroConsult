import express from 'express';
import { z } from 'zod';
import { sendOTPEmail } from '../utils/email.js';
import { telegramService } from '../services/telegramService.js';
import { env } from '../config.js';

const router = express.Router();

// Refund request schema
const refundRequestSchema = z.object({
  email: z.string().email(),
  bookingId: z.string().optional(),
  reason: z.string().min(10, 'Reason must be at least 10 characters'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  amount: z.number().positive().optional(),
  timestamp: z.date()
});

// Submit refund request
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

    const refundRequest = parsed.data;

    // Create refund request object for notifications
    const refundNotification = {
      ...refundRequest,
      id: `REF-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      userAgent: req.headers['user-agent'],
      ip: req.ip || req.connection.remoteAddress
    };

    // Send email notification
    try {
      const emailSubject = `New Refund Request - ${refundNotification.id}`;
      const emailHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #006f6f;">New Refund Request</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #333;">Request Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Request ID:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${refundNotification.id}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${refundRequest.email}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Booking ID:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${refundRequest.bookingId || 'Not provided'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Payment Method:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${refundRequest.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Amount:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${refundRequest.amount ? '$' + refundRequest.amount : 'Not specified'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Reason:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${refundRequest.reason}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Timestamp:</strong></td>
                <td style="padding: 8px 0;">${refundRequest.timestamp.toLocaleString()}</td>
              </tr>
            </table>
          </div>
          <p><strong>Status:</strong> <span style="color: #ffa500;">Pending Review</span></p>
          <p>Please review this refund request and process accordingly.</p>
        </div>
      `;

      await sendOTPEmail(
        env.ADMIN_EMAIL || 'admin@nephroconsultation.com',
        emailSubject,
        emailHtml
      );

      console.log('✅ Refund request email sent to admin');
    } catch (emailError) {
      console.error('❌ Email notification failed:', emailError);
      // Don't fail the request if email fails
    }

    // Send Telegram notification
    try {
      const telegramMessage = `
🔔 NEW REFUND REQUEST

📋 Request ID: ${refundNotification.id}
📧 Email: ${refundRequest.email}
💳 Payment Method: ${refundRequest.paymentMethod}
💰 Amount: ${refundRequest.amount ? '$' + refundRequest.amount : 'Not specified'}
📅 Date: ${refundRequest.timestamp.toLocaleString()}
🔗 Booking ID: ${refundRequest.bookingId || 'Not provided'}

📝 Reason: ${refundRequest.reason}

Status: ⏳ PENDING REVIEW
      `.trim();

      await telegramService.sendMessage(telegramMessage);
      console.log('✅ Refund request Telegram notification sent');
    } catch (telegramError) {
      console.error('❌ Telegram notification failed:', telegramError);
      // Don't fail the request if Telegram fails
    }

    // Log refund request for admin panel
    console.log('💰 REFUND REQUEST:', refundNotification);

    res.json({
      success: true,
      message: 'Refund request submitted successfully! Our team will review it within 2-3 business days.',
      requestId: refundNotification.id
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
