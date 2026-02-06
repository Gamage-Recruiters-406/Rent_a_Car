import React, { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, data }) => {
  // Backend එකෙන් එන මුල් status එක state එකට ලබා දීම
  const [currentStatus, setCurrentStatus] = useState(data?.status || 'pending');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (data?.status) setCurrentStatus(data.status);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen, data]);

  if (!isOpen || !data) return null;

  // දින ගණන ගණනය කිරීම
  const calculateDays = (start, end) => {
    const diffMs = new Date(end) - new Date(start);
    const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    return days < 10 ? `0${days}` : days;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans leading-relaxed">
      <div className="relative w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-[6px] border-[#0D3778]">
        
        {/* Header */}
        <div className="bg-[#0D3778] px-6 py-5 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold tracking-wide">Booking Management</h2>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-all">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[75vh] overflow-y-auto p-7 space-y-6 custom-scrollbar">
          
          {/* Customer Details */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="text-[14px] font-bold text-[#0D3778] uppercase tracking-wider">Customer Details</h4>
                <span className={`text-white text-[10px] font-bold px-4 py-1 rounded-full tracking-widest uppercase ${
                  currentStatus === 'pending' ? 'bg-[#FF6D00]' : 
                  currentStatus === 'approved' ? 'bg-[#00C853]' : 'bg-[#FF5252]'
                }`}>
                  {currentStatus}
                </span>
            </div>

            <div className="flex flex-col items-center justify-center py-4 text-center">
                <h3 className="text-2xl font-bold text-[#0D3778]">
                  {data.customerId?.first_name} {data.customerId?.last_name}
                </h3>
                <p className="text-base text-[#0D3778]/70 font-medium mt-1">{data.customerId?.email}</p>
                <p className="text-base text-[#0D3778]/70 font-medium">{data.customerId?.contactNumber}</p>
            </div>
          </section>

          {/* Vehicle Details */}
          <section className="space-y-3">
             <h4 className="text-[14px] font-bold text-[#0D3778] uppercase tracking-wider border-b border-gray-100 pb-2">Vehicle Details</h4>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-semibold text-[#0D3778] text-[15px]">{data.vehicleId?.title || 'N/A'}</p>
                <p className="font-semibold text-[#0D3778]/60 text-[12px]">{data.vehicleId?.numberPlate || 'N/A'}</p>
                <p className="font-semibold text-[#0D3778] text-sm">LKR {data.dailyRate?.toLocaleString()}.00/Day</p>
              </div>
              <div className="w-32 transition-transform hover:scale-105">
                <img 
                  src={data.vehicleId?.photos?.[0] ? `${API_BASE_URL}/${data.vehicleId.photos[0]}` : "https://via.placeholder.com/150"} 
                  className="w-full h-20 object-cover rounded-xl" 
                  alt="vehicle" 
                />
              </div>
            </div>
          </section>

          {/* Documents Section */}
          <section className="space-y-3">
            <h4 className="text-[14px] font-bold text-[#0D3778] uppercase tracking-wider border-b border-gray-100 pb-2">Uploaded Documents</h4>
            <div className="space-y-2">
              {data.documents?.length > 0 ? (
                data.documents.map((doc, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FF4D4D] px-2 py-2.5 rounded-lg">
                         <span className="text-[9px] font-black text-white leading-none">PDF</span>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#0D3778] truncate w-40">{doc}</p>
                        <p className="text-[10px] text-gray-500 font-semibold">Document {i+1}</p>
                      </div>
                    </div>
                    <a href={`${API_BASE_URL}/uploads/bookings/${data._id}/${doc}`} download target="_blank" rel="noreferrer">
                      <Download size={18} className="text-gray-800 cursor-pointer hover:text-[#0D3778]" />
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-2">No documents uploaded</p>
              )}
            </div>
          </section>

          {/* Booking Summary */}
          <section className="space-y-3">
            <h4 className="text-[14px] font-bold text-[#0D3778] uppercase tracking-wider border-b border-gray-100 pb-2">Booking Details</h4>
            <div className="grid grid-cols-2 gap-8 py-2">
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#0D3778]/60 font-semibold uppercase tracking-widest mb-1">Pickup Date</span>
                    <span className="text-sm font-bold text-[#0D3778]">{new Date(data.startingDate).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-col text-right">
                    <span className="text-[10px] text-[#0D3778]/60 font-semibold uppercase tracking-widest mb-1">Return Date</span>
                    <span className="text-sm font-bold text-[#0D3778]">{new Date(data.endDate).toLocaleDateString()}</span>
                </div>
            </div>
            
            <div className="flex justify-center py-2">
               <p className="text-xs font-bold text-[#0D3778] tracking-tight">
                Total Duration: <span className="ml-2 font-semibold">{calculateDays(data.startingDate, data.endDate)} Days</span>
               </p>
            </div>

            <div className="bg-[#0D3778] text-white py-4 rounded-2xl text-center font-bold text-xl shadow-lg">
              LKR {data.totalAmount?.toLocaleString()}.00
            </div>
          </section>

          {/* Action Buttons - Only show if pending */}
          {currentStatus === 'pending' && (
            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setCurrentStatus('approved')}
                className="flex-1 bg-[#00C853] hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-xs uppercase tracking-widest"
              >
                Approve Request
              </button>
              <button 
                onClick={() => setCurrentStatus('rejected')}
                className="flex-1 bg-[#FF5252] hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-xs uppercase tracking-widest"
              >
                Reject Request
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #0D377820; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default BookingModal;