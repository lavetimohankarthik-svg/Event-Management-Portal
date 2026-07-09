import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Check, X, MessageCircle, Crown } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import Loader from "@/components/Loader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

const Teams = () => {
  const { user } = useAuth();
  const [teams, setTeams] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: teamsRes }, { data: invRes }] = await Promise.all([
        api.get("/teams"),
        api.get("/invitations/my"),
      ]);

      const mine = (teamsRes.teams || []).filter(
        (t) =>
          t.leader?._id === user.id || t.members?.some((m) => m._id === user.id)
      );

      setTeams(mine);
      setInvitations(invRes.invitations || []);
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const respond = async (id, action) => {
    try {
      await api.patch(`/invitations/${id}/${action}`);
      toast.success(action === "accept" ? "Joined the team!" : "Invitation declined.");
      load();
    } catch (error) {
      toast.error(apiMessage(error));
    }
  };

  if (loading) return <Loader label="Loading your teams..." />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
          My Teams
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Manage hackathon teams and invitations for team-based events.
        </p>
      </div>

      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold">Pending Invitations</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {invitations.map((inv) => (
              <div
                key={inv._id}
                className="flex items-center justify-between rounded-xl border border-[var(--color-border)] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">{inv.team?.teamName}</p>
                  <p className="text-xs text-[var(--color-muted)]">
                    Invited by {inv.sender?.firstName} {inv.sender?.lastName}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => respond(inv._id, "accept")}>
                    <Check className="h-4 w-4" /> Accept
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => respond(inv._id, "reject")}
                  >
                    <X className="h-4 w-4" /> Decline
                  </Button>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {teams.length === 0 ? (
        <p className="py-10 text-center text-sm text-[var(--color-muted)]">
          You haven't joined any teams yet. Team formation happens from a
          team-based event's details page.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {teams.map((team) => (
            <Card key={team._id}>
              <CardBody className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold">{team.teamName}</p>
                  {team.isRegistered && (
                    <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                      Registered
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--color-muted)]">
                  Event: {team.event?.eventName}
                </p>
                <ul className="space-y-1">
                  {team.members?.map((m) => (
                    <li key={m._id} className="flex items-center gap-1.5 text-sm">
                      {m._id === team.leader?._id && (
                        <Crown className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                      )}
                      {m.firstName} {m.lastName}
                    </li>
                  ))}
                </ul>
                {team.isRegistered && (
                  <Link to={`/participant/teams/${team._id}/chat`}>
                    <Button variant="accent" size="sm" className="w-full">
                      <MessageCircle className="h-4 w-4" /> Team Chat
                    </Button>
                  </Link>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
