import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isSupabaseConfigured } from '../services/supabase';

export default function Auth() {
  const { user, signInWithGoogle, signOut, loading: authLoading, error: authError } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user && !authLoading) {
      // If user is already authenticated, redirect to previous page or home
      navigate(from, { replace: true });
    }
  }, [user, authLoading, navigate, from]);

  const handleGoogleLogin = async () => {
    setSubmitting(true);
    setErrorMessage(null);

    try {
      await signInWithGoogle();
      // OAuth redirect will handle navigation
    } catch (err) {
      console.error('Google login error:', err);
      setErrorMessage(err.message || 'Google sign-in failed. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <main className="page grid place-items-center bg-surface p-4">
      <div className="card w-full max-w-md p-8 shadow-xl text-center">
        {/* Brand Header */}
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white shadow-md">
          <ShieldAlert size={32} />
        </div>

        <h1 className="mt-6 text-3xl font-black text-slate-900">
          Welcome to Road Reality
        </h1>
        
        <p className="mt-2 text-slate-600 font-medium">
          Know the road before you take it.
        </p>

        {/* Supabase Warning if not configured */}
        {!isSupabaseConfigured && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-left text-xs text-amber-900">
            <p className="font-bold flex items-center gap-1.5 text-amber-800">
              <AlertCircle size={16} />
              Supabase Configuration Notice
            </p>
            <p className="mt-1">
              Google Auth requires valid <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_URL</code> and <code className="bg-amber-100 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> in your root <code className="bg-amber-100 px-1 rounded">.env</code> file.
            </p>
          </div>
        )}

        {/* Error Alert */}
        {(errorMessage || authError) && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-left text-xs text-red-800">
            <p className="font-bold flex items-center gap-1.5 text-red-900">
              <AlertCircle size={16} />
              Authentication Error
            </p>
            <p className="mt-1">{errorMessage || authError}</p>
          </div>
        )}

        {/* Already Logged In State */}
        {user ? (
          <div className="mt-8 space-y-4">
            <p className="text-sm text-slate-600">
              Signed in as <span className="font-bold text-slate-900">{user.email}</span>
            </p>

            <button
              onClick={() => navigate('/')}
              className="btn btn-primary w-full justify-center"
            >
              Continue to Road Reality
            </button>

            <button
              onClick={signOut}
              className="btn btn-secondary w-full justify-center text-red-600 border-red-200"
            >
              <LogOut size={16} />
              Sign out
            </button>
          </div>
        ) : (
          /* Sign In Action */
          <div className="mt-8 space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={submitting || authLoading}
              className="btn w-full justify-center gap-3 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400 py-3 shadow-sm font-semibold transition disabled:opacity-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              {submitting ? 'Signing in...' : 'Continue with Google'}
            </button>

            <p className="text-xs text-slate-500 mt-6 leading-relaxed">
              By continuing, you agree to allow location access for real-time local hazard detection.
            </p>
          </div>
        )}

        <div className="mt-8 border-t pt-4">
          <Link to="/explore" className="text-xs font-bold text-brand hover:underline">
            ← Explore map without signing in
          </Link>
        </div>
      </div>
    </main>
  );
}