import { PrismaClient } from '@prisma/client';
import { generateReferralCode } from '../../utils/referral';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, referralCode } = await request.json();
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!referralCode) {
      return new Response(JSON.stringify({ error: 'Referral code is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check for IP abuse
    const ipAddress = await prisma.ipAddress.upsert({
      where: { address: ip },
      update: { count: { increment: 1 } },
      create: { address: ip, count: 1 },
    });

    if (ipAddress.count >= 3) {
      return new Response(JSON.stringify({ error: 'Too many sign-ups from this IP address' }), { status: 403 });
    }

    // Verify referral code
    const referrer = await prisma.user.findUnique({ 
      where: { referralCode },
      select: { id: true }
    });
    
    if (!referrer) {
      return new Response(JSON.stringify({ error: 'Invalid referral code' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Create user
    const newReferralCode = generateReferralCode();
    const referralLink = `${process.env.NEXT_PUBLIC_BASE_URL}?ref=${newReferralCode}`;

    const newUser = await prisma.user.create({
      data: {
        email,
        referralCode: newReferralCode,
        referralLink,
        referredBy: { connect: { id: referrer.id } },
      },
    });

    return new Response(JSON.stringify({ referralCode: newUser.referralCode }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return new Response(JSON.stringify({ error: 'Email already exists in the waitlist' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
