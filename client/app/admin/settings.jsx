import React, { useMemo, useRef, useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable, Switch, Alert } from "react-native";
import { router } from "expo-router";

// ✅ Use your existing APIs (adjust path if needed)
import {
  updateEmailNotify,
  getUserDetails,
} from "../../src/services/settingsApi";

const BLUE = "#0d3778";

export default function AdminSettingsMobile() {
  const scrollRef = useRef(null);

  const secGeneralRef = useRef(null);
  const secNotificationsRef = useRef(null);
  const secSecurityRef = useRef(null);
  const secTermsRef = useRef(null);
  const secLocalizationRef = useRef(null);
  const secPaymentRef = useRef(null);

  const [active, setActive] = useState("general");
  const [loadingUser, setLoadingUser] = useState(true);

  const [form, setForm] = useState({
    platformInfo: {
      supportEmail: "support@rentmycar.com",
      contactNumber: "+94 77 123 4567",
      platformStatus: "Active",
      defaultCurrency: "LKR",
    },
    operatingHours: {
      supportHours: "Mon-Fri: 9AM - 6PM",
      timezone: "Asia/Colombo",
    },
    notifications: { email: true },
    security: {
      twoFactorEnabled: true,
      sessionTimeoutMinutes: 30,
      minPasswordLength: 8,
      dataRetentionDays: 30,
    },
    terms: {
      termsOfService: "",
      privacyPolicy: "",
      cancellationPolicy: "",
    },
    localization: {
      defaultLanguage: "English",
      defaultCurrency: "LKR",
      dateFormat: "DD.MM.YYYY",
      distanceUnit: "km",
    },
    payment: {
      platformCommissionRate: 15,
      minBookingAmount: 1000,
      acceptedPaymentMethods: [
        "Credit Card",
        "Debit Card",
        "Bank Transfer",
        "Digital Wallet",
      ],
    },
  });

  const navItems = useMemo(
    () => [
      { key: "general", label: "General", ref: secGeneralRef },
      {
        key: "notifications",
        label: "Notifications",
        ref: secNotificationsRef,
      },
      { key: "security", label: "Security", ref: secSecurityRef },
      { key: "terms", label: "Terms", ref: secTermsRef },
      { key: "localization", label: "Localization", ref: secLocalizationRef },
      { key: "payment", label: "Payment", ref: secPaymentRef },
    ],
    [],
  );

  // ✅ load email notify from backend
  useEffect(() => {
    const loadUserPref = async () => {
      try {
        setLoadingUser(true);
        const res = await getUserDetails();

        const emailNotifyRaw = res?.data?.emailNotify ?? res?.user?.emailNotify;

        const emailNotifyBool =
          emailNotifyRaw === "on"
            ? true
            : emailNotifyRaw === "off"
              ? false
              : !!emailNotifyRaw;

        setForm((p) => ({
          ...p,
          notifications: { ...p.notifications, email: emailNotifyBool },
        }));
      } catch (err) {
        // ✅ mobile: just show alert + redirect
        Alert.alert("Session", "Please login again");
        // router.replace("/login");
      } finally {
        setLoadingUser(false);
      }
    };

    loadUserPref();
  }, []);

  // ✅ Scroll to section
  const scrollToSection = (item) => {
    setActive(item.key);
    item.ref.current?.measureLayout(
      scrollRef.current,
      (x, y) => {
        scrollRef.current?.scrollTo({ y: Math.max(y - 12, 0), animated: true });
      },
      () => {},
    );
  };

  const onSaveUIOnly = () => {
    console.log("FORM:", form);
    Alert.alert("Saved", "Updated ✅ (UI only)");
  };

  return (
    // ✅ Tailwind starts here
    <View className="flex-1 bg-slate-50">
      {/* Top header */}
      <View className="bg-white border-b border-slate-200 px-4 py-4">
        <Text className="text-xl font-black text-[#0d3778]">Settings</Text>
        <Text className="text-sm text-slate-500 mt-1">
          Manage platform configuration and performance
        </Text>

        <Pressable
          onPress={onSaveUIOnly}
          className="mt-3 h-11 rounded-xl bg-[#0d3778] items-center justify-center"
        >
          <Text className="text-white font-bold">Save Changes</Text>
        </Pressable>
      </View>

      {/* Top tabs */}
      <View className="bg-white border-b border-slate-200">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 10 }}
        >
          {navItems.map((it) => (
            <Pressable
              key={it.key}
              onPress={() => scrollToSection(it)}
              className={`px-4 py-2 rounded-xl mr-2 ${
                active === it.key ? "bg-[#0d3778]" : "bg-slate-100"
              }`}
            >
              <Text
                className={`text-sm font-bold ${
                  active === it.key ? "text-white" : "text-[#0d3778]"
                }`}
              >
                {it.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Content */}
      <ScrollView
        ref={scrollRef}
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 30 }}
      >
        {/* General */}
        <View
          ref={secGeneralRef}
          className="bg-white border border-slate-200 rounded-2xl p-4"
        >
          <Text className="text-lg font-black text-[#0d3778]">
            General Settings
          </Text>

          <Card title="Platform Information">
            <ReadOnlyRow
              label="Support Email"
              value={form.platformInfo.supportEmail}
            />
            <ReadOnlyRow
              label="Contact Number"
              value={form.platformInfo.contactNumber}
            />
            <ReadOnlyRow
              label="Platform Status"
              value={form.platformInfo.platformStatus}
            />
            <ReadOnlyRow
              label="Default Currency"
              value={form.platformInfo.defaultCurrency}
            />
          </Card>

          <Card title="Operating Hours">
            <ReadOnlyRow
              label="Support Hours"
              value={form.operatingHours.supportHours}
            />
            <ReadOnlyRow
              label="Timezone"
              value={form.operatingHours.timezone}
            />
          </Card>
        </View>

        {/* Notifications */}
        <View
          ref={secNotificationsRef}
          className="bg-white border border-slate-200 rounded-2xl p-4 mt-4"
        >
          <Text className="text-lg font-black text-[#0d3778]">
            Notification Settings
          </Text>
          {loadingUser && (
            <Text className="text-sm text-slate-500 mt-2">Loading...</Text>
          )}

          <View className="mt-4">
            <ToggleRow
              title="Email Notifications"
              subtitle="Receive notifications via email"
              value={form.notifications.email}
              onChange={async (v) => {
                setForm((p) => ({
                  ...p,
                  notifications: { ...p.notifications, email: v },
                }));

                try {
                  await updateEmailNotify(v);
                  Alert.alert("Updated", "Email notification updated ✅");
                } catch (err) {
                  // rollback
                  setForm((p) => ({
                    ...p,
                    notifications: { ...p.notifications, email: !v },
                  }));
                  Alert.alert("Error", "Update failed");
                }
              }}
            />
          </View>
        </View>

        {/* Security */}
        <View
          ref={secSecurityRef}
          className="bg-white border border-slate-200 rounded-2xl p-4 mt-4"
        >
          <Text className="text-lg font-black text-[#0d3778]">
            Security and Privacy
          </Text>

          <Card>
            <ReadOnlyRow
              label="Two-Factor Authentication"
              value={form.security.twoFactorEnabled ? "Enabled" : "Disabled"}
            />
            <ReadOnlyRow
              label="Session Timeout (minutes)"
              value={String(form.security.sessionTimeoutMinutes)}
            />
            <ReadOnlyRow
              label="Minimum Password Length"
              value={String(form.security.minPasswordLength)}
            />
            <ReadOnlyRow
              label="Data Retention Period (days)"
              value={String(form.security.dataRetentionDays)}
            />
          </Card>
        </View>

        {/* Terms */}
        <View
          ref={secTermsRef}
          className="bg-white border border-slate-200 rounded-2xl p-4 mt-4"
        >
          <Text className="text-lg font-black text-[#0d3778]">
            Terms and Policies
          </Text>

          <Card>
            <ReadOnlyBlock
              label="Terms of Service"
              value={`By using this rental car platform, you agree to provide accurate information and use vehicles responsibly. Vehicles must be returned on time and in good condition.

The platform connects customers and vehicle owners and is not responsible for accidents, damages, or violations during rentals. Breaking rules may lead to account suspension.`}
            />
            <ReadOnlyBlock
              label="Privacy Policy"
              value={`We collect basic information like name, contact details, and booking data to manage rentals and payments.

Your data is kept secure and used only for platform services, safety, and support. We do not sell your personal information.`}
            />
            <ReadOnlyBlock
              label="Cancellation Policy"
              value={`Cancel 24+ hours before pickup → Full refund
Cancel 12–24 hours before → 50% refund
Cancel under 12 hours → No refund`}
            />
          </Card>
        </View>

        {/* Localization */}
        <View
          ref={secLocalizationRef}
          className="bg-white border border-slate-200 rounded-2xl p-4 mt-4"
        >
          <Text className="text-lg font-black text-[#0d3778]">
            Localization
          </Text>

          <Card>
            <ReadOnlyRow
              label="Default Language"
              value={form.localization.defaultLanguage}
            />
            <ReadOnlyRow
              label="Default Currency"
              value={form.localization.defaultCurrency}
            />
            <ReadOnlyRow
              label="Date Format"
              value={form.localization.dateFormat}
            />
            <ReadOnlyRow
              label="Distance Unit"
              value={form.localization.distanceUnit}
            />
          </Card>
        </View>

        {/* Payment */}
        <View
          ref={secPaymentRef}
          className="bg-white border border-slate-200 rounded-2xl p-4 mt-4"
        >
          <Text className="text-lg font-black text-[#0d3778]">
            Payment Settings
          </Text>

          <Card>
            <ReadOnlyRow
              label="Platform Commission Rate (%)"
              value={String(form.payment.platformCommissionRate)}
            />
            <ReadOnlyRow
              label="Minimum Booking Amount (LKR)"
              value={String(form.payment.minBookingAmount)}
            />

            <Text className="text-sm font-black text-[#0d3778] mt-4 mb-2">
              Accepted Payment Methods
            </Text>

            {form.payment.acceptedPaymentMethods.map((m) => (
              <Chip key={m} text={m} />
            ))}
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}

