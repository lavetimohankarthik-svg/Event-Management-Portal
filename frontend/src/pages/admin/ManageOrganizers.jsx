import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Plus, Trash2, Copy } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody, CardHeader, Badge } from "@/components/ui/Card";
import Input, { Label } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";

const emptyForm = { firstName: "", lastName: "", email: "", phoneNumber: "" };

const ManageOrganizers = () => {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [creating, setCreating] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    api
      .get("/admin/organizers")
      .then(({ data }) => setOrganizers(data.organizers || []))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const createOrganizer = async () => {
    if (!form.firstName || !form.lastName || !form.email) {
      toast.error("First name, last name, and email are required.");
      return;
    }
    setCreating(true);
    try {
      const { data } = await api.post("/admin/create-organizer", form);
      setCredentials({ email: data.organizer.email, password: data.temporaryPassword });
      setForm(emptyForm);
      load();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setCreating(false);
    }
  };

  const removeOrganizer = async (id) => {
    setBusyId(id);
    try {
      await api.delete(`/admin/organizer/${id}`);
      toast.success("Organizer disabled.");
      load();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const enableOrganizer = async (id) => {
    setBusyId(id);
    try {
      await api.put(`/admin/organizer/${id}/enable`);
      toast.success("Organizer enabled.");
      load();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  const copyCreds = () => {
    navigator.clipboard.writeText(
      `Email: ${credentials.email}\nPassword: ${credentials.password}`
    );
    toast.success("Copied to clipboard.");
  };

  if (loading) return <Loader label="Loading organizers..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
          Manage Clubs / Organizers
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Organizer accounts don't self-register — provision them here.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Add New Club / Organizer</h2>
        </CardHeader>
        <CardBody className="grid gap-3 sm:grid-cols-2">
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
            <Label required>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <Label>Contact Number</Label>
            <Input
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
            />
          </div>
          <div className="flex items-end sm:col-span-2">
            <Button loading={creating} onClick={createOrganizer}>
              <Plus className="h-4 w-4" /> Create Organizer
            </Button>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">All Organizers</h2>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-[var(--color-muted)]">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Status</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {organizers.map((org) => (
                <tr key={org._id} className="border-t border-[var(--color-border)]">
                  <td className="py-2.5 font-medium">
                    {org.firstName} {org.lastName}
                  </td>
                  <td className="py-2.5">{org.email}</td>
                  <td className="py-2.5">
                    <Badge
                      className={
                        org.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-red-50 text-red-700"
                      }
                    >
                      {org.isActive ? "Active" : "Disabled"}
                    </Badge>
                  </td>
                  <td className="py-2.5 text-right">
                    {org.isActive ? (
                      <Button
                        size="sm"
                        variant="danger"
                        loading={busyId === org._id}
                        onClick={() => removeOrganizer(org._id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Disable
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        loading={busyId === org._id}
                        onClick={() => enableOrganizer(org._id)}
                      >
                        Enable
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      <Dialog.Root open={!!credentials} onOpenChange={(open) => !open && setCredentials(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <Dialog.Title className="text-base font-semibold">
                Organizer Created
              </Dialog.Title>
              <Dialog.Close>
                <X className="h-4 w-4 text-[var(--color-muted)]" />
              </Dialog.Close>
            </div>
            <p className="mb-3 text-sm text-[var(--color-muted)]">
              Share these credentials with the club securely — this password
              won't be shown again.
            </p>
            <div className="space-y-2 rounded-lg bg-[var(--color-paper)] p-3 text-sm">
              <p>
                <span className="text-[var(--color-muted)]">Email: </span>
                {credentials?.email}
              </p>
              <p>
                <span className="text-[var(--color-muted)]">Password: </span>
                <span className="font-mono">{credentials?.password}</span>
              </p>
            </div>
            <Button className="mt-4 w-full" variant="outline" onClick={copyCreds}>
              <Copy className="h-4 w-4" /> Copy Credentials
            </Button>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default ManageOrganizers;
