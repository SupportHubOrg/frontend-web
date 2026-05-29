import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancel() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <XCircle size={40} className="text-red-500" />
      </div>
      
      <h1 className="text-4xl font-bold mb-3 text-white">Payment Cancelled</h1>
      <p className="text-muted text-lg max-w-md mb-8">
        Your upgrade process was cancelled. No charges were made to your account.
      </p>

      <div className="flex gap-4">
        <Link 
          to="/billing" 
          className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={18} />
          Return to Billing
        </Link>
        <Link 
          to="/billing" 
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-hover transition-colors"
        >
          Try Again
        </Link>
      </div>
    </div>
  );
}
