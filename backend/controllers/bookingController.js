import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";

export const createBooking = async (req, res) => {
    try {
        const { bookingId, startingDate, endDate, documents, customerId, vehicleId } = req.body;

        if (!startingDate || !endDate || !customerId || !vehicleId) {
            return res.status(400).json({
                success: false,
                message: "startingDate, endDate, customerId, and vehicleId are required",
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
