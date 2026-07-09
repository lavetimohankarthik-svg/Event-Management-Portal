import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Download, Pencil, Search, Users, CheckCircle2 } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { STATUS_COLORS } from "@/lib/constants";
import { formatDate, currency } from "@/lib/utils";

const OrganizerEventDetail = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => {
    api
      .get(`/organizer/dashboard/event/${id}`)
      .then(({ data }) => setData(data.result))
      .finally(() => setLoading(false));
  };

  useEffect(load, [id]);

  const filteredParticipants = useMemo(() => {
    if (!data) return [];
    return data.participants.filter((p) => {
      if (!search) return true;
      const name = `${p.participant?.firstName} ${p.participant?.lastName} ${p.participant?.email}`;
      return name.toLowerCase().includes(search.toLowerCase());
    });
  }, [data, search]);

  const exportCsv = async () => {
    try {
      const response = await api.get(`/export/participants/${id}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "participants.csv");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Could not export participants.");
    }
  };

  const updateStatus = async (status) => {
    setBusy(true);
    try {
      await api.put(`/events/${id}`, { status });
      toast.success(`Event marked as ${status}.`);
      load();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const approveParticipant = async (registrationId) => {
    setBusy(true);
    try {
      await api.put(`/registrations/approve/${registrationId}`);
      toast.success("Registration payment approved.");
      load();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader label="Loading event..." />;
  if (!data) return null;

  const { overview: event, analytics, participants } = data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge className={STATUS_COLORS[event.status]}>{event.status}</Badge>
            <span className="text-xs uppercase text-[var(--color-muted)]">
              {event.eventCategory}
            </span>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
            {event.eventName}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/organizer/events/${id}/edit`}>
            <Button variant="outline">
              <Pencil className="h-4 w-4" /> Edit
            </Button>
          </Link>
          {event.status === "published" && (
            <Button loading={busy} onClick={() => updateStatus("ongoing")}>
              Mark Ongoing
            </Button>
          )}
          {event.status === "ongoing" && (
            <Button loading={busy} onClick={() => updateStatus("completed")}>
              <CheckCircle2 className="h-4 w-4" /> Mark Completed
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardBody>
            <p className="text-xl font-semibold">{analytics.registrations}</p>
            <p className="text-xs text-[var(--color-muted)]">Registrations</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xl font-semibold">{analytics.attendance}</p>
            <p className="text-xs text-[var(--color-muted)]">Checked In</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xl font-semibold">{event.registrationLimit}</p>
            <p className="text-xs text-[var(--color-muted)]">Capacity</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xl font-semibold">
              {event.registrationFee ? currency(event.registrationFee) : "Free"}
            </p>
            <p className="text-xs text-[var(--color-muted)]">Entry Fee</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Overview</h2>
        </CardHeader>
        <CardBody className="grid gap-3 sm:grid-cols-2">
          <p className="text-sm">
            <span className="text-[var(--color-muted)]">Starts: </span>
            {formatDate(event.startDate)}
          </p>
          <p className="text-sm">
            <span className="text-[var(--color-muted)]">Ends: </span>
            {formatDate(event.endDate)}
          </p>
          <p className="text-sm">
            <span className="text-[var(--color-muted)]">Eligibility: </span>
            {event.eligibility}
          </p>
          <p className="text-sm">
            <span className="text-[var(--color-muted)]">Venue: </span>
            {event.venue || event.mode}
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <Users className="h-4 w-4" /> Participants
          </h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
              <Input
                className="pl-9"
                placeholder="Search participants..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" onClick={exportCsv}>
              <Download className="h-4 w-4" /> Export CSV
            </Button>
          </div>

          {filteredParticipants.length === 0 ? (
            <p className="py-8 text-center text-sm text-[var(--color-muted)]">
              No participants yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-[var(--color-muted)]">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Registered</th>
                    <th className="pb-2">Payment</th>
                    <th className="pb-2">Attendance</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredParticipants.map((p) => (
                    <tr key={p._id} className="border-t border-[var(--color-border)]">
                      <td className="py-2.5 font-medium">
                        {p.participant?.firstName} {p.participant?.lastName}
                      </td>
                      <td className="py-2.5">{p.participant?.email}</td>
                      <td className="py-2.5">{formatDate(p.createdAt, "d MMM")}</td>
                      <td className="py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="capitalize">{p.paymentStatus}</span>
                          {event.registrationFee > 0 && p.paymentStatus !== "paid" && (
                            <Button size="sm" variant="primary" loading={busy} onClick={() => approveParticipant(p._id)}>
                              Approve
                            </Button>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5">
                        {p.checkedIn ? (
                          <Badge className="bg-green-50 text-green-700">Checked In</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-600">Pending</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default OrganizerEventDetail;
