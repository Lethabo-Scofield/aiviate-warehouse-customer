import React, { useState } from 'react';
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaGoogle,
  FaFacebook,
  FaApple,
  FaTruck,
  FaCheckCircle,
  FaStore,
  FaBoxes,
  FaShippingFast
} from 'react-icons/fa';

const Login = ({ onLogin, onRegister, isLoading, error }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    company: '',
    phone: ''
  });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLogin) {
      if (!formData.email || !formData.password) {
        alert('Please fill in all fields');
        return;
      }
      onLogin(formData.email, formData.password);
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        alert('Please fill in all fields');
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      if (formData.password.length < 6) {
        alert('Password must be at least 6 characters');
        return;
      }
      onRegister(formData);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: '',
      company: '',
      phone: ''
    });
  };

  const features = [
    { icon: FaBoxes, text: 'Bulk quantity ordering' },
    { icon: FaShippingFast, text: 'Fast delivery scheduling' },
    { icon: FaStore, text: 'Procurement-focused workspace' }
  ];

  const inputBase =
    'w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 shadow-sm outline-none transition-all focus:border-teal-500 focus:ring-4 focus:ring-teal-100';

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-10 h-72 w-72 rounded-full bg-teal-300/25 blur-3xl"></div>
        <div className="absolute top-1/3 right-0 h-96 w-96 rounded-full bg-cyan-300/20 blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-amber-300/20 blur-3xl"></div>
      </div>

      <div className="relative mx-auto w-full max-w-xl rounded-[1.75rem] border border-white/80 bg-white/90 p-7 shadow-[0_24px_70px_rgba(7,22,30,0.16)] backdrop-blur-xl sm:p-9">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gradient-to-r from-teal-700 to-cyan-700 p-2.5 shadow-md">
              <FaTruck className="text-white text-lg" />
            </div>
            <div>
              <p className="text-xl font-extrabold leading-tight">
                <span className="gradient-text">BulkMart</span>
                <span className="ml-1 text-xs font-semibold text-slate-400">PRO</span>
              </p>
              <p className="text-xs text-slate-500">Wholesale buyer access</p>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleMode}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-teal-300 hover:bg-teal-50"
          >
            {isLogin ? 'Create account' : 'Sign in'}
          </button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isLogin
              ? 'Sign in to continue managing your bulk orders.'
              : 'Set up your team profile and start ordering in minutes.'}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</label>
                <div className="relative">
                  <FaUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={inputBase}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Company</label>
                  <div className="relative">
                    <FaStore className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Store name"
                      className={inputBase}
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Phone</label>
                  <div className="relative">
                    <i className="fas fa-phone pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+27 00 000 0000"
                      className={inputBase}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Email Address</label>
            <div className="relative">
              <FaEnvelope className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="team@supermarket.com"
                className={inputBase}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Password</label>
            <div className="relative">
              <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`${inputBase} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">Confirm Password</label>
              <div className="relative">
                <FaLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={inputBase}
                />
              </div>
            </div>
          )}

          {isLogin && (
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-teal-500"
                />
                Keep me signed in
              </label>
              <button type="button" className="text-sm font-semibold text-teal-700 transition hover:text-teal-900">
                Forgot password?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="btn-gradient w-full gap-2 py-3.5 text-sm sm:text-base disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner animate-spin"></i>
                {isLogin ? 'Signing in...' : 'Creating account...'}
              </>
            ) : (
              isLogin ? 'Access Dashboard' : 'Create Account'
            )}
          </button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider text-slate-400">
              <span className="bg-white px-3">or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button type="button" className="rounded-xl border border-slate-200 bg-white py-2.5 transition hover:border-teal-300 hover:bg-teal-50">
              <FaGoogle className="mx-auto text-lg text-red-500" />
            </button>
            <button type="button" className="rounded-xl border border-slate-200 bg-white py-2.5 transition hover:border-teal-300 hover:bg-teal-50">
              <FaFacebook className="mx-auto text-lg text-blue-600" />
            </button>
            <button type="button" className="rounded-xl border border-slate-200 bg-white py-2.5 transition hover:border-teal-300 hover:bg-teal-50">
              <FaApple className="mx-auto text-lg text-slate-800" />
            </button>
          </div>
        </form>

        <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Why teams use BulkMart</p>
          <div className="space-y-2">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                    <Icon className="text-xs" />
                  </span>
                  <span>{feature.text}</span>
                  <FaCheckCircle className="ml-auto text-xs text-emerald-500" />
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-slate-500">
          Secure session protected with enterprise-grade encryption.
        </p>
      </div>
    </div>
  );
};

export default Login;
