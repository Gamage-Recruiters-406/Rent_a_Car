import React, { useState } from "react";

export default function CustomerReviews() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);


  // Dummy data - Needs to replace with APIs
  const reviews = [
    {
      name: "Person Name",
      role: "Profession",
      rating: 4,
      comment:
        "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
      img: "https://i.pravatar.cc/100?img=12",
    },
    {
      name: "Person Name",
      role: "Profession",
      rating: 5,
      comment:
        "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
      img: "https://i.pravatar.cc/100?img=32",
    },
  ];

  return (
    <div className="w-full min-h-screen bg-white px-6 py-10">
      {/* Page Title */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-semibold text-blue-900">Customer Reviews</h1>
        <p className="text-blue-600 mt-2">Share Your Experience With Us</p>
      </div>

      {/* Car & Rating Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        {/* Car Image */}
        <img
          src="https://images.unsplash.com/photo-1549924231-f129b911e442"
          alt="Car"
          className="rounded-lg shadow"
        />

        {/* Rating Box */}
        <div className="border rounded-xl p-6 text-center shadow-sm">
          <h2 className="text-xl font-medium mb-4">Toyota Prius (ABC-1234)</h2>
          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="text-4xl font-semibold text-yellow-500">0.0</p>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">☆</span>
                ))}
              </div>
            </div>
            <div className="h-12 w-px bg-gray-300"></div>
            <div>
              <p className="text-3xl font-semibold text-blue-900">0</p>
              <p className="text-sm text-gray-500">Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Rating */}
      <div className="max-w-3xl mx-auto mt-14">
        <h3 className="text-center text-lg font-medium mb-4">Your Rating</h3>
        <div className="flex justify-center mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              className={`text-3xl ${
                star <= (hover || rating)
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            >
              ★
            </button>
          ))}
        </div>

        {/* Feedback */}
        <label className="block mb-2 font-medium">Write Feedback</label>
        <textarea
          placeholder="Share your experience..."
          className="w-full border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="4"
        />

        <div className="flex justify-end gap-4 mt-6">
          <button className="px-6 py-2 border rounded-lg text-gray-600">
            Cancel
          </button>
          <button className="px-6 py-2 bg-blue-800 text-white rounded-lg">
            Submit Review
          </button>
        </div>
      </div>

      {/* Clients Reviews */}
      <div className="mt-20 bg-gray-100 py-14">
        <h2 className="text-center text-2xl font-semibold mb-10">
          Clients Reviews
        </h2>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-6">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow p-6 flex gap-4"
            >
              <img
                src={review.img}
                alt="profile"
                className="w-14 h-14 rounded-full"
              />
              <div>
                <h4 className="font-semibold">{review.name}</h4>
                <p className="text-sm text-gray-500">{review.role}</p>
                <div className="flex mt-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`$${
                        i < review.rating
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-600 text-sm">"{review.comment}"</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
