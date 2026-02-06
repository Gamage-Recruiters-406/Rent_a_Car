import React from 'react'
import {  Car, Users,  Star } from 'lucide-react';
export const Items = () => { 
  const cars = [
    {
      image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop',
      title: 'Toyota Prius 2022',
      seats: 5,
      transmission: 'Auto',
      rating: 4.9,
      price: 'LKR 8,500',
    },
    {
      image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400&h=300&fit=crop',
      title: 'Honda Civic 2023',
      seats: 5,
      transmission: 'Auto',
      rating: 4.8,
      price: 'LKR 9,500',
    },
    {
      image: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400&h=300&fit=crop',
      title: 'Toyota RAV4 2021',
      seats: 7,
      transmission: 'Auto',
      rating: 5.0,
      price: 'LKR 12,000',
    },
    {
      image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop',
      title: 'BMW 3 Series 2024',
      seats: 5,
      transmission: 'Auto',
      rating: 4.9,
      price: 'LKR 18,500',
    },
  ];

  return (
    <div><section className="py-12 sm:py-20">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#0d3778] mb-4">
              Popular Cars
            </h2>
            <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto">
              Most booked vehicles on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {cars.map((car, index) => (
              <div 
                key={index}
                className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer relative"
              >
                <div className="absolute inset-0 bg-linear-to-br from-[#0d3778]/10 to-[#1a4d99]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                <div className="overflow-hidden h-48 sm:h-56">
                  <img 
                    src={car.image} 
                    alt={car.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
                <div className="p-5 sm:p-7 relative z-20">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{car.title}</h3>
                  <div className="flex gap-4 text-gray-500 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {car.seats} Seats
                    </span>
                    <span className="flex items-center gap-1">
                      <Car className="w-4 h-4" /> {car.transmission}
                    </span>
                    <span className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-yellow-500" /> {car.rating}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div>
                      <span className="text-2xl font-bold text-[#0d3778]">{car.price}</span>
                      <span className="text-sm text-gray-500">/day</span>
                    </div>
                    <button className="bg-blue-900 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition">
  View Details
</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section></div>
  )
}
