import React from 'react';
import { FileText } from 'lucide-react';

const BookingTable = ({ data }) => (
  <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-brand-dark">
    <table className="w-full text-center border-collapse">
      <thead>
        <tr className="bg-brand-dark text-white">
          {['Customer', 'Vehicle No', 'Vehicle Name', 'Pickup date', 'Return date', 'Total Price (LKR)', 'Status', 'Action'].map((head) => (
            <th key={head} className="px-4 py-3 border border-gray-300 font-semibold">{head}</th>
          ))}
        </tr>
      </thead>
      <tbody className="text-gray-700">
        {data.map((row, i) => (
          <tr key={i} className="border-b border-brand-dark hover:bg-gray-50 transition-colors">
            <td className="px-4 py-3 border border-brand-dark text-brand-dark">{row.name}</td>
            <td className="px-4 py-3 border border-brand-dark text-brand-dark">{row.vNo}</td>
            <td className="px-4 py-3 border border-brand-dark text-brand-dark">{row.vName}</td>
            <td className="px-4 py-3 border border-brand-dark text-brand-dark">{row.pDate}</td>
            <td className="px-4 py-3 border border-brand-dark text-brand-dark">{row.rDate}</td>
            <td className="px-4 py-3 border border-brand-dark text-brand-dark">{row.price}</td>
            <td className={`px-4 py-3 border border-brand-dark font-bold ${row.sColor}`}>{row.status}</td>
            <td className="px-4 py-3 border border-brand-dark">
              <button className="text-brand-dark hover:scale-110 transition-transform">
                <FileText size={20} />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default BookingTable;