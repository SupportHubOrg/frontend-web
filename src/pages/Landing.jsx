import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import Header from '../components/Header';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { register } = useAuth();
  
  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Header />
      
      <main className="mx-auto max-w-5xl px-6">
        {/* Hero Section */}
        <section className="flex flex-col items-start justify-center py-32 md:py-48">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl"
          >
            <motion.div variants={fadeUp} className="mb-6">
              <span className="tag-pastel tag-pastel--blue uppercase tracking-widest text-xs">
                Premium Customer Support
              </span>
            </motion.div>
            
            <motion.h1 
              variants={fadeUp}
              className="text-title text-5xl md:text-7xl font-medium tracking-tighter text-[var(--fg-primary)] mb-8"
              style={{ lineHeight: 1.1 }}
            >
              Resolve tickets faster.<br />
              Without the clutter.
            </motion.h1>
            
            <motion.p 
              variants={fadeUp}
              className="text-body text-xl text-[var(--fg-muted)] max-w-[50ch] mb-12"
            >
              SupportHub is an editorial-grade helpdesk built for engineering teams. 
              Integrated knowledge base, minimal UI, and zero distractions.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <button onClick={() => register()} className="btn-minimal btn-minimal--primary px-8 py-3 text-base">
                Start Free Trial
              </button>
              <Link to="/register" className="btn-minimal btn-minimal--secondary px-8 py-3 text-base">
                View Documentation
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Bento Grid Features */}
        <section className="py-24 border-t border-[var(--border-primary)]">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <motion.div variants={fadeUp} className="card-minimal p-8 md:col-span-2">
              <div className="w-10 h-10 rounded bg-[var(--bg-inset)] mb-6 flex items-center justify-center border border-[var(--border-primary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              </div>
              <h3 className="text-title text-2xl mb-3">Instant Telemetry</h3>
              <p className="text-body text-[var(--fg-muted)] max-w-md">
                Connect your monitoring tools directly to SupportHub. Automatically attach system logs and traces to incoming customer reports.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="card-minimal p-8">
              <div className="w-10 h-10 rounded bg-[var(--bg-inset)] mb-6 flex items-center justify-center border border-[var(--border-primary)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
              </div>
              <h3 className="text-title text-2xl mb-3">AI Context</h3>
              <p className="text-body text-[var(--fg-muted)]">
                Draft responses based on previous similar tickets and internal documentation.
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="card-minimal p-8 md:col-span-3">
              <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="flex-1">
                  <span className="tag-pastel tag-pastel--green mb-4 inline-block">Workflow</span>
                  <h3 className="text-title text-2xl mb-3">Keyboard First</h3>
                  <p className="text-body text-[var(--fg-muted)] max-w-xl">
                    Every action in SupportHub is accessible via keyboard shortcuts. Navigate tickets, assign tags, and publish articles without ever touching the mouse.
                  </p>
                </div>
                <div className="flex gap-2">
                  <kbd className="px-3 py-1.5 bg-[var(--bg-inset)] border border-[var(--border-primary)] rounded font-mono text-xs shadow-sm">⌘</kbd>
                  <kbd className="px-3 py-1.5 bg-[var(--bg-inset)] border border-[var(--border-primary)] rounded font-mono text-xs shadow-sm">K</kbd>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </section>

      </main>

      <footer className="border-t border-[var(--border-primary)] bg-[var(--bg-surface)] py-12">
        <div className="mx-auto max-w-5xl px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-meta">© 2026 SupportHub Inc. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-meta hover:text-[var(--fg-primary)] transition-colors">Privacy</a>
            <a href="#" className="text-meta hover:text-[var(--fg-primary)] transition-colors">Terms</a>
            <a href="#" className="text-meta hover:text-[var(--fg-primary)] transition-colors">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
