import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/useAuthStore';
import AuthGuard from './components/layout/AuthGuard';

import LoginPage from './routes/login/page';
import DashboardPage from './routes/dashboard/page';
import SchedulePage from './routes/schedule/page';
import ClientsPage from './routes/clients/page';
import BookingsPage from './routes/bookings/page';
import TrainersPage from './routes/trainers/page';
import FinancePage from './routes/finance/page';
import NotificationsPage from './routes/notifications/page';
import SettingsPage from './routes/settings/page';

function Protected({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route path="/" element={<Protected><DashboardPage /></Protected>} />
      <Route path="/schedule" element={<Protected><SchedulePage /></Protected>} />
      <Route path="/clients" element={<Protected><ClientsPage /></Protected>} />
      <Route path="/bookings" element={<Protected><BookingsPage /></Protected>} />
      <Route path="/trainers" element={<Protected><TrainersPage /></Protected>} />
      <Route path="/finance" element={<Protected><FinancePage /></Protected>} />
      <Route path="/notifications" element={<Protected><NotificationsPage /></Protected>} />
      <Route path="/settings" element={<Protected><SettingsPage /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
