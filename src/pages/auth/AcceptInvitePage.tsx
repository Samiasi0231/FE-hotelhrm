// src/pages/auth/AcceptInvitePage.tsx — NEW FILE
// Route: /accept-invite?token=xxxxx  (public, no auth)

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { inviteApi } from "@/api/services";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/common";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

type InviteInfo = {
  email: string;
  role: string;
  hotel?: { name: string } | null;
};

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token") || "";

  const [status, setStatus] = useState<"checking" | "valid" | "invalid">(
    "checking",
  );
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
  });
  const f = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  });

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setErrorMsg("No invite token provided");
      return;
    }
    inviteApi
      .validate(token)
      .then(({ data }) => {
        setInvite(data?.data ?? data);
        setStatus("valid");
      })
      .catch((err: any) => {
        setErrorMsg(
          err.response?.data?.message ||
            "This invite link is invalid or has expired",
        );
        setStatus("invalid");
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await inviteApi.accept({ token, ...form });
      toast.success("Account activated!", "You can now sign in.");
      navigate("/login", { replace: true });
    } catch (err: any) {
      toast.error(
        "Could not activate account",
        err.response?.data?.message || "Please try again",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "checking") {
    return (
      <div className="flex flex-col items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-3" />
        <p className="text-sm text-slate-500">Checking your invite…</p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Invite not valid
        </h2>
        <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
        <Link to="/login" className="text-blue-600 hover:underline text-sm">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-center mb-4">
        <CheckCircle2 className="w-10 h-10 text-green-500" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1 text-center">
        Activate your account
      </h2>
      <p className="text-slate-500 text-sm mb-6 text-center">
        You've been invited as <strong>{invite?.role}</strong>
        {invite?.hotel?.name ? (
          <>
            {" "}
            at <strong>{invite.hotel.name}</strong>
          </>
        ) : null}
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input value={invite?.email || ""} disabled />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>First name</Label>
            <Input required placeholder="Jane" {...f("firstName")} />
          </div>
          <div className="space-y-1.5">
            <Label>Last name</Label>
            <Input required placeholder="Doe" {...f("lastName")} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label>Phone number</Label>
          <Input type="tel" placeholder="+234 800 000 0000" {...f("phone")} />
        </div>
        <div className="space-y-1.5">
          <Label>Set a password</Label>
          <Input
            type="password"
            required
            minLength={8}
            placeholder="Min 8 characters"
            {...f("password")}
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Activating…
            </>
          ) : (
            "Activate account"
          )}
        </Button>
      </form>
    </div>
  );
}
