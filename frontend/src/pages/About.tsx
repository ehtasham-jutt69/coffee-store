import React from 'react';
import { Link } from 'react-router-dom';

export const About: React.FC = () => {
  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HERO STORY */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Our Heritage</span>
          <h1 className="font-serif text-4xl sm:text-6xl font-bold text-white mt-2 mb-6">
            Coffee Born From Obsession
          </h1>
          <p className="text-base sm:text-lg text-espresso-200/90 font-light leading-relaxed">
            Kavah & Co. was founded on a simple, uncompromising ethos: elevate the humble coffee cherry into an extraordinary sensory experience through ethical direct sourcing and small-batch drum roasting.
          </p>
        </div>

        {/* SECTION 1: ORIGIN & DIRECT TRADE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          <div className="order-2 lg:order-1">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Origin Direct Trade</span>
            <h2 className="font-serif text-3xl font-bold text-white mt-2 mb-6 leading-tight">
              Honoring The Hands That Nurture The Seed
            </h2>
            <p className="text-xs sm:text-sm text-espresso-300 leading-relaxed font-light mb-4">
              Exceptional coffee starts in the micro-climates of high volcanic slopes. We bypass long commodity trading chains and work directly with agrarian families in Yirgacheffe, Huila, Tarrazú, and Antigua.
            </p>
            <p className="text-xs sm:text-sm text-espresso-300 leading-relaxed font-light mb-6">
              By guaranteeing minimum purchase prices at least 300% above Fair Trade minimums, our partner farmers can invest in raised African drying beds, water recirculation washing stations, and organic composting.
            </p>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-espresso-800">
              <div>
                <p className="font-serif text-2xl font-bold text-amber-300">100%</p>
                <p className="text-[11px] text-espresso-400 uppercase tracking-wider mt-0.5">Traceable To Station</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-amber-300">3.2x</p>
                <p className="text-[11px] text-espresso-400 uppercase tracking-wider mt-0.5">Above Fair Trade Base</p>
              </div>
            </div>
          </div>

          <div className="order-1 lg:order-2 rounded-3xl overflow-hidden border border-espresso-800 shadow-2xl relative">
            <img
              src="/images/coffee-plantation-hero.jpg"
              alt="High-altitude specialty coffee plantation in cloud forest"
              className="w-full h-[440px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/70 via-transparent to-transparent" />
          </div>
        </div>

        {/* SECTION 2: ROASTING MASTERY */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-24">
          <div className="rounded-3xl overflow-hidden border border-espresso-800 shadow-2xl relative">
            <img
              src="/images/roaster-drum.jpg"
              alt="Cast iron coffee roaster drum in action"
              className="w-full h-[440px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/70 via-transparent to-transparent" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">The Craft</span>
            <h2 className="font-serif text-3xl font-bold text-white mt-2 mb-6 leading-tight">
              Small-Batch Drum Roasting
            </h2>
            <p className="text-xs sm:text-sm text-espresso-300 leading-relaxed font-light mb-4">
              We never roast with industrial air blowers. Each harvest is calibrated on cast-iron drum roasters using infrared thermocouple feedback.
            </p>
            <p className="text-xs sm:text-sm text-espresso-300 leading-relaxed font-light mb-6">
              Our master roaster monitors the rate of rise (RoR), the Maillard sugar browning reaction, and the delicate post-first-crack caramelization window to draw out authentic terroir notes—whether it’s bright bergamot or velvety dark baker’s chocolate.
            </p>

            <div className="p-4 bg-espresso-900/60 rounded-xl border border-espresso-800">
              <p className="text-xs italic text-amber-200">
                "Roasting is the translation of terroir. You cannot create sweetness that wasn’t grown on the mountain; you can only protect and honor it."
              </p>
              <p className="text-[11px] text-espresso-400 mt-2 font-semibold">— Elena Sterling, Head of Roasting</p>
            </div>
          </div>
        </div>

        {/* PILLARS GRID */}
        <div className="bg-espresso-900/40 border border-espresso-800 rounded-3xl p-8 sm:p-12 mb-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white">Our Commitments to You</h2>
            <p className="text-xs text-espresso-400 mt-1">Four promises stamped on every single coffee bag.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-4 bg-espresso-950 rounded-2xl border border-espresso-800">
              <span className="text-amber-400 font-serif text-lg font-bold block mb-2">01. 48h Freshness</span>
              <p className="text-xs text-espresso-300 leading-relaxed font-light">
                Roasts are dispatched within 48 hours of flame drop, arriving right as beans begin their prime extraction window.
              </p>
            </div>

            <div className="p-4 bg-espresso-950 rounded-2xl border border-espresso-800">
              <span className="text-amber-400 font-serif text-lg font-bold block mb-2">02. Specialty Grade</span>
              <p className="text-xs text-espresso-300 leading-relaxed font-light">
                Only SCA 86+ cupping score Arabica micro-lots make it into our release batches. Zero defect tolerance.
              </p>
            </div>

            <div className="p-4 bg-espresso-950 rounded-2xl border border-espresso-800">
              <span className="text-amber-400 font-serif text-lg font-bold block mb-2">03. Nitrogen Sealed</span>
              <p className="text-xs text-espresso-300 leading-relaxed font-light">
                Bags feature multi-layer foil barrier linings with one-way degassing valves to lock in delicate volatiles.
              </p>
            </div>

            <div className="p-4 bg-espresso-950 rounded-2xl border border-espresso-800">
              <span className="text-amber-400 font-serif text-lg font-bold block mb-2">04. Carbon Neutral</span>
              <p className="text-xs text-espresso-300 leading-relaxed font-light">
                Every domestic order is shipped via verified carbon-offset ground delivery and recyclable packaging.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <h3 className="font-serif text-2xl font-bold text-white mb-4">Ready To Taste The Difference?</h3>
          <Link
            to="/shop"
            className="px-8 py-3.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-lg shadow-amber-900/30 transition-all inline-flex items-center gap-2"
          >
            Explore Roasts Catalog
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};
