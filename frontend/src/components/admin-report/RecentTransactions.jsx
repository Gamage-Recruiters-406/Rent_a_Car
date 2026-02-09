import { Search, Filter, Eye } from "lucide-react";

const transactions = [
  {
    id: "TXN001",
    customer: "Kasun Perera",
    avatar: "KP",
    vehicle: "Toyota Axio",
    revenue: "Rs. 12,500",
    status: "Completed"
  },
  {
    id: "TXN002",
    customer: "Nimal Silva",
    avatar: "NS",
    vehicle: "Honda Civic",
    revenue: "Rs. 18,000",
    status: "Completed"
  },
  {
    id: "TXN003",
    customer: "Amaya Fernando",
    avatar: "AF",
    vehicle: "BMW X5",
    revenue: "Rs. 45,000",
    status: "Active"
  },
  {
    id: "TXN004",
    customer: "Dilshan Jayawardena",
    avatar: "DJ",
    vehicle: "Mercedes Benz C-Class",
    revenue: "Rs. 35,000",
    status: "Completed"
  },
  {
    id: "TXN005",
    customer: "Sanduni Wickramasinghe",
    avatar: "SW",
    vehicle: "Toyota Prius",
    revenue: "Rs. 15,000",
    status: "Active"
  }
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
    <div className="rounded-xl bg-white p-4 sm:p-5 shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">Recent Transactions</h3>
        <div className="flex items-center gap-2">
          <button className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded">
            <Search className="h-4 w-4 text-gray-500" />
          </button>
          <button className="h-8 w-8 flex items-center justify-center hover:bg-gray-100 rounded">
            <Filter className="h-4 w-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-3">
        {transactions.length > 0 ? (
          transactions.map((tx, index) => (
            <div key={tx.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-sm font-medium ${avatarColors[index % avatarColors.length]}`}>
                    {tx.avatar}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{tx.customer}</p>
                    <p className="text-xs text-gray-500">ID: {tx.id}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${tx.status === "Completed" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                  {tx.status}
                </span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Vehicle:</span>
                  <span className="font-medium text-gray-900">{tx.vehicle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Revenue:</span>
                  <span className="font-semibold text-[#0D3778]">{tx.revenue}</span>
                </div>
              </div>
              <button 
                onClick={() => handleViewTransaction(tx)}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                <Eye className="h-4 w-4" />
                View Details
              </button>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            No transactions available
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="text-xs sm:text-sm text-gray-500">
                  <th className="pb-3 font-medium text-left whitespace-nowrap">Customer</th>
                  <th className="pb-3 font-medium text-center whitespace-nowrap">Vehicle</th>
                  <th className="pb-3 font-medium text-center whitespace-nowrap">Revenue</th>
                  <th className="pb-3 font-medium text-center whitespace-nowrap">Status</th>
                  <th className="pb-3 font-medium text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="text-xs sm:text-sm divide-y divide-gray-200">
                {transactions.length > 0 ? (
                  transactions.map((tx, index) => (
                    <tr key={tx.id}>
                      <td className="py-3">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className={`flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full text-white text-xs font-medium ${avatarColors[index % avatarColors.length]}`}>
                            {tx.avatar}
                          </div>
                          <span className="font-medium text-gray-900 whitespace-nowrap">{tx.customer}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-500 text-center whitespace-nowrap">{tx.vehicle}</td>
                      <td className="py-3 font-medium text-gray-900 text-center whitespace-nowrap">{tx.revenue}</td>
                      <td className="py-3 text-center">
                        <span className={`text-xs sm:text-sm font-medium whitespace-nowrap ${tx.status === "Completed" ? "text-green-600" : "text-yellow-600"}`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button 
                          onClick={() => handleViewTransaction(tx)}
                          className="h-7 w-7 sm:h-8 sm:w-8 flex items-center justify-center hover:bg-gray-100 rounded mx-auto"
                        >
                          <Eye className="h-4 w-4 text-gray-500" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-500">
                      No transactions available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
