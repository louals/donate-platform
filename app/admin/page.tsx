"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  databases,
  DATABASE_ID,
  COLLECTIONS,
  Query,
  storage,
  BUCKET_ID,
} from "@/lib/appwrite";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Clock,
  MapPin,
  ExternalLink,
  PackageSearch,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toast } from "sonner";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, active: 0, reported: 0 });

  const fetchStats = async () => {
    try {
      const pendingRes = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTIONS.POSTS!,
        [Query.equal("status", "pending")]
      );
      const activeRes = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTIONS.POSTS!,
        [Query.equal("status", "active")]
      );
      const reportedRes = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTIONS.POSTS!,
        [Query.greaterThan("reportCount", 0)]
      );

      setStats({
        pending: pendingRes.total,
        active: activeRes.total,
        reported: reportedRes.total,
      });
    } catch (error) {
      console.error("Stats Fetch Error:", error);
    }
  };

  const fetchPendingPosts = async () => {
    setLoading(true);
    try {
      const response = await databases.listDocuments(
        DATABASE_ID!,
        COLLECTIONS.POSTS!,
        [Query.equal("status", "pending"), Query.orderDesc("$createdAt")]
      );
      setPosts(response.documents);
    } catch (error) {
      toast.error(t.admin.toasts.error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchPendingPosts();
  }, []);

  const handleAction = async (
    postId: string,
    action: "approve" | "reject" | "delete"
  ) => {
    try {
      if (action === "delete") {
        const post = posts.find((p) => p.$id === postId);
        // Also delete images from storage if possible (optional step)
        await databases.deleteDocument(
          DATABASE_ID!,
          COLLECTIONS.POSTS!,
          postId
        );
        toast.success(t.admin.toasts.deleted);
      } else {
        const newStatus = action === "approve" ? "active" : "hidden";
        await databases.updateDocument(
          DATABASE_ID!,
          COLLECTIONS.POSTS!,
          postId,
          {
            status: newStatus,
          }
        );
        toast.success(
          action === "approve"
            ? t.admin.toasts.approved
            : t.admin.toasts.rejected
        );
      }

      // Refresh
      setPosts((prev) => prev.filter((p) => p.$id !== postId));
      fetchStats();
    } catch (error) {
      toast.error(t.admin.toasts.error);
    }
  };

  return (
    <div className="space-y-12">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          {
            label: t.admin.stats.pending,
            value: stats.pending,
            icon: Clock,
            color: "bg-amber-50 text-amber-600 border-amber-100",
          },
          {
            label: t.admin.stats.active,
            value: stats.active,
            icon: CheckCircle2,
            color: "bg-emerald-50 text-emerald-600 border-emerald-100",
          },
          {
            label: t.admin.stats.reported,
            value: stats.reported,
            icon: AlertTriangle,
            color: "bg-red-50 text-red-600 border-red-100",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className={`rounded-[2.5rem] border-2 p-8 ${stat.color} shadow-sm transition-transform duration-300 hover:scale-[1.02]`}
          >
            <div className="mb-2 flex items-center justify-between">
              <stat.icon size={24} />
              <span className="text-3xl font-black">{stat.value}</span>
            </div>
            <p className="text-xs font-black tracking-[0.2em] uppercase opacity-60">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Main Moderation Queue */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-3 text-xl font-bold text-slate-800">
            <PackageSearch className="text-[#1A2F23]" />
            {t.admin.tabs.pending}
          </h3>
          <span className="rounded-full bg-slate-100 px-4 py-1.5 text-[10px] font-black tracking-widest text-slate-500 uppercase">
            {posts.length} Items Awaiting
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-[2.5rem] bg-slate-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <AnimatePresence mode="popLayout">
              {posts.length > 0 ? (
                posts.map((post) => (
                  <motion.div
                    key={post.$id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group flex overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white transition-all duration-500 hover:shadow-2xl hover:shadow-black/5"
                  >
                    {/* Image Section */}
                    <div className="relative aspect-square w-1/3 overflow-hidden border-r border-slate-100 bg-slate-50">
                      <Image
                        src={post.images?.[0] || "/placeholder-post.jpg"}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(max-width: 1280px) 33vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-1 flex-col p-8">
                      <div className="flex-1 space-y-3">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black tracking-wider text-[#1A2F23] uppercase">
                            {post.category}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            #{post.$id.slice(-6)}
                          </span>
                        </div>
                        <h4 className="line-clamp-1 text-xl font-bold text-slate-800">
                          {post.title}
                        </h4>
                        <p className="line-clamp-2 text-sm leading-relaxed font-light text-slate-500">
                          {post.description}
                        </p>

                        <div className="flex items-center gap-4 pt-2 text-[11px] font-medium text-slate-400">
                          <span className="flex items-center gap-1.5">
                            <MapPin size={12} className="text-emerald-500" />{" "}
                            {post.location?.split(",")[0]}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={12} className="text-amber-500" />{" "}
                            {new Date(post.$createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-6">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAction(post.$id, "approve")}
                            className="h-10 rounded-xl bg-emerald-500 px-4 text-xs font-bold shadow-lg shadow-emerald-500/20 hover:bg-emerald-600"
                          >
                            <CheckCircle2 className="mr-2" size={16} />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction(post.$id, "reject")}
                            className="h-10 rounded-xl px-4 text-xs font-bold text-amber-600 hover:bg-amber-50"
                          >
                            <XCircle className="mr-2" size={16} />
                            Reject
                          </Button>
                        </div>

                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleAction(post.$id, "delete")}
                          className="rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-32 text-center opacity-40">
                  <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
                    <CheckCircle2 size={40} className="text-emerald-400" />
                  </div>
                  <h4 className="text-2xl font-black tracking-tight text-slate-800">
                    {t.admin.empty}
                  </h4>
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    All community requests have been processed.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
