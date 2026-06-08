import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

export default function PaymentSuccess() {
  const { user, getToken, checkUserOrganization } = useAuth();

  useEffect(() => {
    if (user?.id) {
      checkUserOrganization(user.id, getToken());
    }
  }, [user, getToken, checkUserOrganization]);

  return (
    <div className="animate-entry" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--tag-green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
        <CheckCircle2 size={36} style={{ color: 'var(--success)' }} />
      </div>

      <h1 className="text-title" style={{ fontSize: '32px', marginBottom: '16px' }}>Payment Successful</h1>
      <p className="text-body" style={{ color: 'var(--fg-secondary)', maxWidth: '420px', margin: '0 auto 40px' }}>
        Your workspace has been upgraded to the Premium Plan. All advanced features, automations, and priority support are now active.
      </p>

      <div className="card-minimal" style={{ width: '100%', maxWidth: '400px', padding: '32px', marginBottom: '40px', textAlign: 'left' }}>
        <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-primary)', marginBottom: '16px' }}>
          <span className="text-meta" style={{ fontSize: '13px' }}>Transaction Receipt</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span className="text-body" style={{ color: 'var(--fg-secondary)' }}>Amount paid</span>
          <span className="text-title" style={{ fontSize: '16px' }}>$50.00</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <span className="text-body" style={{ color: 'var(--fg-secondary)' }}>Subscription Plan</span>
          <span className="text-title" style={{ fontSize: '16px' }}>Premium Monthly</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span className="text-body" style={{ color: 'var(--fg-secondary)' }}>Status</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="status-dot" />
            <span className="text-title" style={{ fontSize: '15px', color: 'var(--success)' }}>Active</span>
          </div>
        </div>
      </div>

      <Link to="/billing" className="btn-minimal btn-minimal--primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
        Return to Workspace <ArrowRight size={16} />
      </Link>
    </div>
  );
}
