import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

export function formatRelativeDate(
  dateString: string,
  locale: string = "fr"
): string {
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return locale === "ar"
      ? "تاريخ غير معروف"
      : locale === "en"
        ? "Unknown date"
        : "Date inconnue";
  }

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  // Fallback for older browsers or simple implementation
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffSeconds < 60) {
    return locale === "ar"
      ? "الآن"
      : locale === "en"
        ? "Just now"
        : "À l'instant";
  } else if (diffMinutes < 60) {
    return rtf.format(-diffMinutes, "minute");
  } else if (diffHours < 24) {
    return rtf.format(-diffHours, "hour");
  } else if (diffDays < 7) {
    return rtf.format(-diffDays, "day");
  } else if (diffWeeks < 4) {
    return rtf.format(-diffWeeks, "week");
  } else if (diffMonths < 12) {
    return rtf.format(-diffMonths, "month");
  } else {
    return date.toLocaleDateString(
      locale === "ar" ? "ar-DZ" : locale === "en" ? "en-US" : "fr-FR"
    );
  }
}
