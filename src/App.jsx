import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import RegisterVolunteer from './pages/RegisterVolunteer.jsx';
import RegisterOrganization from './pages/RegisterOrganization.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import TasksPage from './pages/TasksPage.jsx';
import TaskDetailPage from './pages/TaskDetailPage.jsx';
import AssignmentsPage from './pages/AssignmentsPage.jsx';
import MatchingPage from './pages/MatchingPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import VolunteersPage from './pages/VolunteersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import EventsPage from './pages/EventsPage.jsx';
import EventDetailPage from './pages/EventDetailPage.jsx';
import SubscriptionPage from './pages/SubscriptionPage.jsx';
import TrackingMapPage from './pages/TrackingMapPage.jsx';
import IncidentsPage from './pages/IncidentsPage.jsx';
import PasswordResetPage from './pages/PasswordResetPage.jsx';
import TeamManagementPage from './pages/TeamManagementPage.jsx';
import TaskValidationPage from './pages/TaskValidationPage.jsx';
import BroadcastPage from './pages/BroadcastPage.jsx';
import AuditPage from './pages/AuditPage.jsx';
import PredictiveStaffingPage from './pages/PredictiveStaffingPage.jsx';
import CertificatesPage from './pages/CertificatesPage.jsx';
import RankingPage from './pages/RankingPage.jsx';
import VolunteerTrackingPage from './pages/VolunteerTrackingPage.jsx';

const App = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />
    <Route path="/auth">
      <Route path="login" element={<Login />} />
      <Route path="password/reset" element={<PasswordResetPage />} />
      <Route path="register">
        <Route path="volunteer" element={<RegisterVolunteer />} />
        <Route path="organization" element={<RegisterOrganization />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/dashboard/events" element={<EventsPage />} />
        <Route path="/dashboard/events/:eventId" element={<EventDetailPage />} />
        <Route path="/dashboard/events/:eventId/tracking" element={<TrackingMapPage />} />
        <Route path="/dashboard/tasks" element={<TasksPage />} />
        <Route path="/dashboard/tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="/dashboard/tasks/:taskId/validate" element={<TaskValidationPage />} />
        <Route path="/dashboard/assignments" element={<AssignmentsPage />} />
        <Route path="/dashboard/team" element={<TeamManagementPage />} />
        <Route path="/dashboard/broadcast" element={<BroadcastPage />} />
        <Route path="/dashboard/predictive-staffing" element={<PredictiveStaffingPage />} />
        <Route path="/dashboard/audit" element={<AuditPage />} />
        <Route path="/dashboard/calendar" element={<CalendarPage />} />
        <Route path="/dashboard/matching" element={<MatchingPage />} />
        <Route path="/dashboard/gamification" element={<GamificationPage />} />
        <Route path="/dashboard/ranking" element={<RankingPage />} />
        <Route path="/dashboard/tracking" element={<VolunteerTrackingPage />} />
        <Route path="/dashboard/badges" element={<BadgesPage />} />
        <Route path="/dashboard/reports" element={<ReportsPage />} />
        <Route path="/dashboard/volunteers" element={<VolunteersPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
        <Route path="/dashboard/subscription" element={<SubscriptionPage />} />
        <Route path="/dashboard/incidents" element={<IncidentsPage />} />
        <Route path="/dashboard/certificates" element={<CertificatesPage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;
