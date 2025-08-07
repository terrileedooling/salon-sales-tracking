import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {user ? (
        <Dashboard user={user} onLogout={() => setUser(null)}/>
      ) : (
        <LoginForm onLogin={setUser} />
      )}
    </div>
  );
}

export default App;