
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { login, register, isAuthenticated } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-50 w-full border-b border-[var(--border-primary)] bg-[var(--bg-surface)]/80 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-title text-xl tracking-tight">
          SupportHub
        </Link>
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <Link to="/billing" className="btn-minimal btn-minimal--primary">
              Go to App
            </Link>
          ) : (
            <>
              <button onClick={() => login()} className="btn-minimal btn-minimal--ghost">
                Log in
              </button>
              <button onClick={() => register()} className="btn-minimal btn-minimal--primary">
                Start Free Trial
              </button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
}
