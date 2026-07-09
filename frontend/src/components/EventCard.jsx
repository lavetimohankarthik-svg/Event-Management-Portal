import { Link } from "react-router-dom";
import { CalendarDays, MapPin, Users, Tag } from "lucide-react";
import { Badge } from "@/components/ui/Card";
import { formatDate, currency } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";

const EventCard = ({ event, basePath = "/participant/events" }) => {
  const isPast = new Date(event.registrationDeadline) < new Date();

  return (
    <Link
      to={`${basePath}/${event._id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex h-28 items-center justify-between bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] px-5">
        <span className="text-xs font-semibold uppercase tracking-wide text-white/80">
          {event.eventCategory}
        </span>
        <Badge className={STATUS_COLORS[event.status] || "bg-white/20 text-white"}>
          {event.status}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="line-clamp-2 text-base font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-primary)]">
          {event.eventName}
        </h3>

        <div className="space-y-1.5 text-xs text-[var(--color-muted)]">
          <p className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(event.startDate, "d MMM yyyy")}
          </p>
          {event.venue && (
            <p className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {event.venue}
            </p>
          )}
          <p className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {event.organizer?.firstName} {event.organizer?.lastName}
          </p>
          {event.eventTags?.length > 0 && (
            <p className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              {event.eventTags.slice(0, 3).join(", ")}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-sm font-semibold text-[var(--color-primary-dark)]">
            {event.registrationFee ? currency(event.registrationFee) : "Free"}
          </span>
          <span className="text-xs font-medium text-[var(--color-muted)]">
            {isPast ? "Registration closed" : "Registration open"}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EventCard;
