import { useState, useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";

export function AuthComponent() {
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (!session) {
        return (
            <div className="max-w-md mx-auto w-full panel p-8 mt-10">
                <h2 className="text-2xl font-bold mb-6 text-center">Login to MentorSync</h2>
                <Auth
                    supabaseClient={supabase}
                    appearance={{ theme: ThemeSupa }}
                    providers={["google", "github"]}
                />
            </div>
        );
    }

    return (
        <div className="text-center">
            <p className="mb-4">Logged in as {session.user.email}</p>
            <Button onClick={() => supabase.auth.signOut()} variant="outline">
                Sign out
            </Button>
        </div>
    );
}
