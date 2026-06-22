import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

export default function ConfirmOrganization() {
  const [searchParams] = useSearchParams();
  const orgId = searchParams.get('orgId');
  const token = searchParams.get('token');
  const { user, getToken, checkUserOrganization } = useAuth();
  const navigate = useNavigate();

  const [status, setStatus] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const hasAttempted = useRef(false);

  useEffect(() => {
    const confirmOrg = async () => {
      if (hasAttempted.current) return;
      hasAttempted.current = true;

      if (!orgId || !token) {
        setStatus('error');
        setErrorMessage('Invalid confirmation link. Missing parameters.');
        return;
      }

      if (!user?.id) {
        setStatus('error');
        setErrorMessage('You must be logged in to confirm the organization.');
        return;
      }

      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://dingbat-brussels-dimmer.ngrok-free.dev'}/api/organizations/${orgId}/creation-confirmation/${token}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
          },
          body: JSON.stringify({
            managerId: user.id
          })
        });

        if (response.ok) {
          setStatus('success');
          // Refresh context so we know the org is ACCEPTED
          await checkUserOrganization(user.id, getToken());
          setTimeout(() => {
            navigate('/billing', { replace: true });
          }, 3000);
        } else {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.title || errorData?.message || 'Failed to confirm organization.');
        }
      } catch (err) {
        setStatus('error');
        setErrorMessage(err.message);
      }
    };

    confirmOrg();
  }, [orgId, token, user, getToken, navigate, checkUserOrganization]);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-4">
      <div className="card-minimal max-w-md w-full p-8 text-center animate-entry">
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center gap-4">
            <Loader2 size={48} className="text-[var(--primary)] animate-spin" />
            <h2 className="text-title text-xl">Confirming your organization...</h2>
            <p className="text-body text-[var(--fg-secondary)]">Please wait a moment while we verify your token.</p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center gap-4">
            <CheckCircle2 size={48} className="text-[var(--success)]" />
            <h2 className="text-title text-xl">Organization Confirmed!</h2>
            <p className="text-body text-[var(--fg-secondary)]">Your workspace is now active. Redirecting to billing...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center gap-4">
            <XCircle size={48} className="text-[var(--destructive)]" />
            <h2 className="text-title text-xl">Confirmation Failed</h2>
            <p className="text-body text-[var(--destructive)]">{errorMessage}</p>
            <button 
              onClick={() => navigate('/billing')} 
              className="btn-minimal btn-minimal--primary mt-4"
            >
              Go back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
