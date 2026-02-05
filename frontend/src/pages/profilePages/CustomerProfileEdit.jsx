import React, { useState } from 'react';
import { Mail, Phone, MapPin, Calendar, Edit, Save, X } from 'lucide-react';

export const CustomerProfileEdit = ({
  'data-id': dataId,
  profile,
  stats,
  recentActivity,
  onSave,
  onProfileChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState(profile);
  const initials = profile.name.
  split(' ').
  map((n) => n[0]).
  join('').
  toUpperCase();
  const handleEdit = () => {
    setIsEditing(true);
    setEditedProfile(profile);
  };
  const handleSave = () => {
    onSave?.(editedProfile);
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };
  const handleFieldChange = (field, value) => {
    setEditedProfile((prev) => ({
      ...prev,
      [field]: value
    }));
    onProfileChange?.(field, value);
  };
  const currentProfile = isEditing ? editedProfile : profile;
  return (
    <div data-id={dataId} className="min-h-screen bg-gray-50 w-full">
      {/* Header */}
      <div className="bg-[#0A2E5C] px-6 py-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#0A2E5C] font-semibold text-xl">
              {profile.avatar ?
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-full h-full rounded-full object-cover" /> :


              initials
              }
            </div>
            <div>
              <h1 className="text-white text-2xl font-semibold">
                {profile.name}
              </h1>
              <p className="text-white/80 text-sm">{profile.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ?
            <>
                <button
                onClick={handleCancel}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-md font-medium hover:bg-white/20 transition-colors">

                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-white text-[#0A2E5C] rounded-md font-medium hover:bg-white/90 transition-colors">

                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
              </> :

            <button
              onClick={handleEdit}
              className="flex items-center gap-2 px-4 py-2 bg-white text-[#0A2E5C] rounded-md font-medium hover:bg-white/90 transition-colors">

                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
            }
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div
              className={`bg-white rounded-lg shadow-sm p-6 transition-all ${isEditing ? 'ring-2 ring-[#0A2E5C]/20' : ''}`}>

              <h2 className="text-[#0A2E5C] font-semibold text-lg mb-6">
                Personal Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#999fa8] mt-1" />
                  <div className="flex-1">
                    <label className="text-[#999fa8] text-sm block mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={currentProfile.email}
                      onChange={(e) =>
                      handleFieldChange('email', e.target.value)
                      }
                      disabled={!isEditing}
                      className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} />

                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-[#999fa8] mt-1" />
                  <div className="flex-1">
                    <label className="text-[#999fa8] text-sm block mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={currentProfile.phone}
                      onChange={(e) =>
                      handleFieldChange('phone', e.target.value)
                      }
                      disabled={!isEditing}
                      className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} />

                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#999fa8] mt-1" />
                  <div className="flex-1">
                    <label className="text-[#999fa8] text-sm block mb-1">
                      Location
                    </label>
                    <input
                      type="text"
                      value={currentProfile.location}
                      onChange={(e) =>
                      handleFieldChange('location', e.target.value)
                      }
                      disabled={!isEditing}
                      className={`w-full text-[#0A2E5C] font-medium focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`} />

                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-[#999fa8] mt-1" />
                  <div className="flex-1">
                    <label className="text-[#999fa8] text-sm block mb-1">
                      Member Since
                    </label>
                    <div className="text-[#0A2E5C] font-medium">
                      {profile.memberSince}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div
              className={`bg-white rounded-lg shadow-sm p-6 transition-all ${isEditing ? 'ring-2 ring-[#0A2E5C]/20' : ''}`}>

              <h2 className="text-[#0A2E5C] font-semibold text-lg mb-4">
                Bio
              </h2>
              <textarea
                value={currentProfile.bio}
                onChange={(e) => handleFieldChange('bio', e.target.value)}
                disabled={!isEditing}
                rows={4}
                className={`w-full text-[#999fa8] text-sm leading-relaxed resize-none focus:outline-none rounded px-2 py-1 transition-colors ${isEditing ? 'focus:ring-2 focus:ring-[#0A2E5C]/20 bg-gray-50' : 'cursor-default'}`}
                placeholder="Tell us about yourself..." />

            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-[#0A2E5C] font-semibold text-lg mb-6">
                Account Stats
              </h2>
              <div className="space-y-6">
                <div>
                  <div className="text-[#999fa8] text-sm mb-1">
                    Orders
                  </div>
                  <div className="text-[#0A2E5C] text-3xl font-bold">
                    {stats.orders}
                  </div>
                </div>
                <div>
                  <div className="text-[#999fa8] text-sm mb-1">
                    Order Items
                  </div>
                  <div className="text-[#0A2E5C] text-3xl font-bold">
                    {stats.orderItems.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-[#999fa8] text-sm mb-1">
                    Saved Items
                  </div>
                  <div className="text-[#0A2E5C] text-3xl font-bold">
                    {stats.savedItems}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#0A2E5C] rounded-lg shadow-sm p-6">
              <h2 className="text-white font-semibold text-lg mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity, index) =>
                <div
                  key={index}
                  className="border-b border-white/20 pb-4 last:border-0 last:pb-0">

                    <div className="text-white font-medium text-sm mb-1">
                      {activity.title}
                    </div>
                    <div className="text-white/60 text-xs">
                      {activity.timestamp}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>);

};