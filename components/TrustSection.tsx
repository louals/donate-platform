"use client";
import React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Zap, HandHeart } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Image from "next/image";
import { toast } from "sonner";

const ICONS = [HandHeart, Zap, ShieldCheck];

export default function TrustSection() {
  const { t } = useLanguage();

  return (
    <section className="w-full bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          {/* Left Side: Visual Proof */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-[3rem] shadow-2xl">
              <div className="relative h-[600px] w-full">
                <Image
                  src="/sharing.jpg"
                  alt="Community hand"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Decorative background element */}
            <div className="absolute -top-10 -left-10 -z-10 h-40 w-40 rounded-full bg-[#1A2F23]/5 blur-3xl" />
          </div>

          {/* Right Side: Features */}
          <div className="space-y-12">
            <div>
              <h2 className="mb-6 text-4xl font-bold tracking-tight text-[#1A2F23]">
                {t.trust.titleLine1} <br />
                <span className="text-[#D97706]">{t.trust.titleHighlight}</span>
                {t.trust.titleLine2}
              </h2>
              <p className="text-lg text-gray-500">{t.trust.subtitle}</p>
            </div>

            <div className="space-y-8">
              {t.trust.features.map((f, i) => {
                const Icon = ICONS[i];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group flex gap-6"
                  >
                    <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#F8F8F6] transition-colors duration-300 group-hover:bg-[#1A2F23]">
                      <Icon className="h-6 w-6 text-[#1A2F23] transition-colors group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="mb-1 text-lg font-bold text-[#1A2F23]">
                        {f.title}
                      </h4>
                      <p className="text-sm leading-relaxed text-gray-500">
                        {f.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="pt-6">
              <button
                onClick={() => toast.info(t.singlePost.comingSoon)}
                className="group flex items-center gap-4"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1A2F23] text-white transition-transform group-hover:scale-110">
                  →
                </div>
                <span className="font-bold text-[#1A2F23]">
                  {t.trust.ethicsLink}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
