import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Mail } from "lucide-react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import EventCard from "@/components/EventCard";
import { Card, CardBody } from "@/components/ui/Card";
import { currency, formatDate, initials } from "@/lib/utils";

const ClubDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/organizer/profile/${id}`)
      .then(({ data }) => setData(data.result))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader label="Loading club..." />;
  if (!data) return null;

  const { organizer, upcomingEvents, pastEvents, merchandise } = data;
  const today = new Date();
  const currentMerchandise = merchandise?.filter(
    (item) => !item.purchaseDeadline || new Date(item.purchaseDeadline) >= today
  );
  const pastMerchandise = merchandise?.filter(
    (item) => item.purchaseDeadline && new Date(item.purchaseDeadline) < today
  );

  return (
    <div className="space-y-8">
      <Card>
        <CardBody className="flex flex-wrap items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xl font-semibold text-[var(--color-primary-dark)]">
            {initials(organizer.firstName, organizer.lastName)}
          </span>
          <div>
            <h1 className="text-xl font-semibold">
              {organizer.firstName} {organizer.lastName}
            </h1>
            <p className="text-sm text-[var(--color-muted)]">
              {organizer.category || "Club / Organizer"}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
              <Mail className="h-3.5 w-3.5" /> {organizer.email}
            </p>
          </div>
        </CardBody>
        {organizer.description && (
          <CardBody className="border-t border-[var(--color-border)]">
            <p className="text-sm text-[var(--color-muted)]">{organizer.description}</p>
          </CardBody>
        )}
      </Card>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Upcoming Events</h2>
        {upcomingEvents?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.map((e) => (
              <EventCard key={e._id} event={{ ...e, organizer }} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">No upcoming events.</p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Past Events</h2>
        {pastEvents?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastEvents.map((e) => (
              <EventCard key={e._id} event={{ ...e, organizer }} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">No past events yet.</p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Current Merchandise</h2>
        {currentMerchandise?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentMerchandise.map((item) => (
              <Card key={item._id}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-40 w-full rounded-t-2xl object-cover"
                  />
                )}
                <CardBody className="space-y-2">
                  <p className="font-semibold">{item.name}</p>
                  <p className="line-clamp-2 text-xs text-[var(--color-muted)]">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[var(--color-primary-dark)]">
                      {currency(item.price)}
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">
                      {item.stock} in stock
                    </span>
                  </div>
                  {item.purchaseDeadline && (
                    <p className="text-xs text-[var(--color-muted)]">
                      Purchase until {formatDate(item.purchaseDeadline)}
                    </p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">No current merchandise.</p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Past Merchandise</h2>
        {pastMerchandise?.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pastMerchandise.map((item) => (
              <Card key={item._id}>
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.name}
                    className="h-40 w-full rounded-t-2xl object-cover"
                  />
                )}
                <CardBody className="space-y-2">
                  <p className="font-semibold">{item.name}</p>
                  <p className="line-clamp-2 text-xs text-[var(--color-muted)]">
                    {item.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-[var(--color-primary-dark)]">
                      {currency(item.price)}
                    </span>
                    <span className="text-xs text-[var(--color-muted)]">
                      {item.stock} in stock
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-muted)]">
                    Purchase deadline was {formatDate(item.purchaseDeadline)}
                  </p>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--color-muted)]">No past merchandise.</p>
        )}
      </div>
    </div>
  );
};

export default ClubDetail;
