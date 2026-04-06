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
import SubscriptionsPage from './app/subscriptions/page';

export default function App() {
  const { login, isAuthenticated, isNewUser, isLoading, user } = useUserStore();

  useEffect(() => {
    if (!isAuthenticated) login();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FAF5EF' }}>
        <div className="text-center">
          <div className="text-5xl mb-4">🪷</div>
          <div className="text-sm font-instrument" style={{ color: '#B8A898' }}>Загрузка...</div>
        </div>
      </div>
    );
  }

  // Показываем онбординг если: только что создан (isNewUser) ИЛИ
  // пользователь создан ботом но не прошёл онбординг (нет goal)
  const needsOnboarding = isNewUser || (user !== null && !user.goal);
  if (isAuthenticated && needsOnboarding) {
    return <OnboardingPage />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FAF5EF' }}>
      <div className="flex-1 overflow-y-auto pb-20">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/my-bookings" element={<MyBookingsPage />} />
          <Route path="/trainers" element={<TrainersPage />} />
          <Route path="/exercises" element={<ExercisesPage />} />
          <Route path="/subscriptions" element={<SubscriptionsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
