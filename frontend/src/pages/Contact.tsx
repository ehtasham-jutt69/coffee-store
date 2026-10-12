import React, { useState } from 'react';
import { useToast } from '../context/ToastContext';

export const Contact: React.FC = () => {
  const { showToast } = useToast();
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [subject, setSubject] = useState<string>('General Inquiries');
  const [message, setMessage] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    showToast('Your message has been dispatched to our roastery cuppers.');
  };

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Connect With Us</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2 mb-4">
            Visit Our Roastery & Tasting Room
          </h1>
          <p className="text-xs sm:text-sm text-espresso-300 font-light leading-relaxed">
            Have questions about grind sizing, wholesale cafe partnerships, or private cupping sessions? Reach out below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* LEFT: ROASTERY INFO (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-espresso-900/40 border border-espresso-800 p-8 rounded-3xl">
              <h2 className="font-serif text-xl font-bold text-white mb-6">Headquarters & Roasting Works</h2>

              <div className="space-y-6 text-xs text-espresso-300">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-white block text-sm mb-1">Roastery & Tasting Bar</strong>
                    <p>1420 Pike Place, Suite 400</p>
                    <p>Seattle, WA 98101, United States</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-white block text-sm mb-1">Digital Correspondence</strong>
                    <p>Orders: support@kavahcoffee.com</p>
                    <p>Wholesale: wholesale@kavahcoffee.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <strong className="text-white block text-sm mb-1">Tasting Bar Hours</strong>
                    <p>Monday – Friday: 6:30 AM – 5:00 PM</p>
                    <p>Saturday – Sunday: 7:00 AM – 6:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro Map Banner */}
            <div className="bg-espresso-900/60 border border-espresso-800 p-6 rounded-3xl relative overflow-hidden">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-2">Location Status</span>
              <p className="text-xs text-white font-semibold">Tasting Room Open &bull; Fresh Batch Cooling on Tray</p>
              <p className="text-[11px] text-espresso-400 mt-1">Visitors welcome for public Friday 11 AM SCA cupping flights.</p>
            </div>
          </div>

          {/* RIGHT: CONTACT FORM (7 COLS) */}
          <div className="lg:col-span-7">
            <div className="bg-espresso-900/40 border border-espresso-800 p-8 sm:p-10 rounded-3xl shadow-2xl">
              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center mb-4">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-white mb-2">Message Dispatched</h3>
                  <p className="text-xs sm:text-sm text-espresso-300 max-w-sm mx-auto mb-6">
                    Thank you, {name}! A member of our roasting and customer support team will reply within 24 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setName('');
                      setEmail('');
                      setMessage('');
                    }}
                    className="px-6 py-2.5 bg-espresso-800 hover:bg-espresso-700 text-white rounded-xl text-xs font-semibold"
                  >
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="font-serif text-2xl font-bold text-white mb-2">Send The Roastery A Message</h2>
                  <p className="text-xs text-espresso-400 mb-6">We respond promptly to all coffee and order questions.</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-espresso-300 block mb-1 font-semibold">Your Name *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Marcus Romero"
                        className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-espresso-300 block mb-1 font-semibold">Email Address *</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="marcus@example.com"
                        className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Subject Matter</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="General Inquiries">General Roastery Inquiries</option>
                      <option value="Wholesale Cafe Partnerships">Wholesale & Cafe Supply</option>
                      <option value="Subscription Delivery Management">Subscription Club Assistance</option>
                      <option value="Private Cupping Booking">Private Cupping / Event Booking</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-espresso-300 block mb-1 font-semibold">Message *</label>
                    <textarea
                      required
                      rows={5}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Share your inquiry or requirements with us..."
                      className="w-full bg-espresso-950 border border-espresso-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-900/30 transition-all"
                  >
                    Transmit Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
