// src/pages/staff/SendInvitePage.tsx — FULL REPLACEMENT
// Director/Admin fills the full employee form. This creates the account
// immediately (inactive) and emails a link that only asks for a password.

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { inviteApi } from "@/api/services";
import { toast } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import {
  Input,
  Label,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/common";
import { Loader2 } from "lucide-react";

const ROLES = ["STAFF", "ADMIN", "ADMIN_HR"] as const;
const GENDERS = ["MALE", "FEMALE", "OTHER"] as const;

export default function SendInvitePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "" as "" | (typeof GENDERS)[number],
    role: "STAFF" as (typeof ROLES)[number],
    position: "",
    department: "",
    employeeId: "",
    salary: "",
  });

  const f = (k: keyof typeof form) => ({
    value: form[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm({ ...form, [k]: e.target.value }),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      inviteApi.create({
        ...form,
        gender: form.gender || undefined,
        employeeId: form.employeeId || undefined,
        salary: form.salary ? parseFloat(form.salary) : undefined,
      }),
    onSuccess: () => {
      toast.success(
        "Invite sent!",
        `${form.firstName}'s account was created and an activation link was emailed to ${form.email}.`,
      );
      navigate("/staff");
    },
    onError: (e: any) =>
      toast.error(
        "Could not send invite",
        e.response?.data?.message || "Please try again",
      ),
  });

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Invite staff member</h1>
        <p className="text-muted-foreground text-sm">
          Fill in their details — they'll get an email with a link to set their
          own password and activate the account.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          mutate();
        }}
        className="space-y-5"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>First Name *</Label>
                <Input required placeholder="Jane" {...f("firstName")} />
              </div>
              <div className="space-y-1.5">
                <Label>Last Name *</Label>
                <Input required placeholder="Doe" {...f("lastName")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email *</Label>
              <Input
                required
                type="email"
                placeholder="jane@grandhotel.com"
                {...f("email")}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  {...f("phone")}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Gender</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.gender}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      gender: e.target.value as typeof form.gender,
                    })
                  }
                >
                  <option value="">Prefer not to say</option>
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g.charAt(0) + g.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employment Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Role *</Label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={form.role}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      role: e.target.value as typeof form.role,
                    })
                  }
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace("_", " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>Employee ID</Label>
                <Input
                  placeholder="Auto-generated if left blank"
                  {...f("employeeId")}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Department</Label>
                <Input placeholder="Front Office" {...f("department")} />
              </div>
              <div className="space-y-1.5">
                <Label>Position</Label>
                <Input placeholder="Front Desk Agent" {...f("position")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Salary (₦)</Label>
              <Input
                type="number"
                min="0"
                placeholder="150000"
                {...f("salary")}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/staff")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={
              isPending || !form.firstName || !form.lastName || !form.email
            }
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Create account & send invite"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
