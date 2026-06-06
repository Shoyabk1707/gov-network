import { useState } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function Register() {
  // 'role' ko state mein add kiya, default 'aspirant' rakha
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', department: '', jobTitle: '', role: 'aspirant'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Role change karne ka function
  const handleRoleChange = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) 
      });

      if (response.ok) {
        window.location.href = '/'; 
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      alert('Server connection failed!');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      
      {/* Top Tabs (Visual Only for now) */}
      <div className="flex bg-slate-50 rounded-lg p-1 mb-6">
        <button className="flex-1 py-2 bg-white rounded-md shadow-sm text-sm font-semibold text-gray-900">Create account</button>
        <button className="flex-1 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">Sign in</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* --- ROLE SELECTOR --- */}
        <div className="mb-6 space-y-3 text-left">
          <p className="text-sm font-medium text-gray-800">I'm joining as a...</p>

          {/* Official Card */}
          <div
            onClick={() => handleRoleChange('official')}
            className={`p-3 border rounded-xl flex gap-3 cursor-pointer transition-all ${
              formData.role === 'official' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="bg-gray-100/80 text-gray-600 p-2.5 rounded-lg h-fit text-lg">💼</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Government Official</h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">Verified profile • Mentorship toggle • Spam-free inbox</p>
            </div>
          </div>

          {/* Aspirant Card */}
          <div
            onClick={() => handleRoleChange('aspirant')}
            className={`p-3 border rounded-xl flex gap-3 cursor-pointer transition-all ${
              formData.role === 'aspirant' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="bg-gray-100/80 text-gray-600 p-2.5 rounded-lg h-fit text-lg">🎓</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Exam Aspirant</h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">Follow officials & institutes • Request guidance • Track prep</p>
            </div>
          </div>

          {/* Creator Card */}
          <div
            onClick={() => handleRoleChange('creator')}
            className={`p-3 border rounded-xl flex gap-3 cursor-pointer transition-all ${
              formData.role === 'creator' ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="bg-gray-100/80 text-gray-600 p-2.5 rounded-lg h-fit text-lg">🏢</div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Creator / Institute</h3>
              <p className="text-xs text-gray-500 mt-0.5 leading-snug">Post syllabus updates, job alerts and study materials</p>
            </div>
          </div>
        </div>

        {/* --- DYNAMIC INPUT FIELDS --- */}
        <input type="text" name="name" placeholder="Full name" onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required />
        <input type="email" name="email" placeholder="Official / personal email" onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required />
        
        {/* Sirf Official ke liye extra fields dikhayenge */}
        {formData.role === 'official' && (
          <div className="space-y-4 pt-2">
            <input type="text" name="department" placeholder="Department (e.g., Finance)" onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required />
            <input type="text" name="jobTitle" placeholder="Job Title" onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required />
          </div>
        )}

        <button type="submit" className="w-full bg-slate-500 text-white p-3 rounded-lg hover:bg-slate-600 transition flex justify-center items-center gap-2 mt-4 font-semibold shadow-sm">
          Create account →
        </button>
        
        <p className="text-xs text-gray-500 text-center mt-4 pt-2">
          By continuing you agree to NextGov's professional code of conduct.
        </p>
      </form>
    </div>
  );
}