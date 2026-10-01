// src/pages/bookings/new/RoomStep.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/common";
import { formatCurrency } from "@/lib/utils";

interface Props {
  availableRooms: any[];
  selectedRoom: any;
  onSelectRoom: (room: any) => void;
  nights: number;
  onBack: () => void;
  onContinue: () => void;
}

export function RoomStep({
  availableRooms,
  selectedRoom,
  onSelectRoom,
  nights,
  onBack,
  onContinue,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{availableRooms.length} rooms available</p>
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Change Dates
        </Button>
      </div>

      {availableRooms.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No rooms available for selected dates
          </CardContent>
        </Card>
      ) : (
        availableRooms.map((room: any) => (
          <Card
            key={room.id}
            className={`cursor-pointer transition-all ${selectedRoom?.id === room.id ? "ring-2 ring-blue-500" : "hover:shadow-md"}`}
            onClick={() => onSelectRoom(room)}
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  Room {room.roomNumber} – {room.roomType}
                </p>
                <p className="text-sm text-muted-foreground">
                  Capacity: {room.capacity} · Floor {room.floor || "—"}
                </p>
                {room.amenities?.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {room.amenities.slice(0, 4).join(" · ")}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="font-bold text-blue-600">
                  {formatCurrency(room.pricePerNight)}
                  <span className="text-xs font-normal text-muted-foreground">
                    /night
                  </span>
                </p>
                <p className="text-sm font-semibold mt-0.5">
                  {formatCurrency(Number(room.pricePerNight) * nights)} total
                </p>
              </div>
            </CardContent>
          </Card>
        ))
      )}

      <Button onClick={onContinue} disabled={!selectedRoom} className="w-full">
        Continue with{" "}
        {selectedRoom ? `Room ${selectedRoom.roomNumber}` : "selected room"}
      </Button>
    </div>
  );
}
