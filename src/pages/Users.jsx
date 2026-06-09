import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Loader2, UserPlus, Mail, Shield, AlertCircle, Clock, CheckCircle } from 'lucide-react';

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

  return (
    <div className="animate-entry">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '48px' }}>
        <div>
          <h1 className="text-title" style={{ fontSize: '32px', marginBottom: '12px' }}>
            Team Management
          </h1>
          <p className="text-body" style={{ color: 'var(--fg-secondary)', maxWidth: '600px' }}>
            Manage your organization's users, assign roles, and send invitations.
          </p>
        </div>
        <button 
          className="btn-minimal btn-minimal--primary" 
          onClick={() => setIsInviting(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <UserPlus size={18} />
          Invite User
        </button>
      </div>

      {error && (
        <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(212, 64, 64, 0.08)', color: 'var(--destructive)', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '32px', fontSize: '14px', fontWeight: 500 }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Users List */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', color: 'var(--fg-muted)' }}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (
        <div className="card-minimal" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-primary)', color: 'var(--fg-secondary)' }}>
                <th style={{ padding: '16px 24px', fontWeight: 500 }}>User / Email</th>
                <th style={{ padding: '16px 24px', fontWeight: 500 }}>Role</th>
                <th style={{ padding: '16px 24px', fontWeight: 500 }}>Status</th>
                <th style={{ padding: '16px 24px', fontWeight: 500 }}>Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                  <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-inset)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--fg-secondary)' }}>
                      <Mail size={16} />
                    </div>
                    <div>
                      <div className="text-body" style={{ fontWeight: 500 }}>{user.email}</div>
                      <div className="text-meta" style={{ color: 'var(--fg-muted)' }}>ID: {user.id.substring(0, 8)}...</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--fg-primary)' }}>
                      <Shield size={16} style={{ color: 'var(--fg-muted)' }} />
                      {user.role}
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    {user.invitationStatus === 'PENDING' ? (
                      <span className="tag-pastel tag-pastel--orange" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={12} /> Pending Invite
                      </span>
                    ) : (
                      <span className="tag-pastel tag-pastel--green" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle size={12} /> Active
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--fg-secondary)' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: '48px', textAlign: 'center', color: 'var(--fg-muted)' }}>
                    No users found in this organization.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {isInviting && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card-minimal animate-entry" style={{ width: '400px', padding: '32px' }}>
            <h2 className="text-title" style={{ fontSize: '20px', marginBottom: '24px' }}>Invite User</h2>
            
            {inviteSuccess ? (
              <div style={{ padding: '16px', background: 'rgba(52, 211, 153, 0.1)', color: 'rgb(16, 185, 129)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 500 }}>
                <CheckCircle size={18} />
                Invitation sent successfully!
              </div>
            ) : (
              <form onSubmit={handleInvite} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {inviteError && (
                  <div style={{ padding: '12px', background: 'rgba(212, 64, 64, 0.08)', color: 'var(--destructive)', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} /> {inviteError}
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
                  />
                </div>

                <div>
                  <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>Role</label>
                  <select 
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="input-minimal"
                    style={{ width: '100%', boxSizing: 'border-box' }}
                  >
                    <option value="EMPLOYEE">Employee (Creates tickets)</option>
                    <option value="LEVEL_1_OPERATOR">Level 1 Operator (Solves basic tickets)</option>
                    <option value="LEVEL_2_OPERATOR">Level 2 Operator (Expert)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  <button type="button" onClick={() => setIsInviting(false)} className="btn-minimal btn-minimal--secondary" style={{ flex: 1 }}>
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="btn-minimal btn-minimal--primary" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    {isSubmitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : 'Send Invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
