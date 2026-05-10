import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { RequireAuth } from './components/auth/RequireAuth';

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const MyTripsPage = lazy(() => import('./pages/trips/MyTripsPage'));
const CreateTripPage = lazy(() => import('./pages/trips/CreateTripPage'));
const ItineraryBuilderPage = lazy(() => import('./pages/trips/ItineraryBuilderPage'));
const ItineraryViewPage = lazy(() => import('./pages/trips/ItineraryViewPage'));
const CitySearchPage = lazy(() => import('./pages/explore/CitySearchPage'));
const ActivitySearchPage = lazy(() => import('./pages/explore/ActivitySearchPage'));
const BudgetBreakdownPage = lazy(() => import('./pages/tools/BudgetBreakdownPage'));
const PackingListPage = lazy(() => import('./pages/tools/PackingListPage'));
const JournalPage = lazy(() => import('./pages/tools/JournalPage'));
const CommunityPage = lazy(() => import('./pages/social/CommunityPage'));
const SharedItineraryPage = lazy(() => import('./pages/social/SharedItineraryPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));

function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass rounded-3xl px-8 py-6 text-center space-y-2">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-brand-slate">Traveloop</p>
        <p className="text-xl font-black tracking-tight text-brand-navy">Loading your next screen...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/shared/:token" element={<SharedItineraryPage />} />

          <Route path="/" element={<RequireAuth><MainLayout><DashboardPage /></MainLayout></RequireAuth>} />
          <Route path="/trips" element={<RequireAuth><MainLayout><MyTripsPage /></MainLayout></RequireAuth>} />
          <Route path="/trips/create" element={<RequireAuth><MainLayout><CreateTripPage /></MainLayout></RequireAuth>} />
          <Route path="/trips/:tripId/view" element={<RequireAuth><MainLayout><ItineraryViewPage /></MainLayout></RequireAuth>} />
          <Route path="/builder" element={<RequireAuth><MainLayout><ItineraryBuilderPage /></MainLayout></RequireAuth>} />
          <Route path="/explore" element={<RequireAuth><MainLayout><CitySearchPage /></MainLayout></RequireAuth>} />
          <Route path="/explore/activities" element={<RequireAuth><MainLayout><ActivitySearchPage /></MainLayout></RequireAuth>} />
          <Route path="/budget" element={<RequireAuth><MainLayout><BudgetBreakdownPage /></MainLayout></RequireAuth>} />
          <Route path="/packing" element={<RequireAuth><MainLayout><PackingListPage /></MainLayout></RequireAuth>} />
          <Route path="/journal" element={<RequireAuth><MainLayout><JournalPage /></MainLayout></RequireAuth>} />
          <Route path="/community" element={<RequireAuth><MainLayout><CommunityPage /></MainLayout></RequireAuth>} />
          <Route path="/profile" element={<RequireAuth><MainLayout><ProfilePage /></MainLayout></RequireAuth>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
