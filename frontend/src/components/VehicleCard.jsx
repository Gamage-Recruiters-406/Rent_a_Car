import React from 'react';
import { User, MapPin, Calendar, Fuel, Settings, Eye, Trash2, Check, X } from 'lucide-react';

function VehicleImage({ src, alt }) {
  return (
    <div className="md:w-2/5 h-48 md:h-auto">
      <img
        src={src || 'https://via.placeholder.com/400x300?text=Vehicle'}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}

function VehicleInfo({ name, owner, plateNumber, location }) {
  return (
    <div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{name}</h3>
      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>{owner}</span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="w-4 h-4" />
          <span>{plateNumber}</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
      </div>
    </div>
  );
}

function VehicleActions({ onView, onDelete }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={onView}
        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Eye className="w-5 h-5" />
      </button>
      <button
        onClick={onDelete}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}

function VehicleSpecs({ year, fuelType, transmission }) {
  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
        {year}
      </span>
      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-1">
        <Fuel className="w-3 h-3" />
        {fuelType}
      </span>
      <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full flex items-center gap-1">
        <Settings className="w-3 h-3" />
        {transmission}
      </span>
    </div>
  );
}

function VehiclePricing({ pricePerDay, pricePerKm }) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold">
        LKR {pricePerDay}/day
      </div>
      <div className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold">
        LKR {pricePerKm}/km
      </div>
    </div>
  );
}

function VehicleActionButtons({ status, onApprove, onReject }) {
  if (status?.toLowerCase() !== 'pending') {
    return null;
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={onApprove}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
      >
        <Check className="w-4 h-4" />
        Approve
      </button>
      <button
        onClick={onReject}
        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <X className="w-4 h-4" />
        Reject
      </button>
    </div>
  );
}

export function VehicleCard({ vehicle, onApprove, onReject, onDelete, onView }) {
  const handleApprove = () => onApprove(vehicle.id);
  const handleReject = () => onReject(vehicle.id);
  const handleDelete = () => onDelete(vehicle.id);
  const handleView = () => onView(vehicle);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all fade-in">
      <div className="md:flex">
        <VehicleImage src={vehicle.image} alt={vehicle.name} />

        <div className="md:w-3/5 p-6">
          <div className="flex justify-between items-start mb-4">
            <VehicleInfo
              name={vehicle.name}
              owner={vehicle.owner}
              plateNumber={vehicle.plateNumber}
              location={vehicle.location}
            />
            <VehicleActions onView={handleView} onDelete={handleDelete} />
          </div>

          <VehicleSpecs
            year={vehicle.year}
            fuelType={vehicle.fuelType}
            transmission={vehicle.transmission}
          />

          <VehiclePricing
            pricePerDay={vehicle.pricePerDay}
            pricePerKm={vehicle.pricePerKm}
          />

          <VehicleActionButtons
            status={vehicle.status}
            onApprove={handleApprove}
            onReject={handleReject}
          />

          <p className="text-sm text-gray-500 mt-3">
            Submitted: {vehicle.submittedDate}
          </p>
        </div>
      </div>
    </div>
  );
}