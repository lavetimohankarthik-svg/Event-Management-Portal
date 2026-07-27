import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  CalendarDays,
  MapPin,
  Users,
  Ticket,
  Clock,
  Trophy,
  Tag,
} from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import Button from "@/components/ui/Button";
import { Card, CardBody, Badge } from "@/components/ui/Card";
import DynamicForm from "@/components/DynamicForm";
import { formatDate, currency } from "@/lib/utils";
import { STATUS_COLORS } from "@/lib/constants";
import TeamPanel from "@/components/TeamPanel";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registration, setRegistration] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [calendarLinks, setCalendarLinks] = useState(null);

  const loadEverything = async () => {
    setLoading(true);
    try {
      const [{ data: eventRes }, { data: dashRes }] = await Promise.all([
        api.get(`/events/${id}`),
        api.get("/participant/dashboard"),
      ]);

      setEvent(eventRes.event);

      const existing = dashRes.dashboard.registrations.find(
        (r) => r.event?._id === id
      );
      setRegistration(existing || null);

      if (existing) {
        try {
          const { data } = await api.get(`/calendar/links/${id}`);
          setCalendarLinks(data);
        } catch (err) {
          console.error("Error loading calendar links", err);
        }
      } else {
        setCalendarLinks(null);
      }
    } catch (error) {
      toast.error(apiMessage(error, "Could not load this event."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEverything();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const downloadIcs = async () => {
    try {
      const response = await api.get(`/calendar/${id}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${event?.eventName || "event"}.ics`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Could not download calendar file.");
    }
  };

  if (loading) return <Loader label="Loading event..." />;
  if (!event) return null;

  const deadlinePassed = new Date(event.registrationDeadline) < new Date();
  const isTeamEvent = event.registrationType === "team";

  const handleRegister = async () => {
    const missingRequired = (event.customFields || [])
      .filter((f) => f.required)
      .some((f) => {
        const v = formValues[f.label];
        return v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
      });

    if (missingRequired) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const formResponses = Object.entries(formValues).map(([label, value]) => ({
        label,
        value,
      }));

      await api.post(`/registrations/${event._id}`, { formResponses });
      toast.success("Registered! Your ticket has been emailed to you.");
      loadEverything();
    } catch (error) {
      toast.error(apiMessage(error, "Registration failed."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] p-8 text-white">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="bg-white/15 text-white">{event.eventCategory}</Badge>
          <Badge className={STATUS_COLORS[event.status]}>{event.status}</Badge>
          {isTeamEvent && <Badge className="bg-white/15 text-white">Team Event</Badge>}
        </div>
        <h1 className="mt-3 text-2xl font-semibold sm:text-3xl">{event.eventName}</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/80">{event.description}</p>
        <Link
          to={`/participant/clubs/${event.organizer?._id}`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-white/90 underline underline-offset-2"
        >
          <Users className="h-3.5 w-3.5" />
          Hosted by {event.organizer?.firstName} {event.organizer?.lastName}
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardBody className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <Info icon={CalendarDays} label="Starts" value={formatDate(event.startDate, "d MMM, h:mm a")} />
              <Info icon={CalendarDays} label="Ends" value={formatDate(event.endDate, "d MMM, h:mm a")} />
              <Info icon={Clock} label="Registration Closes" value={formatDate(event.registrationDeadline, "d MMM, h:mm a")} />
              <Info icon={MapPin} label="Venue" value={event.venue || event.mode} />
              <Info icon={Ticket} label="Fee" value={event.registrationFee ? currency(event.registrationFee) : "Free"} />
              <Info icon={Trophy} label="Prize Pool" value={event.prizePool ? currency(event.prizePool) : "-"} />
            </CardBody>
          </Card>

          {event.rules?.length > 0 && (
            <Card>
              <CardBody>
                <h3 className="mb-2 text-sm font-semibold">Rules</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-[var(--color-muted)]">
                  {event.rules.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          )}

          {event.coordinators?.length > 0 && (
            <Card>
              <CardBody>
                <h3 className="mb-2 text-sm font-semibold">Coordinators</h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {event.coordinators.map((c, i) => (
                    <div key={i} className="rounded-lg bg-[var(--color-paper)] p-3 text-sm">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-[var(--color-muted)]">{c.phone}</p>
                    </div>
                  ))}
                </div>
              </CardBody>
            </Card>
          )}

          {event.eventTags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.eventTags.map((tag) => (
                <Badge key={tag} className="bg-[var(--color-primary)]/5 text-[var(--color-primary-dark)]">
                  <Tag className="mr-1 h-3 w-3" /> {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          {registration ? (
            <Card>
              <CardBody className="space-y-4">
                <p className="mb-1 text-sm font-semibold text-green-700">
                  You're registered!
                </p>
                <p className="mb-3 font-mono text-xs text-[var(--color-muted)]">
                  Ticket: {registration.ticketId}
                </p>
                <img src={registration.qrCode} alt="QR" className="mx-auto h-32 w-32" />

                <div className="border-t border-gray-100 pt-3 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Add to Calendar</p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {calendarLinks?.googleCalendar && (
                      <a 
                        href={calendarLinks.googleCalendar} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 hover:bg-gray-50 transition font-medium"
                      >
                        Google Calendar
                      </a>
                    )}
                    {calendarLinks?.outlookCalendar && (
                      <a 
                        href={calendarLinks.outlookCalendar} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 hover:bg-gray-50 transition font-medium"
                      >
                        Outlook
                      </a>
                    )}
                  </div>
                  <button 
                    onClick={downloadIcs}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-[var(--color-primary)]/5 text-[var(--color-primary-dark)] hover:bg-[var(--color-primary)]/10 py-2 text-xs font-semibold transition cursor-pointer"
                  >
                    Download Universal .ics File
                  </button>
                </div>
              </CardBody>
            </Card>
          ) : isTeamEvent ? (
            <TeamPanel event={event} onRegistered={loadEverything} />
          ) : (
            <Card>
              <CardBody className="space-y-4">
                {deadlinePassed ? (
                  <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                    Registration deadline has passed.
                  </p>
                ) : (
                  <>
                    <DynamicForm
                      fields={event.customFields}
                      values={formValues}
                      onChange={setFormValues}
                    />
                    <Button className="w-full" loading={submitting} onClick={handleRegister}>
                      Register Now
                    </Button>
                  </>
                )}
              </CardBody>
            </Card>
          )}

          <Button variant="outline" className="w-full" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

const Info = ({ icon: Icon, label, value }) => (
  <div>
    <p className="flex items-center gap-1.5 text-xs text-[var(--color-muted)]">
      <Icon className="h-3.5 w-3.5" /> {label}
    </p>
    <p className="mt-0.5 text-sm font-medium">{value}</p>
  </div>
);

export default EventDetails;
