import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Users, Ticket, IndianRupee, ShoppingBag } from "lucide-react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody, Badge } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { STATUS_COLORS } from "@/lib/constants";
import { formatDate, currency } from "@/lib/utils";

const Stat = ({ icon: Icon, label, value }) => (
  <Card>
    <CardBody className="flex items-center gap-3">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xl font-semibold">{value}</p>
        <p className="text-xs text-[var(--color-muted)]">{label}</p>
      </div>
    </CardBody>
  </Card>
);

const OrganizerDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/organizer/dashboard")
      .then(({ data }) => setDashboard(data.dashboard))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
            Organizer Dashboard
          </h1>
          <p className="text-sm text-[var(--color-muted)]">
            Manage your events, track registrations, and view analytics.
          </p>
        </div>
        <Link to="/organizer/events/create">
          <Button>
            <CalendarPlus className="h-4 w-4" /> Create Event
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Ticket} label="Total Events" value={dashboard.totalEvents} />
        <Stat icon={Users} label="Total Registrations" value={dashboard.totalRegistrations} />
        <Stat icon={IndianRupee} label="Revenue (Merch)" value={currency(dashboard.totalRevenue)} />
        <Stat icon={ShoppingBag} label="Merch Sales" value={dashboard.totalMerchandiseSales} />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {["draft", "published", "ongoing", "completed", "cancelled"].map((status) => (
          <div
            key={status}
            className="rounded-xl border border-[var(--color-border)] bg-white p-3 text-center"
          >
            <p className="text-lg font-semibold">
              {dashboard[`${status}Events`]}
            </p>
            <p className="text-xs capitalize text-[var(--color-muted)]">{status}</p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Your Events</h2>
        {dashboard.events.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--color-muted)]">
            You haven't created any events yet.
          </p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2">
            {dashboard.events.map((event) => (
              <Link
                key={event._id}
                to={`/organizer/events/${event._id}`}
                className="min-w-[260px] rounded-2xl border border-[var(--color-border)] bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase text-[var(--color-muted)]">
                    {event.eventCategory}
                  </span>
                  <Badge className={STATUS_COLORS[event.status]}>{event.status}</Badge>
                </div>
                <p className="font-semibold">{event.eventName}</p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {formatDate(event.startDate, "d MMM yyyy")}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
