import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { roomApi, bookingApi, paymentApi } from "@/api/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/toaster";

import { StepIndicator } from "./newbooking/step-indicator";
import { DatesStep } from "./newbooking/dates-step";
import { RoomStep } from "./newbooking/room-step";
import { GuestInfoStep, type GuestForm } from "./newbooking/guest-info-steps";
import { PaymentStep, type PayType } from "./newbooking/payment-step";

export default function NewBookingPage() {
  const navigate = useNavigate();
  const { hotelId } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [dates, setDates] = useState({ checkIn: "", checkOut: "" });
  const [guest, setGuest] = useState<GuestForm>({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    adults: "1",
    children: "0",
    specialRequests: "",
  });
  const [payType, setPayType] = useState<PayType>("ONLINE");
  const [payNote, setPayNote] = useState("");
  const [availableRooms, setAvailableRooms] = useState<any[]>([]);
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  const nights =
    dates.checkIn && dates.checkOut
      ? Math.ceil(
          (new Date(dates.checkOut).getTime() -
            new Date(dates.checkIn).getTime()) /
            86400000,
        )
      : 0;

  const { mutate: checkAvailability, isPending: checking } = useMutation({
    mutationFn: () =>
      roomApi.checkAvailability(hotelId!, {
        checkIn: new Date(dates.checkIn).toISOString(),
        checkOut: new Date(dates.checkOut).toISOString(),
      }),
    onSuccess: (res) => {
      setAvailableRooms(res.data?.data || res.data || []);
      setStep(2);
    },
    onError: () => toast.error("Error checking availability"),
  });

  const { mutate: createBooking, isPending: bookingPending } = useMutation({
    mutationFn: () =>
      bookingApi.create({
        hotelId: hotelId!,
        roomId: selectedRoom.id,
        ...guest,
        adults: parseInt(guest.adults),
        children: parseInt(guest.children),
        checkIn: new Date(dates.checkIn).toISOString(),
        checkOut: new Date(dates.checkOut).toISOString(),
      }),
    onSuccess: (res) => {
      setCreatedBooking(res.data?.data || res.data);
      setStep(4);
    },
    onError: (e: any) =>
      toast.error("Booking failed", e?.response?.data?.message),
  });

  const { mutate: recordManual, isPending: recordingPay } = useMutation({
    mutationFn: () =>
      paymentApi.recordManual({
        bookingId: createdBooking.id,
        paymentMethod: payType as any,
        note: payNote,
      }),
    onSuccess: () => {
      toast.success(
        "Booking created!",
        "Manual payment submitted for approval",
      );
      navigate(`/bookings/${createdBooking.id}`);
    },
    onError: (e: any) =>
      toast.error("Payment record failed", e?.response?.data?.message),
  });

  const { mutate: payOnline, isPending: payingOnline } = useMutation({
    mutationFn: () =>
      paymentApi.initiatePaystack({ bookingId: createdBooking.id }),
    onSuccess: (res) => {
      const d = res.data?.data || res.data;
      if (d?.authorizationUrl) window.open(d.authorizationUrl, "_blank");
      toast.success(
        "Payment window opened",
        `Ref: ${createdBooking?.bookingRef}`,
      );
      navigate(`/bookings/${createdBooking.id}`);
    },
    onError: () => toast.error("Failed to initiate payment"),
  });

  function handlePaymentStep() {
    if (payType === "ONLINE") payOnline();
    else recordManual();
  }

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">New Booking</h1>
        <StepIndicator step={step} />
      </div>

      {step === 1 && (
        <DatesStep
          dates={dates}
          onDatesChange={setDates}
          nights={nights}
          onCheckAvailability={() => checkAvailability()}
          checking={checking}
        />
      )}

      {step === 2 && (
        <RoomStep
          availableRooms={availableRooms}
          selectedRoom={selectedRoom}
          onSelectRoom={setSelectedRoom}
          nights={nights}
          onBack={() => setStep(1)}
          onContinue={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <GuestInfoStep
          guest={guest}
          onGuestChange={setGuest}
          selectedRoom={selectedRoom}
          nights={nights}
          onBack={() => setStep(2)}
          onCreate={() => createBooking()}
          creating={bookingPending}
        />
      )}

      {step === 4 && createdBooking && (
        <PaymentStep
          createdBooking={createdBooking}
          guestName={guest.guestName}
          selectedRoom={selectedRoom}
          nights={nights}
          payType={payType}
          onPayTypeChange={setPayType}
          payNote={payNote}
          onPayNoteChange={setPayNote}
          onSubmit={handlePaymentStep}
          onSkip={() => navigate(`/bookings/${createdBooking.id}`)}
          processing={recordingPay || payingOnline}
        />
      )}
    </div>
  );
}
