import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import OnboardingWizard from './components/OnboardingWizard';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PrivacySettings from './pages/PrivacySettings';
import Community from './pages/Community';
import LearningPaths from './pages/LearningPaths';
import Pricing from './pages/Pricing';
import Corpo from './pages/Corpo';
import Mente from './pages/Mente';
import Postura from './pages/Postura';
import VidaAfetiva from './pages/VidaAfetiva';
import Sexualidade from './pages/Sexualidade';
import Disciplina from './pages/Disciplina';
import Carreira from './pages/Carreira';
import Desafios from './pages/Desafios';
import Tools from './pages/Tools';
import Login from './pages/Login';
import Register from './pages/Register';
import { Toaster } from 'sonner';
import { useAuthStore } from './stores/authStore';

function App() {
  const initialize = useAuthStore(state => state.initialize);
  const initialized = useAuthStore(state => state.initialized);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!initialized) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/app/dashboard" replace /> : <Navigate to="/login" replace />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/app/dashboard" replace />} />
        <Route path="/onboarding" element={user ? <OnboardingWizard /> : <Navigate to="/login" replace />} />

        <Route path="/app" element={user ? <Layout /> : <Navigate to="/login" replace />}>
          <Route index element={<Navigate to="/app/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="corpo" element={<Corpo />} />
          <Route path="mente" element={<Mente />} />
          <Route path="postura" element={<Postura />} />
          <Route path="vida-afetiva" element={<VidaAfetiva />} />
          <Route path="sexualidade" element={<Sexualidade />} />
          <Route path="disciplina" element={<Disciplina />} />
          <Route path="carreira" element={<Carreira />} />
          <Route path="challenges" element={<Desafios />} />
          <Route path="content" element={<LearningPaths />} />
          <Route path="community" element={<Community />} />
          <Route path="tools" element={<Tools />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="settings" element={<PrivacySettings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="general-settings" element={<Settings />} />
        </Route>
      </Routes>

      <Toaster
        position="top-right"
        expand={true}
        richColors
        closeButton
        duration={4000}
        theme="dark"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#e5e5e5',
          },
        }}
      />
    </>
  );
}

export default App;