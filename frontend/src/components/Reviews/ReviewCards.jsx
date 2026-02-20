import React, { useEffect, useRef, useState } from "react";
import { Star, ChevronRight } from "lucide-react";
import toast from 'react-hot-toast';
import axios from "axios";

export default function ReviewCards({vehicleId}) {
    const [reviews, setReviews] = useState([]);
    const [hover, setHover] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [reviewsPerPage, setReviewsPerPage] = useState();
    const [loadingReviews, setLoadingReviews] = useState(false);

    const AUTO_SLIDE_DELAY = 4000; // 4 seconds
    const sliderRef = useRef(null);
    const totalPages = Math.ceil(reviews.length / reviewsPerPage);

    // const {vehicleId} = location.state || {};

    //const vehicleId = "696f19b58b0b00033e2af308";
    console.log("VehicleId: ", vehicleId);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const API_VERSION = import.meta.env.VITE_API_VERSION;

    const fetchReviewsByVehicleId = async () =>{
        try {
          setLoadingReviews(true);
          const response = await axios.get(
            `${API_BASE_URL}${API_VERSION}/reviews/vehicle/${vehicleId}`,
            {withCredentials:true}
          );
          setReviews(response.data.reviews);
          console.log("Responses: ",response)
        } catch (error) {
          console.error("Failed to fetch review", error);
          if (error.request && !error.response) {
            toast.error("Network error. Please try again later.");
          } else {
            toast.error(error.response?.data?.message || "Failed to fetch review");
          }
        } finally {
          setLoadingReviews(false);
        }
      };

    useEffect(()=> {

        if (vehicleId) {
          fetchReviewsByVehicleId();
        }
      }, [vehicleId]);


    useEffect(() => {
        const handleResize = () => {
          setReviewsPerPage(window.innerWidth < 768 ? 1 : 2);
          //setCurrentPage(0); // reset to avoid broken index
        };
        
        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      }, []);
    
    useEffect(() => {
            startAutoSlide();

            return () => stopAutoSlide();
        }, [totalPages, reviewsPerPage]);

    const handleNext = () => {
        if (currentPage + 1 >= totalPages) {
          setCurrentPage(0);
        } else {
          setCurrentPage(currentPage + 1);
        }
      };


    const startAutoSlide = () => {
        stopAutoSlide(); // prevent duplicates
        sliderRef.current = setInterval(() => {
        setCurrentPage((prev) =>
            prev + 1 >= totalPages ? 0 : prev + 1
        );
        }, AUTO_SLIDE_DELAY);
    };


    const stopAutoSlide = () => {
        if (sliderRef.current) {
          clearInterval(sliderRef.current);
          sliderRef.current = null;
        }
      };

      const getInitial = (name = "")=>{
        if(!name) return "?";
    
        const words = name.trim().split(" ");
    
        if(words.length === 1){
          return words[0].substring(0, 2).toUpperCase();
        }
    
        return (
          words[0][0] + words[1][0]
        ).toUpperCase();
      };

    return (
        <div className="w-full">
            {/* Clients Reviews */}
            <div className="mt-20 py-14 relative bg-cover bg-center" // change the mt and py according to the use
                style={{
                backgroundImage:
                "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70')",
                }}
            >
            <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative z-10">
                <h2 className="text-white text-center text-xl md:text-2xl lg:text-3xl font-semibold mb-5">
                    Clients Reviews
                </h2>

                <p className="text-white text-center max-w-2xl mx-auto px-6 mb-10">
                    How our cherished clients express experiences and feedback from customers through RentMyCar with us
                </p>

                {/* Slider wrapper */}
                {loadingReviews && (
                    <p className="text-center text-gray-500">Loading reviews...</p>
                )}

                {!loadingReviews && reviews.length === 0 && (
                    <p className="text-center text-white">
                    No reviews yet. Be the first to review this vehicle!
                    </p>
                )}

                <div className="overflow-hidden max-w-6xl mx-auto px-4 md:px-6"
                        onMouseEnter={stopAutoSlide}
                        onMouseLeave={startAutoSlide}
                >
                    <div
                    className="flex transition-transform duration-500 ease-in-out"
                    style={{
                        transform: `translateX(-${currentPage * 100}%)`,
                    }}
                    >
                    {reviews.map((review, index) => (
                        <div
                        key={index}
                        className="min-w-full md:min-w-[50%] flex justify-center px-4"
                        >
                        <div className="bg-white rounded-xl shadow pb-6 max-w-md w-full">
                            <div className="bg-gray-200 border-b-2 border-[#0D3778] rounded-t-xl flex shadow p-6 gap-4">
                            {review.img ? (
                                <img
                                    src={review.img}
                                    alt={review.customer_id?.first_name || ""}
                                    className="w-14 h-14 rounded-full object-cover"
                                />
                            ):(
                                <div className="w-14 h-14 rounded-full bg-[#0D3778] flex items-center justify-center text-white font-semibold text-xl shadow-sm ring-2 ring-white">
                                {getInitial(`${review.customer_id?.first_name || ""} ${review.customer_id?.last_name || ""}`)}
                                </div>
                            )}
                            
                            <div className="overflow-hidden">
                                <h4 className="font-semibold text-[#0D3778]">
                                {review.customer_id?.first_name} {review.customer_id?.last_name}
                                </h4>
                                <div className="flex mt-1">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                    key={i}
                                    size={20}
                                    className={
                                        i < review.rate
                                        ? "fill-red-800 text-red-800"
                                        : "fill-gray-400 text-gray-400"
                                    }
                                    />
                                ))}
                                </div>
                            </div>
                            </div>

                            <p className="text-gray-600 text-sm p-6 line-clamp-4 md:line-clamp-none">
                            "{review.feedback}"
                            </p>
                        </div>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Icon Button */}
                <div className="flex justify-center mt-10">
                    <button
                    onClick={handleNext}
                    className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full border-2 border-white text-[#0D3778] hover:border-0 hover:bg-[#0D3778] hover:text-white transition"
                    >
                    <ChevronRight size={28} />
                    </button>
                </div>
                </div>
            </div>
        </div>
    )
}