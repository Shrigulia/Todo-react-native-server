import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';
// import crypto from 'crypto';

const userScehma = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please Enter your name"],
        maxLength: [30, "Limit is 30 charcters"],
        minLength: [4, "Atleast 4 charcter"]
    },
    email: {
        type: String,
        required: [true, "Please Enter your email"],
        unique: true,
        // validate: [validator.isEmail, "Please Enter a valid email"],
    },
    password: {
        type: String,
        required: [true, "Please Enter your email"],
        minLength: [8, "Atleast 8 charcter"],
        select: false,
    },
    avatar: {
        public_id: {
            type: String,
            required: true
        },
        url: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    tasks: [
        {
            title: "String",
            description: "String",
            completed: Boolean,
            craetedAt: Date
        }
    ],
    verified: {
        type: Boolean,
        default: false
    },
    otp: Number,
    otp_expiry: Date,
});

userScehma.index({ otp_expiry: 1 }, { expireAfterSeconds: 0 })

export const userModel = mongoose.model("Users", userScehma);