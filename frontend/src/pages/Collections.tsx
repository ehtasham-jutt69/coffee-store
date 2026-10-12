import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { ICategory } from '../types';

export const Collections: React.FC = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        setLoading(true);
        const res = await api.getCategories();
        if (res.success && res.categories) {
          setCategories(res.categories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCats();
  }, []);

  return (
    <div className="bg-espresso-950 text-espresso-100 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">Specialty Lineup</span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-2 mb-4">
            Roast Collections & Series
          </h1>
          <p className="text-xs sm:text-sm text-espresso-300 font-light leading-relaxed">
            From single-origin high-altitude micro-lots to nuanced dark roast profiles, discover coffee tailored to your brew ritual.
          </p>
        </div>

        {loading ? (
          <div className="py-20 text-center text-xs text-espresso-400">Loading roastery collections...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/shop?category=${c.slug}`}
                className="group relative h-96 rounded-3xl overflow-hidden border border-espresso-800 bg-espresso-900 shadow-2xl hover:border-amber-500/50 transition-all duration-300 flex flex-col justify-end p-8"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  className="absolute inset-0 w-full h-full object-cover filter brightness-[0.4] group-hover:scale-105 group-hover:brightness-[0.32] transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-espresso-950 via-espresso-950/40 to-transparent" />

                <div className="relative z-10">
                  <span className="text-xs text-amber-400 font-semibold tracking-wider uppercase mb-1 block">
                    {c.itemCount} Specialty Coffees
                  </span>
                  <h2 className="font-serif text-2xl font-bold text-white group-hover:text-amber-300 transition-colors mb-2">
                    {c.name}
                  </h2>
                  <p className="text-xs text-espresso-200/90 line-clamp-3 leading-relaxed mb-6 font-light">
                    {c.description}
                  </p>
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 group-hover:text-amber-300 group-hover:underline">
                    Explore This Collection &rarr;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
