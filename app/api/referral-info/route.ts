import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
    try {
        const rewardsInfo = [
            {
                count: 2,
                reward: '1 Month of Kobot Standard',
                features: [
                    'Access to standard features',
                    'Priority customer support',
                    'Monthly usage reports',
                ],
            },
            {
                count: 5,
                reward: '1 Week of Kobot Pro',
                features: [
                    'All standard features',
                    'Advanced analytics',
                    'Extended data retention',
                ],
            },
            {
                count: 25,
                reward: '2 Weeks of Kobot Pro',
                features: [
                    'All Pro features',
                    'Customizable dashboard',
                    'Premium support',
                ],
            },
            {
                count: 50,
                reward: '1 Week of Kobot ULTIMATE',
                features: [
                    'All Pro features',
                    'Dedicated account manager',
                    'Advanced data integrations',
                ],
            },
            {
                count: 100,
                reward: '1 Full Month of Kobot ULTIMATE',
                features: [
                    'All ULTIMATE features',
                    '24/7 customer support',
                    'Free feature upgrades',
                ],
            },
        ];

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
                referredBy: true,
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

        return new Response(
            JSON.stringify({ referralCount, referredByEmail, rewardsInfo, referralLink: user.referralLink }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    } catch (error) {
        console.error('Error fetching referral info:', error);
        return new Response(
            JSON.stringify({ error: 'An error occurred while fetching referral information' }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}
