import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
    {
        ownerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            default: ""
        },
        numberPlate: {
            type: String,
            required: true,
            trim: true
        },
        model: {
            type: String,
            required: true,
            trim: true
        },
        year: {
            type: Number,
            required: true
        },
        fuelType: {
            type: String,
            enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid'],
            required: true
        },
        amount: {
            type: Number,
            min: 0,
            default: null
        },
        photos: [{
            url: {
                type: String,
                required: true
            },
            key: {
                type: String
            }
        }],
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        },
        averageRating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        reviewCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },
    { timestamps: true }
);

vehicleSchema.index({ ownerId: 1, numberPlate: 1 }, { unique: true });

export default mongoose.model("Vehicle", vehicleSchema);