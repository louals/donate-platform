"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useLanguage();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-vh-[70vh] flex flex-col items-center justify-center px-4 py-20 text-center">
      <div className="mb-6 rounded-full bg-red-50 p-6">
        <AlertTriangle size={48} className="text-red-500" />
      </div>
      <h2 className="mb-2 text-3xl font-bold text-slate-900">
        {t.errors.pageTitle}
      </h2>
      <p className="mb-8 max-w-md text-slate-500">{t.errors.pageDesc}</p>
      <Button onClick={() => reset()} size="lg" className="rounded-xl px-8">
        {t.errors.retry}
      </Button>
    </div>
  );
}
