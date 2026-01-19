import JWT from "jsonwebtoken";


export const requiredSignIn = async (req, res, next) => {
    try {
        const token = req.cookies.access_token;

        if(!token){
            return res.status(401).json({
                success: false, 
                message: "Access denied, No token provided."
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