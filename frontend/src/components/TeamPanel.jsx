import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlus, Crown, MessageCircle } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input, { Label } from "@/components/ui/Input";
import { useAuth } from "@/context/AuthContext";

// Tier A-1 dependency: Hackathon Team Registration. Team Chat (Tier B-3)
// only unlocks once a team is fully registered here.
const TeamPanel = ({ event, onRegistered }) => {
  const { user } = useAuth();
  const [team, setTeam] = useState(null);
  const [teamName, setTeamName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadTeam = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/teams");
      const mine = (data.teams || []).find(
        (t) =>
          t.event?._id === event._id &&
          (t.leader?._id === user.id ||
            t.members?.some((m) => m._id === user.id))
      );
      setTeam(mine || null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event._id]);

  const isLeader = team?.leader?._id === user.id;

  const createTeam = async () => {
    if (!teamName.trim()) return toast.error("Enter a team name.");
    setBusy(true);
    try {
      await api.post("/teams", {
        teamName,
        event: event._id,
        maxMembers: event.maxTeamSize || 4,
      });
      toast.success("Team created! Invite your teammates.");
      setTeamName("");
      loadTeam();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return toast.error("Enter an email address.");
    setBusy(true);
    try {
      await api.post("/invitations/send", {
        teamId: team._id,
        receiverEmail: inviteEmail,
      });
      toast.success("Invitation sent.");
      setInviteEmail("");
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const registerTeam = async () => {
    setBusy(true);
    try {
      await api.post(`/team-registration/${team._id}/${event._id}`);
      toast.success("Team registered! A ticket has been generated.");
      onRegistered?.();
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody>Loading team info...</CardBody>
      </Card>
    );
  }

  if (!team) {
    return (
      <Card>
        <CardBody className="space-y-3">
          <p className="text-sm font-semibold">Create a team to register</p>
          <p className="text-xs text-[var(--color-muted)]">
            Team size: {event.minTeamSize}–{event.maxTeamSize} members.
          </p>
          <Label>Team Name</Label>
          <Input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="e.g. Byte Force"
          />
          <Button className="w-full" loading={busy} onClick={createTeam}>
            Create Team
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">{team.teamName}</p>
          {team.isRegistered && (
            <span className="rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
              Registered
            </span>
          )}
        </div>

        <ul className="space-y-1.5">
          {team.members?.map((m) => (
            <li key={m._id} className="flex items-center gap-2 text-sm">
              {m._id === team.leader?._id && (
                <Crown className="h-3.5 w-3.5 text-[var(--color-accent)]" />
              )}
              {m.firstName} {m.lastName}
            </li>
          ))}
        </ul>

        {team.isRegistered ? (
          <Link to={`/participant/teams/${team._id}/chat`}>
            <Button variant="accent" className="w-full">
              <MessageCircle className="h-4 w-4" /> Open Team Chat
            </Button>
          </Link>
        ) : (
          <>
            {isLeader && (
              <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
                <Label>Invite by Email</Label>
                <div className="flex gap-2">
                  <Input
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@email.com"
                  />
                  <Button variant="outline" loading={busy} onClick={sendInvite}>
                    <UserPlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {isLeader ? (
              <Button
                className="w-full"
                loading={busy}
                disabled={
                  team.members.length < event.minTeamSize ||
                  team.members.length > event.maxTeamSize
                }
                onClick={registerTeam}
              >
                Register Team ({team.members.length}/{event.maxTeamSize})
              </Button>
            ) : (
              <p className="text-xs text-[var(--color-muted)]">
                Only the team leader can complete registration.
              </p>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
};

export default TeamPanel;
