import React, { useEffect, useState } from "react";
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
    <div className="bg-white rounded-sm shadow-sm overflow-hidden border border-brand-dark">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-brand-dark text-white">
            {tableHeaders.map((head) => (
              <th
                key={head}
                className="px-4 py-3 border border-gray-300 font-semibold"
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
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-dark"></div>
                  <span className="text-gray-600">Loading booking requests...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={tableHeaders.length} className="py-12 text-center text-gray-500">
                No booking requests found
              </td>
            </tr>
          ) : (
            data.map((row) => {
              // Get status color
              const statusColorMap = {
                pending: "text-yellow-700",
                approved: "text-green-700",
                rejected: "text-red-700",
                cancelled: "text-gray-700"
              };

              return (
                <tr
                  key={row._id}
                  className="border-b border-brand-dark hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4 border border-brand-dark text-brand-dark font-medium">
                    {row.customerId ? `${row.customerId.first_name} ${row.customerId.last_name}` : "N/A"}
                  </td>
                  <td className="px-4 py-4 border border-brand-dark text-brand-dark">
                    {row.vehicleId?.numberPlate || "N/A"}
                  </td>
                  <td className="px-4 py-4 border border-brand-dark text-brand-dark">
                    {row.vehicleId?.title || "N/A"}
                  </td>
                  <td className="px-4 py-4 border border-brand-dark text-brand-dark">
                    {row.startingDate ? new Date(row.startingDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-4 border border-brand-dark text-brand-dark">
                    {row.endDate ? new Date(row.endDate).toLocaleDateString() : "N/A"}
                  </td>
                  <td className="px-4 py-4 border border-brand-dark text-brand-dark font-semibold">
                    {row.currency} {row.totalAmount?.toLocaleString() || "0"}
                  </td>
                  <td className={`px-4 py-4 border border-brand-dark font-bold ${statusColorMap[row.status] || "text-gray-700"}`}>
                    {row.status?.charAt(0).toUpperCase() + row.status?.slice(1)}
                  </td>
                  <td className="px-4 py-4 border border-brand-dark">
                    <button 
                      className="text-brand-dark hover:text-brand hover:scale-110 transition-transform"
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