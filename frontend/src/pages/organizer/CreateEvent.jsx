import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Trash2, Save, Rocket } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Input, { Label, Select, Textarea } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormBuilder from "@/components/FormBuilder";
import { EVENT_CATEGORIES, ELIGIBILITY_OPTIONS } from "@/lib/constants";

const empty = {
  eventName: "",
  description: "",
  eventCategory: "technical",
  registrationType: "individual",
  minTeamSize: 1,
  maxTeamSize: 4,
  eligibility: "All",
  registrationDeadline: "",
  startDate: "",
  endDate: "",
  mode: "Offline",
  venue: "",
  prizePool: 0,
  registrationLimit: 100,
  registrationFee: 0,
  eventTags: "",
  rules: [""],
  coordinators: [{ name: "", phone: "", email: "" }],
};

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 16) : "");

const CreateEvent = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [customFields, setCustomFields] = useState([]);
  const [status, setStatus] = useState("draft");
  const [formLocked, setFormLocked] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isEdit) return;

    api.get(`/events/${id}`).then(({ data }) => {
      const e = data.event;
      setForm({
        ...empty,
        ...e,
        registrationDeadline: toDateInput(e.registrationDeadline),
        startDate: toDateInput(e.startDate),
        endDate: toDateInput(e.endDate),
        eventTags: (e.eventTags || []).join(", "),
        rules: e.rules?.length ? e.rules : [""],
        coordinators: e.coordinators?.length
          ? e.coordinators
          : [{ name: "", phone: "", email: "" }],
      });
      setCustomFields(e.customFields || []);
      setStatus(e.status);
      setFormLocked(e.formLocked);
      setLoading(false);
    });
  }, [id, isEdit]);

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const isDraft = !isEdit || status === "draft";

  const buildPayload = (nextStatus) => ({
    ...form,
    eventTags: form.eventTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    rules: form.rules.filter((r) => r.trim()),
    coordinators: form.coordinators.filter((c) => c.name && c.phone),
    customFields,
    status: nextStatus,
  });

  const submit = async (nextStatus) => {
    setSaving(true);
    try {
      const payload = buildPayload(nextStatus);

      if (isEdit) {
        await api.put(`/events/${id}`, payload);
        toast.success("Event updated.");
      } else {
        const { data } = await api.post("/events", payload);
        toast.success(
          nextStatus === "published" ? "Event published!" : "Draft saved."
        );
        navigate(`/organizer/events/${data.event._id}`);
        return;
      }

      navigate(`/organizer/events/${id}`);
    } catch (error) {
      toast.error(apiMessage(error, "Could not save event."));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader label="Loading event..." />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
          {isEdit ? "Edit Event" : "Create Event"}
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          {isDraft
            ? "Fill in the details below, save as draft, or publish when ready."
            : "This event is published — only a few fields can still be changed."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Basic Information</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div>
            <Label required>Event Name</Label>
            <Input
              disabled={!isDraft}
              value={form.eventName}
              onChange={(e) => set({ eventName: e.target.value })}
            />
          </div>
          <div>
            <Label required>Event Description</Label>
            <Textarea
              rows={4}
              disabled={!isDraft}
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label required>Event Type</Label>
              <Select
                disabled={!isDraft}
                value={form.eventCategory}
                onChange={(e) => set({ eventCategory: e.target.value })}
              >
                {EVENT_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label required>Registration Type</Label>
              <Select
                disabled={!isDraft}
                value={form.registrationType}
                onChange={(e) => set({ registrationType: e.target.value })}
              >
                <option value="individual">Individual (Normal)</option>
                <option value="team">Team (Hackathon-style)</option>
              </Select>
            </div>
          </div>

          {form.registrationType === "team" && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Minimum Team Size</Label>
                <Input
                  type="number"
                  min={1}
                  disabled={!isDraft}
                  value={form.minTeamSize}
                  onChange={(e) => set({ minTeamSize: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Maximum Team Size</Label>
                <Input
                  type="number"
                  min={1}
                  disabled={!isDraft}
                  value={form.maxTeamSize}
                  onChange={(e) => set({ maxTeamSize: Number(e.target.value) })}
                />
              </div>
            </div>
          )}

          <div>
            <Label required>Eligibility</Label>
            <Select
              disabled={!isDraft}
              value={form.eligibility}
              onChange={(e) => set({ eligibility: e.target.value })}
            >
              {ELIGIBILITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Schedule & Venue</h2>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Registration Deadline</Label>
            <Input
              type="datetime-local"
              value={form.registrationDeadline}
              onChange={(e) => set({ registrationDeadline: e.target.value })}
            />
          </div>
          <div>
            <Label required>Event Start Date</Label>
            <Input
              type="datetime-local"
              disabled={!isDraft}
              value={form.startDate}
              onChange={(e) => set({ startDate: e.target.value })}
            />
          </div>
          <div>
            <Label required>Event End Date</Label>
            <Input
              type="datetime-local"
              value={form.endDate}
              onChange={(e) => set({ endDate: e.target.value })}
            />
          </div>
          <div>
            <Label>Mode</Label>
            <Select
              disabled={!isDraft}
              value={form.mode}
              onChange={(e) => set({ mode: e.target.value })}
            >
              <option>Offline</option>
              <option>Online</option>
              <option>Hybrid</option>
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label>Venue</Label>
            <Input
              disabled={!isDraft}
              value={form.venue}
              onChange={(e) => set({ venue: e.target.value })}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Registration & Pricing</h2>
        </CardHeader>
        <CardBody className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label required>Registration Limit</Label>
            <Input
              type="number"
              value={form.registrationLimit}
              onChange={(e) => set({ registrationLimit: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label required>Registration Fee (₹)</Label>
            <Input
              type="number"
              disabled={!isDraft}
              value={form.registrationFee}
              onChange={(e) => set({ registrationFee: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Prize Pool (₹)</Label>
            <Input
              type="number"
              disabled={!isDraft}
              value={form.prizePool}
              onChange={(e) => set({ prizePool: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label>Event Tags (comma separated)</Label>
            <Input
              disabled={!isDraft}
              value={form.eventTags}
              onChange={(e) => set({ eventTags: e.target.value })}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Rules</h2>
        </CardHeader>
        <CardBody className="space-y-2">
          {form.rules.map((rule, i) => (
            <div key={i} className="flex gap-2">
              <Input
                disabled={!isDraft}
                value={rule}
                placeholder={`Rule ${i + 1}`}
                onChange={(e) => {
                  const rules = [...form.rules];
                  rules[i] = e.target.value;
                  set({ rules });
                }}
              />
              {isDraft && (
                <button
                  onClick={() => set({ rules: form.rules.filter((_, x) => x !== i) })}
                  className="text-[var(--color-danger)]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          {isDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => set({ rules: [...form.rules, ""] })}
            >
              <Plus className="h-4 w-4" /> Add Rule
            </Button>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold">Coordinators</h2>
        </CardHeader>
        <CardBody className="space-y-3">
          {form.coordinators.map((c, i) => (
            <div key={i} className="grid gap-2 rounded-xl bg-[var(--color-paper)] p-3 sm:grid-cols-3">
              <Input
                disabled={!isDraft}
                placeholder="Name"
                value={c.name}
                onChange={(e) => {
                  const coordinators = [...form.coordinators];
                  coordinators[i] = { ...c, name: e.target.value };
                  set({ coordinators });
                }}
              />
              <Input
                disabled={!isDraft}
                placeholder="Phone"
                value={c.phone}
                onChange={(e) => {
                  const coordinators = [...form.coordinators];
                  coordinators[i] = { ...c, phone: e.target.value };
                  set({ coordinators });
                }}
              />
              <Input
                disabled={!isDraft}
                placeholder="Email (optional)"
                value={c.email}
                onChange={(e) => {
                  const coordinators = [...form.coordinators];
                  coordinators[i] = { ...c, email: e.target.value };
                  set({ coordinators });
                }}
              />
            </div>
          ))}
          {isDraft && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                set({
                  coordinators: [...form.coordinators, { name: "", phone: "", email: "" }],
                })
              }
            >
              <Plus className="h-4 w-4" /> Add Coordinator
            </Button>
          )}
        </CardBody>
      </Card>

      {form.registrationType === "individual" && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">
              Custom Registration Form Builder
            </h2>
          </CardHeader>
          <CardBody>
            <FormBuilder
              fields={customFields}
              onChange={setCustomFields}
              locked={formLocked}
            />
          </CardBody>
        </Card>
      )}

      <div className="flex flex-wrap justify-end gap-3">
        {isDraft && (
          <Button variant="outline" loading={saving} onClick={() => submit("draft")}>
            <Save className="h-4 w-4" /> Save as Draft
          </Button>
        )}
        {status !== "published" && status !== "ongoing" && status !== "completed" && (
          <Button loading={saving} onClick={() => submit("published")}>
            <Rocket className="h-4 w-4" /> Publish Event
          </Button>
        )}
        {!isDraft && (
          <Button loading={saving} onClick={() => submit(status)}>
            <Save className="h-4 w-4" /> Save Changes
          </Button>
        )}
      </div>
    </div>
  );
};

export default CreateEvent;
