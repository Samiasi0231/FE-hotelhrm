// src/pages/public/components/BookingModal/index.tsx
import { useState, useCallback } from "react";
import { publicApi } from "@/api/services";
import { loadPaystackScript } from "@/lib/utils";
import { useCountdown } from "../../../../hooks/use-count-down";
import { HOLD_MINUTES } from "../../../../lib/constant";
import { nightsBetween } from "../../../../lib/utils";
import { X } from "lucide-react";
import { ProcessingStep } from "./processing-steps";
import { PayingStep } from "./paying-step";
import { SuccessStep } from "./success-step";
import { ErrorStep } from "./error-step";
import { BookingForm } from "./booking-form";

export type ModalStep = "form" | "submitting" | "paying" | "verifying" | "success" | "error";

interface Props {
  room: any;
  hotel: any;
  checkIn: string;
  checkOut: string;
  onClose: () => void;
}

export function BookingModal({ room, hotel, checkIn, checkOut, onClose }: Props) {
  const [form, setForm] = useState({
    guestName: "", guestEmail: "", guestPhone: "",
    adults: 1, children: 0, specialRequests: "",
    checkIn, checkOut,
  });
  const [step, setStep] = useState<ModalStep>("form");
  const [booking, setBooking] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [bookingCreatedAt, setBookingCreatedAt] = useState<Date | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const nights = nightsBetween(form.checkIn, form.checkOut);
  const total = nights * Number(room.pricePerNight);

  const { expired } = useCountdown(bookingCreatedAt, HOLD_MINUTES);

  const openPaystackPopup = useCallback(
    async (accessCode: string, publicKey: string, reference: string, email: string, amountKobo: number) => {
      try {
        await loadPaystackScript();
      } catch {
        setErrorMsg("Could not load payment gateway. Please try again.");
        setStep("error");
        return;
      }

      setStep("paying");

      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email,
        amount: amountKobo,
        ref: reference,
        currency: "NGN",
        access_code: accessCode,
        // Must stay plain functions (not async) — Paystack checks toString() output.
        onClose: function () {
          setStep("form");
        },
        callback: function (response: { reference: string }) {
          setStep("verifying");
          publicApi
            .verifyPayment(response.reference)
            .then(function () {
              setStep("success");
            })
            .catch(function (err: any) {
              const msg = err?.response?.data?.message;
              setErrorMsg(msg || "Payment verification failed. Please contact the hotel.");
              setStep("error");
            });
        },
      });

      handler.openIframe();
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (expired && booking) {
      setErrorMsg("Your 30-minute hold has expired. Please close this and book again.");
      setStep("error");
      return;
    }

    setStep("submitting");

    try {
      if (booking && paymentData) {
        await openPaystackPopup(paymentData.accessCode, paymentData.publicKey, paymentData.reference, form.guestEmail, paymentData.amountKobo);
        return;
      }

      const response = await publicApi.createBooking(hotel.slug, {
        hotelId: hotel.id,
        roomId: room.id,
        guestName: form.guestName,
        guestEmail: form.guestEmail,
        guestPhone: form.guestPhone,
        checkIn: form.checkIn,
        checkOut: form.checkOut,
        adults: form.adults,
        children: form.children,
        specialRequests: form.specialRequests || undefined,
      });

      const body = response.data;
      const payload = body?.data ?? body;
      const bookingData = payload?.booking;
      const paymentInfo = payload?.payment;

      if (!bookingData || !paymentInfo) {
        throw new Error("Invalid response from server");
      }

      setBooking(bookingData);
      setPaymentData(paymentInfo);
      setBookingCreatedAt(new Date());

      await openPaystackPopup(paymentInfo.accessCode, paymentInfo.publicKey, paymentInfo.reference, form.guestEmail, paymentInfo.amountKobo);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? err.message;
      setErrorMsg(Array.isArray(msg) ? msg.join(", ") : msg || "Booking failed. Please try again.");
      setStep("error");
    }
  };

  const handleRetry = () => {
    setBooking(null);
    setPaymentData(null);
    setBookingCreatedAt(null);
    setErrorMsg("");
    setStep("form");
  };

  const canClose = step !== "paying" && step !== "verifying" && step !== "submitting";

  const headerTitle =
    step === "success" ? "Booking Confirmed! 🎉"
    : step === "paying" ? "Complete Payment"
    : step === "verifying" ? "Verifying Payment..."
    : `Book ${room.roomType}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
          <div>
            <h2 className="font-bold text-slate-900 text-lg">{headerTitle}</h2>
            {(step === "form" || step === "submitting") && (
              <p className="text-xs text-slate-500 mt-0.5">Room {room.roomNumber} · {hotel.name}</p>
            )}
          </div>
          {canClose && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {(step === "submitting" || step === "verifying") && <ProcessingStep step={step} />}
        {step === "paying" && <PayingStep bookingCreatedAt={bookingCreatedAt} />}
        {step === "success" && booking && (
          <SuccessStep booking={booking} hotel={hotel} room={room} form={form} nights={nights} total={total} onClose={onClose} />
        )}
        {step === "error" && <ErrorStep errorMsg={errorMsg} onClose={onClose} onRetry={handleRetry} />}
        {step === "form" && (
          <BookingForm
            form={form}
            onFormChange={setForm}
            room={room}
            nights={nights}
            total={total}
            booking={booking}
            expired={expired}
            bookingCreatedAt={bookingCreatedAt}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}