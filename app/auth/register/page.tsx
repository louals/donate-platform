"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  account,
  databases,
  COLLECTIONS,
  DATABASE_ID,
  ID,
  OAuthProvider,
} from "@/lib/appwrite";
import { motion } from "framer-motion";
import {
  Heart,
  Loader2,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await account.create(
        ID.unique(),
        formData.email,
        formData.password,
        formData.name
      );

      await account.createEmailPasswordSession(
        formData.email,
        formData.password
      );

      await databases.createDocument(
        DATABASE_ID!,
        COLLECTIONS.USERS!,
        user.$id,
        {
          name: formData.name,
          email: formData.email,
          role: "user",
          Score: 10,
        }
      );

      await account.createVerification(`${window.location.origin}/auth/verify`);

      toast.success(t.auth.register.welcomeToast);
      router.push("/auth/verify-notice");
    } catch (error: any) {
      toast.error(error.message || t.auth.register.registerError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F3F3F1] p-4 md:p-8">
      <div className="relative flex min-h-[750px] w-full max-w-[1200px] flex-col overflow-hidden rounded-[2.5rem] border border-white/5 bg-[#1A2F23] shadow-2xl lg:flex-row">
        {/* PATTERN */}
        <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.07] grayscale invert">
          <Image
            src="/zelij-bg.jpg"
            alt="Pattern"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* LEFT – BRAND STORY */}
        <div className="relative order-2 flex flex-1 flex-col justify-between overflow-hidden p-12 text-white lg:order-1 lg:p-20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent blur-[120px]" />

          <div className="relative z-10 flex flex-col gap-4">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Sparkles
                  key={i}
                  className="h-4 w-4 fill-[#D97706] text-[#D97706]"
                />
              ))}
            </div>
            <p className="text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase">
              {t.auth.register.joinMovement}
            </p>
          </div>

          <div className="relative z-10">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 text-5xl leading-[1.1] font-bold lg:text-7xl"
            >
              {t.auth.register.heroLine1}
              <br />
              <span className="font-light text-white/60 italic">
                {t.auth.register.heroLine2}
              </span>
            </motion.h2>

            <div className="flex items-center gap-4 text-white/40">
              <ShieldCheck size={24} className="text-[#D97706]" />
              <p className="max-w-xs text-sm leading-relaxed font-light">
                {t.auth.register.heroDesc}
              </p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-2 text-xs font-black tracking-widest text-white/20 uppercase">
            <span>{t.auth.register.solidarity58}</span>
            <div className="h-px w-8 bg-white/10" />
            <Heart size={12} className="text-[#D97706]" />
          </div>
        </div>

        {/* RIGHT – FORM */}
        <div
          className="relative z-20 order-1 flex w-full flex-col justify-center bg-white p-8 md:p-16 lg:order-2 lg:w-[48%]"
          style={{
            clipPath: "polygon(15% 0, 100% 0, 100% 100%, 0% 100%)",
          }}
        >
          {/* 🔥 FIXED WIDTH CONTAINER */}
          <div className="mx-auto w-full max-w-[380px] pl-2">
            <header className="mb-10">
              <div className="mb-6 flex items-center gap-2">
                <Heart className="fill-[#D97706] text-[#D97706]" size={24} />
                <span className="text-2xl font-black tracking-tighter text-[#1A2F23]">
                  Donate
                </span>
              </div>
              <h1 className="mb-2 text-3xl font-black text-[#1A2F23]">
                {t.auth.register.title}
              </h1>
              <p className="text-sm font-medium text-slate-400">
                {t.auth.register.subtitle}
              </p>
            </header>

            <form onSubmit={handleRegister} className="space-y-4">
              <Input
                icon={<UserIcon size={18} />}
                placeholder={t.auth.register.namePlaceholder}
                value={formData.name}
                onChange={(e: { target: { value: any } }) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />

              <Input
                icon={<Mail size={18} />}
                type="email"
                placeholder={t.auth.register.emailPlaceholder}
                value={formData.email}
                onChange={(e: { target: { value: any } }) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />

              <Input
                icon={<Lock size={18} />}
                type="password"
                placeholder={t.auth.register.passwordPlaceholder}
                value={formData.password}
                onChange={(e: { target: { value: any } }) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />

              <button
                disabled={loading}
                className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-[#1A2F23] font-bold text-white shadow-lg shadow-emerald-900/10 transition-all hover:bg-[#254232]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    {t.auth.register.submit}
                    <ArrowRight size={18} className="text-[#D97706]" />
                  </>
                )}
              </button>
            </form>

            <div className="relative my-8 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-100" />
              <span className="text-[10px] font-black tracking-widest text-slate-300 uppercase">
                {t.auth.register.orFast}
              </span>
              <div className="h-px flex-1 bg-slate-100" />
            </div>

            <button
              type="button"
              onClick={() =>
                account.createOAuth2Session(
                  OAuthProvider.Google,
                  `${window.location.origin}/`,
                  `${window.location.origin}/auth/register`
                )
              }
              className="flex h-14 w-full items-center gap-4 rounded-xl border-2 border-slate-100 px-6 transition-all hover:border-[#1A2F23]"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                className="h-5 w-5"
                alt="Google"
              />
              <span className="text-sm font-bold text-slate-700">
                {t.auth.register.google}
              </span>
            </button>

            <p className="mt-8 text-center text-xs font-medium text-slate-400">
              {t.auth.register.hasAccount}{" "}
              <Link
                href="/auth/login"
                className="font-bold text-[#D97706] hover:underline"
              >
                {t.auth.register.loginLink}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 🔹 Small helper */
function Input({ icon, ...props }: any) {
  return (
    <div className="relative">
      <span className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-300">
        {icon}
      </span>
      <input
        {...props}
        required
        className="h-14 w-full rounded-xl border-none bg-slate-50 pr-6 pl-12 font-medium text-slate-900 transition-all focus:ring-2 focus:ring-[#D97706]/20"
      />
    </div>
  );
}
