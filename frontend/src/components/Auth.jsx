import { useState } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false); 
  
  // 🚀 FIX: State se department aur jobTitle hata diya
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'aspirant'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      });

      if (response.ok) {
        toast.success("Account created! Please sign in.");
        setIsLogin(true); 
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Registration failed');
      }
    } catch (err) {
      toast.error('Server connection failed!');
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.href = '/'; 
      } else {
        toast.error(data.message || "Invalid credentials!");
      }
    } catch (error) {
      toast.error("Server connection failed!");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      
      <div className="flex bg-slate-50 rounded-lg p-1 mb-6">
        <button 
          type="button"
          onClick={() => setIsLogin(false)}
          className={`flex-1 py-2 rounded-md text-sm transition-all ${
            !isLogin ? 'bg-white shadow-sm font-semibold text-gray-900' : 'font-medium text-gray-500 hover:text-gray-700'
          }`}
        >
          Create account
        </button>
        <button 
          type="button" 
          onClick={() => setIsLogin(true)}
          className={`flex-1 py-2 rounded-md text-sm transition-all ${
            isLogin ? 'bg-white shadow-sm font-semibold text-gray-900' : 'font-medium text-gray-500 hover:text-gray-700'
          }`}
        >
          Sign in
        </button>
      </div>

      {isLogin ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fadeIn">
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" required />

          <button type="submit" className="w-full bg-slate-500 text-white p-3 rounded-lg hover:bg-slate-600 transition flex justify-center items-center gap-2 mt-4 font-semibold shadow-sm">
            Sign in →
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fadeIn">
          <div className="mb-6 space-y-3 text-left">
            <p className="text-sm font-medium text-gray-800">I'm joining as a...</p>
            
            <div onClick={() => handleRoleChange('official')} className={`p-3 border rounded-xl flex gap-3 cursor-pointer transition-all ${formData.role === 'official' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="bg-gray-100/80 text-gray-600 p-2.5 rounded-lg h-fit text-lg">💼</div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Government Official</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Verified profile • Mentorship toggle • Spam-free inbox</p>
              </div>
            </div>

            <div onClick={() => handleRoleChange('aspirant')} className={`p-3 border rounded-xl flex gap-3 cursor-pointer transition-all ${formData.role === 'aspirant' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="bg-gray-100/80 text-gray-600 p-2.5 rounded-lg h-fit text-lg">🎓</div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Exam Aspirant</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Follow officials & institutes • Request guidance • Track prep</p>
              </div>
            </div>

            <div onClick={() => handleRoleChange('creator')} className={`p-3 border rounded-xl flex gap-3 cursor-pointer transition-all ${formData.role === 'creator' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
              <div className="bg-gray-100/80 text-gray-600 p-2.5 rounded-lg h-fit text-lg">🏢</div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">Creator / Institute</h3>
                <p className="text-xs text-gray-500 mt-0.5 leading-snug">Post syllabus updates, job alerts and study materials</p>
              </div>
            </div>
          </div>

          <input type="text" name="name" placeholder="Full name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required />
          <input type="email" name="email" placeholder="Official / personal email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required />
          
          {/* 🚀 FIX: Department aur JobTitle wala block yahan se delete kar diya */}

          <button type="submit" className="w-full bg-slate-500 text-white p-3 rounded-lg hover:bg-slate-600 transition flex justify-center items-center gap-2 mt-4 font-semibold shadow-sm">
            Create account →
          </button>
          
          <p className="text-xs text-gray-500 text-center mt-4 pt-2">
            By continuing you agree to NextGov's professional code of conduct.
          </p>
        </form>
      )}
    </div>
  );
}