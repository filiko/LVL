"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState<{
    BACKEND_URL: string;
    DISCORD_CLIENT_ID: string;
    GOOGLE_CLIENT_ID: string;
  } | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch('/api/my-wrapper');
        const json = await res.json();
        setConfig(json);
      } catch (err) {
        console.error('Failed to load config:', err);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = { ...errors };

    if (!formData.email) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !config) return;

    setIsLoading(true);
    setErrors(prev => ({ ...prev, general: '' }));
    
    try {
      const response = await axios.post(`${config.BACKEND_URL}/api/auth/login/`, {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      if (response.data.user.is_admin) {
        router.push('/admin');
      } else if (response.data.user.is_team_lead) {
        router.push('/team-lead');
      } else {
        router.push('/home');
      }

      toast.success('Login successful!', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: true,
      });

    } catch (error: any) {
      console.error('Login error:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          setErrors(prev => ({ ...prev, 
            general: 'Invalid email or password',
            email: ' ',
            password: ' '
          }));
        } else {
          setErrors(prev => ({ ...prev, 
            general: error.response.data.detail || 'Login failed'
          }));
        }
      } else {
        setErrors(prev => ({ ...prev, 
          general: 'Network error. Please try again.'
        }));
      }

      toast.error(errors.general || 'Login failed', {
        position: "top-center",
        autoClose: 3000,
      });

    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: string) => {
    if (!config) return;

    const authUrls = {
      discord: `https://discord.com/oauth2/authorize?client_id=${config.DISCORD_CLIENT_ID}&redirect_uri=${window.location.origin}/login_callback?provider=discord&response_type=code&scope=identify email`,
      google: `https://accounts.google.com/oauth2/authorize?client_id=${config.GOOGLE_CLIENT_ID}&redirect_uri=${window.location.origin}/login_callback&response_type=code&scope=email profile&access_type=offline`,
    };

    const loginUrl = authUrls[provider as keyof typeof authUrls];
    window.location.href = loginUrl;
  };

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className='font-bahnschrift' style={{ background: 'linear-gradient(to right, #0a1d2f, #0b2840)' }}>
      <div className="min-h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39] flex items-center justify-center p-4">
        <div className="w-[360px] bg-[#0e1c33] rounded-md px-6 py-8 shadow-2xl text-white border border-[#114369]" style={{ background: 'linear-gradient(to right, #0b2840, #0a1d2f)' }}>
          <div className="text-center mb-6">
            <img src="/login_logo.png" alt="Level Gaming" className="mx-auto w-[180px] h-[66px]" />
          </div>

          <h1 className="text-center text-2xl font-bold mb-4 font-bank mt-[41px] tracking-[0.08em]">LOG IN</h1>
          <p className="text-center text-sm text-white/60 mb-6 font-extralight">
            Don't have an account? <a href="/signup" className="text-blue-400 hover:underline">Sign up</a>
          </p>

          {errors.general && (
            <div className="mb-4 p-2 bg-red-900/50 text-red-300 text-sm rounded border border-red-700">
              {errors.general}
            </div>
          )}

          <div className="space-y-3 mb-4">
            <button type="button" onClick={() => handleSocialLogin('discord')} className="w-full py-2 bg-[#5865F2] hover:bg-[#4752c4] rounded-sm text-sm font-semibold flex items-center justify-center gap-2" disabled={isLoading}>
              LOG IN WITH DISCORD
            </button>
            <button type="button" onClick={() => handleSocialLogin('google')} className="w-full py-2 bg-[#DB4437] hover:bg-[#c23321] rounded-sm text-sm font-semibold flex items-center justify-center gap-2" disabled={isLoading}>
              LOG IN WITH GOOGLE
            </button>
          </div>

          <div className="flex items-center my-4">
            <hr className="flex-1 border-gray-600" />
            <span className="mx-3 text-xs text-gray-400">OR</span>
            <hr className="flex-1 border-gray-600" />
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm mb-1 text-white/80">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className={`w-full px-3 py-2 bg-transparent focus:border-[#65bdfc] focus:outline-none border ${errors.email ? 'border-red-500' : 'border-[#114369]'} rounded-sm text-sm placeholder-white/50`}
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="block text-sm mb-1 text-white/80">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full px-3 py-2 bg-transparent focus:border-[#65bdfc] focus:outline-none border ${errors.password ? 'border-red-500' : 'border-[#114369]'} rounded-sm text-sm placeholder-white/50`}
                disabled={isLoading}
              />
              {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="sr-only peer"
                  disabled={isLoading}
                />
                <div className="relative w-11 h-6 bg-transparent border border-gray-500 peer-focus:outline-none rounded-md peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-md after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                <span className="ml-3 text-sm text-white/80">Remember me</span>
              </label>
              <a href="/forgot-password" className="text-sm text-blue-400 hover:underline">Forgot password?</a>
            </div>

            <button type="submit" className="w-full py-2 rounded-sm text-sm font-semibold flex items-center justify-center gap-2" style={{ background: 'linear-gradient(to right, #65bdfc, #209cf5)' }} disabled={isLoading}>
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  LOGGING IN...
                </>
              ) : (
                'LOG IN'
              )}
            </button>
          </form>

          <p className="text-center text-xs text-white/40 mt-4">
            Can't log in? <a href="/support" className="text-blue-400 hover:underline">Contact support</a>
          </p>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;