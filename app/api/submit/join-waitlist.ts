import { google } from 'googleapis';
import { generateReferralCode } from '../../utils/referral';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    const ip = request.headers.get('x-forwarded-for');

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    // Check for IP abuse
    const ipRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'IpAddresses!A:B',
    });

    const ipData = ipRows.data.values || [];
    const ipRow = ipData.find(row => row[0] === ip);
    const ipCount = ipRow ? parseInt(ipRow[1]) : 0;

    if (ipCount >= 3) {
      return new Response(JSON.stringify({ error: 'Too many sign-ups from this IP address' }), { status: 403 });
    }

    // Create user
    const referralCode = generateReferralCode();
    const now = new Date().toISOString();
    
    const userRows = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Users!A:A',
    });
    const newId = (userRows.data.values?.length || 0) + 1;

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Users!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[newId, email, referralCode, now, now]],
      },
    });

    // Update IP count
    if (ipRow) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `IpAddresses!B${ipData.indexOf(ipRow) + 1}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[ipCount + 1]],
        },
      });
    } else {
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'IpAddresses!A:B',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[ip, 1]],
        },
      });
    }

    return new Response(JSON.stringify({ referralCode }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: 'An error occurred while joining the waitlist' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
