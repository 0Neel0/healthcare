import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

let twilioClient = null;

// Only initialize if credentials are provided
if (accountSid && authToken && twilioPhone) {
    twilioClient = twilio(accountSid, authToken);
}

/**
 * Send appointment confirmation SMS
 * @param {string} to - Recipient phone number
 * @param {object} appointmentDetails - Appointment information
 */
export const sendAppointmentConfirmation = async (to, appointmentDetails) => {
    if (!twilioClient) {
        console.warn('Twilio not configured. Skipping SMS notification.');
        return { success: false, message: 'Twilio not configured' };
    }

    try {
        const message = `
CarePulse Appointment Confirmed! 

Doctor: ${appointmentDetails.doctor}
Date: ${new Date(appointmentDetails.schedule).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })}
Reason: ${appointmentDetails.reason}

Thank you for choosing CarePulse!
        `.trim();

        const result = await twilioClient.messages.create({
            body: message,
            from: twilioPhone,
            to: to
        });

        console.log('SMS sent successfully:', result.sid);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('Error sending SMS:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send appointment scheduled notification SMS
 * @param {string} to - Recipient phone number
 * @param {object} appointmentDetails - Appointment information
 */
export const sendAppointmentScheduled = async (to, appointmentDetails) => {
    if (!twilioClient) {
        console.warn('Twilio not configured. Skipping SMS notification.');
        return { success: false, message: 'Twilio not configured' };
    }

    try {
        const message = `
CarePulse Appointment Scheduled! 

Your appointment has been confirmed.

Doctor: ${appointmentDetails.doctor}
Date: ${new Date(appointmentDetails.schedule).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })}

We look forward to seeing you!
        `.trim();

        const result = await twilioClient.messages.create({
            body: message,
            from: twilioPhone,
            to: to
        });

        console.log('SMS sent successfully:', result.sid);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('Error sending SMS:', error.message);
        return { success: false, error: error.message };
    }
};

/**
 * Send appointment cancellation SMS
 * @param {string} to - Recipient phone number
 * @param {object} appointmentDetails - Appointment information
 */
export const sendAppointmentCancellation = async (to, appointmentDetails) => {
    if (!twilioClient) {
        console.warn('Twilio not configured. Skipping SMS notification.');
        return { success: false, message: 'Twilio not configured' };
    }

    try {
        const message = `
CarePulse Appointment Cancelled

Your appointment has been cancelled.

Doctor: ${appointmentDetails.doctor}
Date: ${new Date(appointmentDetails.schedule).toLocaleString('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        })}
${appointmentDetails.cancellationReason ? `Reason: ${appointmentDetails.cancellationReason}` : ''}

Please contact us to reschedule.
        `.trim();

        const result = await twilioClient.messages.create({
            body: message,
            from: twilioPhone,
            to: to
        });

        console.log('SMS sent successfully:', result.sid);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('Error sending SMS:', error.message);
        return { success: false, error: error.message };
    }
};
