import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  role: null,
  isAdmin: false,
  error: null,
  signInWithGoogle: async () => {},
  signOut: async () => {}
});

/**
 * Creates/updates user profile row in the public `profiles` table.
 * - id = authenticated Supabase user's id
 * - email = user's email
 * - name = user's Google display name
 * - avatar_url = user's Google avatar
 * New profiles receive the database default role. Existing profile roles are preserved.
 */
async function syncUserProfile(user) {
  if (!user || !isSupabaseConfigured || !supabase) return;

  const fullName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    '';

  const avatarUrl = user.user_metadata?.avatar_url || '';

  try {
    const { error: upsertErr } = await supabase
      .from('profiles')
      .upsert(
        {
          id: user.id,
          email: user.email,
          name: fullName,
          avatar_url: avatarUrl
        },
        { onConflict: 'id', ignoreDuplicates: false }
      );

    if (upsertErr) {
      console.warn('[Auth] Supabase profile sync notice:', upsertErr.message);
    } else {
      console.log('[Auth] Profile synced successfully for:', user.email);
    }
  } catch (err) {
    console.warn('[Auth] Profile sync warning:', err.message);
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [error, setError] = useState(null);

  // Resolve role from the authenticated user's actual Supabase profile.
  const resolveUserRole = async (currentSession) => {
    if (!currentSession || !currentSession.access_token || !currentSession.user) {
      setRole(null);
      return 'user';
    }

    // Admin UI access uses the actual profile role, without backend or email fallbacks.
    if (supabase && currentSession.user) {
      try {
        const { data: profile, error: profileErr } = await supabase
          .from('profiles')
          .select('id, role')
          .eq('id', currentSession.user.id)
          .maybeSingle();

        if (profileErr) {
          console.warn('[Auth] Profile lookup failed:', {
            userId: currentSession.user.id,
            code: profileErr.code,
            message: profileErr.message
          });
        } else if (profile && profile.role) {
          const profileRole = profile.role;
          console.info('[Auth] Profile role lookup:', {
            userId: currentSession.user.id,
            profileId: profile.id,
            profileRole
          });
          setRole(profileRole);
          return profileRole;
        } else {
          console.warn('[Auth] No profile matched authenticated user:', {
            userId: currentSession.user.id
          });
        }
      } catch (err) {
        console.warn('[Auth] Direct profiles query fallback:', err.message);
      }
    }

    console.log('[Auth] Default role assigned: user');
    setRole('user');
    return 'user';
  };

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      console.warn('[Auth] Supabase is not configured. Setting loading = false.');
      setLoading(false);
      return;
    }

    let isMounted = true;
    let isFinished = false;

    // Check if OAuth callback parameters exist in current URL
    const hasOAuthParams = Boolean(
      window.location.hash.includes('access_token=') ||
      window.location.hash.includes('error=') ||
      window.location.search.includes('code=')
    );

    // 1. OAuth parameters detected
    console.log('[Auth 1] OAuth parameters detected:', hasOAuthParams);

    const finishLoading = (reason) => {
      if (isMounted && !isFinished) {
        isFinished = true;
        // 10. loading changed to false
        console.log(`[Auth 10] loading changed to false (${reason})`);
        setLoading(false);
      }
    };

    const processSession = async (currentSession, sourceLabel) => {
      if (!isMounted) return;

      // 5. session/user received
      console.log(`[Auth 5] session/user received from ${sourceLabel}:`, currentSession?.user?.email || 'No user');

      if (currentSession && currentSession.user) {
        setSession(currentSession);
        setUser(currentSession.user);
        setError(null);

        // 6 & 7: syncUserProfile started / completed or failed
        console.log('[Auth 6] syncUserProfile started for:', currentSession.user.email);
        try {
          await syncUserProfile(currentSession.user);
          console.log('[Auth 7] syncUserProfile completed');
        } catch (err) {
          console.warn('[Auth 7] syncUserProfile failed:', err.message);
        }

        // 8 & 9: resolveUserRole started / completed or failed
        console.log('[Auth 8] resolveUserRole started for:', currentSession.user.email);
        try {
          const detectedRole = await resolveUserRole(currentSession);
          console.log('[Auth 9] resolveUserRole completed:', detectedRole);
        } catch (err) {
          console.warn('[Auth 9] resolveUserRole failed:', err.message);
          setRole('user');
        }
      } else {
        setSession(null);
        setUser(null);
        setRole(null);
      }

      finishLoading(`Completed processing ${sourceLabel}`);
    };

    // Safety timeout: 4.5 seconds max limit on loading screen
    const safetyTimeout = setTimeout(() => {
      if (isMounted && !isFinished) {
        console.warn('[Auth] Safety timeout reached (4.5s). Forcing loading = false.');
        finishLoading('Safety timeout');
      }
    }, 4500);

    // 2. getSession() started
    console.log('[Auth 2] getSession() started');

    supabase.auth
      .getSession()
      .then(async ({ data: { session: initialSession }, error: sessionErr }) => {
        if (!isMounted) return;

        if (sessionErr) {
          console.error('[Auth] getSession error from Supabase:', sessionErr.message);
        }

        // 3. getSession() result
        console.log('[Auth 3] getSession() result:', initialSession ? `Session present (${initialSession.user?.email})` : 'No session');

        if (initialSession && initialSession.user) {
          await processSession(initialSession, 'getSession');
        } else if (!hasOAuthParams) {
          // No session and no OAuth parameters in URL - finish loading immediately
          finishLoading('No session and no OAuth params');
        } else {
          console.log('[Auth] getSession returned null with OAuth params present in URL. Waiting for onAuthStateChange or safety timeout...');
        }
      })
      .catch((err) => {
        console.error('[Auth] getSession exception:', err.message || err);
        finishLoading('getSession exception');
      });

    // Listen for Auth State Changes
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      // 4. auth event received
      console.log('[Auth 4] auth event received:', event, 'Session present:', Boolean(newSession));

      if (newSession && newSession.user) {
        await processSession(newSession, `onAuthStateChange:${event}`);
      } else if (event === 'SIGNED_OUT') {
        await processSession(null, 'onAuthStateChange:SIGNED_OUT');
      } else if (!hasOAuthParams && !isFinished) {
        finishLoading(`onAuthStateChange:${event} with null session`);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimeout);
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    console.info('[AuthContext] Resolved authorization state:', {
      userId: user.id,
      role,
      isAdmin: typeof role === 'string' && role.trim().toLowerCase() === 'admin'
    });
  }, [user, role]);

  // Sign in with Google OAuth
  const signInWithGoogle = async () => {
    setError(null);
    if (!isSupabaseConfigured || !supabase) {
      const msg = 'Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local';
      setError(msg);
      throw new Error(msg);
    }

    try {
      const redirectUrl = `${window.location.origin}/login`;
      console.log('[Auth] Initiating Google OAuth with redirect:', redirectUrl);

      const { error: signInErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl
        }
      });

      if (signInErr) {
        setError(signInErr.message || 'Google sign-in failed.');
        throw signInErr;
      }
    } catch (err) {
      console.error('[Auth] signInWithGoogle error:', err);
      setError(err.message || 'Google sign-in failed.');
      throw err;
    }
  };

  // Sign out
  const signOut = async () => {
    setError(null);
    console.log('[Auth] Signing out user...');
    if (supabase && isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
    setRole(null);
  };

  const isAdmin = typeof role === 'string' && role.trim().toLowerCase() === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        role,
        isAdmin,
        error,
        signInWithGoogle,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
