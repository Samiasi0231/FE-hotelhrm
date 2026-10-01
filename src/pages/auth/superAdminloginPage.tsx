// src/pages/auth/SuperAdminLoginPage.tsx — FULL FILE
// Completely separate login page for Super Admin only
// Accessed at /super-admin/login — not linked from main login

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/toaster";
import { Eye, EyeOff, Loader2, ShieldCheck, Lock } from "lucide-react";

export default function SuperAdminLoginPage() {
  const { loginSuperAdmin } = useAuth(); // separate login fn — see AuthContext patch below
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginSuperAdmin(form.email, form.password);
      toast.success("Super Admin access granted");
      navigate("/dashboard");
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Invalid credentials or insufficient privileges";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">HotelMS</h1>
          <p className="text-slate-400 text-sm mt-1">Super Admin Portal</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-4 h-4 text-amber-400" />
            <p className="text-amber-400 text-xs font-semibold uppercase tracking-widest">
              Restricted Access
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 bg-red-950 border border-red-800 rounded-xl text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="admin@hotelms.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className="w-full px-4 py-3 pr-11 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 mt-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating…
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" /> Access Super Admin
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back to staff login */}
        <p className="text-center text-slate-600 text-xs mt-6">
          Not an admin?{" "}
          <a
            href="/login"
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            Staff login →
          </a>
        </p>

        <p className="text-center text-slate-700 text-xs mt-3">
          Unauthorized access attempts are logged.
        </p>
      </div>
    </div>
  );
}
