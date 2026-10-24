"use client";
import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Globe, Mail } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";

export default function PremiumFooter() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="overflow-hidden bg-white px-6 pt-24 pb-12">
      <div className="mx-auto max-w-7xl">
        {/* Top Section: The Visionary Contact Bar */}
        <div className="mb-24 flex flex-col items-start justify-between gap-12 lg:flex-row lg:items-end">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-6xl leading-[0.85] font-black tracking-tighter text-[#1A2F23] md:text-8xl"
            >
              {t.footer.titleLine1} <br />
              <span className="text-[#D97706]">{t.footer.titleLine2}</span>
            </motion.h2>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="group relative w-full overflow-hidden rounded-[2.5rem] bg-[#1A2F23] p-8 lg:w-96"
          >
            <div className="relative z-10 flex flex-col gap-4">
              <p className="font-medium text-white/50">
                {t.footer.contactQuestion}
              </p>
              <a
                href="mailto:hello@Donate.dz"
                className="flex items-center gap-2 text-2xl font-bold text-white transition-colors group-hover:text-[#D97706]"
              >
                {t.footer.contactCTA} <ArrowUpRight className="h-6 w-6" />
              </a>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 transition-opacity group-hover:opacity-20">
              <Mail size={120} className="text-white" />
            </div>
          </motion.div>
        </div>

        {/* Bottom Section: Legal & Fine Print */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-gray-100 pt-8 md:flex-row">
          <div className="flex items-center gap-6 text-sm font-bold text-gray-400">
            <span className="text-[#1A2F23]">© {currentYear} Donate</span>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info(t.singlePost.comingSoon);
              }}
              className="hover:text-[#1A2F23]"
            >
              {t.footer.privacy}
            </a>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                toast.info(t.singlePost.comingSoon);
              }}
              className="hover:text-[#1A2F23]"
            >
              {t.footer.legal}
            </a>
          </div>

          <div className="flex items-center gap-2 rounded-full bg-gray-50 px-4 py-2">
            <Globe size={14} className="text-gray-400" />
            <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">
              Algiers, DZ
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
