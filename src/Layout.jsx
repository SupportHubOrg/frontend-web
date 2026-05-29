import { Outlet, Link } from 'react-router-dom';
import { CreditCard, LayoutDashboard, Settings, User } from 'lucide-react';

export default function Layout() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold">
            S
          </div>
          <span className="font-bold text-xl tracking-tight text-foreground">SupportHub</span>
        </div>

        <nav className="flex-1 space-y-2">
          <Link to="#" className="flex items-center gap-3 px-3 py-2 text-muted hover:text-foreground rounded-md hover:bg-white/5 transition-colors">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/billing" className="flex items-center gap-3 px-3 py-2 text-primary bg-primary/10 rounded-md transition-colors">
            <CreditCard size={18} />
            <span className="font-medium">Billing</span>
          </Link>
          <Link to="#" className="flex items-center gap-3 px-3 py-2 text-muted hover:text-foreground rounded-md hover:bg-white/5 transition-colors">
            <Settings size={18} />
            <span>Settings</span>
          </Link>
        </nav>

        <div className="pt-6 border-t border-border mt-auto">
          <div className="flex items-center gap-3 px-3 py-2 text-muted">
            <div className="w-8 h-8 rounded-full bg-border flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">Admin User</p>
              <p className="text-xs">admin@supporthub.io</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-10 relative">
        {/* Ambient glow effect for premium feel */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="max-w-4xl mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
