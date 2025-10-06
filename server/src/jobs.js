import Agenda from 'agenda';
import { env } from './config.js';
import { sendEmail } from './utils/email.js';
import { getConsultationReminderTemplate } from './utils/emailTemplates.js';

let agenda = null;

export async function startJobs() {
  if (!env.MONGO_URI) return;
  agenda = new Agenda({ db: { address: env.MONGO_URI, collection: 'jobs' } });

  agenda.define('send_email', async (job) => {
    const { to, subject, html } = job.attrs.data || {};
    if (to && subject && html) {
      await sendEmail(to, subject, html);
    }
  });

  await agenda.start();
}

function parse12hTo24h(time12h) {
  // Ex: "10:30 AM" -> { hours: 10, minutes: 30 }
  const match = String(time12h).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (!match) return { hours: 9, minutes: 0 };
  let [_, h, m, ap] = match;
  let hours = parseInt(h, 10);
  const minutes = parseInt(m, 10);
  const isPM = ap.toUpperCase() === 'PM';
  if (hours === 12) hours = isPM ? 12 : 0;
  else if (isPM) hours += 12;
  return { hours, minutes };
}

export async function scheduleAppointmentReminder(appointment) {
  if (!agenda) return;
  try {
    // Compose Date from date (YYYY-MM-DD) and timeSlot (12h)
    const { hours, minutes } = parse12hTo24h(appointment.timeSlot);
    const scheduledAt = new Date(`${appointment.date}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
    const reminderAt = new Date(scheduledAt.getTime() - 10 * 60 * 1000); // 10 minutes before

    const when = reminderAt.getTime() > Date.now() ? reminderAt : new Date(Date.now() + 1000 * 10);

    // Patient reminder email
    const patientReminderTemplate = getConsultationReminderTemplate(
      appointment.patient.name,
      'Dr. Ilango S. Prakasam',
      new Date(appointment.date).toLocaleDateString(),
      appointment.timeSlot,
      false // isDoctor = false (patient email)
    );

    await agenda.schedule(when, 'send_email', {
      to: appointment.patient.email,
      subject: patientReminderTemplate.subject,
      html: patientReminderTemplate.html
    });

    // Doctor reminder (if doctor email available)
    const doctorEmail = appointment?.doctor?.email;
    if (doctorEmail) {
      const doctorReminderTemplate = getConsultationReminderTemplate(
        appointment.patient.name,
        'Dr. Ilango S. Prakasam',
        new Date(appointment.date).toLocaleDateString(),
        appointment.timeSlot,
        true // isDoctor = true (doctor email)
      );

      await agenda.schedule(when, 'send_email', {
        to: doctorEmail,
        subject: doctorReminderTemplate.subject,
        html: doctorReminderTemplate.html
      });
    }
  } catch (e) {
    // best-effort
  }
}
