import payment from '../models/paymentModel.js';
import vehicle from '../models/Vehicle.js';
import Booking from '../models/Booking.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//create payment 
export const createPayment = async (req, res) => {
    try {
      console.log("first")
      const customerId = req.user.userid;
      const { vehicleId, bookingId} = req.body;

      if( !vehicleId || !bookingId){
        return res.status(400).json({
          success: false,
          message: "Missing required fields."
        })
      }
      //get booking amount from DB
      const booking = await Booking.findById(bookingId)
      if(!booking){
        return res.status(404).json({
          success: false,
          message: "Booking not found"
        })
      }
      //check already paid or not
      const existingPayment = await payment.findOne({ bookingId });
      if (existingPayment) {
        return res.status(400).json({
          success: false,
          message: "Payment already exists for this booking.",
        });
      }

      //check if the booking belongs to the customer
      if (booking.customerId.toString() !== customerId) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to make payment for this booking.",
        });
      }

      const totalAmount = booking.totalAmount;

      //get vehicle owner id
      const owner = await vehicle.findById(vehicleId).select("ownerId");
      const paymentDate = new Date(Date.now());

      //platform fee calculation
      const platformFee = totalAmount * 0.1;
      const payableAmount = totalAmount - platformFee;

      console.log("PaymentIntent")
      const paymentIntent = await stripe.paymentIntents.create({
        // payment_method_types: ["card"],
        // mode: "payment",
        amount: Math.round(payableAmount * 100), // cents
        currency: "usd",
        metadata: {
          bookingId: bookingId.toString(),
          vehicleId: vehicleId.toString(),
          customerId: customerId.toString(),
        },
      });
      console.log("payment intent created")

        //stripe session
        // const session = await stripe.checkout.sessions.create({
        //     payment_method_types: ["card"],
        //     mode: "payment",
        // })

      const newPayment = await payment.create({
        customerId,
        OwnerId: owner.ownerId,
        vehicleId,
        bookingId,
        amount: {
          amount: payableAmount,
          platformFee,
          currency: "LKR",
          paymentMethod: "card"
        },
        paymentDate,
        stripePaymentIntentId: paymentIntent.id,
      });

      res.status(201).json({
        success: true,
        message: "Payment created successfully.",
        paymentId: newPayment._id,
        clientSecret: paymentIntent.client_secret,
      });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: "Server Side Error."
        });
    }
}

//stripe webhook to update payment status
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature failed", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // ✅ PAYMENT SUCCESS
    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;

      const payment = await Payment.findOne({
        stripePaymentIntentId: intent.id,
      });

      if (payment) {
        payment.status = "paid";
        await payment.save();

        // also update booking
        await Booking.findByIdAndUpdate(payment.bookingId, {
          status: "paid",
        });
      }
    }

    // ❌ PAYMENT FAILED or CANCELED
    if (
      event.type === "payment_intent.payment_failed" ||
      event.type === "payment_intent.canceled"
    ) {
      const intent = event.data.object;

      await Payment.findOneAndDelete({
        stripePaymentIntentId: intent.id,
      });
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Webhook handling error", error);
    res.status(500).json({ message: "Webhook error" });
  }
};

//get payment by user id
export const getPaymentsByUserId = async (req, res) => {
  try {
    const userId = req.user.userid;
    const payments = await payment.find({ customerId: userId }).populate("vehicleId").populate("bookingId");
    res.status(200).json({
      success: true,
      message: "Payments fetched successfully.",
      payments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server Side Error.",
    });
  }
};