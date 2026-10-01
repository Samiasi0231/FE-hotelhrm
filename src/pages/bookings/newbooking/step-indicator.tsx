// src/pages/bookings/new/StepIndicator.tsx

const STEPS = ["Select Dates", "Choose Room", "Guest Info", "Payment"];

export function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex gap-2 mt-3 flex-wrap">
      {STEPS.map((s, i) => (
        <div
          key={s}
          className={`flex items-center gap-1 text-sm
          ${step > i + 1 ? "text-green-600" : step === i + 1 ? "text-blue-600 font-semibold" : "text-muted-foreground"}`}
        >
          <span
            className={`w-5 h-5 rounded-full text-xs flex items-center justify-center
            ${step > i + 1 ? "bg-green-600 text-white" : step === i + 1 ? "bg-blue-600 text-white" : "bg-slate-200"}`}
          >
            {step > i + 1 ? "✓" : i + 1}
          </span>
          {s}
          {i < STEPS.length - 1 && (
            <span className="text-slate-300 ml-1">›</span>
          )}
        </div>
      ))}
    </div>
  );
}
