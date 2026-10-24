"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { databases, COLLECTIONS, DATABASE_ID, account } from "@/lib/appwrite";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Clock,
  User,
  Phone,
  MessageSquare,
  CheckCircle2,
  ChevronLeft,
  Share2,
  Heart,
  Loader2,
} from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function SinglePostPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t, locale } = useLanguage();
  const [post, setPost] = useState<any>(null);
  const [posterName, setPosterName] = useState<string>(
    t.singlePost.communityMember
  );
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const backPath = useMemo(() => "/posts", []);

  const fetchPost = async () => {
    try {
      const response = await databases.getDocument(
        DATABASE_ID!,
        COLLECTIONS.POSTS!,
        id as string
      );
      setPost(response);

      // Fetch user info if userId exists
      if (response.userId) {
        try {
          const userDoc = await databases.getDocument(
            DATABASE_ID!,
            COLLECTIONS.USERS!,
            response.userId
          );
          setPosterName(userDoc.name || t.singlePost.communityMember);
        } catch (userError) {
          console.log("Could not fetch user info:", userError);
        }
      }
    } catch (error) {
      console.error("Error fetching post:", error);
      toast.error(t.singlePost.postNotFound);
      router.push(backPath);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async () => {
    try {
      const user = await account.get();
      if (user.$id === post.userId) {
        return toast.error("You cannot message yourself.");
      }
      router.push(`/messages/${post.userId}?postId=${post.$id}`);
    } catch (error) {
      toast.error(t.createPost.toasts.loginRequired);
      router.push("/auth/login");
    }
  };

  const handleReport = async () => {
    try {
      const currentCount = post.reportCount || 0;
      const newCount = currentCount + 1;

      await databases.updateDocument(
        DATABASE_ID!,
        COLLECTIONS.POSTS!,
        id as string,
        {
          reportCount: newCount,
          status: newCount >= 5 ? "hidden" : post.status,
        }
      );

      toast.success(t.singlePost.reportSuccess);
      if (newCount >= 5) {
        router.push("/posts");
      }
    } catch (error) {
      console.error("Error reporting post:", error);
      toast.error("Error reporting. Please try again.");
    }
  };

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  // Update poster name fallback if language changes
  useEffect(() => {
    if (!post?.userId) {
      setPosterName(t.singlePost.communityMember);
    }
  }, [t.singlePost.communityMember, post]);

  if (loading) {
    return (
      <div className="min-vh-[70vh] flex flex-col items-center justify-center py-20">
        <Loader2 className="text-primary mb-4 h-10 w-10 animate-spin" />
        <p className="text-slate-500">{t.singlePost.loadingPost}</p>
      </div>
    );
  }

  if (!post) return null;

  const images =
    post.images && post.images.length > 0
      ? post.images
      : ["/placeholder-post.jpg"];

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "donate":
        return t.postCard.donate;
      case "request":
        return t.postCard.request;
      case "volunteer":
        return t.postCard.volunteer;
      default:
        return t.postCard.solidarity;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs / Back button */}
        <div className="mb-8 flex items-center justify-between">
          <Button
            variant="ghost"
            className="hover:text-primary pl-0 text-slate-500"
            onClick={() => router.back()}
          >
            <ChevronLeft size={20} className="mr-1" />
            {t.singlePost.backToResults}
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-slate-200"
            >
              <Share2 size={18} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-slate-200"
            >
              <Heart size={18} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Photos Column */}
          <div className="space-y-4 lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <Image
                src={images[activeImage]}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
              <Badge className="absolute top-6 left-6 px-4 py-2 text-sm font-bold tracking-wider uppercase shadow-lg">
                {getCategoryLabel(post.category)}
              </Badge>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={cn(
                    "aspect-square overflow-hidden rounded-2xl border-2 shadow-sm transition-all",
                    activeImage === idx
                      ? "border-primary scale-95 shadow-inner"
                      : "border-transparent hover:border-slate-200"
                  )}
                >
                  <div className="relative h-full w-full">
                    <Image
                      src={img}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 25vw, 10vw"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Details Column */}
          <div className="space-y-8 lg:col-span-5">
            {/* HIGH VISIBILITY ANTI-SCAM WARNING */}
            <div className="animate-pulse rounded-[2rem] border-2 border-red-100 bg-red-50 p-6 shadow-sm">
              <div className="mb-2 flex items-center gap-3 text-red-600">
                <span className="text-xl">🛑</span>
                <h4 className="text-lg font-black tracking-tighter uppercase">
                  {t.singlePost.scamWarningTitle}
                </h4>
              </div>
              <p className="text-sm leading-relaxed font-bold text-red-900/80">
                {t.singlePost.scamWarningDesc}
              </p>
            </div>

            <div className="space-y-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div>
                <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
                  <Clock size={16} />
                  <span>
                    {t.singlePost.published}{" "}
                    {formatRelativeDate(post.$createdAt, locale).toLowerCase()}
                  </span>
                  <span className="mx-2">•</span>
                  <MapPin size={16} />
                  <span>{post.location}</span>
                </div>
                <h1 className="text-3xl leading-tight font-bold text-slate-900 md:text-4xl">
                  {post.title}
                </h1>
              </div>

              <div className="space-y-4 border-y border-slate-100 py-6">
                <h3 className="font-bold text-slate-900">
                  {t.singlePost.description}
                </h3>
                <p className="leading-relaxed whitespace-pre-wrap text-slate-600">
                  {post.description}
                </p>
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full">
                    <User size={24} />
                  </div>
                  <div>
                    <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">
                      {t.singlePost.postedBy}
                    </p>
                    <p className="font-bold text-slate-900">{posterName}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 pt-4">
                <Button
                  onClick={handleContact}
                  className="shadow-primary/20 h-14 rounded-2xl text-lg font-bold shadow-lg"
                >
                  <MessageSquare className="mr-2" size={20} />
                  {t.singlePost.contactDonor}
                </Button>
                <Button
                  variant="outline"
                  className="h-14 rounded-2xl border-slate-200 text-lg font-medium hover:bg-slate-50"
                >
                  <Phone className="mr-2" size={20} />
                  {t.singlePost.showNumber}
                </Button>
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  variant="ghost"
                  className="w-full rounded-xl text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={() => toast.success(t.singlePost.comingSoon)}
                >
                  <CheckCircle2 className="mr-2" size={18} />
                  {t.singlePost.markCompleted}
                </Button>

                <button
                  onClick={handleReport}
                  className="flex w-full items-center justify-center gap-2 py-3 text-[10px] font-black tracking-[0.2em] text-slate-300 uppercase transition-colors hover:text-red-500"
                >
                  ⚠️ {t.singlePost.report}
                </button>
              </div>
            </div>

            {/* Safety Tips Card */}
            <div className="rounded-3xl border border-amber-100/50 bg-amber-50 p-6">
              <h4 className="mb-2 flex items-center font-bold text-amber-900">
                {t.singlePost.safetyTitle}
              </h4>
              <ul className="list-disc space-y-2 pl-4 text-sm text-amber-800/80">
                {t.singlePost.safetyTips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
