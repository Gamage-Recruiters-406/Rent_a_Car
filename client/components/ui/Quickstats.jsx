import React, { useEffect, useRef, useState } from 'react';

export const QuickStats = () => {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const quickStats = [
    { icon: '⚡', number: 'Instant', label: 'Booking Confirmation' },
    { icon: '🏷️', number: '40%', label: 'Cheaper Than Traditional' },
    { icon: '⏱️', number: '2 Min', label: 'Average Signup Time' },
    { icon: '✓', number: '100%', label: 'Verified Vehicles' },
  ];

  // Triple the stats for seamless infinite scroll
  const duplicatedStats = [...quickStats, ...quickStats, ...quickStats];

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive sizing
  const getStatWidth = () => {
    if (dimensions.width < 375) return 60; // Smaller phones
    if (dimensions.width < 414) return 55; // Medium phones
    return 50; // Larger phones & tablets
  };

  const getFontSizes = () => {
    if (dimensions.width < 375) {
      return { number: '1.5rem', label: '0.6875rem', icon: '1.5rem' };
    } else if (dimensions.width < 414) {
      return { number: '1.625rem', label: '0.75rem', icon: '1.625rem' };
    } else {
      return { number: '1.75rem', label: '0.8125rem', icon: '1.75rem' };
    }
  };

  const statWidth = getStatWidth();
  const fontSizes = getFontSizes();

  return (
    <div className="bg-gradient-to-br from-[#0d3778] to-[#1a4d99] py-4 mb-4 overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="flex animate-marquee">
          {duplicatedStats.map((stat, index) => (
            <div
              key={index}
              className="flex-shrink-0 flex justify-center items-center px-6"
              style={{ width: `${statWidth}%` }}
            >
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span
                    className="text-white"
                    style={{ fontSize: fontSizes.icon }}
                  >
                    {stat.icon}
                  </span>
                  <span
                    className="font-bold text-white"
                    style={{ fontSize: fontSizes.number }}
                  >
                    {stat.number}
                  </span>
                </div>
                <p
                  className="text-white/90 text-center leading-[1.125rem] line-clamp-2"
                  style={{ fontSize: fontSizes.label }}
                >
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};