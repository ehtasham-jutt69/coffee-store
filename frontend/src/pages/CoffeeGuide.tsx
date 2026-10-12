import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface BrewMethod {
  id: string;
  name: string;
  ratio: number; // e.g. 1:16 -> 16
  defaultCoffee: number;
  grind: string;
  temp: string;
  time: string;
  steps: string[];
}

const BREW_METHODS: BrewMethod[] = [
  {
    id: 'v60',
    name: 'Hario V60 Pour Over',
    ratio: 16,
    defaultCoffee: 15,
    grind: 'Medium-Fine (Sea salt)',
    temp: '93°C / 200°F',
    time: '2:45 - 3:00 min',
    steps: [
      'Rinse paper filter with boiling water to remove paper taste and pre-heat dripper.',
      'Add freshly ground coffee, create a slight well in the center, and tare scale.',
      'Bloom pour: 45g of water (3x coffee weight). Swirl gently and let degas for 45 seconds.',
      'Second pour: Continuously pour in slow concentric circles up to 60% total water.',
      'Final pour: Bring water to full target weight. Gentle swirl, let drawdown completely.'
    ]
  },
  {
    id: 'chemex',
    name: 'Chemex Brewer',
    ratio: 15,
    defaultCoffee: 30,
    grind: 'Medium-Coarse (Kosher salt)',
    temp: '94°C / 202°F',
    time: '4:00 - 4:30 min',
    steps: [
      'Place 3-layered filter side facing the spout. Rinse thoroughly with hot water.',
      'Add ground coffee and level bed.',
      'Pour 90g water for bloom. Wait 45 seconds while gases escape.',
      'Pour in spiraling circles, keeping water level 1 inch below the top of glass.',
      'Drawdown produces an exceptionally clean, tea-like aromatic cup.'
    ]
  },
  {
    id: 'french-press',
    name: 'French Press / Immersion',
    ratio: 15,
    defaultCoffee: 30,
    grind: 'Coarse (Rock salt)',
    temp: '95°C / 204°F',
    time: '4:00 min steep + 5:00 min settle',
    steps: [
      'Pre-warm glass beaker with hot water.',
      'Add coffee grounds and pour full water volume briskly to saturate all grounds.',
      'At 4:00, take two spoons and break the crust that formed on top. Stir gently.',
      'Scoop off the remaining foam and floating grounds for a cleaner cup.',
      'Insert plunger just under the surface, wait 5 minutes for fines to settle, then pour gently.'
    ]
  },
  {
    id: 'aeropress',
    name: 'AeroPress (Inverted)',
    ratio: 12,
    defaultCoffee: 15,
    grind: 'Medium-Fine',
    temp: '85°C - 88°C / 185°F',
    time: '2:00 min',
    steps: [
      'Assemble AeroPress in inverted position. Rinse paper or metal filter.',
      'Add coffee, pour 180g hot water in 10 seconds.',
      'Stir vigorously for 10 seconds.',
      'Cap with filter, wait until 1:30, flip onto sturdy mug.',
      'Press gently for 30 seconds until a soft hiss is heard.'
    ]
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew Immersion',
    ratio: 8,
    defaultCoffee: 100,
    grind: 'Extra Coarse',
    temp: 'Filtered Room Temp or Chilled',
    time: '16 - 20 hours',
    steps: [
      'Combine coarse coffee with cold filtered water in a mason jar or cold brewer.',
      'Stir thoroughly so no dry pockets remain.',
      'Steep at cool room temperature for 16 hours or in refrigerator for 20 hours.',
      'Filter through paper or fine mesh. Dilute concentrate 1:1 with ice or cold milk.'
    ]
  },
  {
    id: 'espresso',
    name: '9-Bar Espresso Machine',
    ratio: 2,
    defaultCoffee: 18,
    grind: 'Fine (Powder sugar texture)',
    temp: '93°C / 200°F',
    time: '26 - 30 seconds',
    steps: [
      'Dose 18g freshly ground coffee into calibrated portafilter basket.',
      'Distribute evenly using WDT needle tool to eliminate channeling.',
      'Tamp firmly and level at ~30 lbs of pressure.',
      'Engage group head immediately. Target 36g liquid espresso yield in 28 seconds.'
    ]
  }
];

