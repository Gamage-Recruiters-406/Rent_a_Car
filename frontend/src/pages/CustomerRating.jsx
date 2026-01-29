import React, { useEffect, useRef, useState } from "react";
import { Star, ChevronRight } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";




export default function CustomerReviews() {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [reviewsPerPage, setReviewsPerPage] = useState(window.innerWidth < 768 ? 1 : 2);
  const [feedback, setFeedback] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [submitting, setSubmitting] = useState(false);



  const location = useLocation();
  const navigate = useNavigate();

  const {vehicleName, vehicleImage } = location.state || {};

  const vehicleId = "696e0bc53791596682689be1";
  const AUTO_SLIDE_DELAY = 4000; // 4 seconds
  const sliderRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const API_VERSION = import.meta.env.VITE_API_VERSION;

  console.log("Vehicle ID: ",vehicleId);

  useEffect(()=> {
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
      } finally {
        setLoadingReviews(false);
      }
    };

    if (vehicleId) {
      fetchReviewsByVehicleId();
    }
  }, [vehicleId]);

  useEffect(()=>{
    const loadReviewSummary = async ()=>{
      try {
        setLoadingSummary(true);
        const res = await axios.get(
          `${API_BASE_URL}${API_VERSION}/reviews/vehicle/${vehicleId}/rating`,
          {withCredentials:true}
        );
        console.log("Summary: ", res);
        setAverageRating(res.data.rating);
        console.log("Avg.Rating: ",averageRating);
        setTotalReviews(res.data.totalReviews || 0);
        console.log("TotalRating: ",totalReviews);
      } catch (error) {
        console.error("Failed to load review summary", error);
      } finally {
        setLoadingSummary(false);
      }
    };

    if (vehicleId) {
      loadReviewSummary();
    }
  }, [vehicleId]);

  // useEffect(() => {
  //   if (!vehicleId) {
  //     navigate("/customer-reviews");
  //   }
  // }, [vehicleId, navigate]);

  // Dummy data - Needs to replace with APIs
  // const reviews = [
  //   {
  //     name: "Person Name",
  //     role: "Profession",
  //     rating: 4,
  //     comment:
  //       "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
  //     img: "",
  //   },
  //   {
  //     name: "Person Name",
  //     role: "Profession",
  //     rating: 5,
  //     comment:
  //       "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
  //     img: "https://i.pravatar.cc/100?img=32",
  //   },
  //   {
  //     name: "Person Name",
  //     role: "Profession",
  //     rating: 3,
  //     comment:
  //       "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
  //     img: "https://i.pravatar.cc/100?img=30",
  //   },
  //   {
  //     name: "Person Name",
  //     role: "Profession",
  //     rating: 4,
  //     comment:
  //       "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
  //     img: "https://i.pravatar.cc/100?img=15",
  //   },
  //   {
  //     name: "Person Name",
  //     role: "Profession",
  //     rating: 5,
  //     comment:
  //       "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
  //     img: "https://i.pravatar.cc/100?img=20",
  //   },
  //   {
  //     name: "Person Name",
  //     role: "Profession",
  //     rating: 4,
  //     comment:
  //       "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
  //     img: "https://i.pravatar.cc/100?img=12",
  //   },
  //   {
  //     name: "Person Name",
  //     role: "Profession",
  //     rating: 5,
  //     comment:
  //       "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
  //     img: "https://i.pravatar.cc/100?img=32",
  //   },
  //   {
  //     name: "Person Name",
  //     role: "Profession",
  //     rating: 3,
  //     comment:
  //       "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
  //     img: "https://i.pravatar.cc/100?img=30",
  //   },
  //   {
  //     name: "Person Name",
  //     role: "Profession",
  //     rating: 4,
  //     comment:
  //       "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
  //     img: "https://i.pravatar.cc/100?img=15",
  //   },
  //   {
  //     name: "Person Name",
  //     role: "Profession",
  //     rating: 5,
  //     comment:
  //       "Fantastic service! Booking was smooth, car was clean and reliable. I'll definitely use RentMyCar for my future rentals.",
  //     img: "https://i.pravatar.cc/100?img=20",
  //   },
  // ];
  
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const isSubmitDisabled = rating === 0 || feedback.trim() ==="";
  

  useEffect(() => {
    const handleResize = () => {
      setReviewsPerPage(window.innerWidth < 768 ? 1 : 2);
      setCurrentPage(0); // reset to avoid broken index
    };
  
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

  const getInitial = (name)=>{
    if(!name) return "?";
    return name.charAt(0).toUpperCase();
  }

  const handleSubmitReview = async () => {
    if(!rating || !feedback.trim()) return;

    try {
      setSubmitting(true);

      const res = await axios.post(
        `${API_BASE_URL}${API_VERSION}/reviews/create`,
        {
          vehicleId,
          rating,
          feedback,
        },
        {
          withCredentials:true,
        }
      );
      setRating(0);
      setFeedback("");

      await Promise.all([
        fetchReviewsByVehicleId(vehicleId),
        loadReviewSummary(vehicleId)
      ])
    } catch (error) {
      console.error("Failed to submit review", error);
      alert("Failed to submit review. Please try again.");
    } finally{
      setSubmitting(false);
    }
  }
  
  

  return (
    <div className="w-full min-h-screen bg-white px-4 md:px-6 py-8 md:py-10">
      {/* Page Title */}
      <div className="text-center mb-10">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-[#0D3778]">Customer Reviews</h1>  
        <p className="text-[#0D3778] mt-2">Share Your Experience With Us</p>
      </div>

      {/* Car & Rating Section */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 items-center">
        {/* Car Image */}
        <img
          src={vehicleImage || "https://images.unsplash.com/photo-1549924231-f129b911e442"}
          alt={vehicleName || "Vehicle"}
          className="rounded-lg shadow"
        />

        {/* Rating Box */}
        <div className="border-2 border-[#0D3778] rounded-3xl p-5 md:p-6 text-center shadow-sm max-w-sm md:max-w-lg mx-auto">
          <h2 className="text-md md:text-lg lg:text-xl font-medium mb-4">{vehicleName || "Toyota Prius (ABC-1234)"}</h2>
          <div className="flex items-center justify-center gap-6">
            <div>
              <p className="text-3xl md:text-4xl lg:text-5xl font-semibold text-yellow-500">{loadingSummary ? "—" : averageRating.toFixed(1)}</p>
              <div className="flex justify-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <span key={i} 
                  className={
                    i< Math.round(averageRating)
                      ? "text-yellow-400 fill-yellow-400 "
                      : "text-yellow-400"
                      }>
                    <Star className="w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10" />

                  </span>
                ))}
              </div>
            </div>
            <div className="h-16 w-1 bg-gray-300"></div>
            <div>
              <p className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#0D3778]">{loadingSummary ? "—" : totalReviews}</p>
              <p className="text-lg text-[#0D3778]">Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Rating */}
      <div className="max-w-3xl mx-auto mt-14">
        <h3 className="text-center text-lg font-medium mb-4">Your Rating</h3>
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              className="p-1"
              key={star}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              
            >
              <Star
          
                className={`w-5 h-5 sm:w-8 sm:h-8 md:w-10 md:h-10 ${
                  star <= (hover || rating)
                    ? "text-yellow-400 fill-yellow-400"
                    : "text-yellow-400"
                }`}
              />

            </button>
          ))}
        </div>

        {/* Feedback */}
        <label className="block mb-2 font-medium">Write Feedback</label>
        <textarea
          placeholder="Share your experience..."
          value={feedback}
          onChange={(e)=> setFeedback(e.target.value)}
          className="w-full border rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-[#0D3778]"
          rows="4"
        />

        <div className="flex flex-col sm:flex-row justify-end gap-4 mt-6">
          <button 
            onClick={()=>{
              setRating(0);
              setHover(0);
              setFeedback("");
            }}
            className="px-6 py-2 bg-white border-2 border-[#0D3778] rounded-lg text-[#0D3778] hover:bg-[#0D3778] hover:text-white">
            Cancel
          </button>
          <button 
            onClick={handleSubmitReview}
            disabled={isSubmitDisabled}
            className={`px-6 py-2 rounded-lg transition
              ${
                isSubmitDisabled
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#0D3778] text-white  hover:bg-blue-950"
              }
              `}>
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </div>
      </div>

      {/* Clients Reviews */}
      <div className="mt-20 py-14 relative bg-cover bg-center"
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
                              alt={review.name}
                              className="w-14 h-14 rounded-full object-cover"
                          />
                        ):(
                          <div className="w-14 h-14 rounded-full bg-[#0D3778] flex items-center justify-center text-white font-semibold text-xl shadow-sm ring-2 ring-white">
                            {getInitial(review.name)}
                          </div>
                       )}
                        
                        <div className="overflow-hidden">
                          <h4 className="font-semibold text-[#0D3778]">
                            {review.name}
                          </h4>
                          <div className="flex mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={20}
                                className={
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-yellow-400"
                                }
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm p-6 line-clamp-4 md:line-clamp-none">
                        "{review.comment}"
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
  );
}
