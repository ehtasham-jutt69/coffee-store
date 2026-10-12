import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ARTICLES } from './Blog';

export const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const article = ARTICLES.find(a => a.slug === slug) || ARTICLES[0];

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="text-xs text-espresso-400 flex items-center gap-2 mb-8">
          <Link to="/" className="hover:text-amber-400">Home</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-amber-400">Journal</Link>
          <span>/</span>
          <span className="text-espresso-200 truncate">{article.title}</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3 text-xs text-amber-400 font-semibold mb-3">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
              {article.category}
            </span>
            <span>&bull;</span>
            <span className="text-espresso-400">{article.readTime}</span>
            <span>&bull;</span>
            <span className="text-espresso-400">{article.date}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight mb-4">
            {article.title}
          </h1>

          <p className="text-xs sm:text-sm text-espresso-300 font-light">
            Written by <strong className="text-white">{article.author}</strong> &bull; Kavah Sensory Team
          </p>
        </header>

        <div className="rounded-3xl overflow-hidden mb-12 border border-espresso-800 shadow-2xl">
          <img src={article.image} alt={article.title} className="w-full h-80 sm:h-96 object-cover" />
        </div>

        {/* Article Body */}
        <div className="prose prose-invert max-w-none text-espresso-200 text-sm sm:text-base leading-relaxed space-y-6 font-light">
          <p className="text-lg text-amber-200 font-serif italic border-l-2 border-amber-500 pl-4">
            "{article.summary}"
          </p>

          <h2 className="font-serif text-2xl font-bold text-white pt-4">1. Understanding The Variable Dynamics</h2>
          <p>
            When hot water permeates a bed of ground coffee, it dissolves over 1,000 distinct chemical compounds in a predictable chromatographic order. The first compounds to yield are fruity acids and bright aromatics, followed closely by complex caramelized sugars, and finally heavy polyphenols, lipids, and astringent tannins.
          </p>
          <p>
            If your contact time is too brief or your water temperature is too low, you end up with under-extraction—characterized by sour, grassy, and salty notes. Conversely, over-extraction leaches harsh, dry, aspirin-like bitterness.
          </p>

          <h2 className="font-serif text-2xl font-bold text-white pt-4">2. The Crucial Role of Uniform Particle Distribution</h2>
          <p>
            Pre-ground coffee is the greatest inhibitor of specialty flavor. A blade grinder pulverizes beans into a chaotic mix of boulders (under-extracting) and microscopic fines (over-extracting and clogging filters).
          </p>
          <p>
            Investing in flat or conical burrs ensures tight particle distribution, unlocking the juicy peach, honeysuckle, and chocolate notes our roasting team works so rigorously to preserve in small-batch roasts.
          </p>

          <div className="p-6 bg-espresso-900/60 rounded-2xl border border-espresso-800 my-8">
            <h4 className="font-serif text-lg font-bold text-white mb-2">The Roaster's Golden Rule</h4>
            <p className="text-xs text-espresso-300">
              Always weigh your dose on a gram scale (accurate to 0.1g) rather than relying on volume scoops. Bean density varies dramatically between high-elevation Ethiopian naturals and lower-altitude Brazilian lots.
            </p>
          </div>
        </div>

        {/* Back and CTA */}
        <div className="mt-16 pt-8 border-t border-espresso-800 flex flex-wrap items-center justify-between gap-4">
          <Link to="/blog" className="text-xs font-semibold text-amber-400 hover:text-amber-300">
            &larr; Back to all articles
          </Link>
          <Link to="/shop" className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold">
            Taste The Seasonal Roasts
          </Link>
        </div>
      </div>
    </div>
  );
};
