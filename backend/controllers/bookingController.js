import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import User from "../models/userModel.js";

const normalizeDate = (value) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const calculateTotalAmount = (startDate, endDate, dailyRate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffMs = end.getTime() - start.getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    const days = Math.max(1, Math.ceil(diffMs / dayMs));
    return days * dailyRate;
};

const requireUserRole = async (userId, role, roleName) => {
    if (!userId) {
        return {
            ok: false,
            status: 400,
            message: "userId is required",
        };
    }

    const user = await User.findById(userId).select("role");
    if (!user) {
        return {
            ok: false,
            status: 404,
            message: "User not found",
        };
    }

    if (user.role !== role) {
        return {
            ok: false,
            status: 403,
            message: `${roleName} access only`,
        };
    }

    return { ok: true };
};

export const createBooking = async (req, res) => {
    try {
        const { bookingId, startingDate, endDate, documents, customerId, vehicleId } = req.body;

        if (!startingDate || !endDate || !customerId || !vehicleId) {
            return res.status(400).json({
                success: false,
                message: "startingDate, endDate, customerId, and vehicleId are required",
            });
        }

        const customerCheck = await requireUserRole(customerId, 1, "Customer");
        if (!customerCheck.ok) {
            return res.status(customerCheck.status).json({
                success: false,
                message: customerCheck.message,
            });
        }

        const start = normalizeDate(startingDate);
        const end = normalizeDate(endDate);
        if (!start || !end || end <= start) {
            return res.status(400).json({
                success: false,
                message: "End date must be after starting date",
            });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        if (vehicle.status !== "Approved") {
            return res.status(400).json({
                success: false,
                message: "Vehicle is not approved for booking",
            });
        }

        if (vehicle.amount === null || vehicle.amount === undefined) {
            return res.status(400).json({
                success: false,
                message: "Vehicle price is not set",
            });
        }

        const overlap = await Booking.findOne({
            vehicleId,
            status: { $ne: "rejected" },
            startingDate: { $lte: endDate },
            endDate: { $gte: startingDate },
        });

        if (overlap) {
            return res.status(409).json({
                success: false,
                message: "Vehicle is already booked for the selected dates",
            });
        }

        const booking = await Booking.create({
            bookingId,
            startingDate,
            endDate,
            documents,
            customerId,
            vehicleId,
            ownerId: vehicle.ownerId,
            dailyRate: vehicle.amount,
            totalAmount: calculateTotalAmount(start, end, vehicle.amount),
        });

        return res.status(201).json({
            success: true,
            message: "Booking created successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error creating booking",
            error: error.message,
        });
    }
};

export const getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Bookings fetched successfully",
            data: bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching bookings",
            error: error.message,
        });
    }
};

export const getBookingById = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Booking fetched successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching booking",
            error: error.message,
        });
    }
};

export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { startingDate, endDate, documents, status } = req.body;

        const booking = await Booking.findById(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        const nextStartingDate = startingDate ?? booking.startingDate;
        const nextEndDate = endDate ?? booking.endDate;

        if (nextEndDate <= nextStartingDate) {
            return res.status(400).json({
                success: false,
                message: "End date must be after starting date",
            });
        }

        const overlap = await Booking.findOne({
            _id: { $ne: id },
            vehicleId: booking.vehicleId,
            status: { $ne: "rejected" },
            startingDate: { $lte: nextEndDate },
            endDate: { $gte: nextStartingDate },
        });

        if (overlap) {
            return res.status(409).json({
                success: false,
                message: "Vehicle is already booked for the selected dates",
            });
        }

        if (startingDate !== undefined) booking.startingDate = startingDate;
        if (endDate !== undefined) booking.endDate = endDate;
        if (documents !== undefined) booking.documents = documents;
        if (status !== undefined) booking.status = status;

        if (startingDate !== undefined || endDate !== undefined) {
            booking.totalAmount = calculateTotalAmount(
                booking.startingDate,
                booking.endDate,
                booking.dailyRate
            );
        }

        await booking.save();

        return res.status(200).json({
            success: true,
            message: "Booking updated successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error updating booking",
            error: error.message,
        });
    }
};

export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Booking deleted successfully",
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error deleting booking",
            error: error.message,
        });
    }
};

export const approveBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerId } = req.body;

        if (!ownerId) {
            return res.status(400).json({
                success: false,
                message: "ownerId is required",
            });
        }

        const ownerCheck = await requireUserRole(ownerId, 2, "Owner");
        if (!ownerCheck.ok) {
            return res.status(ownerCheck.status).json({
                success: false,
                message: ownerCheck.message,
            });
        }

        const booking = await Booking.findOneAndUpdate(
            { _id: id, ownerId, status: "pending" },
            { status: "approved" },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Pending booking not found for this owner",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Booking approved successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error approving booking",
            error: error.message,
        });
    }
};

