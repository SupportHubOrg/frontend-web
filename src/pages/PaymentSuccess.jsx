import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function PaymentSuccess() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6 relative">
        <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping opacity-75" />
        <CheckCircle2 size={40} className="text-green-500 relative z-10" />
      </div>
      
      <h1 className="text-4xl font-bold mb-3 text-white">Payment Successful!</h1>
      <p className="text-muted text-lg max-w-md mb-8">
        Your organization has been upgraded to the Premium Plan. Thank you for choosing SupportHub.
      </p>

      <div className="p-6 bg-card border border-border rounded-xl w-full max-w-sm mb-8">
        <div className="flex justify-between items-center mb-3">
          <span className="text-muted">Amount paid</span>
          <span className="font-bold text-white">$50.00</span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <span className="text-muted">Plan</span>
          <span className="font-medium text-primary">Premium Monthly</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted">Status</span>
          <span className="text-xs font-bold px-2 py-1 rounded bg-green-500/10 text-green-500 uppercase">Active</span>
        </div>
      </div>

      <Link 
        to="/billing" 
        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
      >
        Return to Dashboard
        <ArrowRight size={18} />
      </Link>
    </div>
  );
}
