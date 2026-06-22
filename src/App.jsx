import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Layout from './Layout';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Billing from './pages/Billing';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import KnowledgeBase from './pages/KnowledgeBase';
import OrganizationSettings from './pages/OrganizationSettings';
import Users from './pages/Users';
import ConfirmOrganization from './pages/ConfirmOrganization';
import ConfirmInvitation from './pages/ConfirmInvitation';

function ProtectedRoute({ children }) {
  const { isAuthenticated, hasOrganization } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (!hasOrganization) {
    return <Navigate to="/register" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const { isAuthenticated, hasOrganization, organization, user } = useAuth();
  
  if (isAuthenticated) {
    if (hasOrganization) {
      const isManager = user?.role === 'ORGANIZATION_MANAGER' || user?.role === 'SUPPORT_HUB_ADMINISTRATOR' || user?.role === 'SYSTEM';
      const hasSubscription = organization?.tier && organization.tier !== 'FREE';
      
      // If manager and no subscription, force to billing. Otherwise, everyone to dashboard.
      if (isManager && !hasSubscription) {
        return <Navigate to="/billing" replace />;
      }
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/register" replace />;
  }
  return children;
}

function SetupWorkspaceRoute({ children }) {
  const { isAuthenticated, hasOrganization } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  if (hasOrganization) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function ManagerRoute({ children }) {
  const { user } = useAuth();
  const isManager = user?.role === 'ORGANIZATION_MANAGER' || user?.role === 'SUPPORT_HUB_ADMINISTRATOR' || user?.role === 'SYSTEM';
  
  if (!isManager) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        }
      />

      <Route path="/accept-invite" element={<ConfirmInvitation />} />

      <Route
        path="/confirm-organization"
        element={
          <ProtectedRoute>
            <ConfirmOrganization />
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/register"
        element={
          <SetupWorkspaceRoute>
            <Register />
          </SetupWorkspaceRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/knowledge-base" element={<KnowledgeBase />} />
        <Route path="/billing" element={<ManagerRoute><Billing /></ManagerRoute>} />
        <Route path="/organization" element={<ManagerRoute><OrganizationSettings /></ManagerRoute>} />
        <Route path="/users" element={<ManagerRoute><Users /></ManagerRoute>} />
        <Route path="/payment-success" element={<ManagerRoute><PaymentSuccess /></ManagerRoute>} />
        <Route path="/payment-cancel" element={<ManagerRoute><PaymentCancel /></ManagerRoute>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