export const rejectBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { ownerId } = req.body;

        if (!ownerId) {
            return res.status(400).json({
                success: false,
                message: "ownerId is required",
            });
        }

        const ownerCheck = await requireUserRole(ownerId, 2, "Owner");
        if (!ownerCheck.ok) {
            return res.status(ownerCheck.status).json({
                success: false,
                message: ownerCheck.message,
            });
        }

        const booking = await Booking.findOneAndUpdate(
            { _id: id, ownerId, status: "pending" },
            { status: "rejected" },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Pending booking not found for this owner",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Booking rejected successfully",
            data: booking,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error rejecting booking",
            error: error.message,
        });
    }
};

export const searchVehicles = async (req, res) => {
    try {
        const {
            location,
            type,
            minPrice,
            maxPrice,
            startDate,
            endDate,
            fuelType,
            year,
            model,
            title,
        } = req.query;

        const filter = {
            status: "Approved",
        };

        if (location) {
            filter.location = { $regex: location, $options: "i" };
        }

        if (type) {
            filter.vehicleType = { $regex: type, $options: "i" };
        }

        if (fuelType) {
            filter.fuelType = fuelType;
        }

        if (year) {
            filter.year = Number(year);
        }

        if (model) {
            filter.model = { $regex: model, $options: "i" };
        }

        if (title) {
            filter.title = { $regex: title, $options: "i" };
        }

        if (minPrice || maxPrice) {
            filter.amount = {};
            if (minPrice) filter.amount.$gte = Number(minPrice);
            if (maxPrice) filter.amount.$lte = Number(maxPrice);
        }

        const start = startDate ? normalizeDate(startDate) : null;
        const end = endDate ? normalizeDate(endDate) : null;

        if (start && end && end > start) {
            const bookedVehicleIds = await Booking.distinct("vehicleId", {
                status: { $ne: "rejected" },
                startingDate: { $lte: end },
                endDate: { $gte: start },
            });

            if (bookedVehicleIds.length) {
                filter._id = { $nin: bookedVehicleIds };
            }
        }

        const vehicles = await Vehicle.find(filter).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: "Vehicles fetched successfully",
            data: vehicles,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error searching vehicles",
            error: error.message,
        });
    }
};

export const getVehicleAvailability = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: "Vehicle not found",
            });
        }

        const bookings = await Booking.find({
            vehicleId,
            status: { $ne: "rejected" },
        })
            .select("startingDate endDate status")
            .sort({ startingDate: 1 });

        return res.status(200).json({
            success: true,
            message: "Availability fetched successfully",
            data: bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching availability",
            error: error.message,
        });
    }
};

export const getCustomerBookings = async (req, res) => {
    try {
        const { customerId } = req.params;
        const { type, status } = req.query;

        if (!customerId) {
            return res.status(400).json({
                success: false,
                message: "customerId is required",
            });
        }

        const customerCheck = await requireUserRole(customerId, 1, "Customer");
        if (!customerCheck.ok) {
            return res.status(customerCheck.status).json({
                success: false,
                message: customerCheck.message,
            });
        }

        const filter = { customerId };
        if (status) filter.status = status;

        const now = new Date();
        if (type === "past") {
            filter.endDate = { $lt: now };
        } else if (type === "upcoming") {
            filter.endDate = { $gte: now };
        }

        const bookings = await Booking.find(filter).sort({ startingDate: -1 });

        return res.status(200).json({
            success: true,
            message: "Customer bookings fetched successfully",
            data: bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching customer bookings",
            error: error.message,
        });
    }
};

export const getOwnerBookings = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { status } = req.query;

        if (!ownerId) {
            return res.status(400).json({
                success: false,
                message: "ownerId is required",
            });
        }

        const ownerCheck = await requireUserRole(ownerId, 2, "Owner");
        if (!ownerCheck.ok) {
            return res.status(ownerCheck.status).json({
                success: false,
                message: ownerCheck.message,
            });
        }

        const filter = { ownerId };
        if (status) filter.status = status;

        const bookings = await Booking.find(filter).sort({ startingDate: -1 });

        return res.status(200).json({
            success: true,
            message: "Owner bookings fetched successfully",
            data: bookings,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching owner bookings",
            error: error.message,
        });
    }
};

export const getOwnerEarnings = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { startDate, endDate } = req.query;

        if (!ownerId) {
            return res.status(400).json({
                success: false,
                message: "ownerId is required",
            });
        }

        const ownerCheck = await requireUserRole(ownerId, 2, "Owner");
        if (!ownerCheck.ok) {
            return res.status(ownerCheck.status).json({
                success: false,
                message: ownerCheck.message,
            });
        }

        const filter = { ownerId, status: "approved" };
        const start = startDate ? normalizeDate(startDate) : null;
        const end = endDate ? normalizeDate(endDate) : null;

        if (start && end && end > start) {
            filter.startingDate = { $gte: start };
            filter.endDate = { $lte: end };
        }

        const earnings = await Booking.aggregate([
            { $match: filter },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: "$totalAmount" },
                    totalBookings: { $sum: 1 },
                },
            },
        ]);

        const summary = earnings[0] || { totalEarnings: 0, totalBookings: 0 };

        return res.status(200).json({
            success: true,
            message: "Owner earnings fetched successfully",
            data: summary,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error fetching owner earnings",
            error: error.message,
        });
    }
};
