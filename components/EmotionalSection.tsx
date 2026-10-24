"use client";
import React from "react";
import { motion } from "framer-motion";
import { Heart, Baby, GraduationCap, Home, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useRouter } from "next/navigation";
import Image from "next/image";

const ICONS = [Baby, Home, GraduationCap];
const IMAGES = [
  "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&q=80",
];

export default function EmotionalSection() {
  const { t } = useLanguage();
  const router = useRouter();

  return (
    <section className="w-full bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header - More Poetic */}
        <div className="mb-16 max-w-3xl space-y-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-xs font-bold tracking-widest text-[#D97706] uppercase"
          >
            <Heart className="h-4 w-4 fill-[#D97706]" />
            <span>{t.emotional.badge}</span>
          </motion.div>

          <h2 className="text-4xl leading-[1.1] font-bold tracking-tight text-[#1A2F23] md:text-6xl">
            {t.emotional.titleLine1} <br />
            <span className="font-light text-[#1A2F23]/60 italic underline decoration-[#D97706]/30">
              {t.emotional.titleLine2}
            </span>
          </h2>
          <p className="max-w-xl pt-4 text-lg leading-relaxed text-gray-600">
            {t.emotional.subtitle}
          </p>
        </div>

        {/* Story Cards */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {t.emotional.stories.map((item, idx) => {
            const Icon = ICONS[idx];
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="group relative h-[500px] overflow-hidden rounded-[2.5rem] bg-white shadow-xl transition-all duration-500 hover:shadow-2xl"
              >
                {/* Image Layer */}
                <div className="absolute inset-0">
                  <Image
                    src={IMAGES[idx]}
                    alt={item.title}
                    fill
                    className="object-cover grayscale-[20%] transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A2F23] via-[#1A2F23]/40 to-transparent" />
                </div>

                {/* Content Layer */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                  <div className="mb-4">
                    <span className="rounded-full bg-[#D97706] px-3 py-1 text-[10px] font-bold tracking-widest uppercase">
                      {item.tag}
                    </span>
                  </div>

                  <div className="mb-2 flex items-center gap-3">
                    <Icon className="h-6 w-6 text-[#D97706]" />
                    <h3 className="text-2xl font-bold">{item.title}</h3>
                  </div>

                  <p className="mb-6 translate-y-4 transform text-sm leading-relaxed text-white/80 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    {item.desc}
                  </p>

                  <button
                    onClick={() => router.push("/posts/create")}
                    className="group/btn flex items-center gap-2 text-sm font-bold"
                  >
                    {t.emotional.cta}{" "}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-2" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Emotional Quote / Call to Action */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-20 flex flex-col items-center justify-between gap-8 border-t border-gray-200 pt-12 md:flex-row"
        >
          <div className="flex items-center gap-4">{/* Comment */}</div>
          <button
            onClick={() => router.push("/auth/register")}
            className="rounded-full bg-[#1A2F23] px-10 py-4 font-bold text-white shadow-lg transition-all hover:bg-[#D97706]"
          >
            {t.emotional.joinCommunity}
          </button>
        </motion.div>
      </div>
    </section>
  );
}
