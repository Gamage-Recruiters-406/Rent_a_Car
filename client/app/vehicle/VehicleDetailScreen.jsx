import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useWindowDimensions } from "react-native";

import DropdownCard from "../../components/vehicle/DropdownCard";
import MiniCalendar from "../../components/vehicle/MiniCalendar";
import {
  SimpleRow,
  BulletRow,
  LegendItem,
} from "../../components/vehicle/Rows";

import {
  SettingsIcon,
  NotebookIcon,
  VehicleIcon,
  CalendarIcon,
  FuelStationIcon,
  WorldIcon,
} from "../../components/vehicle/Icons";

import { getVehicleById } from "../../src/services/vehicleApi";
import { getVehicleAvailability } from "../../src/services/bookingApi";

// helpers
function toYYYYMM(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}
function addMonths(yyyyMm, diff) {
  const [y, m] = yyyyMm.split("-").map(Number);
  const d = new Date(y, m - 1 + diff, 1);
  return toYYYYMM(d);
}
function formatMonthLabel(yyyyMm) {
  const [y, m] = yyyyMm.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

export default function VehicleDetailScreen() {
  const { width } = useWindowDimensions();

  const isPhone = width < 700;
  const isTablet = width >= 700 && width < 1100;
  const mainImageHeight = isPhone ? 220 : isTablet ? 320 : 380;

  const { id } = useLocalSearchParams();

  const [vehicle, setVehicle] = useState(null);
  const [activeImg, setActiveImg] = useState(0);
  const [month, setMonth] = useState(toYYYYMM(new Date()));

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookings, setBookings] = useState([]);

  const [open, setOpen] = useState({
    registration: true,
    availability: true,
    rental: true,
    location: true,
    specs: true,
    description: true,
  });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setError("");

        const dummyBookings = [
          { startingDate: "2026-02-05", endDate: "2026-02-06" },
          { startingDate: "2026-02-12", endDate: "2026-02-14" },
        ];

        if (!id) throw new Error("Vehicle id missing");

        const data = await getVehicleById(String(id));
        if (!mounted) return;

        setVehicle(data?.vehicle || null);
        setActiveImg(0);

        try {
          const avail = await getVehicleAvailability(String(id));
          if (!mounted) return;

          if (Array.isArray(avail?.data)) {
            setBookings(avail.data);
          } else if (Array.isArray(avail?.bookings)) {
            setBookings(avail.bookings);
          } else if (Array.isArray(avail?.bookedDates)) {
            setBookings(
              avail.bookedDates.map((d) => ({
                startingDate: d,
                endDate: d,
              })),
            );
          } else {
            setBookings(dummyBookings);
          }
        } catch (err) {
          console.log("Availability skipped:", err?.message);
          setBookings(dummyBookings);
        }
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || "Failed to load vehicle.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const photoUrls = useMemo(() => {
    const base = "http://localhost:8090"; // change for real phone later
    const photos = vehicle?.photos || [];

    return photos
      .map((p) => {
        if (!p?.url) return null;

        let u = p.url;
        u = u.replace("./uploads", "/uploads");

        if (u.startsWith("http")) return u;
        if (!u.startsWith("/")) u = "/" + u;

        return `${base}${u}`;
      })
      .filter(Boolean);
  }, [vehicle]);

  const titleText =
    vehicle?.title || `${vehicle?.model || ""} ${vehicle?.year || ""}`.trim();

  const specItems = [
    { label: "Type", value: vehicle?.vehicleType || "—" },
    { label: "Model", value: vehicle?.model || "—" },
    { label: "Year", value: vehicle?.year ?? "—" },
    { label: "Transmission", value: vehicle?.transmission || "—" },
    { label: "Fuel Type", value: vehicle?.fuelType || "—" },
  ];

  const blockedSet = useMemo(() => {
    const s = new Set();

    (bookings || []).forEach((b) => {
      const start = new Date(b.startingDate);
      const end = new Date(b.endDate);
      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return;

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        s.add(d.toISOString().slice(0, 10));
      }
    });

    return s;
  }, [bookings]);

  const blockedCountInMonth = useMemo(() => {
    const prefix = `${month}-`;
    let c = 0;
    blockedSet.forEach((d) => {
      if (d.startsWith(prefix)) c += 1;
    });
    return c;
  }, [blockedSet, month]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="mt-2.5 text-slate-700">Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="p-4">
        <View className="border-2 border-red-500 rounded-2xl p-3.5">
          <Text className="font-black text-base">Couldn’t load vehicle</Text>
          <Text className="mt-1.5 text-slate-700">{error}</Text>
        </View>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View className="p-4">
        <Text className="text-slate-700">Vehicle not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white"
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
      <Text className="text-[22px] font-black text-[#0d3778]">{titleText}</Text>

      {/* Gallery */}
      <View className="border-2 border-[#0d3778] rounded-2xl p-2.5">
        {/* Main Image */}
        <View
          className="rounded-2xl overflow-hidden bg-slate-200"
          style={{ height: mainImageHeight }}
        >
          {photoUrls[activeImg] ? (
            <Image
              source={{ uri: photoUrls[activeImg] }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Text className="text-slate-500">No image</Text>
            </View>
          )}
        </View>

        {/* Dots */}
        <View className="flex-row justify-center my-2.5">
          {/* gap workaround */}
          {photoUrls.slice(0, 6).map((_, idx) => (
            <Pressable
              key={idx}
              onPress={() => setActiveImg(idx)}
              className={`w-2 h-2 rounded-full mx-1 ${
                idx === activeImg ? "bg-[#0d3778]" : "bg-slate-300"
              }`}
            />
          ))}
        </View>

        {/* Thumbs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: 2 }}
        >
          {photoUrls.slice(0, 8).map((img, idx) => {
            const thumbWidth = isPhone ? 110 : 160;
            const thumbHeight = isPhone ? 70 : 80;

            return (
              <Pressable
                key={idx}
                onPress={() => setActiveImg(idx)}
                className={`rounded-2xl overflow-hidden border-2 mr-2.5 ${
                  idx === activeImg ? "border-[#0d3778]" : "border-slate-300"
                }`}
                style={{ width: thumbWidth, height: thumbHeight }}
              >
                <Image
                  source={{ uri: img }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Registration */}
      <DropdownCard
        title="Registration"
        icon={<VehicleIcon />}
        open={open.registration}
        onToggle={() =>
          setOpen((p) => ({ ...p, registration: !p.registration }))
        }
      >
        <SimpleRow label="Number Plate" value={vehicle.numberPlate || "—"} />
      </DropdownCard>

      {/* Availability */}
      <DropdownCard
        title="Availability"
        icon={<CalendarIcon />}
        open={open.availability}
        onToggle={() =>
          setOpen((p) => ({ ...p, availability: !p.availability }))
        }
      >
        <View className="flex-row items-center justify-between mb-2.5">
          <Pressable
            onPress={() => setMonth((m) => addMonths(m, -1))}
            className="w-9 h-9 rounded-full border-2 border-[#0d3778] items-center justify-center"
          >
            <Text className="text-[#0d3778] font-black text-lg">‹</Text>
          </Pressable>

          <Text className="text-[#0d3778] font-black">
            {formatMonthLabel(month)}
          </Text>

          <Pressable
            onPress={() => setMonth((m) => addMonths(m, 1))}
            className="w-9 h-9 rounded-full border-2 border-[#0d3778] items-center justify-center"
          >
            <Text className="text-[#0d3778] font-black text-lg">›</Text>
          </Pressable>
        </View>

        <MiniCalendar month={month} blockedSet={blockedSet} />

        <View className="flex-row justify-between mt-2.5 items-center">
          {/* gap workaround */}
          <View className="flex-row items-center">
            <View className="mr-3.5">
              <LegendItem bg="#d1fae5" border="#6ee7b7" label="Available" />
            </View>
            <LegendItem bg="#fee2e2" border="#fca5a5" label="Blocked" />
          </View>

          <Text className="text-xs text-slate-500">
            Blocked: {blockedCountInMonth}
          </Text>
        </View>
      </DropdownCard>

      {/* Rental */}
      <DropdownCard
        title="Rental"
        icon={<FuelStationIcon />}
        open={open.rental}
        onToggle={() => setOpen((p) => ({ ...p, rental: !p.rental }))}
      >
        <SimpleRow label="Price Per Day" value={vehicle.pricePerDay ?? "—"} />
        <SimpleRow label="Price Per Km" value={vehicle.pricePerKm ?? "—"} />
      </DropdownCard>

      {/* Location */}
      <DropdownCard
        title="Location"
        icon={<WorldIcon />}
        open={open.location}
        onToggle={() => setOpen((p) => ({ ...p, location: !p.location }))}
      >
        <SimpleRow
          label="Available in"
          value={vehicle.location?.address || "—"}
        />
      </DropdownCard>

      {/* Specs */}
      <DropdownCard
        title="Vehicle Specification"
        icon={<SettingsIcon />}
        open={open.specs}
        onToggle={() => setOpen((p) => ({ ...p, specs: !p.specs }))}
      >
        {/* gap workaround */}
        <View>
          {specItems.map((it, i) => (
            <View key={it.label} className={i === 0 ? "" : "mt-2"}>
              <BulletRow label={it.label} value={it.value} />
            </View>
          ))}
        </View>
      </DropdownCard>

      {/* Description */}
      <DropdownCard
        title="Description"
        icon={<NotebookIcon />}
        open={open.description}
        onToggle={() => setOpen((p) => ({ ...p, description: !p.description }))}
      >
        <Text className="text-[13px] text-slate-700 leading-[18px]">
          {vehicle.description || "—"}
        </Text>
      </DropdownCard>

      {/* Book Now */}
      <Pressable
        onPress={() => Alert.alert("Book Now", "Backend connect later ✅")}
        className="h-12 rounded-2xl bg-[#0d3778] items-center justify-center mt-1.5"
      >
        <Text className="text-white font-black">Book Now</Text>
      </Pressable>
    </ScrollView>
  );
}
