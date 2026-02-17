import React, { useState } from 'react';

const baseUrl = 'http://localhost:8090';
const apiVersion = '/api/v1';

export const NewsLetter = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubscribe = async () => {
    // Basic email validation
    if (!email || !validateEmail(email)) {
      setMessage({
        text: 'Please enter a valid email address',
        type: 'error',
      });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await fetch(
        `${baseUrl}${apiVersion}/subscription/create-subscription`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        setEmail(''); // Clear the input on success
      } else {
        setMessage({ text: data.message, type: 'error' });
      }
    } catch (error) {
      setMessage({
        text: 'Failed to subscribe. Please try again later.',
        type: 'error',
      });
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      handleSubscribe();
    }
  };

  return (
    <div className="bg-gray-50 py-12 px-4">
      <div className="max-w-2xl w-full mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-[#0d3778] mb-4">
            Stay Updated
          </h2>
          <p className="text-base text-gray-600 leading-6 px-2">
            Subscribe to our newsletter for exclusive deals, new vehicle
            listings, and travel tips
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Email Input */}
          <div className="flex items-center bg-white border-2 border-gray-200 rounded-xl px-4 py-1 focus-within:border-[#0d3778] transition-colors">
            <svg 
              className="w-5 h-5 text-gray-600 mr-3"
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
              />
            </svg>
            <input
              type="email"
              className="flex-1 text-base text-gray-900 py-4 outline-none placeholder-gray-400"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>

          {/* Subscribe Button */}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className={`w-full bg-[#0d3778] text-white rounded-xl py-[18px] px-6 flex items-center justify-center gap-2 font-semibold shadow-md hover:bg-[#0a2a5c] transition-colors ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span className="text-base">Subscribe</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </div>

        {/* Success/Error Message */}
        {message.text && (
          <div
            className={`flex items-center p-4 rounded-xl mt-4 border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <svg
              className={`w-5 h-5 mr-3 flex-shrink-0 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {message.type === 'success' ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              )}
            </svg>
            <p
              className={`flex-1 text-sm leading-5 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {message.text}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};