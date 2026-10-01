import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { hotelApi, roomApi } from "@/api/services";
import { formatCurrency, getStatusColor } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BedDouble,
  Users,
  DollarSign,
  Edit,
  ChevronLeft,
  ChevronRight,
  Building2,
  Wifi,
  Wind,
  Tv,
  GlassWater,
  Shield,
  Sunset,
  Waves,
  Bath,
  ConciergeBell,
  Car,
  Dumbbell,
  Droplets,
  Star,
} from "lucide-react";

const AMENITY_ICONS: Record<string, React.ReactNode> = {
  WiFi: <Wifi className="w-4 h-4" />,
  AC: <Wind className="w-4 h-4" />,
  TV: <Tv className="w-4 h-4" />,
  "Mini Bar": <GlassWater className="w-4 h-4" />,
  Safe: <Shield className="w-4 h-4" />,
  Balcony: <Sunset className="w-4 h-4" />,
  "Ocean View": <Waves className="w-4 h-4" />,
  Bathtub: <Bath className="w-4 h-4" />,
  "Room Service": <ConciergeBell className="w-4 h-4" />,
  Parking: <Car className="w-4 h-4" />,
  "Gym Access": <Dumbbell className="w-4 h-4" />,
  "Pool Access": <Droplets className="w-4 h-4" />,
};

// ─── Image Gallery ────────────────────────────────────────────────────────────
// Cloudinary URLs are absolute (https://res.cloudinary.com/...) — used directly.

function ImageGallery({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-72 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
        <div className="text-center text-slate-400">
          <BedDouble className="w-12 h-12 mx-auto mb-2 opacity-40" />
          <p className="text-sm">No photos yet</p>
        </div>
      </div>
    );
  }

  function prev() {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }
  function next() {
    setCurrent((c) => (c + 1) % images.length);
  }

  return (
    <>
      <div className="space-y-2">
        {/* Hero image */}
        <div
          className="relative w-full rounded-2xl overflow-hidden cursor-pointer bg-slate-100"
          style={{ paddingBottom: "56.25%" }}
          onClick={() => setLightbox(true)}
        >
          <img
            src={images[current]}
            alt={`Room photo ${current + 1}`}
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            {current + 1} / {images.length}
          </div>
          <div className="absolute bottom-3 left-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
            Tap to view full size
          </div>
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  i === current
                    ? "border-blue-500 opacity-100"
                    : "border-transparent opacity-60 hover:opacity-90"
                }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl font-light w-10 h-10 flex items-center justify-center hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setLightbox(false)}
          >
            ✕
          </button>
          <div
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[current]}
              alt="Room"
              className="w-full max-h-[80vh] object-contain rounded-xl"
            />
            {images.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RoomDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: hotel } = useQuery({
    queryKey: ["my-hotel"],
    queryFn: () => hotelApi.getMyHotel().then((r) => r.data?.data || r.data),
  });

  const { data: room, isLoading } = useQuery({
    queryKey: ["room", id],
    queryFn: () =>
      roomApi.getById(hotel!.id, id!).then((r) => r.data?.data || r.data),
    enabled: !!hotel?.id && !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-4 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-lg w-48" />
        <div className="h-72 bg-slate-200 rounded-2xl" />
        <div className="h-48 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!room) return <p className="text-muted-foreground">Room not found</p>;

  return (
    <article className="max-w-3xl space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/rooms">
              <button className="text-sm text-muted-foreground hover:text-slate-700 flex items-center gap-1 transition-colors">
                <ChevronLeft className="w-4 h-4" /> All Rooms
              </button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">
            Room {room.roomNumber}
          </h1>
          <p className="text-lg text-slate-500 font-medium mt-0.5">
            {room.roomType}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-sm px-3 py-1.5 rounded-full font-semibold ${getStatusColor(room.status)}`}
          >
            {room.status}
          </span>
          <Link to={`/rooms/${id}/edit`}>
            <Button size="sm">
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Image Gallery */}
      <ImageGallery images={room.images ?? []} />

      {/* Price + quick stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 bg-blue-600 text-white rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-blue-200 text-sm font-medium">
            <DollarSign className="w-4 h-4" />
            Price per Night
          </div>
          <p className="text-2xl font-bold mt-2">
            {formatCurrency(room.pricePerNight)}
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Users className="w-4 h-4" />
            Capacity
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {room.capacity}{" "}
            <span className="text-base font-normal text-slate-500">guests</span>
          </p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Building2 className="w-4 h-4" />
            Floor
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {room.floor ?? "—"}
          </p>
        </div>
      </div>

      {/* Description */}
      {room.description && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            About this room
          </h2>
          <p className="text-slate-600 leading-relaxed">{room.description}</p>
        </div>
      )}

      {/* Amenities */}
      {room.amenities?.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            What's included
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {room.amenities.map((a: string) => (
              <div
                key={a}
                className="flex items-center gap-3 bg-slate-50 hover:bg-blue-50 rounded-xl px-4 py-3 transition-colors"
              >
                <span className="text-blue-600">
                  {AMENITY_ICONS[a] ?? <Star className="w-4 h-4" />}
                </span>
                <span className="text-sm font-medium text-slate-700">{a}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Hotel info */}
      {room.hotel && (
        <div className="border border-slate-200 rounded-2xl p-5 flex items-center gap-4 bg-slate-50">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Listed by
            </p>
            <p className="font-semibold text-slate-900">{room.hotel.name}</p>
          </div>
        </div>
      )}
    </article>
  );
}
