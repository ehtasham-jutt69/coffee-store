import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowRight, CheckCircle2, ShieldCheck, Truck, RefreshCw, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <footer className="bg-coffee-950 text-coffee-100 pt-16 pb-12 border-t border-coffee-900">
      {/* Value Pillars Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14 border-b border-coffee-900/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-coffee-900 flex items-center justify-center shrink-0 text-roast-gold border border-coffee-800">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-white text-base">Roaster-Fresh Delivery</h4>
              <p className="text-xs text-coffee-300 mt-1 leading-relaxed">Orders roasted weekly in small batches and dispatched in one-way degassing valved bags.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-coffee-900 flex items-center justify-center shrink-0 text-roast-gold border border-coffee-800">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-white text-base">Specialty Grade 84+</h4>
              <p className="text-xs text-coffee-300 mt-1 leading-relaxed">We source exclusively specialty grade beans cupped and evaluated above 84 points SCA.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-coffee-900 flex items-center justify-center shrink-0 text-roast-gold border border-coffee-800">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-white text-base">Direct Origin Trade</h4>
              <p className="text-xs text-coffee-300 mt-1 leading-relaxed">Fair compensation exceeding Fair Trade minimums directly to cooperative farmers.</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-coffee-900 flex items-center justify-center shrink-0 text-roast-gold border border-coffee-800">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-serif font-semibold text-white text-base">Ritual Guarantee</h4>
              <p className="text-xs text-coffee-300 mt-1 leading-relaxed">Not completely enamored with your bag? We will exchange or refund your roast without friction.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-roast-bronze flex items-center justify-center text-coffee-950 font-bold">
                <Coffee className="w-5 h-5 text-coffee-950" />
              </div>
              <span className="font-serif text-2xl font-bold text-white tracking-tight">KAVAH & CO.</span>
            </div>
            <p className="text-sm text-coffee-300 leading-relaxed max-w-sm">
              Artisanal small-batch coffee roasters. Sourcing responsibly from high-elevation volcanic terroir, hand-crafted in Portland and shipped nationwide.
            </p>
            <div className="pt-2 text-xs text-coffee-400 space-y-1">
              <p>📍 400 Industrial Way, Suite 12, Portland, OR 97210</p>
              <p>☕ Tasting Room: Mon–Sat 7:00 AM – 4:00 PM</p>
              <p>✉️ concierge@kavahcoffee.com • 📞 (555) 234-8901</p>
            </div>
          </div>

          {/* Catalog Links */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-roast-gold font-bold mb-4">Shop Roasts</h4>
            <ul className="space-y-2.5 text-sm text-coffee-300">
              <li><Link to="/shop?category=single-origin" className="hover:text-white transition-colors">Single Origin</Link></li>
              <li><Link to="/shop?category=house-blends" className="hover:text-white transition-colors">Espresso & Blends</Link></li>
              <li><Link to="/shop?category=flavored-infusions" className="hover:text-white transition-colors">Flavored Roasts</Link></li>
              <li><Link to="/shop?category=cold-brew" className="hover:text-white transition-colors">Cold Brew Reserve</Link></li>
              <li><Link to="/shop?category=decaf" className="hover:text-white transition-colors">Mountain Water Decaf</Link></li>
              <li><Link to="/shop?category=equipment" className="hover:text-white transition-colors">Brewing Gear</Link></li>
              <li><Link to="/collections" className="hover:text-white transition-colors">Gift Sets & Samplers</Link></li>
            </ul>
          </div>

          {/* Education & Brand */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-roast-gold font-bold mb-4">The Craft</h4>
            <ul className="space-y-2.5 text-sm text-coffee-300">
              <li><Link to="/coffee-guide" className="hover:text-white transition-colors">Brew Ratio Calculator</Link></li>
              <li><Link to="/coffee-guide#grind-guide" className="hover:text-white transition-colors">Grind Size Guide</Link></li>
              <li><Link to="/coffee-guide#roast-spectrum" className="hover:text-white transition-colors">Roast Spectrum</Link></li>
              <li><Link to="/journal" className="hover:text-white transition-colors">Roastery Journal</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Our Sourcing Ethos</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Visit Roastery</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs uppercase tracking-widest text-roast-gold font-bold mb-4">Customer Care</h4>
            <ul className="space-y-2.5 text-sm text-coffee-300">
              <li><Link to="/faq" className="hover:text-white transition-colors">Frequently Asked Questions</Link></li>
              <li><Link to="/shipping-returns" className="hover:text-white transition-colors">Shipping & Freshness</Link></li>
              <li><Link to="/shipping-returns" className="hover:text-white transition-colors">Returns & Exchanges</Link></li>
              <li><Link to="/account/orders" className="hover:text-white transition-colors">Track Your Order</Link></li>
              <li><Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-coffee-900 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <h4 className="font-serif text-lg font-semibold text-white">Join the Roastery Dispatch</h4>
            <p className="text-xs text-coffee-300 mt-1">Receive early access to limited lot microlots, brew recipes, and 10% off your first order.</p>
          </div>

          {subscribed ? (
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium bg-emerald-950/50 border border-emerald-800/60 px-4 py-2.5 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Thank you! Use code <strong>WELCOME10</strong> at checkout for 10% off.</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex items-center gap-2 w-full max-w-md">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email address"
                required
                className="flex-1 bg-coffee-900 border border-coffee-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-coffee-500 focus:outline-none focus:ring-2 focus:ring-roast-gold/50"
              />
              <button
                type="submit"
                className="bg-roast-bronze hover:bg-roast-gold text-coffee-950 font-semibold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Subscribe</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Bottom Legal & Payment Icons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-coffee-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-coffee-400">
        <p>© {new Date().getFullYear()} Kavah & Co. Artisanal Roasters LLC. All rights reserved.</p>
        <div className="flex items-center gap-4 text-[11px] text-coffee-400">
          <span>Visa</span>
          <span>•</span>
          <span>Mastercard</span>
          <span>•</span>
          <span>American Express</span>
          <span>•</span>
          <span>Apple Pay</span>
          <span>•</span>
          <span>Cash on Delivery</span>
        </div>
      </div>
    </footer>
  );
};
