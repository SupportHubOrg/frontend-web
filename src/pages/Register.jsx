import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [form, setForm] = useState({
    organizationName: '',
    fullName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (!form.organizationName.trim()) { setError('Organization name is required'); return; }
    if (!form.fullName.trim()) { setError('Full name is required'); return; }
    if (!form.email.trim() || !form.email.includes('@')) { setError('Valid email is required'); return; }
    if (!form.password || form.password.length < 4) { setError('Password must be at least 4 characters'); return; }

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        register(form);
        navigate('/billing', { replace: true });
      } catch (err) {
        setError('Registration failed. Please try again.');
        setIsSubmitting(false);
      }
    }, 400);
  };

  const isDark = theme === 'dark';

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="animate-entry" style={{ width: '100%', maxWidth: '440px' }}>

        <div style={{ marginBottom: '40px', textAlign: 'center' }}>
          <img
            src="https://support-hub.io/assets/img/logo_text.svg"
            alt="SupportHub"
            style={{
              height: '28px',
              margin: '0 auto 24px',
              display: 'block'
            }}
          />
          <h1 className="text-title" style={{ fontSize: '28px', marginBottom: '12px' }}>
            Create Workspace
          </h1>
          <p className="text-body" style={{ color: 'var(--fg-secondary)' }}>
            Register your organization to start using the SupportHub platform.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card-minimal" style={{ padding: '32px' }}>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="organizationName" className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-primary)' }}>
                Organization Name
              </label>
              <input
                id="organizationName"
                name="organizationName"
                type="text"
                className="input-minimal"
                placeholder="Acme Corp"
                value={form.organizationName}
                onChange={handleChange}
                autoFocus
              />
            </div>

            <div style={{ height: '1px', background: 'var(--border-primary)', margin: '32px -32px' }} />

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="fullName" className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-primary)' }}>
                Your Full Name
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                className="input-minimal"
                placeholder="Jane Doe"
                value={form.fullName}
                onChange={handleChange}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label htmlFor="email" className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-primary)' }}>
                Work Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="input-minimal"
                placeholder="jane@company.com"
                value={form.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-primary)' }}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="input-minimal"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div style={{ marginTop: '24px', padding: '12px 16px', borderRadius: '6px', background: 'rgba(212, 64, 64, 0.08)', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--destructive)', fontSize: '14px', fontWeight: 500 }}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-minimal btn-minimal--primary"
            style={{ width: '100%', marginTop: '24px', padding: '14px 24px', fontSize: '16px' }}
          >
            {isSubmitting ? 'Creating Workspace...' : (
              <>
                Continue <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
