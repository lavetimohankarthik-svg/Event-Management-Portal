import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { ProtectedRoute, RoleRoute, GuestRoute } from "@/components/ProtectedRoute";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import Onboarding from "@/pages/auth/Onboarding";

import ParticipantLayout from "@/components/layouts/ParticipantLayout";
import ParticipantDashboard from "@/pages/participant/Dashboard";
import BrowseEvents from "@/pages/participant/BrowseEvents";
import EventDetails from "@/pages/participant/EventDetails";
import ParticipantMerchandise from "@/pages/participant/Merchandise";
import Clubs from "@/pages/participant/Clubs";
import ClubDetail from "@/pages/participant/ClubDetail";
import Teams from "@/pages/participant/Teams";
import TeamChat from "@/pages/participant/TeamChat";
import ParticipantProfile from "@/pages/participant/Profile";

import OrganizerLayout from "@/components/layouts/OrganizerLayout";
import OrganizerDashboard from "@/pages/organizer/Dashboard";
import CreateEvent from "@/pages/organizer/CreateEvent";
import OrganizerEventDetail from "@/pages/organizer/EventDetail";
import OrganizerMerchandise from "@/pages/organizer/Merchandise";
import OngoingEvents from "@/pages/organizer/OngoingEvents";
import OrganizerProfile from "@/pages/organizer/Profile";

import AdminLayout from "@/components/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin/Dashboard";
import ManageOrganizers from "@/pages/admin/ManageOrganizers";
import PasswordResetRequests from "@/pages/admin/PasswordResetRequests";

import NotFound from "@/pages/NotFound";

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />

      <Routes>
        {/* Guest-only (auth) routes */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Onboarding is reachable right after registration, before the
            dashboard, but still requires a session */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<Onboarding />} />
        </Route>

        {/* Participant */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allow={["participant"]} />}>
            <Route path="/participant" element={<ParticipantLayout />}>
              <Route index element={<ParticipantDashboard />} />
              <Route path="events" element={<BrowseEvents />} />
              <Route path="events/:id" element={<EventDetails />} />
              <Route path="merchandise" element={<ParticipantMerchandise />} />
              <Route path="clubs" element={<Clubs />} />
              <Route path="clubs/:id" element={<ClubDetail />} />
              <Route path="teams" element={<Teams />} />
              <Route path="teams/:teamId/chat" element={<TeamChat />} />
              <Route path="profile" element={<ParticipantProfile />} />
            </Route>
          </Route>
        </Route>

        {/* Organizer */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allow={["organizer"]} />}>
            <Route path="/organizer" element={<OrganizerLayout />}>
              <Route index element={<OrganizerDashboard />} />
              <Route path="events/create" element={<CreateEvent />} />
              <Route path="events/:id/edit" element={<CreateEvent />} />
              <Route path="events/:id" element={<OrganizerEventDetail />} />
              <Route path="events/ongoing" element={<OngoingEvents />} />
              <Route path="merchandise" element={<OrganizerMerchandise />} />
              <Route path="profile" element={<OrganizerProfile />} />
            </Route>
          </Route>
        </Route>

        {/* Admin */}
        <Route element={<ProtectedRoute />}>
          <Route element={<RoleRoute allow={["admin"]} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="organizers" element={<ManageOrganizers />} />
              <Route path="password-resets" element={<PasswordResetRequests />} />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;
