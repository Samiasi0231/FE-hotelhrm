// src/pages/public/components/BookingModal/ErrorStep.tsx
import { AlertCircle } from "lucide-react";

interface Props {
  errorMsg: string;
  onClose: () => void;
  onRetry: () => void;
}

export function ErrorStep({ errorMsg, onClose, onRetry }: Props) {
  return (
    <div className="p-6 space-y-4 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
        <AlertCircle className="w-8 h-8 text-red-500" />
      </div>
      <div>
        <h3 className="font-bold text-slate-900">Something went wrong</h3>
        <p className="text-slate-500 text-sm mt-1.5">{errorMsg}</p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={onRetry}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
