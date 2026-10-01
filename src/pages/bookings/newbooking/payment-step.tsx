import { Loader2, CreditCard, Banknote, CheckCircle2 } from "lucide-react";
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

export type PayType = "ONLINE" | "CASH" | "POS" | "BANK_TRANSFER";

const PAY_OPTIONS: { type: PayType; icon: any; label: string; desc: string }[] =
  [
    {
      type: "ONLINE",
      icon: CreditCard,
      label: "Pay Online",
      desc: "Send Paystack link to guest",
    },
    {
      type: "CASH",
      icon: Banknote,
      label: "Cash",
      desc: "Record cash payment now",
    },
    {
      type: "POS",
      icon: CreditCard,
      label: "POS Terminal",
      desc: "Card payment on POS",
    },
    {
      type: "BANK_TRANSFER",
      icon: Banknote,
      label: "Bank Transfer",
      desc: "Guest paid via bank transfer",
    },
  ];

interface Props {
  createdBooking: any;
  guestName: string;
  selectedRoom: any;
  nights: number;
  payType: PayType;
  onPayTypeChange: (type: PayType) => void;
  payNote: string;
  onPayNoteChange: (note: string) => void;
  onSubmit: () => void;
  onSkip: () => void;
  processing: boolean;
}

export function PaymentStep({
  createdBooking,
  guestName,
  selectedRoom,
  nights,
  payType,
  onPayTypeChange,
  payNote,
  onPayNoteChange,
  onSubmit,
  onSkip,
  processing,
}: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Booking Created — Select Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm space-y-1">
          <p className="font-bold text-green-800 font-mono text-base">
            {createdBooking.bookingRef}
          </p>
          <p className="text-green-700">
            {guestName} · Room {selectedRoom?.roomNumber} · {nights} nights
          </p>
          <p className="text-green-700 font-bold text-base">
            Total:{" "}
            {formatCurrency(Number(selectedRoom?.pricePerNight) * nights)}
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-700">
            How is the guest paying?
          </p>
          <div className="grid grid-cols-2 gap-3">
            {PAY_OPTIONS.map(({ type, icon: Icon, label, desc }) => (
              <button
                key={type}
                onClick={() => onPayTypeChange(type)}
                className={`p-4 rounded-xl border-2 text-left transition-all space-y-1
                  ${payType === type ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-slate-300"}`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-4 h-4 ${payType === type ? "text-blue-600" : "text-slate-500"}`}
                  />
                  <span
                    className={`text-sm font-bold ${payType === type ? "text-blue-700" : "text-slate-700"}`}
                  >
                    {label}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{desc}</p>
              </button>
            ))}
          </div>
        </div>

        {payType !== "ONLINE" && (
          <div className="space-y-1.5">
            <Label>Reference / Note (optional)</Label>
            <Input
              value={payNote}
              onChange={(e) => onPayNoteChange(e.target.value)}
              placeholder="e.g. POS receipt #4521, teller slip ref..."
            />
          </div>
        )}

        {payType === "ONLINE" ? (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 flex gap-2">
            <CreditCard className="w-4 h-4 flex-shrink-0 mt-0.5" />A Paystack
            payment window will open for the guest to pay online. The booking is
            confirmed automatically once payment succeeds.
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex gap-2">
            <Banknote className="w-4 h-4 flex-shrink-0 mt-0.5" />
            The payment will be submitted for approval. A Director or Admin must
            approve it to confirm this booking.
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <Button
            onClick={onSubmit}
            disabled={processing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {processing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
              </>
            ) : payType === "ONLINE" ? (
              <>
                <CreditCard className="w-4 h-4 mr-2" /> Open Payment Window
              </>
            ) : (
              <>
                <Banknote className="w-4 h-4 mr-2" /> Submit Manual Payment
              </>
            )}
          </Button>
        </div>

        <button
          onClick={onSkip}
          className="w-full text-sm text-slate-400 hover:text-slate-600 text-center"
        >
          Skip — handle payment later
        </button>
      </CardContent>
    </Card>
  );
}
