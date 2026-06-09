import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import Keycloak from 'keycloak-js';

const AuthContext = createContext(null);

const keycloakConfig = {
  url: 'http://localhost:8085',
  realm: 'supporthub',
  clientId: 'supporthub-frontend'
};

// Initialize single instance outside of component lifecycle
const keycloak = new Keycloak(keycloakConfig);

export function AuthProvider({ children }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [hasOrganization, setHasOrganization] = useState(false);
  const [organization, setOrganization] = useState(null);
  const isRun = useRef(false);

  const checkUserOrganization = useCallback(async (subject, token) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/organizations/users/${subject}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setHasOrganization(!!data?.organizationId);
        setUser(prev => prev ? { ...prev, role: data.role } : null);
        if (data?.organizationId) {
          const orgResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/organizations/${data.organizationId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (orgResponse.ok) {
            const orgData = await orgResponse.json();
            setOrganization(orgData);
          }
        }
      } else {
        setHasOrganization(false);
        setOrganization(null);
      }
    } catch (err) {
      console.error("Failed to load organizations", err);
    }
  }, []);

  useEffect(() => {
    if (isRun.current) return;
    isRun.current = true;

    keycloak.init({ 
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256'
    }).then(async (authenticated) => {
      
      if (authenticated) {
        try {
          const profile = await keycloak.loadUserProfile();
          setUser({
            id: keycloak.subject,
            fullName: [profile.firstName, profile.lastName].filter(Boolean).join(' ') || profile.username || 'User',
            email: profile.email,
            username: profile.username
          });

          await checkUserOrganization(keycloak.subject, keycloak.token);
        } catch (err) {
          console.error("Failed to load user profile or organizations", err);
        }
      }

      setIsAuthenticated(authenticated);
      setIsInitialized(true);
    }).catch((err) => {
      console.error("Keycloak initialization failed", err);
      setIsInitialized(true);
    });

    // Setup token refresh
    const updateTokenInterval = setInterval(() => {
      if (keycloak.authenticated) {
        keycloak.updateToken(70).then((refreshed) => {
          if (refreshed) {
            console.log('Token refreshed');
          }
        }).catch(() => {
          console.error('Failed to refresh token');
          keycloak.clearToken();
        });
      }
    }, 10000);

    return () => clearInterval(updateTokenInterval);
  }, []);

  const login = useCallback(() => {
    keycloak.login();
  }, []);

  const register = useCallback((options) => {
    keycloak.register(options);
  }, []);

  const logout = useCallback(() => {
    keycloak.logout({ redirectUri: window.location.origin });
  }, []);

  const getToken = useCallback(() => {
    return keycloak.token;
  }, []);

  const value = {
    isAuthenticated,
    isInitialized,
    hasOrganization,
    organization,
    user,
    token: keycloak.token,
    getToken,
    login,
    register,
    logout,
    checkUserOrganization
  };

  // If Keycloak is still checking session, we can show a minimal loading state or just render children
  // Rendering children is better for the Landing page to show up immediately
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
        <div className="text-[var(--fg-muted)]">Loading SupportHub...</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
