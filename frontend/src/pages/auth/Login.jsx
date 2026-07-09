import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Sparkles } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Input, { Label, FieldError } from "@/components/ui/Input";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values) => {
    setSubmitting(true);

    try {
      const { data } = await api.post("/auth/login", values);

      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.firstName}!`);

      const redirectTo = location.state?.from?.pathname || `/${data.user.role}`;
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(apiMessage(error, "Login failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-paper)] px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white">
            <Sparkles className="h-5 w-5" />
          </span>
          <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
            Welcome to Recstacy
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Log in as a participant, organizer, or admin.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label required>Email Address</Label>
              <Input
                type="email"
                placeholder="you@example.com"
                {...register("email")}
              />
              <FieldError message={errors.email?.message} />
            </div>

            <div>
              <Label required>Password</Label>
              <Input
                type="password"
                placeholder="••••••••"
                {...register("password")}
              />
              <FieldError message={errors.password?.message} />
            </div>

            <Button type="submit" size="lg" className="w-full" loading={submitting}>
              Log In
            </Button>
          </form>

          <p className="mt-5 text-center text-sm text-[var(--color-muted)]">
            New participant?{" "}
            <Link to="/register" className="font-medium text-[var(--color-primary)]">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
