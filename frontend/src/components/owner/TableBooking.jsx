import React from "react";
import { FileText } from "lucide-react";

const BookingTable = ({ data = [], loading = false, onViewAction }) => {
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

  // Dummy Data (API eken data enne nathnam meka use wenawa)
  const dummyData = [
    {
      _id: "1",
      customerId: { first_name: "Jason", last_name: "Lee", email: "jasonlee@example.com", profileImage: "https://img.freepik.com/premium-photo/portrait-happy-business-man-suit-crossed-arms-white-background_457222-56605.jpg" },
      vehicleId: { title: "Toyota Corolla", numberPlate: "CA-1234", pricePerDay: 8000, images: ["https://www.toyota.com.lk/wp-content/uploads/2020/07/corolla-red.png"] },
      startingDate: "2026-01-23",
      endDate: "2026-01-25",
      totalAmount: 24000,
      status: "pending",
    },
    {
      _id: "2",
      customerId: { first_name: "Kevin", last_name: "Martinez", email: "kevin@example.com", profileImage: "https://i.pravatar.cc/150?u=kevin" },
      vehicleId: { title: "Honda Civic", numberPlate: "WP-4678", pricePerDay: 9500, images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/2022_Honda_Civic_Sport_Sedan_in_Rallye_Red%2C_Front_Left%2C_01-12-2022.jpg/1200px-2022_Honda_Civic_Sport_Sedan_in_Rallye_Red%2C_Front_Left%2C_01-12-2022.jpg"] },
      startingDate: "2026-02-01",
      endDate: "2026-02-03",
      totalAmount: 19000,
      status: "approved",
    }
  ];

  const displayData = data.length > 0 ? data : dummyData;

  return (
    <div className="bg-white rounded-sm overflow-hidden border border-[#ffffff] font-['Nunito'] shadow-md">
      <table className="w-full text-center border-collapse">
        <thead>
          <tr className="bg-[#0D3778] text-white">
            {tableHeaders.map((head) => (
              <th key={head} className="px-4 py-6 border border-[#ffffff] font-semibold text-sm tracking-wide">
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="text-gray-700">
          {loading ? (
            <tr><td colSpan={tableHeaders.length} className="py-12">Loading...</td></tr>
          ) : (
            displayData.map((row) => {
              const statusColorMap = {
                pending: "text-[#BF5E14]",
                approved: "text-[#008236]",
                rejected: "text-[#E53E3E]",
              };

              return (
                <tr key={row._id} className="border-b border-[#ebe6e5] hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778] font-medium">
                    {row.customerId ? `${row.customerId.first_name} ${row.customerId.last_name}` : "N/A"}
                  </td>
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">{row.vehicleId?.numberPlate}</td>
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">{row.vehicleId?.title}</td>
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">{new Date(row.startingDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778]">{new Date(row.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-4 border border-[#0D3778] text-[#0D3778] font-semibold">{row.totalAmount?.toLocaleString()}</td>
                  <td className={`px-4 py-4 border border-[#0D3778] font-bold ${statusColorMap[row.status] || "text-gray-700"}`}>
                    <span className="capitalize">{row.status}</span>
                  </td>
                  <td className="px-4 py-4 border border-[#0D3778]">
                    <button 
                      onClick={() => onViewAction(row)}
                      className="text-[#0D3778] hover:scale-125 transition-transform p-1"
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