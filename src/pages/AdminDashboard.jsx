import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  UserCheck,
  UserX,
  Search,
  ChevronRight,
  ExternalLink,
  MapPin,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  getHazards,
  updateHazardStatus,
  deleteHazard,
  getAdminStats,
  getAdminUsers,
  updateUserRole
} from '../services/hazardService';
import { Badge } from '../components/Badges';

export default function AdminDashboard() {
  const { user: currentUser, isAdmin, loading: authLoading, session } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'users' | 'reports' | 'admins'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalReports: 0,
    activeReports: 0,
    resolvedReports: 0,
    awaitingVerification: 0
  });

  const [usersList, setUsersList] = useState([]);
  const [reportsList, setReportsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // Fetch all admin portal data
  const loadPortalData = async () => {
    if (!session?.access_token) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      const [statsData, usersData, reportsData] = await Promise.all([
        getAdminStats(session.access_token),
        getAdminUsers(session.access_token),
        getHazards()
      ]);

      if (statsData) setStats(statsData);
      setUsersList(usersData || []);
      setReportsList(reportsData.data || []);
    } catch (err) {
      console.error('Admin portal data fetch error:', err);
      setErrorMessage(err.message || 'Failed to load admin portal data. Ensure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin && session?.access_token) {
      loadPortalData();
    }
  }, [isAdmin, session]);

  // Handle promoting user to Admin or demoting Admin to User
  const handleRoleChange = async (targetUserId, newRole) => {
    setActionLoadingId(targetUserId);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const res = await updateUserRole(targetUserId, newRole, session?.access_token);
      setStatusMessage(res.message || `User role updated to '${newRole}'.`);

      // Update local state
      setUsersList((prev) =>
        prev.map((u) => (u.id === targetUserId ? { ...u, role: newRole } : u))
      );

      // Refresh admin stats
      const newStats = await getAdminStats(session?.access_token);
      if (newStats) setStats(newStats);
    } catch (err) {
      console.error('Role update error:', err);
      setErrorMessage(err.message || 'Failed to update user role.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle report status change
  const handleStatusChange = async (reportId, newStatus) => {
    setActionLoadingId(reportId);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      const updated = await updateHazardStatus(reportId, newStatus, session?.access_token);
      setReportsList((prev) => prev.map((r) => (r.id === reportId ? updated.data : r)));
      setStatusMessage(`Report ${reportId} status updated to ${newStatus}.`);

      const newStats = await getAdminStats(session?.access_token);
      if (newStats) setStats(newStats);
    } catch (err) {
      console.error('Status update error:', err);
      setErrorMessage(err.message || 'Failed to update report status.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle deleting report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to permanently delete this report?')) return;
    setActionLoadingId(reportId);
    setStatusMessage(null);
    setErrorMessage(null);
    try {
      await deleteHazard(reportId, session?.access_token);
      setReportsList((prev) => prev.filter((r) => r.id !== reportId));
      setStatusMessage(`Report deleted successfully.`);

      const newStats = await getAdminStats(session?.access_token);
      if (newStats) setStats(newStats);
    } catch (err) {
      console.error('Delete error:', err);
      setErrorMessage(err.message || 'Failed to delete report.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Auth Loading
  if (authLoading) {
    return (
      <main className="page grid place-items-center bg-slate-100 p-4">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="animate-spin text-brand" size={32} />
          <p className="text-sm font-semibold text-slate-600">Verifying administrator authorization...</p>
        </div>
      </main>
    );
  }

  // Security Check: Normal Users or Unauthenticated Users Access Control
  if (!isAdmin) {
    return (
      <main className="page grid place-items-center bg-slate-100 p-4 min-h-screen">
        <div className="card max-w-md p-8 text-center shadow-xl">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
            <ShieldAlert size={32} />
          </div>

          <h1 className="mt-5 text-2xl font-black text-slate-900">Access Restricted</h1>

          {currentUser ? (
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              You are authenticated as <span className="font-bold text-slate-800">{currentUser.email}</span>, but your profile role is <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-900">user</code>. Administrator authorization is required to access the Admin Portal.
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Please sign in with an authorized Google administrator account.
            </p>
          )}

          <div className="mt-7 flex flex-col gap-3">
            <button onClick={() => navigate('/')} className="btn btn-primary justify-center">
              Return to Application Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Filter lists based on search
  const filteredUsers = usersList.filter((u) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.role && u.role.toLowerCase().includes(q))
    );
  });

  const filteredReports = reportsList.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.id && String(r.id).toLowerCase().includes(q)) ||
      (r.category && r.category.toLowerCase().includes(q)) ||
      (r.address && r.address.toLowerCase().includes(q)) ||
      (r.status && r.status.toLowerCase().includes(q))
    );
  });

  const adminUsersList = usersList.filter((u) => u.role === 'admin');

  return (
    <main className="page bg-slate-100 min-h-screen">
      <div className="mx-auto max-w-7xl p-4 py-8">
        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-6">
          <div>
            <div className="flex items-center gap-2 text-brand font-bold text-xs uppercase tracking-widest">
              <Shield size={16} /> ROAD REALITY ADMIN PORTAL
            </div>
            <h1 className="text-3xl font-black text-slate-900 mt-1">Authority Management Console</h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadPortalData}
              disabled={loading}
              className="btn btn-secondary flex items-center gap-2 text-xs"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              Refresh Console
            </button>

            <Link to="/" className="btn border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-xs">
              Open Main App →
            </Link>
          </div>
        </div>

        {/* Success Alert */}
        {statusMessage && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle size={18} />
              {statusMessage}
            </span>
            <button onClick={() => setStatusMessage(null)} className="text-xs font-bold text-emerald-900 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle size={18} />
              {errorMessage}
            </span>
            <button onClick={() => setErrorMessage(null)} className="text-xs font-bold text-red-900 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Navigation Bar */}
        <div className="mt-6 flex gap-2 border-b border-slate-200 overflow-x-auto pb-0.5">
          {[
            { id: 'overview', label: 'Dashboard Overview', icon: FileText },
            { id: 'users', label: `Users (${usersList.length})`, icon: Users },
            { id: 'reports', label: `Reports (${reportsList.length})`, icon: ShieldAlert },
            { id: 'admins', label: `Admins (${adminUsersList.length})`, icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-2 px-4 py-3 font-bold text-sm border-b-2 transition ${
                  isActive
                    ? 'border-brand text-brand bg-white rounded-t-xl'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW DASHBOARD */}
        {activeTab === 'overview' && (
          <div className="mt-6 space-y-6">
            {/* Metric Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div className="card p-5 border-l-4 border-indigo-600 bg-white">
                <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider">Total Users</p>
                <b className="text-3xl text-slate-900 mt-1 block">{stats.totalUsers}</b>
                <p className="text-xs text-slate-500 mt-2">Registered Google Accounts</p>
              </div>

              <div className="card p-5 border-l-4 border-slate-700 bg-white">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Total Reports</p>
                <b className="text-3xl text-slate-900 mt-1 block">{stats.totalReports}</b>
                <p className="text-xs text-slate-500 mt-2">Submitted Hazards</p>
              </div>

              <div className="card p-5 border-l-4 border-amber-500 bg-white">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Awaiting Verification</p>
                <b className="text-3xl text-amber-900 mt-1 block">{stats.awaitingVerification}</b>
                <p className="text-xs text-slate-500 mt-2">New Unverified Reports</p>
              </div>

              <div className="card p-5 border-l-4 border-blue-500 bg-white">
                <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Active Hazards</p>
                <b className="text-3xl text-blue-900 mt-1 block">{stats.activeReports}</b>
                <p className="text-xs text-slate-500 mt-2">Reported / Verified / In Progress</p>
              </div>

              <div className="card p-5 border-l-4 border-emerald-500 bg-white">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Resolved Reports</p>
                <b className="text-3xl text-emerald-900 mt-1 block">{stats.resolvedReports}</b>
                <p className="text-xs text-slate-500 mt-2">Closed Hazards</p>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="card p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Recent Hazard Submissions</h3>
                  <button onClick={() => setActiveTab('reports')} className="text-xs font-bold text-brand hover:underline flex items-center">
                    View all <ChevronRight size={14} />
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {reportsList.slice(0, 4).map((r) => (
                    <div key={r.id} className="flex items-center justify-between border-b pb-3 text-sm">
                      <div>
                        <p className="font-bold text-slate-900">{r.category}</p>
                        <p className="text-xs text-slate-500">{r.address}</p>
                      </div>
                      <Badge value={r.status} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="card p-6 bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900">Administrator Roster</h3>
                  <button onClick={() => setActiveTab('admins')} className="text-xs font-bold text-brand hover:underline flex items-center">
                    Manage admins <ChevronRight size={14} />
                  </button>
                </div>
                <div className="mt-4 space-y-3">
                  {adminUsersList.map((u) => (
                    <div key={u.id} className="flex items-center justify-between border-b pb-3 text-sm">
                      <div className="flex items-center gap-2">
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt={u.name} className="h-7 w-7 rounded-full border" />
                        ) : (
                          <div className="h-7 w-7 grid place-items-center bg-amber-100 text-amber-800 rounded-full font-bold text-xs">
                            {u.name[0]?.toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                        Admin
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <section className="card mt-6 overflow-x-auto shadow-md bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3 border-b">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Registered Users Directory</h2>
                <p className="text-xs text-slate-500">All users signed in via Supabase Google Authentication</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  className="input pl-9 w-full sm:w-64 text-sm"
                  placeholder="Search user name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600 font-bold uppercase text-xs">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-center">Reports Submitted</th>
                  <th className="p-4 text-right">Role Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No registered users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = currentUser?.id === u.id;
                    const isAdminUser = u.role === 'admin';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.name} className="h-9 w-9 rounded-full object-cover border" />
                          ) : (
                            <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-slate-700 font-bold border">
                              {u.name[0]?.toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            {isSelf && <span className="text-[10px] text-brand font-extrabold">(You)</span>}
                          </div>
                        </td>

                        <td className="p-4 text-slate-600">{u.email}</td>

                        <td className="p-4">
                          {isAdminUser ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                              <Shield size={12} /> Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                              User
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-xs text-slate-500">
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>

                        <td className="p-4 text-center font-bold text-slate-800">
                          {u.reportCount}
                        </td>

                        <td className="p-4 text-right">
                          {isAdminUser ? (
                            <button
                              onClick={() => handleRoleChange(u.id, 'user')}
                              disabled={actionLoadingId === u.id || (adminUsersList.length <= 1)}
                              className="btn btn-secondary text-xs text-red-600 hover:bg-red-50 border-red-200 disabled:opacity-40"
                              title={adminUsersList.length <= 1 ? "Cannot demote last admin" : "Remove Admin Privileges"}
                            >
                              <UserX size={14} /> Demote to User
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRoleChange(u.id, 'admin')}
                              disabled={actionLoadingId === u.id}
                              className="btn btn-secondary text-xs text-amber-800 hover:bg-amber-50 border-amber-200"
                            >
                              <UserCheck size={14} /> Promote to Admin
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* TAB 3: REPORTS MANAGEMENT */}
        {activeTab === 'reports' && (
          <section className="card mt-6 overflow-x-auto shadow-md bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-3 border-b">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Hazard Reports Management</h2>
                <p className="text-xs text-slate-500">Review, update status, and manage crowdsourced hazard reports</p>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  className="input pl-9 w-full sm:w-64 text-sm"
                  placeholder="Search hazard or address..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600 font-bold uppercase text-xs">
                <tr>
                  <th className="p-4">Report ID</th>
                  <th className="p-4">Photo</th>
                  <th className="p-4">Hazard & Location</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Traffic Affected</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4">Update Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-500">
                      No hazard reports found.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono font-bold text-xs text-slate-800">
                        {String(r.id).substring(0, 8)}...
                      </td>

                      <td className="p-4">
                        {r.imageUrl ? (
                          <img src={r.imageUrl} alt={r.category} className="h-12 w-12 rounded-lg object-cover border" />
                        ) : (
                          <div className="h-12 w-12 bg-slate-100 rounded-lg grid place-items-center text-xs text-slate-400 font-bold">
                            No photo
                          </div>
                        )}
                      </td>

                      <td className="p-4 max-w-[240px]">
                        <p className="font-extrabold text-slate-900">{r.category}</p>
                        <p className="text-xs text-slate-600 flex items-center gap-1 mt-0.5" title={r.address}>
                          <MapPin size={12} className="shrink-0 text-brand" />
                          <span className="truncate">{r.address}</span>
                        </p>
                        {r.description && <p className="text-xs text-slate-500 mt-1 line-clamp-1 italic">{r.description}</p>}
                      </td>

                      <td className="p-4">
                        <Badge value={r.severity} kind="severity" />
                      </td>

                      <td className="p-4 text-xs font-semibold text-slate-700">
                        {r.trafficImpact === 'yes' ? '🚨 Blocked/Heavy' : r.trafficImpact === 'partial' ? '⚠️ Partial' : '✅ Clear'}
                      </td>

                      <td className="p-4">
                        <Badge value={r.status} />
                      </td>

                      <td className="p-4">
                        <select
                          disabled={actionLoadingId === r.id}
                          value={r.rawStatus || 'REPORTED'}
                          onChange={(e) => handleStatusChange(r.id, e.target.value)}
                          className="input text-xs font-bold py-1.5 px-2 border-slate-300 rounded-lg cursor-pointer bg-white"
                        >
                          <option value="REPORTED">REPORTED</option>
                          <option value="VERIFIED">VERIFIED</option>
                          <option value="IN_PROGRESS">IN_PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </td>

                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteReport(r.id)}
                          disabled={actionLoadingId === r.id}
                          className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50 transition"
                          title="Delete Hazard Report"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        )}

        {/* TAB 4: ADMINS MANAGEMENT */}
        {activeTab === 'admins' && (
          <section className="card mt-6 overflow-x-auto shadow-md bg-white p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Administrator Privileges Roster</h2>
                <p className="text-xs text-slate-500">Promote registered users to Admin or remove admin privileges</p>
              </div>

              <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Shield size={14} /> {adminUsersList.length} Active Administrators
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {adminUsersList.map((admin) => {
                const isSelf = currentUser?.id === admin.id;
                const canDemote = adminUsersList.length > 1;

                return (
                  <div key={admin.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border bg-slate-50/60 gap-4">
                    <div className="flex items-center gap-3">
                      {admin.avatar_url ? (
                        <img src={admin.avatar_url} alt={admin.name} className="h-10 w-10 rounded-full border" />
                      ) : (
                        <div className="h-10 w-10 grid place-items-center bg-amber-100 text-amber-800 rounded-full font-bold text-sm">
                          {admin.name[0]?.toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">{admin.name}</p>
                          {isSelf && <span className="text-xs text-brand font-bold">(Current Session)</span>}
                        </div>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                        Administrator
                      </span>

                      <button
                        onClick={() => handleRoleChange(admin.id, 'user')}
                        disabled={actionLoadingId === admin.id || !canDemote}
                        className="btn btn-secondary text-xs text-red-600 border-red-200 hover:bg-red-50 disabled:opacity-40"
                        title={!canDemote ? "Cannot demote last remaining admin" : "Demote to user"}
                      >
                        <UserX size={14} />
                        Remove Admin Privilege
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick User Promotion Box */}
            <div className="mt-8 border-t pt-6">
              <h3 className="font-bold text-sm text-slate-900 mb-3">Promote Registered User to Admin</h3>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {usersList
                  .filter((u) => u.role !== 'admin')
                  .slice(0, 6)
                  .map((u) => (
                    <div key={u.id} className="p-3 border rounded-xl bg-white flex items-center justify-between text-xs">
                      <div className="truncate mr-2">
                        <p className="font-bold text-slate-900 truncate">{u.name}</p>
                        <p className="text-slate-500 truncate">{u.email}</p>
                      </div>
                      <button
                        onClick={() => handleRoleChange(u.id, 'admin')}
                        disabled={actionLoadingId === u.id}
                        className="btn btn-secondary text-[11px] py-1 px-2.5 text-amber-800 border-amber-200 shrink-0"
                      >
                        <UserCheck size={12} /> Promote
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}