import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, SkipForward } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Button from "@/components/ui/Button";
import Loader from "@/components/Loader";
import { INTEREST_OPTIONS } from "@/lib/constants";
import { cn, initials } from "@/lib/utils";

// Section 5: User Onboarding & Preferences (participants only, skippable,
// editable later from Profile).
const Onboarding = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [interests, setInterests] = useState([]);
  const [follows, setFollows] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/organizer/profile/all")
      .then(({ data }) => setOrganizers(data.organizers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggle = (list, setList, value) => {
    setList((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const finish = async (skip = false) => {
    setSaving(true);
    try {
      const { data } = await api.put("/auth/me", {
        interests: skip ? [] : interests,
        followedOrganizers: skip ? [] : follows,
      });
      updateUser({ interests: data.user.interests });
      toast.success(skip ? "Skipped for now" : "Preferences saved!");
      navigate("/participant");
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader full label="Getting things ready..." />;

  return (
    <div className="min-h-screen bg-[var(--color-paper)] px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
            Personalize your Recstacy experience
          </h1>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            Pick a few interests and clubs to follow — this helps us surface
            events you'll actually care about. You can change these anytime
            from your Profile.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--color-border)] bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
            Areas of Interest
          </h2>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => {
              const active = interests.includes(interest);
              return (
                <button
                  key={interest}
                  onClick={() => toggle(interests, setInterests, interest)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
                    active
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] text-[var(--color-ink)] hover:bg-[var(--color-paper)]"
                  )}
                >
                  {active && <Check className="h-3.5 w-3.5" />}
                  {interest}
                </button>
              );
            })}
          </div>

          <hr className="my-6 border-[var(--color-border)]" />

          <h2 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">
            Clubs / Organizers to Follow
          </h2>
          {organizers.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">
              No clubs available yet — you can follow them later from the
              Clubs page.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {organizers.map((org) => {
                const active = follows.includes(org._id);
                return (
                  <button
                    key={org._id}
                    onClick={() => toggle(follows, setFollows, org._id)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition",
                      active
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                        : "border-[var(--color-border)] hover:bg-[var(--color-paper)]"
                    )}
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xs font-semibold text-[var(--color-primary-dark)]">
                      {initials(org.firstName, org.lastName)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">
                        {org.firstName} {org.lastName}
                      </span>
                      <span className="block truncate text-xs text-[var(--color-muted)]">
                        {org.category || "Club / Organizer"}
                      </span>
                    </span>
                    {active && (
                      <Check className="ml-auto h-4 w-4 shrink-0 text-[var(--color-primary)]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => finish(true)}
              disabled={saving}
            >
              <SkipForward className="h-4 w-4" /> Skip for now
            </Button>
            <Button onClick={() => finish(false)} loading={saving}>
              Save & Continue
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
