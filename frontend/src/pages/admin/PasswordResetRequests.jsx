import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, X, KeyRound } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody, Badge } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";

const STATUS_STYLE = {
  Pending: "bg-amber-50 text-amber-700",
  Approved: "bg-green-50 text-green-700",
  Rejected: "bg-red-50 text-red-700",
};

// Organizers request a password change here, and the Admin approves/rejects it.
// Once approved, the organizer's account password is updated to the requested one.
const PasswordResetRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/password-reset");
      setRequests(data.requests || []);
    } catch (error) {
      toast.error(apiMessage(error, "Couldn't load requests."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const act = async (id, action) => {
    setBusyId(id);
    try {
      const { data } = await api.put(`/password-reset/${action}/${id}`);
      toast.success(
        action === "approve"
          ? "Approved. The organizer's requested password has been applied."
          : "Request rejected."
      );
      load();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader label="Loading password reset requests..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
          Password Reset Requests
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Organizer accounts are provisioned by Admin, so password resets
          must be requested here too.
        </p>
      </div>

      {requests.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--color-muted)]">
          No password reset requests yet.
        </p>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req._id}>
              <CardBody className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <KeyRound className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">
                      {req.organizer?.firstName} {req.organizer?.lastName}{" "}
                      <span className="text-[var(--color-muted)]">
                        ({req.organizer?.email})
                      </span>
                    </p>
                    <p className="text-xs text-[var(--color-muted)]">
                      Reason: {req.reason || "Not specified"} · Requested{" "}
                      {formatDate(req.requestedAt || req.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={STATUS_STYLE[req.status]}>
                    {req.status}
                  </Badge>

                  {req.status === "Pending" && (
                    <>
                      <Button
                        size="sm"
                        loading={busyId === req._id}
                        onClick={() => act(req._id, "approve")}
                      >
                        <Check className="h-4 w-4" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        loading={busyId === req._id}
                        onClick={() => act(req._id, "reject")}
                      >
                        <X className="h-4 w-4" /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordResetRequests;
