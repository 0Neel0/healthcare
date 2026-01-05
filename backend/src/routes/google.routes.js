import express from 'express';
import { google } from 'googleapis';
import { Doctor } from '../models/doctor.model.js';
import { User } from '../models/user.model.js';
import dotenv from 'dotenv';

import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const router = express.Router();

const getOAuthClient = () => {
    console.log('[getOAuthClient] Config:', {
        clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Missing',
        redirectUri: process.env.GOOGLE_REDIRECT_URI
    });
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
    );
};

// 1. Generate Auth URL
router.get('/auth', (req, res) => {
    try {
        const oauth2Client = getOAuthClient();
        const scopes = [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events'
        ];

        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: scopes,
            prompt: 'consent'
        });

        res.json({ url });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(500).json({ message: 'Failed to generate auth URL' });
    }
});

// 2. Callback URL - Redirect to Frontend
const handleCallback = async (req, res) => {
    const { code } = req.query;
    // Redirect to frontend with code, frontend will call /connect
    res.redirect(`http://localhost:5173/doctor/schedule?code=${code}`);
};

router.get('/callback', handleCallback);
router.get('/', handleCallback); // Fallback

// 3. Connect (Exchange Code for Token)
router.post('/connect', async (req, res) => {
    const { code, doctorId } = req.body;

    if (!code || !doctorId) {
        return res.status(400).json({ message: 'Missing code or doctorId' });
    }

    try {
        console.log('[GoogleConnect] Environment Check:');
        console.log(' - Client ID:', process.env.GOOGLE_CLIENT_ID ? 'Exists' : 'MISSING');
        console.log(' - Client Secret:', process.env.GOOGLE_CLIENT_SECRET ? 'Exists' : 'MISSING');
        console.log(' - Redirect URI:', process.env.GOOGLE_REDIRECT_URI);

        const oauth2Client = getOAuthClient();
        console.log(`[GoogleConnect] Exchanging code for tokens...`);
        const { tokens } = await oauth2Client.getToken(code);

        let doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            // Try via User ID
            const user = await User.findById(doctorId);
            if (user) {
                doctor = await Doctor.findOne({
                    $or: [
                        { email: user.email },
                        { name: user.name },
                        { name: { $regex: new RegExp(`^${user.name.replace(/^Dr\.?\s*/i, '')}$`, 'i') } }
                    ]
                });
            }
        }

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor Profile not found.' });
        }

        doctor.googleCalendar = {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token || doctor.googleCalendar?.refreshToken,
            tokenExpiry: new Date(tokens.expiry_date),
            isConnected: true
        };

        await doctor.save();
        res.json({ message: 'Connected successfully', isConnected: true });

    } catch (error) {
        console.error('Token Exchange Error:', error);
        res.status(500).json({ message: 'Failed to connect: ' + (error.message || 'Unknown') });
    }
});

// 4. List Events
router.get('/events', async (req, res) => {
    const { doctorId } = req.query;
    if (!doctorId) return res.status(400).json({ message: 'Missing doctorId' });

    try {
        let doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            const user = await User.findById(doctorId);
            if (user) {
                doctor = await Doctor.findOne({
                    $or: [
                        { email: user.email },
                        { name: user.name },
                        { name: { $regex: new RegExp(`^${user.name.replace(/^Dr\.?\s*/i, '')}$`, 'i') } }
                    ]
                });
            }
        }

        if (!doctor || !doctor.googleCalendar?.isConnected) {
            return res.json([]);
        }

        const oauth2Client = getOAuthClient();
        oauth2Client.setCredentials({
            access_token: doctor.googleCalendar.accessToken,
            refresh_token: doctor.googleCalendar.refreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
        const response = await calendar.events.list({
            calendarId: 'primary',
            // timeMin: new Date().toISOString(), // Too strict (hides today's earlier events)
            timeMin: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString(),
            maxResults: 250,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items.map(event => ({
            id: event.id,
            title: event.summary || '(No Title)',
            start: event.start.dateTime || event.start.date,
            end: event.end.dateTime || event.end.date,
            allDay: !event.start.dateTime,
            source: 'google',
            htmlLink: event.htmlLink
        }));

        res.json(events);

    } catch (error) {
        console.error('Fetch Events Error:', error);
        res.json([]); // Return empty on error
    }
});

// 5. Disconnect
router.post('/disconnect', async (req, res) => {
    const { doctorId } = req.body;
    try {
        let doctor = await Doctor.findById(doctorId);
        if (!doctor) {
            const user = await User.findById(doctorId);
            if (user) {
                doctor = await Doctor.findOne({
                    $or: [
                        { email: user.email },
                        { name: user.name },
                        { name: { $regex: new RegExp(`^${user.name.replace(/^Dr\.?\s*/i, '')}$`, 'i') } }
                    ]
                });
            }
        }

        if (doctor) {
            doctor.googleCalendar = { isConnected: false };
            await doctor.save();
        }
        res.json({ message: 'Disconnected' });
    } catch (error) {
        res.status(500).json({ message: 'Error disconnecting' });
    }
});

export default router;
