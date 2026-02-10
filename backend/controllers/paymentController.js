import payment from '../models/paymentModel.js';
import vehicle from '../models/Vehicle.js';

const stripe = process.env.STRIPE_SECRET_KEY

//create payment 
export const createPayment = async (req, res) => {
    try {
        const customerId = req.user.userid;
        const {totalAmount, vehicleId, bookingId} = req.body;

        if(!totalAmount || !vehicleId || !bookingId){
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            })
        }
        
        //get vehicle owner id
        const owner = await vehicle.findById(vehicleId).select("ownerId");
        const paymentDate = new Date(Date.now());

        //platform fee calculation
        const platformFee = totalAmount * 0.1;
        const amount = totalAmount - platformFee;

        //stripe session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
        })

        const newPayment = await payment.create({
            customerId,
            OwnerId: owner.ownerId,
            vehicleId,
            bookingId,
            amount: {
                amount,
                platformFee,
                currency: "LKR",
                paymentMethod: "card"
            },
            paymentDate,
            status: "paid"
        });

        res.status(201).json({
            success: true,
            message: "Payment created successfully.",
            data: newPayment
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
}