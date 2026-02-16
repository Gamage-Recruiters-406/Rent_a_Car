import React, { useState } from "react";
import { Car, Check, ChevronRight, Apple, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NewsLetter = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const appFeatures = [
    "Instant booking & confirmations",
    "Real-time notifications",
    "Secure in-app payments",
    "24/7 customer support",
  ];

  const handleSubscribe = async (e) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !email.includes("@")) {
      setMessage({ text: "Please enter a valid email address", type: "error" });
      return;
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("http://localhost:8090/api/v1/subscription/create-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: data.message, type: "success" });
        setEmail(""); // Clear the input on success
      } else {
        setMessage({ text: data.message, type: "error" });
      }
    } catch (error) {
      setMessage({ 
        text: "Failed to subscribe. Please try again later.", 
        type: "error" 
      });
      console.error("Subscription error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {" "}

      {/* Newsletter */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="w-full px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0d3778] mb-4 max-w-4xl mx-auto">
            Stay Updated
          </h2>
          <p className="text-base sm:text-lg text-gray-500 mb-6 sm:mb-8 max-w-4xl mx-auto">
            Subscribe to our newsletter for exclusive deals, new vehicle
            listings, and travel tips
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-2xl mx-auto px-4">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-6 py-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#0d3778] transition-colors text-base"
              required
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 sm:px-10 py-4 bg-[#0d3778] text-white rounded-xl font-semibold hover:bg-[#082555] hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
          
          {/* Success/Error Message */}
          {message.text && (
            <div className={`mt-4 p-4 rounded-lg max-w-2xl mx-auto ${
              message.type === "success" 
                ? "bg-green-100 text-green-800 border border-green-200" 
                : "bg-red-100 text-red-800 border border-red-200"
            }`}>
              {message.text}
            </div>
          )}
        </div>
      </section>

      
    </div>
  );
};