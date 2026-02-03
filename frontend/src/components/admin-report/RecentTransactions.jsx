import { Search, Filter, Eye } from "lucide-react";

const transactions = [
  {
    id: 1,
    customer: "John Silva",
    avatar: "J",
    vehicle: "Toyota Aqua",
    revenue: "Rs. 12,500",
    status: "Completed",
  },
  {
    id: 2,
    customer: "Sarah Fernando",
    avatar: "S",
    vehicle: "Honda Civic",
    revenue: "Rs. 18,000",
    status: "Completed",
  },
  {
    id: 3,
    customer: "Kamal Perera",
    avatar: "K",
    vehicle: "Toyota Prius",
    revenue: "Rs. 15,500",
    status: "Pending",
  },
  {
    id: 4,
    customer: "Nimal De Silva",
    avatar: "N",
    vehicle: "Suzuki Alto",
    revenue: "Rs. 8,500",
    status: "Completed",
  },
  {
    id: 5,
    customer: "Amara Jayasinghe",
    avatar: "A",
    vehicle: "Honda Fit",
    revenue: "Rs. 11,000",
    status: "Completed",
  },
];

const avatarColors = [
  "bg-[#0D3778]",
  "bg-[#0D3778]",
  "bg-[#0D3778]",
  "bg-[#0D3778]",
  "bg-[#0D3778]",
];

export const RecentTransactions = () => {
  const handleViewTransaction = (transaction) => {
    alert(`Transaction Details:\n\nID: ${transaction.id}\nCustomer: ${transaction.customer}\nVehicle: ${transaction.vehicle}\nRevenue: ${transaction.revenue}\nStatus: ${transaction.status}`);
  };

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <div className="flex items-center gap-2">
          <button className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded">
            <Search className="h-4 w-4 text-gray-500" />
          </button>
          <button className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded">
            <Filter className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead>
            <tr className="text-sm text-gray-500">
              <th className="pb-3 font-medium text-center w-[20%]">Customer</th>
              <th className="pb-3 font-medium text-center w-[20%]">Vehicle</th>
              <th className="pb-3 font-medium text-center w-[20%]">Revenue</th>
              <th className="pb-3 font-medium text-center w-[20%]">Status</th>
              <th className="pb-3 font-medium text-center w-[20%]">Action</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {transactions.map((tx, index) => (
              <tr key={tx.id} className="border-t border-gray-200">
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-medium ${avatarColors[index % avatarColors.length]}`}>
                      {tx.avatar}
                    </div>
                    <span className="font-medium text-gray-900">{tx.customer}</span>
                  </div>
                </td>
                <td className="py-3 text-gray-500 text-center">{tx.vehicle}</td>
                <td className="py-3 font-medium text-gray-900 text-center">{tx.revenue}</td>
                <td className="py-3 text-center">
                  <span className={`text-sm font-medium ${tx.status === "Completed" ? "text-green-600" : "text-yellow-600"}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <button 
                    onClick={() => handleViewTransaction(tx)}
                    className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded mx-auto"
                  >
                    <Eye className="h-4 w-4 text-gray-500" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
