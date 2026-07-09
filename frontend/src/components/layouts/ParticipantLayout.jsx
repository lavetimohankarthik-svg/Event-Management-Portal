import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

const ITEMS = [
  { to: "/participant", label: "Dashboard", end: true },
  { to: "/participant/events", label: "Browse Events" },
  { to: "/participant/merchandise", label: "Merchandise" },
  { to: "/participant/clubs", label: "Clubs/Organizers" },
  { to: "/participant/teams", label: "Teams" },
  { to: "/participant/profile", label: "Profile" },
];

const ParticipantLayout = () => (
  <div className="min-h-screen bg-[var(--color-paper)]">
    <NavBar items={ITEMS} homePath="/participant" />
    <main className="container-page py-8">
      <Outlet />
    </main>
  </div>
);

export default ParticipantLayout;
