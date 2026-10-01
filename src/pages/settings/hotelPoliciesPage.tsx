// src/pages/settings/HotelPoliciesPage.tsx — FULL REPLACEMENT

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hotelApi } from "@/api/services";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Clock,
  PawPrint,
  Cigarette,
  FileText,
  Shield,
  Save,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lock,
} from "lucide-react";

const ALLOWED_ROLES = ["HOTEL_DIRECTOR", "ADMIN", "ADMIN_HR"];

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: any;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function TimeInput({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
}) {
  const toDisplay = (t: string) => {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-600">{label}</label>
      <div className="relative">
        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="time"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed font-mono"
        />
      </div>
      {value && (
        <p className="text-xs text-slate-400">
          → Displays as: {toDisplay(value)}
        </p>
      )}
    </div>
  );
}

function ToggleSwitch({
  label,
  description,
  icon: Icon,
  checked,
  onChange,
  disabled,
  onColor = "bg-green-500",
}: {
  label: string;
  description: string;
  icon: any;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled: boolean;
  onColor?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${checked ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${checked ? "bg-green-100" : "bg-slate-100"}`}
        >
          <Icon
            className={`w-4 h-4 ${checked ? "text-green-600" : "text-slate-400"}`}
          />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800">{label}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${checked ? onColor : "bg-slate-300"}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
        />
      </button>
    </div>
  );
}

export default function HotelPoliciesPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const canEdit = ALLOWED_ROLES.includes(user?.role ?? "");

  const { data: hotel, isLoading: hotelLoading } = useQuery({
    queryKey: ["my-hotel"],
    queryFn: () => hotelApi.getMyHotel().then((r) => r.data?.data || r.data),
    enabled: !!user,
  });

  const [form, setForm] = useState({
    checkInTime: "14:00",
    checkOutTime: "11:00",
    cancellationPolicy: "",
    petsAllowed: false,
    smokingAllowed: false,
    extraRules: "",
  });
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (!hotel?.policies) return;
    const p = hotel.policies as any;
    setForm({
      checkInTime: p.checkInTime || "14:00",
      checkOutTime: p.checkOutTime || "11:00",
      cancellationPolicy: p.cancellationPolicy || "",
      petsAllowed: p.petsAllowed ?? false,
      smokingAllowed: p.smokingAllowed ?? false,
      extraRules: p.extraRules || "",
    });
  }, [hotel]);

  const update = (key: string, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  // hotelApi.updatePolicies(data) — no hotelId, backend resolves from JWT
  const { mutate: savePolicies, isPending: saving } = useMutation({
    mutationFn: () => hotelApi.updatePolicies(form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-hotel"] });
      toast.success("Policies updated successfully");
      setIsDirty(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message;
      toast.error(
        Array.isArray(msg) ? msg.join(", ") : msg || "Failed to save policies",
      );
    },
  });

  if (!canEdit) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
          <Lock className="w-8 h-8 text-red-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Access Restricted
          </h2>
          <p className="text-slate-500 text-sm mt-1 max-w-xs">
            Only Hotel Directors and Admins can manage hotel policies.
          </p>
        </div>
      </div>
    );
  }

  if (hotelLoading || !hotel) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-slate-100 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hotel Policies</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            These appear on your public booking page for guests
          </p>
        </div>
        {isDirty && (
          <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-3 py-2 rounded-xl">
            <AlertTriangle className="w-3.5 h-3.5" /> Unsaved changes
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-start gap-3">
        <Info className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
        <p className="text-blue-700 text-sm">
          Changes are applied immediately to your public booking page at{" "}
          <span className="font-mono font-semibold">/book/{hotel.slug}</span>
        </p>
      </div>

      <SectionCard
        icon={Clock}
        title="Check-in & Check-out Times"
        description="Displayed prominently on your booking page"
      >
        <div className="grid grid-cols-2 gap-4">
          <TimeInput
            label="Check-in from"
            value={form.checkInTime}
            onChange={(v) => update("checkInTime", v)}
            disabled={saving}
          />
          <TimeInput
            label="Check-out by"
            value={form.checkOutTime}
            onChange={(v) => update("checkOutTime", v)}
            disabled={saving}
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={Shield}
        title="Property Rules"
        description="Let guests know what's allowed on your property"
      >
        <div className="space-y-3">
          <ToggleSwitch
            icon={PawPrint}
            label="Pets Allowed"
            description="Guests can bring pets to the property"
            checked={form.petsAllowed}
            onChange={(v) => update("petsAllowed", v)}
            disabled={saving}
            onColor="bg-green-500"
          />
          <ToggleSwitch
            icon={Cigarette}
            label="Smoking Allowed"
            description="Smoking is permitted in designated areas"
            checked={form.smokingAllowed}
            onChange={(v) => update("smokingAllowed", v)}
            disabled={saving}
            onColor="bg-amber-500"
          />
        </div>
      </SectionCard>

      <SectionCard
        icon={FileText}
        title="Cancellation Policy"
        description="Tell guests under what conditions they can cancel"
      >
        <div className="space-y-2">
          <textarea
            value={form.cancellationPolicy}
            onChange={(e) => update("cancellationPolicy", e.target.value)}
            disabled={saving}
            rows={4}
            placeholder="e.g. Free cancellation up to 48 hours before check-in. After that, 1 night charge applies."
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-50 disabled:cursor-not-allowed leading-relaxed"
          />
          <p className="text-xs text-slate-400">
            {form.cancellationPolicy.length} characters
          </p>
        </div>
      </SectionCard>

      <SectionCard
        icon={FileText}
        title="Additional Rules"
        description="Any other house rules guests should know"
      >
        <textarea
          value={form.extraRules}
          onChange={(e) => update("extraRules", e.target.value)}
          disabled={saving}
          rows={3}
          placeholder="e.g. No parties or events. Quiet hours from 10pm to 8am. Pool access from 7am to 9pm only."
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-slate-50 disabled:cursor-not-allowed leading-relaxed"
        />
      </SectionCard>

      {(form.checkInTime ||
        form.checkOutTime ||
        form.cancellationPolicy ||
        form.extraRules) && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
            Preview — what guests see
          </p>
          <div className="bg-white rounded-xl border border-slate-200 p-4 divide-y divide-slate-100 text-sm">
            {form.checkInTime && (
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Check-in from</span>
                <span className="font-semibold text-slate-800">
                  {new Date(
                    `2000-01-01T${form.checkInTime}`,
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            )}
            {form.checkOutTime && (
              <div className="flex justify-between py-2.5">
                <span className="text-slate-500">Check-out by</span>
                <span className="font-semibold text-slate-800">
                  {new Date(
                    `2000-01-01T${form.checkOutTime}`,
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between py-2.5">
              <span className="text-slate-500">Pets</span>
              <span>{form.petsAllowed ? "✅ Allowed" : "❌ Not allowed"}</span>
            </div>
            <div className="flex justify-between py-2.5">
              <span className="text-slate-500">Smoking</span>
              <span>
                {form.smokingAllowed ? "✅ Allowed" : "❌ Not allowed"}
              </span>
            </div>
            {form.cancellationPolicy && (
              <div className="py-2.5">
                <p className="text-slate-500 mb-1">Cancellation</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  {form.cancellationPolicy}
                </p>
              </div>
            )}
            {form.extraRules && (
              <div className="py-2.5">
                <p className="text-slate-500 mb-1">Additional Rules</p>
                <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line">
                  {form.extraRules}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 pt-2 pb-8">
        <p className="text-xs text-slate-400">
          Last updated:{" "}
          {new Date(hotel.updatedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <Button
          onClick={() => savePolicies()}
          disabled={saving || !isDirty}
          className="min-w-32"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving…
            </>
          ) : isDirty ? (
            <>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" /> Saved
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
