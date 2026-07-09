import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import Button from "@/components/ui/Button";

const NotFound = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--color-paper)] px-4 text-center">
    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
      <Compass className="h-7 w-7" />
    </span>
    <h1 className="text-3xl font-semibold text-[var(--color-primary-dark)]">
      Lost in the fest crowd
    </h1>
    <p className="max-w-sm text-sm text-[var(--color-muted)]">
      We couldn't find the page you were looking for. It may have been
      moved, or the link might be off.
    </p>
    <Link to="/login">
      <Button>Back to Login</Button>
    </Link>
  </div>
);

export default NotFound;
