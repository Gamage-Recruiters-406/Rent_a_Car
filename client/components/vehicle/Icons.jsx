import React from "react";
import { Feather } from "@expo/vector-icons";

const C = "#0d3778";
const S = 18;

export const SettingsIcon = () => (
  <Feather name="settings" size={S} color={C} />
);

export const NotebookIcon = () => <Feather name="book" size={S} color={C} />;

export const VehicleIcon = () => <Feather name="truck" size={S} color={C} />;

export const CalendarIcon = () => (
  <Feather name="calendar" size={S} color={C} />
);

export const FuelStationIcon = () => (
  <Feather name="droplet" size={S} color={C} />
);

export const WorldIcon = () => <Feather name="map-pin" size={S} color={C} />;
