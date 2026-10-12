import React from 'react';
import { Link } from 'react-router-dom';

export const Terms: React.FC = () => {
  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Terms of Service</h1>
        <p className="text-xs text-espresso-400 mb-8">Effective Date: October 2026 &bull; Kavah & Co. Artisanal Roasters</p>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-espresso-300 space-y-6 font-light leading-relaxed">
          <p>
            Welcome to the Kavah & Co. online roastery. By accessing or purchasing from our platform, you agree to comply with and be bound by the following operational terms and conditions.
          </p>

          <h2 className="font-serif text-lg font-bold text-white pt-2">1. Freshness & Roasting Schedules</h2>
          <p>
            All coffee is roasted in small batches according to customer order volume. While we strive to dispatch orders within 48 hours of roast drop, agricultural harvest yields, transit variables, and seasonal demand may periodically adjust roasting cycles.
          </p>

          <h2 className="font-serif text-lg font-bold text-white pt-2">2. Pricing & Variant Specifications</h2>
          <p>
            All prices are listed in USD. We reserve the right to correct typographical inaccuracies regarding origin cupping descriptions, pricing multipliers, or bag weight inventory levels without prior notice.
          </p>

          <h2 className="font-serif text-lg font-bold text-white pt-2">3. Subscription Clubs</h2>
          <p>
            Roaster’s Club subscriptions renew automatically at your chosen recurrence interval. You maintain the right to pause, reschedule, or cancel your subscription at any time prior to your next scheduled roast date.
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
