"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { account, OAuthProvider } from "@/lib/appwrite";
import {
  Heart,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.get();
        router.push("/");
      } catch {
        // not logged in
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await account.createEmailPasswordSession(email, password);
      toast.success(t.auth.login.successToast || "Welcome back!");
      router.push("/");
      router.refresh();
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || t.auth.login.errorToast || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F3F1] p-4 md:p-8">
      {/* MAIN CONTAINER: Mimics your Hero Card styling */}
      <div className="relative flex min-h-[700px] w-full max-w-[1200px] flex-col overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#1A2F23] shadow-2xl lg:flex-row">
        {/* THE HERO PATTERN LAYER (Syncs with your Hero component) */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.07] grayscale invert">
          <Image
            src="/zelij-bg.jpg"
            alt="Pattern"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* LEFT SIDE: THE ACTION BOX (The Geometric Cut) */}
        <div
          className="relative z-20 flex w-full flex-col justify-center bg-white p-8 md:p-16 lg:w-[45%]"
          style={{ clipPath: "polygon(0 0, 100% 0, 85% 100%, 0% 100%)" }}
        >
          <div className="max-w-[340px]">
            <header className="mb-10">
              <div className="mb-6 flex items-center gap-2">
                <Heart className="fill-[#D97706] text-[#D97706]" size={24} />
                <span className="text-2xl font-black tracking-tighter text-[#1A2F23]">
                  Donate
                </span>
              </div>
              <h1 className="mb-2 text-4xl leading-tight font-black text-[#1A2F23]">
                {t.auth.login.title}
              </h1>
              <p className="text-sm font-medium text-slate-400">
                {t.auth.login.subtitle}
              </p>
            </header>

            {/* Google Priority - Matches your Hero's button styling */}
            <button
              onClick={() =>
                account.createOAuth2Session(
                  OAuthProvider.Google,
                  `${window.location.origin}/`,
                  `${window.location.origin}/auth/login`
                )
              }
              className="group mb-8 flex h-14 w-full items-center gap-4 rounded-xl border-2 border-slate-100 px-6 transition-all hover:border-[#D97706]"
            >
              <Image
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                width={20}
                height={20}
                alt="Google"
              />
              <span className="text-sm font-bold text-slate-700">
                {t.auth.login.google}
              </span>
            </button>

            <div className="relative mb-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
                {t.auth.login.orEmail}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <Mail
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.auth.login.emailPlaceholder}
                  className="h-14 w-full rounded-xl border-none bg-slate-50 pr-6 pl-12 font-medium text-slate-900 transition-all focus:ring-2 focus:ring-[#D97706]/20"
                />
              </div>
              <div className="relative">
                <Lock
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-300"
                  size={18}
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.auth.login.passwordPlaceholder}
                  className="h-14 w-full rounded-xl border-none bg-slate-50 pr-6 pl-12 font-medium text-slate-900 transition-all focus:ring-2 focus:ring-[#D97706]/20"
                />
              </div>
              <button
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#D97706] font-bold text-white shadow-lg shadow-orange-900/20 transition-all hover:bg-[#B45309] disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    {t.auth.login.submit} <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="mt-10 text-xs font-medium text-slate-400">
              {t.auth.login.noAccount}{" "}
              <Link
                href="/auth/register"
                className="font-bold text-[#D97706] hover:underline"
              >
                {t.auth.login.createAccount}
              </Link>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: BRAND STORY (The Hero-like Content) */}
        <div className="relative flex flex-1 flex-col justify-between overflow-hidden p-12 text-white lg:p-20">
          {/* Subtle light burst from your Hero */}
          <div className="pointer-events-none absolute top-1/2 left-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-white/5 to-transparent blur-[120px]" />

          <div className="relative z-10 flex flex-col items-start gap-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Sparkles
                  key={i}
                  className="h-4 w-4 fill-[#D97706] text-[#D97706]"
                />
              ))}
            </div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">
              {t.auth.login.tagline}
            </p>
          </div>

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 text-5xl leading-[1.1] font-bold lg:text-7xl"
            >
              {t.auth.login.heroLine1}
              <br />
              <span className="font-light text-white/60 italic">
                {t.auth.login.heroLine2}
              </span>
            </motion.h2>
            <div className="flex items-center gap-4 text-white/40">
              <ShieldCheck size={24} className="text-[#D97706]" />
              <p className="max-w-xs text-sm leading-relaxed font-light">
                {t.auth.login.heroDesc}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between border-t border-white/5 pt-8">
            <p className="text-[10px] font-black tracking-widest text-white/20 uppercase">
              {t.auth.login.project58}
            </p>
            <div className="h-px w-8 bg-white/20" />
            <p className="text-[10px] font-black tracking-widest text-white/20 uppercase">
              {t.auth.login.madeWith}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
