import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import toast from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false); 
  const [step, setStep] = useState(1); 
  const [timer, setTimer] = useState(300); 
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', otp: ''
  });

  useEffect(() => {
    let interval = null;
    if (!isLogin && step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsResendDisabled(false); 
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isLogin, step, timer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚀 MEMORY LOCK JUGAAD ENGINE
  const storeUserIdentityLocally = (token) => {
    try {
      localStorage.setItem('token', token);
      const payload = JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      const resolvedName = payload?.name || payload?.username || payload?.displayName || "Shoyab Khan";
      const resolvedTitle = payload?.jobTitle || payload?.role || "Business Development";
      const resolvedAvatar = payload?.avatar || "";

      localStorage.setItem('userName', resolvedName);
      localStorage.setItem('userTitle', resolvedTitle);
      localStorage.setItem('userAvatar', resolvedAvatar);
    } catch (err) {
      console.error("Local identity saving fault:", err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        storeUserIdentityLocally(data.token);
        toast.success(data.message || 'Google Auth successful! Redirecting... ✨');
        setTimeout(() => {
          window.location.href = '/'; 
        }, 1000);
      } else {
        toast.error(data.message || "Google Authentication failed.");
      }
    } catch (error) {
      toast.error("Server connection failed during Google Auth!");
    }
  };

  const handleGoogleError = () => {
    toast.error("Google Sign-In was cancelled or failed.");
  };

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
        setStep(2); 
        setTimer(300); 
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

  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    if (!formData.otp || formData.otp.length !== 6) {
      return toast.error('Verification code must span exactly 6 digits.');
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const resData = await response.json();

      if (response.ok) {
        toast.success('Identity authorized! Establishing session... ✨');
        storeUserIdentityLocally(resData.token);
        
        setTimeout(() => {
          window.location.href = '/'; 
        }, 1000);
      } else {
        toast.error(resData.message || 'Authentication sequence aborted.');
      }
    } catch (err) {
      toast.error('Server connection failed.');
    } finally {
      setLoading(false);
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
        storeUserIdentityLocally(data.token);
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

      {isLogin ? (
        <div className="space-y-4 animate-fadeIn">
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" required />
            <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" required />

            <button type="submit" className="w-full bg-slate-900 text-white p-3 rounded-lg hover:bg-slate-800 transition flex justify-center items-center gap-2 mt-4 font-bold text-sm shadow-sm">
              Sign in →
            </button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">OR</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} useOneTap shape="rectangular" size="large" width="350px" />
          </div>
        </div>
      ) : (
        step === 1 ? (
          <div className="space-y-4 animate-fadeIn">
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <input type="text" name="name" placeholder="Full name" value={formData.name} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" required />
              <input type="email" name="email" placeholder="Email address" value={formData.email} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" required />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium" required />

              <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white p-3 rounded-lg hover:bg-slate-800 transition flex justify-center items-center gap-2 mt-4 font-bold text-sm shadow-sm disabled:opacity-50">
                {loading ? 'Processing...' : 'Continue with Email →'}
              </button>
            </form>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">OR</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} shape="rectangular" size="large" text="signup_with" width="350px" />
            </div>
          </div>
        ) : (
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
                className="w-full p-4 border border-gray-200 rounded-xl text-center text-2xl font-extrabold tracking-[12px] focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all bg-slate-50"
                required 
              />
              
              <div className="flex items-center justify-between px-1 text-xs font-semibold">
                <span className={timer > 0 ? 'text-slate-500' : 'text-red-500'}>
                  {timer > 0 ? `Code expires in: ${formatTime()}` : 'Verification slot expired!'}
                </span>
              </div>
            </div>

            <button type="submit" disabled={loading || timer === 0} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-xs">
              {loading ? 'Verifying...' : 'Verify and Register'}
            </button>
          </form>
        ) // 🚀 FIXED: Dynamic layout block closed with clean closing parenthesis
      )}

      <p className="text-[11px] text-gray-400 text-center mt-6 pt-2 leading-relaxed">
        GovNetwork utilizes an automated distributed verification workflow to protect nodes and scale accounts safely.
      </p>
    </div>
  );
}