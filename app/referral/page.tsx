'use client'
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from "react-hot-toast";
import Image from 'next/image';
import { ClipboardIcon, TwitterLogoIcon, InstagramLogoIcon } from "@radix-ui/react-icons";
import mobileapp from '@/public/mobile-app.png'

interface RewardItem {
  count: number;
  reward: string;
  image: string;
}

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState('');
  const [referralCount, setReferralCount] = useState(0);
  const [referralLink, setReferralLink] = useState('');
  const [rewardsInfo, setRewardsInfo] = useState<RewardItem[]>([]);
  const [hoveredReward, setHoveredReward] = useState<RewardItem | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    if (code) {
      setReferralCode(code);
      fetchReferralInfo(code);
    }
  }, [searchParams]);

  const fetchReferralInfo = async (code: string) => {
    try {
      const response = await fetch(`/api/referral-info?code=${code}`);
      if (response.ok) {
        const data = await response.json();
        setReferralCount(data.referralCount);
        setRewardsInfo(data.rewardsInfo);
        setReferralLink(data.referralLink); // Use the server-provided referral link
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch referral info');
      }
    } catch (error) {
      console.error('Error fetching referral info:', error);
      toast.error('Failed to fetch referral information. Please try again later.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      toast.success('Referral link copied to clipboard!');
    });
  };

  const shareOnTwitter = () => {
    const text = `Join me on the waitlist for this amazing product! ${referralLink}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gray-100">
        <div className="bg-[#000F2D] text-white py-2 text-center">
          <h1 className="text-xl font-bold">THANK YOU FOR SIGNING UP</h1>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/2 relative">
              <Image
                src={mobileapp}
                alt="App"
                layout="responsive"
                width={600}
                height={400}
                className="rounded-lg"
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
                <h2 className="text-4xl font-bold mb-2">SHAVING IS</h2>
                <h2 className="text-4xl font-bold">EVOLVING</h2>
              </div>
            </div>
            <div className="md:w-1/2">
              <h3 className="text-2xl font-semibold mb-2">DON'T LEAVE YOUR FRIENDS BEHIND</h3>
              <h4 className="text-3xl font-bold mb-4 text-[#000F2D]">INVITE FRIENDS & EARN PRODUCT</h4>
              <p className="mb-4">Share your unique link via email, Facebook or Twitter and earn rewards for each friend who signs up.</p>
              
              <div className="flex mb-4">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-grow border-2 border-[#000F2D] rounded-l px-4 py-2 text-[#000F2D]"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-[#000F2D] hover:bg-[#001F5C] text-white font-bold py-2 px-4 rounded-r transition-colors"
                >
                  <ClipboardIcon className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex space-x-4 mb-6">
                <button onClick={shareOnFacebook} className="bg-[#4267B2] hover:bg-[#365899] text-white font-bold p-2 rounded transition-colors">
                  <InstagramLogoIcon className="w-6 h-6" />
                </button>
                <button onClick={shareOnTwitter} className="bg-[#1DA1F2] hover:bg-[#0C85D0] text-white font-bold p-2 rounded transition-colors">
                  <TwitterLogoIcon className="w-6 h-6" />
                </button>
              </div>

              <h5 className="text-xl font-semibold mb-4">FRIENDS JOINED</h5>
              <div className="relative pt-1 mb-6">
                <div className="flex mb-2 h-2 overflow-hidden">
                  {rewardsInfo.map((reward, index) => (
                    <div
                      key={index}
                      className={`flex-1 ${
                        referralCount >= reward.count ? 'bg-[#000F2D]' : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between">
                  {rewardsInfo.map((reward, index) => (
                    <div
                      key={index}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        referralCount >= reward.count
                          ? 'bg-[#000F2D] text-white'
                          : 'bg-gray-300 text-gray-600'
                      }`}
                    >
                      {reward.count}
                    </div>
                  ))}
                </div>
              </div>
              
              <ul className="mb-6">
                {rewardsInfo.map((reward, index) => (
                  <li key={index} className="mb-2 flex items-center">
                    <span className={`mr-2 ${referralCount >= reward.count ? 'text-green-600' : 'text-gray-600'}`}>
                      {reward.count} referrals:
                    </span>
                    <span className="font-semibold">{reward.reward}</span>
                  </li>
                ))}
              </ul>

              <p className="text-center text-sm font-semibold">{referralCount} friends have joined</p>
              <p className="text-center text-sm text-gray-500">Keep checking</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}