import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
    {
        bookingId: {
            type: String,
            unique: true,
            trim: true,
        },
        startingDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
            validate: {
                validator: function (value) {
                    return !this.startingDate || value > this.startingDate;
                },
                message: "End date must be after starting date",
            },
        },
        documents: [
            {
                type: String,
                trim: true,
            },
        ],
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        vehicleId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vehicle",
            required: true,
        },
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
