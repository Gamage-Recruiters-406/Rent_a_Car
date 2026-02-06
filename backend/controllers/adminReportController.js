import User from "../models/userModel.js";
import Vehicle from "../models/Vehicle.js";
import Booking from "../models/Booking.js";


//user improvement chart
export const getMonthlyUserChart = async (req, res) => {
  try {
    const monthlyUsers = await User.aggregate([
      {
        $match: { 
          status: "verified",
          role: { $in: [1, 2] } }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          newUsers: { $sum: 1 }
        }
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 }
      }
    ]);

    if (monthlyUsers.length === 0) {
      return res.status(200).json({
        success: true,
        data: []
      });
    }

    const usersMap = new Map();
    monthlyUsers.forEach(item => {
      const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
      usersMap.set(key, item.newUsers);
    });

    const first = monthlyUsers[0]._id;
    const last = monthlyUsers[monthlyUsers.length - 1]._id;

    const startDate = new Date(first.year, first.month - 1, 1);
    const endDate = new Date(last.year, last.month - 1, 1);

    let currentDate = new Date(startDate);
    let cumulativeTotal = 0;
    const result = [];

    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;

      const newUsers = usersMap.get(key) || 0;
      cumulativeTotal += newUsers;

      result.push({
        month: key,
        newUsers,
        totalUsers: cumulativeTotal
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("Monthly User Chart Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error"
    });
  }
};

//vehicle availability chart
export const getVehicleAvailabilityReport = async (req, res) => {
  try {
    // Total APPROVED vehicles
    const totalVehicles = await Vehicle.countDocuments({
      status: "Approved"
    });

    // Get current date (start of day in UTC for consistency)
    const today = new Date();
    const startOfToday = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0, 0
    ));
    const endOfToday = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      23, 59, 59, 999
    ));

    // Get DISTINCT vehicle IDs that are booked TODAY
    const bookedVehicleIds = await Booking.distinct("vehicleId", {
      status: "approved",
      $and: [
        { startingDate: { $lte: endOfToday } },
        { endDate: { $gte: startOfToday } }
      ]
    });

    const bookedVehiclesCount = bookedVehicleIds.length;
    const availableVehiclesCount = totalVehicles - bookedVehiclesCount;

    // Calculate percentage
    const bookedPercentage = totalVehicles === 0 
      ? 0 
      : ((bookedVehiclesCount / totalVehicles) * 100).toFixed(2);
    
    const availablePercentage = totalVehicles === 0 
      ? 0 
      : ((availableVehiclesCount / totalVehicles) * 100).toFixed(2);

    res.status(200).json({
      success: true,
      data: {
        totals: {
          totalVehicles,
          bookedVehicles: bookedVehiclesCount,
          availableVehicles: availableVehiclesCount
        },
        percentages: {
          booked: parseFloat(bookedPercentage),
          available: parseFloat(availablePercentage)
        },
        date: today.toISOString().split('T')[0] // YYYY-MM-DD
      }
    });

  } catch (error) {
    console.error("Vehicle Availability Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Side Error"
    });
  }
};

// USER REPORT STATS (verified only)
export const getUserReportStats = async (req, res) => {
  try {
    // Only verified users
    const totalUsers = await User.countDocuments({ 
      status: "verified" 
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfNextMonth = new Date(startOfMonth);
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

    // Only verified users created this month
    const thisMonthUsers = await User.countDocuments({
      status: "verified", // <-- Add this filter
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    });

    const percentage = totalUsers === 0
      ? 0
      : ((thisMonthUsers / totalUsers) * 100).toFixed(2);

    return res.status(200).json({
      success: true,
      totalUsers,
      thisMonthUsers,
      percentage,
    });
  } catch (error) {
    console.log("USER REPORT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Side Error",
    });
  }
};

// VEHICLE REPORT STATS(approved only)
export const getVehicleReportStats = async (req, res) => {
  try {
    // Only approved vehicles
    const totalVehicles = await Vehicle.countDocuments({ 
      status: "Approved" 
    });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfNextMonth = new Date(startOfMonth);
    startOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1);

    // Only approved vehicles created this month
    const thisMonthVehicles = await Vehicle.countDocuments({
      status: "Approved", // <-- Add this filter
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth
      }
    });

    const percentage = totalVehicles === 0
      ? 0
      : ((thisMonthVehicles / totalVehicles) * 100).toFixed(2);

    return res.status(200).json({
      success: true,
      totalVehicles,
      thisMonthVehicles,
      percentage
    });
  } catch (error) {
    console.log("VEHICLE REPORT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server Side Error"
    });
  }
};

// BOOKING REPORT STATS (approved only)
export const getBookingReportStats = async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({
      status: "approved",
    });

    const now = new Date();
    const startOfMonth = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      1,
      0, 0, 0, 0
    ));

    const startOfNextMonth = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth() + 1,
      1,
      0, 0, 0, 0
    ));

    const thisMonthBookings = await Booking.countDocuments({
      status: "approved",
      createdAt: {
        $gte: startOfMonth,
        $lt: startOfNextMonth,
      },
    });

    const percentage = totalBookings === 0
      ? 0
      : Number(((thisMonthBookings / totalBookings) * 100).toFixed(2));

    return res.status(200).json({
      success: true,
      totalBookings,
      thisMonthBookings,
      percentage,
    });
  } catch (error) {
    console.error("BOOKING REPORT ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server Side Error",
    });
  }
};




