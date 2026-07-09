import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

const ITEMS = [
  { to: "/organizer", label: "Dashboard", end: true },
  { to: "/organizer/events/create", label: "Create Event" },
  { to: "/organizer/events/ongoing", label: "Ongoing Events" },
  { to: "/organizer/merchandise", label: "Merchandise" },
  { to: "/organizer/profile", label: "Profile" },
];

const OrganizerLayout = () => (
  <div className="min-h-screen bg-[var(--color-paper)]">
    <NavBar items={ITEMS} homePath="/organizer" />
    <main className="container-page py-8">
      <Outlet />
    </main>
  </div>
);

export default OrganizerLayout;
