import { userModel } from '../models/Users.js';
import bcrypt from 'bcryptjs';
// import sendCookie from "../utils/setCookie.js";
// import jwt from 'jsonwebtoken';
// import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';
import sendCookie from '../utils/setCookie.js';
import cloduinary from 'cloudinary';

// SIGNUP 
export const signUp = async (req, res) => {
    
    const { name, email, password } = req.body;

    const { avatar } = req.files;

    const myCloud = await cloduinary.v2.uploader.upload(avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    })

    // if user already exist
    let user = await userModel.findOne({ email });

    if (user) {
        return res.status(400).json({
            success: false,
            message: "User already exist",
        });
    };

    // else creating user

    // hashing password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // sending otp
    const otp = Math.floor(Math.random() * 1000000)

    // creating user
    user = await userModel.create({
        name,
        email,
        password: hashedPassword,
        avatar: {
            public_id: myCloud.public_id,
            url: myCloud.secure_url
        },
        otp,
        otp_expiry: new Date(Date.now() + process.env.OTP_EXPIRY * 60 * 100)
    });

    const message = `Your OTP is :- \n\n ${otp} \n\n If you have not requested this email, Please ignore`;

    await sendEmail({
        email: user.email,
        subject: 'TODO VERIFICATION OTP',
        message,
    });

    sendCookie(user, res, "OTP SENT to your email, please verify", 201);



}

// VERIFY USER 
export const verify = async (req, res) => {
    const otp = Number(req.body.otp);

    const user = await userModel.findById(req.user._id);

    if (user.otp !== otp || user.otp_expiry < Date.now()) {
        return res.status(400).json({
            success: false,
            message: "Invalid otp or it has been expired"
        })
    }

    user.verified = true;
    user.otp = null;
    user.otp_expiry = null;

    await user.save();

    sendCookie(user, res, "User verified", 200);

}

// LOGIN
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await userModel.findOne({ email });

        if (!email || !password) {
            return res.status(404).json({
                success: false,
                message: "Please Enter all fields",
            })
        }


        // checking if user not exist
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User doesn't exist",
            })
        }

        // checking email if correct
        user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Invalid email or password",
            })
        }

        // checking if password is correct
        const isMatched = await bcrypt.compare(password, user.password);

        if (!isMatched) {
            return res.status(404).json({
                success: false,
                message: "Invalid email or password",
            });
        };

        // if everyhting fine
        sendCookie(user, res, `Welcome back ${user.name} `, 200)
    } catch (error) {
        res.status(201).json({
            success: false,
            message: error
        });
    }

};

// LOGOUT 
export const logout = async (req, res) => {

    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(404).json({
                success: false,
                message: "Login first",
            });
        };

        res.status(200).cookie("token", null, {
            expires: new Date(Date.now()),
            sameSite: "lax",
            secure: false,
        }).json({
            success: true,
            message: "Logout success"
        })
    } catch (error) {
        res.status(201).json({
            success: false,
            message: error
        });
    }


}

// ADD TASK
export const addTask = async (req, res) => {
    const { title, description } = req.body;

    let user = await userModel.findById(req.user._id);

    user.tasks.push({
        title,
        description,
        completed: false,
        craetedAt: new Date(Date.now())
    });

    await user.save();

    res.status(200).json({
        success: true,
        message: "Task added",
    })

}

// REMOVE TASK
export const removeTask = async (req, res) => {
    const { taskId } = req.params;

    let user = await userModel.findById(req.user._id);

    user.tasks = user.tasks.filter(task => task._id.toString() !== taskId.toString())

    await user.save();

    res.status(200).json({
        success: true,
        message: "Task removed",
    })

}

// UPDATE TASK
export const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const user = await userModel.findById(req.user._id);

        const taskIndex = user.tasks.findIndex((task) => task._id.toString() === taskId.toString());

        if (taskIndex === -1) {
            return res.status(404).json({ success: false, message: "Task not found" });
        }

        user.tasks[taskIndex].completed = !user.tasks[taskIndex].completed;

        await user.save();

        res.status(200).json({ success: true, message: "Task Updated successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET MY PROFILE
export const getMyProfile = async (req, res) => {

    const user = await userModel.findById(req.user.id);

    res.status(200).json({
        success: true,
        user,
    })
}
