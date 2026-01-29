import React from "react";
import { User, MapPin, Calendar, Fuel, Settings, Eye, Trash2, Check, X } from 'lucide-react';

const VehicleCard = ({ vehicle, onApprove, onReject, onDelete, onView }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all fade-in">
      <div className="md:flex">
        {/* Vehicle Image */}
        <div className="md:w-2/5 h-48 md:h-auto">
          <img
            src={vehicle.image || 'https://via.placeholder.com/400x300?text=Vehicle'}
            alt={vehicle.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Vehicle Details */}
        <div className="md:w-3/5 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{vehicle.name}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>{vehicle.owner}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{vehicle.plateNumber}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{vehicle.location}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onView(vehicle)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Eye className="w-5 h-5" />
              </button>
              <button
                onClick={() => onDelete(vehicle.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Vehicle Specs */}
          <div className="flex flex-wrap gap-3 mb-4">
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
              {vehicle.year}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-1">
              <Fuel className="w-3 h-3" />
              {vehicle.fuelType}
            </span>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-1">
              <Settings className="w-3 h-3" />
              {vehicle.transmission}
            </span>
          </div>

          {/* Pricing */}
          <div className="flex items-center gap-4 mb-4">
            <div className="px-4 py-2 bg-blue-50 text-primary-600 rounded-lg font-semibold">
              LKR {vehicle.pricePerDay}/day
            </div>
            <div className="px-4 py-2 bg-blue-50 text-primary-600 rounded-lg font-semibold">
              LKR {vehicle.pricePerKm}/km
            </div>
          </div>

          {/* Action Buttons */}
          {vehicle.status?.toLowerCase() === 'pending' && (
            <div className="flex gap-3">
              <button
                onClick={() => onApprove(vehicle.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                Approve
              </button>
              <button
                onClick={() => onReject(vehicle.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
                Reject
              </button>
            </div>
          )}

          {/* Submission Date */}
          <p className="text-sm text-gray-500 mt-3">
            Submitted: {vehicle.submittedDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;