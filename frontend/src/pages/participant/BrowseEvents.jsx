import { useEffect, useMemo, useState } from "react";
import { Search, TrendingUp, SlidersHorizontal } from "lucide-react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import EventCard from "@/components/EventCard";
import Input, { Select } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { EVENT_CATEGORIES, ELIGIBILITY_OPTIONS } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";

// Section 9.3: Browse Events — partial/fuzzy search, trending, filters.
const BrowseEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [eventCategory, setEventCategory] = useState("");
  const [eligibility, setEligibility] = useState("");
  const [startDate, setStartDate] = useState("");
  const [followedOnly, setFollowedOnly] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/events")
      .then(({ data }) => setEvents(data.events || []))
      .finally(() => setLoading(false));

    api
      .get("/events/trending")
      .then(({ data }) => setTrending(data.events || []))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    return events.filter((event) => {
      if (
        search &&
        !`${event.eventName} ${event.organizer?.firstName || ""} ${event.organizer?.lastName || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
        return false;

      if (eventCategory && event.eventCategory !== eventCategory) return false;

      if (eligibility && event.eligibility !== eligibility) return false;

      if (startDate && new Date(event.startDate) < new Date(startDate))
        return false;


      if (
        followedOnly &&
        !user?.followedOrganizers?.some(
          (id) => id === event.organizer?._id || id?._id === event.organizer?._id
        )
      )
        return false;

      return true;
    });
  }, [events, search, eventCategory, eligibility, startDate, followedOnly, user]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
          Browse Events
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Search across every event happening at Recstacy this year.
        </p>
      </div>

      {trending.length > 0 && (
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[var(--color-ink)]">
            <TrendingUp className="h-4 w-4 text-[var(--color-accent)]" />
            Trending Now (Top 5 / 24h)
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {trending.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="relative lg:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
            <Input
              className="pl-9"
              placeholder="Search events or organizers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={eventCategory} onChange={(e) => setEventCategory(e.target.value)}>
            <option value="">All Types</option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Select value={eligibility} onChange={(e) => setEligibility(e.target.value)}>
            <option value="">All Eligibility</option>
            {ELIGIBILITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
          <div className="flex gap-2">
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={followedOnly}
              onChange={(e) => setFollowedOnly(e.target.checked)}
            />
            Followed clubs only
          </label>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setEventCategory("");
              setEligibility("");
              setStartDate("");
              setFollowedOnly(false);
            }}
          >
            Clear filters
          </Button>
        </div>
      </div>

      {loading ? (
        <Loader label="Loading events..." />
      ) : filtered.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--color-muted)]">
          No events match your filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BrowseEvents;
