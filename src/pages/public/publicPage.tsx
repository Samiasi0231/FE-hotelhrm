// src/pages/public/PublicHotelPage.tsx — FULL REPLACEMENT
// Split into hooks/, components/, shared/ — this file wires data and renders.

import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { publicApi } from "@/api/services";
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Globe,
  Sparkles,
  BedDouble,
  Clock,
  Loader2,
  Hotel,
} from "lucide-react";

import { AMENITY_ICONS, AMENITY_LABELS } from "@/lib/constant";
import { nightsBetween, todayStr, tomorrowStr } from "@/lib/utils";
import { DateSearchBar } from "./components/data-search-bar";
import { RoomCard } from "./components/booking-modal.tsx/room-card";
import { BookingModal } from "./components/booking-modal.tsx";

export default function PublicHotelPage() {
  const { slug } = useParams<{ slug: string }>();
  const [hotel, setHotel] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [checkIn, setCheckIn] = useState(todayStr());
  const [checkOut, setCheckOut] = useState(tomorrowStr());
  const [searchedRooms, setSearchedRooms] = useState<any[] | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [bookingRoom, setBookingRoom] = useState<any>(null);
  const roomsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!slug) return;
    publicApi
      .getHotel(slug)
      .then(({ data }) => setHotel(data?.data ?? data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleSearch = async (ci: string, co: string) => {
    setCheckIn(ci);
    setCheckOut(co);
    setSearchLoading(true);
    setHasSearched(true);
    try {
      const { data } = await publicApi.getAvailableRooms(slug!, ci, co);
      setSearchedRooms(data?.data ?? data);
      setTimeout(
        () =>
          roomsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
        100,
      );
    } catch {
      setSearchedRooms([]);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-slate-400 text-sm">Loading hotel...</p>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
            <Hotel className="w-8 h-8 text-slate-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Hotel not found
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              This link may be invalid or the hotel may have been removed.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const policies = (hotel.policies as any) ?? {};
  const displayRooms = hasSearched
    ? (searchedRooms ?? [])
    : (hotel.rooms ?? []);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="relative h-72 sm:h-[420px] bg-slate-900 overflow-hidden">
        {hotel.coverImage ? (
          <img
            src={hotel.coverImage}
            alt={hotel.name}
            className="w-full h-full object-cover opacity-50"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900" />
        )}

        <div className="absolute top-0 inset-x-0 px-5 sm:px-8 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/15 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
            <Hotel className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm tracking-wide">
            HotelMS
          </span>
        </div>

        <div className="absolute bottom-0 inset-x-0 px-5 sm:px-8 py-8 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <div className="max-w-4xl mx-auto flex items-end gap-4">
            {hotel.logo && (
              <img
                src={hotel.logo}
                alt="logo"
                className="w-16 h-16 rounded-2xl border-2 border-white/30 object-contain bg-white/10 backdrop-blur-sm p-1 flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-1">
                <h1 className="text-white text-2xl sm:text-4xl font-black tracking-tight">
                  {hotel.name}
                </h1>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: hotel.starRating ?? 3 }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 text-yellow-400 fill-yellow-400"
                    />
                  ))}
                </div>
              </div>
              {hotel.tagline && (
                <p className="text-blue-200 text-sm italic mb-1">
                  "{hotel.tagline}"
                </p>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-300 text-sm">
                  {hotel.city}, {hotel.state}, {hotel.country}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        <DateSearchBar
          checkIn={checkIn}
          checkOut={checkOut}
          onSearch={handleSearch}
          loading={searchLoading}
        />

        <div className="grid grid-cols-3 gap-3">
          {[
            {
              icon: Phone,
              label: "Call us",
              value: hotel.phone,
              href: `tel:${hotel.phone}`,
            },
            {
              icon: Mail,
              label: "Email us",
              value: hotel.email,
              href: `mailto:${hotel.email}`,
            },
            {
              icon: Clock,
              label: "Check-in",
              value: policies.checkInTime || "2:00 PM",
            },
          ].map(({ icon: Icon, label, value, href }) => (
            <div
              key={label}
              className="bg-white rounded-2xl border border-slate-200 p-3.5"
            >
              <Icon className="w-4 h-4 text-blue-600 mb-2" />
              <p className="text-xs text-slate-400 font-medium mb-0.5">
                {label}
              </p>
              {href ? (
                <a
                  href={href}
                  className="text-xs font-bold text-slate-800 hover:text-blue-600 truncate block transition-colors"
                >
                  {value}
                </a>
              ) : (
                <p className="text-xs font-bold text-slate-800">{value}</p>
              )}
            </div>
          ))}
        </div>

        {hotel.description && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-black text-slate-900 text-lg mb-3">
              About this hotel
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              {hotel.description}
            </p>
          </div>
        )}

        {hotel.amenities?.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-black text-slate-900 text-lg mb-4">
              Hotel Amenities
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {hotel.amenities.map((a: string) => {
                const Icon = AMENITY_ICONS[a] ?? Sparkles;
                return (
                  <div
                    key={a}
                    className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100"
                  >
                    <Icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-700">
                      {AMENITY_LABELS[a] ?? a}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div ref={roomsRef}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-black text-slate-900 text-xl">
                {hasSearched ? "Available Rooms" : "Our Rooms"}
              </h2>
              {hasSearched && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {searchedRooms?.length ?? 0} room
                  {(searchedRooms?.length ?? 0) !== 1 ? "s" : ""} available ·{" "}
                  {new Date(checkIn).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  →{" "}
                  {new Date(checkOut).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  ({nightsBetween(checkIn, checkOut)} nights)
                </p>
              )}
            </div>
            {hasSearched && (
              <button
                onClick={() => {
                  setHasSearched(false);
                  setSearchedRooms(null);
                }}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Show all →
              </button>
            )}
          </div>

          {searchLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-slate-400 text-sm">
                  Checking availability...
                </p>
              </div>
            </div>
          ) : displayRooms.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <BedDouble className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <h3 className="font-bold text-slate-700 mb-1">
                {hasSearched
                  ? "No rooms available for these dates"
                  : "No rooms listed yet"}
              </h3>
              <p className="text-slate-400 text-sm">
                {hasSearched
                  ? "Try different dates or contact the hotel."
                  : "Please contact the hotel for availability."}
              </p>
              {hasSearched && (
                <button
                  onClick={() => {
                    setHasSearched(false);
                    setSearchedRooms(null);
                  }}
                  className="mt-4 text-sm text-blue-600 hover:underline font-medium"
                >
                  View all rooms →
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {displayRooms.map((room: any) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  hotel={hotel}
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onBook={setBookingRoom}
                />
              ))}
            </div>
          )}
        </div>

        {(policies.checkInTime ||
          policies.checkOutTime ||
          policies.cancellationPolicy) && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="font-black text-slate-900 text-lg mb-4">
              Hotel Policies
            </h2>
            <div className="space-y-0 divide-y divide-slate-100">
              {policies.checkInTime && (
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 text-sm">Check-in from</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {policies.checkInTime}
                  </span>
                </div>
              )}
              {policies.checkOutTime && (
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 text-sm">Check-out by</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {policies.checkOutTime}
                  </span>
                </div>
              )}
              {policies.petsAllowed !== undefined && (
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 text-sm">Pets</span>
                  <span className="text-sm">
                    {policies.petsAllowed ? "✅ Allowed" : "❌ Not allowed"}
                  </span>
                </div>
              )}
              {policies.smokingAllowed !== undefined && (
                <div className="flex justify-between py-3">
                  <span className="text-slate-500 text-sm">Smoking</span>
                  <span className="text-sm">
                    {policies.smokingAllowed ? "✅ Allowed" : "❌ Not allowed"}
                  </span>
                </div>
              )}
              {policies.cancellationPolicy && (
                <div className="py-3">
                  <p className="text-slate-500 text-sm mb-1">
                    Cancellation Policy
                  </p>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    {policies.cancellationPolicy}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {hotel.website && (
          <div className="text-center pb-2">
            <a
              href={hotel.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
            >
              <Globe className="w-4 h-4" /> Visit official website
            </a>
          </div>
        )}
      </div>

      <footer className="border-t border-slate-200 py-6 text-center space-y-1">
        <p className="text-xs text-slate-400">
          Powered by <span className="font-bold text-slate-600">HotelMS</span>
        </p>
        <a
          href={`mailto:${hotel.email}`}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          {hotel.email}
        </a>
      </footer>

      {bookingRoom && (
        <BookingModal
          room={bookingRoom}
          hotel={hotel}
          checkIn={checkIn}
          checkOut={checkOut}
          onClose={() => setBookingRoom(null)}
        />
      )}
    </div>
  );
}
