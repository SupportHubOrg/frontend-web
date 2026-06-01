import { useState, useCallback } from 'react';
import { Copy, Check } from 'lucide-react';

export default function CopyBadge({ label, value, compact = false }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = value;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [value]);

  if (compact) {
    return (
      <button
        onClick={handleCopy}
        title={`Copy ${label}: ${value}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          border: '1px solid var(--border-primary)',
          borderRadius: '4px',
          background: copied ? 'var(--tag-green-bg)' : 'var(--bg-inset)',
          color: copied ? 'var(--tag-green-fg)' : 'var(--fg-muted)',
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          maxWidth: '100%',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {copied ? 'Copied' : value}
        </span>
        {copied ? <Check size={12} /> : <Copy size={12} />}
      </button>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {label && <span className="text-meta" style={{ fontSize: '12px' }}>{label}</span>}
      <button
        onClick={handleCopy}
        title={`Click to copy: ${value}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '8px 12px',
          border: '1px solid var(--border-primary)',
          borderRadius: '6px',
          background: copied ? 'var(--tag-green-bg)' : 'var(--bg-inset)',
          color: copied ? 'var(--tag-green-fg)' : 'var(--fg-primary)',
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          width: '100%',
          textAlign: 'left',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {copied ? 'Copied to clipboard' : value}
        </span>
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}
