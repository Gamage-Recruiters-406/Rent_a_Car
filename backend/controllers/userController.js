import User from "../models/userModel.js";
import { comparePassword, passwordHash} from "../helpers/authHelper.js";
import JWT from 'jsonwebtoken';
import crypto from "crypto";
import { sendVerifyEmail, suspendOwner } from "../helpers/mailer.js";

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

//email verification function
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
    user.suspendExpires = undefined;
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
    //suspend end date
    const onlyDate = user.suspendExpires.toISOString().split("T")[0];

    //todays date
    const date = new Date(Date.now());
    const TodayDate = date.toISOString().split("T")[0];

    if(user.status === "suspend" && TodayDate < onlyDate){
      try {
        await suspendOwner(user.email, user.first_name, onlyDate);

        return res.status(200).json({
          success: true,
          message: "Check your email."
        })

      } catch (e) {
        return res.status(500).json({
          success: false,
          message: "Suspend email sending failed. Try again.",
        });
      }
    };

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

//grt all users except admins
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({role: {$in: [1,2]} }).select("-password");

    if(users.length === 0 ){
      return res.status(404).json({
        success: false,
        message: "No users found."
      })
    }

    res.status(200).json({
      success: true,
      message: "Users found successfully.",
      users
    })

  } catch (error) {
    console.log(first);
    res.status(500).json({
      success: false,
      message: "Server Side Error."
    })
  }
}

//get all customers
export const getAllCustomers = async (req, res) => {
  try {
    const users = await User.find({role: 1}).select("-password");

    if(users.length === 0 ){
      return  res.status(404).json({
        success: false,
        message: "No users found."
      })
    }

    res.status(200).json({
      success: true,
      message: "Users found successfully.",
      users
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Side Error."
    })
  }
}

//get all vehicle owners
export const getAllOwners = async (req, res) => {
  try {
    const users = await User.find({role: 2}).select("-password");
    if(users.length === 0 ){
      return res.status(404).json({
        success: false,
        message: "No owners found."
      })
    }

    res.status(200).json({
      success: true,
      message: "Owners found successfully.",
      users
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Side Error."
    })
  }
}

//user details update
export const Updateuser = async(req, res) => {
  try {
    const id = req.user.userid;
    const {first_name, last_name} = req.body;
    const user = await User.findById(id);

    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not fount."
      })
    }

    const updateUser = {};
    if(first_name !== undefined) updateUser.first_name = first_name;
    if(last_name !== undefined) updateUser.last_name = last_name;

    const update = await User.findByIdAndUpdate(
      id, 
      {$set: updateUser}
    )

    if(!update) {
      return res.status(404).json({
        success: false,
        message: "User deatils update failed."
      })
    }

    res.status(200).json({
      success: true,
      message: "User details update successfully.",
    })


  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Side Error."
    })
  }
}

//get signin user details
export const getUserDetails = async(req, res ) => {
  try {
    const id = req.user.userid;
    const user = await User.findById(id).select("-password");
    if(!user){
      return res.status(404).json({
        success: false,
        message: "User not found."
      })
    }

    res.status(200).json({
      success: true,
      message: "User details fetch successfully.",
      user
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Side Error."
    })
  }
} 

//fetch user by ID
export const getUserbyId = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("-password");
    if (!user){ 
      return res.status(404).json({
        success: false,
        message: "User not found."
      })
    }
    res.status(200).json({
      success: true,
      message: "User details fetch sunccessfully.",
      user
    })
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Side Error."
    })
  }
} 

export const OwnerStatus = async (req, res ) => {
  try {
    const {id} = req.params;
    const {status} = req.body;

    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({
        success: false,
        message: "User Not Found"
      })
    };

    const updateUser = {}
    if (status !== undefined ) updateUser.status = status;
    updateUser.suspendExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // expire within 1 week 

    const onlyDate = updateUser.suspendExpires.toISOString().split("T")[0]; //to catch date 

    const update = await User.findByIdAndUpdate(
      id,
      {$set:updateUser},
      {
        new: true,
        runValidators: true
      }
    )

    if(!update){
      return res.status(404).json({
        success: false,
        message: "user status update failed."
      })
    }

    try {
      await suspendOwner(user.email, user.first_name, onlyDate);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Suspend email sending failed. Try again.",
      });
    }

    res.status(200).json({
      success: true,
      message: "User status update success fully."
    })

  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Side Error."
    })
  }
}