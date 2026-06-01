import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import CopyBadge from '../components/CopyBadge';
import { Check, AlertCircle, Building2, Loader2, ArrowUpRight } from 'lucide-react';

export default function Billing() {
  const { organization } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const activePlan = organization?.tier || 'FREE';

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post('http://localhost:5002/api/billing/checkout', {
        organizationId: organization.id,
      });
      if (response.data && response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('Missing checkout URL');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to initialize checkout');
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-entry">
      <div style={{ marginBottom: '48px' }}>
        <h1 className="text-title" style={{ fontSize: '32px', marginBottom: '12px' }}>
          Billing & Plans
        </h1>
        <p className="text-body" style={{ color: 'var(--fg-secondary)', maxWidth: '600px' }}>
          Manage your workspace subscription, payment methods, and billing history.
        </p>
      </div>

      <div className="card-minimal" style={{ padding: '24px', marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--bg-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Building2 size={20} style={{ color: 'var(--fg-secondary)' }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <span className="text-title" style={{ fontSize: '18px' }}>
              {organization?.name}
            </span>
            <span className="tag-pastel tag-pastel--green">
              Plan: {activePlan}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="text-meta">Workspace ID:</span>
            <CopyBadge value={organization?.id} compact />
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(212, 64, 64, 0.08)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', color: 'var(--destructive)', fontSize: '14px', fontWeight: 500 }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>

        <div className="card-minimal" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 className="text-title" style={{ fontSize: '20px', marginBottom: '8px' }}>Free</h3>
            <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '14px' }}>
              Essential ticketing and support features for small teams starting out.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px' }}>
            <span className="text-title" style={{ fontSize: '48px' }}>$0</span>
            <span className="text-meta">/ month</span>
          </div>

          <div style={{ height: '1px', background: 'var(--border-primary)', margin: '0 -32px 32px' }} />

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {['Up to 3 agents', 'Basic ticketing', 'Community support', 'Standard SLA'].map((feature, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: 'var(--fg-secondary)' }}>
                <Check size={16} style={{ color: 'var(--success)' }} />
                {feature}
              </li>
            ))}
          </ul>

          <button disabled className="btn-minimal btn-minimal--secondary" style={{ width: '100%', marginTop: '40px', padding: '12px' }}>
            Current Plan
          </button>
        </div>

        <div className="card-minimal" style={{ padding: '40px 32px', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

          <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(113, 107, 200, 0.05) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          <div style={{ marginBottom: '24px', position: 'relative' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <h3 className="text-title" style={{ fontSize: '20px' }}>Premium</h3>
              <span className="tag-pastel tag-pastel--blue">Recommended</span>
            </div>
            <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '14px' }}>
              Advanced tools, automation, and priority support for scaling operations.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '32px', position: 'relative' }}>
            <span className="text-title" style={{ fontSize: '48px' }}>$50</span>
            <span className="text-meta">/ month</span>
          </div>

          <div style={{ height: '1px', background: 'var(--border-primary)', margin: '0 -32px 32px' }} />

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
            {['Unlimited agents', 'Advanced routing rules', '24/7 Priority support', 'Custom SLA', 'Advanced Analytics'].map((feature, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', color: 'var(--fg-primary)' }}>
                <Check size={16} style={{ color: 'var(--success)' }} />
                {feature}
              </li>
            ))}
          </ul>

          <button onClick={handleUpgrade} disabled={isLoading} className="btn-minimal btn-minimal--primary" style={{ width: '100%', marginTop: '40px', padding: '12px', position: 'relative' }}>
            {isLoading ? (
              <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
            ) : (
              <>Upgrade to Premium <ArrowUpRight size={16} /></>
            )}
          </button>
        </div>
      </div>

      <p className="text-meta" style={{ textAlign: 'center', marginTop: '48px', fontSize: '12px' }}>
        Payment is securely processed via Stripe. Your workspace ID is sent to the billing service for checkout creation.
      </p>
    </div>
  );
}
