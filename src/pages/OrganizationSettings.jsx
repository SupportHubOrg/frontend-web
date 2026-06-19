import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Spinner, Warning, FloppyDisk, Trash } from '@phosphor-icons/react';

export default function OrganizationSettings() {
  const { token, organization, logout } = useAuth();
  
  // Update state
  const [name, setName] = useState('');
  const [slaFirstResponse, setSlaFirstResponse] = useState('');
  const [slaResolution, setSlaResolution] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Delete state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (organization) {
      setName(organization.name || '');
    }
  }, [organization]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const payload = {
        name: name,
        slaFirstResponseMinutes: slaFirstResponse ? parseFloat(slaFirstResponse) : null,
        slaResolutionMinutes: slaResolution ? parseFloat(slaResolution) : null,
        slaHumanResponseMinutes: null,
        aiTrustThreshold: null
      };

      await axios.put(`${import.meta.env.VITE_API_URL || 'http://supporthub.local'}/api/organizations/${organization?.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
    } catch (err) {
      setUpdateError(err.response?.data?.title || err.response?.data?.message || 'Failed to update organization settings.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== organization?.name) {
      setDeleteError('Organization name does not match.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://supporthub.local'}/api/organizations/${organization?.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      logout();
    } catch (err) {
      setDeleteError(err.response?.data?.title || err.response?.data?.message || 'Failed to delete organization.');
      setIsDeleting(false);
    }
  };

  return (
    <div className="animate-entry" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '40px' }}>
        <h1 className="text-title" style={{ fontSize: '28px', marginBottom: '8px' }}>
          Organization Settings
        </h1>
        <p className="text-body" style={{ color: 'var(--fg-secondary)', fontSize: '14px' }}>
          Manage your workspace details, SLA configurations, and danger zone.
        </p>
      </div>

      {/* General Settings */}
      <div className="card-minimal" style={{ padding: '32px', marginBottom: '32px' }}>
        <h2 className="text-title" style={{ fontSize: '18px', marginBottom: '24px' }}>General Settings</h2>
        
        {updateError && (
          <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(212, 64, 64, 0.08)', color: 'var(--destructive)', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
            <Warning size={18} weight="bold" />
            {updateError}
          </div>
        )}

        {updateSuccess && (
          <div style={{ padding: '16px', borderRadius: '8px', background: 'rgba(52, 211, 153, 0.1)', color: 'rgb(16, 185, 129)', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', fontSize: '14px', fontWeight: 500 }}>
            <FloppyDisk size={18} weight="fill" />
            Settings saved successfully! You may need to refresh to see the updated name in the sidebar.
          </div>
        )}

        <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>Workspace Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="input-minimal" 
              required
              style={{ width: '100%', maxWidth: '400px' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>First Response SLA (Minutes)</label>
              <input 
                type="number" 
                value={slaFirstResponse} 
                onChange={(e) => setSlaFirstResponse(e.target.value)} 
                className="input-minimal" 
                placeholder="e.g. 60"
                style={{ width: '100%' }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>Resolution SLA (Minutes)</label>
              <input 
                type="number" 
                value={slaResolution} 
                onChange={(e) => setSlaResolution(e.target.value)} 
                className="input-minimal" 
                placeholder="e.g. 1440"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-primary)', paddingTop: '24px', display: 'flex', justifyContent: 'flex-start' }}>
            <button 
              type="submit" 
              disabled={isUpdating || !name} 
              className="btn-minimal btn-minimal--primary" 
              style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 24px' }}
            >
              {isUpdating ? <Spinner size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <FloppyDisk size={18} weight="bold" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="card-minimal" style={{ border: '1px solid rgba(212, 64, 64, 0.2)', padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '20px 32px', borderBottom: '1px solid var(--border-primary)', background: 'rgba(212, 64, 64, 0.02)' }}>
          <h2 className="text-title" style={{ fontSize: '18px', color: 'var(--destructive)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Warning size={20} weight="bold" /> Danger Zone
          </h2>
        </div>
        
        <div style={{ padding: '32px' }}>
          <p className="text-body" style={{ fontSize: '14px', marginBottom: '24px', color: 'var(--fg-primary)' }}>
            Deleting your workspace will permanently delete all tickets, articles, team members, and billing data. <strong>This action cannot be undone.</strong>
          </p>

          {deleteError && (
            <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(212, 64, 64, 0.08)', color: 'var(--destructive)', display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '24px', fontSize: '13px', fontWeight: 500 }}>
              <Warning size={16} weight="bold" />
              {deleteError}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>
                Please type <strong>{organization?.name}</strong> to confirm.
              </label>
              <input 
                type="text" 
                value={deleteConfirmText} 
                onChange={(e) => setDeleteConfirmText(e.target.value)} 
                className="input-minimal" 
                placeholder={organization?.name}
                style={{ width: '100%', maxWidth: '400px' }}
              />
            </div>
            
            <div style={{ marginTop: '8px' }}>
              <button 
                onClick={handleDelete}
                disabled={isDeleting || deleteConfirmText !== organization?.name}
                className="btn-minimal btn-minimal--ghost" 
                style={{ color: 'var(--destructive)', border: '1px solid rgba(212, 64, 64, 0.2)', padding: '8px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                {isDeleting ? <Spinner size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Trash size={16} weight="bold" />}
                Delete Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
