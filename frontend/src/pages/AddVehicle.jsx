import React, { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const AddVehicle = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8090";
  const [formData, setFormData] = useState({
    title: "",
    model: "",
    vehicleType: "",
    year: "",
    fuelType: "",
    description: "",
    numberPlate: "",
    km: "",
    pricePerDay: "",
    pricePerKm: "",
    transmission: "",
    address: "",
    photos: []
  });

  const [dragActive, setDragActive] = useState(false);
  const [photoPreview, setPhotoPreview] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      toast.error("Maximum 10 photos allowed");
      return;
    }
    setFormData({ ...formData, photos: files });
    previews(files);
  };

  const previews = (files) => {
    const previews = files.map((file) => URL.createObjectURL(file));
    setPhotoPreview(previews);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 10) {
      toast.error("Maximum 10 photos allowed");
      return;
    }
    setFormData({ ...formData, photos: files });
    previews(files);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title || !formData.model || !formData.vehicleType || !formData.year || !formData.fuelType ||
      !formData.numberPlate || !formData.km || !formData.pricePerDay || !formData.pricePerKm ||
      !formData.transmission || !formData.address) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.photos.length === 0) {
      toast.error("Please upload at least 1 photo");
      return;
    }

    submitForm();
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("model", formData.model);
      formDataToSend.append("vehicleType", formData.vehicleType);
      formDataToSend.append("year", formData.year);
      formDataToSend.append("fuelType", formData.fuelType);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("numberPlate", formData.numberPlate);
      formDataToSend.append("km", formData.km);
      formDataToSend.append("pricePerDay", formData.pricePerDay);
      formDataToSend.append("pricePerKm", formData.pricePerKm);
      formDataToSend.append("transmission", formData.transmission);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("lat", 6.9271); // Default Sri Lanka center
      formDataToSend.append("lng", 80.7789);

      for (let photo of formData.photos) {
        formDataToSend.append("photos", photo);
      }

      const response = await fetch(`${API_BASE_URL}/api/v1/vehicle/create`, {
        method: "POST",
        body: formDataToSend,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create vehicle");
      }

      toast.success("Vehicle created successfully!");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to create vehicle");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    const draftData = JSON.stringify(formData);
    localStorage.setItem("vehicleDraft", draftData);
    console.log("Draft saved:", formData);
    toast.success("Draft saved successfully!");
  };

  React.useEffect(() => {
    const savedDraft = localStorage.getItem("vehicleDraft");
    if (savedDraft) {
      setFormData(JSON.parse(savedDraft));
    }
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8" style={{ backgroundColor: "#F5F5F5" }}>
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg p-6 md:p-10" style={{ border: "3px solid #0D3778" }}>
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: "#0D3778" }}>
              Add New Vehicle to Your Fleet
            </h1>
            <p className="text-gray-500 text-sm">
              Fill in details to list your car for rent and start earning
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Vehicle Title */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                Vehicle Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                maxLength={100}
                className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                style={{ borderColor: "#0D3778" }}
                placeholder="e.g., Toyota Camry 2020 - Automatic"
                required
              />
              <div className="text-right text-xs text-gray-400 mt-1">
                {formData.title.length}/100
              </div>
            </div>

            {/* Vehicle Model & Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                  Vehicle Model <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  maxLength={50}
                  className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                  style={{ borderColor: "#0D3778" }}
                  placeholder="e.g., Toyota"
                  required
                />
                <div className="text-right text-xs text-gray-400 mt-1">
                  {formData.model.length}/50
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                  Vehicle Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800 bg-white"
                  style={{ borderColor: "#0D3778" }}
                  required
                >
                  <option value="">Select Vehicle Type</option>
                  <option value="Car">Car</option>
                  <option value="Van">Van</option>
                  <option value="SUV">SUV</option>
                  <option value="Pickup">Pickup</option>
                  <option value="Bus">Bus</option>
                  <option value="Bike">Bike</option>
                  <option value="ThreeWheel">ThreeWheel</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Year & Fuel Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                  Year <span className="text-red-500">*</span>
                </label>
                <select
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800 bg-white"
                  style={{ borderColor: "#0D3778" }}
                  required
                >
                  <option value="">Select Year</option>
                  {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                  Fuel Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800 bg-white"
                  style={{ borderColor: "#0D3778" }}
                  required
                >
                  <option value="">Select Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800 resize-none"
                style={{ borderColor: "#0D3778" }}
                placeholder="Describe features, condition, mileage, special amenities..."
                rows="4"
              />
            </div>

            {/* Number Plate & KM */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                  Number Plate <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="numberPlate"
                  value={formData.numberPlate}
                  onChange={handleChange}
                  className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                  style={{ borderColor: "#0D3778" }}
                  placeholder="WP/AB 1234"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                  KM <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="km"
                  value={formData.km}
                  onChange={handleChange}
                  className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                  style={{ borderColor: "#0D3778" }}
                  placeholder="100km"
                  required
                />
              </div>
            </div>

            {/* Rental Amount */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: "#0D3778" }}>
                Rental Amount <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Daily Rental Rate</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="pricePerDay"
                      value={formData.pricePerDay}
                      onChange={handleChange}
                      className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                      style={{ borderColor: "#0D3778" }}
                      placeholder="Daily Rental Rate"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RS.100</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-2">Per Kilometer Charge</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="pricePerKm"
                      value={formData.pricePerKm}
                      onChange={handleChange}
                      className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                      style={{ borderColor: "#0D3778" }}
                      placeholder="Per Kilometer Charge"
                      required
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">RS.100</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Transmission & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                  Transmission <span className="text-red-500">*</span>
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleChange}
                  className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800 bg-white"
                  style={{ borderColor: "#0D3778" }}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: "#0D3778" }}>
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border-2 rounded-md px-3 py-2.5 focus:outline-none focus:border-blue-500 transition-all text-gray-800"
                  style={{ borderColor: "#0D3778" }}
                  placeholder="Gampaha"
                  required
                />
              </div>
            </div>

            {/* Vehicle Photos */}
            <div>
              <label className="block text-sm font-semibold mb-3" style={{ color: "#0D3778" }}>
                Vehicle Photos
              </label>
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className="border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300"
                style={{
                  borderColor: dragActive ? "#0D3778" : "#CBD5E0",
                  backgroundColor: dragActive ? "#F0F4FF" : "#FAFAFA"
                }}
              >
                <input
                  type="file"
                  name="photos"
                  onChange={handleFileChange}
                  className="hidden"
                  id="photoInput"
                  multiple
                  accept="image/jpeg, image/png"
                />
                <label htmlFor="photoInput" className="cursor-pointer">
                  <div className="mb-3">
                    <svg className="w-14 h-14 mx-auto" style={{ color: "#0D3778" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium mb-1">Drag and drop photos here, or click to select</p>
                  <p className="text-red-400 text-xs">Support: JPEG, PNG (Max 10 MB each, max 10 photos)</p>
                </label>
              </div>

              {/* Photo Preview */}
              {photoPreview.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-semibold mb-3" style={{ color: "#0D3778" }}>
                    📸 Photos Selected: {photoPreview.length}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {photoPreview.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`preview-${index}`}
                          className="w-full h-24 object-cover rounded border-2 border-gray-200"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              <button
                type="button"
                onClick={handleSaveDraft}
                className="px-6 py-3 bg-white border-2 rounded-lg font-semibold transition-all hover:bg-gray-50 flex items-center justify-center gap-2"
                style={{ borderColor: "#0D3778", color: "#0D3778" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save Draft
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 text-white rounded-lg font-semibold transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: "#0D3778" }}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Publish Vehicle
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddVehicle;