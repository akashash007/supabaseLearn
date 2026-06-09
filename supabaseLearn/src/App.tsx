import { useState, useEffect } from "react";
import "./App.css";
import { AuthUI } from "./components/AuthUi";
import { supabase } from "./supabase-client";
import { TaskManager } from "./components/TaskManager";

function App() {
  const [session, setSession] = useState<any>(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    setSigningOut(false);
  };

  if (!session) {
    return <AuthUI />;
  }

  return (
    <div className="app-shell">
      {/* Nav */}
      <nav className="app-nav" role="navigation" aria-label="Main navigation">
        <div className="nav-brand">
          <span className="nav-brand-dot" />
          Taskflow
        </div>
        <div className="nav-user">
          <span className="nav-email" title={session.user.email}>
            {session.user.email}
          </span>
          <button
            className="btn btn-signout"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-label="Sign out"
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </nav>

      {/* Content */}
      <TaskManager />
    </div>
  );
}

export default App;