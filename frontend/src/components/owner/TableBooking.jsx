import React, { useEffect, useState } from "react";
import { FileText } from "lucide-react";

const BookingTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // API call එක remove කරලා dummy data දාලා තියෙනවා
    const dummyData = [
      {
        id: "booking001",
        name: "Nimal Perera",
        vNo: "WP CAB-1234",
        vName: "Toyota Prius Hybrid",
        pDate: "2025-10-15",
        rDate: "2025-10-18",
        price: "45,000",
        status: "pending",
        sColor: "text-yellow-500",
      },
      {
        id: "booking002",
        name: "Saman Kumari",
        vNo: "CP SUV-5678",
        vName: "Suzuki Vitara",
        pDate: "2025-10-20",
        rDate: "2025-10-25",
        price: "72,500",
        status: "approved",
        sColor: "text-green-500",
      },
      {
        id: "booking003",
        name: "Ruwan Fernando",
        vNo: "WP LUX-9012",
        vName: "BMW X5",
        pDate: "2025-11-05",
        rDate: "2025-11-10",
        price: "185,000",
        status: "rejected",
        sColor: "text-red-500",
      },
      {
        id: "booking004",
        name: "Tharindu Silva",
        vNo: "SP VAN-3456",
        vName: "Toyota Hiace",
        pDate: "2025-11-12",
        rDate: "2025-11-15",
        price: "38,000",
        status: "cancelled",
        sColor: "text-gray-500",
      },
      {
        id: "booking005",
        name: "Kavindi Jayasinghe",
        vNo: "WP SED-7890",
        vName: "Honda Civic",
        pDate: "2025-11-18",
        rDate: "2025-11-20",
        price: "28,500",
        status: "pending",
        sColor: "text-yellow-500",
      },
    ];

    // කුඩා delay එකක් දාලා realistic loading එකක් simulate කරනවා
    setTimeout(() => {
      setData(dummyData);
      setLoading(false);
    }, 800);

  }, []);

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
            data.map((row) => (
              <tr
                key={row.id}
                className="border-b border-brand-dark hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4 border border-brand-dark text-brand-dark font-medium">
                  {row.name}
                </td>
                <td className="px-4 py-4 border border-brand-dark text-brand-dark">
                  {row.vNo}
                </td>
                <td className="px-4 py-4 border border-brand-dark text-brand-dark">
                  {row.vName}
                </td>
                <td className="px-4 py-4 border border-brand-dark text-brand-dark">
                  {row.pDate}
                </td>
                <td className="px-4 py-4 border border-brand-dark text-brand-dark">
                  {row.rDate}
                </td>
                <td className="px-4 py-4 border border-brand-dark text-brand-dark font-semibold">
                  Rs. {row.price}
                </td>
                <td className={`px-4 py-4 border border-brand-dark font-bold ${row.sColor}`}>
                  {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;