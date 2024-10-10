import { google } from 'googleapis';

export async function GET(request: Request) {
    try {
      const url = new URL(request.url);
      const code = url.searchParams.get('code');
  
      if (!code) {
        return new Response(JSON.stringify({ error: 'Referral code is required' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      const auth = new google.auth.GoogleAuth({
        credentials: {
          client_email: process.env.GOOGLE_CLIENT_EMAIL,
          private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        },
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
  
      const sheets = google.sheets({ version: 'v4', auth });
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  
      // Find user by referral code
      const usersResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Users!A:C',
      });
  
      const users = usersResponse.data.values || [];
      const user = users.find(row => row[2] === code);
  
      if (!user) {
        return new Response(JSON.stringify({ error: 'User not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        });
      }
  
      // Count referrals
      const referralsResponse = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Referrals!A:B',
      });
  
      const referrals = referralsResponse.data.values || [];
      const referralCount = referrals.filter(row => row[0] === user[0]).length;
  
      const rewardsInfo = [
        { count: 5, reward: 'Shave Cream' },
        { count: 10, reward: 'Truman Handle w/ Blade' },
        { count: 25, reward: 'Winston Shave Set' },
        { count: 50, reward: 'One Year Free Blades' },
      ];
  
      return new Response(JSON.stringify({ referralCount, rewardsInfo }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Error fetching referral info:', error);
      return new Response(JSON.stringify({ error: 'An error occurred while fetching referral information' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }