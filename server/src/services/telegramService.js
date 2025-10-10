import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import { env } from '../config.js';

class TelegramService {
  constructor() {
    this.bot = null;
    this.doctorChatId = null;
    this.initialize();
  }

  async initialize() {
    try {
      if (!env.TELEGRAM_BOT_TOKEN) {
        console.log('[TELEGRAM] Bot token not configured. Telegram notifications disabled.');
        return;
      }

      this.bot = new TelegramBot(env.TELEGRAM_BOT_TOKEN, { polling: false });
      this.doctorChatId = env.DOCTOR_TELEGRAM_CHAT_ID;
      
      console.log('[TELEGRAM] Bot initialized successfully');
      
      // Set up appointment reminder scheduler
      this.setupReminderScheduler();
      
    } catch (error) {
      console.error('[TELEGRAM] Initialization error:', error.message);
    }
  }

  // Send new appointment notification to doctor
  async notifyNewAppointment(appointmentData) {
    if (!this.bot || !this.doctorChatId) {
      console.log('[TELEGRAM] Bot not configured, skipping notification');
      return;
    }

    try {
      const message = this.formatNewAppointmentMessage(appointmentData);
      await this.bot.sendMessage(this.doctorChatId, message, { parse_mode: 'HTML' });
      console.log('[TELEGRAM] New appointment notification sent');
    } catch (error) {
      console.error('[TELEGRAM] Error sending new appointment notification:', error.message);
    }
  }

  // Send appointment reminder (30 minutes before)
  async sendAppointmentReminder(appointmentData) {
    if (!this.bot || !this.doctorChatId) {
      return;
    }

    try {
      const message = this.formatReminderMessage(appointmentData);
      await this.bot.sendMessage(this.doctorChatId, message, { parse_mode: 'HTML' });
      console.log('[TELEGRAM] Appointment reminder sent');
    } catch (error) {
      console.error('[TELEGRAM] Error sending reminder:', error.message);
    }
  }

  formatNewAppointmentMessage(appointment) {
    const date = new Date(appointment.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const time = new Date(appointment.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });

    return `
🩺 <b>NEW APPOINTMENT BOOKED</b>

👤 <b>Patient:</b> ${appointment.patientName || appointment.name}
📧 <b>Email:</b> ${appointment.patientEmail || appointment.email}
📱 <b>Phone:</b> ${appointment.phone || 'Not provided'}

📅 <b>Date:</b> ${date}
⏰ <b>Time:</b> ${time}
💰 <b>Amount:</b> ₹${appointment.amount}
🔄 <b>Type:</b> ${appointment.consultationType || 'Initial Consultation'}

${appointment.symptoms ? `🩹 <b>Symptoms:</b> ${appointment.symptoms}` : ''}
${appointment.medicalHistory ? `📋 <b>Medical History:</b> ${appointment.medicalHistory}` : ''}

<i>Patient will receive meeting link 15 minutes before appointment.</i>
    `.trim();
  }

  formatReminderMessage(appointment) {
    const time = new Date(appointment.date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });

    return `
⏰ <b>APPOINTMENT REMINDER</b>

Your appointment starts in <b>30 minutes</b>

👤 <b>Patient:</b> ${appointment.patientName || appointment.name}
⏰ <b>Time:</b> ${time}
🔄 <b>Type:</b> ${appointment.consultationType || 'Consultation'}

🔗 <b>Meeting Link:</b> ${appointment.meetLink || 'Will be generated automatically'}

<i>Please prepare for your consultation.</i>
    `.trim();
  }

  // Set up cron job to check for upcoming appointments every minute
  setupReminderScheduler() {
    // Run every minute to check for appointments starting in 30 minutes
    cron.schedule('* * * * *', async () => {
      try {
        await this.checkUpcomingAppointments();
      } catch (error) {
        console.error('[TELEGRAM] Reminder scheduler error:', error.message);
      }
    });

    console.log('[TELEGRAM] Appointment reminder scheduler started');
  }

  async checkUpcomingAppointments() {
    try {
      // Import here to avoid circular dependency
      const AppointmentModel = await import('../models/Appointment.js');
      const Appointment = AppointmentModel.default;
      
      if (!Appointment) {
        console.error('[TELEGRAM] Appointment model not available');
        return;
      }
      
      // Get current time and 30 minutes from now
      const now = new Date();
      const thirtyMinutesLater = new Date(now.getTime() + 30 * 60 * 1000);
      const thirtyOneMinutesLater = new Date(now.getTime() + 31 * 60 * 1000);

      // Find appointments starting in 30-31 minutes that haven't been reminded
      const upcomingAppointments = await Appointment.find({
        date: {
          $gte: thirtyMinutesLater,
          $lt: thirtyOneMinutesLater
        },
        status: { $ne: 'cancelled' },
        reminderSent: { $ne: true }
      });

      console.log(`[TELEGRAM] Found ${upcomingAppointments.length} upcoming appointments`);
      
      for (const appointment of upcomingAppointments) {
        try {
          await this.sendAppointmentReminder(appointment);
          
          // Mark reminder as sent to avoid duplicate notifications
          appointment.reminderSent = true;
          await appointment.save();
          console.log(`[TELEGRAM] Reminder sent for appointment ${appointment._id}`);
        } catch (reminderError) {
          console.error(`[TELEGRAM] Error sending reminder for appointment ${appointment._id}:`, reminderError.message);
        }
      }

    } catch (error) {
      console.error('[TELEGRAM] Error checking upcoming appointments:', error.message);
    }
  }

  // Get doctor's chat ID (useful for initial setup)
  async getDoctorChatId(username) {
    if (!this.bot) {
      console.log('[TELEGRAM] Bot not initialized');
      return null;
    }

    try {
      // This is a helper method - the doctor needs to start a conversation with the bot first
      console.log(`[TELEGRAM] To get your chat ID, send a message to your bot @Nephro2025bot`);
      console.log(`[TELEGRAM] Then use the /getchatid command or check server logs`);
      return null;
    } catch (error) {
      console.error('[TELEGRAM] Error getting chat ID:', error.message);
      return null;
    }
  }
}

// Export singleton instance
export const telegramService = new TelegramService();
export default telegramService;
