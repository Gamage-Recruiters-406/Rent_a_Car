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

// ✅ keep for later backend (comment usage)
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
  const isDesktop = width >= 1100;
  const mainImageHeight = isPhone ? 220 : isTablet ? 320 : 380;
  const isWide = !isPhone; // tablet + desktop

  console.log("WIDTH:", width, "isTablet:", isTablet);

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

        // ✅ Keep dummy bookings for now (availability API not ready)
        const dummyBookings = [
          { startingDate: "2026-02-05", endDate: "2026-02-06" },
          { startingDate: "2026-02-12", endDate: "2026-02-14" },
        ];

        if (!id) throw new Error("Vehicle id missing");

        // ✅ BACKEND: Vehicle details
        const data = await getVehicleById(String(id));
        if (!mounted) return;

        setVehicle(data?.vehicle || null);
        setActiveImg(0);

        // ✅ BACKEND (or dummy fallback): Availability
        try {
          const avail = await getVehicleAvailability(String(id));
          if (!mounted) return;

          // ✅ common shapes supported:
          // 1) { success, data: [...] }
          // 2) { bookings: [...] }
          // 3) { bookedDates: ["2026-02-05", ...] } -> convert below

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
            // if backend not ready, use dummy
            setBookings(dummyBookings);
          }
        } catch (err) {
          console.log("Availability skipped:", err?.message);
          // fallback to dummy so UI still works
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
    const base = "http://192.168.8.103:8090"; // or ENV.API_BASE_URL later
    const photos = vehicle?.photos || [];

    return photos
      .map((p) => {
        if (!p?.url) return null;

        let u = p.url;

        // fix old db urls like "./uploads/..."
        u = u.replace("./uploads", "/uploads");

        // keep full urls
        if (u.startsWith("http")) return u;

        // ensure leading slash
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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10, color: "#334155" }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ padding: 16 }}>
        <View
          style={{
            borderWidth: 2,
            borderColor: "red",
            borderRadius: 16,
            padding: 14,
          }}
        >
          <Text style={{ fontWeight: "900", fontSize: 16 }}>
            Couldn’t load vehicle
          </Text>
          <Text style={{ marginTop: 6, color: "#334155" }}>{error}</Text>
        </View>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ color: "#334155" }}>Vehicle not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "white" }}
      contentContainerStyle={{ padding: 16, gap: 14 }}
    >
      <Text style={{ fontSize: 22, fontWeight: "900", color: "#0d3778" }}>
        {titleText}
      </Text>

      {/* Gallery */}
      <View
        style={{
          borderWidth: 2,
          borderColor: "#0d3778",
          borderRadius: 16,
          padding: 10,
        }}
      >
        <View
          style={{
            height: mainImageHeight,
            borderRadius: 14,
            overflow: "hidden",
            backgroundColor: "#e2e8f0",
          }}
        >
          {photoUrls[activeImg] ? (
            <Image
              source={{ uri: photoUrls[activeImg] }}
              style={{ width: "100%", height: "100%" }}
              resizeMode="cover"
            />
          ) : (
            <View
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#64748b" }}>No image</Text>
            </View>
          )}
        </View>

        {/* Dots */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 8,
            marginVertical: 10,
          }}
        >
          {photoUrls.slice(0, 6).map((_, idx) => (
            <Pressable
              key={idx}
              onPress={() => setActiveImg(idx)}
              style={{
                width: 8,
                height: 8,
                borderRadius: 99,
                backgroundColor: idx === activeImg ? "#0d3778" : "#cbd5e1",
              }}
            />
          ))}
        </View>

        {/* Thumbs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 10, paddingVertical: 2 }}
        >
          {photoUrls.slice(0, 8).map((img, idx) => {
            const thumbWidth = isPhone ? 110 : 160;
            const thumbHeight = isPhone ? 70 : 80;

            return (
              <Pressable
                key={idx}
                onPress={() => setActiveImg(idx)}
                style={{
                  width: thumbWidth,
                  height: thumbHeight,
                  borderRadius: 14,
                  overflow: "hidden",
                  borderWidth: 2,
                  borderColor: idx === activeImg ? "#0d3778" : "#cbd5e1",
                }}
              >
                <Image
                  source={{ uri: img }}
                  style={{ width: "100%", height: "100%" }}
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
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <Pressable
            onPress={() => setMonth((m) => addMonths(m, -1))}
            style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              borderWidth: 2,
              borderColor: "#0d3778",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#0d3778", fontWeight: "900", fontSize: 18 }}>
              ‹
            </Text>
          </Pressable>

          <Text style={{ color: "#0d3778", fontWeight: "900" }}>
            {formatMonthLabel(month)}
          </Text>

          <Pressable
            onPress={() => setMonth((m) => addMonths(m, 1))}
            style={{
              width: 36,
              height: 36,
              borderRadius: 99,
              borderWidth: 2,
              borderColor: "#0d3778",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#0d3778", fontWeight: "900", fontSize: 18 }}>
              ›
            </Text>
          </Pressable>
        </View>

        <MiniCalendar month={month} blockedSet={blockedSet} />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", gap: 14, alignItems: "center" }}>
            <LegendItem bg="#d1fae5" border="#6ee7b7" label="Available" />
            <LegendItem bg="#fee2e2" border="#fca5a5" label="Blocked" />
          </View>

          <Text style={{ fontSize: 12, color: "#64748b" }}>
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
        <View style={{ gap: 8 }}>
          {specItems.map((it) => (
            <BulletRow key={it.label} label={it.label} value={it.value} />
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
        <Text style={{ fontSize: 13, color: "#334155", lineHeight: 18 }}>
          {vehicle.description || "—"}
        </Text>
      </DropdownCard>

      {/* Book Now */}
      <Pressable
        onPress={() => Alert.alert("Book Now", "Backend connect later ✅")}
        style={{
          height: 48,
          borderRadius: 14,
          backgroundColor: "#0d3778",
          alignItems: "center",
          justifyContent: "center",
          marginTop: 6,
        }}
      >
        <Text style={{ color: "white", fontWeight: "900" }}>Book Now</Text>
      </Pressable>
    </ScrollView>
  );
}
