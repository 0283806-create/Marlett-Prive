import { useEffect, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      setLoading(true);
      try {
        const {
          data: { session }
        } = await supabase.auth.getSession();

        if (!session) {
          if (!cancelled) setIsAdmin(false);
          return;
        }

        const {
          data: { user },
          error: userError
        } = await supabase.auth.getUser();

        if (userError || !user) {
          if (!cancelled) setIsAdmin(false);
          return;
        }

        const role = user.app_metadata?.role;
        if (!cancelled) {
          setIsAdmin(role === 'admin');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        if (!cancelled) setIsAdmin(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void checkAuth();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (!session) {
        setIsAdmin(false);
        setLoading(false);
      } else {
        void checkAuth();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#1a1a1a',
          color: '#C8A96E',
          fontFamily: 'Manrope, sans-serif',
          fontSize: '16px'
        }}
      >
        Verificando acceso...
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
