// src/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
    {
        customer_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        owner_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        booking_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        payment_id: {
            type: String,
            default: null
        },
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        type: {
            type: String,
            enum: [
                'vehicle_approval', 
                'vehicle_rejection', 
                'booking_request', 
                'booking_approved', 
                'booking_rejected', 
                'general'
            ],
            required: true
        },
        is_read: {
            type: Boolean,
            default: false
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

notificationSchema.index({ customer_id: 1, is_read: 1 });
notificationSchema.index({ owner_id: 1, is_read: 1 });
notificationSchema.index({ type: 1 });

export default mongoose.model("Notification", notificationSchema);