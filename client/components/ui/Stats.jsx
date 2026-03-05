import React, { useState, useEffect } from 'react';

const baseUrl = 'http://localhost:8090';
const apiVersion = '/api/v1';

export const Stats = () => {
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [vehicleCount, setVehicleCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(4.9);

  const stats = [
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      number: `${vehicleCount}+`,
      value: vehicleCount,
      label: 'Vehicles Available',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      number: `${userCount}+`,
      value: userCount,
      label: 'Happy Customers',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      number: '25+',
      value: 25,
      label: 'Cities Covered',
    },
    {
      icon: (
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      number: '4.9',
      value: averageRating,
      label: 'Average Rating',
      isDecimal: true,
    },
  ];

  // Triple the stats for seamless infinite scroll
  const duplicatedStats = [...stats, ...stats, ...stats];

  // Fetch vehicle count
  useEffect(() => {
    const fetchVehicleCount = async () => {
      try {
        setIsLoading(true);
        const url = `${baseUrl}${apiVersion}/vehicle/vehicle-count`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vehicle count');
        }

        const data = await response.json();

        if (data.success && typeof data.count === 'number') {
          setVehicleCount(data.count);
        } else {
          setVehicleCount(0);
        }
      } catch (error) {
        console.error('Error fetching vehicle count:', error);
        setVehicleCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicleCount();
  }, []);

  // Fetch user count
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const url = `${baseUrl}${apiVersion}/authUser/getAllCustomersCount`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user count');
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.users)) {
          setUserCount(data.users.length);
        } else {
          setUserCount(0);
        }
      } catch (error) {
        console.error('Error fetching user count:', error);
        setUserCount(0);
      }
    };

    fetchUserCount();
  }, []);

  // Fetch average rating
  useEffect(() => {
    const fetchAverageRating = async () => {
      try {
        const url = `${baseUrl}${apiVersion}/reviews/overall-average`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data.statistics?.averageRating) {
            setAverageRating(data.statistics.averageRating);
          }
        }
      } catch (error) {
        console.error('Error fetching average rating:', error);
      }
    };

    fetchAverageRating();
  }, []);

  // Animate stats counter (counting up effect)
  useEffect(() => {
    if (isLoading) return;

    const duration = 2000; // 2 seconds
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = duration / frameRate;
    const intervals = [];

    stats.forEach((stat, index) => {
      let frame = 0;
      const counter = setInterval(() => {
        frame++;
        const progress = frame / totalFrames;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = easeOutQuart * stat.value;

        setCounts((prevCounts) => {
          const newCounts = [...prevCounts];
          newCounts[index] = currentValue;
          return newCounts;
        });

        if (frame >= totalFrames) {
          clearInterval(counter);
          setCounts((prevCounts) => {
            const newCounts = [...prevCounts];
            newCounts[index] = stat.value;
            return newCounts;
          });
        }
      }, frameRate);

      intervals.push(counter);
    });

    return () => {
      intervals.forEach((interval) => clearInterval(interval));
    };
  }, [isLoading, vehicleCount, userCount, averageRating]);

  const formatNumber = (value, isDecimal) => {
    if (isDecimal) {
      return value.toFixed(1);
    }
    return Math.floor(value).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="bg-white py-6 border-b border-gray-200">
        <div className="py-8 flex flex-col items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#0d3778] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-sm text-gray-600">Loading stats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-6 border-b border-gray-200 overflow-hidden">
      <div className="relative overflow-hidden">
        <div className="flex animate-stats-marquee">
          {duplicatedStats.map((stat, index) => {
            const statIndex = index % stats.length;

            return (
              <div
                key={index}
                className="flex-shrink-0 w-1/2 px-4 flex justify-center items-center"
              >
                <div className="text-center">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#0d3778] to-[#1a4d99] rounded-xl flex items-center justify-center mb-3 mx-auto shadow-md">
                    <div className="text-white">
                      {stat.icon}
                    </div>
                  </div>

                  <div className="text-center">
                    <p className="text-2xl font-bold text-[#0d3778] mb-1">
                      {formatNumber(counts[statIndex], stat.isDecimal)}
                      {stat.isDecimal ? '' : '+'}
                    </p>
                    <p className="text-xs text-gray-600 leading-4 max-w-[160px] line-clamp-2">
                      {stat.label}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes stats-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }
        .animate-stats-marquee {
          animation: stats-marquee 15s linear infinite;
        }
        .animate-stats-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
};