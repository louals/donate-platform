"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  account,
  databases,
  DATABASE_ID,
  COLLECTIONS,
  Query,
  ID,
  client,
} from "@/lib/appwrite";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Loader2,
  Send,
  ChevronLeft,
  ShieldAlert,
  User as UserIcon,
  Package,
  Info,
  MoreVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatRelativeDate } from "@/lib/utils";
import { toast } from "sonner";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { cn } from "@/lib/utils";

export default function ChatRoomPage() {
  const { id: receiverId } = useParams();
  const searchParams = useSearchParams();
  const postId = searchParams.get("postId");
  const router = useRouter();
  const { t, locale, isRTL } = useLanguage();

  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [post, setPost] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      try {
        const authUser = await account.get();
        setCurrentUser(authUser);

        // Fetch other user safely
        try {
          const otherUserDoc = await databases.getDocument(
            DATABASE_ID!,
            COLLECTIONS.USERS!,
            receiverId as string
          );
          setOtherUser(otherUserDoc);
        } catch (err) {
          console.log("Other user doc not found, using default.");
          setOtherUser({ name: "Community Member" });
        }

        // Fetch post safely if exists
        if (postId) {
          try {
            const postDoc = await databases.getDocument(
              DATABASE_ID!,
              COLLECTIONS.POSTS!,
              postId
            );
            setPost(postDoc);
          } catch (err) {
            console.log("Post context not found.");
          }
        }

        // Safety Check
        if (!COLLECTIONS.MESSAGES) {
          console.error(
            "CRITICAL: MESSAGES Collection ID is missing in env variables."
          );
          toast.error("Messenger configuration missing.");
          return setLoading(false);
        }

        // Fetch existing messages
        const response = await databases.listDocuments(
          DATABASE_ID!,
          COLLECTIONS.MESSAGES,
          [
            Query.or([
              Query.and([
                Query.equal("senderId", authUser.$id),
                Query.equal("receiverId", receiverId as string),
              ]),
              Query.and([
                Query.equal("senderId", receiverId as string),
                Query.equal("receiverId", authUser.$id),
              ]),
            ]),
            Query.orderAsc("$createdAt"),
            Query.limit(100),
          ]
        );
        setMessages(response.documents);

        // Mark received messages as read
        const unread = response.documents.filter(
          (m) => m.receiverId === authUser.$id && !m.isRead
        );
        for (const m of unread) {
          await databases.updateDocument(
            DATABASE_ID!,
            COLLECTIONS.MESSAGES!,
            m.$id,
            { isRead: true }
          );
        }

        setTimeout(() => scrollToBottom("auto"), 100);
      } catch (error) {
        console.error("Chat init error:", error);
        toast.error("Could not load chat.");
      } finally {
        setLoading(false);
      }
    };

    initChat();

    // Appwrite Realtime Subscription
    const unsubscribe = client.subscribe(
      `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`,
      (response: any) => {
        if (
          response.events.includes(
            "databases.*.collections.*.documents.*.create"
          )
        ) {
          const payload = response.payload as any;
          if (
            (payload.senderId === currentUser?.$id &&
              payload.receiverId === receiverId) ||
            (payload.senderId === receiverId &&
              payload.receiverId === currentUser?.$id)
          ) {
            setMessages((prev) => [...prev, payload]);
            if (payload.receiverId === currentUser?.$id) {
              databases.updateDocument(
                DATABASE_ID!,
                COLLECTIONS.MESSAGES!,
                payload.$id,
                { isRead: true }
              );
            }
          }
        }
      }
    );

    return () => unsubscribe();
  }, [receiverId, postId, currentUser?.$id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const textToSend = inputText.trim();
    setInputText("");
    setSending(true);

    try {
      await databases.createDocument(
        DATABASE_ID!,
        COLLECTIONS.MESSAGES!,
        ID.unique(),
        {
          senderId: currentUser.$id,
          receiverId: receiverId as string,
          text: textToSend,
          postId: postId || null,
          isRead: false,
        }
      );
    } catch (error) {
      toast.error("Failed to send message.");
      setInputText(textToSend); // Restore if failed
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-white">
        <div className="relative">
          <div className="bg-primary/10 h-16 w-16 animate-pulse rounded-3xl" />
          <Loader2
            className="text-primary absolute inset-0 m-auto animate-spin"
            size={24}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50/30">
      <ChatSidebar />

      <main className="relative flex h-full min-w-0 flex-1 flex-col border-l border-slate-100 bg-white shadow-2xl md:shadow-none">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-100 bg-white/80 px-6 py-4 backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={() => router.push("/messages")}
              className="-ml-2 rounded-xl p-2 text-slate-400 hover:bg-slate-50 md:hidden"
            >
              <ChevronLeft size={24} />
            </button>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <UserIcon size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="truncate leading-tight font-black text-slate-900">
                {otherUser?.name || "Member"}
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 animate-pulse rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <p className="text-[10px] font-extrabold tracking-wider text-emerald-600 uppercase">
                  {t.chat.online}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {post && (
              <button
                onClick={() => router.push(`/posts/${post.$id}`)}
                className="hidden items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-emerald-700 transition-all hover:bg-emerald-100 sm:flex"
              >
                <Package size={14} strokeWidth={2.5} />
                <span className="text-[10px] font-black tracking-widest uppercase">
                  {t.chat.details}
                </span>
              </button>
            )}
            <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-50">
              <MoreVertical size={20} />
            </button>
          </div>
        </header>

        {/* Messages Body */}
        <div className="custom-scrollbar flex flex-1 flex-col space-y-8 overflow-y-auto bg-slate-50/30 px-6 py-8">
          {/* Safety Notice */}
          <div className="mb-4 flex justify-center">
            <div className="flex max-w-md gap-3 rounded-2xl border border-yellow-100 bg-yellow-50/50 p-4 text-center">
              <ShieldAlert
                size={16}
                className="mt-0.5 shrink-0 text-yellow-600"
              />
              <p className="text-[10px] leading-relaxed font-bold tracking-tight text-yellow-800 uppercase">
                {t.chat.scamWarning}
              </p>
            </div>
          </div>

          {messages.length === 0 ? (
            <div className="mb-20 flex flex-1 flex-col items-center justify-center px-10 text-center opacity-30">
              <div className="mb-6 flex h-24 w-24 rotate-12 items-center justify-center rounded-[2.5rem] bg-slate-100 transition-transform duration-500 hover:rotate-0">
                <Send size={32} className="mt-1 -ml-1 text-slate-400" />
              </div>
              <h3 className="mb-2 text-xl font-black text-slate-900">
                {t.chat.noMessages}
              </h3>
              <p className="max-w-xs text-sm font-medium">{t.chat.subtitle}</p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUser.$id;
                const showTime =
                  idx === 0 ||
                  new Date(messages[idx - 1].$createdAt).getTime() <
                    new Date(msg.$createdAt).getTime() - 1000 * 60 * 30;

                return (
                  <React.Fragment key={msg.$id}>
                    {showTime && (
                      <div className="my-8 flex justify-center">
                        <span className="rounded-full border border-slate-50 bg-white px-3 py-1 text-[9px] font-black tracking-[0.2em] text-slate-300 uppercase shadow-sm">
                          {formatRelativeDate(msg.$createdAt, locale)}
                        </span>
                      </div>
                    )}
                    <div
                      className={cn(
                        "group flex w-full transition-all duration-300",
                        isMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "flex max-w-[85%] items-end gap-2 lg:max-w-[70%]",
                          isMe ? "flex-row-reverse" : "flex-row"
                        )}
                      >
                        {!isMe && (
                          <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-slate-400 shadow-sm">
                            <UserIcon size={12} />
                          </div>
                        )}

                        <div className="flex flex-col gap-1">
                          <div
                            className={cn(
                              "relative rounded-[1.75rem] px-5 py-3.5 text-sm font-medium shadow-sm transition-all duration-300 hover:shadow-md",
                              isMe
                                ? "rounded-br-none bg-emerald-600 text-white shadow-emerald-100"
                                : "rounded-bl-none border border-slate-200/60 bg-white text-slate-800"
                            )}
                          >
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          )}
          <div ref={messagesEndRef} className="pt-4" />
        </div>

        {/* Input Area */}
        <div className="sticky bottom-0 z-30 border-t border-slate-100 bg-white p-4 md:p-6">
          <form
            onSubmit={handleSendMessage}
            className="mx-auto flex max-w-5xl gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={t.chat.placeholder}
                className="w-full rounded-[1.5rem] border-2 border-transparent bg-slate-100 px-6 py-4 text-sm font-medium transition-all outline-none hover:bg-slate-200/40 focus:border-emerald-500/20 focus:bg-white"
              />
            </div>
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition-all hover:scale-105 hover:bg-emerald-700 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:hover:scale-100"
            >
              {sending ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <Send size={20} className="mt-0.5 -ml-0.5" />
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
