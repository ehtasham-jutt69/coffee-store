import React from 'react';
import { Link } from 'react-router-dom';

export const ShippingReturns: React.FC = () => {
  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-3">Shipping & Freshness Guarantee</h1>
        <p className="text-xs text-espresso-400 mb-8">Effective Date: October 2026 &bull; Kavah & Co. Artisanal Roasters</p>

        <div className="prose prose-invert max-w-none text-xs sm:text-sm text-espresso-300 space-y-6 font-light leading-relaxed">
          <p>
            Because specialty coffee is a perishable agricultural good that achieves its peak flavor expression within weeks of the roast date, we prioritize expedited fulfillment and transparent transit tracking.
          </p>

          <h2 className="font-serif text-lg font-bold text-white pt-2">Domestic Shipping Options</h2>
          <div className="bg-espresso-900/40 p-4 rounded-xl border border-espresso-800 space-y-2">
            <p><strong className="text-white">Standard Ground (Carbon-Neutral):</strong> $6.50 flat rate (FREE on orders over $50). Delivery within 3-5 business days post roast.</p>
            <p><strong className="text-white">Express Courier:</strong> $14.00 flat rate. Priority air transit delivering within 1-2 business days post roast.</p>
          </div>

          <h2 className="font-serif text-lg font-bold text-white pt-2">Our 100% Palate Guarantee</h2>
          <p>
            Coffee tasting is deeply personal. If you ordered a single origin or signature blend that does not match your extraction expectations or taste preference, contact our cuppers at <strong>support@kavahcoffee.com</strong> within 14 days of delivery. We will immediately replace your bag with an alternative roast profile or issue a full refund.
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
