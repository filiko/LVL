"use client";

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { toast } from 'react-toastify';

const SocialCallbackPage = () => {
  const router = useRouter();
  const hasRun = useRef(false);
  const [backendUrl, setBackendUrl] = useState<string | null>(null);
  const [customSignUp, setCustomSignUp] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);



  useEffect(() => {
    setCustomSignUp(localStorage.getItem("customSignUp") === "true");
  }, []);

  useEffect(() => {
    if(customSignUp && backendUrl){
      setAccessToken(localStorage.getItem('access_token'));
      router.push("/home");
      setCustomSignUp(false)
    }
  }, [customSignUp, backendUrl, router])

  useEffect(() => {
    const fetchBackendUrl = async () => {
      try {
        const res = await fetch('/api/my-wrapper');
        const data = await res.json();
        if (!data.BACKEND_URL) throw new Error("Missing BACKEND_URL in config");
        setBackendUrl(data.BACKEND_URL);
      } catch (error) {
        console.error("Failed to fetch backend config:", error);
        toast.error("Could not load signup config");
      }
    };

    fetchBackendUrl();
  }, []);

  useEffect(() => {
    if (!backendUrl || hasRun.current || customSignUp) return;

    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const access_token = params.get("access_token");
    const provider = "discord";

    if (!access_token) {
      toast.error("Missing access token");
      router.push("/login");
      return;
    }

    hasRun.current = true;

    axios.post(`${backendUrl}/api/auth/social/signup/`, {
      provider,
      access_token,
    })
      .then((response) => {
        const { tokens, user } = response.data;

        localStorage.setItem("access_token", tokens.access);
        localStorage.setItem("refresh_token", tokens.refresh);
        localStorage.setItem("user", JSON.stringify(user));

        setAccessToken(tokens.access);
        router.push("/home");
      })
      .catch((err) => {
        const detail = err?.response?.data?.detail;
        const message = Array.isArray(detail) ? detail[0] : detail;

        console.error("Signup error:", message || err);

        if (typeof message === "string" && message.includes("already exists")) {
          toast.info("Account exists. Redirecting to login...");
          router.push("/login");
        } else if (err?.response?.status === 400) {
          router.push("/login");
        } else {
          router.push("/signup");
        }
      });
  }, [backendUrl, router]);


  return (
    <main className="flex justify-center items-center w-full h-screen bg-gradient-to-b from-[#041529] font-bank to-[#0b1f39] text-white">
      <div className="text-center">
        <img src="/footer_logo.png" className="w-[200px] mx-auto" alt="Footer Logo" />
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mx-auto mt-16" />
        <p className="mt-4">Completing login...</p>
      </div>
    </main>
  );
};

export default SocialCallbackPage;