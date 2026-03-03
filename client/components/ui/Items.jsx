import React, { useState, useEffect, useRef } from 'react';

const CARD_WIDTH = 85; // percentage

export const Items = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    fetchCars();
  }, []);

  useEffect(() => {
    if (cars.length > 1) {
      startAutoPlay();
    }

    return () => {
      stopAutoPlay();
    };
  }, [cars.length, currentIndex]);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8090/api/v1/vehicle/top-booked');

      if (!response.ok) {
        throw new Error('Failed to fetch vehicles');
      }

      const data = await response.json();

      if (data.success && data.vehicles) {
        setCars(data.vehicles);
      } else {
        setCars([]);
      }
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1 >= cars.length ? 0 : prevIndex + 1;
        scrollToIndex(nextIndex);
        return nextIndex;
      });
    }, 3000);
  };

  const stopAutoPlay = () => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  };

  const scrollToIndex = (index) => {
    if (carouselRef.current) {
      const scrollAmount = index * (carouselRef.current.offsetWidth * 0.85 + 16);
      carouselRef.current.scrollTo({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const goToNext = () => {
    const nextIndex = currentIndex < cars.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(nextIndex);
    scrollToIndex(nextIndex);
    startAutoPlay();
  };

  const goToPrev = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : cars.length - 1;
    setCurrentIndex(prevIndex);
    scrollToIndex(prevIndex);
    startAutoPlay();
  };

  if (loading) {
    return (
      <div className="bg-white py-12">
        <div className="text-center mb-8 px-5">
          <h2 className="text-3xl font-bold text-[#0d3778] mb-2">Popular Cars</h2>
          <p className="text-base text-gray-600 max-w-xs mx-auto">Most booked vehicles on our platform</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="w-12 h-12 border-4 border-[#0d3778] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-base text-gray-600">Loading popular cars...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-12">
        <div className="text-center mb-8 px-5">
          <h2 className="text-3xl font-bold text-[#0d3778] mb-2">Popular Cars</h2>
          <p className="text-base text-gray-600 max-w-xs mx-auto">Most booked vehicles on our platform</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px] px-5">
          <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base text-red-500 text-center mt-4 mb-4">Error: {error}</p>
          <button 
            onClick={fetchCars}
            className="bg-[#0d3778] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0a2a5c] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!cars || cars.length === 0) {
    return (
      <div className="bg-white py-12">
        <div className="text-center mb-8 px-5">
          <h2 className="text-3xl font-bold text-[#0d3778] mb-2">Popular Cars</h2>
          <p className="text-base text-gray-600 max-w-xs mx-auto">Most booked vehicles on our platform</p>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-base text-gray-600 text-center mt-4">No popular cars available at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-12">
      {/* Header */}
      <div className="text-center mb-8 px-5">
        <h2 className="text-3xl font-bold text-[#0d3778] mb-2">Popular Cars</h2>
        <p className="text-base text-gray-600 max-w-xs mx-auto">Most booked vehicles on our platform</p>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Buttons */}
        {cars.length > 1 && (
          <>
            <button
              onClick={goToPrev}
              className="absolute left-2 top-[45%] -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-[#0d3778]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={goToNext}
              className="absolute right-2 top-[45%] -translate-y-1/2 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-[#0d3778]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Cars Carousel */}
        <div
          ref={carouselRef}
          className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
          onMouseEnter={stopAutoPlay}
          onMouseLeave={startAutoPlay}
          style={{ scrollSnapType: 'x mandatory' }}
        >
          <div className="flex gap-4 px-[7.5%]">
            {cars.map((item, index) => {
              const car = item?.vehicle || {};
              const firstPhoto = car.photos && car.photos.length > 0 ? car.photos[0].url : '';

              if (!firstPhoto) return null;

              const imageUrl = `http://localhost:8090${firstPhoto}`;

              return (
                <div
                  key={car._id}
                  className="flex-shrink-0 w-[85%] snap-center"
                >
                  <div
                    className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => console.log('View details:', car.title)}
                  >
                    {/* Vehicle Image */}
                    <div className="w-full h-52 bg-gray-200">
                      <img
                        src={imageUrl}
                        alt={car.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Card Content */}
                    <div className="p-5">
                      <h3 className="text-xl font-semibold text-gray-900 mb-3 text-center line-clamp-2">
                        {car.title || 'Untitled Vehicle'}
                      </h3>

                      {/* Features */}
                      <div className="flex justify-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">{car.seats || 0} Seats</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">{car.transmission || 'N/A'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-yellow-500 font-semibold">{item.bookingCount || 0}</span>
                        </div>
                      </div>

                      <div className="h-px bg-gray-200 my-4"></div>

                      {/* Price and Button */}
                      <div className="text-center">
                        <p className="text-2xl font-bold text-[#0d3778] mb-4">
                          LKR {(car.pricePerDay || 0).toLocaleString()}
                          <span className="text-sm text-gray-600 font-normal">/day</span>
                        </p>

                        <button className="w-full bg-[#1e3a8a] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#1e3a8a]/90 transition-colors">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dot Indicators */}
        {cars.length > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            {cars.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  scrollToIndex(index);
                  startAutoPlay();
                }}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === index 
                    ? 'w-8 bg-[#0d3778]' 
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};