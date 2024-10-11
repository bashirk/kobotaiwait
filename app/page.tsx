'use client'
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'
import Image from "next/image";
import { Toaster, toast } from "react-hot-toast";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import Head from 'next/head';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref');

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // join waitlist
    try {
      const response = await fetch('/api/join-waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, referralCode }),
      });
      
      const data = await response.json();
      
      if (data.referralCode) {
        toast.success("You're on the list! Check your referral link.");
        router.push(`/referral?code=${data.referralCode}`);
      } else {
        throw new Error(data.error || 'Error joining waitlist');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster />

      <section className="w-screen h-dvh grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:h-full h-80 bg-[#FCD0A1] relative overflow-hidden">
          <Image
            src="/mobile-app.png"
            alt="Mobile App Screenshots"
            fill
            className="object-contain mt-8 md:mt-24 px-14 object-center"
          />
        </div>

        <main className="flex flex-col gap-8 mt-8 justify-center px-6 pb-10">
          <h1 className="font-semibold tracking-tight text-zinc-900 text-3xl leading-tight md:text-4xl max-w-lg">
            Supercharge your user engagement with locally-grounded chatbots!
          </h1>
          <p className="text-gray-500">
            Join the waitlist to be an early adopter!
          </p>

          <form onSubmit={handleSubmit} method="POST" className="mt-2 max-w-sm">
            <div className="flex flex-col gap-2 lg:flex-row">
              <label className="sr-only" htmlFor="email-address">
                Email address
              </label>
              <input
                autoComplete="email"
                className="text-accent-500 block h-10 w-full focus:invalid:border-red-400 focus:invalid:text-red-500 focus:invalid:ring-red-500 appearance-none rounded-lg border-2 border-slate-300 px-4 py-2 placeholder-zinc-400 duration-200 focus:outline-none focus:ring-zinc-300 sm:text-sm"
                pattern="[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$"
                id="email-address"
                name="email"
                placeholder="johndoe@example.com"
                required
                type="email"
                value={email}
                onChange={handleEmailChange}
                aria-label="Enter your email address"
              />
              <button
                className={`flex h-10 shrink-0 items-center justify-center gap-1 rounded-lg bg-[#000F2D] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-zinc-700 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
              >
                <span>{isLoading ? "Submitting..." : "Join the waitlist"}</span>
              </button>
            </div>
          </form>

          <div className="flex items-start gap-2 text-gray-500">
            <InfoCircledIcon aria-hidden="true" />
            <p className="text-xs -mt-[0.5] max-w-sm">
              Access is limited! If selected, you'll receive an email to join us.
            </p>
          </div>
        </main>
      </section>
    </>
  );
}