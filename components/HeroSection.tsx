"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Star, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

// The "Quiet Luxury" Transition
const transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

const fadeVariants = {
  initial: { opacity: 0, y: 5 },
  animate: { opacity: 1, y: 0, transition },
  exit: { opacity: 0, y: -5, transition: { duration: 0.2 } },
};

export default function Hero() {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchOpen, setSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
  }, [searchOpen]);

  return (
    <section className="relative flex min-h-screen w-full flex-col bg-white p-3 pt-24 md:p-6 md:pt-28">
      <div className="relative mx-auto flex w-full max-w-[1600px] flex-1 items-center justify-center overflow-hidden rounded-[2.5rem] bg-[#1A2F23] shadow-2xl md:rounded-[3.5rem]">
        {/* Background Patterns */}
        <motion.div
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.08] grayscale invert"
        >
          <Image
            src="/zelij-bg.jpg"
            alt="Pattern"
            fill
            className="object-cover"
            priority
          />
        </motion.div>

        <div className="relative z-10 w-full max-w-5xl px-6 py-12 text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 flex flex-col items-center gap-3"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5 fill-[#D97706] text-[#D97706]"
                />
              ))}
            </div>
            <p className="text-[10px] font-black tracking-[0.4em] text-white/60 uppercase">
              {t.hero.badge}
            </p>
          </motion.div>

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 text-4xl leading-[0.9] font-bold tracking-tighter text-white sm:text-6xl md:text-8xl"
          >
            {t.hero.titleLine1}
            <br />
            <span className="font-extralight text-white/70 italic">
              {t.hero.titleLine2}
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto mb-10 max-w-2xl px-4 text-base leading-relaxed font-light text-white/50 md:text-xl"
          >
            {t.hero.subtitle}
          </motion.p>

          {/* Minimalist Search Bar */}
          <div className="mb-12 flex justify-center">
            <div className="relative flex h-[60px] min-w-[300px] items-center justify-center rounded-full border border-white/10 bg-white/5 shadow-inner backdrop-blur-xl transition-all duration-500 hover:border-white/20 sm:min-w-[440px]">
              <AnimatePresence mode="wait">
                {!searchOpen ? (
                  <motion.button
                    key="search-trigger"
                    variants={fadeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    onClick={() => setSearchOpen(true)}
                    className="flex w-full items-center justify-center gap-3 px-8 text-white/80 transition-colors hover:text-white"
                  >
                    <Search className="h-4 w-4 opacity-60" />
                    <span className="text-sm font-light tracking-wide">
                      {t.hero.searchTrigger}
                    </span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="search-input"
                    variants={fadeVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    className="flex w-full items-center px-6"
                  >
                    <Search className="mr-3 h-4 w-4 text-white/40" />
                    <input
                      autoFocus
                      ref={inputRef}
                      placeholder={t.hero.searchPlaceholder}
                      className="w-full bg-transparent text-base font-light text-white placeholder-white/20 outline-none"
                      onBlur={() => setSearchOpen(false)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          router.push(`/posts?search=${e.currentTarget.value}`);
                        }
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              onClick={() => router.push("/posts")}
              className="h-14 rounded-full bg-white px-10 font-bold text-[#1A2F23] shadow-xl transition-transform hover:scale-[1.02] hover:bg-white/90"
            >
              {t.hero.exploreDonations}
            </Button>

            <Button
              variant="outline"
              onClick={() => router.push("/posts/create")}
              className="h-14 rounded-full border-white/20 bg-transparent px-10 font-medium text-white transition-transform hover:scale-[1.02] hover:bg-white hover:text-[#1A2F23]"
            >
              {t.hero.offerItem}
            </Button>
          </div>
        </div>
      </div>

      {/* Rest of your sub-footer remains the same... */}
    </section>
  );
}
