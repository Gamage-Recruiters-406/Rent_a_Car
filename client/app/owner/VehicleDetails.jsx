// app/owner/VehicleDetails.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import ReviewCards from '../../components/owner/ReviewCards';
import AppLayout from '../../components/layout/Layout';
import { getSingleVehicleListing, getImageBaseUrl } from '../../services/vehicleService';
import { getVehicleAvailability } from '../../services/bookingAvailability';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ─── Section Title ────────────────────────────────────────────────────────────
function SectionTitle({ title }) {
  return (
    <Text style={{
      fontSize: 15, fontWeight: '700', color: '#0D3778',
      marginBottom: 10, marginTop: 20,
      borderLeftWidth: 3, borderLeftColor: '#0D3778', paddingLeft: 8,
    }}>
      {title}
    </Text>
  );
}

// ─── Detail Row ───────────────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <View style={{
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', paddingVertical: 10,
      borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
    }}>
      <Text style={{ fontSize: 13, color: '#9CA3AF', flex: 1 }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937', flex: 1, textAlign: 'right' }}>
        {value || '—'}
      </Text>
    </View>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const colors = {
    Approved: { bg: '#D1FAE5', text: '#065F46', icon: 'checkmark-circle' },
    Rejected: { bg: '#FEE2E2', text: '#991B1B', icon: 'close-circle' },
    Pending:  { bg: '#FEF3C7', text: '#92400E', icon: 'time' },
  };
  const c = colors[status] || colors.Pending;
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
      backgroundColor: c.bg, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, gap: 5,
    }}>
      <Ionicons name={c.icon} size={14} color={c.text} />
      <Text style={{ fontSize: 13, fontWeight: '600', color: c.text }}>{status || 'Pending'}</Text>
    </View>
  );
}

