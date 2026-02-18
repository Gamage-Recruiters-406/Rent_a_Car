import React from 'react';
import { X, Trash2, AlertCircle, CheckCircle, AlertTriangle, Info, Calendar, Star } from 'lucide-react';

const NotificationDetailModal = ({ notification, onClose, onDelete }) => {
  if (!notification) return null;

  const getIconByType = (type) => {
    switch (type.toLowerCase()) {
      case 'reject':
      case 'rejected':
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      case 'approved':
      case 'success':
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case 'pending':
      case 'warning':
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case 'received':
        return <Info className="w-8 h-8 text-blue-500" />;
      case 'booking':
        return <Calendar className="w-8 h-8 text-blue-500" />;
      case 'review':
        return <Star className="w-8 h-8 text-blue-500 fill-current" />;
      case 'info':
      default:
        return <Info className="w-8 h-8 text-blue-500" />;
    }
  };

  const renderDetails = () => {
    switch (notification.type.toLowerCase()) {
      case 'review':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${notification.isRead ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                {notification.isRead ? 'Read' : 'Unread'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Received Date</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Customer</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.details?.customer || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Vehicle</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.details?.vehicle || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Rating</span>
              <span className="text-gray-900 font-medium text-sm">
                {'⭐'.repeat(notification.details?.rating || 0)} ({notification.details?.rating || 0}.0)
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Booking ID</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.details?.bookingId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 text-sm">Review Date</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.details?.reviewDate || notification.timestamp}
              </span>
            </div>
          </div>
        );
      case 'booking':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${notification.isRead ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                {notification.isRead ? 'Read' : 'Unread'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Received Date</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Customer</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.details?.customer || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Vehicle</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.details?.vehicle || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Booking ID</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.details?.bookingId || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 text-sm">Booking Date</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.details?.bookingDate || notification.timestamp}
              </span>
            </div>
          </div>
        );
      case 'approved':
      case 'rejected':
      case 'pending':
      case 'success':
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${notification.isRead ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                {notification.isRead ? 'Read' : 'Unread'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Received Date</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Type</span>
              <span className="text-gray-900 font-medium text-sm capitalize">
                {notification.type}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 text-sm">Details</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.details?.description || 'N/A'}
              </span>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Status</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${notification.isRead ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>
                {notification.isRead ? 'Read' : 'Unread'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Received Date</span>
              <span className="text-gray-900 font-medium text-sm">
                {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : notification.timestamp}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600 text-sm">Type</span>
              <span className="text-gray-900 font-medium text-sm capitalize">
                {notification.type}
              </span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getIconByType(notification.type)}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {notification.title}
              </h2>
              <p className="text-xs text-gray-500">
                {notification.timestamp}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Description */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-sm text-gray-600">
            {notification.description}
          </p>
        </div>

        {/* Details */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Details</h3>
          {renderDetails()}
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-3 justify-end">
          <button
            onClick={() => {
              onDelete(notification._id || notification.id);
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 size={16} />
            Delete
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition-colors text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationDetailModal;
