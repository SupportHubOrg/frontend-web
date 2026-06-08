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
  const { isAuthenticated, hasOrganization } = useAuth();
  if (isAuthenticated) {
    if (hasOrganization) return <Navigate to="/billing" replace />;
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
    return <Navigate to="/billing" replace />;
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
        <Route path="/billing" element={<Billing />} />
        <Route path="/organization" element={<OrganizationSettings />} />
        <Route path="/users" element={<Users />} />
        <Route path="/payment-success" element={<PaymentSuccess />} />
        <Route path="/payment-cancel" element={<PaymentCancel />} />
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
