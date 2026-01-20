import User from "../models/userModel.js";
import { comparePassword, passwordHash} from "../helpers/authHelper.js";
import JWT from 'jsonwebtoken';
import crypto from "crypto";
import { sendVerifyEmail } from "../helpers/mailer.js";

//register as a normal user
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

//user login function
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

//logout function
export const logout = async (req, res) => {
  try {
    res.clearCookie('access_token').status(200).json({
      success: true,
      message: "SignOut Successfully."
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Side Error."
    })
  }
}

//vehicle owner registration process
export const registerOwner = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists.",
      });
    }

    const hashedPassword = await passwordHash(password);

    // 1) generate token (raw) + store hash
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.create({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: 2,
      status: "pending",
      emailVerifyTokenHash: tokenHash,
      emailVerifyTokenExpires: new Date(Date.now() + 1000 * 60 * 10), // 10 mins for expire token
    });

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;

    try {
      await sendVerifyEmail(user.email, verifyUrl);
    } catch (e) {
      await User.findByIdAndDelete(user._id);
      return res.status(500).json({
        success: false,
        message: "Verification email sending failed. Try again.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Owner registered. Please check your email to verify.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Server Side Error",
    });
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query; // from /verify-email?token=...

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required." });
    }

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerifyTokenHash: tokenHash,
      emailVerifyTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token.",
      });
    }

    user.status = "verified";
    user.emailVerifyTokenHash = undefined;
    user.emailVerifyTokenExpires = undefined;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Server Side Error" });
  }
};

//resend verification mail function
export const ReSendVerificationMail = async (req, res) => {
  try {
    const id = req.user.userid;

    const user = await User.findById(id);

    if(user.status === "verified"){
      return res.status(200).json({
        success: true,
        message: "Your account is already verified."
      })
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    const verifyUrl = `${process.env.FRONTEND_URL}/verify-email?token=${rawToken}`;
    
    const updateToken = {};
    updateToken.emailVerifyTokenHash = tokenHash;
    updateToken.emailVerifyTokenExpires = new Date(Date.now() + 1000 * 60 * 10);

    const update = await User.findByIdAndUpdate( id, {$set: updateToken} )

    if(!update){
      return res.status(404).json({
        success: false,
        message: "Account not found."
      })
    }

    try {
      await sendVerifyEmail(user.email, verifyUrl);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Verification email sending failed. Try again.",
      });
    }

    res.status(201).json({
      success: true,
      message: "Please check your email to verify."
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Side Error."
    })
  }
}