import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please provide a valid email"]
    },
    role: {
        type: Number,
        enum: {
            values: [1, 2, 3] // (1- customer, 2 - owner, 3 - admin )
        },
        default: 1
    },
    password: {
        type: String,
    },
    status: {
        type: String,
        enum: ["verified" , "suspend" , "pending"]
    }

},{timestamps: true})

export default mongoose.model("User", userSchema);