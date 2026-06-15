import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Spinner, UserPlus, EnvelopeSimple, ShieldCheck, Warning, Clock, CheckCircle, XCircle, CaretDown } from '@phosphor-icons/react';
import { createPortal } from 'react-dom';

export default function Users() {
  const { token, organization } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Invite modal state
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EMPLOYEE');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteError, setInviteError] = useState(null);
  const [inviteSuccess, setInviteSuccess] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get('http://localhost:5000/api/organizations/users', {
        headers: { Authorization: `Bearer ${token}` },
        params: { organizationId: organization?.id, pageSize: 100 }
      });
      setUsers(res.data.items || []);
    } catch (err) {
      setError('Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token && organization?.id) {
      fetchUsers();
    }
  }, [token, organization?.id]);

  const handleInvite = async (e) => {
    e.preventDefault();
    setInviteError(null);
    setInviteSuccess(false);
    setIsSubmitting(true);

    try {
      await axios.post('http://localhost:5000/api/organizations/users', {
        email: inviteEmail,
        role: inviteRole,
        organizationId: organization?.id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setInviteSuccess(true);
      setInviteEmail('');
      setInviteRole('EMPLOYEE');
      fetchUsers();
      
      setTimeout(() => {
        setIsInviting(false);
        setInviteSuccess(false);
      }, 2000);
    } catch (err) {
      setInviteError(err.response?.data?.title || err.response?.data?.message || 'Failed to send invite.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRole = (role) => {
    if (!role) return 'Unknown';
    return role.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
  };

  return (
    <div className="animate-entry" style={{ maxWidth: '1100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
        <div>
          <h1 className="text-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
            Team Management
          </h1>
          <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '14px' }}>
            Manage your organization's users, assign roles, and send invitations.
          </p>
        </div>
        <button 
          className="btn-minimal btn-minimal--primary" 
          onClick={() => setIsInviting(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px' }}
        >
          <UserPlus size={16} weight="bold" />
          Invite User
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(212, 64, 64, 0.08)', color: 'var(--destructive)', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '32px', fontSize: '14px', fontWeight: 500 }}>
          <Warning size={18} weight="bold" />
          {error}
        </div>
      )}

      {/* Users List */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', color: 'var(--fg-muted)' }}>
          <Spinner size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="card-minimal" style={{ overflow: 'hidden', padding: 0 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-surface-alt)', color: 'var(--fg-muted)' }}>
                <th style={{ padding: '12px 24px', fontWeight: 500, width: '40%' }}>User</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Role</th>
                <th style={{ padding: '12px 16px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '12px 24px', fontWeight: 500, textAlign: 'right' }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-primary)', transition: 'background 0.15s' }} onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-inset)'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--bg-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-secondary)', flexShrink: 0 }}>
                      <EnvelopeSimple size={18} weight="regular" />
                    </div>
                    <div>
                      <div className="text-body" style={{ fontWeight: 500, fontSize: '14px' }}>{user.email}</div>
                      <div className="text-code" style={{ color: 'var(--fg-muted)', fontSize: '12px', marginTop: '2px' }}>{user.id.substring(0, 8)}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--fg-primary)' }}>
                      <ShieldCheck size={16} weight="fill" style={{ color: 'var(--fg-muted)' }} />
                      {formatRole(user.role)}
                    </div>
                  </td>
                  <td style={{ padding: '16px 16px' }}>
                    {user.invitationStatus === 'PENDING' ? (
                      <span className="tag-pastel tag-pastel--orange" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} weight="bold" /> Pending Invite
                      </span>
                    ) : (
                      <span className="tag-pastel tag-pastel--green" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={12} weight="fill" /> Active
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--fg-muted)', textAlign: 'right' }}>
                    {new Date(user.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '64px', textAlign: 'center', color: 'var(--fg-muted)', fontSize: '14px' }}>
                    No users found in this organization.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {isInviting && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '24px' }}>
          <div className="card-minimal animate-entry" style={{ width: '100%', maxWidth: '440px', padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
              <h2 className="text-title" style={{ fontSize: '18px' }}>Invite Team Member</h2>
              <button className="btn-minimal btn-minimal--ghost" onClick={() => setIsInviting(false)} style={{ padding: '8px' }}>
                <XCircle size={20} />
              </button>
            </div>
            
            <div style={{ padding: '24px', background: 'var(--bg-surface)' }}>
              {inviteSuccess ? (
                <div style={{ padding: '16px', background: 'rgba(52, 211, 153, 0.1)', color: 'rgb(16, 185, 129)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 500 }}>
                  <CheckCircle size={20} weight="fill" />
                  Invitation sent successfully!
                </div>
              ) : (
                <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {inviteError && (
                    <div style={{ padding: '12px', background: 'rgba(212, 64, 64, 0.08)', color: 'var(--destructive)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Warning size={16} weight="bold" /> {inviteError}
                    </div>
                  )}
                  
                  <div>
                    <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>Email Address</label>
                    <input 
                      type="email" 
                      required
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="input-minimal" 
                      placeholder="colleague@company.com"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>Role</label>
                    <div style={{ position: 'relative' }}>
                      <select 
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="input-minimal"
                        style={{ width: '100%', boxSizing: 'border-box', appearance: 'none', background: 'var(--bg-inset)' }}
                      >
                        <option value="EMPLOYEE">Employee (Creates tickets)</option>
                        <option value="LEVEL_1_OPERATOR">Level 1 Operator (Basic support)</option>
                        <option value="LEVEL_2_OPERATOR">Level 2 Operator (Expert)</option>
                      </select>
                      <CaretDown size={14} weight="bold" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--fg-muted)' }} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button type="button" onClick={() => setIsInviting(false)} className="btn-minimal btn-minimal--ghost" style={{ flex: 1 }}>
                      Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting || !inviteEmail} className="btn-minimal btn-minimal--primary" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                      {isSubmitting ? <Spinner size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send Invite'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
