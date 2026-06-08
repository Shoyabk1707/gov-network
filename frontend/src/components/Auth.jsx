import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false); 
  const [step, setStep] = useState(1); // 🚀 Multi-step registration wizard pointer
  const [timer, setTimer] = useState(300); // 5-minute linear countdown tracking (in seconds)
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'aspirant', otp: ''
  });

  // --- ⏰ INLINE EXPIRY TIMER ENGINE ---
  useEffect(() => {
    let interval = null;
    if (!isLogin && step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false); // Throttle threshold complete. Enable resend hook.
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isLogin, step, timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleChange = (selectedRole) => {
    setFormData({ ...formData, role: selectedRole });
  };

  // --- 🚀 PHASE 1: SUBMIT CREDENTIALS & REQUEST SECURE OTP TOKEN ---
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }) 
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success(resData.message || 'Verification token dispatched! Check your inbox. 🏛️');
        setStep(2); // Progress state seamlessly to OTP display layer
        setTimer(300); // Hard reset counter parameters pool allocation
        setIsResendDisabled(true);
      } else {
        toast.error(resData.message || 'System verification setup dropped.');
      }
    } catch (err) {
      toast.error('Server connection failed!');
    } finally {
      setLoading(false);
    }
  };

  // --- 🚀 PHASE 2: COLLECT OTP DIGITS & ATOMIC WRITE COMMIT ---
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      return toast.error('Verification code parameters must span exactly 6 digits.');
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData) // Dispatches sanitized properties payload context
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success('Identity authorized! Establishing session context... ✨');
        localStorage.setItem('token', resData.token);
        
        setTimeout(() => {
          window.location.href = '/'; 
        }, 1000);
      } else {
        toast.error(resData.message || 'Authentication validation sequence aborted.');
      }
    } catch (err) {
      toast.error('Server serialization layer unreachable.');
    } finally {
      setLoading(false);
    }
  };

  // --- 🔐 CORE PASSIVE AUTH ENGINE: SIGN IN ROUTINE ---
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

  const formatTime = () => {
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 transition-all">
      
      {/* Dynamic Tab Selector Matrix */}
      <div className="flex bg-slate-50 rounded-lg p-1 mb-6">
        <button 
          type="button"
          onClick={() => { setIsLogin(false); setStep(1); }}
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

      {/* ==========================================
          ⚙️ LOGIN PIPELINE SCREEN
          ========================================== */}
      {isLogin ? (
        <form onSubmit={handleLoginSubmit} className="space-y-4 animate-fadeIn">
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" required />
          <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" required />

          <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-lg hover:bg-slate-800 transition flex justify-center items-center gap-2 mt-4 font-bold text-sm shadow-sm">
            Sign in →
          </button>
        </form>
      ) : (
        /* ==========================================
           ⚙️ REGISTER WIZARD STAGE 1: SUBMIT BASE CREDENTIALS
           ========================================== */
        step === 1 ? (
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

            <input type="text" name="name" placeholder="Full name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" required />
            <input type="email" name="email" placeholder="Official / personal email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" required />

            <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-3 rounded-lg hover:bg-slate-800 transition flex justify-center items-center gap-2 mt-4 font-bold text-sm shadow-sm disabled:opacity-50">
              {loading ? 'Processing network handshakes...' : 'Get Verification Code →'}
            </button>
          </form>
        ) : (
          /* ==========================================
             ⚙️ REGISTER WIZARD STAGE 2: LIVE OTP VERIFICATION OVERLAY
             ========================================== */
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-5 animate-fadeIn">
            <div className="text-center space-y-2">
              <div className="text-3xl">📧</div>
              <h2 className="text-lg font-bold text-slate-900">Enter Verification Code</h2>
              <p className="text-xs text-slate-500 leading-relaxed px-4">
                We have dispatched a cryptographically secure 6-digit signature token to <span className="text-slate-800 font-semibold">{formData.email}</span>.
              </p>
            </div>

            <div className="space-y-2">
              <input 
                type="text" 
                name="otp" 
                maxLength="6"
                placeholder="000000" 
                value={formData.otp}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 rounded-xl text-center text-2xl font-extrabold tracking-[12px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-slate-50"
                required 
              />
              
              <div className="flex items-center justify-between px-1 text-xs font-semibold">
                <span className={timer > 0 ? 'text-slate-500' : 'text-red-500'}>
                  {timer > 0 ? `Code expires in: ${formatTime()}` : 'Verification slot expired!'}
                </span>
                <button
                  type="button"
                  disabled={isResendDisabled || loading}
                  onClick={handleRegisterSubmit}
                  className="text-blue-600 hover:text-blue-800 transition disabled:opacity-40 disabled:hover:text-blue-600 font-bold"
                >
                  Resend OTP
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button type="submit" disabled={loading || timer === 0} className="w-full bg-blue-600 text-white p-3.5 rounded-xl hover:bg-blue-700 transition flex justify-center items-center font-bold text-sm shadow-sm disabled:opacity-50">
                {loading ? 'Establishing database records...' : 'Confirm Identity & Establish Profile'}
              </button>
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-slate-500 bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-bold hover:bg-slate-100 transition"
              >
                Modify Details
              </button>
            </div>
          </form>
        )
      )}

      <p className="text-[11px] text-gray-400 text-center mt-6 pt-2 leading-relaxed">
        NextGov utilizes an automated distributed verification workflow to protect nodes and scale accounts safely.
      </p>
    </div>
  );
}