"use client";
import React, { useState, useEffect } from "react";
import {
    motion,
    AnimatePresence,
    useScroll,
    useMotionValueEvent,
} from "framer-motion";
import {
    Plus,
    User,
    LogOut,
    ChevronDown,
    Home,
    Search,
    Heart,
    Sparkles,
    Bell,
    ShieldCheck,
    MessageCircle,
    MoreHorizontal,
} from "lucide-react";
import Link from "next/link";
import {
    account,
    databases,
    DATABASE_ID,
    COLLECTIONS,
    Query,
    client,
} from "@/lib/appwrite";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { scrollY } = useScroll();
    const { t } = useLanguage();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isHidden, setIsHidden] = useState(false);
    const [hoveredLink, setHoveredLink] = useState<string | null>(null);
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const navLinks = [
        { name: t.navbar.explore, href: "/posts", icon: Search },
        { name: t.createPost.title, href: "/posts/create", icon: Plus },
    ];

    useEffect(() => {
        const checkUser = async () => {
            try {
                const authData = await account.get();
                try {
                    const userDoc = await databases.getDocument(
                        DATABASE_ID!,
                        COLLECTIONS.USERS!,
                        authData.$id
                    );
                    setUser({ ...authData, ...userDoc });
                } catch (dbError) {
                    console.error("User doc fetch error:", dbError);
                    setUser(authData);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkUser();
    }, []);

    useEffect(() => {
        if (!user?.$id) return;

        const fetchUnreadCount = async () => {
            try {
                const response = await databases.listDocuments(
                    DATABASE_ID!,
                    COLLECTIONS.MESSAGES!,
                    [Query.equal("receiverId", user.$id), Query.equal("isRead", false)]
                );
                setUnreadCount(response.total);
            } catch (err) {
                console.error("Unread count fetch error:", err);
            }
        };

        fetchUnreadCount();

        const unsubscribe = client.subscribe(
            `databases.${DATABASE_ID}.collections.${COLLECTIONS.MESSAGES}.documents`,
            (response: any) => {
                if (response.events.some((e: string) => e.includes(".create"))) {
                    const payload = response.payload as any;
                    if (payload.receiverId === user.$id) {
                        setUnreadCount((prev) => prev + 1);
                    }
                }
                if (response.events.some((e: string) => e.includes(".update"))) {
                    const payload = response.payload as any;
                    if (payload.receiverId === user.$id) {
                        // Re-fetch to be accurate as one update might mark multiple
                        fetchUnreadCount();
                    }
                }
            }
        );

        return () => unsubscribe();
    }, [user?.$id]);

    const handleLogout = async () => {
        try {
            await account.deleteSession("current");
            setUser(null);
            toast.success(t.navbar.logoutSuccess);
            router.push("/");
        } catch (error) {
            toast.error(t.navbar.logoutError);
        }
    };

    useMotionValueEvent(scrollY, "change", (latest) => {
        const previous = scrollY.getPrevious() ?? 0;
        if (latest > previous && latest > 150) setIsHidden(true);
        else setIsHidden(false);
        setIsScrolled(latest > 50);
    });

    return (
        <>
            {/* TOP DESKTOP NAVBAR */}
            <motion.header
                variants={{
                    visible: { y: 0, opacity: 1 },
                    hidden: { y: -100, opacity: 0 },
                }}
                animate={isHidden ? "hidden" : "visible"}
                transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="pointer-events-none fixed top-0 z-[100] flex w-full justify-center px-4 pt-4 md:pt-6"
            >
                <motion.div
                    layout
                    className={`pointer-events-auto flex w-full max-w-6xl items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 ease-out ${isScrolled || isHidden
                            ? "border border-white/40 bg-white/80 shadow-[0_8px_32px_rgba(0,0,0,0.08)] backdrop-blur-2xl"
                            : "border border-white/20 bg-white/50 backdrop-blur-md"
                        } `}
                >
                    {/* BRAND - Enhanced */}
                    <Link href="/" className="group flex items-center gap-3 pl-2">
                        <motion.div
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            className="relative flex h-16 w-16 items-center justify-center overflow-hidden md:h-16 md:w-16"
                        >
                            <Image
                                src="/logo.png"
                                alt="Logo"
                                width={64}
                                height={64}
                                className="h-full w-full object-cover transition-transform group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/20 opacity-0 transition-opacity group-hover:opacity-100" />
                        </motion.div>
                        <div className="flex flex-col leading-none">
                            <span className="bg-gradient-to-r from-[#1A2F23] to-[#2d4a3a] bg-clip-text text-base font-black tracking-tighter text-transparent md:text-lg">
                                Donate
                            </span>
                            <span className="hidden text-[9px] font-bold tracking-[0.25em] text-[#1A2F23]/40 uppercase sm:block">
                                {t.navbar.subtitle}
                            </span>
                        </div>
                    </Link>

                    {/* DESKTOP NAV - Enhanced with active states */}
                    <nav className="hidden items-center rounded-full bg-gradient-to-r from-[#1A2F23]/[0.04] to-[#1A2F23]/[0.08] px-2 py-1.5 shadow-inner md:flex">
                        {navLinks.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onMouseEnter={() => setHoveredLink(link.name)}
                                    onMouseLeave={() => setHoveredLink(null)}
                                    className="relative px-5 py-2.5 text-sm font-semibold transition-colors"
                                >
                                    {(hoveredLink === link.name || isActive) && (
                                        <motion.span
                                            layoutId="nav-hover"
                                            className={`absolute inset-0 rounded-full shadow-sm ${isActive ? "bg-white shadow-md" : "bg-white/60"
                                                }`}
                                            transition={{
                                                type: "spring",
                                                bounce: 0.2,
                                                duration: 0.6,
                                            }}
                                        />
                                    )}
                                    <span
                                        className={`relative z-10 flex items-center gap-2 transition-colors ${isActive ? "text-[#1A2F23]" : "text-[#1A2F23]/70"
                                            }`}
                                    >
                                        <Icon
                                            className={`h-4 w-4 transition-transform ${hoveredLink === link.name ? "scale-110" : "scale-100"
                                                }`}
                                        />
                                        {link.name}
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* DESKTOP ACTIONS - Enhanced */}
                    <div className="hidden items-center gap-3 sm:flex">
                        {!loading &&
                            (user ? (
                                <>
                                    {/* Messages Icon with Unread Count */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => router.push("/messages")}
                                        className="relative rounded-full p-2.5 text-emerald-600 transition-colors hover:bg-emerald-50"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-2 right-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-red-500 px-1 text-[10px] font-black text-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </motion.button>

                                    {/* User Menu */}
                                    <DropdownMenu
                                        open={isMenuOpen}
                                        onOpenChange={setIsMenuOpen}
                                        modal={false}
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex cursor-pointer items-center gap-2.5 rounded-full px-3 py-2 transition-all outline-none hover:bg-[#1A2F23]/5"
                                            >
                                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#1A2F23] to-[#2d4a3a] text-sm font-bold text-white shadow-md ring-2 ring-white/50">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <motion.div
                                                    animate={{ rotate: isMenuOpen ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <ChevronDown className="h-4 w-4 text-[#1A2F23]/60" />
                                                </motion.div>
                                            </motion.button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="z-[110] w-64 rounded-2xl border-white/40 bg-white/95 p-2 shadow-2xl backdrop-blur-xl"
                                            onCloseAutoFocus={(e) => e.preventDefault()}
                                        >
                                            <div className="border-b border-black/5 px-3 py-3">
                                                <p className="text-sm font-bold text-[#1A2F23]">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-[#1A2F23]/50">
                                                    {user.email}
                                                </p>
                                            </div>

                                            {user.role === "admin" && (
                                                <DropdownMenuItem
                                                    asChild
                                                    className="my-1 rounded-xl bg-emerald-50 focus:bg-emerald-100"
                                                >
                                                    <Link
                                                        href="/admin"
                                                        className="flex cursor-pointer items-center gap-3 px-3 py-2.5 font-bold text-[#1A2F23]"
                                                    >
                                                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                                                        <span>Admin Hub</span>
                                                    </Link>
                                                </DropdownMenuItem>
                                            )}

                                            <DropdownMenuItem asChild className="my-1 rounded-xl">
                                                <Link
                                                    href="/profile"
                                                    className="flex cursor-pointer items-center gap-3 px-3 py-2.5"
                                                >
                                                    <User className="h-4 w-4" />
                                                    <span>{t.navbar.myProfile}</span>
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="my-1 rounded-xl">
                                                <Link
                                                    href="/messages"
                                                    className="flex cursor-pointer items-center gap-3 px-3 py-2.5"
                                                >
                                                    <MessageCircle className="h-4 w-4" />
                                                    <span>{t.chat.title}</span>
                                                </Link>
                                            </DropdownMenuItem>

                                            <DropdownMenuSeparator className="my-2" />
                                            <DropdownMenuItem
                                                onClick={handleLogout}
                                                className="my-1 flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-red-600"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>{t.navbar.logout}</span>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </>
                            ) : (
                                <Link href="/auth/login">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="cursor-pointer rounded-full px-5 py-2.5 text-sm font-bold text-[#1A2F23]/70 transition-colors hover:bg-[#1A2F23]/5 hover:text-[#1A2F23]"
                                    >
                                        {t.navbar.login}
                                    </motion.button>
                                </Link>
                            ))}
                    </div>
                </motion.div>
            </motion.header>

            {/* MOBILE BOTTOM TAB BAR - Enhanced */}
            <div className="fixed bottom-6 left-1/2 z-[100] w-[90%] max-w-[420px] -translate-x-1/2 md:hidden">
                <motion.nav
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        delay: 0.2,
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                    }}
                    className="relative flex items-center justify-between rounded-[32px] border border-white/10 bg-gradient-to-r from-[#1A2F23] to-[#2d4a3a] px-6 py-4 shadow-2xl backdrop-blur-2xl"
                >
                    {/* Glossy overlay effect */}
                    <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-gradient-to-b from-white/10 to-transparent" />

                    {/* Explorer */}
                    <Link href="/posts">
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className={`relative rounded-2xl p-3 transition-all ${pathname === "/posts"
                                    ? "bg-white/20 shadow-lg"
                                    : "hover:bg-white/10"
                                }`}
                        >
                            <Search
                                className={`h-6 w-6 transition-all ${pathname === "/posts"
                                        ? "scale-110 text-white"
                                        : "text-white/60"
                                    }`}
                            />
                            {pathname === "/posts" && (
                                <motion.div
                                    layoutId="mobile-indicator"
                                    className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white"
                                />
                            )}
                        </motion.div>
                    </Link>

                    {/* Messages */}
                    <Link href="/messages">
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className={`relative rounded-2xl p-3 transition-all ${pathname === "/messages"
                                    ? "bg-white/20 shadow-lg"
                                    : "hover:bg-white/10"
                                }`}
                        >
                            <div className="relative">
                                <MessageCircle
                                    className={`h-6 w-6 transition-all ${pathname === "/messages"
                                            ? "scale-110 text-white"
                                            : "text-white/60"
                                        }`}
                                />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-lg border-2 border-[#1A2F23] bg-red-500 px-1 text-[10px] font-black text-white">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            {pathname === "/messages" && (
                                <motion.div
                                    layoutId="mobile-indicator"
                                    className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white"
                                />
                            )}
                        </motion.div>
                    </Link>

                    {/* Center Create Button - Instagram Style Enhanced */}
                    <Link href="/posts/create">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.9 }}
                            className="relative"
                        >
                            <motion.div className="-translate-y-1 rounded-[12px] bg-white p-2">
                                <Plus className="h-7 w-7 text-[#1A2F23]" strokeWidth={3} />
                            </motion.div>
                        </motion.div>
                    </Link>

                    {/* Profile */}
                    <Link href={user ? "/profile" : "/auth/login"}>
                        <motion.div
                            whileTap={{ scale: 0.9 }}
                            className={`relative rounded-2xl p-3 transition-all ${pathname === "/profile"
                                    ? "bg-white/20 shadow-lg"
                                    : "hover:bg-white/10"
                                }`}
                        >
                            {user ? (
                                <div
                                    className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold transition-all ${pathname === "/profile"
                                            ? "scale-110 bg-white text-[#1A2F23] ring-2 ring-white/50"
                                            : "bg-white/20 text-white/80"
                                        }`}
                                >
                                    {user.name?.charAt(0).toUpperCase()}
                                </div>
                            ) : (
                                <User
                                    className={`h-6 w-6 transition-all ${pathname === "/profile"
                                            ? "scale-110 text-white"
                                            : "text-white/60"
                                        }`}
                                />
                            )}
                            {pathname === "/profile" && (
                                <motion.div
                                    layoutId="mobile-indicator"
                                    className="absolute -bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-white"
                                />
                            )}
                        </motion.div>
                    </Link>
                </motion.nav>
            </div>
        </>
    );
}
