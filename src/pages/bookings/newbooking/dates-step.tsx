// src/pages/bookings/new/DatesStep.tsx
import { Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";

interface Props {
  dates: { checkIn: string; checkOut: string };
  onDatesChange: (dates: { checkIn: string; checkOut: string }) => void;
  nights: number;
  onCheckAvailability: () => void;
  checking: boolean;
}

export function DatesStep({
  dates,
  onDatesChange,
  nights,
  onCheckAvailability,
  checking,
}: Props) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Select Dates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Check In *</Label>
            <Input
              type="date"
              required
              min={today}
              value={dates.checkIn}
              onChange={(e) =>
                onDatesChange({ ...dates, checkIn: e.target.value })
              }
            />
          </div>
          <div className="space-y-1.5">
            <Label>Check Out *</Label>
            <Input
              type="date"
              required
              min={dates.checkIn || today}
              value={dates.checkOut}
              onChange={(e) =>
                onDatesChange({ ...dates, checkOut: e.target.value })
              }
            />
          </div>
        </div>
        {nights > 0 && (
          <p className="text-sm text-blue-600 font-medium">
            {nights} night{nights > 1 ? "s" : ""} selected
          </p>
        )}
        <Button
          onClick={onCheckAvailability}
          disabled={!dates.checkIn || !dates.checkOut || checking}
          className="w-full"
        >
          {checking ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Checking...
            </>
          ) : (
            <>
              <Search className="w-4 h-4 mr-2" /> Check Availability
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
