import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Check, KeyRound } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Input, { Label, FieldError } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { INTEREST_OPTIONS } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    collegeName: user?.collegeName || "",
  });
  const [interests, setInterests] = useState(user?.interests || []);
  const [follows, setFollows] = useState(
    (user?.followedOrganizers || []).map((o) => o._id || o)
  );
  const [saving, setSaving] = useState(false);

  const [pw, setPw] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    api
      .get("/organizer/profile/all")
      .then(({ data }) => setOrganizers(data.organizers || []))
      .finally(() => setLoading(false));
  }, []);

  const toggle = (list, setList, value) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await api.put("/auth/me", {
        ...form,
        interests,
        followedOrganizers: follows,
      });
      updateUser(data.user);
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwError("");
    if (pw.newPassword !== pw.confirm) {
      setPwError("New passwords do not match.");
      return;
    }
    if (pw.newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }

    setPwSaving(true);
    try {
      await api.put("/auth/password", {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      toast.success("Password changed successfully.");
      setPw({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return <Loader label="Loading profile..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">Profile</h1>
        <p className="text-sm text-[var(--color-muted)]">
          Manage your account details and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Account Details</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label required>First Name</Label>
              <Input
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              />
            </div>
            <div>
              <Label required>Last Name</Label>
              <Input
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              />
            </div>
            <div>
              <Label>Email Address (not editable)</Label>
              <Input value={user?.email} disabled />
            </div>
            <div>
              <Label>Participant Type (not editable)</Label>
              <Input value={user?.participantType} disabled />
            </div>
            <div>
              <Label>Contact Number</Label>
              <Input
                value={form.phoneNumber}
                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>
            <div>
              <Label>College / Organization Name</Label>
              <Input
                value={form.collegeName}
                onChange={(e) => setForm({ ...form, collegeName: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label>Areas of Interest</Label>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const active = interests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggle(interests, setInterests, interest)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition",
                      active
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border)]"
                    )}
                  >
                    {active && <Check className="h-3 w-3" />}
                    {interest}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <Label>Followed Clubs</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              {organizers.map((org) => {
                const active = follows.includes(org._id);
                return (
                  <button
                    key={org._id}
                    onClick={() => toggle(follows, setFollows, org._id)}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm",
                      active
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--color-border)]"
                    )}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[10px] font-semibold text-[var(--color-primary-dark)]">
                      {initials(org.firstName, org.lastName)}
                    </span>
                    {org.firstName} {org.lastName}
                    {active && <Check className="ml-auto h-3.5 w-3.5 text-[var(--color-primary)]" />}
                  </button>
                );
              })}
            </div>
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
        <CardBody className="max-w-sm space-y-3">
          <div>
            <Label>Current Password</Label>
            <Input
              type="password"
              value={pw.currentPassword}
              onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })}
            />
          </div>
          <div>
            <Label>New Password</Label>
            <Input
              type="password"
              value={pw.newPassword}
              onChange={(e) => setPw({ ...pw, newPassword: e.target.value })}
            />
          </div>
          <div>
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={pw.confirm}
              onChange={(e) => setPw({ ...pw, confirm: e.target.value })}
            />
          </div>
          <FieldError message={pwError} />
          <Button variant="outline" loading={pwSaving} onClick={changePassword}>
            Update Password
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};

export default Profile;
