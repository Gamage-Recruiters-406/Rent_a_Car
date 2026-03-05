import React, { useState, useEffect, useRef } from 'react';

const baseUrl = 'http://localhost:8090';
const apiVersion = '/api/v1';

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}${apiVersion}/reviews/home`);

      if (!response.ok) {
        throw new Error('Failed to fetch testimonials');
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.reviews)) {
        setTestimonials(data.reviews);
      } else {
        setTestimonials([]);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching testimonials:', err);
      setError(err.message);
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play functionality
  useEffect(() => {
    if (testimonials.length > 1) {
      startAutoPlay();
    }

    return () => {
      stopAutoPlay();
    };
  }, [testimonials.length, currentIndex]);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1 >= testimonials.length ? 0 : prevIndex + 1;
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

  // Helper functions
  const getCustomerName = (testimonial) => {
    if (testimonial.customer_id) {
      const { first_name, last_name } = testimonial.customer_id;
      if (first_name && last_name) {
        return `${first_name} ${last_name}`;
      }
      if (first_name) return first_name;
    }
    return 'Anonymous';
  };

  const getInitials = (name) => {
    if (!name || name === 'Anonymous') return 'AN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  const goToNext = () => {
    const nextIndex = currentIndex < testimonials.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(nextIndex);
    scrollToIndex(nextIndex);
    startAutoPlay();
  };

  const goToPrev = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : testimonials.length - 1;
    setCurrentIndex(prevIndex);
    scrollToIndex(prevIndex);
    startAutoPlay();
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0d3778] to-[#1a4d99] py-12 pt-12 pb-16">
        <h2 className="text-3xl font-bold text-white text-center mb-2 px-4">
          What Our Customers Say
        </h2>
        <p className="text-base text-white/90 text-center mb-8 px-4">
          Join thousands of satisfied renters
        </p>
        <div className="min-h-[300px] flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-[#0d3778] to-[#1a4d99] py-12 pt-12 pb-16">
      <h2 className="text-3xl font-bold text-white text-center mb-2 px-4">
        What Our Customers Say
      </h2>
      <p className="text-base text-white/90 text-center mb-8 px-4">
        Join thousands of satisfied renters
      </p>

      {error ? (
        <div className="min-h-[200px] flex flex-col items-center justify-center px-8">
          <p className="text-white/70 text-center text-base mb-2">
            ⚠️ Failed to load reviews
          </p>
          <p className="text-white/60 text-center text-xs">{error}</p>
        </div>
      ) : testimonials.length === 0 ? (
        <div className="min-h-[200px] flex items-center justify-center px-8">
          <p className="text-white/70 text-center text-base">
            No reviews available at the moment.
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Navigation Buttons */}
          {testimonials.length > 1 && (
            <>
              <button
                onClick={goToPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={goToNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
              >
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Testimonials Carousel */}
          <div
            ref={carouselRef}
            className="overflow-x-auto scrollbar-hide snap-x snap-mandatory"
            onMouseEnter={stopAutoPlay}
            onMouseLeave={startAutoPlay}
            style={{ scrollSnapType: 'x mandatory' }}
          >
            <div className="flex gap-4 px-[7.5%]">
              {testimonials.map((item) => {
                const customerName = getCustomerName(item);

                return (
                  <div
                    key={item._id}
                    className="flex-shrink-0 w-[85%] snap-center"
                  >
                    <div className="bg-white/15 backdrop-blur-sm p-6 rounded-2xl border border-white/20 min-h-[280px] flex flex-col">
                      {/* Rating Stars */}
                      {renderStars(item.rate)}

                      {/* Feedback */}
                      <p className="text-base text-white/95 leading-6 mb-5 flex-grow line-clamp-4">
                        "{item.feedback}"
                      </p>

                      {/* Customer Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-bold text-[#0d3778]">
                            {getInitials(customerName)}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-semibold text-white mb-1">
                            {customerName}
                          </p>
                          <p className="text-xs text-white/80">
                            {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dot Indicators */}
          {testimonials.length > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    scrollToIndex(index);
                    startAutoPlay();
                  }}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === index 
                      ? 'w-8 bg-white' 
                      : 'w-2 bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

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