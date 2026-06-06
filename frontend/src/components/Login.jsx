import { useState } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  // Role selector ke liye state (UI matching the screenshot)
  const [role, setRole] = useState('exam'); 

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Agar backend ko role chahiye toh bhej sakte hain, warna ignore hoga
        body: JSON.stringify({ ...formData, role }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        window.location.reload();
        toast.success("Welcome back! 👋");
      } else {
        toast.error(data.message || "Invalid credentials!");
      }
    } catch (error) {
      toast.error("Server connection failed!");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      
      {/* Top Tabs */}
      <div className="flex bg-slate-50 rounded-lg p-1 mb-6">
        <button 
          type="button"
          onClick={() => window.location.href = '/register'} // Redirect to register
          className="flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition"
        >
          Create account
        </button>
        <button 
          type="button" 
          className="flex-1 py-2 bg-white rounded-md shadow-sm text-sm font-semibold text-gray-900"
        >
          Sign in
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Input Fields */}
        <input 
          type="email" 
          name="email" 
          placeholder="Email" 
          onChange={handleChange} 
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" 
          required 
        />
        <input 
          type="password" 
          name="password" 
          placeholder="Password" 
          onChange={handleChange} 
          className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm" 
          required 
        />

        {/* Small Role Selector Pills */}
        <div className="flex justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => setRole('government')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
              role === 'government' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Government
          </button>
          <button
            type="button"
            onClick={() => setRole('exam')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
              role === 'exam' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Exam
          </button>
          <button
            type="button"
            onClick={() => setRole('creator')}
            className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
              role === 'creator' ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            Creator
          </button>
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-slate-500 text-white p-3 rounded-lg hover:bg-slate-600 transition flex justify-center items-center gap-2 mt-2 font-semibold shadow-sm"
        >
          Sign in →
        </button>
      </form>
    </div>
  );
}