import React from "react";
import { FileText } from "lucide-react";

const BookingTable = ({ data = [], loading = false }) => {
  const tableHeaders = [
    "Customer",
    "Vehicle No",
    "Vehicle Name",
    "Pickup date",
    "Return date",
    "Total Price (LKR)",
    "Status",
    "Action",
  ];

  return (
    <div className="bg-white rounded-sm overflow-hidden border border-[#ffffff] font-['Nunito']">
      <table className="w-full text-center border-collapse">
        <thead>
          {/* Header row - bg color property remain same */}
          <tr className="bg-[#0D3778] text-white">
            {tableHeaders.map((head) => (
              <th
                key={head}
                // py-6 පාවිච්චි කරලා උස (height) වැඩි කළා 
                // border-[#ffffff] පාවිච්චි කරලා ලයින් සුදු කළා
                className="px-4 py-6 border border-[#ffffff] font-semibold text-sm tracking-wide"
              >
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {loading ? (
            <tr>
              <td colSpan={tableHeaders.length} className="py-12 text-center">
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0D3778]"></div>
                  <span className="text-gray-600 font-['Nunito']">Loading booking requests...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={tableHeaders.length} className="py-12 text-center text-gray-500 font-['Nunito']">
                No booking requests found
              </td>
            </tr>
          ) : (
            data.map((row) => {
              const statusColorMap = {
                pending: "text-[#BF5E14]",
                approved: "text-[#008236]",
                rejected: "text-[#E53E3E]",
                cancelled: "text-gray-500"
              };

              return (
                <tr
                  key={row._id}
                  className="border-b border-[#ebe6e5] hover:bg-gray-50 transition-colors"
                >
                  {/* Body cells - borders remain as you set previously */}
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778] font-medium">
                    {row.customerId ? `${row.customerId.first_name} ${row.customerId.last_name}` : "N/A"}
                  </td>
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">
                    {row.vehicleId?.numberPlate || "N/A"}
                  </td>
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">
                    {row.vehicleId?.title || "N/A"}
                  </td>
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">
                    {row.startingDate ? new Date(row.startingDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">
                    {row.endDate ? new Date(row.endDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778] font-semibold">
                    {row.totalAmount?.toLocaleString() || "0"}
                  </td>
                  <td className={`px-4 py-4 border border-[#0D3778] font-bold ${statusColorMap[row.status] || "text-gray-700"}`}>
                    <span className="capitalize">{row.status}</span>
                  </td>
                  <td className="px-4 py-4 border border-[#0D3778]">
                    <button 
                      className="text-[#0D3778] hover:scale-110 transition-transform p-1"
                      title="View Details"
                    >
                      <FileText size={22} />
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;