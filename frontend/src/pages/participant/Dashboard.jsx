import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Ticket as TicketIcon, Users2 } from "lucide-react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody, Badge } from "@/components/ui/Card";
import TicketModal from "@/components/TicketModal";
import { formatDate, cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const TABS = ["Upcoming", "Normal", "Merchandise", "Completed", "Cancelled/Rejected"];

const statusBadge = {
  confirmed: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-700",
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Upcoming");
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get("/participant/dashboard"),
      api.get("/merchandise/my-orders").catch(() => ({ data: { orders: [] } })),
    ])
      .then(([dashRes, ordersRes]) => {
        setData(dashRes.data.dashboard);
        setOrders(ordersRes.data.orders || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const registrations = data?.registrations || [];

  const upcoming = useMemo(
    () =>
      registrations.filter(
        (r) =>
          r.event &&
          new Date(r.event.startDate) >= new Date() &&
          r.registrationStatus !== "cancelled"
      ),
    [registrations]
  );

  const normal = useMemo(
    () =>
      registrations.filter(
        (r) => r.event && r.event.eventCategory !== "merchandise"
      ),
    [registrations]
  );

  const completed = useMemo(
    () => registrations.filter((r) => r.event?.status === "completed"),
    [registrations]
  );

  const cancelled = useMemo(
    () => registrations.filter((r) => r.registrationStatus === "cancelled"),
    [registrations]
  );

  if (loading) return <Loader full={false} label="Loading your dashboard..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
          Welcome back, {user?.firstName}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Here's what's happening with your Recstacy registrations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardBody className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <TicketIcon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-semibold">{registrations.length}</p>
              <p className="text-xs text-[var(--color-muted)]">Total Registrations</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent)]/20 text-[var(--color-accent)]">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-semibold">{upcoming.length}</p>
              <p className="text-xs text-[var(--color-muted)]">Upcoming Events</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-semibold">{data?.teams?.length || 0}</p>
              <p className="text-xs text-[var(--color-muted)]">Teams Joined</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <Card>
        <div className="flex gap-1 overflow-x-auto border-b border-[var(--color-border)] px-4 pt-4">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "whitespace-nowrap rounded-t-lg px-3.5 py-2 text-sm font-medium",
                tab === t
                  ? "border-b-2 border-[var(--color-primary)] text-[var(--color-primary-dark)]"
                  : "text-[var(--color-muted)]"
              )}
            >
              {t}
            </button>
          ))}
        </div>

        <CardBody>
          {tab === "Merchandise" ? (
            <OrdersTable orders={orders} />
          ) : (
            <RegistrationsTable
              rows={
                tab === "Upcoming"
                  ? upcoming
                  : tab === "Normal"
                  ? normal
                  : tab === "Completed"
                  ? completed
                  : cancelled
              }
              onTicketClick={setSelectedTicket}
            />
          )}
        </CardBody>
      </Card>

      <TicketModal
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
        registration={selectedTicket}
      />
    </div>
  );
};

const RegistrationsTable = ({ rows, onTicketClick }) => {
  if (!rows.length) {
    return (
      <p className="py-10 text-center text-sm text-[var(--color-muted)]">
        Nothing here yet. Go{" "}
        <Link to="/participant/events" className="text-[var(--color-primary)] underline">
          browse events
        </Link>{" "}
        to register for something.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-[var(--color-muted)]">
            <th className="pb-2">Event</th>
            <th className="pb-2">Type</th>
            <th className="pb-2">Organizer</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Team</th>
            <th className="pb-2">Ticket</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id} className="border-t border-[var(--color-border)]">
              <td className="py-3 font-medium">
                <Link
                  to={`/participant/events/${r.event?._id}`}
                  className="hover:text-[var(--color-primary)]"
                >
                  {r.event?.eventName}
                </Link>
              </td>
              <td className="py-3 capitalize">{r.event?.eventCategory}</td>
              <td className="py-3">
                {r.event?.organizer?.firstName} {r.event?.organizer?.lastName}
              </td>
              <td className="py-3">
                <Badge className={statusBadge[r.registrationStatus] || "bg-gray-100 text-gray-700"}>
                  {r.registrationStatus}
                </Badge>
              </td>
              <td className="py-3">{r.team ? "Team entry" : "-"}</td>
              <td className="py-3">
                <button
                  onClick={() => onTicketClick(r)}
                  className="font-mono text-xs text-[var(--color-primary)] underline"
                >
                  {r.ticketId?.slice(0, 8)}...
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const OrdersTable = ({ orders }) => {
  if (!orders.length) {
    return (
      <p className="py-10 text-center text-sm text-[var(--color-muted)]">
        No merchandise orders yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-[var(--color-muted)]">
            <th className="pb-2">Item</th>
            <th className="pb-2">Qty</th>
            <th className="pb-2">Total</th>
            <th className="pb-2">Status</th>
            <th className="pb-2">Ordered</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-t border-[var(--color-border)]">
              <td className="py-3 font-medium">{o.merchandise?.name}</td>
              <td className="py-3">{o.quantity}</td>
              <td className="py-3">₹{o.totalPrice}</td>
              <td className="py-3">
                <Badge
                  className={
                    o.paymentStatus === "Approved"
                      ? "bg-green-50 text-green-700"
                      : o.paymentStatus === "Rejected"
                      ? "bg-red-50 text-red-700"
                      : "bg-amber-50 text-amber-700"
                  }
                >
                  {o.paymentStatus}
                </Badge>
              </td>
              <td className="py-3">{formatDate(o.createdAt, "d MMM yyyy")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
