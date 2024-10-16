'use client'
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast, Toaster } from "react-hot-toast";
import Image from 'next/image';
import { ClipboardIcon } from "@radix-ui/react-icons";
import { SocialIcon } from 'react-social-icons';
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
    window.open(`https://x.com/intent/post?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareOnFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`, '_blank');
  };

  const shareOnLinkedIn = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`, '_blank');
  };

  return (
    <>
      <Toaster />
      <div className="min-h-screen bg-gradient-to-br from-[#FCD0A1] to-[#B8E1FF]">
        <div className="bg-[#000F2D] text-white py-4 text-center animate-fadeIn">
          <h1 className="text-3xl font-bold">THANK YOU FOR SIGNING UP</h1>
        </div>
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row gap-12 animate-slideIn">
            <div className="md:w-2/5 relative overflow-hidden rounded-lg shadow-2xl">
              <Image
                src={mobileapp}
                alt="App"
                layout="responsive"
                width={500}
                height={700}
                className="rounded-lg"
              />
              <div className="absolute inset-0 flex flex-col justify-center items-center text-center p-6">
                <div className="bg-black bg-opacity-50 p-4 rounded-lg">
                  <h2 className="text-4xl font-bold text-white mb-2 animate-pulse">SHAVING IS</h2>
                  <h2 className="text-4xl font-bold text-white animate-pulse">EVOLVING</h2>
                </div>
              </div>
            </div>
            <div className="md:w-3/5 bg-white p-10 rounded-lg shadow-2xl">
              <h3 className="text-xl font-semibold mb-2 text-[#000F2D]">DON'T LEAVE YOUR FRIENDS BEHIND</h3>
              <h4 className="text-4xl font-bold mb-6 text-green-600 animate-pulse">INVITE FRIENDS & EARN PRODUCT</h4>
              <p className="mb-6 text-gray-700 text-lg">Share your unique link via email or social media and earn exclusive rewards for each friend who signs up.</p>
              
              <div className="flex mb-6">
                <input
                  type="text"
                  value={referralLink}
                  readOnly
                  className="flex-grow border-2 border-[#000F2D] rounded-l px-4 py-3 text-[#000F2D] focus:outline-none focus:ring-2 focus:ring-[#4ECDC4] text-lg"
                />
                <button
                  onClick={copyToClipboard}
                  className="bg-[#000F2D] hover:bg-[#001F5C] text-white font-bold py-3 px-6 rounded-r transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#4ECDC4]"
                >
                  <ClipboardIcon className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex space-x-6 mb-8">
                <SocialIcon url="https://x.com" onClick={shareOnTwitter} className="hover:scale-110 transition-transform duration-300" />
                <SocialIcon url="https://linkedin.com" onClick={shareOnLinkedIn} className="hover:scale-110 transition-transform duration-300" />
              </div>

              <h5 className="text-2xl font-semibold mb-6 text-[#000F2D]">{referralCount} FRIENDS JOINED</h5>
              <div className="relative pt-1 mb-6">
                <div className="flex justify-between mt-2">
                  {rewardsInfo.map((reward, index) => (
                    <div
                      key={index}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold relative ${
                        referralCount >= reward.count
                          ? 'bg-[#4ECDC4] text-white'
                          : 'bg-gray-300 text-gray-600'
                      } transition-all duration-300 ease-in-out transform hover:scale-110`}
                      onMouseEnter={() => setHoveredReward(reward)}
                      onMouseLeave={() => setHoveredReward(null)}
                    >
                      {reward.count}
                      {hoveredReward === reward && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-white rounded shadow-lg z-10 w-32 animate-fadeIn">
                          <Image src={reward.image} alt={reward.reward} width={100} height={100} className="rounded mb-2" />
                          <p className="text-xs font-semibold text-center text-[#000F2D]">{reward.reward}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* referral counts */}
              <ul className="mb-8 space-y-3">
                {rewardsInfo.map((reward, index) => (
                  <li key={index} className="flex items-center">
                    <span className={`mr-3 text-lg ${referralCount >= reward.count ? 'text-[#4ECDC4]' : 'text-gray-600'}`}>
                      {reward.count} referrals:
                    </span>
                    <span className="font-semibold text-lg">{reward.reward}</span>
                  </li>
                ))}
              </ul>

              {/* referral rewards */}
              {referralCount > 1 && (
                <p className="text-center text-2xl font-bold text-[#FF6B6B] animate-pulse mb-2">
                You have earned {rewardsInfo
                  .filter(r => r.count <= referralCount)
                  .reduce((nearest, current) => 
                    current.count > nearest.count ? current : nearest, 
                    { count: 0, reward: 'rewards' }
                  ).reward}!
              </p>
              )}

              <p className="text-center text-lg text-gray-500">Keep inviting</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
