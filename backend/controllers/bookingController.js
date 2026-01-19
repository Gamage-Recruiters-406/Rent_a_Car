import Booking from "../models/Booking.js";

export const createBooking = async (req, res) => {
    try {
        const { bookingId, startingDate, endDate, documents, customerId, vehicleId, ownerId } = req.body;

        if (!startingDate || !endDate || !customerId || !vehicleId || !ownerId) {
            return res.status(400).json({
                success: false,
                message: "startingDate, endDate, customerId, vehicleId, and ownerId are required",
            });
        }

        const booking = await Booking.create({
            bookingId,
            startingDate,
            endDate,
            documents,
            customerId,
            vehicleId,
            ownerId,
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
        const { bookingId, startingDate, endDate, documents, customerId, vehicleId, ownerId, status } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            id,
            {
                bookingId,
                startingDate,
                endDate,
                documents,
                customerId,
                vehicleId,
                ownerId,
                status,
            },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found",
            });
        }

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
