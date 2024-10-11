import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

        const user = await prisma.user.findUnique({
            where: { referralCode: code },
            include: { 
                referrals: true,
                referredBy: true, // Include information about the referrer
            },
        });

        if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
                status: 404,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const referralCount = await prisma.user.count({
            where: { referredById: user.id },
        });

        const referredByEmail = user.referredBy ? user.referredBy.email : null;

        const rewardsInfo = [
            { count: 5, reward: 'Shave Cream', image: "/shave-cream.jpg" },
            { count: 10, reward: 'Truman Handle w/ Blade', image: "/truman-handle.jpg" },
            { count: 25, reward: 'Winston Shave Set', image: "/winston-set.jpg" },
            { count: 50, reward: 'One Year Free Blades', image: "/free-blades.jpg" },
        ];

        return new Response(JSON.stringify({ referralCount, referredByEmail, rewardsInfo, referralLink: user.referralLink }), {
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