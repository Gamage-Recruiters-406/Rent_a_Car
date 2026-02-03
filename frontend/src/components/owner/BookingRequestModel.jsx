import React, { useState, useEffect } from 'react';
import { X, Download, Star } from 'lucide-react';

const BookingModal = ({ isOpen, onClose, data }) => {
  const [currentStatus, setCurrentStatus] = useState('PENDING');

  useEffect(() => {
    if (isOpen) {
      // Modal eka open weddi scroll eka nawaththanawa
      document.body.style.overflow = 'hidden';
    } else {
      // Modal eka close weddi aye scroll eka on karanawa
      document.body.style.overflow = 'unset';
    }

    // Cleanup function: Component eka unmount unoth aye scroll on wenna
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 font-sans leading-relaxed">
      {/* Main Container - Rounded with Top Border */}
      <div className="relative w-full max-w-[420px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-t-[6px] border-[#0D3778]">
        
        {/* Header - Fixed at Top */}
        <div className="bg-[#0D3778] px-6 py-5 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold tracking-wide">Booking Request Management</h2>
          <button onClick={onClose} className="hover:bg-white/20 rounded-full p-1 transition-all">
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="max-h-[75vh] overflow-y-auto p-7 space-y-6 custom-scrollbar">
          
          {/* Customer Details Section */}
          <section className="space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-2">
              <h4 className="text-[14px] font-bold text-[#0D3778] uppercase tracking-wider">Customer Details</h4>
              <span className="bg-[#FF6D00] text-white text-[10px] font-bold px-4 py-1 rounded-full tracking-widest">
                {currentStatus}
              </span>
            </div>

            <div className="flex gap-5">
              <div className="w-24 h-24 rounded-full border-[3px] border-[#0D3778] overflow-hidden shrink-0">
                <img 
                  src="https://www.shutterstock.com/image-photo/portrait-handsome-businessman-on-white-600nw-1664184724.jpg" 
                  className="w-full h-full object-cover" 
                  alt="customer" 
                />
              </div>
              <div className="pt-1">
                <h3 className="text-xl font-bold text-[#0D3778]">Jason Lee</h3>
                <p className="text-sm text-[#0D3778]/70 font-medium">jasonlee@example.com</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <div className="flex text-gray-400">
                    <Star size={14} fill="#F0B100" stroke="none" />
                    <Star size={14} fill="#F0B100" stroke="none" />
                    <Star size={14} fill="#F0B100" stroke="none" />
                    <Star size={14} className="text-gray-200" strokeWidth={3} />
                    <Star size={14} className="text-gray-200" strokeWidth={3} />
                  </div>
                  <span className="text-[#0D3778] text-xs font-semibold">(3.0)</span>
                </div>
                <p className="text-[10px] text-[#0D3778] font-semibold uppercase tracking-widest mt-2">Past Bookings: 02</p>
              </div>
            </div>
          </section>

          {/* Vehicle Details Section */}
          <section className="space-y-3">
             <h4 className="text-[14px] font-bold text-[#0D3778] uppercase tracking-wider border-b border-gray-100 pb-2">Vehicle Details</h4>
            <div className="flex justify-between items-center">
              <div className="space-y-1">
                <p className="font-semibold text-[#0D3778] text-[15px]">Toyota Corolla</p>
                <p className="font-semibold text-[#0D3778] text-[12px]">CA-1234</p>
                <p className="text-xs text-[#0D3778] font-semibold">Color code: <span className="text-red-500">Red</span></p>
                <p className="font-semibold text-[#0D3778] text-sm">LKR 8,000.00/Day</p>
              </div>
              <div className="w-50 transition-transform hover:scale-105">
                <img 
                  src="https://tse2.mm.bing.net/th/id/OIP.Y14SFHkuRSnLnVWPtbYIcgHaE6?rs=1&pid=ImgDetMain" 
                  className="w-full object-contain" 
                  alt="car" 
                />
              </div>
            </div>
          </section>

          {/* Documents Section */}
          <section className="space-y-3">
            <h4 className="text-[14px] font-bold text-[#0D3778] uppercase tracking-wider border-b border-gray-100 pb-2">Uploaded Documents</h4>
            <div className="space-y-2">
              {['Driving Licence.pdf', 'ID Card.pdf'].map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#FF4D4D] px-2 py-2.5 rounded-lg flex items-center justify-center">
                       <span className="text-[9px] font-black text-white leading-none">PDF</span>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#0D3778]">{doc}</p>
                      <p className="text-[10px] text-gray-500 font-semibold">02 pages . PDF . 1 MB</p>
                    </div>
                  </div>
                  <Download size={18} className="text-gray-800 cursor-pointer hover:text-[#0D3778] hover:scale-105" />
                </div>
              ))}
            </div>
          </section>

          {/* Booking Summary Section */}
          <section className="space-y-3">
            <h4 className="text-[14px] font-bold text-[#0D3778] uppercase tracking-wider border-b border-gray-100 pb-2">Booking Details</h4>
            <div className="grid grid-cols-2 gap-8 py-2">
                {/* Left Side - Pickup Date */}
                <div className="flex flex-col">
                    <span className="text-[10px] text-[#0D3778] font-semibold uppercase tracking-widest mb-1">
                    Pickup Date
                    </span>
                    <span className="text-sm font-bold text-[#0D3778]">
                    2026-01-23
                    </span>
                </div>

                {/* Right Side - Return Date */}
                <div className="flex flex-col text-right">
                    <span className="text-[10px] text-[#0D3778] font-semibold uppercase tracking-widest mb-1">
                    Return Date
                    </span>
                    <span className="text-sm font-bold text-[#0D3778]">
                    2026-01-25
                    </span>
                </div>
                </div>
            
            <div className="flex justify-center py-2">
               <p className="text-xs font-bold text-[#0D3778] tracking-tight">Total Days: <span className="ml-2 font-semibold">03 Days</span></p>
            </div>

            {/* Total Price Display */}
            <div className="bg-[#0D3778] text-white py-4 rounded-2xl text-center font-bold text-xl shadow-lg">
              LKR 24,000.000
            </div>
          </section>

          {/* Action Buttons - Fixed relative to scroll or inside content */}
          <div className="flex gap-3 pt-2">
            <button 
              onClick={() => setCurrentStatus('APPROVED')}
              className="flex-1 bg-[#00C853] hover:bg-green-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-xs uppercase tracking-widest"
            >
              Approve Request
            </button>
            <button 
              onClick={() => setCurrentStatus('REJECTED')}
              className="flex-1 bg-[#FF5252] hover:bg-red-600 text-white font-bold py-4 rounded-2xl transition-all shadow-md text-xs uppercase tracking-widest"
            >
              Reject Request
            </button>
          </div>
        </div>
      </div>

      {/* CSS Scrollbar Style */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #0D377820; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #0D377840; }
      `}</style>
    </div>
  );
};

export default BookingModal;