// ─── Inline Availability Calendar (read-only, same logic as AvailabilityOwner) ─
function AvailabilityCalendar({ vehicleId }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState({});
  const [loading, setLoading]         = useState(true);

  const MONTHS   = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
  const DAYS     = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  const formatDateISO = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Exact same grid builder as AvailabilityOwner
  const getDaysInMonthGrid = (date) => {
    const year  = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const days = [];

    const firstDow = firstDay.getDay();
    for (let i = 0; i < firstDow; i++) {
      const prev = new Date(year, month, -firstDow + i + 1);
      days.push({ date: prev.getDate(), isCurrentMonth: false, fullDate: prev });
    }
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push({ date: day, isCurrentMonth: true, fullDate: new Date(year, month, day) });
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const next = new Date(year, month + 1, i);
      days.push({ date: next.getDate(), isCurrentMonth: false, fullDate: next });
    }
    return days;
  };

  // Exact same fetch logic as AvailabilityOwner
  const fetchAvailability = useCallback(async () => {
    if (!vehicleId) return;
    setLoading(true);
    try {
      const res = await getVehicleAvailability(vehicleId);
      const bookingsArr = res?.data || [];
      const newBookedDates = {};
      bookingsArr.forEach((b) => {
        if (['rejected', 'cancelled'].includes(b.status)) return;
        const startRaw = b.startingDate ?? b.startDate ?? b.from ?? b.start;
        const endRaw   = b.endDate ?? b.to ?? b.end;
        if (!startRaw || !endRaw) return;
        const start = new Date(startRaw);
        const end   = new Date(endRaw);
        let cur = new Date(start);
        while (cur <= end) {
          newBookedDates[formatDateISO(cur)] = 'booked';
          cur.setDate(cur.getDate() + 1);
        }
      });
      setBookedDates(newBookedDates);
    } catch (e) {
      console.error('AvailabilityCalendar error:', e);
    } finally {
      setLoading(false);
    }
  }, [vehicleId]);

  useEffect(() => { fetchAvailability(); }, [fetchAvailability]);

  // Exact same day style logic as AvailabilityOwner (minus selected/past)
  const getDayStyle = (day) => {
    if (!day.isCurrentMonth) {
      return { bg: 'transparent', text: '#D1D5DB' };
    }
    const dateStr = formatDateISO(day.fullDate);
    if (bookedDates[dateStr] === 'booked') {
      return { bg: '#FEE2E2', text: '#DC2626' }; // red — blocked
    }
    return { bg: '#DCFCE7', text: '#16A34A' };   // green — available
  };

  const year  = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days  = getDaysInMonthGrid(currentDate);

  if (loading) {
    return (
      <View style={{ alignItems: 'center', paddingVertical: 24 }}>
        <ActivityIndicator size="small" color="#0D3778" />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: 'white', borderRadius: 16, padding: 16,
      borderWidth: 1, borderColor: '#E5E7EB',
      shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
    }}>
      {/* Month navigation */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <TouchableOpacity
          onPress={() => setCurrentDate(new Date(year, month - 1, 1))}
          style={{ padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB' }}
        >
          <Text style={{ fontSize: 16, color: '#374151' }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 16, fontWeight: '700', color: '#1F2937' }}>
          {MONTHS[month]} {year}
        </Text>

        <TouchableOpacity
          onPress={() => setCurrentDate(new Date(year, month + 1, 1))}
          style={{ padding: 8, borderRadius: 20, borderWidth: 1, borderColor: '#D1D5DB' }}
        >
          <Text style={{ fontSize: 16, color: '#374151' }}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Day headers */}
      <View style={{ flexDirection: 'row', marginBottom: 6 }}>
        {DAYS.map((d) => (
          <View key={d} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontSize: 11, fontWeight: '600', color: '#9CA3AF' }}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {days.map((day, idx) => {
          const s = getDayStyle(day);
          return (
            <View key={idx} style={{ width: '14.28%', aspectRatio: 1, padding: 1 }}>
              <View style={{
                flex: 1, borderRadius: 8,
                backgroundColor: s.bg,
                alignItems: 'center', justifyContent: 'center',
              }}>
                {day.isCurrentMonth && (
                  <Text style={{ fontSize: 13, fontWeight: '500', color: s.text }}>
                    {day.date}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* Legend — same as AvailabilityOwner */}
      <View style={{
        flexDirection: 'row', justifyContent: 'space-around',
        paddingTop: 12, marginTop: 12,
        borderTopWidth: 1, borderTopColor: '#E5E7EB',
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#DCFCE7' }} />
          <Text style={{ fontSize: 12, color: '#6B7280' }}>Available</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#FEE2E2' }} />
          <Text style={{ fontSize: 12, color: '#6B7280' }}>Blocked</Text>
        </View>
      </View>

      <Text style={{ textAlign: 'center', fontSize: 11, color: '#9CA3AF', marginTop: 8 }}>
        {Object.keys(bookedDates).length} days currently blocked
      </Text>
    </View>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function VehicleDetailsPage() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [vehicle, setVehicle]     = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getSingleVehicleListing(id);
        setVehicle(data?.vehicle || null);
        setActiveImg(0);
      } catch (err) {
        console.error('VehicleDetails error:', err);
        setError(err?.message || 'Failed to load vehicle.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const photoUrls = useMemo(() => {
    const base = getImageBaseUrl() || BASE_URL || '';
    return (vehicle?.photos || [])
      .map((p) => {
        if (!p?.url) return null;
        let u = p.url.replace('./uploads', '/uploads');
        if (u.startsWith('http')) return u;
        if (!u.startsWith('/')) u = '/' + u;
        return `${base}${u}`;
      })
      .filter(Boolean);
  }, [vehicle]);

  const titleText = vehicle?.title || `${vehicle?.model || ''} ${vehicle?.year || ''}`.trim();

  if (loading) {
    return (
      <AppLayout>
        <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
          <ActivityIndicator size="large" color="#0D3778" />
          <Text style={{ color: '#6B7280', marginTop: 12 }}>Loading vehicle...</Text>
        </View>
      </AppLayout>
    );
  }

  if (error || !vehicle) {
    return (
      <AppLayout>
        <View style={{ padding: 16 }}>
          <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 16 }}>
            <Ionicons name="arrow-back" size={24} color="#0D3778" />
          </TouchableOpacity>
          <Text style={{ color: '#EF4444', fontSize: 15 }}>{error || 'Vehicle not found.'}</Text>
        </View>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <View>
        {/* ── Photo Gallery ── */}
        <View style={{ backgroundColor: '#F3F4F6' }}>
          <View style={{ height: 260, backgroundColor: '#E5E7EB' }}>
            {photoUrls[activeImg] ? (
              <Image
                source={{ uri: photoUrls[activeImg] }}
                style={{ width: '100%', height: '100%' }}
                contentFit="cover"
              />
            ) : (
              <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="car-outline" size={64} color="#D1D5DB" />
                <Text style={{ color: '#9CA3AF', marginTop: 8 }}>No image</Text>
              </View>
            )}
            {/* Back button overlay */}
            <TouchableOpacity
              onPress={() => router.back()}
              style={{
                position: 'absolute', top: 16, left: 16,
                backgroundColor: 'rgba(255,255,255,0.9)',
                borderRadius: 20, width: 36, height: 36,
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Ionicons name="arrow-back" size={20} color="#0D3778" />
            </TouchableOpacity>
          </View>

          {/* Thumbnails */}
          {photoUrls.length > 1 && (
            <View style={{ flexDirection: 'row', padding: 10, gap: 8 }}>
              {photoUrls.map((uri, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => setActiveImg(idx)}
                  style={{
                    width: 64, height: 64, borderRadius: 8, overflow: 'hidden',
                    borderWidth: 2,
                    borderColor: idx === activeImg ? '#0D3778' : 'transparent',
                  }}
                >
                  <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* ── Content ── */}
        <View style={{ padding: 16 }}>

          {/* Title + Status */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: '#0D3778', flex: 1, marginRight: 8 }}>
              {titleText}
            </Text>
            <StatusBadge status={vehicle.status} />
          </View>

          {/* Location */}
          {vehicle.location?.address && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <Ionicons name="location-sharp" size={14} color="#0D3778" />
              <Text style={{ fontSize: 13, color: '#6B7280' }}>{vehicle.location.address}</Text>
            </View>
          )}

          {/* Pricing pills */}
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 4 }}>
            <View style={{ backgroundColor: '#ECFDF5', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#065F46' }}>LKR {vehicle.pricePerDay}/day</Text>
            </View>
            <View style={{ backgroundColor: '#ECFDF5', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#065F46' }}>LKR {vehicle.pricePerKm}/km</Text>
            </View>
          </View>

          {/* Vehicle Details */}
          <SectionTitle title="Vehicle Details" />
          <View style={{ backgroundColor: '#F9FAFB', borderRadius: 12, padding: 4 }}>
            <DetailRow label="Number Plate"  value={vehicle.numberPlate} />
            <DetailRow label="Type"          value={vehicle.vehicleType} />
            <DetailRow label="Model"         value={vehicle.model} />
            <DetailRow label="Year"          value={vehicle.year?.toString()} />
            <DetailRow label="Fuel Type"     value={vehicle.fuelType} />
            <DetailRow label="Transmission"  value={vehicle.transmission} />
            <DetailRow label="Seats"         value={vehicle.seats ? `${vehicle.seats} Seats` : null} />
            <DetailRow label="Mileage"       value={vehicle.km ? `${vehicle.km} km` : null} />
          </View>

          {/* Description */}
          {vehicle.description ? (
            <>
              <SectionTitle title="Description" />
              <Text style={{ fontSize: 14, color: '#4B5563', lineHeight: 22, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12 }}>
                {vehicle.description}
              </Text>
            </>
          ) : null}

          {/* Availability Calendar */}
          <SectionTitle title="Availability" />
          <AvailabilityCalendar vehicleId={id} />

          {/* Reviews */}
          <SectionTitle title="Reviews" />
          <ReviewCards vehicleId={id} />

        </View>
      </View>
    </AppLayout>
  );
}