"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Check, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Locale, LOCALE_META } from "@/lib/i18n/translations";

const locales: Locale[] = ["en", "fr", "ar"];

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredLocale, setHoveredLocale] = useState<Locale | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]);

  const handleSelect = (newLocale: Locale) => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div ref={panelRef} className="relative">
      {/* ─── TRIGGER BUTTON ─── */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="group flex w-full cursor-pointer items-center gap-4 border-t border-gray-100 px-0 py-4 transition-all"
      >
        {/* Animated globe icon */}
        <motion.div
          className="relative flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#1A2F23] to-[#2d4a3a] shadow-md"
          animate={isOpen ? { rotate: 360 } : { rotate: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <Globe size={18} className="text-white" />
          {/* Orbiting dot */}
          <motion.div
            className="absolute h-2 w-2 rounded-full bg-[#D97706]"
            animate={
              isOpen
                ? {
                    rotate: [0, 360],
                  }
                : { rotate: 0 }
            }
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "center center", top: -1, right: -1 }}
          />
        </motion.div>

        <div className="flex-1 text-left">
          <p className="text-xs font-bold tracking-[0.2em] text-gray-400 uppercase">
            {t.language.title}
          </p>
          <div className="mt-0.5 flex items-center gap-2">
            <AnimatePresence mode="wait">
              <motion.span
                key={locale}
                initial={{ y: 8, opacity: 0, filter: "blur(4px)" }}
                animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
                exit={{ y: -8, opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 text-sm font-semibold text-[#222222]"
              >
                {LOCALE_META[locale].nativeName}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={16} className="text-gray-400" />
        </motion.div>
      </motion.button>

      {/* ─── DROPDOWN PANEL ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="absolute right-0 bottom-full left-0 z-50 mb-2"
          >
            <div className="overflow-hidden rounded-2xl border border-gray-200/60 bg-white/95 shadow-[0_20px_60px_rgba(0,0,0,0.15)] backdrop-blur-2xl">
              {/* Header */}
              <div className="px-5 pt-5 pb-3">
                <p className="text-[11px] font-bold tracking-[0.25em] text-gray-400 uppercase">
                  {t.language.switchLabel}
                </p>
              </div>

              {/* Language Options */}
              <div className="space-y-1 px-2 pb-3">
                {locales.map((loc, index) => {
                  const meta = LOCALE_META[loc];
                  const isActive = locale === loc;
                  const isHovered = hoveredLocale === loc;

                  return (
                    <motion.button
                      key={loc}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      onClick={() => handleSelect(loc)}
                      onMouseEnter={() => setHoveredLocale(loc)}
                      onMouseLeave={() => setHoveredLocale(null)}
                      className={`flex w-full cursor-pointer items-center gap-4 rounded-xl px-4 py-3.5 transition-all duration-200 ${
                        isActive
                          ? "bg-[#1A2F23] text-white shadow-lg"
                          : isHovered
                            ? "bg-gray-50"
                            : "bg-transparent"
                      } `}
                    >
                      {/* Label */}
                      <div
                        className={`flex-1 text-left ${meta.dir === "rtl" ? "font-sans" : ""}`}
                      >
                        <p
                          className={`text-sm font-bold ${isActive ? "text-white" : "text-[#222222]"}`}
                        >
                          {meta.nativeName}
                        </p>
                        <p
                          className={`text-[11px] ${isActive ? "text-white/60" : "text-gray-400"}`}
                        >
                          {meta.label}
                        </p>
                      </div>

                      {/* Check indicator */}
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25,
                          }}
                          className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20"
                        >
                          <Check size={14} className="text-white" />
                        </motion.div>
                      )}

                      {/* Hover arrow for non-active */}
                      {!isActive && isHovered && (
                        <motion.div
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="text-gray-400"
                        >
                          <ChevronRight size={14} />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Footer - RTL Indicator for Arabic */}
              <div className="border-t border-gray-100/80 px-5 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D97706]" />
                  <p className="text-[10px] font-medium text-gray-400">
                    {locale === "ar"
                      ? "الوضع من اليمين إلى اليسار مفعّل"
                      : locale === "fr"
                        ? "Direction automatique du texte"
                        : "Automatic text direction"}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
