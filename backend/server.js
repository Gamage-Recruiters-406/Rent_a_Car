import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import helmet from "helmet";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";

//import Router files
import userRoutes from "./routes/userRoute.js";
import reviewRoutes from "./routes/reviewRoute.js";


//configure environment
dotenv.config();

//Database config
connectDB();

const app = express();

app.use(cors({
    origin: "http://localhost:5173", // FRONTEND URL
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
}))

app.use(helmet());
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());

//routes
app.use("/api/v1/authUser",userRoutes);
app.use("/api/v1/reviews", reviewRoutes);

app.get("/", (req, res) => {
    res.send({
        message: "Welcome to Rent_a_Car web application"
    })
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
    console.log(`Server Running on ${process.env.DEV_MODE}`.bgCyan.white);
    console.log(`Server is running on port ${PORT}`.bgCyan.white);
})