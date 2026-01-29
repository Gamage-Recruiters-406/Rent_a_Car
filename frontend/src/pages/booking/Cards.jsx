import React from 'react';

const iconBgColors = {
  purple: 'bg-purple-100',
  yellow: 'bg-orange-100',
  green: 'bg-green-100',
  red: 'bg-red-100',
};

const iconColors = {
  purple: 'text-purple-500',
  yellow: 'text-orange-500',
  green: 'text-green-500',
  red: 'text-red-500',
};

const borderColors = {
  purple: '#6F00FF',
  yellow: '#E17100',
  green: '#05DF72',
  red: '#E53E3E',
};

const Cards = ({ label, val, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border-2 flex items-center gap-4" style={{ borderColor: borderColors[color] }}>
    <div className={`${iconBgColors[color]} ${iconColors[color]} p-3 rounded-full`}>
      {icon}
    </div>
    <div>
      <h3 className="text-3xl font-bold text-brand-dark leading-none mb-1">{val}</h3>
      <p className="text-sm text-gray-600">{label}</p>
    </div>
  </div>
);

export default Cards;
