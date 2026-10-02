import { Link, NavLink } from 'react-router-dom';
import { Menu, ShieldAlert, X, LogOut, User, Shield } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, role, isAdmin, signOut, loading } = useAuth();

  useEffect(() => {
    if (!user) return;
    console.info('[Navbar] Admin Dashboard visibility:', {
      userId: user.id,
      role,
      isAdmin
    });
  }, [user, role, isAdmin]);

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const avatarUrl = user?.user_metadata?.avatar_url;

  return (
    <header className="sticky top-0 z-[1000] border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
            <ShieldAlert size={20} />
          </span>
          Road Reality
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 md:flex">
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              `text-sm font-medium transition ${
                isActive ? 'font-bold text-brand' : 'text-slate-600 hover:text-brand'
              }`
            }
          >
            Explore
          </NavLink>

          {user && (
            <>
              <NavLink
                to="/my-reports"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'font-bold text-brand' : 'text-slate-600 hover:text-brand'
                  }`
                }
              >
                My reports
              </NavLink>

              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `text-sm font-medium transition ${
                    isActive ? 'font-bold text-brand' : 'text-slate-600 hover:text-brand'
                  }`
                }
              >
                Notifications
              </NavLink>
            </>
          )}

          {/* Admin Navigation Badge (Only shown if user is Admin) */}
          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `btn flex items-center gap-1.5 ${
                  isActive ? 'btn-primary' : 'btn-secondary text-brand border-brand/30'
                }`
              }
            >
              <Shield size={16} />
              Admin Dashboard
            </NavLink>
          )}

          <Link className="btn btn-primary" to="/report">
            Report a hazard
          </Link>

          {/* User Auth Section */}
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-lg bg-slate-200" />
          ) : user ? (
            <div className="flex items-center gap-3 border-l pl-4">
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-brand">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={userName} className="h-8 w-8 rounded-full object-cover border" />
                ) : (
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-700 border">
                    <User size={16} />
                  </div>
                )}
                <span className="max-w-[120px] truncate">{userName}</span>
              </Link>
              <button
                onClick={signOut}
                title="Sign out"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-red-600 transition"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-secondary">
              Sign in with Google
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          aria-label="Open navigation"
          className="md:hidden p-2 text-slate-700"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {open && (
        <nav className="border-t bg-white p-4 space-y-2 md:hidden">
          <NavLink
            onClick={() => setOpen(false)}
            to="/explore"
            className="block rounded-lg p-3 font-medium text-slate-700 hover:bg-slate-50"
          >
            Explore
          </NavLink>

          {user && (
            <>
              <NavLink
                onClick={() => setOpen(false)}
                to="/my-reports"
                className="block rounded-lg p-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                My reports
              </NavLink>

              <NavLink
                onClick={() => setOpen(false)}
                to="/notifications"
                className="block rounded-lg p-3 font-medium text-slate-700 hover:bg-slate-50"
              >
                Notifications
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink
              onClick={() => setOpen(false)}
              to="/admin"
              className="block rounded-lg p-3 font-bold text-amber-800 bg-amber-50 hover:bg-amber-100"
            >
              🛡️ Admin Dashboard
            </NavLink>
          )}

          <Link
            onClick={() => setOpen(false)}
            to="/report"
            className="btn btn-primary mt-2 w-full justify-center"
          >
            Report a hazard
          </Link>

          <div className="border-t pt-3 mt-3">
            {user ? (
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-2">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={userName} className="h-8 w-8 rounded-full border" />
                  ) : (
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 border">
                      <User size={16} />
                    </div>
                  )}
                  <span className="font-bold text-sm text-slate-800">{userName}</span>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="btn btn-secondary text-red-600 text-xs py-1.5"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <Link
                onClick={() => setOpen(false)}
                to="/login"
                className="btn btn-secondary w-full justify-center"
              >
                Sign in with Google
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
