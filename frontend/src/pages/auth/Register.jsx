import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input, { Label, FieldError, Select } from "@/components/ui/Input";

const INSTITUTE_EMAIL_DOMAIN = "@nitdgp.ac.in";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    participantType: z.enum(["NIT DURGAPUR", "External"]),
    email: z.string().email("Enter a valid email address"),
    phoneNumber: z.string().min(6, "Enter a valid contact number"),
    collegeName: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine(
    (data) =>
      data.participantType !== "NIT DURGAPUR" ||
      data.email.endsWith(INSTITUTE_EMAIL_DOMAIN),
    {
      message: `NIT Durgapur students must use their ${INSTITUTE_EMAIL_DOMAIN} email`,
      path: ["email"],
    }
  );

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { participantType: "External" },
  });

  const participantType = watch("participantType");

  const onSubmit = async (values) => {
    setSubmitting(true);

    try {
      const { confirmPassword, ...payload } = values;
      const { data } = await api.post("/auth/register", payload);

      login(data.token, data.user);
      toast.success("Account created! Let's set up your preferences.");
      navigate("/onboarding");
    } catch (error) {
      toast.error(apiMessage(error, "Registration failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
            Create your Recstacy account
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Register as a participant to browse and join fest events.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label required>I am registering as</Label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    participantType === "NIT DURGAPUR"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    value="NIT DURGAPUR"
                    className="sr-only"
                    {...register("participantType")}
                  />
                  NIT Durgapur Student
                </label>
                <label
                  className={`cursor-pointer rounded-xl border px-4 py-3 text-sm font-medium transition ${
                    participantType === "External"
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <input
                    type="radio"
                    value="External"
                    className="sr-only"
                    {...register("participantType")}
                  />
                  Non-Institute Participant
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>First Name</Label>
                <Input placeholder="Aarav" {...register("firstName")} />
                <FieldError message={errors.firstName?.message} />
              </div>
              <div>
                <Label required>Last Name</Label>
                <Input placeholder="Sharma" {...register("lastName")} />
                <FieldError message={errors.lastName?.message} />
              </div>
            </div>

            <div>
              <Label required>Email Address</Label>
              <Input
                type="email"
                placeholder={
                  participantType === "NIT DURGAPUR"
                    ? `you${INSTITUTE_EMAIL_DOMAIN}`
                    : "you@example.com"
                }
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Contact Number</Label>
                <Input placeholder="9876543210" {...register("phoneNumber")} />
                <FieldError message={errors.phoneNumber?.message} />
              </div>
              <div>
                <Label>College / Organization</Label>
                <Input placeholder="Optional" {...register("collegeName")} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>Password</Label>
                <Input type="password" placeholder="••••••••" {...register("password")} />
                <FieldError message={errors.password?.message} />
              </div>
              <div>
                <Label required>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  {...register("confirmPassword")}
                />
                <FieldError message={errors.confirmPassword?.message} />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={submitting}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-[var(--color-primary)]">
              Log in
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-[var(--color-muted)]">
          Organizer and Admin accounts are provisioned separately and don't
          self-register.
        </p>
      </div>
    </div>
  );
};

export default Register;
