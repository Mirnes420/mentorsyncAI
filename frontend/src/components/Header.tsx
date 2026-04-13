import { useEffect, useState } from 'react';
import { Zap, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { Link } from 'react-router-dom';

export function Header() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between max-w-7xl">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground tracking-tight">MentorSync</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Home</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="text-xs text-muted-foreground hidden sm:block">{session.user.email}</span>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground hover:text-foreground"
                onClick={() => supabase.auth.signOut()}
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </Button>
            </>
          ) : (
            <div className="text-xs text-muted-foreground">AI-Powered Resume Tailoring</div>
          )}
        </div>
      </div>
    </header>
  );
}
