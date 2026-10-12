import React from 'react';
import { Link } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Privacy Policy</h1>
        <p className="text-xs text-espresso-400 mb-8">Effective Date: October 2026 &bull; Kavah & Co. Artisanal Roasters</p>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-espresso-300 space-y-6 font-light leading-relaxed">
          <p>
            At Kavah & Co., your privacy is of utmost importance to our roastery operations. This policy articulates how we collect, safeguard, and utilize customer information across our digital storefront and club subscriptions.
          </p>

          <h2 className="font-serif text-lg font-bold text-white pt-2">1. Information We Collect</h2>
          <p>
            We collect personal identification information including your full name, email address, physical delivery addresses, phone number, and purchase transaction records required to roast, pack, and ship your orders. We do not store raw credit card numbers on our local databases.
          </p>

          <h2 className="font-serif text-lg font-bold text-white pt-2">2. How Your Information Is Utilized</h2>
          <p>
            Your information is strictly utilized to process coffee bean orders, deliver shipping tracking telemetry, manage subscriber roasting schedules, and provide responsive customer care. We never sell, rent, or lease your private personal data to third-party marketing entities.
          </p>

          <h2 className="font-serif text-lg font-bold text-white pt-2">3. Security Standards</h2>
          <p>
            All network communication with our platform is encrypted via Industry-standard Transport Layer Security (TLS/SSL). Passwords are encrypted utilizing salted cryptographic hashing algorithms before being recorded in our database.
          </p>

          <div className="pt-6 border-t border-espresso-800">
            <Link to="/" className="text-amber-400 hover:underline font-semibold text-xs">
              &larr; Return to Kavah Roastery
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
