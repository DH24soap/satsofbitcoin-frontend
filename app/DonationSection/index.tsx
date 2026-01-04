'use client';

import { useState } from 'react';

export default function DonationSection() {
  const lightningAddress = "lnbc1p54q70app580en3ajuzhtcjl8hvtpknqqsh6kag2rth5g9clpgd2cm49rt5unqdqqcqzzsxqrrs0fppqcumkkpfeyufk2a4ygdvww3yddkd226zesp5uulr233alwt0nv0cx2grs5mhgkyxx3n5hdfud5z4guyvxy5qydhs9qxpqysgqacz2g5hmd5ht4a27wurdsj7x09ee4w3kp3n9g68r7jx5p4nwadlnnan6n6n9swqz9np8mu2ee7gmekzr3u0yxx2hy8p3vqvlrydq5kcp6jnuvn";

  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(lightningAddress);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-lg mt-8 shadow-lg">
      <h2 className="text-2xl font-semibold mb-4 text-center">Support the Oracle</h2>
      <p className="text-gray-400 text-center mb-6">
        Enjoying the Satoshi Oracle? Consider a small donation to keep it running.
      </p>

      <div className="flex flex-col items-center space-y-4">
        <img
          src="/lightning-qr.png"
          alt="Lightning Donation QR Code"
          className="w-48 h-48 bg-white p-2 rounded-lg"
        />

        <div className="w-full max-w-md">
          <div className="flex items-center bg-gray-700 rounded-md p-2">
            <input
              type="text"
              value={lightningAddress}
              readOnly
              className="flex-grow bg-transparent text-sm text-gray-300 focus:outline-none ml-2"
            />
            <button
              onClick={handleCopy}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-md transition duration-300 text-sm"
            >
              {isCopied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}