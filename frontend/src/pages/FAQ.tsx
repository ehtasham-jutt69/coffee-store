import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface FAQItem {
  q: string;
  a: string;
  category: 'Freshness' | 'Grind' | 'Subscriptions' | 'Shipping';
}

const FAQ_LIST: FAQItem[] = [
  {
    category: 'Freshness',
    q: 'How fresh is the coffee when it arrives at my doorstep?',
    a: 'Every bag of Kavah coffee is roasted to order in small micro-batches. Your order is packaged in nitrogen-flushed foil barrier bags within hours of roast drop and dispatched within 48 hours. Most orders reach customers 3 to 5 days post-roast date—the sweet spot when initial harsh degassing settles and optimal flavor peak begins.'
  },
  {
    category: 'Freshness',
    q: 'How long do beans remain fresh once opened?',
    a: 'When kept in our zip-resealable bag with the one-way degassing valve or an airtight container at room temperature, coffee maintains exceptional vibrancy for 4 to 6 weeks. After 60 days, aromatics begin to flatten, though the coffee remains safe to drink.'
  },
  {
    category: 'Freshness',
    q: 'Should I store whole bean coffee in the freezer?',
    a: 'We strongly discourage storing daily coffee in the freezer. Daily opening and closing causes moisture condensation on bean surfaces, accelerating oxidation and oil rancidity. The only exception is deep-freezing unopened vacuum-sealed bags for long-term cell preservation (up to 12 months).'
  },
  {
    category: 'Grind',
    q: 'Should I buy whole bean or pre-ground coffee?',
    a: 'Whole bean is always recommended for peak extraction! Whole beans preserve volatile aromatics for weeks, while pre-ground coffee loses roughly 60% of its delicate floral and fruit aromas within 20 minutes of grinding. However, if you don’t own a burr grinder, our precision commercial Mahlkönig grinders provide uniform grinds dialed specifically for your brewer.'
  },
  {
    category: 'Grind',
    q: 'Which grind option should I select?',
    a: '• Espresso: Fine powder for 9-bar espresso machines & Moka pots.\n• Pour Over: Medium-fine for Hario V60, Kalita Wave, and AeroPress.\n• Drip: Medium (table salt consistency) for automatic drip brewers.\n• French Press: Coarse for immersion brewing and cupping bowls.\n• Cold Brew: Extra coarse for 16-hour cold steep.'
  },
  {
    category: 'Subscriptions',
    q: 'How does the Roaster’s Club subscription work?',
    a: 'Choose your desired coffee profile (or let our roaster surprise you with seasonal single origin micro-lots), select your bag quantity, and set your frequency (every 1, 2, or 4 weeks). Subscribers receive 15% off regular prices, free standard shipping, and early access to rare limited-release geisha and anaerobically fermented lots.'
  },
  {
    category: 'Subscriptions',
    q: 'Can I pause or cancel my subscription?',
    a: 'Yes, absolutely. You can skip upcoming deliveries, adjust ship dates, change bag grind specifications, or cancel entirely at any moment through your account dashboard with zero fees or contracts.'
  },
  {
    category: 'Shipping',
    q: 'What are your domestic and international shipping options?',
    a: 'We offer standard carbon-neutral ground shipping ($6.50 flat rate, or FREE on orders over $50), and Express Air courier (1-2 business days). Orders placed before 11:00 AM PST are queued for that day’s afternoon roast run.'
  },
  {
    category: 'Shipping',
    q: 'What if I am unsatisfied with my coffee flavor profile?',
    a: 'We stand by our roast profiles with a 100% Palate Guarantee. If a particular roast does not suit your brew style or expectations, contact us within 14 days and we will gladly send a replacement roast of your choice or issue a full refund.'
  }
];

export const FAQ: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const toggleIndex = (idx: number) => {
    setOpenIndices(prev =>
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  const filtered = selectedCat === 'All'
    ? FAQ_LIST
    : FAQ_LIST.filter(item => item.category === selectedCat);

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Help Center</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-espresso-300 font-light max-w-lg mx-auto">
            Everything you need to know about our sourcing micro-lots, roast freshness dates, grind selections, and subscriptions.
          </p>

          {/* Filter pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {['All', 'Freshness', 'Grind', 'Subscriptions', 'Shipping'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                  selectedCat === cat
                    ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                    : 'bg-espresso-900 border-espresso-800 text-espresso-300 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Accordions */}
        <div className="space-y-4">
          {filtered.map((item, idx) => {
            const isOpen = openIndices.includes(idx);
            return (
              <div
                key={idx}
                className="bg-espresso-900/40 border border-espresso-800 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleIndex(idx)}
                  className="w-full p-6 text-left flex justify-between items-center gap-4 hover:bg-espresso-850/30 transition-colors"
                >
                  <span className="font-serif text-base sm:text-lg font-bold text-white">
                    {item.q}
                  </span>
                  <span className={`w-6 h-6 rounded-full bg-espresso-800 flex items-center justify-center text-amber-400 font-bold text-xs shrink-0 transform transition-transform ${
                    isOpen ? 'rotate-180' : ''
                  }`}>
                    &darr;
                  </span>
                </button>

                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-xs sm:text-sm text-espresso-300 font-light leading-relaxed whitespace-pre-line border-t border-espresso-800/60">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 p-8 bg-espresso-900/40 border border-espresso-800 rounded-3xl text-center">
          <h3 className="font-serif text-xl font-bold text-white mb-2">Still Have Questions?</h3>
          <p className="text-xs text-espresso-400 mb-6">Our master roasters and barista support team are eager to help.</p>
          <Link
            to="/contact"
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold"
          >
            Contact Customer Support
          </Link>
        </div>
      </div>
    </div>
  );
};
