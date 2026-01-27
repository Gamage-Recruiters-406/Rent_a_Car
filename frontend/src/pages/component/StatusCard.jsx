import React from 'react';

const StatsCard = ({ label, val, icon, color }) => (
  <div className={`bg-white p-6 rounded-2xl shadow-lg border-l-8 ${color} flex items-center gap-4`}>
    <div className="text-brand-dark">
      {icon}
    </div>
    <div>
      <p className="text-lg font-semibold text-brand-dark leading-tight mb-2">{label}</p>
      <h3 className="text-3xl font-bold text-brand-dark leading-none">{val}</h3>
    </div>
  </div>
);

export default StatsCard;