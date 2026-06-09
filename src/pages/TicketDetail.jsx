import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Loader2, ArrowLeft, Send, AlertCircle, User, Bot, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

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
        axios.get(`http://localhost:5003/api/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get('http://localhost:5003/api/tickets/messages', {
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
      await axios.post(`http://localhost:5003/api/tickets/${ticketId}/messages`, 
        { message: newMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setNewMessage('');
      // Refresh messages
      const messagesRes = await axios.get('http://localhost:5003/api/tickets/messages', {
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
      await axios.put(`http://localhost:5003/api/tickets/${ticketId}`, 
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
      await axios.post(`http://localhost:5003/api/tickets/${ticketId}/propose-article`, 
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
      <div style={{ padding: '48px', display: 'flex', justifyContent: 'center', color: 'var(--fg-secondary)' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error && !ticket) {
    return (
      <div>
        <button onClick={onBack} className="btn-minimal btn-minimal--secondary" style={{ marginBottom: '24px', padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ArrowLeft size={18} /> Back to Tickets
        </button>
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(212, 64, 64, 0.08)', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--destructive)', fontSize: '14px', fontWeight: 500 }}>
          <AlertCircle size={18} />
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-entry" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div style={{ marginBottom: '24px' }}>
        <button onClick={onBack} className="btn-minimal btn-minimal--secondary" style={{ marginBottom: '24px', padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <ArrowLeft size={18} /> Back to Tickets
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="text-title" style={{ fontSize: '24px', marginBottom: '8px' }}>
              {ticket?.subject}
            </h1>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--fg-secondary)' }}>
              <span>ID: {ticket?.id?.substring(0, 8)}</span>
              <span>Created: {new Date(ticket?.createdAt).toLocaleString()}</span>
            </div>
          </div>
          <span className={`tag-pastel ${['CLOSED', 'IN_KNOWLEDGE_BASE', 'NOT_IN_KNOWLEDGE_BASE'].includes(ticket?.status) ? 'tag-pastel--green' : ['NEW', 'UNASSIGNED'].includes(ticket?.status) ? 'tag-pastel--blue' : 'tag-pastel--orange'}`}>
            {ticket?.status?.replace(/_/g, ' ') || 'NEW'}
          </span>
        </div>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(212, 64, 64, 0.08)', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', color: 'var(--destructive)', fontSize: '14px', fontWeight: 500 }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Main Content Area: split into description & chat */}
      <div style={{ display: 'flex', gap: '32px', flex: 1, minHeight: 0 }}>
        
        {/* Left Side: Ticket Description & Details */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '24px', flexShrink: 0 }}>
          
          {/* Ticket Actions Block */}
          {(user?.role === 'ORGANIZATION_MANAGER' || user?.role === 'LEVEL_1_OPERATOR' || user?.role === 'LEVEL_2_OPERATOR' || user?.role === 'SUPPORT_HUB_ADMINISTRATOR') && (
            <div className="card-minimal" style={{ padding: '24px' }}>
              <h3 className="text-meta" style={{ marginBottom: '16px', color: 'var(--fg-secondary)' }}>Ticket Actions</h3>
              
              {/* Unassigned or New Ticket Case -> Assign to Me */}
              {['NEW', 'UNASSIGNED'].includes(ticket?.status) && (user?.role === 'LEVEL_1_OPERATOR' || user?.role === 'LEVEL_2_OPERATOR') && (
                <button 
                  onClick={() => handleUpdateTicket(user.role === 'LEVEL_1_OPERATOR' ? 'IN_PROGRESS_LEVEL_1' : 'IN_PROGRESS_LEVEL_2', user.id)}
                  disabled={isUpdating}
                  className="btn-minimal btn-minimal--primary"
                  style={{ width: '100%', marginBottom: '16px', justifyContent: 'center' }}
                >
                  {isUpdating ? <Loader2 size={16} className="spin" /> : 'Assign to Me'}
                </button>
              )}

              {/* Status Update Dropdown */}
              {(user?.role === 'ORGANIZATION_MANAGER' || ticket?.assignedOperatorId === user?.id) && (
                <div>
                  <label className="text-meta" style={{ display: 'block', marginBottom: '8px' }}>Update Status</label>
                  <select 
                    className="input-minimal" 
                    value={ticket?.status || 'NEW'} 
                    onChange={(e) => handleUpdateTicket(e.target.value, ticket.assignedOperatorId)}
                    disabled={isUpdating}
                    style={{ width: '100%', padding: '10px 12px' }}
                  >
                    {user?.role === 'ORGANIZATION_MANAGER' && <option value="NEW">New</option>}
                    <option value="UNASSIGNED">Unassigned (Return to Queue)</option>
                    
                    {(user?.role === 'ORGANIZATION_MANAGER' || user?.role === 'LEVEL_1_OPERATOR') && (
                      <option value="IN_PROGRESS_LEVEL_1">In Progress</option>
                    )}
                    
                    {(user?.role === 'ORGANIZATION_MANAGER' || user?.role === 'LEVEL_2_OPERATOR') && (
                      <option value="IN_PROGRESS_LEVEL_2">In Progress (Escalated)</option>
                    )}
                    
                    <option value="AWAITING_CUSTOMER_RESPONSE">Awaiting Customer Response</option>
                    <option value="CLOSED">Closed (Resolved)</option>
                  </select>
                </div>
              )}

              {/* Propose to Knowledge Base Button */}
              {ticket?.status === 'CLOSED' && (user?.role === 'ORGANIZATION_MANAGER' || user?.role === 'LEVEL_1_OPERATOR' || user?.role === 'LEVEL_2_OPERATOR') && (
                <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-primary)', paddingTop: '16px' }}>
                  <button 
                    onClick={handleProposeArticle}
                    disabled={isProposing}
                    className="btn-minimal btn-minimal--ghost"
                    style={{ width: '100%', justifyContent: 'center', color: 'var(--fg-secondary)' }}
                  >
                    {isProposing ? <Loader2 size={16} className="spin" /> : 'Suggest to Knowledge Base'}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="card-minimal" style={{ padding: '24px' }}>
            <h3 className="text-meta" style={{ marginBottom: '12px', color: 'var(--fg-secondary)' }}>Description</h3>
            <p className="text-body" style={{ fontSize: '14px', whiteSpace: 'pre-wrap', color: 'var(--fg-primary)' }}>
              {ticket?.description}
            </p>
          </div>
        </div>

        {/* Right Side: Chat / Messages */}
        <div className="card-minimal" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Chat Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {messages.length === 0 ? (
              <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--fg-muted)' }}>
                <p className="text-body" style={{ fontSize: '14px' }}>No messages yet.</p>
                <p className="text-meta">Start the conversation below.</p>
              </div>
            ) : (
              messages.map(msg => {
                const isMine = msg.senderId === user?.id; // user might not be correctly synced, fallback to generic view
                const isAI = msg.senderType === 'AI';
                
                return (
                  <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {isAI && <Bot size={14} color="var(--tag-blue-fg)" />}
                      <span className="text-meta" style={{ fontSize: '11px', color: isAI ? 'var(--tag-blue-fg)' : 'var(--fg-muted)', fontWeight: isAI ? 600 : 400 }}>
                        {isAI ? 'AI Assistant' : (msg.senderType || 'User')} • {new Date(msg.sentAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                    <div style={{ 
                      padding: '12px 16px', 
                      borderRadius: '12px', 
                      background: isAI ? 'var(--tag-blue-bg)' : (isMine ? 'var(--fg-primary)' : 'var(--bg-inset)'),
                      color: isMine && !isAI ? 'var(--bg-primary)' : (isAI ? 'var(--tag-blue-fg)' : 'var(--fg-primary)'),
                      maxWidth: '85%',
                      border: isAI ? '1px solid rgba(31, 108, 159, 0.2)' : (isMine ? 'none' : '1px solid var(--border-primary)'),
                      borderBottomRightRadius: isMine ? '4px' : '12px',
                      borderBottomLeftRadius: !isMine ? '4px' : '12px',
                    }}>
                      <p className="text-body" style={{ fontSize: '14px', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>
                        {msg.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Chat Input Area */}
          <div style={{ padding: '16px', borderTop: '1px solid var(--border-primary)', background: 'var(--bg-primary)' }}>
            <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '12px' }}>
              <input 
                type="text" 
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="input-minimal"
                style={{ flex: 1, padding: '12px 16px', background: 'var(--bg-inset)', border: '1px solid var(--border-primary)', borderRadius: '24px', fontSize: '14px' }}
                disabled={isSending}
              />
              <button 
                type="submit" 
                disabled={isSending || !newMessage.trim()}
                className="btn-minimal btn-minimal--primary"
                style={{ width: '44px', height: '44px', borderRadius: '50%', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                {isSending ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
