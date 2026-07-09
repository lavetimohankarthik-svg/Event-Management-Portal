import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { KeyRound } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Input, { Label, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";

const OrganizerProfile = () => {
  const { updateUser } = useAuth();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [reason, setReason] = useState("");
  const [requestedPassword, setRequestedPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requesting, setRequesting] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);


  useEffect(() => {
    api
      .get("/organizer/profile")
      .then(({ data }) => setForm(data.organizer))
      .finally(() => setLoading(false));
  }, []);

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/organizer/profile", form);
      updateUser(data.organizer);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const requestReset = async () => {
    if (!requestedPassword || requestedPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (requestedPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setRequesting(true);
    try {
      const { data } = await api.post("/password-reset/request", {
        reason,
        newPassword: requestedPassword,
      });
      setPendingRequest(data.request);
      setReason("");
      setRequestedPassword("");
      setConfirmPassword("");
      toast.success(
        "Request sent to the Admin. Your requested password will be applied once approved."
      );
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setRequesting(false);
    }
  };

  if (loading || !form) return <Loader label="Loading profile..." />;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
          Organizer Profile
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Your login email can't be changed — contact the Admin for that.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Organization Details</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Label>Login Email (not editable)</Label>
            <Input value={form.email} disabled />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Category</Label>
              <Input
                value={form.category || ""}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <Label>Contact Email</Label>
              <Input
                value={form.contactEmail || ""}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              />
            </div>
            <div>
              <Label>Contact Phone</Label>
              <Input
                value={form.contactPhone || ""}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              />
            </div>
            <div>
              <Label>Website</Label>
              <Input
                value={form.website || ""}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea
              rows={3}
              value={form.organizationDescription || ""}
              onChange={(e) =>
                setForm({ ...form, organizationDescription: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Discord Webhook URL</Label>
            <Input
              placeholder="https://discord.com/api/webhooks/..."
              value={form.discordWebhook || ""}
              onChange={(e) => setForm({ ...form, discordWebhook: e.target.value })}
            />
            <p className="mt-1 text-xs text-[var(--color-muted)]">
              New published events can be auto-posted to this Discord channel.
            </p>
          </div>
          <Button loading={saving} onClick={save}>
            Save Changes
          </Button>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="flex items-center gap-2 text-sm font-semibold">
            <KeyRound className="h-4 w-4" /> Security Settings
          </h2>
        </CardHeader>
        <CardBody className="max-w-md space-y-3">
          <p className="text-xs text-[var(--color-muted)]">
            Request a password change here. The Admin will review your request and
            apply the password you choose once approved.
          </p>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={requestedPassword}
              onChange={(e) => setRequestedPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <div>
            <Label>Reason for reset</Label>
            <Textarea
              rows={2}
              placeholder="e.g. Forgot my password"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <Button variant="outline" loading={requesting} onClick={requestReset}>
            Request Password Reset
          </Button>
          {pendingRequest && (
            <p className="text-xs text-[var(--color-success)]">
              Request submitted — status: {pendingRequest.status}.
            </p>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default OrganizerProfile;
