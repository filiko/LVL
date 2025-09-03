'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function LoginCallbackHandler() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [backendUrl, setBackendUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchBackendUrl = async () => {
      try {
        const res = await fetch('/api/my-wrapper');
        const data = await res.json();
        if (!data.BACKEND_URL) throw new Error("Missing BACKEND_URL");
        setBackendUrl(data.BACKEND_URL);
      } catch (error) {
        toast.error('Could not load backend configuration.');
        router.push('/login');
      }
    };

    fetchBackendUrl();
  }, [router]);

  useEffect(() => {
    const handleSocialLogin = async () => {
      if (!backendUrl) return;

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get('code');
      const provider = searchParams.get('provider');

      if (!code || !provider) {
        toast.error('Missing code or provider in the URL.');
        router.push('/login');
        return;
      }

      try {
        const res = await axios.post(`${backendUrl}/api/auth/social/login/`, {
          provider,
          code,
        });

        const { tokens, user } = res.data;
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        localStorage.setItem('user', JSON.stringify(user));

        toast.success('Login successful!');
        router.push('/home');
      } catch (err: any) {
        const errorMsg = axios.isAxiosError(err)
          ? err.response?.data?.error || err.response?.data?.detail || ''
          : '';

        if (errorMsg === 'not_registered' || err.response?.status === 400) {
          router.push('/signup');
        } else {
          toast.error('Social login failed. Please try again.');
          router.push('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    handleSocialLogin();
  }, [backendUrl, router]);

  return loading ? <LoadingScreen /> : null;
}

const LoadingScreen = () => (
  <main className="flex justify-center items-center w-full h-screen bg-gradient-to-b from-[#041529] to-[#0b1f39]">
    <div>
      <img src="/footer_logo.png" className="w-[200px]" alt="Logo" />
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mt-16" />
    </div>
  </main>
);