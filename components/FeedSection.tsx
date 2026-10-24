"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, PackageSearch, Clock } from "lucide-react";
import { databases, COLLECTIONS, DATABASE_ID, Query } from "@/lib/appwrite";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import { ALGERIAN_WILAYAS } from "@/lib/constants";

const wilayasList = [
  "Alger",
  "Oran",
  "Constantine",
  "S\u00e9tif",
  "Batna",
  "Annaba",
  "Blida",
  "Tlemcen",
];

// --- SUB-COMPONENT FOR THE INDIVIDUAL CARD ---
function FeedCard({ item, router }: { item: any; router: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = item.images || [];

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -1 }}
      className="group cursor-pointer"
      onClick={() => router.push(`/posts/${item.$id}`)}
    >
      <div className="relative mb-4 aspect-[4/5] overflow-hidden rounded-[2rem] border border-gray-100 bg-gray-100 shadow-sm">
        <Image
          src={images[currentIndex] || "/placeholder-item.jpg"}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 25vw, 20vw"
        />

        {images.length > 1 && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3 opacity-0 transition-all duration-300 ease-in-out group-hover:opacity-100">
            <button
              onClick={prevImage}
              disabled={currentIndex === 0}
              className={`pointer-events-auto cursor-pointer rounded-full border border-gray-200/50 bg-white/90 p-2 text-gray-800 shadow-sm transition-all hover:scale-105 hover:bg-white hover:shadow-md active:scale-95 ${currentIndex === 0 ? "cursor-default opacity-0" : "opacity-100"} `}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
            </button>

            <button
              onClick={nextImage}
              disabled={currentIndex === images.length - 1}
              className={`pointer-events-auto cursor-pointer rounded-full border border-gray-200/50 bg-white/90 p-2 text-gray-800 shadow-sm transition-all hover:scale-105 hover:bg-white hover:shadow-md active:scale-95 ${currentIndex === images.length - 1 ? "cursor-default opacity-0" : "opacity-100"} `}
            >
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute right-0 bottom-4 left-0 flex justify-center gap-1.5">
            {images.map((_: any, idx: number) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? "w-1.5 bg-white" : "w-1.5 bg-white/50"
                  }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-2">
        <h3 className="mb-1 line-clamp-1 text-lg font-bold text-[#222222] transition-colors group-hover:text-[#D97706]">
          {item.title}
        </h3>
        <div className="mt-2 flex items-center gap-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">
          <Clock size={10} />
          {new Date(item.$createdAt).toLocaleDateString()}
        </div>
      </div>
    </motion.div>
  );
}

// --- MAIN FEED COMPONENT ---
export default function InventoryFeed() {
  const router = useRouter();
  const { t } = useLanguage();

  const allWilayasLabel = t.feed.allWilayas;
  const wilayas = useMemo(
    () => [allWilayasLabel, ...wilayasList],
    [allWilayasLabel]
  );

  const [activeWilaya, setActiveWilaya] = useState<string>(allWilayasLabel);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Update active wilaya if the translated "All" label changes
  useEffect(() => {
    setActiveWilaya(allWilayasLabel);
  }, [allWilayasLabel]);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      setLoading(true);
      try {
        const queries = [
          Query.equal("status", "active"),
          Query.orderDesc("$createdAt"),
          Query.limit(4),
        ];

        if (activeWilaya !== allWilayasLabel) {
          // Robust check: use contains query for better DB search
          queries.push(Query.contains("location", activeWilaya));
        }

        const response = await databases.listDocuments(
          DATABASE_ID!,
          COLLECTIONS.POSTS!,
          queries
        );
        setPosts(response.documents);
      } catch (error) {
        console.error("Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, [activeWilaya, allWilayasLabel]);

  return (
    <section className="w-full bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Wilaya Filters */}
        <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="no-scrollbar flex w-full items-center gap-3 overflow-x-auto pb-2 md:w-auto">
            {wilayas.map((wilaya) => (
              <button
                key={wilaya}
                onClick={() => setActiveWilaya(wilaya)}
                className={`rounded-full px-6 py-2 text-sm font-bold whitespace-nowrap transition-all ${activeWilaya === wilaya
                    ? "bg-[#1A2F23] text-white shadow-lg shadow-black/10"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                {wilaya}
              </button>
            ))}
          </div>
          <button
            onClick={() => router.push("/posts")}
            className="text-sm font-bold text-[#1A2F23] underline underline-offset-4"
          >
            {t.feed.viewAll}
          </button>
        </div>

        {/* The Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="mb-4 aspect-[4/5] rounded-[2rem] bg-gray-100" />
                <div className="h-4 w-2/3 rounded bg-gray-100" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {posts.length > 0 ? (
                posts.map((item) => (
                  <FeedCard key={item.$id} item={item} router={router} />
                ))
              ) : (
                <div className="col-span-full rounded-[3rem] border-2 border-dashed border-gray-100 py-24 text-center">
                  <PackageSearch
                    className="mx-auto mb-4 text-gray-200"
                    size={50}
                  />
                  <p className="text-lg font-light text-gray-400 italic">
                    {t.feed.emptyFeed}
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
