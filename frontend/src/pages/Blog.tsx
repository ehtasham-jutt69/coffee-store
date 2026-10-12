import React from 'react';
import { Link } from 'react-router-dom';

export interface IArticle {
  slug: string;
  title: string;
  summary: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  author: string;
}

export const ARTICLES: IArticle[] = [
  {
    slug: 'dialling-in-espresso-guide',
    title: 'Dialling In Espresso: The Science of Yield, Time, and Channeling',
    summary: 'A barista’s deep dive into 9-bar extraction kinetics, brew ratios (1:2 vs 1:2.5), and how micro-adjustments on burr grinders eliminate astringency.',
    category: 'Barista Techniques',
    readTime: '6 min read',
    date: 'October 2, 2026',
    image: '/images/espresso-extraction.jpg',
    author: 'Elena Sterling, Q-Grader'
  },
  {
    slug: 'single-origin-vs-blend',
    title: 'Single Origin vs. Artisanal Blends: Which One Fits Your Morning?',
    summary: 'Explore why single micro-lots tell an uncompromising story of volcanic terroir, while master blends craft harmonious, thick chocolate crema.',
    category: 'Coffee Knowledge',
    readTime: '5 min read',
    date: 'September 24, 2026',
    image: '/images/floating-beans.jpg',
    author: 'Marcus Romero, Roast Master'
  },
  {
    slug: 'pour-over-water-temperature',
    title: 'The 93°C Sweet Spot: How Water Chemistry & Temperature Transform Extraction',
    summary: 'Water comprises 98.5% of your morning filter brew. Discover why total dissolved solids (TDS) and thermal stability make or break acidity.',
    category: 'Brewing Science',
    readTime: '7 min read',
    date: 'September 15, 2026',
    image: '/images/coffee-splash-pour.jpg',
    author: 'Julian Vance, Roastery Lab'
  },
  {
    slug: 'degassing-fresh-roasted-coffee',
    title: 'Why You Shouldn’t Brew Coffee Right Out of The Roaster: The Degassing Rule',
    summary: 'Fresh is good, but immediate is erratic. Learn how carbon dioxide trapped in the bean cellulose matrix impacts extraction dynamics.',
    category: 'Roastery Insights',
    readTime: '4 min read',
    date: 'September 08, 2026',
    image: '/images/roasting-cooling-tray.jpg',
    author: 'Elena Sterling, Q-Grader'
  }
];

export const Blog: React.FC = () => {
  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">The Roaster's Journal</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2 mb-4">
            Specialty Coffee Journal & Guides
          </h1>
          <p className="text-xs sm:text-sm text-espresso-300 font-light leading-relaxed">
            Explorations into extraction dynamics, origin terroir reports, home barista recipes, and green bean sourcing ethics.
          </p>
        </div>

        {/* Featured Post */}
        <div className="mb-16">
          <Link
            to={`/blog/${ARTICLES[0].slug}`}
            className="group grid grid-cols-1 lg:grid-cols-12 gap-8 bg-espresso-900/40 border border-espresso-800 rounded-3xl overflow-hidden hover:border-amber-500/50 transition-all shadow-2xl"
          >
            <div className="lg:col-span-7 h-72 sm:h-96 relative overflow-hidden">
              <img
                src={ARTICLES[0].image}
                alt={ARTICLES[0].title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-espresso-950/60 to-transparent" />
            </div>

            <div className="lg:col-span-5 p-6 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 text-xs text-amber-400 font-semibold mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                    {ARTICLES[0].category}
                  </span>
                  <span>&bull;</span>
                  <span className="text-espresso-400">{ARTICLES[0].readTime}</span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white group-hover:text-amber-300 transition-colors mb-4">
                  {ARTICLES[0].title}
                </h2>

                <p className="text-xs sm:text-sm text-espresso-300 font-light leading-relaxed mb-6">
                  {ARTICLES[0].summary}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-espresso-800 text-xs text-espresso-400">
                <span>By {ARTICLES[0].author}</span>
                <span>{ARTICLES[0].date}</span>
              </div>
            </div>
          </Link>
        </div>

        {/* Remaining Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {ARTICLES.slice(1).map((article) => (
            <Link
              key={article.slug}
              to={`/blog/${article.slug}`}
              className="group bg-espresso-900/40 border border-espresso-800 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all flex flex-col"
            >
              <div className="h-52 relative overflow-hidden bg-espresso-950">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-amber-400 font-semibold mb-2">
                    <span>{article.category}</span>
                    <span>&bull;</span>
                    <span className="text-espresso-400">{article.readTime}</span>
                  </div>

                  <h3 className="font-serif text-lg font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                    {article.title}
                  </h3>

                  <p className="text-xs text-espresso-300 font-light line-clamp-3 leading-relaxed mb-4">
                    {article.summary}
                  </p>
                </div>

                <div className="pt-4 border-t border-espresso-800/80 flex items-center justify-between text-[11px] text-espresso-400">
                  <span>{article.author}</span>
                  <span>{article.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
