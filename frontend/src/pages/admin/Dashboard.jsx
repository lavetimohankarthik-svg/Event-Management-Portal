import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Building2, KeyRound, UserCheck, UserX } from "lucide-react";
import api from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody } from "@/components/ui/Card";

const AdminDashboard = () => {
  const [organizers, setOrganizers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/admin/organizers"),
      api.get("/password-reset").catch(() => ({ data: { requests: [] } })),
    ])
      .then(([orgRes, reqRes]) => {
        setOrganizers(orgRes.data.organizers || []);
        setRequests(reqRes.data.requests || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading dashboard..." />;

  const active = organizers.filter((o) => o.isActive).length;
  const disabled = organizers.length - active;
  const pendingRequests = requests.filter((r) => r.status === "Pending").length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
          Admin Dashboard
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Oversee clubs, organizers, and account requests fest-wide.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardBody className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
              <Building2 className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-semibold">{organizers.length}</p>
              <p className="text-xs text-[var(--color-muted)]">Total Clubs/Organizers</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <UserCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-semibold">{active}</p>
              <p className="text-xs text-[var(--color-muted)]">Active</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <UserX className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-semibold">{disabled}</p>
              <p className="text-xs text-[var(--color-muted)]">Disabled</p>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <KeyRound className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xl font-semibold">{pendingRequests}</p>
              <p className="text-xs text-[var(--color-muted)]">Pending Password Resets</p>
            </div>
          </CardBody>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          to="/admin/organizers"
          className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium shadow-sm hover:bg-[var(--color-paper)]"
        >
          Manage Clubs / Organizers →
        </Link>
        <Link
          to="/admin/password-resets"
          className="rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm font-medium shadow-sm hover:bg-[var(--color-paper)]"
        >
          Password Reset Requests →
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
