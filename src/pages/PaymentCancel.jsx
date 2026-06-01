import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft, RotateCcw } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <div className="animate-entry" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(212, 64, 64, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
        <XCircle size={36} style={{ color: 'var(--destructive)' }} />
      </div>

      <h1 className="text-title" style={{ fontSize: '32px', marginBottom: '16px' }}>Payment Cancelled</h1>
      <p className="text-body" style={{ color: 'var(--fg-secondary)', maxWidth: '420px', margin: '0 auto 40px' }}>
        Your upgrade process was cancelled. No charges were made to your account. You remain on the Free Plan.
      </p>

      <div style={{ display: 'flex', gap: '16px' }}>
        <Link to="/billing" className="btn-minimal btn-minimal--secondary" style={{ padding: '12px 24px' }}>
          <ArrowLeft size={16} /> Return to Billing
        </Link>
        <Link to="/billing" className="btn-minimal btn-minimal--primary" style={{ padding: '12px 24px' }}>
          <RotateCcw size={16} /> Try Again
        </Link>
      </div>
    </div>
  );
}
