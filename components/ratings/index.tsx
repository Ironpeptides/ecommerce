import React from 'react';

interface RatingsProps {
  rating: number;
}

const Ratings: React.FC<RatingsProps> = ({ rating }) => {
  const stars = [];
  
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      // Full star
      stars.push(
        <svg
          key={i}
          className="w-4 h-4 fill-yellow-400"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
        </svg>
      );
    } else if (i - rating < 1 && i - rating > 0) {
      // Half star
      stars.push(
        <svg
          key={i}
          className="w-4 h-4"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={`half-${i}`}>
              <stop offset="50%" stopColor="#FBBF24" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path
            fill={`url(#half-${i})`}
            d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z"
          />
        </svg>
      );
    } else {
      // Empty star
      stars.push(
        <svg
          key={i}
          className="w-4 h-4 fill-gray-300"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M10 15.27L16.18 19l-1.64-7.03L20 7.24l-7.19-.61L10 0 7.19 6.63 0 7.24l5.46 4.73L3.82 19z" />
        </svg>
      );
    }
  }

  return (
    <div className="flex items-center gap-1">
      {stars}
      <span className="text-sm text-gray-600 ml-1">({rating.toFixed(1)})</span>
    </div>
  );
};

export default Ratings;

