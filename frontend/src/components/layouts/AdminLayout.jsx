import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

const ITEMS = [
  { to: "/admin", label: "Dashboard", end: true },
  { to: "/admin/organizers", label: "Manage Clubs/Organizers" },
  { to: "/admin/password-resets", label: "Password Reset Requests" },
];

const AdminLayout = () => (
  <div className="min-h-screen bg-[var(--color-paper)]">
    <NavBar items={ITEMS} homePath="/admin" />
    <main className="container-page py-8">
      <Outlet />
    </main>
  </div>
);

export default AdminLayout;
