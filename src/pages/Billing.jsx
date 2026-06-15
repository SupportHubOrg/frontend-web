import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { CheckCircle, Warning, Buildings, Spinner, ArrowUpRight, ShieldCheck, Lightning } from '@phosphor-icons/react';

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
    <div className="animate-entry" style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h1 className="text-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
          Billing & Plans
        </h1>
        <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '14px' }}>
          Manage your workspace subscription and features.
        </p>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(212, 64, 64, 0.08)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', color: 'var(--destructive)', fontSize: '14px', fontWeight: 500 }}>
          <Warning size={18} weight="bold" />
          {error}
        </div>
      )}

      {/* Current Plan Banner */}
      <div className="card-minimal" style={{ padding: '32px', marginBottom: '48px', display: 'flex', flexDirection: 'column', gap: '24px', border: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Buildings size={16} weight="bold" style={{ color: 'var(--fg-muted)' }} />
              <span className="text-meta" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Workspace</span>
            </div>
            <h2 className="text-title" style={{ fontSize: '24px', marginBottom: '4px' }}>
              {organization?.name}
            </h2>
            {organization?.creationConfirmationStatus === 'PENDING' && (
              <span style={{ fontSize: '12px', color: 'var(--tag-yellow-fg)', background: 'var(--tag-yellow-bg)', padding: '2px 8px', borderRadius: '4px', fontWeight: 500 }}>
                Verification Pending
              </span>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <span className="text-meta" style={{ display: 'block', marginBottom: '4px' }}>Active Plan</span>
            <span className={`tag-pastel ${activePlan === 'PRO' ? 'tag-pastel--green' : 'tag-pastel--blue'}`} style={{ fontSize: '14px', padding: '4px 12px' }}>
              {activePlan}
            </span>
          </div>
        </div>

        {activePlan === 'FREE' ? (
          <div style={{ background: 'var(--bg-inset)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
               <Lightning size={20} weight="fill" style={{ color: 'var(--tag-orange-fg)' }} />
               <span className="text-body" style={{ fontSize: '14px', fontWeight: 500 }}>Unlock premium features by upgrading to Pro.</span>
            </div>
          </div>
        ) : (
           <div style={{ background: 'rgba(52, 211, 153, 0.05)', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShieldCheck size={20} weight="fill" style={{ color: 'rgb(16, 185, 129)' }} />
                <span className="text-body" style={{ fontSize: '14px', fontWeight: 500, color: 'var(--fg-primary)' }}>Your workspace is on the Pro plan. All premium features are unlocked.</span>
             </div>
           </div>
        )}
      </div>

      {/* Available Plans Grid */}
      <div style={{ marginBottom: '24px' }}>
        <h3 className="text-title" style={{ fontSize: '16px', marginBottom: '16px' }}>Available Plans</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>

        {/* Free Plan */}
        <div className="card-minimal" style={{ padding: '24px', display: 'flex', flexDirection: 'column', opacity: activePlan === 'FREE' ? 1 : 0.6 }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 className="text-title" style={{ fontSize: '16px', marginBottom: '4px' }}>Free</h3>
            <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '13px' }}>
              Essential features for small teams.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
            <span className="text-title" style={{ fontSize: '28px' }}>$0</span>
            <span className="text-meta">/ mo</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Up to 3 agents', 'Basic ticketing', 'Community support'].map((feature, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--fg-secondary)' }}>
                <CheckCircle size={16} weight="fill" style={{ color: 'var(--fg-muted)' }} />
                {feature}
              </li>
            ))}
          </ul>

          <button disabled className="btn-minimal btn-minimal--ghost" style={{ width: '100%', marginTop: '32px', padding: '8px', cursor: 'default' }}>
            {activePlan === 'FREE' ? 'Current Plan' : 'Downgrade via Support'}
          </button>
        </div>

        {/* Standard Plan (Disabled) */}
        <div className="card-minimal" style={{ padding: '24px', display: 'flex', flexDirection: 'column', opacity: 0.6 }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 className="text-title" style={{ fontSize: '16px', marginBottom: '4px' }}>Standard</h3>
            <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '13px' }}>
              For growing teams that need more power.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
            <span className="text-title" style={{ fontSize: '28px' }}>$15</span>
            <span className="text-meta">/ mo</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Up to 10 agents', 'Advanced routing', 'Email support'].map((feature, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--fg-secondary)' }}>
                <CheckCircle size={16} weight="fill" style={{ color: 'var(--fg-muted)' }} />
                {feature}
              </li>
            ))}
          </ul>

          <button disabled className="btn-minimal btn-minimal--ghost" style={{ width: '100%', marginTop: '32px', padding: '8px', cursor: 'default' }}>
            Coming Soon
          </button>
        </div>

        {/* Pro Plan */}
        <div className="card-minimal" style={{ padding: '24px', display: 'flex', flexDirection: 'column', border: activePlan === 'PRO' ? '2px solid var(--fg-primary)' : '1px solid var(--border-primary)' }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 className="text-title" style={{ fontSize: '16px', marginBottom: '4px' }}>Pro</h3>
            <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '13px' }}>
              Advanced tools and automation for scaling.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
            <span className="text-title" style={{ fontSize: '28px' }}>$50</span>
            <span className="text-meta">/ mo</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Unlimited agents', 'Priority support', 'Custom SLA', 'Analytics'].map((feature, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--fg-primary)' }}>
                <CheckCircle size={16} weight="fill" style={{ color: 'var(--success)' }} />
                {feature}
              </li>
            ))}
          </ul>

          <button 
            onClick={handleUpgrade} 
            disabled={isLoading || activePlan === 'PRO'} 
            className={`btn-minimal ${activePlan === 'PRO' ? 'btn-minimal--ghost' : 'btn-minimal--primary'}`} 
            style={{ width: '100%', marginTop: '32px', padding: '10px', display: 'flex', justifyContent: 'center', gap: '8px' }}
          >
            {isLoading ? (
              <Spinner size={16} style={{ animation: 'spin 1s linear infinite' }} />
            ) : activePlan === 'PRO' ? (
              'Current Plan'
            ) : (
              <>Upgrade to Pro <ArrowUpRight size={14} weight="bold" /></>
            )}
          </button>
        </div>

        {/* Enterprise Plan (Disabled) */}
        <div className="card-minimal" style={{ padding: '24px', display: 'flex', flexDirection: 'column', opacity: 0.6 }}>
          <div style={{ marginBottom: '24px' }}>
            <h3 className="text-title" style={{ fontSize: '16px', marginBottom: '4px' }}>Enterprise</h3>
            <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '13px' }}>
              Custom solutions for large orgs.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
            <span className="text-title" style={{ fontSize: '28px' }}>Custom</span>
          </div>

          <ul style={{ listStyle: 'none', padding: 0, margin: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {['Dedicated manager', 'Custom integrations', 'White-labeling', 'On-premise option'].map((feature, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--fg-secondary)' }}>
                <CheckCircle size={16} weight="fill" style={{ color: 'var(--fg-muted)' }} />
                {feature}
              </li>
            ))}
          </ul>

          <button disabled className="btn-minimal btn-minimal--ghost" style={{ width: '100%', marginTop: '32px', padding: '8px', cursor: 'default' }}>
            Contact Sales
          </button>
        </div>

      </div>

      <p className="text-meta" style={{ textAlign: 'center', marginTop: '40px', fontSize: '12px', color: 'var(--fg-muted)' }}>
        Payment is securely processed via Stripe. Cancel anytime.
      </p>
    </div>
  );
}
