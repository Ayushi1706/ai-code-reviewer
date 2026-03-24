import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code2, Shield, Zap, CheckCircle } from 'lucide-react';
import API from '../utils/axios';

export default function Auth() {
  const [activeTab, setActiveTab] = useState('login');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '' });

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    setError('');
    setLoading(true);
  
    try {
      const { data } = await API.post("/auth/login", loginForm);
  
      login(data.user, data.token);
      navigate("/dashboard");
  
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
  
    setError('');
    setLoading(true);
  
    try {
      const { data } = await API.post("/auth/signup", signupForm);
  
      login(data.user, data.token);
      navigate("/dashboard");
  
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">

        {/* Left side — branding */}
        <div className="space-y-6 lg:space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-[#10B981] rounded-lg">
              <Code2 className="w-6 h-6 md:w-7 md:h-7 text-black" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              CodeReview <span className="text-[#10B981]">AI</span>
            </h1>
          </div>

          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
              AI-Powered Code Review
              <span className="block text-[#10B981] mt-2">For Developers</span>
            </h2>
            <p className="text-base md:text-lg text-gray-400">
              Get instant, intelligent feedback on your code. Identify bugs, security issues,
              and performance bottlenecks before they reach production.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white mb-1">Best Practices</h3>
                <p className="text-sm text-gray-400">Follow industry standards and coding conventions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white mb-1">Security Analysis</h3>
                <p className="text-sm text-gray-400">Detect vulnerabilities and security risks</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-white mb-1">Performance Optimization</h3>
                <p className="text-sm text-gray-400">Improve code efficiency and runtime performance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right side — auth form */}
        <div className="bg-[#1E1E1E] border border-[#2A2A2A] rounded-xl shadow-2xl p-6">
          <h2 className="text-white text-xl font-semibold mb-1">Welcome</h2>
          <p className="text-gray-400 text-sm mb-6">Sign up or log in to start reviewing your code</p>

          {/* Tabs */}
          <div className="grid grid-cols-2 bg-[#2A2A2A] rounded-lg p-1 mb-6">
            <button
              onClick={() => { setActiveTab('login'); setError(''); }}
              className={`py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'login'
                  ? 'bg-[#10B981] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setActiveTab('signup'); setError(''); }}
              className={`py-2 rounded-md text-sm font-medium transition ${
                activeTab === 'signup'
                  ? 'bg-[#10B981] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Login form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  required
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-black font-semibold py-3 rounded-lg text-sm transition disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          )}

          {/* Signup form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Full Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={signupForm.name}
                  onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                  required
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Email</label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                  required
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                  required
                  className="w-full bg-[#2A2A2A] border border-[#3A3A3A] text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#10B981]"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-black font-semibold py-3 rounded-lg text-sm transition disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}