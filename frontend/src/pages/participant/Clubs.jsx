import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { UserPlus, UserMinus } from "lucide-react";
import api, { apiMessage } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Loader from "@/components/Loader";
import { Card, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { initials } from "@/lib/utils";

const Clubs = () => {
  const { user, updateUser } = useAuth();
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const followed = new Set(
    (user?.followedOrganizers || []).map((o) => o._id || o)
  );

  useEffect(() => {
    api
      .get("/organizer/profile/all")
      .then(({ data }) => setOrganizers(data.organizers || []))
      .finally(() => setLoading(false));
  }, []);

  const toggleFollow = async (organizerId) => {
    setBusyId(organizerId);
    try {
      if (followed.has(organizerId)) {
        await api.delete(`/organizer/profile/${organizerId}/unfollow`);
        updateUser({
          followedOrganizers: [...followed].filter((id) => id !== organizerId),
        });
        toast.success("Unfollowed.");
      } else {
        await api.post(`/organizer/profile/${organizerId}/follow`);
        updateUser({ followedOrganizers: [...followed, organizerId] });
        toast.success("Followed!");
      }
    } catch (error) {
      toast.error(apiMessage(error));
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <Loader label="Loading clubs..." />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-primary-dark)]">
          Clubs & Organizers
        </h1>
        <p className="text-sm text-[var(--color-muted)]">
          Follow clubs to get their events prioritized in your feed.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {organizers.map((org) => {
          const isFollowing = followed.has(org._id);
          return (
            <Card key={org._id}>
              <CardBody className="space-y-3">
                <Link
                  to={`/participant/clubs/${org._id}`}
                  className="flex items-center gap-3"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent-soft)] font-semibold text-[var(--color-primary-dark)]">
                    {initials(org.firstName, org.lastName)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {org.firstName} {org.lastName}
                    </p>
                    <p className="truncate text-xs text-[var(--color-muted)]">
                      {org.category || "Club / Organizer"}
                    </p>
                  </div>
                </Link>
                {org.description && (
                  <p className="line-clamp-2 text-xs text-[var(--color-muted)]">
                    {org.description}
                  </p>
                )}
                <Button
                  size="sm"
                  variant={isFollowing ? "outline" : "primary"}
                  className="w-full"
                  loading={busyId === org._id}
                  onClick={() => toggleFollow(org._id)}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="h-4 w-4" /> Unfollow
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" /> Follow
                    </>
                  )}
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Clubs;
