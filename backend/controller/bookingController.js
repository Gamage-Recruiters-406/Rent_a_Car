import Booking from "../model/Booking.js";

export const createBooking = async (req, res) => {
    try {
        const { bookingId, startingDate, endDate, documents, customerId, vehicleId } = req.body;

        if (!startingDate || !endDate || !customerId || !vehicleId) {
            return res.status(400).json({
                success: false,
                message: "startingDate, endDate, customerId, and vehicleId are required",
            });
        }

        const booking = await Booking.create({
            bookingId,
            startingDate,
            endDate,
            documents,
            customerId,
            vehicleId,
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
        const { bookingId, startingDate, endDate, documents, customerId, vehicleId } = req.body;

        const booking = await Booking.findByIdAndUpdate(
            id,
            {
                bookingId,
                startingDate,
                endDate,
                documents,
                customerId,
                vehicleId,
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
