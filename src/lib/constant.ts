// src/pages/public/shared/constants.ts
import {
  Wifi, Car, Dumbbell, Waves, UtensilsCrossed, Wind, Coffee, Sparkles,
  BedDouble, CreditCard, Shield, Star,
} from "lucide-react";

export const AMENITY_ICONS: Record<string, any> = {
  wifi: Wifi, parking: Car, gym: Dumbbell, pool: Waves,
  restaurant: UtensilsCrossed, ac: Wind, breakfast: Coffee, spa: Sparkles,
  WiFi: Wifi, AC: Wind, TV: BedDouble, Parking: Car, Gym: Dumbbell,
  Pool: Waves, Restaurant: UtensilsCrossed, Breakfast: Coffee, Spa: Sparkles,
  "Mini Bar": CreditCard, Safe: Shield, Balcony: Star, "Ocean View": Star,
  Bathtub: Sparkles, "Room Service": Coffee, "Gym Access": Dumbbell, "Pool Access": Waves,
};

export const AMENITY_LABELS: Record<string, string> = {
  wifi: "Free WiFi", parking: "Parking", gym: "Gym", pool: "Swimming Pool",
  restaurant: "Restaurant", ac: "Air Conditioning", breakfast: "Breakfast", spa: "Spa",
};

export const HOLD_MINUTES = 30;