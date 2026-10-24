"use client";

import React, { useEffect, useState } from "react";
import {
  account,
  databases,
  DATABASE_ID,
  COLLECTIONS,
  Query,
} from "@/lib/appwrite";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { User as UserIcon, Search, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { formatRelativeDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Conversation {
  userId: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  postId?: string;
  unreadCount: number;
}

export function ChatSidebar({ className }: { className?: string }) {
  const { t, locale } = useLanguage();
  const { id: activeId } = useParams();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const authUser = await account.get();

        // Fetch messages where user is either sender or receiver
        const sentMessages = await databases.listDocuments(
          DATABASE_ID!,
          COLLECTIONS.MESSAGES!,
          [Query.equal("senderId", authUser.$id), Query.orderDesc("$createdAt")]
        );

        const receivedMessages = await databases.listDocuments(
          DATABASE_ID!,
          COLLECTIONS.MESSAGES!,
          [
            Query.equal("receiverId", authUser.$id),
            Query.orderDesc("$createdAt"),
          ]
        );

        const allMessages = [
          ...sentMessages.documents,
          ...receivedMessages.documents,
        ].sort(
          (a, b) =>
            new Date(b.$createdAt).getTime() - new Date(a.$createdAt).getTime()
        );

        const conversationMap = new Map<string, Conversation>();

        for (const msg of allMessages) {
          const otherUserId =
            msg.senderId === authUser.$id ? msg.receiverId : msg.senderId;

          if (!conversationMap.has(otherUserId)) {
            let otherUserName = "Community Member";
            try {
              const otherUserDoc = await databases.getDocument(
                DATABASE_ID!,
                COLLECTIONS.USERS!,
                otherUserId
              );
              otherUserName = otherUserDoc.name;
            } catch (err) {}

            conversationMap.set(otherUserId, {
              userId: otherUserId,
              userName: otherUserName,
              lastMessage: msg.text,
              timestamp: msg.$createdAt,
              postId: msg.postId,
              unreadCount:
                msg.receiverId === authUser.$id && !msg.isRead ? 1 : 0,
            });
          } else if (msg.receiverId === authUser.$id && !msg.isRead) {
            const existing = conversationMap.get(otherUserId)!;
            existing.unreadCount += 1;
          }
        }

        setConversations(Array.from(conversationMap.values()));
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={cn(
        "hidden min-h-0 w-80 flex-col overflow-hidden border-r border-slate-100 bg-white md:flex lg:w-96",
        className
      )}
    >
      <div className="border-b border-slate-50 p-6 pb-4">
        <h1 className="mb-4 text-2xl font-black text-slate-900">
          {t.chat.title}
        </h1>
        <div className="relative">
          <Search
            className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
            size={16}
          />
          <input
            type="text"
            placeholder="Search conversations..."
            className="focus:ring-primary/20 w-full rounded-xl border-none bg-slate-50 py-2 pr-4 pl-10 text-sm transition-all outline-none focus:ring-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="custom-scrollbar flex-1 space-y-1 overflow-x-hidden overflow-y-auto p-2">
        {loading ? (
          Array(5)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex animate-pulse gap-3 p-4">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-100" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                  <div className="h-3 w-3/4 rounded bg-slate-50" />
                </div>
              </div>
            ))
        ) : filteredConversations.length > 0 ? (
          filteredConversations.map((conv) => (
            <Link
              key={conv.userId}
              href={`/messages/${conv.userId}${conv.postId ? `?postId=${conv.postId}` : ""}`}
              className={cn(
                "group relative flex items-center gap-4 rounded-2xl p-4 transition-all duration-300",
                activeId === conv.userId
                  ? "border border-emerald-100/50 bg-emerald-50 text-emerald-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              )}
            >
              <div className="relative shrink-0">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-all duration-300",
                    activeId === conv.userId
                      ? "bg-emerald-600 text-white shadow-emerald-200"
                      : "bg-slate-100 text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500"
                  )}
                >
                  <UserIcon size={20} />
                </div>
                {conv.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-lg border-[3px] border-white bg-emerald-500 text-[10px] font-black text-white">
                    {conv.unreadCount}
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center justify-between">
                  <h3
                    className={cn(
                      "truncate pr-2 font-bold transition-colors",
                      activeId === conv.userId
                        ? "text-emerald-700"
                        : "text-slate-900 group-hover:text-emerald-600"
                    )}
                  >
                    {conv.userName}
                  </h3>
                  <span className="text-[9px] font-bold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                    {formatRelativeDate(conv.timestamp, locale)}
                  </span>
                </div>
                <p
                  className={cn(
                    "line-clamp-1 truncate text-xs",
                    conv.unreadCount > 0 && activeId !== conv.userId
                      ? "font-extrabold text-slate-900"
                      : "font-medium text-slate-500 opacity-80"
                  )}
                >
                  {conv.lastMessage}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="mt-10 flex flex-col items-center justify-center p-8 text-center opacity-40">
            <MessageSquare size={32} className="mb-2 text-emerald-600/50" />
            <p className="text-sm font-bold text-slate-600">
              {t.chat.noMessages}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
