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
            { count: 2, reward: '1 Month of Kobot Standard', image: "/shave-cream.jpg" },
            { count: 5, reward: '1 Week of Kobot Pro', image: "/truman-handle.jpg" },
            { count: 25, reward: '2 Weeks of Kobot Pro', image: "/winston-set.jpg" },
            { count: 50, reward: '1 Week of Kobot ULTIMATE', image: "/free-blades.jpg" },
            { count: 100, reward: '1 Full Month of Kobot ULTIMATE', image: "/free-blades.jpg" },
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