import { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);

  // Check if user already has a valid badge on page load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 pt-10">
        <Dashboard onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {showLogin ? <Login /> : <Register />}
      
      <button onClick={() => setShowLogin(!showLogin)} className="mt-4 text-blue-600 underline">
        {showLogin ? "Need an account? Register here." : "Already have an account? Login here."}
      </button>
    </div>
  );
}

export default App;