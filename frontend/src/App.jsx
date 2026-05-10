import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import DashboardPage from './pages/DashboardPage';
import MyTripsPage from './pages/trips/MyTripsPage';
import CreateTripPage from './pages/trips/CreateTripPage';
import ItineraryBuilderPage from './pages/trips/ItineraryBuilderPage';
import ItineraryViewPage from './pages/trips/ItineraryViewPage';
import CitySearchPage from './pages/explore/CitySearchPage';
import ActivitySearchPage from './pages/explore/ActivitySearchPage';
import BudgetBreakdownPage from './pages/tools/BudgetBreakdownPage';
import PackingListPage from './pages/tools/PackingListPage';
import JournalPage from './pages/tools/JournalPage';
import CommunityPage from './pages/social/CommunityPage';
import SharedItineraryPage from './pages/social/SharedItineraryPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Public Shared Link */}
        <Route path="/shared/:tripId" element={<SharedItineraryPage />} />

        {/* App Routes */}
        <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
        <Route path="/trips" element={<MainLayout><MyTripsPage /></MainLayout>} />
        <Route path="/trips/create" element={<MainLayout><CreateTripPage /></MainLayout>} />
        <Route path="/trips/:tripId/view" element={<MainLayout><ItineraryViewPage /></MainLayout>} />
        <Route path="/builder" element={<MainLayout><ItineraryBuilderPage /></MainLayout>} />
        <Route path="/explore" element={<MainLayout><CitySearchPage /></MainLayout>} />
        <Route path="/explore/activities" element={<MainLayout><ActivitySearchPage /></MainLayout>} />
        <Route path="/budget" element={<MainLayout><BudgetBreakdownPage /></MainLayout>} />
        <Route path="/packing" element={<MainLayout><PackingListPage /></MainLayout>} />
        <Route path="/journal" element={<MainLayout><JournalPage /></MainLayout>} />
        <Route path="/community" element={<MainLayout><CommunityPage /></MainLayout>} />
        <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />

        {/* Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
