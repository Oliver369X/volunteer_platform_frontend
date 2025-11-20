import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import RegisterVolunteer from './pages/RegisterVolunteer.jsx';
import RegisterOrganization from './pages/RegisterOrganization.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import TasksPage from './pages/TasksPage.jsx';
import TaskDetailPage from './pages/TaskDetailPage.jsx';
import AssignmentsPage from './pages/AssignmentsPage.jsx';
import CompletedAssignmentsPage from './pages/CompletedAssignmentsPage.jsx';
import MatchingPage from './pages/MatchingPage.jsx';
import GamificationPage from './pages/GamificationPage.jsx';
import BadgesPage from './pages/BadgesPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import VolunteersPage from './pages/VolunteersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CalendarPage from './pages/CalendarPage.jsx';

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/auth">
      <Route path="login" element={<Login />} />
      <Route path="register">
        <Route path="volunteer" element={<RegisterVolunteer />} />
        <Route path="organization" element={<RegisterOrganization />} />
      </Route>
    </Route>
    <Route element={<ProtectedRoute />}>
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/dashboard/tasks" element={<TasksPage />} />
        <Route path="/dashboard/tasks/:taskId" element={<TaskDetailPage />} />
        <Route path="/dashboard/assignments" element={<AssignmentsPage />} />
        <Route path="/dashboard/completed-assignments" element={<CompletedAssignmentsPage />} />
        <Route path="/dashboard/calendar" element={<CalendarPage />} />
        <Route path="/dashboard/matching" element={<MatchingPage />} />
        <Route path="/dashboard/gamification" element={<GamificationPage />} />
        <Route path="/dashboard/badges" element={<BadgesPage />} />
        <Route path="/dashboard/reports" element={<ReportsPage />} />
        <Route path="/dashboard/volunteers" element={<VolunteersPage />} />
        <Route path="/dashboard/profile" element={<ProfilePage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default App;
