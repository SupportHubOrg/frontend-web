import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { LogOut } from 'lucide-react';

export default function Register() {
  const { user, getToken, checkUserOrganization } = useAuth();
  const navigate = useNavigate();

  const [organizationName, setOrganizationName] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!organizationName.trim()) { 
      setError('Organization name is required'); 
      return; 
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://supporthub.local'}/api/organizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({
          name: organizationName,
          tier: 'FREE',
          managerEmail: user?.email || '',
          managerKeycloakId: user?.id,
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create organization');
      }

      // Success, refresh auth context and redirect to the app
      await checkUserOrganization(user?.id, getToken());
      navigate('/billing', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create workspace. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-primary)]">
      <header className="w-full px-6 py-8">
        <Link to="/" className="text-title text-xl tracking-tight text-[var(--fg-primary)] hover:opacity-70 transition-opacity">
          SupportHub
        </Link>
        <button onClick={useAuth().logout} className="btn-minimal btn-minimal--ghost">
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px]"
        >
          <div className="mb-10">
            <h1 className="text-title text-3xl mb-3 text-[var(--fg-primary)] tracking-tight">
              Create your workspace
            </h1>
            <p className="text-body text-[var(--fg-muted)]">
              Welcome, {user?.fullName || 'User'}! Just one more step to set up your organization and start using SupportHub.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="card-minimal p-8 flex flex-col gap-6">
              
              <div>
                <label htmlFor="organizationName" className="text-meta block mb-2 text-[var(--fg-primary)]">
                  Organization Name
                </label>
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  className="input-minimal"
                  placeholder="Acme Corp"
                  value={organizationName}
                  onChange={(e) => {
                    setOrganizationName(e.target.value);
                    setError(null);
                  }}
                  autoFocus
                />
              </div>

              {error && (
                <div className="mt-2 p-3 rounded-md bg-red-500/10 flex items-center gap-2 text-[var(--destructive)] text-sm font-medium">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-minimal btn-minimal--primary w-full py-3 text-base flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Creating Workspace...' : (
                <>
                  Complete Setup <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </main>
    </div>
  );
}
