import { Monitor } from 'lucide-react';

export default function StubPage({ moduleCode, moduleName, description }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '50vh', textAlign: 'center' }}>
      <div className="card-minimal" style={{ width: '100%', maxWidth: '520px', padding: '48px 32px' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--bg-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
          <Monitor size={24} style={{ color: 'var(--fg-secondary)' }} />
        </div>

        <h2 className="text-title" style={{ fontSize: '24px', marginBottom: '8px' }}>
          {moduleName}
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
          <span className="status-dot status-dot--offline" style={{ flexShrink: 0 }} />
          <span className="text-meta" style={{ fontSize: '13px' }}>
            Module Offline ({moduleCode})
          </span>
        </div>

        <p className="text-body" style={{ color: 'var(--fg-secondary)', maxWidth: '380px', margin: '0 auto 24px' }}>
          {description}
        </p>

        <span className="tag-pastel tag-pastel--blue" style={{ fontSize: '13px', padding: '4px 12px' }}>
          Coming Soon
        </span>
      </div>
    </div>
  );
}
