
import React from 'react'
import {Clock,  Bolt, Percent, CheckCircle } from 'lucide-react';
export const QuickStats = () => {
     const quickStats = [
    { icon: Bolt, number: 'Instant', label: 'Booking Confirmation' },
    { icon: Percent, number: '40%', label: 'Cheaper Than Traditional' },
    { icon: Clock, number: '2 Min', label: 'Average Signup Time' },
    { icon: CheckCircle, number: '100%', label: 'Verified Vehicles' },
  ];
  return (
    <div> <section className="bg-gradient-to-br from-[#0d3778] to-[#1a4d99] py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 text-white text-center">
            {quickStats.map((stat, index) => (
              <div key={index}>
                <div className="text-2xl sm:text-3xl font-bold mb-1 flex items-center justify-center gap-2">
                  <stat.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm opacity-90">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section></div>
  )
}
