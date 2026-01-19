import User from "../models/userModel.js";
import { comparePassword, passwordHash} from "../helpers/authHelper.js";
import JWT from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    try {
        const { first_name, last_name, email, password} = req.body; 

        if(!first_name || !last_name || !email || !password){
            res.status(404).json({
                success: false,
                message: "All field must need to fill."
            })
        }

        const existingUser = await User.findOne({email})

        if(existingUser){
            res.status(400).json({
                success: false,
                message: "User already exists."
            })
        }

        const hashed = await passwordHash(password);

        const user = await User.create({
            first_name, last_name, email, password: hashed
        })

        res.status(200).json({
            success: true,
            message: "User registered successfully."
        })


    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error"
        })
    }
}

export const SignIn = async (req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(404).json({
                success: false,
                message: "All field must need to fill."
            })
        }
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json({
                success: false,
                message: "User not found."
            })
        }

        const isMatch = await comparePassword(password, user.password);
        if(!isMatch){
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials."
            })
        }

        const token = JWT.sign(
            {
                userid: user._id,
                role: user.role,
            },
            process.env.JWT_SECRET, {expiresIn: "1d"}
        )

        res.cookie('access_token',token,{
            httpOnly: true
        }).status(200).json({
            success: true,
            message: "Login Successfully.",
            userid: user._id,
            role : user.role
        },token)

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error"
        })
    }
}