// ---------- components ----------

function Card({ title, children }) {
  return (
    <View className="mt-4 border border-slate-200 rounded-2xl p-4 bg-white">
      {title ? (
        <Text className="text-sm font-black text-[#0d3778]">{title}</Text>
      ) : null}
      <View className={title ? "mt-3" : ""}>{children}</View>
    </View>
  );
}

function ReadOnlyRow({ label, value }) {
  return (
    <View className="mt-3">
      <Text className="text-sm font-bold text-slate-700 mb-2">{label}</Text>
      <View className="px-3 py-3 rounded-xl border border-slate-300 bg-slate-100">
        <Text className="text-slate-700 font-semibold">{value ?? "—"}</Text>
      </View>
    </View>
  );
}

function ReadOnlyBlock({ label, value }) {
  const paragraphs = String(value || "—").split("\n");
  return (
    <View className="mt-3">
      <Text className="text-sm font-bold text-slate-700 mb-2">{label}</Text>
      <View className="px-3 py-3 rounded-xl border border-slate-300 bg-slate-100">
        {paragraphs.map((t, i) => (
          <Text key={i} className={`text-slate-700 ${i === 0 ? "" : "mt-2"}`}>
            {t}
          </Text>
        ))}
      </View>
    </View>
  );
}

function Chip({ text }) {
  return (
    <View className="border border-slate-200 rounded-2xl p-4 bg-slate-50 mt-2">
      <Text className="text-sm font-bold text-slate-700">{text}</Text>
    </View>
  );
}

function ToggleRow({ title, subtitle, value, onChange }) {
  return (
    <View className="border border-slate-200 rounded-2xl p-4 flex-row items-center justify-between">
      <View className="flex-1 pr-3">
        <Text className="text-sm font-black text-slate-900">{title}</Text>
        <Text className="text-xs text-slate-500 mt-1">{subtitle}</Text>
      </View>

      {/* Switch is native for RN */}
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "#cbd5e1", true: "#34d399" }}
        thumbColor={"#ffffff"}
      />
    </View>
  );
}
