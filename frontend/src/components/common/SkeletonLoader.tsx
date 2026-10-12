import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return (
    <div className={`animate-pulse bg-espresso-800/60 rounded ${className}`} />
  );
};

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="bg-espresso-900 border border-espresso-800/80 rounded-xl overflow-hidden flex flex-col p-4 animate-pulse">
      <div className="w-full aspect-[4/3] bg-espresso-800/80 rounded-lg mb-4" />
      <div className="h-3 w-20 bg-espresso-800 rounded mb-2" />
      <div className="h-5 w-3/4 bg-espresso-800 rounded mb-2" />
      <div className="h-3 w-1/2 bg-espresso-800 rounded mb-4" />
      <div className="flex gap-1.5 mb-4">
        <div className="h-4 w-12 bg-espresso-800 rounded-full" />
        <div className="h-4 w-16 bg-espresso-800 rounded-full" />
      </div>
      <div className="mt-auto pt-3 border-t border-espresso-800/60 flex items-center justify-between">
        <div className="h-6 w-16 bg-espresso-800 rounded" />
        <div className="h-9 w-24 bg-espresso-800 rounded-lg" />
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="w-full space-y-3 animate-pulse">
      <div className="h-10 bg-espresso-800/60 rounded-lg w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-14 bg-espresso-900/60 border border-espresso-800/60 rounded-lg w-full" />
      ))}
    </div>
  );
};
