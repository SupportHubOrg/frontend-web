import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Ticket, Users, CheckCircle, Lightning } from '@phosphor-icons/react';
import axios from 'axios';

export default function Dashboard() {
  const { user, organization, token } = useAuth();
  
  const [tickets, setTickets] = useState([]);
  const [team, setTeam] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token || !organization?.id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [ticketsRes, usersRes] = await Promise.all([
          axios.get('http://localhost:5003/api/tickets', {
            headers: { Authorization: `Bearer ${token}` },
            params: { organizationId: organization.id }
          }),
          axios.get('http://localhost:5000/api/organizations/users', {
            headers: { Authorization: `Bearer ${token}` },
            params: { organizationId: organization.id, pageSize: 100 }
          })
        ]);
        
        setTickets(ticketsRes.data?.items || []);
        setTeam(usersRes.data?.items || []);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [token, organization?.id]);
  
  const isOperator = user?.role === 'LEVEL_1_OPERATOR' || user?.role === 'LEVEL_2_OPERATOR';
  
  if (isOperator) {
    return <Navigate to="/tickets" replace />;
  }

  // Calculate real metrics based on available API data
  const isResolved = (status) => status === 'CLOSED' || status === 'SOLUTION_IMPOSSIBLE';
  
  const activeTickets = tickets.filter(t => !isResolved(t.status));
  const resolvedTickets = tickets.filter(t => isResolved(t.status));
  const pendingInvites = team.filter(u => u.invitationStatus === 'PENDING');
  
  // Construct recent activity from tickets and users
  const recentTickets = tickets.map(t => ({
    action: `Ticket created: ${t.subject}`,
    user: t.status || 'Open',
    time: t.createdAt
  }));
  
  const recentUsers = team.map(u => ({
    action: `User added to workspace`,
    user: u.email,
    time: u.createdAt
  }));

  const allActivity = [...recentTickets, ...recentUsers]
    .sort((a, b) => new Date(b.time) - new Date(a.time))
    .slice(0, 5);

  const formatTimeAgo = (dateString) => {
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
    return `${Math.floor(diff/86400)}d ago`;
  };

  return (
    <div className="flex flex-col gap-12" style={{ maxWidth: '1100px' }}>
      <header>
        <h1 className="text-title text-4xl tracking-tight mb-2">Overview</h1>
        <p className="text-body text-meta">System metrics and activity for {organization?.name || 'your workspace'}.</p>
      </header>
      
      {isLoading ? (
        <div className="text-meta">Loading workspace data...</div>
      ) : (
        <>
          <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card-minimal p-8 flex flex-col gap-6 md:col-span-2">
              <div className="flex justify-between items-start text-meta">
                <span style={{ fontSize: '14px' }}>Active Tickets</span>
                <Ticket size={24} weight="regular" />
              </div>
              <div className="text-7xl font-mono tracking-tighter mt-auto" style={{ color: 'var(--fg-primary)' }}>
                {activeTickets.length}
              </div>
              <div className="flex items-center gap-3">
                {activeTickets.length > 0 ? (
                  <span className="tag-pastel tag-pastel--blue uppercase tracking-wide">Needs attention</span>
                ) : (
                  <span className="tag-pastel tag-pastel--green uppercase tracking-wide">All clear</span>
                )}
              </div>
            </div>

            <div className="card-minimal p-6 flex flex-col gap-4 md:col-span-1">
              <div className="flex justify-between items-start text-meta">
                <span style={{ fontSize: '14px' }}>Resolved</span>
                <CheckCircle size={20} weight="regular" />
              </div>
              <div className="text-4xl font-mono tracking-tighter mt-auto" style={{ color: 'var(--fg-primary)' }}>
                {resolvedTickets.length}
              </div>
              <div className="flex items-center gap-2">
                 <span className="text-meta text-xs">Total resolved</span>
              </div>
            </div>

            <div className="card-minimal p-6 flex flex-col gap-4 md:col-span-1">
              <div className="flex justify-between items-start text-meta">
                <span style={{ fontSize: '14px' }}>Total Team</span>
                <Users size={20} weight="regular" />
              </div>
              <div className="text-4xl font-mono tracking-tighter mt-auto" style={{ color: 'var(--fg-primary)' }}>
                {team.length}
              </div>
              <div className="flex items-center gap-2">
                {pendingInvites.length > 0 ? (
                  <span className="tag-pastel tag-pastel--yellow">{pendingInvites.length} Pending</span>
                ) : (
                  <span className="text-meta text-xs">Active members</span>
                )}
              </div>
            </div>
          </section>
          
          <section className="mt-4">
             <div className="flex items-center gap-2 mb-6 text-meta">
               <Lightning size={16} />
               <h2 className="text-title text-sm tracking-wide uppercase">Recent Activity</h2>
             </div>
             <div className="card-minimal p-0 overflow-hidden">
                <div className="divide-y" style={{ borderColor: 'var(--border-primary)' }}>
                   {allActivity.length > 0 ? allActivity.map((item, i) => (
                      <div key={i} className="flex justify-between items-center px-6 py-4">
                        <span className="text-body font-medium truncate max-w-[50%]" style={{ fontSize: '14px' }}>{item.action}</span>
                        <div className="flex items-center gap-6 text-meta text-sm">
                           <span>{item.user}</span>
                           <span className="font-mono text-xs whitespace-nowrap">{item.time ? formatTimeAgo(item.time) : 'Just now'}</span>
                        </div>
                      </div>
                   )) : (
                     <div className="p-6 text-meta text-sm">No recent activity found.</div>
                   )}
                </div>
             </div>
          </section>
        </>
      )}
    </div>
  );
}
