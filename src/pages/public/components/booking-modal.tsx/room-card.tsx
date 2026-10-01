// src/pages/public/components/RoomCard.tsx
import { ArrowRight, Users, Sparkles } from "lucide-react";
import { ImageGallery } from "@/pages/public/components/image-gallery";
import { AMENITY_ICONS } from "@/lib/constant";
import { formatPrice, nightsBetween } from "@/lib/utils";

interface Props {
  room: any;
  hotel: any;
  checkIn: string;
  checkOut: string;
  onBook: (room: any) => void;
}

export function RoomCard({ room, checkIn, checkOut, onBook }: Props) {
  const nights = nightsBetween(checkIn, checkOut);
  const isAvailable = room.status === "AVAILABLE";
  const total = nights * Number(room.pricePerNight);

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-all hover:shadow-xl ${isAvailable ? "border-slate-200" : "border-slate-100 opacity-60"}`}
    >
      <div className="p-3 pb-0">
        <ImageGallery images={room.images || []} roomType={room.roomType} />
      </div>
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900">{room.roomType}</h3>
              {!isAvailable && (
                <span className="text-xs px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full font-semibold">
                  Unavailable
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Room {room.roomNumber}
              {room.floor ? ` · Floor ${room.floor}` : ""}
            </p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-xl font-black text-blue-600">
              {formatPrice(Number(room.pricePerNight))}
            </p>
            <p className="text-xs text-slate-400">per night</p>
            {nights > 0 && (
              <p className="text-xs font-bold text-slate-600 mt-0.5">
                {formatPrice(total)} total
              </p>
            )}
          </div>
        </div>

        {room.description && (
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
            {room.description}
          </p>
        )}

        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            <Users className="w-3 h-3" /> {room.capacity} guests max
          </span>
          {room.amenities?.slice(0, 3).map((a: string) => {
            const Icon = AMENITY_ICONS[a] ?? Sparkles;
            return (
              <span
                key={a}
                className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100"
              >
                <Icon className="w-3 h-3" /> {a}
              </span>
            );
          })}
          {(room.amenities?.length ?? 0) > 3 && (
            <span className="text-xs text-blue-500 px-2 py-1 font-medium">
              +{room.amenities.length - 3} more
            </span>
          )}
        </div>

        <button
          disabled={!isAvailable}
          onClick={() => onBook(room)}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            isAvailable
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isAvailable ? (
            <>
              {nights > 0
                ? `Book & Pay ${formatPrice(total)}`
                : "Select Dates First"}{" "}
              <ArrowRight className="w-4 h-4" />
            </>
          ) : (
            "Not Available"
          )}
        </button>
      </div>
    </div>
  );
}