export const CoffeeGuide: React.FC = () => {
  const [selectedMethodId, setSelectedMethodId] = useState<string>('v60');
  const [coffeeDose, setCoffeeDose] = useState<number>(15);

  const activeMethod = BREW_METHODS.find(m => m.id === selectedMethodId) || BREW_METHODS[0];
  const waterTarget = Math.round(coffeeDose * activeMethod.ratio);

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Home Barista Lab</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2 mb-4">
            Interactive Coffee Brewing Guide
          </h1>
          <p className="text-xs sm:text-sm text-espresso-300 font-light leading-relaxed">
            Dial in water ratios, grind size distributions, and extraction timelines to unlock sweet, floral, and chocolate notes in every cup.
          </p>
        </div>

        {/* 1. INTERACTIVE BREW RATIO CALCULATOR */}
        <div className="bg-espresso-900/60 border border-espresso-800 rounded-3xl p-6 sm:p-10 mb-16 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 mb-8 pb-8 border-b border-espresso-800">
            <div>
              <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">Step 1: Choose Method</span>
              <h2 className="font-serif text-2xl font-bold text-white mt-1">Extraction Calculator</h2>
            </div>

            {/* Methods selector */}
            <div className="flex flex-wrap gap-2">
              {BREW_METHODS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setSelectedMethodId(m.id);
                    setCoffeeDose(m.defaultCoffee);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                    selectedMethodId === m.id
                      ? 'bg-amber-600 text-white border-amber-500 shadow-md'
                      : 'bg-espresso-950 border-espresso-800 text-espresso-300 hover:text-white'
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Input & Live Results (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-espresso-950 p-6 rounded-2xl border border-espresso-800">
                <label className="flex justify-between items-center text-xs font-semibold text-espresso-300 mb-3">
                  <span>Dry Coffee Dose (Grams)</span>
                  <span className="font-mono text-amber-400 text-base">{coffeeDose}g</span>
                </label>
                <input
                  type="range"
                  min={activeMethod.id === 'cold-brew' ? 30 : activeMethod.id === 'espresso' ? 14 : 10}
                  max={activeMethod.id === 'cold-brew' ? 300 : activeMethod.id === 'espresso' ? 24 : 60}
                  value={coffeeDose}
                  onChange={(e) => setCoffeeDose(Number(e.target.value))}
                  className="w-full accent-amber-500 bg-espresso-850 h-2 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-espresso-500 mt-2">
                  <span>Single cup</span>
                  <span>Sharing carafe</span>
                </div>
              </div>

              {/* Calculated Results Box */}
              <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-2xl">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">Target Water</span>
                    <p className="font-serif text-3xl font-bold text-white mt-1">{waterTarget}g <span className="text-xs font-normal text-espresso-300">({waterTarget} ml)</span></p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">Golden Ratio</span>
                    <p className="font-serif text-3xl font-bold text-white mt-1">1:{activeMethod.ratio}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-amber-500/20 grid grid-cols-2 gap-2 text-xs text-espresso-300">
                  <p><strong className="text-white">Water Temp:</strong> {activeMethod.temp}</p>
                  <p><strong className="text-white">Target Time:</strong> {activeMethod.time}</p>
                  <p className="col-span-2"><strong className="text-white">Grind setting:</strong> {activeMethod.grind}</p>
                </div>
              </div>
            </div>

            {/* Brewing Walkthrough Steps (7 Cols) */}
            <div className="lg:col-span-7 bg-espresso-950 p-6 sm:p-8 rounded-2xl border border-espresso-800">
              <h3 className="font-serif text-lg font-bold text-white mb-4">
                Brewing Recipe: {activeMethod.name}
              </h3>
              <ol className="space-y-4 text-xs text-espresso-200">
                {activeMethod.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-amber-600/30 text-amber-300 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="leading-relaxed font-light">{step}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-8 pt-4 border-t border-espresso-850 flex items-center justify-between">
                <span className="text-xs text-espresso-400">Need whole bean coffee for this recipe?</span>
                <Link to="/shop" className="text-xs font-semibold text-amber-400 hover:text-amber-300">
                  Shop Fresh Roasts &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 2. VISUAL GRIND SIZE SPECTRUM */}
        <div className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Grind Dial-In</span>
            <h2 className="font-serif text-3xl font-bold text-white mt-1">
              Grind Size Spectrum
            </h2>
            <p className="text-xs text-espresso-400 mt-2">
              Surface area controls extraction speed. Match your grind to your contact time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-espresso-900/40 border border-espresso-800 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-amber-400 block mb-1">Extra Coarse</span>
              <p className="text-[11px] text-espresso-400 mb-3">Like crushed peppercorns</p>
              <div className="h-1 bg-amber-200/40 rounded-full mb-3" />
              <p className="text-[11px] text-white font-semibold">Cold Brew Immersion</p>
            </div>

            <div className="bg-espresso-900/40 border border-espresso-800 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-amber-400 block mb-1">Coarse</span>
              <p className="text-[11px] text-espresso-400 mb-3">Like coarse rock salt</p>
              <div className="h-1 bg-amber-300/60 rounded-full mb-3" />
              <p className="text-[11px] text-white font-semibold">French Press, Cupping</p>
            </div>

            <div className="bg-espresso-900/40 border border-espresso-800 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-amber-400 block mb-1">Medium-Coarse</span>
              <p className="text-[11px] text-espresso-400 mb-3">Rough beach sand</p>
              <div className="h-1 bg-amber-400/80 rounded-full mb-3" />
              <p className="text-[11px] text-white font-semibold">Chemex, Clever Dripper</p>
            </div>

            <div className="bg-espresso-900/40 border border-espresso-800 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-amber-400 block mb-1">Medium</span>
              <p className="text-[11px] text-espresso-400 mb-3">Table salt texture</p>
              <div className="h-1 bg-amber-500 rounded-full mb-3" />
              <p className="text-[11px] text-white font-semibold">Drip Machines, Kalita Wave</p>
            </div>

            <div className="bg-espresso-900/40 border border-espresso-800 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-amber-400 block mb-1">Medium-Fine</span>
              <p className="text-[11px] text-espresso-400 mb-3">Fine sand</p>
              <div className="h-1 bg-amber-600 rounded-full mb-3" />
              <p className="text-[11px] text-white font-semibold">Hario V60, AeroPress</p>
            </div>

            <div className="bg-espresso-900/40 border border-espresso-800 p-5 rounded-2xl text-center">
              <span className="text-xs font-bold text-amber-400 block mb-1">Fine</span>
              <p className="text-[11px] text-espresso-400 mb-3">Powdered sugar</p>
              <div className="h-1 bg-amber-700 rounded-full mb-3" />
              <p className="text-[11px] text-white font-semibold">Espresso & Moka Pot</p>
            </div>
          </div>
        </div>

        {/* 3. FRESHNESS & STORAGE RULES */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-espresso-900/40 border border-espresso-800 p-6 rounded-2xl">
            <h4 className="font-serif text-lg font-bold text-white mb-2">The Degassing Period</h4>
            <p className="text-xs text-espresso-300 leading-relaxed font-light">
              Freshly roasted beans retain carbon dioxide. For filter brews, let beans rest 4 to 7 days post roast. For espresso, rest 10 to 14 days for optimal crema stability.
            </p>
          </div>

          <div className="bg-espresso-900/40 border border-espresso-800 p-6 rounded-2xl">
            <h4 className="font-serif text-lg font-bold text-white mb-2">Store Away From Light & Heat</h4>
            <p className="text-xs text-espresso-300 leading-relaxed font-light">
              Keep beans in their original Kavah valved bag or an opaque vacuum canister at room temperature (68°F - 72°F). Avoid sunlight, moisture, and refrigerator condensation.
            </p>
          </div>

          <div className="bg-espresso-900/40 border border-espresso-800 p-6 rounded-2xl">
            <h4 className="font-serif text-lg font-bold text-white mb-2">Water Quality Is 98% Of Your Cup</h4>
            <p className="text-xs text-espresso-300 leading-relaxed font-light">
              Brew using filtered water with 120-150 ppm total dissolved solids (TDS) and neutral pH. Hard tap water mutes delicate floral acidity, while distilled water yields flat brews.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
