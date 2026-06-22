import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Spinner, ArrowLeft, PaperPlaneRight, WarningCircle, UserCircle, Robot, CaretDown, Lightbulb, Warning } from '@phosphor-icons/react';

export default function TicketDetail({ ticketId, onBack }) {
  const { token, user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isProposing, setIsProposing] = useState(false);

  const fetchTicketDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [ticketRes, messagesRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL || 'https://dingbat-brussels-dimmer.ngrok-free.dev'}/api/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_API_URL || 'https://dingbat-brussels-dimmer.ngrok-free.dev'}/api/tickets/messages`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { ticketId, sortBy: 'SentAt', sortDescending: false, pageSize: 100 }
        })
      ]);

      setTicket(ticketRes.data);
      setMessages(messagesRes.data.items || []);
    } catch (err) {
      setError(err.response?.data?.title || err.response?.data?.message || err.message || 'Failed to load ticket details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (ticketId && token) {
      fetchTicketDetails();
    }
  }, [ticketId, token]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'https://dingbat-brussels-dimmer.ngrok-free.dev'}/api/tickets/${ticketId}/messages`, 
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewMessage('');
      // Refresh messages
      const messagesRes = await axios.get(`${import.meta.env.VITE_API_URL || 'https://dingbat-brussels-dimmer.ngrok-free.dev'}/api/tickets/messages`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { ticketId, sortBy: 'SentAt', sortDescending: false, pageSize: 100 }
      });
      setMessages(messagesRes.data.items || []);
    } catch (err) {
      setError(err.response?.data?.title || err.response?.data?.message || err.message || 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdateTicket = async (newStatus, newOperatorId) => {
    setIsUpdating(true);
    try {
      await axios.put(`${import.meta.env.VITE_API_URL || 'https://dingbat-brussels-dimmer.ngrok-free.dev'}/api/tickets/${ticketId}`, 
        { status: newStatus, operatorId: newOperatorId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh ticket details
      await fetchTicketDetails();
    } catch (err) {
      setError(err.response?.data?.title || err.response?.data?.message || err.message || 'Failed to update ticket');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleProposeArticle = async () => {
    if (!ticket) return;
    setIsProposing(true);
    setError(null);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL || 'https://dingbat-brussels-dimmer.ngrok-free.dev'}/api/tickets/${ticketId}/propose-article`, 
        {
          proposedSubject: ticket.subject,
          tags: ticket.tags?.map(t => t.id) || []
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Successfully proposed to Knowledge Base!');
      await fetchTicketDetails();
    } catch (err) {
      setError(err.response?.data?.title || err.response?.data?.message || err.message || 'Failed to propose to Knowledge Base.');
    } finally {
      setIsProposing(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '64px', display: 'flex', justifyContent: 'center', color: 'var(--fg-muted)' }}>
        <Spinner size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div>
        <button onClick={onBack} className="btn-minimal btn-minimal--ghost" style={{ marginBottom: '24px', padding: '8px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ArrowLeft size={16} weight="bold" /> Back to Tickets
        </button>
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(212, 64, 64, 0.08)', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--destructive)', fontSize: '14px', fontWeight: 500 }}>
          <Warning size={18} weight="bold" />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-entry" style={{ maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <button onClick={onBack} className="btn-minimal btn-minimal--ghost" style={{ marginBottom: '24px', padding: '8px 0', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ArrowLeft size={16} weight="bold" /> Back to Tickets
        </button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="text-title" style={{ fontSize: '28px', marginBottom: '8px', lineHeight: 1.2 }}>
              {ticket?.subject}
            </h1>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--fg-muted)' }}>
              <span className="text-code">#{ticket?.id?.substring(0, 8)}</span>
              <span>Created {new Date(ticket?.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(212, 64, 64, 0.08)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--destructive)', fontSize: '14px', fontWeight: 500 }}>
          <Warning size={18} weight="bold" />
          {error}
        </div>
      )}

      {/* Main Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 280px', gap: '48px', alignItems: 'start' }}>
        
        {/* Left Column: Thread & Reply */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '64px' }}>
          
          {/* Original Request (Description) */}
          <div className="card-minimal" style={{ padding: '24px', background: 'var(--bg-primary)', border: '1px solid var(--border-primary)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
               <UserCircle size={24} weight="fill" style={{ color: 'var(--fg-muted)' }} />
               <div>
                 <span className="text-meta" style={{ display: 'block', color: 'var(--fg-primary)' }}>Original Request</span>
               </div>
             </div>
             <div className="text-body" style={{ fontSize: '14px', whiteSpace: 'pre-wrap', color: 'var(--fg-primary)', paddingLeft: '36px', lineHeight: 1.6 }}>
               {ticket?.description}
             </div>
          </div>

          {/* Activity Feed */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
             {messages.map(msg => {
               const isAI = msg.senderType === 'AI';
               const isMine = msg.senderId === user?.id;
               
               return (
                 <div key={msg.id} style={{ display: 'flex', gap: '12px' }}>
                   {isAI ? (
                     <Robot size={24} weight="fill" style={{ color: 'var(--tag-blue-fg)', flexShrink: 0 }} />
                   ) : (
                     <UserCircle size={24} weight="fill" style={{ color: isMine ? 'var(--fg-primary)' : 'var(--fg-muted)', flexShrink: 0 }} />
                   )}
                   <div style={{ flex: 1 }}>
                     <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                       <span className="text-meta" style={{ color: 'var(--fg-primary)', fontWeight: 600 }}>
                         {isAI ? 'AI Assistant' : (msg.senderType || 'User')}
                       </span>
                       <span className="text-meta" style={{ fontSize: '11px', color: 'var(--fg-muted)' }}>
                         {new Date(msg.sentAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                       </span>
                     </div>
                     <div className="text-body" style={{ 
                       fontSize: '14px', 
                       whiteSpace: 'pre-wrap', 
                       color: 'var(--fg-primary)',
                       background: isAI ? 'var(--bg-inset)' : 'transparent',
                       padding: isAI ? '12px 16px' : '0',
                       borderRadius: isAI ? '8px' : '0',
                       border: isAI ? '1px solid var(--border-primary)' : 'none',
                       lineHeight: 1.6
                     }}>
                       {msg.message}
                     </div>
                   </div>
                 </div>
               );
             })}
          </div>

          {/* Reply Box */}
          <div className="card-minimal" style={{ padding: '16px', position: 'sticky', bottom: '24px', boxShadow: '0 -12px 24px var(--bg-primary)' }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <textarea 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Write a reply..."
                className="input-minimal"
                style={{ minHeight: '100px', resize: 'vertical', border: 'none', background: 'transparent', padding: '0 8px', fontSize: '14px', boxShadow: 'none' }}
                disabled={isSending}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-primary)', paddingTop: '12px' }}>
                <span className="text-meta" style={{ fontSize: '12px', color: 'var(--fg-muted)', paddingLeft: '8px' }}>
                  Press Send to reply
                </span>
                <button 
                  type="submit" 
                  disabled={isSending || !newMessage.trim()}
                  className="btn-minimal btn-minimal--primary"
                  style={{ padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center', borderRadius: '99px' }}
                >
                  {isSending ? <Spinner size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <PaperPlaneRight size={16} weight="bold" />}
                  Send Reply
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '24px' }}>
          
          {/* Properties Card */}
          <div className="card-minimal" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 className="text-title" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)' }}>Properties</h3>
            
            {/* Status */}
            <div>
              <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-muted)' }}>Status</label>
              {(user?.role === 'ORGANIZATION_MANAGER' || ticket?.assignedOperatorId === user?.id) ? (
                <div style={{ position: 'relative' }}>
                  <select 
                    className="input-minimal" 
                    value={ticket?.status || 'NEW'} 
                    onChange={(e) => handleUpdateTicket(e.target.value, ticket.assignedOperatorId)}
                    disabled={isUpdating}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '13px', appearance: 'none', background: 'var(--bg-inset)' }}
                  >
                    <option value="NEW">New</option>
                    <option value="UNASSIGNED">Unassigned</option>
                    <option value="IN_PROGRESS_LEVEL_1">In Progress (L1)</option>
                    <option value="IN_PROGRESS_LEVEL_2">In Progress (L2)</option>
                    <option value="AWAITING_CUSTOMER_RESPONSE">Awaiting Response</option>
                    <option value="CLOSED">Closed (Resolved)</option>
                    <option value="SOLUTION_IMPOSSIBLE">Solution Impossible</option>
                  </select>
                  <CaretDown size={14} weight="bold" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--fg-muted)' }} />
                </div>
              ) : (
                <div style={{ fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`status-dot ${ticket?.status === 'CLOSED' ? 'status-dot--offline' : 'status-dot--online'}`} />
                  {ticket?.status?.replace(/_/g, ' ') || 'NEW'}
                </div>
              )}
            </div>

            {/* Assignee */}
            <div>
              <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-muted)' }}>Assignee</label>
              {['NEW', 'UNASSIGNED'].includes(ticket?.status) && (user?.role === 'LEVEL_1_OPERATOR' || user?.role === 'LEVEL_2_OPERATOR') ? (
                <button 
                  onClick={() => handleUpdateTicket(user.role === 'LEVEL_1_OPERATOR' ? 'IN_PROGRESS_LEVEL_1' : 'IN_PROGRESS_LEVEL_2', user.id)}
                  disabled={isUpdating}
                  className="btn-minimal btn-minimal--ghost"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 0', fontSize: '13px' }}
                >
                  {isUpdating ? <Spinner size={14} style={{ animation: 'spin 1s linear infinite' }} /> : 'Assign to me'}
                </button>
              ) : (
                 <div style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                   <UserCircle size={16} weight="fill" style={{ color: 'var(--fg-muted)' }} />
                   {ticket?.assignedOperatorId === user?.id ? 'You' : (ticket?.assignedOperatorId || 'Unassigned')}
                 </div>
              )}
            </div>
            
          </div>

          {/* Actions Card (if applicable) */}
          {ticket?.status === 'CLOSED' && (user?.role === 'ORGANIZATION_MANAGER' || user?.role === 'LEVEL_1_OPERATOR' || user?.role === 'LEVEL_2_OPERATOR') && (
            <div className="card-minimal" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 className="text-title" style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--fg-secondary)' }}>Knowledge Base</h3>
              <p className="text-meta" style={{ fontSize: '12px', color: 'var(--fg-muted)', lineHeight: 1.5 }}>
                If the solution is valuable, propose it as an article.
              </p>
              <button 
                onClick={handleProposeArticle}
                disabled={isProposing}
                className="btn-minimal btn-minimal--secondary"
                style={{ width: '100%', justifyContent: 'center', fontSize: '13px', display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                {isProposing ? <Spinner size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Lightbulb size={16} weight="bold" />}
                Suggest Article
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
