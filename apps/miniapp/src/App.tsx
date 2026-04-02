import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from './stores/useUserStore';
import BottomNav from './components/ui/BottomNav';
import HomePage from './app/home/page';
import SchedulePage from './app/schedule/page';
import MyBookingsPage from './app/my-bookings/page';
import ProfilePage from './app/profile/page';
import OnboardingPage from './app/onboarding/page';
import TrainersPage from './app/trainers/page';
import ExercisesPage from './app/exercises/page';

export default function App() {
  const { login, isAuthenticated, isNewUser, isLoading } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated) login();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🪷</div>
          <div className="text-dark/50 text-sm font-instrument">Загрузка...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && isNewUser) {
    return <OnboardingPage />;
  }

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <div className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/trainers" element={<TrainersPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
