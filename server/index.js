/* global process, Buffer */
import express from 'express';
import { google } from 'googleapis';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// Removed unused import: sheetValuesToObject
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Define jwtClient:
// Adjust CLIENT_EMAIL and PRIVATE_KEY in your environment variables.
// Replace newline characters correctly if needed.
const jwtClient = new google.auth.JWT(
  process.env.CLIENT_EMAIL,
  null,
  process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
  ['https://www.googleapis.com/auth/spreadsheets']
);

app.use(bodyParser.json());
app.use(cors({
    origin: 'https://siac-salud.vercel.app', // Adjust to your production domain.
    credentials: true // Allows cookies across frontend and backend.
}));
app.use(cookieParser());

app.post('/auth/google', async (req, res) => {
    const { token } = req.body;
    if (!token) {
        return res.status(400).json({ error: 'Token no proporcionado' });
    }

    try {
        // Decode token to extract payload.
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const email = decodedToken.email;

        // Verify user permission via Google Sheets.
        const sheets = google.sheets({ version: 'v4', auth: jwtClient });
        const spreadsheetId = '1GQY2sWovU3pIBk3NyswSIl_bkCi86xIwCjbMqK_wIAE';
        const range = 'PERMISOS!A1:C20';

        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range,
            key: process.env.GOOGLE_API_KEY
        });

        const users = response.data.values || [];
        const userExists = users.some(row => row[0] === email);

        if (!userExists) {
            return res.status(403).json({ error: 'No tienes permisos' });
        }

        // Set an HTTP-only cookie with the token.
        res.cookie('auth_token', token, {
            httpOnly: true,
            secure: true, // Use true in HTTPS environments.
            sameSite: 'Strict',
            maxAge: 5 * 24 * 60 * 60 * 1000 // Expires in 5 days.
        });

        res.status(200).json({ success: true, email });
    } catch (error) {
        console.error('Error en la autenticación:', error);
        res.status(500).json({ error: 'Error al procesar la autenticación' });
    }
});

app.get('/auth/verify', (req, res) => {
    const token = req.cookies.auth_token;
    if (!token) {
        return res.status(401).json({ authenticated: false });
    }

    const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    res.status(200).json({ authenticated: true, email: decodedToken.email });
});

app.post('/auth/logout', (req, res) => {
  res.clearCookie('auth_token', {
      httpOnly: true,
      secure: true, // Mantener en true para producción con HTTPS
      sameSite: 'Strict'
  });
  res.status(200).json({ success: true, message: 'Sesión cerrada correctamente' });
});


app.listen(PORT, () => {
    console.log(`Servidor backend en puerto ${PORT}`);
});