import React from 'react';

const BookingTable = ({ data }) => (
  <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
    <table className="w-full border-collapse">
      <thead>
        <tr style={{ backgroundColor: '#0D3778' }}>
          {['Customer', 'Vehicle Owner', 'Vehicle Name', 'Pickup date', 'Return date', 'Total Price (LKR)', 'Status (View Only)'].map((head) => (
            <th key={head} className="px-4 py-4 font-semibold text-sm border border-gray-300 text-center text-white" style={{ backgroundColor: '#0D3778' }}>{head}</th>
          ))}
        </tr>
      </thead>
      <tbody className="text-gray-700">
        {data.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 transition-colors">
            <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.name}</td>
            <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.vOwner}</td>
            <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.vName}</td>
            <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.pDate}</td>
            <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.rDate}</td>
            <td className="px-4 py-4 text-brand-dark border border-gray-300 text-center">{row.price}</td>
            <td className={`px-4 py-4 font-semibold border border-gray-300 text-center ${row.sColor}`}>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default BookingTable;

