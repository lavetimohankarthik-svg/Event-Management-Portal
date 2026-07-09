import { NavLink } from "react-router-dom";
import { LogOut, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn, initials } from "@/lib/utils";

const NavBar = ({ items, homePath }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-white/90 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between gap-6">
        <NavLink to={homePath} className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--color-primary)] text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-[var(--color-primary-dark)]">
            Recstacy
          </span>
        </NavLink>

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3.5 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]"
                    : "text-[var(--color-muted)] hover:bg-[var(--color-paper)] hover:text-[var(--color-ink)]"
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs capitalize leading-tight text-[var(--color-muted)]">
              {user?.role}
            </p>
          </div>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-sm font-semibold text-[var(--color-primary-dark)]">
            {initials(user?.firstName, user?.lastName)}
          </div>
          <button
            onClick={logout}
            title="Logout"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] transition hover:bg-[var(--color-paper)] hover:text-[var(--color-danger)] focus-ring"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <nav className="container-page flex gap-1 overflow-x-auto pb-2 md:hidden">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium",
                isActive
                  ? "bg-[var(--color-primary)]/10 text-[var(--color-primary-dark)]"
                  : "text-[var(--color-muted)]"
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

export default NavBar;
