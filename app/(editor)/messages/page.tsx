"use client";

import React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { MessageSquare, Send, Sparkles } from "lucide-react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";

export default function ConversationsPage() {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {/* Sidebar - Always visible on desktop, hidden on mobile in this specific page if we want the mobile list to be full screen */}
      {/* Wait, on mobile this page SHOULD show the list. The ChatSidebar component currently has `hidden md:flex`. */}
      {/* I need a mobile-friendly version of the sidebar or just use the same logic here for mobile. */}

      <ChatSidebar className="flex w-full md:w-80 lg:w-96" />

      {/* Main Content Area - Hidden on mobile, shows placeholder on desktop */}
      <main className="relative hidden flex-1 flex-col items-center justify-center overflow-hidden bg-slate-50/30 p-10 text-center md:flex">
        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 animate-pulse rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute right-1/4 bottom-1/4 h-64 w-64 animate-pulse rounded-full bg-emerald-500/10 blur-3xl delay-700" />

        <div className="relative z-10 max-w-sm">
          <div className="group mx-auto mb-8 flex h-24 w-24 rotate-6 items-center justify-center rounded-[2.5rem] bg-white shadow-2xl shadow-black/5 transition-transform duration-500 hover:rotate-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-100/50 transition-transform group-hover:scale-110">
              <MessageSquare className="text-emerald-600" size={32} />
            </div>
          </div>

          <h2 className="mb-4 text-3xl font-black tracking-tight text-slate-900">
            {t.chat.title}
          </h2>
          <p className="mb-8 leading-relaxed font-medium text-slate-500">
            {t.chat.subtitle}
          </p>

          <div className="flex cursor-default items-center justify-center gap-2 rounded-2xl border border-slate-100 bg-white px-6 py-3 text-xs font-bold tracking-widest text-emerald-600 uppercase shadow-sm transition-all hover:bg-emerald-50">
            <Send size={14} />
            <span>Select a conversation to start</span>
          </div>
        </div>
      </main>
    </div>
  );
}
