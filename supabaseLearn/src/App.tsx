import { useState, useEffect } from "react";
import "./App.css";
import { AuthUI } from "./components/AuthUi";
import { Test } from "./components/test";
import { supabase } from "./supabase-client";


function App() {

  const [session, setSession] = useState<any>(null)

  // const fetchSession = async () => {
  //   const currentSession = await supabase.auth.getSession()
  //   console.log("Current session:", currentSession.data.session)
  //   setSession(currentSession.data.session)

  // }
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      {session ? (
        <>
          <div>
            <h1>Welcome, {session.user.email}!</h1>
            <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
          </div>
          <Test />
        </>
      ) : (
        <>
          <h1>Please log in or sign up.</h1>
          <AuthUI />
        </>
      )}
    </>
  );
}

export default App;