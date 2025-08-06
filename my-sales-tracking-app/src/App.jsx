import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import Dashboard from "./pages/Dashboard";
import SalesTracker from './components/SalesTracker';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {user ? (
        <Dashboard user={user} />
      ) : (
        <LoginForm onLogin={setUser} />
      )}
    </div>
  );
}

export default App;