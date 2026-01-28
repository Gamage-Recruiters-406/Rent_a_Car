import JWT from "jsonwebtoken";

//using this function check user is signin or not
export const requiredSignIn = async (req, res, next) => {
    try {
        const token = req.cookies.access_token;

        if(!token){
            return res.status(401).json({
                success: false, 
                message: "You must need to login first."
            })
        }

        const decode = JWT.verify(token, process.env.JWT_SECRET);
        req.user = decode;
        next();

    } catch (error) {
        console.error("Authentication error", error);
        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        })
    }
}

//using this function check logged user is admin or not
export const isAdmin = async(req, res, next) => {
    if(req.user.role !== 3){
        return res.status(403).json({
            success: false,
            message: "Access denied, Only admin can access."
        })
    };
    next();
}

//using this function check logged user is customer or not
export const isCustomer = async(req, res, next) => {
    if(req.user.role !== 1){
        return res.status(403).json({
            success: false,
            message: "Access denied, Only cutomers can access."
        })
    };
    next();
}

//using this function check logged user is vehicle owner or not
export const isOwner = async(req, res, next) => {
    if(req.user.role !== 2 ){
        return res.status(403).json({
            success: false,
            message: "Access denied, Only vehicle owners can access."
        })
    };
    next();
}

export const isVerifiedUser = async (req, res, next) => {
    if(req.user.status !== "verified"){
        return res.status(403).json({
            success: true,
            message: "You need to verify your account."
        })
    }
}