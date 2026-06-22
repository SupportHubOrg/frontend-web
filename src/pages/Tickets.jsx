import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Spinner, Plus, WarningCircle, Circle, CheckCircle, Warning, MagnifyingGlass } from '@phosphor-icons/react';
import { createPortal } from 'react-dom';
import TicketDetail from './TicketDetail';

export default function Tickets() {
  const { token, organization, user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  
  // Tabs & Search state
  const [activeTab, setActiveTab] = useState('open'); // 'all', 'open', 'resolved'
  const [searchQuery, setSearchQuery] = useState('');

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'https://dingbat-brussels-dimmer.ngrok-free.dev'}/api/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { organizationId: organization?.id }
      });
      setTickets(res.data.items || []);
    } catch (err) {
      setError(err.response?.data?.title || err.response?.data?.message || err.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTickets();
    }
  }, [token, organization]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject || !newTicket.description) return;
    
    setIsSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'https://dingbat-brussels-dimmer.ngrok-free.dev'}/api/tickets`, newTicket, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsCreating(false);
      setNewTicket({ subject: '', description: '' });
      fetchTickets();
    } catch (err) {
      setError(err.response?.data?.title || err.response?.data?.message || err.message || 'Failed to create ticket');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedTicketId) {
    return <TicketDetail ticketId={selectedTicketId} onBack={() => setSelectedTicketId(null)} />;
  }

  // Filter & Sort Logic
  const isResolved = (status) => status === 'CLOSED' || status === 'SOLUTION_IMPOSSIBLE';

  const filteredTickets = tickets
    .filter(t => {
      if (activeTab === 'open') return !isResolved(t.status);
      if (activeTab === 'resolved') return isResolved(t.status);
      return true; // 'all'
    })
    .filter(t => 
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) || 
      t.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const StatusIcon = ({ status }) => {
    if (isResolved(status)) return <CheckCircle size={16} weight="fill" style={{ color: 'var(--success)' }} />;
    if (status === 'NEW' || status === 'UNASSIGNED') return <Circle size={16} weight="bold" style={{ color: 'var(--tag-blue-fg)' }} />;
    return <WarningCircle size={16} weight="bold" style={{ color: 'var(--warning)' }} />; // Pending / In Progress
  };

  return (
    <div className="animate-entry" style={{ maxWidth: '1200px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="text-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
            Tickets
          </h1>
          <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '14px' }}>
            {user?.role.includes('OPERATOR') ? 'Manage your assigned queue.' : 'Manage organization support requests.'}
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(true)} 
          className="btn-minimal btn-minimal--primary"
        >
          <Plus size={16} weight="bold" /> New Ticket
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '6px', background: 'rgba(212, 64, 64, 0.08)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--destructive)', fontSize: '13px', fontWeight: 500 }}>
          <Warning size={16} weight="bold" />
          {error}
        </div>
      )}

      {/* Tabs and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-primary)', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {[
            { id: 'open', label: 'Open' },
            { id: 'resolved', label: 'Resolved' },
            { id: 'all', label: 'All Tickets' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'transparent',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid var(--fg-primary)' : '2px solid transparent',
                padding: '8px 4px 12px 4px',
                fontSize: '14px',
                fontWeight: activeTab === tab.id ? 600 : 500,
                color: activeTab === tab.id ? 'var(--fg-primary)' : 'var(--fg-secondary)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                marginBottom: '-1px'
              }}
            >
              {tab.label}
              <span style={{ 
                marginLeft: '8px', 
                fontSize: '11px', 
                background: 'var(--bg-inset)', 
                padding: '2px 6px', 
                borderRadius: '99px',
                fontWeight: 500,
                color: 'var(--fg-muted)'
              }}>
                {tickets.filter(t => tab.id === 'all' ? true : tab.id === 'open' ? !isResolved(t.status) : isResolved(t.status)).length}
              </span>
            </button>
          ))}
        </div>
        <div style={{ position: 'relative', width: '240px', marginBottom: '8px' }}>
          <MagnifyingGlass size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)' }} />
          <input 
            type="text" 
            placeholder="Search tickets..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-minimal"
            style={{ paddingLeft: '32px', height: '32px', fontSize: '13px' }}
          />
        </div>
      </div>

      {/* List View */}
      {isLoading ? (
        <div style={{ padding: '64px', display: 'flex', justifyContent: 'center', color: 'var(--fg-muted)' }}>
          <Spinner size={24} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : filteredTickets.length === 0 ? (
        <div style={{ padding: '64px', textAlign: 'center', color: 'var(--fg-muted)', border: '1px dashed var(--border-primary)', borderRadius: '8px' }}>
          <p className="text-body" style={{ fontSize: '14px' }}>No tickets found in this view.</p>
        </div>
      ) : (
        <div className="card-minimal" style={{ overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-surface-alt)', color: 'var(--fg-muted)' }}>
                <th style={{ padding: '12px 24px', fontWeight: 500, width: '40px' }}>Status</th>
                <th style={{ padding: '12px 16px', fontWeight: 500, width: '120px' }}>ID</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Subject</th>
                <th style={{ padding: '12px 24px', fontWeight: 500, width: '160px', textAlign: 'right' }}>Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr 
                  key={ticket.id} 
                  style={{ borderBottom: '1px solid var(--border-primary)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-inset)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <StatusIcon status={ticket.status} />
                  </td>
                  <td className="text-code" style={{ padding: '12px 16px', color: 'var(--fg-secondary)' }}>
                    {ticket.id?.substring(0, 8)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span className="text-body" style={{ fontWeight: 500, fontSize: '14px' }}>{ticket.subject}</span>
                  </td>
                  <td style={{ padding: '12px 24px', color: 'var(--fg-muted)', textAlign: 'right' }}>
                    {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Overlay for Creating Ticket */}
      {isCreating && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="card-minimal animate-entry" style={{ width: '500px', padding: '32px', background: 'var(--bg-surface)' }}>
            <h2 className="text-title" style={{ fontSize: '20px', marginBottom: '24px' }}>New Ticket</h2>
            
            <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>Subject</label>
                <input 
                  type="text" 
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  required
                  minLength={5}
                  maxLength={200}
                  className="input-minimal" 
                  placeholder="Brief summary of the issue..."
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>Description</label>
                <textarea 
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  required
                  minLength={15}
                  maxLength={10000}
                  className="input-minimal"
                  placeholder="Detailed explanation..."
                  style={{ width: '100%', minHeight: '120px', resize: 'vertical', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsCreating(false)} className="btn-minimal btn-minimal--ghost">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-minimal btn-minimal--primary" style={{ minWidth: '100px', display: 'flex', justifyContent: 'center' }}>
                  {isSubmitting ? <Spinner size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
