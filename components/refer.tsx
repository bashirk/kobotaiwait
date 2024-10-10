import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

interface RewardItem {
    count: number;
    reward: string;
  }

export default function ReferPage() {
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState<number>(0);
  const [rewardsInfo, setRewardsInfo] = useState<RewardItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const { code } = router.query;
    if (code) {
      setReferralCode(code as string);
      fetchReferralInfo(code as string);
    }
  }, [router.query]);

  const fetchReferralInfo = async (code: string) => {
    try {
      const response = await fetch(`/api/referral-info?code=${code}`);
      if (response.ok) {
        const data = await response.json();
        setReferralCount(data.referralCount);
        setRewardsInfo(data.rewardsInfo);
      }
    } catch (error) {
      console.error('Error fetching referral info:', error);
    }
  };

  const shareOnTwitter = () => {
    const text = `Join me on the waitlist for this amazing product! ${window.location.origin}?ref=${referralCode}`;
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    const url = `${window.location.origin}?ref=${referralCode}`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Head>
        <title>Refer Friends</title>
      </Head>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-extrabold text-center mb-8">Thank You for Joining!</h1>
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900">Your Referral Link</h2>
            <div className="mt-2 sm:flex sm:items-start sm:justify-between">
              <div className="max-w-xl text-sm text-gray-500">
                <p>Share this link with your friends and earn rewards!</p>
              </div>
              <div className="mt-5 sm:mt-0 sm:ml-6 sm:flex-shrink-0 sm:flex sm:items-center">
                <input
                  type="text"
                  readOnly
                  value={`${window.location.origin}?ref=${referralCode}`}
                  className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="mt-5">
              <button onClick={shareOnTwitter} className="mr-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-400 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Share on X
              </button>
              <button onClick={shareOnFacebook} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                Share on Facebook
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Your Referral Progress</h2>
          <p className="text-lg mb-4">You've referred {referralCount} friends so far!</p>
          <div className="space-y-4">
            {rewardsInfo.map((reward, index) => (
              <div key={index} className={`p-4 border rounded-lg ${referralCount >= reward.count ? 'bg-green-100 border-green-300' : 'bg-gray-100 border-gray-300'}`}>
                <p className="font-semibold">{reward.count} Referrals: {reward.reward}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
