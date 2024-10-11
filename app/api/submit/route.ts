import { google } from 'googleapis';
import { generateReferralCode } from '../../utils/referral';

export async function POST(request: Request) {
  const { email } = await request.json();
  const ip = request.headers.get('x-forwarded-for') || 'unknown';

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  try {
    const referralCode = generateReferralCode();
    const now = new Date().toISOString();

    // Append user data
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Users!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [['id',email, referralCode, now, now, ip]],
      },
    });

    return new Response(JSON.stringify({ success: true, referralCode }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Google Sheets API error:', error);
    return new Response(JSON.stringify({ success: false, error: 'Failed to submit' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
