import React, { useEffect, useState } from "react";
import axios from "axios";
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
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/bookings/owner/:ownerId?status=pending", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const formatted = res.data.data.map((b) => ({
          id: b._id,
          name: "Customer " + b.customerId.slice(-4),
          vNo: "VNo-" + b.vehicleId.slice(-4),
          vName: "Vehicle " + b.vehicleId.slice(-4),
          pDate: new Date(b.startingDate).toLocaleDateString(),
          rDate: new Date(b.endDate).toLocaleDateString(),
          price: b.totalAmount.toLocaleString("en-US"),
          status: b.status,
          sColor:
            b.status === "pending"
              ? "text-yellow-500"
              : b.status === "approved"
              ? "text-green-500"
              : b.status === "rejected"
              ? "text-red-500"
              : "text-gray-500",
        }));

        setData(formatted);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setData([]); // data not available
        setLoading(false);
      }
    };

    fetchBookings();
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
              <td colSpan={tableHeaders.length} className="py-4">
                Loading bookings...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={tableHeaders.length} className="py-4">
                No booking requests found
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr
                key={row.id}
                className="border-b border-brand-dark hover:bg-gray-50 transition-colors"
              >
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BookingTable;
