// src/pages/bookings/new/GuestInfoStep.tsx
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";
import { formatCurrency } from "@/lib/utils";

export interface GuestForm {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  adults: string;
  children: string;
  specialRequests: string;
}

interface Props {
  guest: GuestForm;
  onGuestChange: (guest: GuestForm) => void;
  selectedRoom: any;
  nights: number;
  onBack: () => void;
  onCreate: () => void;
  creating: boolean;
}

export function GuestInfoStep({
  guest,
  onGuestChange,
  selectedRoom,
  nights,
  onBack,
  onCreate,
  creating,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Guest Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 rounded-lg text-sm">
          <p className="font-semibold text-blue-800">
            Room {selectedRoom?.roomNumber} · {nights} nights ·{" "}
            {formatCurrency(Number(selectedRoom?.pricePerNight) * nights)}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Guest Full Name *</Label>
          <Input
            required
            value={guest.guestName}
            onChange={(e) =>
              onGuestChange({ ...guest, guestName: e.target.value })
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input
              required
              type="email"
              value={guest.guestEmail}
              onChange={(e) =>
                onGuestChange({ ...guest, guestEmail: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Phone *</Label>
            <Input
              required
              value={guest.guestPhone}
              onChange={(e) =>
                onGuestChange({ ...guest, guestPhone: e.target.value })
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Adults</Label>
            <Input
              type="number"
              min="1"
              value={guest.adults}
              onChange={(e) =>
                onGuestChange({ ...guest, adults: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Children</Label>
            <Input
              type="number"
              min="0"
              value={guest.children}
              onChange={(e) =>
                onGuestChange({ ...guest, children: e.target.value })
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Special Requests</Label>
          <Input
            value={guest.specialRequests}
            onChange={(e) =>
              onGuestChange({ ...guest, specialRequests: e.target.value })
            }
          />
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} className="flex-1">
            ← Back
          </Button>
          <Button
            onClick={onCreate}
            disabled={
              creating ||
              !guest.guestName ||
              !guest.guestEmail ||
              !guest.guestPhone
            }
            className="flex-1"
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...
              </>
            ) : (
              "Create Booking →"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
