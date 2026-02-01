import React, { useState } from 'react';
import { Car, Upload, MapPin, DollarSign, Calendar, MessageSquare, ShieldCheck, CheckCircle } from 'lucide-react';

export function RentYourCarPage({ onContact }) {
    const [formData, setFormData] = useState({
        ownerName: '',
        email: '',
        phone: '',
        carMake: '',
        carModel: '',
        year: '',
        licensePlate: '',
        location: '',
        expectedRent: '',
        description: ''
    });

    const [submitted, setSubmitted] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logic to submit the listing would go here
        console.log("Submitted car listing:", formData);
        setSubmitted(true);
        // You might want to navigate or show a success message
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Thank you for listing your car with us. Our team will review your submission and contact you shortly.
                    </p>
                    <button
                        onClick={() => setSubmitted(false)}
                        className="bg-[#1e3a5f] text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Submit Another Car
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="bg-[#1e3a5f] text-white py-16 px-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                    <Car className="w-96 h-96 absolute -right-20 top-1/2 -translate-y-1/2" />
                </div>
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="md:w-1/2">
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                            Turn Your Car Into <br />
                            <span className="text-blue-300">Extra Income</span>
                        </h1>
                        <p className="text-blue-100 text-lg mb-8 max-w-lg">
                            List your vehicle on RentmyCar and start earning today. Safe, secure, and hassle-free.
                        </p>
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                <ShieldCheck className="h-5 w-5 text-green-400" />
                                <span className="text-sm">Full Insurance Coverage</span>
                            </div>
                            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                                <DollarSign className="h-5 w-5 text-yellow-400" />
                                <span className="text-sm">Guaranteed Payments</span>
                            </div>
                        </div>
                    </div>

                    <div className="md:w-1/2 bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Have Questions?
                        </h3>
                        <p className="text-blue-200 text-sm mb-6">
                            Not sure how much your car can earn? Or want to know more about our protection plans?
                        </p>
                        <button
                            onClick={onContact}
                            className="w-full bg-white text-[#1e3a5f] font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Contact Support
                        </button>
                    </div>
                </div>
            </section>

            {/* Listing Form Section */}
            <section className="max-w-4xl mx-auto px-4 py-12 -mt-8 relative z-20">
                <div className="bg-white rounded-xl shadow-xl p-6 md:p-10 border border-gray-100">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-800">List Your Vehicle</h2>
                        <p className="text-gray-500">Fill in the details below to get started</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Owner Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Owner Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="ownerName"
                                        value={formData.ownerName}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="077 123 4567"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location / District</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleChange}
                                            required
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            placeholder="Colombo"
                                        />
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2 pt-2">Vehicle Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Car Make</label>
                                    <input
                                        type="text"
                                        name="carMake"
                                        value={formData.carMake}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Toyota, Honda..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Car Model</label>
                                    <input
                                        type="text"
                                        name="carModel"
                                        value={formData.carModel}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="Prius, Vezel..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Year of Manufacture</label>
                                    <input
                                        type="number"
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="2018"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate Number</label>
                                    <input
                                        type="text"
                                        name="licensePlate"
                                        value={formData.licensePlate}
                                        onChange={handleChange}
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        placeholder="CAB-1234"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Daily Rent (LKR)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        name="expectedRent"
                                        value={formData.expectedRent}
                                        onChange={handleChange}
                                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none max-w-xs"
                                        placeholder="5000"
                                    />
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">Rs.</span>
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description / Additional Notes</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Any special features, condition notes, or availability details..."
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-[#1e3a5f] hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg transition-transform transform active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <Upload className="h-5 w-5" />
                                Submit Listing Request
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-2">
                                By submitting, you agree to our terms and conditions for vehicle listing.
                            </p>
                        </div>
                    </form>
                </div>
            </section>

            {/* Information Cards */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white p-6 rounded-lg text-center">
                        <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">Flexible Schedule</h3>
                        <p className="text-sm text-gray-600">You decide when your car is available for rent. Manage your calendar easily.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg text-center">
                        <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <DollarSign className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">Earn Weekly</h3>
                        <p className="text-sm text-gray-600">Get paid automatically every week for your completed trips.</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg text-center">
                        <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">Safe & Secure</h3>
                        <p className="text-sm text-gray-600">We verify all renters and provide insurance coverage during trips.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
