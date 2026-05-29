import { useState } from 'react';
import axios from 'axios';
import { Check, Sparkles, Building2, Loader2, AlertCircle } from 'lucide-react';

export default function Billing() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mocked state
  const activePlan = "FREE";
  const activeOrg = {
    name: "Politechnika Wrocławska",
    id: "org-pwr-2026"
  };

  const handleUpgrade = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create checkout session
      const response = await axios.post('http://localhost:5002/api/billing/checkout', {
        organizationId: activeOrg.id
      });

      // Redirect to Stripe checkout
      if (response.data && response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error('Invalid response from server: Missing checkout URL');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to initialize checkout');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Billing & Subscription</h1>
        <p className="text-muted">Manage your organization's billing and upgrade your features.</p>
      </div>

      {/* Organization Context Context */}
      <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl">
        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
          <Building2 size={20} className="text-muted" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted">Active Organization Context</p>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground">{activeOrg.name}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted font-mono">
              {activeOrg.id}
            </span>
          </div>
        </div>
        <div className="px-4 py-1.5 rounded-full bg-green-500/10 text-green-500 text-sm font-medium border border-green-500/20">
          Current Plan: {activePlan}
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-500">
          <AlertCircle size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        
        {/* Free Plan */}
        <div className="p-6 rounded-2xl border border-border bg-card flex flex-col opacity-70 transition-opacity hover:opacity-100">
          <div className="mb-4">
            <h3 className="text-xl font-bold">Free Plan</h3>
            <p className="text-sm text-muted mt-1">Basic support features for small teams.</p>
          </div>
          <div className="mb-6 flex items-baseline gap-1">
            <span className="text-4xl font-extrabold">$0</span>
            <span className="text-muted">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1">
            {['Up to 3 agents', 'Basic ticketing', 'Community support', 'Standard SLA'].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-muted">
                <Check size={16} className="text-primary" />
                {feature}
              </li>
            ))}
          </ul>
          <button disabled className="w-full py-2.5 rounded-lg font-medium bg-white/5 text-muted border border-white/10 cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* Premium Plan */}
        <div className="p-6 rounded-2xl border border-primary/50 bg-primary/5 flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-50 text-primary">
            <Sparkles size={120} className="absolute -top-10 -right-10 blur-[40px]" />
          </div>
          
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0" />

          <div className="mb-4 relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-white">Premium Plan</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-primary text-white">Popular</span>
            </div>
            <p className="text-sm text-primary/80">Advanced tools for scaling support operations.</p>
          </div>
          <div className="mb-6 flex items-baseline gap-1 relative z-10">
            <span className="text-4xl font-extrabold text-white">$50</span>
            <span className="text-primary/70">/month</span>
          </div>
          <ul className="space-y-3 mb-8 flex-1 relative z-10">
            {['Unlimited agents', 'Advanced routing rules', '24/7 Priority support', 'Custom SLA', 'Advanced Analytics'].map((feature, i) => (
              <li key={i} className="flex items-center gap-3 text-sm text-white/80">
                <Check size={16} className="text-primary" />
                {feature}
              </li>
            ))}
          </ul>
          <button 
            onClick={handleUpgrade}
            disabled={isLoading}
            className={`relative z-10 w-full py-3 rounded-lg font-semibold transition-all ${
              isLoading 
                ? 'bg-primary/70 text-white cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-hover shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)]'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                Processing...
              </span>
            ) : (
              'Upgrade to Premium'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
