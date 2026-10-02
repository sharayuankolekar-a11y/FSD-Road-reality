import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyReports, getHazards } from '../services/hazardService';
import HazardCard from '../components/HazardCard';
import { useAuth } from '../context/AuthContext';
import { User, Shield, AlertTriangle, Plus } from 'lucide-react';

export default function SimplePage({ type }) {
  const { user, session, role, isAdmin, signOut } = useAuth();
  const [myReports, setMyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (type === 'reports') {
      setLoading(true);
      if (session?.access_token) {
        getMyReports(session.access_token)
          .then((res) => setMyReports(res.data || []))
          .catch(() => setMyReports([]))
          .finally(() => setLoading(false));
      } else {
        // Fallback fetch all or empty
        getHazards()
          .then((res) => setMyReports(res.data || []))
          .catch(() => setMyReports([]))
          .finally(() => setLoading(false));
      }
    }
  }, [type, session]);

  if (type === 'notfound') {
    return (
      <main className="page grid place-items-center text-center p-4">
        <div>
          <p className="text-7xl font-black text-brand">404</p>
          <h1 className="mt-3 text-2xl font-bold text-slate-900">This road leads nowhere.</h1>
          <Link className="btn btn-primary mt-5 inline-flex" to="/">
            Return home
          </Link>
        </div>
      </main>
    );
  }

  if (type === 'reports') {
    const filtered = filter === 'All'
      ? myReports
      : myReports.filter((r) => r.status?.toLowerCase() === filter.toLowerCase() || r.verificationStatus === filter);

    return (
      <main className="page bg-surface">
        <div className="mx-auto max-w-6xl p-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900">My reports</h1>
              <p className="mt-1 text-slate-600">Track hazards you have submitted to Road Reality.</p>
            </div>
            <Link to="/report" className="btn btn-primary self-start sm:self-auto flex items-center gap-1.5">
              <Plus size={16} />
              New Report
            </Link>
          </div>

          <div className="mt-5 flex gap-2 overflow-auto pb-2">
            {['All', 'Reported', 'Verified', 'In progress', 'Resolved'].map((x) => (
              <button
                className={`btn text-xs font-semibold py-1.5 ${
                  filter === x ? 'btn-primary' : 'btn-secondary text-slate-700'
                }`}
                key={x}
                onClick={() => setFilter(x)}
              >
                {x}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 animate-pulse rounded-2xl bg-slate-200" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="card mt-6 p-8 text-center text-slate-500">
              <AlertTriangle className="mx-auto text-slate-400 mb-2" size={32} />
              <p className="font-bold text-slate-700">No reports found</p>
              <p className="text-sm mt-1">You haven't submitted any hazard reports under this filter yet.</p>
              <Link to="/report" className="btn btn-primary mt-4 inline-flex">
                Report a Hazard
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {filtered.map((h) => (
                <HazardCard hazard={h} key={h.id} />
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  if (type === 'profile') {
    const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Road User';
    const avatarUrl = user?.user_metadata?.avatar_url;

    return (
      <main className="page bg-surface">
        <div className="mx-auto max-w-3xl p-4 py-8">
          <div className="card p-7 shadow-md">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img src={avatarUrl} alt={userName} className="h-16 w-16 rounded-full object-cover border-2 border-brand" />
              ) : (
                <div className="grid h-16 w-16 place-items-center rounded-full bg-brand text-2xl font-bold text-white shadow-md">
                  {userName[0]?.toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-2xl font-black text-slate-900">{userName}</h1>
                <p className="text-slate-600 text-sm flex items-center gap-1.5 mt-0.5">
                  {isAdmin ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      <Shield size={12} /> Administrator
                    </span>
                  ) : (
                    'Community contributor'
                  )}
                  <span>· {user?.email}</span>
                </p>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 text-center border-t pt-6">
              <div>
                <b className="text-2xl text-slate-900">Active</b>
                <p className="text-xs text-slate-500 mt-1">Road contributor</p>
              </div>
              <div>
                <b className="text-2xl text-slate-900">{role || 'user'}</b>
                <p className="text-xs text-slate-500 mt-1">Account role</p>
              </div>
              <div>
                <b className="text-2xl text-emerald-600">Verified</b>
                <p className="text-xs text-slate-500 mt-1">Google session</p>
              </div>
            </div>

            <div className="mt-8 border-t pt-6 flex justify-between items-center">
              {isAdmin && (
                <Link to="/admin" className="btn btn-secondary text-xs">
                  <Shield size={14} /> Open Admin Dashboard
                </Link>
              )}
              <button onClick={signOut} className="btn btn-secondary text-red-600 text-xs ml-auto">
                Sign out
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Notifications Page
  return (
    <main className="page bg-surface">
      <div className="mx-auto max-w-3xl p-4 py-8">
        <h1 className="text-3xl font-black text-slate-900">Notifications</h1>
        <p className="text-slate-600 mt-1 text-sm">Updates on hazard reports in your area.</p>

        <div className="card mt-5 p-5 border-l-4 border-brand shadow-sm">
          <b className="text-slate-900">Welcome to Road Reality live intelligence</b>
          <p className="mt-1 text-sm text-slate-600">
            You will receive updates here when community members or authorities update reports in your area.
          </p>
          <p className="mt-2 text-xs text-slate-400">Just now</p>
        </div>
      </div>
    </main>
  );
}