"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();

  return (
    <div className="min-vh-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 rounded-full bg-slate-50 p-6">
        <FileQuestion size={48} className="text-slate-400" />
      </div>
      <h2 className="mb-2 text-3xl font-bold text-slate-900">
        {t.errors.notFoundTitle}
      </h2>
      <p className="mb-8 max-w-md text-slate-500">{t.errors.notFoundDesc}</p>
      <Link href="/">
        <Button size="lg" className="rounded-xl px-8">
          {t.errors.backHome}
        </Button>
      </Link>
    </div>
  );
}
