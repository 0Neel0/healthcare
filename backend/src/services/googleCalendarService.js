import { google } from 'googleapis';
import { Doctor } from '../models/doctor.model.js';
import dotenv from 'dotenv';
dotenv.config();

const getOAuthClient = () => {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

export const createGoogleCalendarEvent = async (doctorId, appointmentData) => {
    try {
        const doctor = await Doctor.findById(doctorId);
        if (!doctor || !doctor.googleCalendar || !doctor.googleCalendar.isConnected) {
            console.log('[GoogleCalendar] Doctor not connected or not found.');
            return; // Not connected
        }

        const oauth2Client = getOAuthClient();
        oauth2Client.setCredentials({
            access_token: doctor.googleCalendar.accessToken,
            refresh_token: doctor.googleCalendar.refreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const startTime = new Date(appointmentData.schedule);
        const endTime = new Date(startTime.getTime() + 30 * 60000); // 30 mins duration

        const event = {
            summary: `HMS Appt: ${appointmentData.patientName}`,
            description: `Reason: ${appointmentData.reason}`,
            start: { dateTime: startTime.toISOString() },
            end: { dateTime: endTime.toISOString() },
        };

        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        console.log(`[GoogleCalendar] Event created: ${response.data.htmlLink}`);
        return response.data;

    } catch (error) {
        console.error('[GoogleCalendar] Failed to create event:', error.message);
        // Optional: Handle refresh token expiry here if not auto-handled
    }
};
