import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Loader2, Plus, Ticket as TicketIcon, AlertCircle } from 'lucide-react';
import TicketDetail from './TicketDetail';

export default function Tickets() {
  const { token, organization } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', description: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTicketId, setSelectedTicketId] = useState(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await axios.get('http://localhost:5003/api/tickets', {
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
      await axios.post('http://localhost:5003/api/tickets', newTicket, {
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

  return (
    <div className="animate-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
        <div>
          <h1 className="text-title" style={{ fontSize: '32px', marginBottom: '12px' }}>
            Tickets
          </h1>
          <p className="text-body" style={{ color: 'var(--fg-secondary)', maxWidth: '600px' }}>
            Manage your organization's support requests.
          </p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)} 
          className="btn-minimal btn-minimal--primary"
          style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}
        >
          {isCreating ? 'Cancel' : <><Plus size={18} /> New Ticket</>}
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(212, 64, 64, 0.08)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px', color: 'var(--destructive)', fontSize: '14px', fontWeight: 500 }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreateTicket} className="card-minimal" style={{ padding: '24px', marginBottom: '32px' }}>
          <h3 className="text-title" style={{ fontSize: '20px', marginBottom: '24px' }}>Create New Ticket</h3>
          <div style={{ marginBottom: '16px' }}>
            <label className="text-meta" style={{ display: 'block', marginBottom: '8px' }}>Subject</label>
            <input 
              type="text" 
              value={newTicket.subject}
              onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
              required
              minLength={5}
              maxLength={200}
              className="input-minimal"
              style={{ width: '100%', padding: '12px', background: 'var(--bg-inset)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'var(--fg-primary)' }}
              placeholder="Brief summary of the issue..."
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label className="text-meta" style={{ display: 'block', marginBottom: '8px' }}>Description</label>
            <textarea 
              value={newTicket.description}
              onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
              required
              minLength={15}
              maxLength={10000}
              className="input-minimal"
              style={{ width: '100%', minHeight: '120px', padding: '12px', background: 'var(--bg-inset)', border: '1px solid var(--border-primary)', borderRadius: '6px', color: 'var(--fg-primary)', resize: 'vertical' }}
              placeholder="Detailed explanation..."
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" onClick={() => setIsCreating(false)} className="btn-minimal btn-minimal--secondary" style={{ padding: '8px 16px' }}>
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-minimal btn-minimal--primary" style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              {isSubmitting && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              Submit
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div style={{ padding: '48px', display: 'flex', justifyContent: 'center', color: 'var(--fg-secondary)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : tickets.length === 0 ? (
        <div className="card-minimal" style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-secondary)' }}>
          <TicketIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 className="text-title" style={{ fontSize: '18px', marginBottom: '8px' }}>No tickets found</h3>
          <p className="text-body" style={{ fontSize: '14px' }}>You haven't created any support tickets yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {tickets.map(ticket => (
            <div 
              key={ticket.id} 
              className="card-minimal" 
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => setSelectedTicketId(ticket.id)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--fg-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-primary)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <h4 className="text-title" style={{ fontSize: '18px' }}>{ticket.subject}</h4>
                <span className={`tag-pastel ${ticket.status === 'Resolved' ? 'tag-pastel--green' : ticket.status === 'Open' ? 'tag-pastel--blue' : 'tag-pastel--orange'}`}>
                  {ticket.status || 'Pending'}
                </span>
              </div>
              <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '14px', whiteSpace: 'pre-wrap', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {ticket.description}
              </p>
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: 'var(--fg-muted)' }}>
                <span>ID: {ticket.id?.substring(0, 8)}</span>
                <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
