// src/pages/onboarding/OnboardingPage.tsx
// Full multi-step hotel onboarding flow (5 steps)

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingApi } from "@/api/services";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Hotel,
  MapPin,
  Star,
  Phone,
  Mail,
  Globe,
  Sparkles,
  Coffee,
  Wifi,
  Car,
  Dumbbell,
  Wind,
  UtensilsCrossed,
  Waves,
  Clock,
  ChevronRight,
  ChevronLeft,
  Check,
  Loader2,
  Upload,
  Building2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HotelForm {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  starRating: number;
}

interface AmenitiesForm {
  tagline: string;
  amenities: string[];
}

interface PoliciesForm {
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  petsAllowed: boolean;
  smokingAllowed: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const AMENITY_OPTIONS = [
  { id: "wifi", label: "Free WiFi", icon: Wifi },
  { id: "parking", label: "Parking", icon: Car },
  { id: "gym", label: "Gym", icon: Dumbbell },
  { id: "pool", label: "Swimming Pool", icon: Waves },
  { id: "restaurant", label: "Restaurant", icon: UtensilsCrossed },
  { id: "ac", label: "Air Conditioning", icon: Wind },
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "spa", label: "Spa", icon: Sparkles },
];

const STEPS = [
  { num: 1, label: "Hotel Info", icon: Building2 },
  { num: 2, label: "Amenities", icon: Sparkles },
  { num: 3, label: "Policies", icon: Clock },
  { num: 4, label: "Branding", icon: Upload },
  { num: 5, label: "Complete", icon: Check },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {STEPS.map((step, i) => {
        const done = current > step.num;
        const active = current === step.num;
        const Icon = step.icon;
        return (
          <div key={step.num} className="flex items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${done ? "bg-blue-600 border-blue-600" : active ? "bg-white border-blue-600" : "bg-white border-slate-200"}
              `}
              >
                {done ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <Icon
                    className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`}
                  />
                )}
              </div>
              <span
                className={`text-xs font-medium hidden sm:block ${active ? "text-blue-600" : done ? "text-slate-600" : "text-slate-400"}`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-12 sm:w-20 h-0.5 mb-5 mx-1 transition-colors ${current > step.num ? "bg-blue-600" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function FieldGroup({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function Input({
  className = "",
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${className}`}
      {...props}
    />
  );
}

function Textarea({
  className = "",
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={`w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${className}`}
      {...props}
    />
  );
}

// ─── Step 1: Hotel Basic Info ─────────────────────────────────────────────────

function Step1({
  form,
  setForm,
  onNext,
  loading,
}: {
  form: HotelForm;
  setForm: (f: HotelForm) => void;
  onNext: () => void;
  loading: boolean;
}) {
  const f = (k: keyof HotelForm) => ({
    value: form[k] as string,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Tell us about your hotel
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Basic information that guests will see
        </p>
      </div>

      <div className="space-y-4">
        <FieldGroup label="Hotel Name *">
          <Input placeholder="Grand Royale Hotel" required {...f("name")} />
        </FieldGroup>

        <FieldGroup label="Description">
          <Textarea
            placeholder="Describe what makes your hotel special..."
            rows={3}
            {...f("description")}
          />
        </FieldGroup>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldGroup label="Email *">
            <Input
              type="email"
              placeholder="hotel@example.com"
              required
              {...f("email")}
            />
          </FieldGroup>
          <FieldGroup label="Phone *">
            <Input placeholder="+234 800 000 0000" required {...f("phone")} />
          </FieldGroup>
        </div>

        <FieldGroup label="Address *">
          <Input placeholder="123 Victoria Island" required {...f("address")} />
        </FieldGroup>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <FieldGroup label="City *">
            <Input placeholder="Lagos" required {...f("city")} />
          </FieldGroup>
          <FieldGroup label="State *">
            <Input placeholder="Lagos State" required {...f("state")} />
          </FieldGroup>
          <FieldGroup label="Country *">
            <Input placeholder="Nigeria" required {...f("country")} />
          </FieldGroup>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldGroup label="Website">
            <Input placeholder="https://yourhotel.com" {...f("website")} />
          </FieldGroup>
          <FieldGroup label="Star Rating">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setForm({ ...form, starRating: n })}
                  className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                    form.starRating === n
                      ? "bg-yellow-50 border-yellow-400 text-yellow-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {n}★
                </button>
              ))}
            </div>
          </FieldGroup>
        </div>
      </div>

      <Button
        onClick={onNext}
        disabled={
          loading ||
          !form.name ||
          !form.email ||
          !form.phone ||
          !form.address ||
          !form.city ||
          !form.state ||
          !form.country
        }
        className="w-full"
      >
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        Continue <ChevronRight className="w-4 h-4 ml-1" />
      </Button>
    </div>
  );
}

// ─── Step 2: Tagline + Amenities ──────────────────────────────────────────────

function Step2({
  form,
  setForm,
  onNext,
  onBack,
  loading,
}: {
  form: AmenitiesForm;
  setForm: (f: AmenitiesForm) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const toggleAmenity = (id: string) => {
    const next = form.amenities.includes(id)
      ? form.amenities.filter((a) => a !== id)
      : [...form.amenities, id];
    setForm({ ...form, amenities: next });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          What does your hotel offer?
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          A tagline and your key amenities
        </p>
      </div>

      <FieldGroup label="Hotel Tagline">
        <Input
          placeholder="Where luxury meets comfort"
          value={form.tagline}
          onChange={(e) => setForm({ ...form, tagline: e.target.value })}
          maxLength={100}
        />
        <p className="text-xs text-slate-400">
          {form.tagline.length}/100 characters
        </p>
      </FieldGroup>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Amenities
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {AMENITY_OPTIONS.map(({ id, label, icon: Icon }) => {
            const active = form.amenities.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleAmenity(id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  active
                    ? "bg-blue-50 border-blue-500 text-blue-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium text-center leading-tight">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button onClick={onNext} disabled={loading} className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3: Policies ─────────────────────────────────────────────────────────

function Step3({
  form,
  setForm,
  onNext,
  onBack,
  loading,
}: {
  form: PoliciesForm;
  setForm: (f: PoliciesForm) => void;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Hotel policies</h2>
        <p className="text-slate-500 text-sm mt-1">
          Help guests know what to expect
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Check-in Time">
          <Input
            type="time"
            value={form.checkInTime}
            onChange={(e) => setForm({ ...form, checkInTime: e.target.value })}
          />
        </FieldGroup>
        <FieldGroup label="Check-out Time">
          <Input
            type="time"
            value={form.checkOutTime}
            onChange={(e) => setForm({ ...form, checkOutTime: e.target.value })}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Cancellation Policy">
        <Textarea
          placeholder="e.g. Free cancellation up to 48 hours before check-in. After that, 1 night charge applies."
          rows={3}
          value={form.cancellationPolicy}
          onChange={(e) =>
            setForm({ ...form, cancellationPolicy: e.target.value })
          }
        />
      </FieldGroup>

      <div className="flex gap-4">
        {[
          { key: "petsAllowed", label: "🐾 Pets allowed" },
          { key: "smokingAllowed", label: "🚬 Smoking allowed" },
        ].map(({ key, label }) => (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={form[key as keyof PoliciesForm] as boolean}
              onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-700">{label}</span>
          </label>
        ))}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button onClick={onNext} disabled={loading} className="flex-1">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Continue <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 4: Logo Upload ──────────────────────────────────────────────────────

function Step4({
  hotelId,
  onNext,
  onBack,
  loading,
}: {
  hotelId: string;
  onNext: () => void;
  onBack: () => void;
  loading: boolean;
}) {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (logoFile && hotelId) {
      setUploading(true);
      try {
        await onboardingApi.uploadLogo(hotelId, logoFile);
        toast.success("Logo uploaded!");
      } catch {
        toast.error("Upload failed", "Please try again.");
      } finally {
        setUploading(false);
      }
    }
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">
          Upload your hotel logo
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Optional — you can always add this later
        </p>
      </div>

      <label className="block cursor-pointer">
        <div
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 transition-colors ${
            preview
              ? "border-blue-300 bg-blue-50"
              : "border-slate-300 hover:border-slate-400"
          }`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Logo preview"
              className="w-24 h-24 object-contain rounded-lg"
            />
          ) : (
            <>
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700">
                  Click to upload logo
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG up to 5MB
                </p>
              </div>
            </>
          )}
        </div>
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFile}
        />
      </label>

      {preview && (
        <button
          type="button"
          onClick={() => {
            setLogoFile(null);
            setPreview(null);
          }}
          className="text-sm text-red-500 hover:underline"
        >
          Remove image
        </button>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        <Button
          onClick={handleUpload}
          disabled={loading || uploading}
          className="flex-1"
        >
          {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {logoFile ? "Upload & Continue" : "Skip for now"}{" "}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

// ─── Step 5: Complete ─────────────────────────────────────────────────────────

function Step5({ hotelName, slug }: { hotelName: string; slug: string }) {
  const navigate = useNavigate();
  return (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <Check className="w-10 h-10 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-slate-900">
          You're all set! 🎉
        </h2>
        <p className="text-slate-500 mt-2">
          <span className="font-semibold text-slate-700">{hotelName}</span> is
          now live on HotelMS.
        </p>
      </div>
      <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
          Your public booking link
        </p>
        <p className="text-sm font-mono text-blue-600 break-all">
          {window.location.origin}/book/{slug}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => navigate(`/book/${slug}`)}
        >
          Preview booking page
        </Button>
        <Button className="flex-1" onClick={() => navigate("/dashboard")}>
          Go to dashboard →
        </Button>
      </div>
    </div>
  );
}

// ─── Main OnboardingPage ──────────────────────────────────────────────────────

export default function OnboardingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hotelId, setHotelId] = useState("");
  const [hotelSlug, setHotelSlug] = useState("");

  const [step1, setStep1] = useState<HotelForm>({
    name: "",
    description: "",
    address: "",
    city: "",
    state: "",
    country: "Nigeria",
    phone: "",
    email: user?.email || "",
    website: "",
    starRating: 3,
  });
  const [step2, setStep2] = useState<AmenitiesForm>({
    tagline: "",
    amenities: [],
  });
  const [step3, setStep3] = useState<PoliciesForm>({
    checkInTime: "14:00",
    checkOutTime: "11:00",
    cancellationPolicy: "",
    petsAllowed: false,
    smokingAllowed: false,
  });

  // Check if hotel was already partially created
  useEffect(() => {
    onboardingApi
      .getStatus()
      .then(({ data }) => {
        const s = data?.data ?? data;
        if (s?.id) {
          setHotelId(s.id);
          setHotelSlug(s.slug ?? "");
          if (s.isOnboarded) {
            navigate("/dashboard");
            return;
          }
          if (s.onboardingStep >= 1) setStep(s.onboardingStep + 1);
        }
      })
      .catch((err) => {
          console.error("onboarding status check failed", err);
      });
  }, []);

  const handleStep1 = async () => {
    setLoading(true);
    try {
      const { data } = await onboardingApi.createHotel(step1);
      const hotel = data?.data ?? data;
      setHotelId(hotel.id);
      setHotelSlug(hotel.slug);
      setStep(2);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      // If hotel already exists, just move forward
      if (
        err.response?.status === 403 &&
        typeof msg === "string" &&
        msg.includes("already has")
      ) {
        setStep(2);
      } else {
        toast.error(
          "Failed to save",
          Array.isArray(msg) ? msg.join(", ") : msg || "Please try again.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async () => {
    setLoading(true);
    try {
      await onboardingApi.saveStep(2, {
        tagline: step2.tagline,
        amenities: step2.amenities,
      });
      setStep(3);
    } catch {
      toast.error("Failed to save amenities");
    } finally {
      setLoading(false);
    }
  };

  const handleStep3 = async () => {
    setLoading(true);
    try {
      await onboardingApi.saveStep(3, {
        policies: {
          checkInTime: step3.checkInTime,
          checkOutTime: step3.checkOutTime,
          cancellationPolicy: step3.cancellationPolicy,
          petsAllowed: step3.petsAllowed,
          smokingAllowed: step3.smokingAllowed,
        },
      });
      setStep(4);
    } catch {
      toast.error("Failed to save policies");
    } finally {
      setLoading(false);
    }
  };

  const handleStep5 = async () => {
    setLoading(true);
    try {
      await onboardingApi.saveStep(5, {});
      setStep(5);
    } catch {
      toast.error("Failed to complete onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <Hotel className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-slate-900">HotelMS</span>
        <span className="text-slate-300 mx-2">|</span>
        <span className="text-sm text-slate-500">Hotel Setup</span>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-8">
        <div className="w-full max-w-lg">
          {step < 5 && <StepIndicator current={step} />}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            {step === 1 && (
              <Step1
                form={step1}
                setForm={setStep1}
                onNext={handleStep1}
                loading={loading}
              />
            )}
            {step === 2 && (
              <Step2
                form={step2}
                setForm={setStep2}
                onNext={handleStep2}
                onBack={() => setStep(1)}
                loading={loading}
              />
            )}
            {step === 3 && (
              <Step3
                form={step3}
                setForm={setStep3}
                onNext={handleStep3}
                onBack={() => setStep(2)}
                loading={loading}
              />
            )}
            {step === 4 && (
              <Step4
                hotelId={hotelId}
                onNext={handleStep5}
                onBack={() => setStep(3)}
                loading={loading}
              />
            )}
            {step === 5 && <Step5 hotelName={step1.name} slug={hotelSlug} />}
          </div>

          {step < 5 && (
            <p className="text-center text-xs text-slate-400 mt-4">
              Step {step} of 4 — you can complete the rest later
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
