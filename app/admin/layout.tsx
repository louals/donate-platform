"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account, databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";
import {
  Loader2,
  ShieldCheck,
  LayoutDashboard,
  Settings,
  LogOut,
  Bell,
  Search,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { t, isRTL, dir } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const authUser = await account.get();

        // Fetch user document to check the 'role' attribute
        const userDoc = await databases.getDocument(
          DATABASE_ID!,
          COLLECTIONS.USERS!,
          authUser.$id
        );

        const isPrivileged = userDoc.role === "admin";

        if (!isPrivileged) {
          toast.error("Access Denied: Admin only");
          router.push("/");
          return;
        }

        setAdmin(authUser);
        setLoading(false);
      } catch (error) {
        console.error("Admin check failed:", error);
        router.push("/auth/login");
      }
    };

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-[#1A2F23]" />
          <p className="animate-pulse text-sm font-medium tracking-[0.2em] text-slate-500 uppercase">
            Authenticating Shield...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex min-h-screen bg-[#F8FAFC] font-sans ${isRTL ? "text-right" : "text-left"}`}
      dir={dir}
    >
      {/* Sidebar */}
      <aside
        className={`fixed z-50 h-screen w-72 border-r border-white/5 bg-[#1A2F23] text-white shadow-2xl transition-all ${isRTL ? "right-0" : "left-0"}`}
      >
        <div className="flex h-full flex-col p-8">
          {/* Logo */}
          <div className="mb-12 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 shadow-inner">
              <ShieldCheck className="text-emerald-400" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tighter">Donate</h1>
              <p className="text-[10px] font-black tracking-[0.2em] text-emerald-400/60 uppercase">
                Management Hub
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            <Link
              href="/admin"
              className="flex items-center gap-4 rounded-2xl bg-white/10 px-5 py-4 font-bold text-white shadow-lg shadow-black/20 transition-all"
            >
              <LayoutDashboard size={20} className="text-emerald-400" />
              <span>{t.admin.tabs.pending}</span>
            </Link>

            <button className="group flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-bold text-white/40 transition-all hover:bg-white/5 hover:text-white">
              <Bell
                size={20}
                className="transition-colors group-hover:text-emerald-400"
              />
              <span>{t.admin.tabs.reported}</span>
            </button>

            <button className="group flex w-full items-center gap-4 rounded-2xl px-5 py-4 font-bold text-white/40 transition-all hover:bg-white/5 hover:text-white">
              <Settings
                size={20}
                className="transition-colors group-hover:text-emerald-400"
              />
              <span>Settings</span>
            </button>
          </nav>

          {/* User Profile Info */}
          <div className="mt-auto space-y-6 border-t border-white/5 pt-8">
            <div className="flex items-center gap-4 px-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/20 font-bold text-emerald-400 shadow-inner">
                {admin.name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{admin.name}</p>
                <p className="truncate text-[10px] text-white/30">
                  {admin.email}
                </p>
              </div>
            </div>

            <button
              onClick={() =>
                account.deleteSession("current").then(() => router.push("/"))
              }
              className="flex w-full items-center gap-3 rounded-xl px-5 py-3 text-xs font-black tracking-widest text-red-400 uppercase transition-all hover:bg-red-500/10"
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main
        className={`min-h-screen flex-1 transition-all ${isRTL ? "mr-72" : "ml-72"}`}
      >
        {/* Header Bar */}
        <header className="sticky top-0 z-40 flex h-24 items-center justify-between border-b border-slate-200/60 bg-white/80 px-10 backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-800">
              {t.admin.title}
            </h2>
            <p className="text-xs font-medium text-slate-400">
              {t.admin.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-8">
            <div className="relative hidden md:block">
              <Search
                className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-64 rounded-full border-none bg-slate-100 py-2.5 pr-6 pl-12 text-sm transition-all outline-none focus:ring-2 focus:ring-[#1A2F23]/10"
              />
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-10">{children}</div>
      </main>
    </div>
  );
}
