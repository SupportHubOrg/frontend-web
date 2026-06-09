import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, Search, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function KnowledgeBase() {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('articles'); // 'articles' | 'drafts'
  const [articles, setArticles] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
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
        ? `http://localhost:5004/api/v1/knowledge/articles/search?q=${encodeURIComponent(query)}`
        : `http://localhost:5004/api/v1/knowledge/articles`;
        
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
      const response = await fetch(`http://localhost:5004/api/v1/knowledge/drafts?status=PENDING_REVIEW`, {
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
      const response = await fetch(`http://localhost:5004/api/v1/knowledge/drafts/${selectedDraft.id}/publish`, {
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
      const response = await fetch(`http://localhost:5004/api/v1/knowledge/drafts/${selectedDraft.id}/reject`, {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Header & Tabs */}
      <div>
        <h1 className="text-title" style={{ fontSize: '24px', marginBottom: '8px' }}>Knowledge Base</h1>
        <p className="text-meta" style={{ fontSize: '15px', color: 'var(--fg-secondary)', marginBottom: '24px' }}>
          Curated documentation and solutions to help AI triage tickets efficiently.
        </p>

        <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px' }}>
          <button 
            className={`btn-minimal ${activeTab === 'articles' ? 'btn-minimal--primary' : 'btn-minimal--ghost'}`}
            onClick={() => setActiveTab('articles')}
          >
            <FileText size={16} /> Published Articles
          </button>
          {isManager && (
            <button 
              className={`btn-minimal ${activeTab === 'drafts' ? 'btn-minimal--primary' : 'btn-minimal--ghost'}`}
              onClick={() => setActiveTab('drafts')}
            >
              <AlertCircle size={16} /> Needs Review {drafts.length > 0 && <span style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '12px', fontSize: '11px', marginLeft: '6px' }}>{drafts.length}</span>}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'articles' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-muted)' }} />
              <input
                type="text"
                placeholder="Search articles..."
                className="input-minimal"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '36px' }}
              />
            </div>
            <button type="submit" className="btn-minimal btn-minimal--secondary">Search</button>
          </form>

          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="spin" size={24} /></div>
          ) : articles.length === 0 ? (
            <div className="card-minimal" style={{ textAlign: 'center', padding: '40px', color: 'var(--fg-muted)' }}>
              No articles found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {articles.map(article => (
                <div key={article.id} className="card-minimal" style={{ padding: '20px' }}>
                  <h3 className="text-title" style={{ fontSize: '16px', marginBottom: '8px' }}>{article.title}</h3>
                  <p className="text-meta" style={{ color: 'var(--fg-secondary)', whiteSpace: 'pre-wrap' }}>
                    {article.content.length > 300 ? article.content.substring(0, 300) + '...' : article.content}
                  </p>
                  <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                    <span className="tag-pastel tag-pastel--blue">Published: {new Date(article.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {isLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}><Loader2 className="spin" size={24} /></div>
          ) : drafts.length === 0 ? (
            <div className="card-minimal" style={{ textAlign: 'center', padding: '40px', color: 'var(--fg-muted)' }}>
              All caught up! No drafts pending review.
            </div>
          ) : (
            drafts.map(draft => (
              <div key={draft.id} className="card-minimal" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 className="text-title" style={{ fontSize: '16px', marginBottom: '4px' }}>{draft.title || 'Untitled Draft'}</h3>
                  <p className="text-meta" style={{ color: 'var(--fg-secondary)' }}>Proposed from Ticket: {draft.sourceTicketId}</p>
                </div>
                <button className="btn-minimal btn-minimal--primary" onClick={() => openDraft(draft)}>
                  Review
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Draft Review Modal */}
      {selectedDraft && createPortal(
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '40px 24px', overflowY: 'auto' }}>
          <div style={{ width: '100%', maxWidth: '800px', background: 'var(--bg-surface)', borderRadius: '12px', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 48px rgba(0,0,0,0.2)', margin: 'auto' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-surface)' }}>
              <h2 className="text-title" style={{ fontSize: '18px' }}>Review Draft</h2>
              <button className="btn-minimal btn-minimal--ghost" onClick={() => setSelectedDraft(null)}><XCircle size={20} /></button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label className="text-meta" style={{ display: 'block', marginBottom: '8px' }}>Title</label>
                <input 
                  type="text" 
                  className="input-minimal" 
                  value={draftEdit.title} 
                  onChange={(e) => setDraftEdit({...draftEdit, title: e.target.value})}
                  style={{ width: '100%' }}
                />
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <label className="text-meta" style={{ display: 'block', marginBottom: '8px' }}>Content (Markdown)</label>
                <textarea 
                  className="input-minimal" 
                  value={draftEdit.content} 
                  onChange={(e) => setDraftEdit({...draftEdit, content: e.target.value})}
                  style={{ width: '100%', minHeight: '300px', resize: 'vertical' }}
                />
              </div>

              <div style={{ background: 'var(--bg-surface-alt)', padding: '16px', borderRadius: '8px' }}>
                <label className="text-meta" style={{ display: 'block', marginBottom: '8px' }}>Rejection Reason (only if rejecting)</label>
                <input 
                  type="text" 
                  className="input-minimal" 
                  placeholder="Why is this not a good article?"
                  value={rejectReason} 
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ padding: '24px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                className="btn-minimal btn-minimal--ghost" 
                onClick={rejectDraft}
                disabled={!rejectReason || isRejecting}
                style={{ color: 'var(--destructive)' }}
              >
                {isRejecting ? <Loader2 className="spin" size={16} /> : 'Reject'}
              </button>
              <button 
                className="btn-minimal btn-minimal--primary" 
                onClick={publishDraft}
                disabled={!draftEdit.content || isPublishing}
              >
                {isPublishing ? <Loader2 className="spin" size={16} /> : <><CheckCircle2 size={16}/> Publish Article</>}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
