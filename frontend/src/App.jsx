import { useState, useEffect } from 'react';
import Register from './components/Register';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import Network from './components/Network';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [currentView, setCurrentView] = useState('dashboard'); 

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setIsAuthenticated(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setCurrentView('dashboard'); 
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        
        {/* --- NAVIGATION BAR --- */}
        <nav className="bg-white shadow-sm border-b p-4 flex justify-between items-center mb-6 px-4 md:px-10">
          <h1 
            onClick={() => setCurrentView('dashboard')}
            className="text-2xl font-bold text-blue-600 cursor-pointer"
          >
            GovNetwork
          </h1>
          
          <div className="flex gap-6 items-center font-medium text-gray-700">
            <button 
              onClick={() => setCurrentView('dashboard')} 
              className={currentView === 'dashboard' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}
            >
              Feed
            </button>
            {/* NEW NETWORK BUTTON */}
            <button 
              onClick={() => setCurrentView('network')} 
              className={currentView === 'network' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}
            >
              Network
            </button>
            <button 
              onClick={() => setCurrentView('profile')} 
              className={currentView === 'profile' ? "text-blue-600 border-b-2 border-blue-600 pb-1" : "hover:text-blue-600 pb-1"}
            >
              Profile
            </button>
            <button 
              onClick={handleLogout} 
              className="text-red-500 hover:bg-red-50 px-3 py-1 rounded transition"
            >
              Logout
            </button>
          </div>
        </nav>

        {/* --- RENDER THE SELECTED VIEW --- */}
        <div>
          {currentView === 'dashboard' && <Dashboard onLogout={handleLogout} />}
          {currentView === 'profile' && <Profile />}
          {currentView === 'network' && <Network />}
        </div>
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