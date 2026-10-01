import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authApi } from "@/api/services";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/common";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Register as HOTEL_DIRECTOR
      await authApi.register({ ...form, role: "HOTEL_DIRECTOR" });

      // Auto-login so the onboarding guard can check status immediately
      await login(form.email, form.password);

      toast.success("Account created!", "Let's set up your hotel.");

      // Redirect to onboarding (guard in DashboardLayout also does this,
      // but explicit navigation here is faster and clearer UX)
      navigate("/onboarding", { replace: true });
    } catch (err: any) {
      toast.error(
        "Registration failed",
        err.response?.data?.message || "Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const f = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  });

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Create account</h2>
      <p className="text-slate-500 text-sm mb-6">
        Register as a Hotel Director
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>First name</Label>
            <Input placeholder="John" required {...f("firstName")} />
          </div>
          <div className="space-y-1.5">
            <Label>Last name</Label>
            <Input placeholder="Doe" required {...f("lastName")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Email address</Label>
          <Input
            type="email"
            placeholder="john@hotel.com"
            required
            {...f("email")}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Phone number</Label>
          <Input type="tel" placeholder="+234 800 000 0000" {...f("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label>Password</Label>
          <Input
            type="password"
            placeholder="Min 8 characters"
            required
            minLength={8}
            {...f("password")}
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account & set up hotel"
          )}
        </Button>
      </form>
      <p className="text-center text-sm text-slate-500 mt-6">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
