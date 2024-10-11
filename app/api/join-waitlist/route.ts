import { PrismaClient } from '@prisma/client';
import { generateReferralCode } from '../../utils/referral';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, referralCode } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    // Check for IP abuse
    const ipAddress = await prisma.ipAddress.upsert({
      where: { address: ip },
      update: { count: { increment: 1 } },
      create: { address: ip, count: 1 },
    });

    if (ipAddress.count >= 3) {
      return new Response(JSON.stringify({ error: 'Too many sign-ups from this IP address' }), { status: 403 });
    }

    // Create user
    const newReferralCode = generateReferralCode();
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}?ref=${newReferralCode}`;

    let referrerData = undefined;

    if (referralCode) {
      const referrer = await prisma.user.findUnique({ 
        where: { referralCode },
        select: { id: true }
      });
      
      if (referrer) {
        referrerData = { connect: { id: referrer.id } };
      } else {
        // Handle invalid referral code
        console.warn(`Invalid referral code used: ${referralCode}`);
        // Optionally, you could throw an error here if you want to prevent sign-up with invalid codes
        // throw new Error('Invalid referral code');
      }
    }

    const newUser = await prisma.user.create({
      data: {
        email,
        referralCode: newReferralCode,
        referralLink,
        referredBy: referrerData,
      },
    });

    return new Response(JSON.stringify({ referralCode: newUser.referralCode }), {
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