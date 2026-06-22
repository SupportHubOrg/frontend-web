import { useState, useEffect } from 'react';
import { useSearchParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Loader2, CheckCircle, AlertCircle, UserPlus } from 'lucide-react';

export default function ConfirmInvitation() {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const inviteToken = searchParams.get('token');
  const email = searchParams.get('email');
  
  const { isAuthenticated, register, token, checkUserOrganization, user } = useAuth();
  const navigate = useNavigate();

  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const confirmInvite = async () => {
      if (!isAuthenticated || !userId || !inviteToken || !token) return;

      setIsConfirming(true);
      setError(null);
      
      try {
        await axios.put(`${import.meta.env.VITE_API_URL || 'https://dingbat-brussels-dimmer.ngrok-free.dev'}/api/organizations/users/${userId}/invitation-confirmation/${inviteToken}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setSuccess(true);
        // Sync context to load organization data
        if (user?.id) {
          await checkUserOrganization(user.id, token);
        }
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.title || err.response?.data?.message || 'Failed to confirm invitation. It may be expired or already used.');
      } finally {
        setIsConfirming(false);
      }
    };

    if (isAuthenticated) {
      confirmInvite();
    }
  }, [isAuthenticated, userId, inviteToken, token, navigate, checkUserOrganization, user]);

  if (!userId || !inviteToken) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div className="card-minimal animate-entry" style={{ width: '100%', maxWidth: '440px', padding: '48px 32px', textAlign: 'center' }}>
        
        {!isAuthenticated ? (
          <>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--bg-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--fg-primary)' }}>
              <UserPlus size={32} />
            </div>
            <h1 className="text-title" style={{ fontSize: '24px', marginBottom: '16px' }}>
              You've been invited!
            </h1>
            <p className="text-body" style={{ color: 'var(--fg-secondary)', marginBottom: '32px' }}>
              You have been invited to join a workspace on SupportHub. To accept this invitation and access your team's tickets, please create your secure password.
            </p>
            <button 
              onClick={() => register({redirectUri: window.location.href, ...(email && { loginHint: email })})}
              className="btn-minimal btn-minimal--primary"
              style={{ width: '100%', padding: '16px', fontSize: '16px', display: 'flex', justifyContent: 'center' }}
            >
              Create Account to Continue
            </button>
            <p className="text-meta" style={{ marginTop: '24px', color: 'var(--fg-muted)' }}>
              Already have an account? Click above to log in instead.
            </p>
          </>
        ) : isConfirming ? (
          <>
            <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 24px', color: 'var(--fg-primary)' }} />
            <h1 className="text-title" style={{ fontSize: '20px', marginBottom: '8px' }}>
              Confirming Invitation...
            </h1>
            <p className="text-body" style={{ color: 'var(--fg-secondary)' }}>
              Linking your account to the organization.
            </p>
          </>
        ) : success ? (
          <>
            <div style={{ color: 'rgb(16, 185, 129)', margin: '0 auto 24px', display: 'flex', justifyContent: 'center' }}>
              <CheckCircle size={64} />
            </div>
            <h1 className="text-title" style={{ fontSize: '24px', marginBottom: '8px' }}>
              Welcome aboard!
            </h1>
            <p className="text-body" style={{ color: 'var(--fg-secondary)' }}>
              Your invitation is confirmed. Redirecting you to the dashboard...
            </p>
          </>
        ) : error ? (
          <>
            <div style={{ color: 'var(--destructive)', margin: '0 auto 24px', display: 'flex', justifyContent: 'center' }}>
              <AlertCircle size={64} />
            </div>
            <h1 className="text-title" style={{ fontSize: '24px', marginBottom: '16px' }}>
              Invalid Invitation
            </h1>
            <p className="text-body" style={{ color: 'var(--fg-secondary)', marginBottom: '32px' }}>
              {error}
            </p>
            <button 
              onClick={() => navigate('/')}
              className="btn-minimal btn-minimal--secondary"
            >
              Return Home
            </button>
          </>
        ) : null}

      </div>
    </div>
  );
}
