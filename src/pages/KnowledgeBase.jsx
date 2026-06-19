import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { Spinner, MagnifyingGlass, CheckCircle, XCircle, WarningCircle, Books, Article, CaretRight } from '@phosphor-icons/react';

export default function KnowledgeBase() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'drafts'
  const [articles, setArticles] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Viewing article
  const [viewingArticle, setViewingArticle] = useState(null);
  
  // Review Draft state
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [draftEdit, setDraftEdit] = useState({ title: '', content: '' });
  const [rejectReason, setRejectReason] = useState('');

  const isManager = user?.role === 'ORGANIZATION_MANAGER' || user?.role === 'SUPPORT_HUB_ADMINISTRATOR';

  useEffect(() => {
    if (activeTab === 'articles') {
      fetchArticles();
    } else if (activeTab === 'drafts' && isManager) {
      fetchDrafts();
    }
  }, [activeTab]);

  const fetchArticles = async (query = '') => {
    setIsLoading(true);
    try {
      const url = query.trim()
        ? `${import.meta.env.VITE_API_URL || 'http://supporthub.local'}/api/v1/knowledge/articles/search?q=${encodeURIComponent(query)}`
        : `${import.meta.env.VITE_API_URL || 'http://supporthub.local'}/api/v1/knowledge/articles`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      setArticles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDrafts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://supporthub.local'}/api/v1/knowledge/drafts?status=PENDING_REVIEW`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch drafts');
      const data = await response.json();
      setDrafts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArticles(searchQuery);
  };

  const openDraft = (draft) => {
    setSelectedDraft(draft);
    setDraftEdit({ title: draft.title || '', content: draft.content || '' });
    setRejectReason('');
  };

  const publishDraft = async () => {
    if (!draftEdit.content) return;
    setIsPublishing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://supporthub.local'}/api/v1/knowledge/drafts/${selectedDraft.id}/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: draftEdit.title || undefined,
          content: draftEdit.content
        })
      });
      if (!response.ok) throw new Error('Failed to publish draft');
      setSelectedDraft(null);
      fetchDrafts(); // Refresh drafts
    } catch (error) {
      console.error(error);
    } finally {
      setIsPublishing(false);
    }
  };

  const rejectDraft = async () => {
    if (!rejectReason) return;
    setIsRejecting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://supporthub.local'}/api/v1/knowledge/drafts/${selectedDraft.id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });
      if (!response.ok) throw new Error('Failed to reject draft');
      setSelectedDraft(null);
      fetchDrafts(); // Refresh drafts
    } catch (error) {
      console.error(error);
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="animate-entry" style={{ maxWidth: '1100px' }}>
      
      {/* Header & Tabs */}
      <div style={{ marginBottom: '32px' }}>
        <h1 className="text-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Knowledge Base</h1>
        <p className="text-meta" style={{ fontSize: '14px', color: 'var(--fg-secondary)', marginBottom: '24px' }}>
          Curated documentation and solutions to help AI triage tickets efficiently.
        </p>

        {/* Tabs & Search in one row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '24px' }}>
            <button 
              className="btn-minimal"
              style={{ 
                background: 'transparent', border: 'none', 
                color: activeTab === 'articles' ? 'var(--fg-primary)' : 'var(--fg-secondary)',
                fontWeight: activeTab === 'articles' ? 600 : 500,
                borderBottom: activeTab === 'articles' ? '2px solid var(--fg-primary)' : '2px solid transparent',
                padding: '8px 4px 12px 4px', marginBottom: '-13px'
              }}
              onClick={() => setActiveTab('articles')}
            >
              <Books size={16} weight={activeTab === 'articles' ? 'fill' : 'regular'} style={{ marginRight: '6px' }} /> 
              Published Articles
            </button>
            {isManager && (
              <button 
                className="btn-minimal"
                style={{ 
                  background: 'transparent', border: 'none', 
                  color: activeTab === 'drafts' ? 'var(--fg-primary)' : 'var(--fg-secondary)',
                  fontWeight: activeTab === 'drafts' ? 600 : 500,
                  borderBottom: activeTab === 'drafts' ? '2px solid var(--fg-primary)' : '2px solid transparent',
                  padding: '8px 4px 12px 4px', marginBottom: '-13px'
                }}
                onClick={() => setActiveTab('drafts')}
              >
                <WarningCircle size={16} weight={activeTab === 'drafts' ? 'fill' : 'regular'} style={{ marginRight: '6px' }} /> 
                Needs Review
                {drafts.length > 0 && (
                  <span style={{ background: 'var(--bg-inset)', color: 'var(--fg-muted)', padding: '2px 6px', borderRadius: '99px', fontSize: '11px', marginLeft: '6px', fontWeight: 500 }}>
                    {drafts.length}
                  </span>
                )}
              </button>
            )}
          </div>
          
          {activeTab === 'articles' && (
            <form onSubmit={handleSearch} style={{ position: 'relative', width: '280px' }}>
              <MagnifyingGlass size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)' }} />
              <input
                type="text"
                placeholder="Search articles..."
                className="input-minimal"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px', height: '32px', fontSize: '13px' }}
              />
            </form>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'articles' ? (
        <div>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', color: 'var(--fg-muted)' }}><Spinner className="animate-spin" size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>
          ) : articles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px', color: 'var(--fg-muted)', border: '1px dashed var(--border-primary)', borderRadius: '8px', fontSize: '14px' }}>
              No articles found.
            </div>
          ) : (
            <div className="card-minimal" style={{ overflow: 'hidden', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-surface-alt)', color: 'var(--fg-muted)' }}>
                    <th style={{ padding: '12px 24px', fontWeight: 500, width: '40%' }}>Title</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500 }}>Preview</th>
                    <th style={{ padding: '12px 24px', fontWeight: 500, width: '140px', textAlign: 'right' }}>Published</th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map(article => (
                    <tr 
                      key={article.id} 
                      style={{ borderBottom: '1px solid var(--border-primary)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onClick={() => setViewingArticle(article)}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-inset)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Article size={16} style={{ color: 'var(--fg-muted)' }} />
                          <span className="text-body" style={{ fontWeight: 500, fontSize: '14px' }}>{article.title}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: 'var(--fg-secondary)' }}>
                         <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '350px' }}>
                            {article.content?.replace(/\n/g, ' ')}
                         </span>
                      </td>
                      <td style={{ padding: '12px 24px', color: 'var(--fg-muted)', textAlign: 'right' }}>
                        {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '64px', color: 'var(--fg-muted)' }}><Spinner size={24} style={{ animation: 'spin 1s linear infinite' }} /></div>
          ) : drafts.length === 0 ? (
             <div style={{ textAlign: 'center', padding: '64px', color: 'var(--fg-muted)', border: '1px dashed var(--border-primary)', borderRadius: '8px', fontSize: '14px' }}>
              All caught up! No drafts pending review.
            </div>
          ) : (
            <div className="card-minimal" style={{ overflow: 'hidden', padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-primary)', background: 'var(--bg-surface-alt)', color: 'var(--fg-muted)' }}>
                    <th style={{ padding: '12px 24px', fontWeight: 500 }}>Draft Title</th>
                    <th style={{ padding: '12px 16px', fontWeight: 500, width: '200px' }}>Source Ticket ID</th>
                    <th style={{ padding: '12px 24px', fontWeight: 500, width: '100px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map(draft => (
                    <tr 
                      key={draft.id} 
                      style={{ borderBottom: '1px solid var(--border-primary)', transition: 'background 0.15s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-inset)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px 24px' }}>
                        <span className="text-body" style={{ fontWeight: 500, fontSize: '14px' }}>{draft.title || 'Untitled Draft'}</span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span className="text-code" style={{ color: 'var(--fg-secondary)' }}>{draft.sourceTicketId?.substring(0, 8) || 'N/A'}</span>
                      </td>
                      <td style={{ padding: '12px 24px', textAlign: 'right' }}>
                        <button 
                          className="btn-minimal btn-minimal--ghost" 
                          onClick={() => openDraft(draft)}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Review <CaretRight size={12} weight="bold" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Viewing Published Article Modal */}
      {viewingArticle && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '24px' }}>
          <div className="card-minimal animate-entry" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2 className="text-title" style={{ fontSize: '24px', marginBottom: '8px' }}>{viewingArticle.title}</h2>
                <span className="text-meta" style={{ color: 'var(--fg-muted)' }}>Published {new Date(viewingArticle.publishedAt).toLocaleDateString()}</span>
              </div>
              <button className="btn-minimal btn-minimal--ghost" onClick={() => setViewingArticle(null)} style={{ padding: '8px' }}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1 }}>
              <div className="text-body" style={{ fontSize: '15px', lineHeight: 1.7, color: 'var(--fg-primary)', whiteSpace: 'pre-wrap' }}>
                {viewingArticle.content}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Draft Review Modal */}
      {selectedDraft && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999, padding: '24px' }}>
          <div className="card-minimal animate-entry" style={{ width: '100%', maxWidth: '900px', maxHeight: '90vh', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', padding: 0 }}>
            <div style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                 <h2 className="text-title" style={{ fontSize: '20px' }}>Review Draft</h2>
                 <p className="text-meta" style={{ color: 'var(--fg-secondary)', marginTop: '4px' }}>Source Ticket: <span className="text-code">{selectedDraft.sourceTicketId?.substring(0, 8)}</span></p>
              </div>
              <button className="btn-minimal btn-minimal--ghost" onClick={() => setSelectedDraft(null)} style={{ padding: '8px' }}>
                <XCircle size={24} />
              </button>
            </div>
            
            <div style={{ padding: '32px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>Title</label>
                <input 
                  type="text" 
                  className="input-minimal" 
                  value={draftEdit.title} 
                  onChange={(e) => setDraftEdit({...draftEdit, title: e.target.value})}
                  style={{ width: '100%', fontSize: '16px', fontWeight: 500 }}
                />
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>Content (Markdown)</label>
                <textarea 
                  className="input-minimal" 
                  value={draftEdit.content} 
                  onChange={(e) => setDraftEdit({...draftEdit, content: e.target.value})}
                  style={{ width: '100%', minHeight: '300px', flex: 1, resize: 'vertical', fontSize: '14px', lineHeight: 1.6 }}
                />
              </div>

              <div style={{ background: 'var(--bg-surface-alt)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-primary)' }}>
                <label className="text-meta" style={{ display: 'block', marginBottom: '8px', color: 'var(--fg-secondary)' }}>Rejection Reason (only if rejecting)</label>
                <input 
                  type="text" 
                  className="input-minimal" 
                  placeholder="Why is this not a good article?"
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%', background: 'var(--bg-surface)' }}
                />
              </div>
            </div>

            <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'flex-end', gap: '16px', background: 'var(--bg-surface-alt)', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px' }}>
              <button 
                className="btn-minimal btn-minimal--ghost" 
                onClick={rejectDraft}
                disabled={!rejectReason || isRejecting}
                style={{ color: 'var(--destructive)', padding: '8px 24px' }}
              >
                {isRejecting ? <Spinner style={{ animation: 'spin 1s linear infinite' }} size={18} /> : 'Reject Draft'}
              </button>
              <button 
                className="btn-minimal btn-minimal--primary" 
                onClick={publishDraft}
                disabled={!draftEdit.content || isPublishing}
                style={{ padding: '8px 24px', display: 'flex', gap: '8px', alignItems: 'center' }}
              >
                {isPublishing ? <Spinner style={{ animation: 'spin 1s linear infinite' }} size={18} /> : <><CheckCircle size={18} weight="bold"/> Publish Article</>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
