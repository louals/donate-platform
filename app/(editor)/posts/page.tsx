"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { databases, COLLECTIONS, DATABASE_ID, Query } from "@/lib/appwrite";
import PostCard from "@/components/PostCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  List,
  LayoutGrid,
  X,
  Plus,
  Loader2,
  PackageSearch,
  ChevronDown,
  SlidersHorizontal,
  Heart,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ALGERIAN_WILAYAS } from "@/lib/constants";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function PostsListingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useLanguage();
  const categoryParam = searchParams.get("category");

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState(categoryParam || "all");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [activeWilaya, setActiveWilaya] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);

  // Sync searchQuery with URL param if it changes
  useEffect(() => {
    const search = searchParams.get("search");
    if (search !== null) {
      setSearchQuery(search);
    }
  }, [searchParams]);

  /**
   * Fetch only "active" posts from Appwrite.
   */
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const queries = [
        Query.equal("status", "active"),
        Query.orderDesc("$createdAt"),
        Query.limit(50),
      ];

      if (activeCategory !== "all") {
        queries.push(Query.equal("category", activeCategory));
      }

      const response = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTIONS.POSTS!,
        queries
      );
      setPosts(response.documents);
    } catch (error: any) {
      console.error("Appwrite fetch error:", error);
      toast.error(t.posts.fetchError);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [activeCategory]);

  /**
   * Client-side search and wilaya filtering logic
   */
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      // Search logic (Title, Description, or Location match)
      const searchTarget =
        `${post.title} ${post.location} ${post.description}`.toLowerCase();
      const matchesSearch = searchTarget.includes(searchQuery.toLowerCase());

      // Wilaya logic (Case-insensitive check in location string)
      const matchesWilaya =
        !activeWilaya ||
        (post.location &&
          post.location.toLowerCase().includes(activeWilaya.toLowerCase()));

      return matchesSearch && matchesWilaya;
    });
  }, [posts, searchQuery, activeWilaya]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50/50">
      {/* HERO HEADER */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#1A2F23] via-[#1e3527] to-[#1A2F23]">
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="pt-20 pb-16 sm:pt-24 sm:pb-20 lg:pt-32 lg:pb-24">
            <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end lg:gap-12">
              {/* Left: Brand & Title */}
              <div className="max-w-3xl space-y-6 lg:space-y-8">
                {/* Back Button */}
                <motion.button
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => router.back()}
                  className="group mb-6 flex items-center gap-2 text-white/60 transition-colors hover:text-white"
                >
                  <ChevronDown
                    className="rotate-90 transition-transform group-hover:-translate-x-1"
                    size={20}
                  />
                  <span className="font-medium">{t.posts.back}</span>
                </motion.button>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm font-bold text-white shadow-xl backdrop-blur-xl"
                >
                  <Heart size={18} className="animate-pulse text-[#D97706]" />
                  <span>{t.posts.badge}</span>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <h1 className="text-4xl leading-[1.1] font-black tracking-tighter text-white sm:text-5xl md:text-6xl lg:text-7xl">
                    {t.posts.title}
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-2xl text-lg leading-relaxed text-slate-300 sm:text-xl lg:text-2xl"
                >
                  {t.posts.subtitle}
                </motion.p>
              </div>

              {/* Right: Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center lg:flex-col lg:items-end"
              >
                {/* View Mode Toggle - Desktop */}
                <div className="hidden rounded-2xl border border-white/20 bg-white/10 p-1.5 shadow-xl backdrop-blur-xl lg:flex">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={cn(
                      "h-12 rounded-xl px-5 font-bold transition-all",
                      viewMode === "grid"
                        ? "bg-white text-[#1A2F23] shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <LayoutGrid size={20} className="mr-2" /> {t.posts.grid}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "h-12 rounded-xl px-5 font-bold transition-all",
                      viewMode === "list"
                        ? "bg-white text-[#1A2F23] shadow-lg"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    <List size={20} className="mr-2" /> {t.posts.list}
                  </Button>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={() => router.push("/posts/create")}
                  className="h-14 rounded-2xl border-2 border-[#f59e0b]/30 bg-[#D97706] px-8 text-base font-bold text-white shadow-2xl shadow-orange-900/30 transition-all hover:scale-105 hover:bg-[#b46305] active:scale-95 sm:h-16 sm:text-lg"
                >
                  <Plus size={22} className="mr-2 stroke-[3px]" />{" "}
                  {t.posts.publish}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute right-0 bottom-0 left-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="h-auto w-full"
          >
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="rgb(248, 250, 252)"
            />
          </svg>
        </div>
      </header>

      <main className="relative z-20 container mx-auto -mt-4 px-4 pb-20 sm:-mt-8 sm:px-6 sm:pb-32 lg:px-8">
        {/* SEARCH & FILTER CONSOLE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="sticky top-4 z-40 mb-12 rounded-3xl border-2 border-slate-200/60 bg-white p-4 shadow-2xl shadow-slate-900/5 backdrop-blur-xl sm:top-6 sm:mb-16 sm:p-5 lg:top-8 lg:rounded-[2.5rem] lg:p-6"
        >
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400 sm:left-5"
                  size={20}
                />
                <Input
                  placeholder={t.posts.searchPlaceholder}
                  className="h-14 rounded-2xl border-2 border-slate-200/60 bg-slate-50/50 pr-12 pl-12 text-base font-medium transition-all placeholder:text-slate-400 focus:border-[#1A2F23] focus:bg-white focus:ring-4 focus:ring-[#1A2F23]/5 sm:h-16 sm:rounded-3xl sm:pl-14 sm:text-lg"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <AnimatePresence>
                  {searchQuery && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      onClick={() => setSearchQuery("")}
                      className="absolute top-1/2 right-4 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition-all hover:bg-red-50 hover:text-red-500 sm:right-5"
                    >
                      <X size={18} />
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Mobile View Mode Toggle */}
            <div className="flex rounded-2xl border border-slate-200/60 bg-slate-50/50 p-1.5 lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-11 flex-1 rounded-xl font-bold transition-all",
                  viewMode === "grid"
                    ? "bg-white text-[#1A2F23] shadow-sm"
                    : "text-slate-500 hover:text-[#1A2F23]"
                )}
              >
                <LayoutGrid size={18} className="mr-2" /> {t.posts.grid}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-11 flex-1 rounded-xl font-bold transition-all",
                  viewMode === "list"
                    ? "bg-white text-[#1A2F23] shadow-sm"
                    : "text-slate-500 hover:text-[#1A2F23]"
                )}
              >
                <List size={18} className="mr-2" /> {t.posts.list}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* CATEGORY TABS & CONTENT */}
        <Tabs
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="space-y-8 sm:space-y-12"
        >
          <div className="flex flex-col items-start justify-between gap-6 border-b-2 border-slate-200/60 pb-6 lg:flex-row lg:items-center">
            <TabsList className="h-auto w-full overflow-x-auto rounded-2xl bg-slate-100/80 p-1.5 sm:rounded-[1.5rem] lg:w-auto">
              <div className="flex min-w-max gap-1">
                <TabsTrigger
                  value="all"
                  className="rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#1A2F23] data-[state=active]:shadow-lg sm:rounded-2xl sm:px-8 sm:py-3 sm:text-base"
                >
                  {t.posts.tabAll}
                </TabsTrigger>
                <TabsTrigger
                  value="donate"
                  className="rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#1A2F23] data-[state=active]:shadow-lg sm:rounded-2xl sm:px-8 sm:py-3 sm:text-base"
                >
                  {t.posts.tabDonate}
                </TabsTrigger>
                <TabsTrigger
                  value="request"
                  className="rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#1A2F23] data-[state=active]:shadow-lg sm:rounded-2xl sm:px-8 sm:py-3 sm:text-base"
                >
                  {t.posts.tabRequest}
                </TabsTrigger>
                <TabsTrigger
                  value="volunteer"
                  className="rounded-xl px-4 py-2.5 text-sm font-bold whitespace-nowrap text-slate-500 transition-all data-[state=active]:bg-white data-[state=active]:text-[#1A2F23] data-[state=active]:shadow-lg sm:rounded-2xl sm:px-8 sm:py-3 sm:text-base"
                >
                  {t.posts.tabVolunteer}
                </TabsTrigger>
              </div>
            </TabsList>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3 text-sm font-medium sm:text-base"
            >
              <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-r from-slate-100 to-slate-50 px-4 py-2">
                <span className="text-slate-500">{t.posts.results}:</span>
                <span className="ml-2 font-black text-[#1A2F23]">
                  {filteredPosts.length}
                </span>
              </div>
            </motion.div>
          </div>

          <TabsContent
            value={activeCategory}
            className="mt-0 outline-none focus-visible:outline-none"
          >
            {loading ? (
              <div
                className={cn(
                  "grid gap-6 sm:gap-8",
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "mx-auto max-w-5xl grid-cols-1"
                )}
              >
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className={cn(
                      "space-y-4 rounded-3xl border-2 border-slate-100 bg-white p-4 sm:space-y-6 sm:p-5",
                      viewMode === "grid"
                        ? "h-[380px] sm:h-[420px]"
                        : "h-[200px]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-full animate-pulse rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 sm:rounded-3xl",
                        viewMode === "grid" ? "h-48 sm:h-56" : "h-full"
                      )}
                    />
                    <div className="space-y-3">
                      <div className="h-6 w-3/4 animate-pulse rounded-full bg-slate-100" />
                      <div className="h-4 w-full animate-pulse rounded-full bg-slate-100" />
                      <div className="h-4 w-5/6 animate-pulse rounded-full bg-slate-100" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredPosts.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className={cn(
                  "grid gap-6 sm:gap-8",
                  viewMode === "grid"
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "mx-auto max-w-5xl grid-cols-1"
                )}
              >
                {filteredPosts.map((post, index) => (
                  <PostCard
                    key={post.$id}
                    post={post}
                    layout={viewMode}
                    index={index}
                  />
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl border-2 border-slate-100 bg-white py-20 text-center shadow-sm sm:rounded-[4rem] sm:py-32"
              >
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100 text-[#1A2F23]/20 sm:mb-8 sm:h-28 sm:w-28 sm:rounded-[2.5rem]">
                  <PackageSearch
                    size={48}
                    className="sm:h-14 sm:w-14"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="mb-3 px-4 text-2xl font-black text-[#1A2F23] sm:mb-4 sm:text-3xl">
                  {t.posts.noResults}
                </h3>
                <p className="mx-auto mb-8 max-w-sm px-4 text-base leading-relaxed text-slate-500 sm:mb-10 sm:text-lg">
                  {t.posts.noResultsDesc}
                </p>
                <div className="flex flex-col items-center justify-center gap-4 px-4 sm:flex-row">
                  <Button
                    onClick={() => {
                      setActiveCategory("all");
                      setSearchQuery("");
                      setActiveWilaya(null);
                    }}
                    variant="outline"
                    className="h-12 w-full rounded-2xl border-2 border-slate-200 px-8 font-bold transition-all hover:bg-slate-50 sm:h-14 sm:w-auto sm:px-10"
                  >
                    {t.posts.reset}
                  </Button>
                  <Button
                    onClick={() => router.push("/posts/create")}
                    className="h-12 w-full rounded-2xl bg-[#D97706] px-8 font-bold text-white shadow-lg shadow-orange-900/10 transition-all hover:scale-105 hover:bg-[#b46305] sm:h-14 sm:w-auto sm:px-10"
                  >
                    {t.posts.publish}
                  </Button>
                </div>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default function PostsListingPage() {
  const { t } = useLanguage();
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-[#1A2F23] to-[#2a4535]">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl border border-white/20 bg-white/10 backdrop-blur-xl sm:h-24 sm:w-24">
              <Loader2 className="animate-spin text-white" size={40} />
            </div>
            <p className="animate-pulse text-lg font-bold text-white sm:text-xl">
              {t.posts.loading}
            </p>
          </motion.div>
        </div>
      }
    >
      <PostsListingContent />
    </Suspense>
  );
}
