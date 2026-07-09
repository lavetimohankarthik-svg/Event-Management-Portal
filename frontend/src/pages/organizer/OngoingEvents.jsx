import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody, Badge } from "@/components/ui/Card";
import { STATUS_COLORS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

const OngoingEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/organizer/dashboard")
      .then(({ data }) =>
        setEvents(data.dashboard.events.filter((e) => e.status === "ongoing"))
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading ongoing events..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
          Ongoing Events
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Events currently in progress.
        </p>
      </div>

      {events.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--color-muted)]">
          No events are ongoing right now.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Link key={event._id} to={`/organizer/events/${event._id}`}>
              <Card>
                <CardBody className="space-y-2">
                  <Badge className={STATUS_COLORS[event.status]}>{event.status}</Badge>
                  <p className="font-semibold">{event.eventName}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    {formatDate(event.startDate, "d MMM yyyy, h:mm a")}
                  </p>
                </CardBody>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default OngoingEvents;
