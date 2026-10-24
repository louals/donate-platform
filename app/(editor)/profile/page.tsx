"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  account,
  databases,
  COLLECTIONS,
  DATABASE_ID,
  Query,
  storage,
  BUCKET_ID,
} from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Loader2,
  Edit2,
  Star,
  MapPin,
  LogOut,
  Heart,
  ShieldCheck,
  Check,
  Plus,
  MessageSquare,
  HandHeart,
  Sparkles,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import PostCard from "@/components/PostCard";
import ProfileEditForm from "@/components/profile/Profileeditform";
import LanguageSwitcher from "@/components/profile/LanguageSwitcher";
import { LanguageProvider, useLanguage } from "@/lib/i18n/LanguageContext";

interface UserProfile {
  $id: string;
  $createdAt: string;
  name: string;
  email: string;
  bio?: string;
  avatar?: string;
  location?: string;
}

function ProfileContent() {
  const router = useRouter();
  const { t, locale, dir, isRTL } = useLanguage();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    location: "",
    role: "",
  });

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const userData = await account.get();
      const typedUser = userData as UserProfile;
      setUser(typedUser);
      setFormData({
        name: typedUser.name || "",
        email: typedUser.email || "",
        bio: typedUser.bio || "",
        phone: "",
        location: typedUser.location || "",
        role: "",
      });
      fetchUserPosts(typedUser.$id);
    } catch {
      router.push("/auth/login");
    }
  };

  const fetchUserPosts = async (userId: string) => {
    try {
      const res = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTIONS.POSTS!,
        [Query.equal("userId", userId), Query.orderDesc("$createdAt")]
      );
      setPosts(res.documents);
    } catch (error) {
      toast.error(t.errors.loadError);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      router.push("/");
    } catch {
      toast.error(t.errors.logoutError);
    }
  };

  if (loading && !editing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#1A2F23]" />
      </div>
    );
  }

  if (!user) return null;

  // Animated text helper component
  const AnimatedText = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <AnimatePresence mode="wait">
      <motion.span
        key={`${locale}-${typeof children === "string" ? children.slice(0, 20) : "node"}`}
        initial={{ y: 6, opacity: 0, filter: "blur(3px)" }}
        animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
        exit={{ y: -6, opacity: 0, filter: "blur(3px)" }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={className}
      >
        {children}
      </motion.span>
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-white text-[#222222]" dir={dir}>
      {/* 1. MINIMAL NAV */}
      <header className="fixed top-0 right-0 left-0 z-50 h-20 border-b border-gray-100 bg-white">
        <div className="container mx-auto flex h-full items-center justify-between px-6 md:px-20">
          <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => router.push("/")}
          >
            <Image src="/logo.png" alt="Logo" width={32} height={32} />
            <span className="text-xl font-bold tracking-tighter text-[#1A2F23]">
              Donate
            </span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push("/posts/create")}
              className="hidden rounded-full px-4 py-2 text-sm font-semibold transition-all hover:bg-gray-50 md:block"
            >
              <AnimatedText>{t.hero.offerItem}</AnimatedText>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-7xl px-6 pt-32 pb-24 md:px-20">
        <div
          className={`flex flex-col gap-12 md:flex-row lg:gap-20 ${isRTL ? "md:flex-row-reverse" : ""}`}
        >
          {/* 2. LEFT COLUMN (The Solidarity Passport) */}
          <aside className="w-full shrink-0 md:w-[350px]">
            <div className="rounded-[2rem] border border-gray-200 bg-white p-8 shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-[#222222] shadow-sm">
                    {user.avatar ? (
                      <Image
                        src={storage
                          .getFilePreview(BUCKET_ID, user.avatar)
                          .toString()}
                        alt={user.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-white">
                        {user.name.charAt(0)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="absolute right-0 bottom-0 rounded-full border border-gray-200 bg-white p-2 shadow-md transition-all hover:scale-105"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <AnimatedText className="mt-1 text-sm font-medium">
                  {t.profile.role}
                </AnimatedText>
              </div>

              <div className="mt-8 space-y-4">
                <div
                  className={`flex items-center justify-between border-b border-gray-100 pb-4 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <HandHeart size={16} className="text-[#D97706]" />
                    <AnimatedText className="text-sm font-light">
                      {t.sidebar.itemsDonated}
                    </AnimatedText>
                  </div>
                  <span className="font-bold">{posts.length}</span>
                </div>
                <div
                  className={`flex items-center justify-between border-b border-gray-100 pb-4 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <Sparkles size={16} className="text-[#D97706]" />
                    <AnimatedText className="text-sm font-light">
                      {t.sidebar.impact}
                    </AnimatedText>
                  </div>
                  <span className="font-bold">450 pts</span>
                </div>
                <div
                  className={`flex items-center justify-between pb-2 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <Globe size={16} className="text-[#D97706]" />
                    <AnimatedText className="text-sm font-light">
                      {t.sidebar.communityLabel}
                    </AnimatedText>
                  </div>
                  <AnimatedText className="font-bold">
                    {t.sidebar.communityValue}
                  </AnimatedText>
                </div>
              </div>

              {/* ─── LANGUAGE SWITCHER ─── */}
              <div className="mt-4">
                <LanguageSwitcher />
              </div>
            </div>

            {/* Impact Links */}
            <div className="mt-8 hidden rounded-3xl border border-gray-200 p-6 md:block">
              <AnimatedText className="mb-6 block text-lg font-bold">
                {t.impactLinks.title}
              </AnimatedText>
              <div className="space-y-5">
                {(
                  [
                    { icon: MessageSquare, label: t.impactLinks.helpMessages },
                    {
                      icon: ShieldCheck,
                      label: t.impactLinks.verifiedIdentity,
                    },
                    { icon: Heart, label: t.impactLinks.favorites },
                  ] as const
                ).map((item, i) => (
                  <div
                    key={i}
                    className={`group flex cursor-pointer items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <item.icon
                      size={20}
                      className="text-gray-400 group-hover:text-[#1A2F23]"
                    />
                    <AnimatedText className="border-b border-transparent text-sm font-light group-hover:border-[#1A2F23]">
                      {item.label}
                    </AnimatedText>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* 3. RIGHT COLUMN (Your Journey) */}
          <div className="flex-1">
            {editing ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 max-w-xl duration-500">
                <div
                  className={`mb-10 flex items-center gap-4 ${isRTL ? "flex-row-reverse" : ""}`}
                >
                  <Button
                    variant="ghost"
                    onClick={() => setEditing(false)}
                    className="h-10 w-10 rounded-full p-0 hover:bg-gray-100"
                  >
                    <ArrowLeft
                      size={18}
                      className={isRTL ? "rotate-180" : ""}
                    />
                  </Button>
                  <AnimatedText className="text-3xl font-bold">
                    {t.editForm.title}
                  </AnimatedText>
                </div>
                <ProfileEditForm
                  formData={formData}
                  setFormData={setFormData}
                  onSave={() => setEditing(false)}
                  onCancel={() => setEditing(false)}
                  loading={loading}
                />
              </div>
            ) : (
              <div className="space-y-16">
                {/* Intro Section */}
                <section>
                  <AnimatedText className="mb-4 block text-3xl font-bold">
                    {t.profile.about}
                  </AnimatedText>
                  <p
                    className={`mb-6 text-xl leading-relaxed font-light text-[#717171] ${isRTL ? "text-right" : ""}`}
                  >
                    <AnimatedText>
                      {user.bio || t.profile.bioPlaceholder}
                    </AnimatedText>
                  </p>
                  <button
                    onClick={() => setEditing(true)}
                    className="text-sm font-bold underline decoration-1 underline-offset-4"
                  >
                    <AnimatedText>{t.profile.editBio}</AnimatedText>
                  </button>
                </section>

                <hr className="border-gray-100" />

                {/* Personal Items */}
                <section>
                  <div
                    className={`mb-8 flex items-center justify-between ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <AnimatedText className="text-2xl font-bold tracking-tight">
                      {t.profile.yourShares}
                    </AnimatedText>
                    <button
                      onClick={() => router.push("/posts/create")}
                      className={`flex items-center gap-2 text-sm font-bold underline decoration-1 underline-offset-4 ${isRTL ? "flex-row-reverse" : ""}`}
                    >
                      <Plus size={16} />{" "}
                      <AnimatedText>{t.profile.addItem}</AnimatedText>
                    </button>
                  </div>

                  {posts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-x-6 gap-y-12 sm:grid-cols-2">
                      {posts.map((post, idx) => {
                        const formattedPost = {
                          ...post,
                          images: post.image
                            ? [
                              storage
                                .getFilePreview(BUCKET_ID, post.image)
                                .toString(),
                            ]
                            : [],
                        };
                        return (
                          <PostCard
                            key={post.$id}
                            post={formattedPost}
                            index={idx}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-[2.5rem] border border-dashed border-gray-200 bg-[#F9F9F9] py-24 text-center">
                      <AnimatedText className="text-lg font-light text-gray-400">
                        {t.profile.emptyTitle}
                      </AnimatedText>
                      <Button
                        onClick={() => router.push("/posts/create")}
                        className="mt-6 rounded-xl bg-[#1A2F23] px-10 py-6 font-bold text-white transition-colors hover:bg-[#254232]"
                      >
                        <AnimatedText>{t.profile.emptyAction}</AnimatedText>
                      </Button>
                    </div>
                  )}
                </section>

                <hr className="border-gray-100" />

                {/* Account Actions */}
                <div
                  className={`flex flex-col gap-6 ${isRTL ? "items-end" : ""}`}
                >
                  <button
                    onClick={handleLogout}
                    className="w-fit text-sm font-bold text-red-600 underline decoration-1 underline-offset-4"
                  >
                    <AnimatedText>{t.profile.logout}</AnimatedText>
                  </button>
                  <div className="flex items-center gap-2 opacity-30">
                    <Image src="/logo.png" alt="logo" width={16} height={16} />
                    <AnimatedText className="text-[10px] font-black tracking-[0.3em] uppercase">
                      {t.profile.community}
                    </AnimatedText>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function MyProfilePage() {
  return <ProfileContent />;
}
