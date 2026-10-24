"use client";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart } from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useState, memo, useMemo } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface PostCardProps {
  post: {
    $id: string;
    title: string;
    description: string;
    category: string;
    location: string;
    images: string[];
    $createdAt: string;
  };
  layout?: "grid" | "list";
  index?: number;
}

function PostCard({ post, layout = "grid", index = 0 }: PostCardProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const { t, locale } = useLanguage();
  const isList = layout === "list";

  const mainImage = useMemo(() => {
    if (post.images?.[0] && post.images[0].startsWith("http")) {
      return post.images[0];
    }
    return "/logo.png";
  }, [post.images]);

  const categoryStyles: Record<string, any> = {
    donate: {
      bg: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
      label: t.postCard.donate,
    },
    request: {
      bg: "bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
      label: t.postCard.request,
    },
    volunteer: {
      bg: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
      label: t.postCard.volunteer,
    },
  };

  const style = categoryStyles[post.category?.toLowerCase()] ?? {
    bg: "bg-slate-50 text-slate-600",
    dot: "bg-slate-400",
    label: post.category || t.postCard.solidarity,
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <Link href={`/posts/${post.$id}`} className="block h-full">
        <Card
          className={cn(
            "flex overflow-hidden rounded-[2rem] border border-slate-200/60 bg-white transition-all duration-300 hover:shadow-xl",
            isList ? "h-auto flex-col md:h-64 md:flex-row" : "h-full flex-col"
          )}
        >
          {/* Image Section */}
          <div
            className={cn(
              "relative shrink-0 overflow-hidden bg-slate-100",
              isList ? "aspect-[4/3] md:aspect-square md:w-64" : "aspect-[4/3]"
            )}
          >
            <Image
              src={mainImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />

            <Badge
              className={cn(
                "absolute top-4 left-4 flex items-center gap-1.5 border px-3 py-1.5 text-[10px] font-black uppercase backdrop-blur-xl",
                style.bg
              )}
            >
              <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} />
              {style.label}
            </Badge>

            <button
              onClick={(e) => {
                e.preventDefault();
                setIsFavorited(!isFavorited);
              }}
              className="group absolute top-4 right-4 rounded-2xl bg-white/90 p-2.5 shadow-sm backdrop-blur"
            >
              <Heart
                size={16}
                className={cn(
                  isFavorited
                    ? "fill-red-500 text-red-500"
                    : "text-slate-400 group-hover:text-red-400"
                )}
              />
            </button>
          </div>

          {/* Content Section */}
          <div className="flex min-w-0 flex-1 flex-col">
            <CardContent className={cn("p-5", isList && "md:p-8")}>
              <div className="mb-2 flex items-start justify-between gap-4">
                <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-[#1A2F23] uppercase sm:text-xl">
                  {post.title}
                </h3>
              </div>
              <p
                className={cn(
                  "font-medium text-slate-500",
                  isList
                    ? "line-clamp-3 text-base md:line-clamp-4"
                    : "line-clamp-2 text-sm"
                )}
              >
                {post.description}
              </p>
            </CardContent>

            <CardFooter
              className={cn(
                "mt-auto flex items-center justify-between border-t border-slate-50 bg-slate-50/50 px-5 py-4 text-[10px] font-black tracking-widest text-slate-400 uppercase",
                isList && "md:px-8"
              )}
            >
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-[#D97706]" />
                <span className="max-w-[150px] truncate">{post.location}</span>
              </div>
              <div className="flex items-center gap-4">
                <span>{formatRelativeDate(post.$createdAt, locale)}</span>
              </div>
            </CardFooter>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

export default memo(PostCard);
